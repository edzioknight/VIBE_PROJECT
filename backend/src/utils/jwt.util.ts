import jwt from 'jsonwebtoken';
import { appConfig } from '../config/app.config';
import { AuthTokenPayload } from '../types/auth.types';
import { ERROR_CODES } from './constants';
import { logger } from '../config/logger.config';

export class JwtUtil {
  /**
   * Generate an access token
   */
  public static generateAccessToken(payload: Omit<AuthTokenPayload, 'tokenType'>): string {
    try {
      const tokenPayload: AuthTokenPayload = {
        ...payload,
        tokenType: 'access',
      };

      return jwt.sign(tokenPayload, appConfig.jwt.secret, {
        expiresIn: appConfig.jwt.accessTokenExpiration,
        issuer: 'vibesmatch',
        audience: 'vibesmatch-app',
      });
    } catch (error) {
      logger.error('Failed to generate access token', { error, userId: payload.userId });
      throw new Error('Token generation failed');
    }
  }

  /**
   * Generate a refresh token
   */
  public static generateRefreshToken(payload: Omit<AuthTokenPayload, 'tokenType'>): string {
    try {
      const tokenPayload: AuthTokenPayload = {
        ...payload,
        tokenType: 'refresh',
      };

      return jwt.sign(tokenPayload, appConfig.jwt.refreshSecret, {
        expiresIn: appConfig.jwt.refreshTokenExpiration,
        issuer: 'vibesmatch',
        audience: 'vibesmatch-app',
      });
    } catch (error) {
      logger.error('Failed to generate refresh token', { error, userId: payload.userId });
      throw new Error('Token generation failed');
    }
  }

  /**
   * Generate a temporary token for signup process
   */
  public static generateTempToken(payload: Omit<AuthTokenPayload, 'tokenType'>): string {
    try {
      const tokenPayload: AuthTokenPayload = {
        ...payload,
        tokenType: 'temp',
      };

      return jwt.sign(tokenPayload, appConfig.jwt.secret, {
        expiresIn: appConfig.jwt.tempTokenExpiration,
        issuer: 'vibesmatch',
        audience: 'vibesmatch-app',
      });
    } catch (error) {
      logger.error('Failed to generate temp token', { error, userId: payload.userId });
      throw new Error('Token generation failed');
    }
  }

  /**
   * Verify an access token
   */
  public static verifyAccessToken(token: string): AuthTokenPayload {
    try {
      const decoded = jwt.verify(token, appConfig.jwt.secret, {
        issuer: 'vibesmatch',
        audience: 'vibesmatch-app',
      }) as AuthTokenPayload;

      if (decoded.tokenType !== 'access' && decoded.tokenType !== 'temp') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      logger.warn('Access token verification failed', { error: error.message });
      
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error(ERROR_CODES.TOKEN_EXPIRED);
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error(ERROR_CODES.INVALID_TOKEN);
      } else {
        throw new Error(ERROR_CODES.INVALID_TOKEN);
      }
    }
  }

  /**
   * Verify a refresh token
   */
  public static verifyRefreshToken(token: string): AuthTokenPayload {
    try {
      const decoded = jwt.verify(token, appConfig.jwt.refreshSecret, {
        issuer: 'vibesmatch',
        audience: 'vibesmatch-app',
      }) as AuthTokenPayload;

      if (decoded.tokenType !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      logger.warn('Refresh token verification failed', { error: error.message });
      
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error(ERROR_CODES.TOKEN_EXPIRED);
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error(ERROR_CODES.INVALID_TOKEN);
      } else {
        throw new Error(ERROR_CODES.INVALID_TOKEN);
      }
    }
  }

  /**
   * Decode a token without verification (for debugging)
   */
  public static decodeToken(token: string): AuthTokenPayload | null {
    try {
      return jwt.decode(token) as AuthTokenPayload;
    } catch (error) {
      logger.error('Failed to decode token', { error });
      return null;
    }
  }

  /**
   * Get token expiration time
   */
  public static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      logger.error('Failed to get token expiration', { error });
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  public static isTokenExpired(token: string): boolean {
    try {
      const expiration = this.getTokenExpiration(token);
      if (!expiration) return true;
      return expiration.getTime() < Date.now();
    } catch (error) {
      return true;
    }
  }

  /**
   * Extract token from Authorization header
   */
  public static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }

  /**
   * Generate token pair (access + refresh)
   */
  public static generateTokenPair(payload: Omit<AuthTokenPayload, 'tokenType'>): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }
}

export default JwtUtil;