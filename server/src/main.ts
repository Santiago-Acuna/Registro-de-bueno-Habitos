import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './infrastructure/filters/http-exception.filter';
import { LoggingInterceptor } from './infrastructure/interceptors/logging.interceptor';

export async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // Create NestJS application
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService);

    // Global configuration
    app.setGlobalPrefix('api');

    // API versioning
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: configService.get('API_VERSION', 'v1'),
    });

    // Security middleware
    app.use(
      helmet({
        contentSecurityPolicy: false,
      })
    );

    // CORS configuration
    const corsOrigin = configService.get('CORS_ORIGIN', 'http://localhost:5173');
    const originArray = corsOrigin.split(',').map((origin: string) => origin.trim());

    app.enableCors({
      origin: originArray,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      })
    );

    // Global exception filter
    app.useGlobalFilters(new HttpExceptionFilter());

    // Global interceptors
    app.useGlobalInterceptors(new LoggingInterceptor());

    // Swagger documentation (non-production only)
    if (configService.get('NODE_ENV') !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Habit Tracker API')
        .setDescription('Modern habit tracking application API')
        .setVersion(configService.get('API_VERSION', 'v1'))
        .addTag('habits', 'Habit management endpoints')
        .addTag('books', 'Book management endpoints')
        .addTag('actions', 'Action tracking endpoints')
        .addTag('reading-logs', 'Reading session endpoints')
        .addTag('health', 'Health check endpoints')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('docs', app, document, {
        swaggerOptions: {
          docExpansion: 'list',
          deepLinking: false,
        },
      });
    }

    // Start server
    const port = configService.get('PORT', 3000);
    await app.listen(port, '0.0.0.0');

    logger.log(`Server started successfully on port ${port}`);
    logger.log(`Environment: ${configService.get('NODE_ENV', 'development')}`);
    logger.log(`API Documentation: http://localhost:${port}/docs`);
    logger.log(
      `Health Check: http://localhost:${port}/api/${configService.get('API_VERSION', 'v1')}/health`
    );
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  const logger = new Logger('Bootstrap');
  logger.fatal('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  const logger = new Logger('Bootstrap');
  logger.fatal('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Execute bootstrap automatically (skip in test environment)
if (process.env['NODE_ENV'] !== 'test') {
  bootstrap().catch((error: Error) => {
    const logger = new Logger('Bootstrap');
    logger.fatal('Failed to start application:', error);
    process.exit(1);
  });
}
