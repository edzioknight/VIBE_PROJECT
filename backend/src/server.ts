import { createServer } from 'http';
import App from './app';
import { appConfig } from './config/app.config';
import { logger } from './config/logger.config';

class Server {
  private app: App;
  private server: any;

  constructor() {
    this.app = new App();
  }

  public async start(): Promise<void> {
    try {
      // Initialize the application
      await this.app.initialize();

      // Create HTTP server
      this.server = createServer(this.app.app);

      // Start listening
      this.server.listen(appConfig.port, () => {
        logger.info('Server started successfully', {
          port: appConfig.port,
          environment: appConfig.nodeEnv,
          pid: process.pid,
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
        });

        // Log important URLs
        logger.info('Server endpoints', {
          api: `http://localhost:${appConfig.port}/api/v1`,
          health: `http://localhost:${appConfig.port}/api/v1/health`,
          docs: `http://localhost:${appConfig.port}/api/v1/docs`,
        });
      });

      // Handle server errors
      this.server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          logger.error(`Port ${appConfig.port} is already in use`);
        } else {
          logger.error('Server error', { error });
        }
        process.exit(1);
      });

      // Setup graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      logger.error('Failed to start server', { error });
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);

      try {
        // Stop accepting new connections
        if (this.server) {
          this.server.close(() => {
            logger.info('HTTP server closed');
          });
        }

        // Shutdown the application
        await this.app.shutdown();

        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown', { error });
        process.exit(1);
      }
    };

    // Handle different shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', { error });
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled promise rejection', { 
        reason,
        promise: promise.toString(),
      });
      process.exit(1);
    });

    // Handle warnings
    process.on('warning', (warning) => {
      logger.warn('Process warning', {
        name: warning.name,
        message: warning.message,
        stack: warning.stack,
      });
    });
  }
}

// Start the server
const server = new Server();
server.start().catch((error) => {
  logger.error('Failed to start application', { error });
  process.exit(1);
});

// Export for testing
export default server;