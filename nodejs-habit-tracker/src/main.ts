import 'dotenv/config';

import { createApp } from '@/infrastructure/web/app';
import { env } from '@/infrastructure/config/environment';
import { logger } from '@/infrastructure/config/logger';

const start = async (): Promise<void> => {
  try {
    // Validate environment variables
    logger.info('Validating environment configuration...');
    
    // Create and configure Fastify app
    logger.info('Creating Fastify application...');
    const app = await createApp();

    // Start server
    const address = await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    logger.info(`Server started successfully on ${address}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`API Documentation: http://localhost:${env.PORT}/docs`);

    // Graceful shutdown
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);
      
      try {
        await app.close();
        logger.info('Server closed successfully');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.fatal('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

start().catch((error) => {
  logger.fatal('Failed to start application:', error);
  process.exit(1);
});