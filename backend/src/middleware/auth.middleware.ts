import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service';
import { UserService } from '../services/user.service';
import { JwtUtil } from '../utils/jwt.util';
import { logger } from '../config/logger.config';
import { ERROR_CODES } from '../utils/constants';
import { RequestWithUser } from '../types/api.types';

export class AuthMiddleware {
  /**
   * Authenticate access token
   */
  public static async authenticateToken(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.get('Authorization');
      const token = JwtUtil.extractTokenFromHeader(authHeader);

      if (!token) {
        const error = new Error(ERROR_CODES.UNAUTHORIZED);
        return next(error);
      }

      // Verify token
      const payload = TokenService.verifyAccessToken(token);

      // Check if user exists
      const userExists = await UserService.userExists(payload.userId);
      if (!userExists) {
        const error = new Error(ERROR_CODES.USER_NOT_FOUND);
        return next(error);
      }

      // Attach user info to request
      req.user = {
        userId: payload.userId,
        email: payload.email,
        isTemp: payload.tokenType === 'temp',
      };

      // Update last active (non-blocking)
      UserService.updateLastActive(payload.userId).catch(error => {
        logger.warn('Failed to update last active', { error, userId: payload.userId });
      });

      next();
    } catch (error) {
      logger.warn('Token authentication failed', { 
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      next(error);
    }
  }

  /**
   * Authenticate temporary token (for signup process)
   */
  public static async authenticateTempToken(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.get('Authorization');
      const token = JwtUtil.extractTokenFromHeader(authHeader);

      if (!token) {
        const error = new Error(ERROR_CODES.UNAUTHORIZED);
        return next(error);
      }

      // Verify token
      const payload = TokenService.verifyAccessToken(token);

      // Check if it's a temp token
      if (payload.tokenType !== 'temp') {
        const error = new Error(ERROR_CODES.INVALID_TOKEN);
        return next(error);
      }

      // Check if user exists
      const userExists = await UserService.userExists(payload.userId);
      if (!userExists) {
        const error = new Error(ERROR_CODES.USER_NOT_FOUND);
        return next(error);
      }

      // Attach user info to request
      req.user = {
        userId: payload.userId,
        email: payload.email,
        isTemp: true,
      };

      next();
    } catch (error) {
      logger.warn('Temp token authentication failed', { 
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      next(error);
    }
  }

  /**
   * Optional authentication (doesn't fail if no token)
   */
  public static async optionalAuth(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.get('Authorization');
      const token = JwtUtil.extractTokenFromHeader(authHeader);

      if (!token) {
        return next();
      }

      // Try to verify token
      const payload = TokenService.verifyAccessToken(token);

      // Check if user exists
      const userExists = await UserService.userExists(payload.userId);
      if (userExists) {
        req.user = {
          userId: payload.userId,
          email: payload.email,
          isTemp: payload.tokenType === 'temp',
        };
      }

      next();
    } catch (error) {
      // For optional auth, we don't fail on token errors
      logger.debug('Optional auth failed', { error: error.message });
      next();
    }
  }

  /**
   * Require completed onboarding
   */
  public static async requireOnboarding(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        const error = new Error(ERROR_CODES.UNAUTHORIZED);
        return next(error);
      }

      // Check if onboarding is completed
      const isCompleted = await UserService.getOnboardingStatus(req.user.userId);
      
      if (!isCompleted) {
        const error = new Error(ERROR_CODES.ONBOARDING_INCOMPLETE);
        return next(error);
      }

      next();
    } catch (error) {
      logger.error('Onboarding check failed', { 
        error: error.message,
        userId: req.user?.userId,
      });
      next(error);
    }
  }

  /**
   * Require premium subscription
   */
  public static async requirePremium(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        const error = new Error(ERROR_CODES.UNAUTHORIZED);
        return next(error);
      }

      // Get user profile to check premium status
      const userProfile = await UserService.getUserProfile(req.user.userId);
      
      if (!userProfile.isPremium) {
        const error = new Error(ERROR_CODES.FORBIDDEN);
        (error as any).details = ['Premium subscription required'];
        return next(error);
      }

      // Check if premium is expired
      if (userProfile.premiumExpiresAt && new Date(userProfile.premiumExpiresAt) < new Date()) {
        const error = new Error(ERROR_CODES.FORBIDDEN);
        (error as any).details = ['Premium subscription has expired'];
        return next(error);
      }

      next();
    } catch (error) {
      logger.error('Premium check failed', { 
        error: error.message,
        userId: req.user?.userId,
      });
      next(error);
    }
  }

  /**
   * Check user ownership of resource
   */
  public static checkOwnership(resourceUserIdField: string = 'userId') {
    return (req: RequestWithUser, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          const error = new Error(ERROR_CODES.UNAUTHORIZED);
          return next(error);
        }

        const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
        
        if (resourceUserId && resourceUserId !== req.user.userId) {
          const error = new Error(ERROR_CODES.FORBIDDEN);
          return next(error);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Extract user info from token without verification (for logging)
   */
  public static extractUserInfo(req: Request): { userId?: string; email?: string } {
    try {
      const authHeader = req.get('Authorization');
      const token = JwtUtil.extractTokenFromHeader(authHeader);

      if (!token) {
        return {};
      }

      const decoded = JwtUtil.decodeToken(token);
      return {
        userId: decoded?.userId,
        email: decoded?.email,
      };
    } catch (error) {
      return {};
    }
  }

  /**
   * Validate token format
   */
  public static validateTokenFormat(req: Request, res: Response, next: NextFunction): void {
    try {
      const authHeader = req.get('Authorization');
      const token = JwtUtil.extractTokenFromHeader(authHeader);

      if (token && !TokenService.isValidTokenFormat(token)) {
        const error = new Error(ERROR_CODES.INVALID_TOKEN);
        return next(error);
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Log authentication attempts
   */
  public static logAuthAttempt(req: Request, res: Response, next: NextFunction): void {
    const userInfo = AuthMiddleware.extractUserInfo(req);
    
    logger.info('Authentication attempt', {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: userInfo.userId,
      email: userInfo.email,
    });

    next();
  }
}

export default AuthMiddleware;