import { createClient, RedisClientType } from 'redis';
import { logger } from './logger.config';

class RedisConfig {
  private static instance: RedisClientType;
  private static isConnected: boolean = false;

  public static getInstance(): RedisClientType {
    if (!RedisConfig.instance) {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      RedisConfig.instance = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis reconnection failed after 10 attempts');
              return new Error('Redis reconnection failed');
            }
            return Math.min(retries * 50, 1000);
          },
        },
      });

      // Event listeners
      RedisConfig.instance.on('connect', () => {
        logger.info('Redis client connected');
      });

      RedisConfig.instance.on('ready', () => {
        logger.info('Redis client ready');
        RedisConfig.isConnected = true;
      });

      RedisConfig.instance.on('error', (error) => {
        logger.error('Redis client error', { error });
        RedisConfig.isConnected = false;
      });

      RedisConfig.instance.on('end', () => {
        logger.info('Redis client disconnected');
        RedisConfig.isConnected = false;
      });

      RedisConfig.instance.on('reconnecting', () => {
        logger.info('Redis client reconnecting');
      });
    }

    return RedisConfig.instance;
  }

  public static async connect(): Promise<void> {
    try {
      const client = RedisConfig.getInstance();
      if (!RedisConfig.isConnected) {
        await client.connect();
        logger.info('Redis connected successfully');
      }
    } catch (error) {
      logger.error('Failed to connect to Redis', { error });
      throw error;
    }
  }

  public static async disconnect(): Promise<void> {
    try {
      const client = RedisConfig.getInstance();
      if (RedisConfig.isConnected) {
        await client.disconnect();
        logger.info('Redis disconnected successfully');
      }
    } catch (error) {
      logger.error('Failed to disconnect from Redis', { error });
      throw error;
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      const client = RedisConfig.getInstance();
      const result = await client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed', { error });
      return false;
    }
  }

  public static isRedisConnected(): boolean {
    return RedisConfig.isConnected;
  }

  // Utility methods for common Redis operations
  public static async set(key: string, value: string, expireInSeconds?: number): Promise<void> {
    try {
      const client = RedisConfig.getInstance();
      if (expireInSeconds) {
        await client.setEx(key, expireInSeconds, value);
      } else {
        await client.set(key, value);
      }
    } catch (error) {
      logger.error('Redis SET operation failed', { key, error });
      throw error;
    }
  }

  public static async get(key: string): Promise<string | null> {
    try {
      const client = RedisConfig.getInstance();
      return await client.get(key);
    } catch (error) {
      logger.error('Redis GET operation failed', { key, error });
      throw error;
    }
  }

  public static async del(key: string): Promise<number> {
    try {
      const client = RedisConfig.getInstance();
      return await client.del(key);
    } catch (error) {
      logger.error('Redis DEL operation failed', { key, error });
      throw error;
    }
  }

  public static async incr(key: string): Promise<number> {
    try {
      const client = RedisConfig.getInstance();
      return await client.incr(key);
    } catch (error) {
      logger.error('Redis INCR operation failed', { key, error });
      throw error;
    }
  }

  public static async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const client = RedisConfig.getInstance();
      return await client.expire(key, seconds);
    } catch (error) {
      logger.error('Redis EXPIRE operation failed', { key, seconds, error });
      throw error;
    }
  }
}

export const redisClient = RedisConfig.getInstance();
export default RedisConfig;