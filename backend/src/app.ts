import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { appConfig } from './config/app.config';
import { logger, stream } from './config/logger.config';
import DatabaseConfig from './config/database.config';
import RedisConfig from './config/redis.config';
import routes from './routes';
import { ErrorHandlerMiddleware } from './middleware/errorHandler.middleware';
import { RateLimitMiddleware } from './middleware/rateLimit.middleware';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: appConfig.cors.origin,
      credentials: appConfig.cors.credentials,
      optionsSuccessStatus: appConfig.cors.optionsSuccessStatus,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
      ],
    }));

    // Request parsing middleware
    this.app.use(express.json({ 
      limit: '10mb',
      verify: (req, res, buf) => {
        // Store raw body for webhook verification if needed
        (req as any).rawBody = buf;
      },
    }));
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: '10mb' 
    }));

    // Logging middleware
    if (appConfig.isDevelopment()) {
      this.app.use(morgan('combined', { stream }));
    } else {
      this.app.use(morgan('combined', { 
        stream,
        skip: (req, res) => res.statusCode < 400,
      }));
    }

    // Trust proxy for accurate IP addresses
    this.app.set('trust proxy', 1);

    // Global rate limiting
    this.app.use('/api', RateLimitMiddleware.apiRateLimit());

    // Request ID middleware for tracing
    this.app.use((req, res, next) => {
      const requestId = req.get('X-Request-ID') || 
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      (req as any).requestId = requestId;
      res.set('X-Request-ID', requestId);
      
      next();
    });

    // Request logging middleware
    this.app.use((req, res, next) => {
      logger.info('Incoming request', {
        requestId: (req as any).requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        contentLength: req.get('Content-Length'),
      });
      
      next();
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api/v1', routes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.status(200).json({
        success: true,
        data: {
          name: 'VibesMatch API',
          version: '1.0.0',
          status: 'running',
          timestamp: new Date().toISOString(),
          endpoints: {
            api: '/api/v1',
            health: '/api/v1/health',
            docs: '/api/v1/docs',
          },
        },
      });
    });

    // API documentation placeholder
    this.app.get('/api/v1/docs', (req, res) => {
      res.status(200).json({
        success: true,
        data: {
          message: 'API documentation will be available here',
          swagger: '/api/v1/swagger.json',
          postman: '/api/v1/postman.json',
        },
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use('*', ErrorHandlerMiddleware.notFound);

    // Global error handler
    this.app.use(ErrorHandlerMiddleware.handle);
  }

  public async initialize(): Promise<void> {
    try {
      // Connect to database
      await DatabaseConfig.connect();
      logger.info('Database connection established');

      // Connect to Redis
      await RedisConfig.connect();
      logger.info('Redis connection established');

      // Perform health checks
      const dbHealthy = await DatabaseConfig.healthCheck();
      const redisHealthy = await RedisConfig.healthCheck();

      if (!dbHealthy) {
        logger.warn('Database health check failed');
      }

      if (!redisHealthy) {
        logger.warn('Redis health check failed');
      }

      logger.info('Application initialized successfully', {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        redis: redisHealthy ? 'healthy' : 'unhealthy',
        environment: appConfig.nodeEnv,
      });
    } catch (error) {
      logger.error('Failed to initialize application', { error });
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    try {
      logger.info('Shutting down application...');

      // Close database connection
      await DatabaseConfig.disconnect();
      logger.info('Database connection closed');

      // Close Redis connection
      await RedisConfig.disconnect();
      logger.info('Redis connection closed');

      logger.info('Application shutdown complete');
    } catch (error) {
      logger.error('Error during application shutdown', { error });
      throw error;
    }
  }
}

export default App;