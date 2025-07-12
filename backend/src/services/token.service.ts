import { prisma } from '../config/database.config';
import { logger } from '../config/logger.config';
import { JwtUtil } from '../utils/jwt.util';
import { HashUtil } from '../utils/hash.util';
import { AuthTokenPayload, TokenPair } from '../types/auth.types';
import { ERROR_CODES, TOKEN_TYPES } from '../utils/constants';

export class TokenService {
  /**
   * Generate access and refresh tokens for a user
   */
  public static async generateAuthTokens(userId: string, email: string): Promise<TokenPair> {
    try {
      const payload = { userId, email };
      
      // Generate tokens
      const accessToken = JwtUtil.generateAccessToken(payload);
      const refreshToken = JwtUtil.generateRefreshToken(payload);
      
      // Hash refresh token for storage
      const tokenHash = HashUtil.hashToken(refreshToken);
      
      // Calculate expiration date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      // Store refresh token in database
      await prisma.authToken.create({
        data: {
          userId,
          tokenHash,
          tokenType: TOKEN_TYPES.REFRESH,
          expiresAt,
        },
      });
      
      logger.info('Auth tokens generated successfully', { userId });
      
      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Failed to generate auth tokens', { error, userId });
      throw new Error('Token generation failed');
    }
  }

  /**
   * Generate temporary token for signup process
   */
  public static generateTempToken(userId: string, email: string): string {
    try {
      const payload = { userId, email };
      return JwtUtil.generateTempToken(payload);
    } catch (error) {
      logger.error('Failed to generate temp token', { error, userId });
      throw new Error('Temporary token generation failed');
    }
  }

  /**
   * Verify access token
   */
  public static verifyAccessToken(token: string): AuthTokenPayload {
    try {
      return JwtUtil.verifyAccessToken(token);
    } catch (error) {
      logger.warn('Access token verification failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Verify refresh token and check if it's revoked
   */
  public static async verifyRefreshToken(token: string): Promise<AuthTokenPayload> {
    try {
      // First verify the JWT
      const payload = JwtUtil.verifyRefreshToken(token);
      
      // Hash the token to check against database
      const tokenHash = HashUtil.hashToken(token);
      
      // Check if token exists and is not revoked
      const storedToken = await prisma.authToken.findFirst({
        where: {
          tokenHash,
          tokenType: TOKEN_TYPES.REFRESH,
          isRevoked: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      });
      
      if (!storedToken) {
        throw new Error(ERROR_CODES.TOKEN_REVOKED);
      }
      
      return payload;
    } catch (error) {
      logger.warn('Refresh token verification failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Revoke a refresh token
   */
  public static async revokeRefreshToken(token: string): Promise<void> {
    try {
      const tokenHash = HashUtil.hashToken(token);
      
      await prisma.authToken.updateMany({
        where: {
          tokenHash,
          tokenType: TOKEN_TYPES.REFRESH,
        },
        data: {
          isRevoked: true,
        },
      });
      
      logger.info('Refresh token revoked successfully');
    } catch (error) {
      logger.error('Failed to revoke refresh token', { error });
      throw new Error('Token revocation failed');
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  public static async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      await prisma.authToken.updateMany({
        where: {
          userId,
          tokenType: TOKEN_TYPES.REFRESH,
          isRevoked: false,
        },
        data: {
          isRevoked: true,
        },
      });
      
      logger.info('All user tokens revoked successfully', { userId });
    } catch (error) {
      logger.error('Failed to revoke all user tokens', { error, userId });
      throw new Error('Token revocation failed');
    }
  }

  /**
   * Refresh tokens - revoke old and generate new
   */
  public static async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify the refresh token
      const payload = await this.verifyRefreshToken(refreshToken);
      
      // Revoke the old refresh token
      await this.revokeRefreshToken(refreshToken);
      
      // Generate new token pair
      const newTokens = await this.generateAuthTokens(payload.userId, payload.email);
      
      logger.info('Tokens refreshed successfully', { userId: payload.userId });
      
      return newTokens;
    } catch (error) {
      logger.error('Failed to refresh tokens', { error });
      throw error;
    }
  }

  /**
   * Clean up expired tokens
   */
  public static async cleanupExpiredTokens(): Promise<void> {
    try {
      const result = await prisma.authToken.deleteMany({
        where: {
          OR: [
            {
              expiresAt: {
                lt: new Date(),
              },
            },
            {
              isRevoked: true,
              createdAt: {
                lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
              },
            },
          ],
        },
      });
      
      logger.info('Expired tokens cleaned up', { deletedCount: result.count });
    } catch (error) {
      logger.error('Failed to cleanup expired tokens', { error });
    }
  }

  /**
   * Get user's active tokens count
   */
  public static async getUserActiveTokensCount(userId: string): Promise<number> {
    try {
      return await prisma.authToken.count({
        where: {
          userId,
          tokenType: TOKEN_TYPES.REFRESH,
          isRevoked: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      });
    } catch (error) {
      logger.error('Failed to get user active tokens count', { error, userId });
      return 0;
    }
  }

  /**
   * Validate token format
   */
  public static isValidTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    return parts.length === 3;
  }

  /**
   * Extract user ID from token without verification
   */
  public static extractUserIdFromToken(token: string): string | null {
    try {
      const decoded = JwtUtil.decodeToken(token);
      return decoded?.userId || null;
    } catch (error) {
      return null;
    }
  }
}

export default TokenService;