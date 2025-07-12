import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { logger } from '../config/logger.config';
import { ApiResponse } from '../types/api.types';
import { 
  OtpRequest, 
  OtpVerification, 
  GoogleSignInRequest, 
  TokenRefreshRequest 
} from '../types/auth.types';
import { RequestWithUser } from '../types/api.types';

export class AuthController {
  /**
   * Send OTP to user's email
   */
  public static async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: OtpRequest = req.body;
      const result = await AuthService.sendOtp(data);

      logger.info('OTP sent successfully', { email: data.email, ip: req.ip });

      res.status(200).json({
        success: true,
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify OTP and authenticate user
   */
  public static async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: OtpVerification = req.body;
      const result = await AuthService.verifyOtp(data);

      logger.info('OTP verified successfully', { 
        email: data.email, 
        userExists: 'userExists' in result ? result.userExists : false,
        ip: req.ip,
      });

      res.status(200).json({
        success: true,
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Google Sign-In
   */
  public static async googleSignIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: GoogleSignInRequest = req.body;
      const result = await AuthService.googleSignIn(data);

      logger.info('Google sign-in successful', { 
        userExists: 'userExists' in result ? result.userExists : false,
        ip: req.ip,
      });

      res.status(200).json({
        success: true,
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  public static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: TokenRefreshRequest = req.body;
      const tokens = await TokenService.refreshTokens(data.refreshToken);

      logger.info('Tokens refreshed successfully', { ip: req.ip });

      res.status(200).json({
        success: true,
        data: tokens,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  public static async logout(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.body.refreshToken;
      const userId = req.user!.userId;

      await AuthService.logout(userId, refreshToken);

      logger.info('User logged out successfully', { userId, ip: req.ip });

      res.status(200).json({
        success: true,
        data: {
          message: 'Logged out successfully',
        },
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get authentication status
   */
  public static async getAuthStatus(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const activeTokensCount = await TokenService.getUserActiveTokensCount(userId);

      res.status(200).json({
        success: true,
        data: {
          authenticated: true,
          userId,
          activeTokens: activeTokensCount,
        },
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Revoke all user tokens (logout from all devices)
   */
  public static async revokeAllTokens(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await TokenService.revokeAllUserTokens(userId);

      logger.info('All user tokens revoked', { userId, ip: req.ip });

      res.status(200).json({
        success: true,
        data: {
          message: 'Logged out from all devices successfully',
        },
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate token endpoint (for debugging)
   */
  public static async validateToken(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.get('Authorization');
      const token = authHeader?.split(' ')[1];

      if (!token) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_TOKEN',
            message: 'No token provided',
          },
        });
      }

      const payload = TokenService.verifyAccessToken(token);
      const expiration = new Date(payload.exp! * 1000);

      res.status(200).json({
        success: true,
        data: {
          valid: true,
          payload: {
            userId: payload.userId,
            email: payload.email,
            tokenType: payload.tokenType,
            issuedAt: new Date(payload.iat! * 1000),
            expiresAt: expiration,
            timeUntilExpiry: expiration.getTime() - Date.now(),
          },
        },
      } as ApiResponse);
    } catch (error) {
      res.status(200).json({
        success: true,
        data: {
          valid: false,
          error: error.message,
        },
      } as ApiResponse);
    }
  }
}

export default AuthController;