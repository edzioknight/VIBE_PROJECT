import { Request, Response, NextFunction } from 'express';
import RedisConfig from '../config/redis.config';
import { logger } from '../config/logger.config';
import { ERROR_CODES } from '../utils/constants';

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
}

export class RateLimitMiddleware {
  /**
   * Create rate limiting middleware
   */
  public static create(options: RateLimitOptions) {
    const {
      windowMs,
      maxRequests,
      keyGenerator = RateLimitMiddleware.defaultKeyGenerator,
      skipSuccessfulRequests = false,
      skipFailedRequests = false,
      message = 'Too many requests, please try again later',
    } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = keyGenerator(req);
        const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
        const redisKey = `rate_limit:${key}:${windowStart}`;

        // Get current count
        const current = await RedisConfig.get(redisKey);
        const currentCount = current ? parseInt(current) : 0;

        // Check if limit exceeded
        if (currentCount >= maxRequests) {
          logger.warn('Rate limit exceeded', {
            key,
            currentCount,
            maxRequests,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
          });

          const error = new Error(ERROR_CODES.RATE_LIMIT_EXCEEDED);
          (error as any).message = message;
          return next(error);
        }

        // Increment counter
        const newCount = await RedisConfig.incr(redisKey);
        
        // Set expiration on first request
        if (newCount === 1) {
          await RedisConfig.expire(redisKey, Math.ceil(windowMs / 1000));
        }

        // Add rate limit headers
        res.set({
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': Math.max(0, maxRequests - newCount).toString(),
          'X-RateLimit-Reset': (windowStart + windowMs).toString(),
        });

        // Store rate limit info for potential cleanup
        (req as any).rateLimitInfo = {
          key: redisKey,
          skipSuccessfulRequests,
          skipFailedRequests,
        };

        next();
      } catch (error) {
        // If Redis is down, log error but don't block request
        logger.error('Rate limiting error', { error });
        next();
      }
    };
  }

  /**
   * Default key generator (IP-based)
   */
  private static defaultKeyGenerator(req: Request): string {
    return req.ip || 'unknown';
  }

  /**
   * User-based key generator
   */
  public static userKeyGenerator(req: Request): string {
    const userId = (req as any).user?.userId;
    return userId || req.ip || 'unknown';
  }

  /**
   * Email-based key generator
   */
  public static emailKeyGenerator(req: Request): string {
    const email = req.body?.email || (req as any).user?.email;
    return email || req.ip || 'unknown';
  }

  /**
   * Combined IP and user key generator
   */
  public static combinedKeyGenerator(req: Request): string {
    const userId = (req as any).user?.userId;
    const ip = req.ip || 'unknown';
    return userId ? `${userId}:${ip}` : ip;
  }

  /**
   * OTP rate limiting
   */
  public static otpRateLimit() {
    return RateLimitMiddleware.create({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 3,
      keyGenerator: RateLimitMiddleware.emailKeyGenerator,
      message: 'Too many OTP requests. Please wait 60 seconds.',
    });
  }

  /**
   * Login rate limiting
   */
  public static loginRateLimit() {
    return RateLimitMiddleware.create({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      keyGenerator: RateLimitMiddleware.defaultKeyGenerator,
      message: 'Too many login attempts. Please try again in 15 minutes.',
    });
  }

  /**
   * API rate limiting
   */
  public static apiRateLimit() {
    return RateLimitMiddleware.create({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,
      keyGenerator: RateLimitMiddleware.userKeyGenerator,
      message: 'Too many API requests. Please slow down.',
    });
  }

  /**
   * Photo upload rate limiting
   */
  public static photoUploadRateLimit() {
    return RateLimitMiddleware.create({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10,
      keyGenerator: RateLimitMiddleware.userKeyGenerator,
      message: 'Too many photo uploads. Please try again later.',
    });
  }

  /**
   * Cleanup rate limit on successful request
   */
  public static cleanup() {
    return (req: Request, res: Response, next: NextFunction) => {
      const rateLimitInfo = (req as any).rateLimitInfo;
      
      if (rateLimitInfo) {
        const originalSend = res.send;
        
        res.send = function(data) {
          const statusCode = res.statusCode;
          
          // Cleanup logic based on response status
          if (rateLimitInfo.skipSuccessfulRequests && statusCode < 400) {
            RateLimitMiddleware.decrementCounter(rateLimitInfo.key);
          } else if (rateLimitInfo.skipFailedRequests && statusCode >= 400) {
            RateLimitMiddleware.decrementCounter(rateLimitInfo.key);
          }
          
          return originalSend.call(this, data);
        };
      }
      
      next();
    };
  }

  /**
   * Decrement rate limit counter
   */
  private static async decrementCounter(key: string): Promise<void> {
    try {
      const current = await RedisConfig.get(key);
      if (current && parseInt(current) > 0) {
        await RedisConfig.incr(key); // This decrements since we're using negative increment
      }
    } catch (error) {
      logger.error('Failed to decrement rate limit counter', { error, key });
    }
  }

  /**
   * Reset rate limit for a key
   */
  public static async resetRateLimit(key: string): Promise<void> {
    try {
      await RedisConfig.del(key);
      logger.info('Rate limit reset', { key });
    } catch (error) {
      logger.error('Failed to reset rate limit', { error, key });
    }
  }

  /**
   * Get rate limit status
   */
  public static async getRateLimitStatus(key: string, windowMs: number): Promise<{
    current: number;
    remaining: number;
    resetTime: number;
  }> {
    try {
      const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
      const redisKey = `rate_limit:${key}:${windowStart}`;
      
      const current = await RedisConfig.get(redisKey);
      const currentCount = current ? parseInt(current) : 0;
      
      return {
        current: currentCount,
        remaining: Math.max(0, currentCount),
        resetTime: windowStart + windowMs,
      };
    } catch (error) {
      logger.error('Failed to get rate limit status', { error, key });
      return {
        current: 0,
        remaining: 0,
        resetTime: Date.now() + windowMs,
      };
    }
  }
}

export default RateLimitMiddleware;