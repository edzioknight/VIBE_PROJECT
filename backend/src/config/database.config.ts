import { PrismaClient } from '@prisma/client';
import { logger } from './logger.config';

class DatabaseConfig {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new PrismaClient({
        log: [
          {
            emit: 'event',
            level: 'query',
          },
          {
            emit: 'event',
            level: 'error',
          },
          {
            emit: 'event',
            level: 'info',
          },
          {
            emit: 'event',
            level: 'warn',
          },
        ],
        errorFormat: 'pretty',
      });

      // Log database queries in development
      if (process.env.NODE_ENV === 'development') {
        DatabaseConfig.instance.$on('query', (e) => {
          logger.debug('Database Query', {
            query: e.query,
            params: e.params,
            duration: e.duration,
            target: e.target,
          });
        });
      }

      // Log database errors
      DatabaseConfig.instance.$on('error', (e) => {
        logger.error('Database Error', {
          message: e.message,
          target: e.target,
        });
      });

      // Log database info
      DatabaseConfig.instance.$on('info', (e) => {
        logger.info('Database Info', {
          message: e.message,
          target: e.target,
        });
      });

      // Log database warnings
      DatabaseConfig.instance.$on('warn', (e) => {
        logger.warn('Database Warning', {
          message: e.message,
          target: e.target,
        });
      });
    }

    return DatabaseConfig.instance;
  }

  public static async connect(): Promise<void> {
    try {
      const prisma = DatabaseConfig.getInstance();
      await prisma.$connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Failed to connect to database', { error });
      throw error;
    }
  }

  public static async disconnect(): Promise<void> {
    try {
      const prisma = DatabaseConfig.getInstance();
      await prisma.$disconnect();
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Failed to disconnect from database', { error });
      throw error;
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      const prisma = DatabaseConfig.getInstance();
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed', { error });
      return false;
    }
  }
}

export const prisma = DatabaseConfig.getInstance();
export default DatabaseConfig;