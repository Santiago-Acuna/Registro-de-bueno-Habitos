import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { env } from '@/infrastructure/config/environment';
import { logger } from '@/infrastructure/config/logger';
import { errorHandler } from './middleware/error-handler';
import { habitRoutes } from './routes/habit-routes';
import { bookRoutes } from './routes/book-routes';

export const createApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger,
    trustProxy: true,
    disableRequestLogging: env.NODE_ENV === 'production',
  });

  // Security middleware
  await app.register(helmet, {
    contentSecurityPolicy: false, // Disable CSP for API
  });

  // CORS configuration
  await app.register(cors, {
    origin: env.CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
    errorResponseBuilder: (request, context) => ({
      code: 'RATE_LIMIT_EXCEEDED',
      error: 'Rate Limit Exceeded',
      message: `Rate limit exceeded, retry in ${Math.round(context.ttl / 1000)} seconds`,
      expiresIn: Math.round(context.ttl / 1000),
    }),
  });

  // API Documentation
  if (env.NODE_ENV !== 'production') {
    await app.register(swagger, {
      swagger: {
        info: {
          title: 'Habit Tracker API',
          description: 'Modern habit tracking application API',
          version: env.API_VERSION,
        },
        host: `localhost:${env.PORT}`,
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [
          { name: 'habits', description: 'Habit management endpoints' },
          { name: 'books', description: 'Book management endpoints' },
          { name: 'actions', description: 'Action tracking endpoints' },
          { name: 'reading-logs', description: 'Reading session endpoints' },
        ],
      },
    });

    await app.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
    });
  }

  // Global error handler
  app.setErrorHandler(errorHandler);

  // Health check endpoint
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: env.API_VERSION,
  }));

  // API routes
  await app.register(habitRoutes, { prefix: `/api/${env.API_VERSION}/habits` });
  await app.register(bookRoutes, { prefix: `/api/${env.API_VERSION}/books` });

  // 404 handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
      statusCode: 404,
    });
  });

  return app;
};