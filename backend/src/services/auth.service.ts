import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../config/database.config';
import RedisConfig from '../config/redis.config';
import { logger } from '../config/logger.config';
import { EmailService } from './email.service';
import { TokenService } from './token.service';
import { UserService } from './user.service';
import { HashUtil } from '../utils/hash.util';
import { 
  OtpRequest, 
  OtpVerification, 
  GoogleSignInRequest, 
  LoginResponse, 
  SignupResponse,
  GoogleUserInfo 
} from '../types/auth.types';
import { 
  ERROR_CODES, 
  OTP_CONFIG, 
  RATE_LIMITS, 
  REDIS_KEYS 
} from '../utils/constants';
import { appConfig } from '../config/app.config';

export class AuthService {
  private static googleClient: OAuth2Client;

  /**
   * Initialize Google OAuth client
   */
  private static getGoogleClient(): OAuth2Client {
    if (!this.googleClient) {
      this.googleClient = new OAuth2Client(appConfig.google.clientId);
    }
    return this.googleClient;
  }

  /**
   * Send OTP to user's email
   */
  public static async sendOtp(data: OtpRequest): Promise<{ message: string; expiresIn: number }> {
    try {
      const { email } = data;

      // Check rate limiting
      await this.checkOtpRateLimit(email);

      // Generate OTP
      const otpCode = HashUtil.generateOtpCode(OTP_CONFIG.LENGTH);
      const hashedOtp = await HashUtil.hashString(otpCode);

      // Calculate expiration
      const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRATION_MS);

      // Store OTP in database
      await prisma.otpCode.create({
        data: {
          email,
          code: hashedOtp,
          expiresAt,
        },
      });

      // Send email
      await EmailService.sendOtpEmail(email, otpCode);

      // Update rate limiting
      await this.updateOtpRateLimit(email);

      logger.info('OTP sent successfully', { email });

      return {
        message: 'OTP sent successfully',
        expiresIn: OTP_CONFIG.EXPIRATION_MS / 1000, // Convert to seconds
      };
    } catch (error) {
      logger.error('Failed to send OTP', { error, email: data.email });
      throw error;
    }
  }

  /**
   * Verify OTP and return user status
   */
  public static async verifyOtp(data: OtpVerification): Promise<LoginResponse | SignupResponse> {
    try {
      const { email, code } = data;

      // Find the latest OTP for this email
      const otpRecord = await prisma.otpCode.findFirst({
        where: {
          email,
          isUsed: false,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!otpRecord) {
        throw new Error(ERROR_CODES.INVALID_OTP);
      }

      // Check attempts
      if (otpRecord.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
        throw new Error(ERROR_CODES.OTP_MAX_ATTEMPTS);
      }

      // Verify OTP
      const isValidOtp = await HashUtil.compareHash(code, otpRecord.code);

      if (!isValidOtp) {
        // Increment attempts
        await prisma.otpCode.update({
          where: { id: otpRecord.id },
          data: { attempts: otpRecord.attempts + 1 },
        });
        throw new Error(ERROR_CODES.INVALID_OTP);
      }

      // Mark OTP as used
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });

      // Check if user exists
      const existingUser = await UserService.findUserByEmail(email);

      if (existingUser) {
        // Existing user - generate tokens and return user data
        const tokens = await TokenService.generateAuthTokens(existingUser.id, existingUser.email);
        const userProfile = await UserService.getUserProfile(existingUser.id);

        // Update last active
        await UserService.updateLastActive(existingUser.id);

        logger.info('User logged in successfully', { userId: existingUser.id, email });

        return {
          userExists: true,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: userProfile,
        };
      } else {
        // New user - create user and return temp token
        const newUser = await UserService.createUser({ email });
        const tempToken = TokenService.generateTempToken(newUser.id, newUser.email);

        logger.info('New user created, temp token generated', { userId: newUser.id, email });

        return {
          userExists: false,
          tempToken,
          message: 'Please complete signup process',
        };
      }
    } catch (error) {
      logger.error('Failed to verify OTP', { error, email: data.email });
      throw error;
    }
  }

  /**
   * Google Sign-In
   */
  public static async googleSignIn(data: GoogleSignInRequest): Promise<LoginResponse | SignupResponse> {
    try {
      const { idToken } = data;

      // Verify Google ID token
      const googleUserInfo = await this.verifyGoogleToken(idToken);

      // Check if user exists
      const existingUser = await UserService.findUserByEmail(googleUserInfo.email);

      if (existingUser) {
        // Update Google ID if not set
        if (!existingUser.googleId && googleUserInfo.googleId) {
          await UserService.updateUser(existingUser.id, {
            googleId: googleUserInfo.googleId,
          });
        }

        // Generate tokens and return user data
        const tokens = await TokenService.generateAuthTokens(existingUser.id, existingUser.email);
        const userProfile = await UserService.getUserProfile(existingUser.id);

        // Update last active
        await UserService.updateLastActive(existingUser.id);

        logger.info('User logged in via Google successfully', { userId: existingUser.id, email: existingUser.email });

        return {
          userExists: true,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: userProfile,
        };
      } else {
        // New user - create user and return temp token
        const newUser = await UserService.createUser({
          email: googleUserInfo.email,
          googleId: googleUserInfo.googleId,
          name: googleUserInfo.name,
        });
        const tempToken = TokenService.generateTempToken(newUser.id, newUser.email);

        logger.info('New user created via Google, temp token generated', { userId: newUser.id, email: googleUserInfo.email });

        return {
          userExists: false,
          tempToken,
          message: 'Please complete signup process',
        };
      }
    } catch (error) {
      logger.error('Failed to sign in with Google', { error });
      throw new Error(ERROR_CODES.GOOGLE_AUTH_FAILED);
    }
  }

  /**
   * Logout user
   */
  public static async logout(userId: string, refreshToken?: string): Promise<void> {
    try {
      if (refreshToken) {
        // Revoke the specific refresh token
        await TokenService.revokeRefreshToken(refreshToken);
      } else {
        // Revoke all user tokens
        await TokenService.revokeAllUserTokens(userId);
      }

      // Deactivate user sessions
      await prisma.userSession.updateMany({
        where: { userId },
        data: { isActive: false },
      });

      logger.info('User logged out successfully', { userId });
    } catch (error) {
      logger.error('Failed to logout user', { error, userId });
      throw error;
    }
  }

  /**
   * Check OTP rate limiting
   */
  private static async checkOtpRateLimit(email: string): Promise<void> {
    try {
      const key = `${REDIS_KEYS.OTP_RATE_LIMIT}${email}`;
      const current = await RedisConfig.get(key);
      
      if (current && parseInt(current) >= RATE_LIMITS.OTP_MAX_REQUESTS) {
        throw new Error(ERROR_CODES.RATE_LIMIT_EXCEEDED);
      }
    } catch (error) {
      if (error.message === ERROR_CODES.RATE_LIMIT_EXCEEDED) {
        throw error;
      }
      // If Redis is down, allow the request but log the error
      logger.warn('Redis rate limit check failed, allowing request', { error, email });
    }
  }

  /**
   * Update OTP rate limiting
   */
  private static async updateOtpRateLimit(email: string): Promise<void> {
    try {
      const key = `${REDIS_KEYS.OTP_RATE_LIMIT}${email}`;
      const current = await RedisConfig.get(key);
      
      if (current) {
        await RedisConfig.incr(key);
      } else {
        await RedisConfig.set(key, '1', RATE_LIMITS.OTP_WINDOW / 1000);
      }
    } catch (error) {
      // If Redis is down, log the error but don't fail the request
      logger.warn('Failed to update OTP rate limit', { error, email });
    }
  }

  /**
   * Verify Google ID token
   */
  private static async verifyGoogleToken(idToken: string): Promise<GoogleUserInfo> {
    try {
      const client = this.getGoogleClient();
      const ticket = await client.verifyIdToken({
        idToken,
        audience: appConfig.google.clientId,
      });

      const payload = ticket.getPayload();
      
      if (!payload || !payload.email || !payload.sub) {
        throw new Error('Invalid Google token payload');
      }

      return {
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        googleId: payload.sub,
        picture: payload.picture,
      };
    } catch (error) {
      logger.error('Failed to verify Google token', { error });
      throw new Error(ERROR_CODES.GOOGLE_AUTH_FAILED);
    }
  }

  /**
   * Clean up expired OTP codes
   */
  public static async cleanupExpiredOtps(): Promise<void> {
    try {
      const result = await prisma.otpCode.deleteMany({
        where: {
          OR: [
            {
              expiresAt: {
                lt: new Date(),
              },
            },
            {
              isUsed: true,
              createdAt: {
                lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
              },
            },
          ],
        },
      });

      logger.info('Expired OTP codes cleaned up', { deletedCount: result.count });
    } catch (error) {
      logger.error('Failed to cleanup expired OTP codes', { error });
    }
  }
}

export default AuthService;