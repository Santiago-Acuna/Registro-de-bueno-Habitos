import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

import { logger } from '@/infrastructure/config/logger';

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  details?: unknown;
}

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, message, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(409, message, details);
    this.name = 'ConflictError';
  }
}

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void => {
  const requestId = request.id;
  const method = request.method;
  const url = request.url;

  // Log error details
  logger.error(
    {
      err: error,
      requestId,
      method,
      url,
    },
    'Request error occurred'
  );

  // Handle known application errors
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      error: error.name,
      message: error.message,
      statusCode: error.statusCode,
      ...(error.details && { details: error.details }),
    });
    return;
  }

  // Handle Fastify validation errors
  if (error.validation) {
    reply.status(400).send({
      error: 'Validation Error',
      message: 'Request validation failed',
      statusCode: 400,
      details: error.validation,
    });
    return;
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002':
        reply.status(409).send({
          error: 'Conflict',
          message: 'A record with this unique field already exists',
          statusCode: 409,
          details: prismaError.meta,
        });
        return;
      case 'P2025':
        reply.status(404).send({
          error: 'Not Found',
          message: 'The requested record was not found',
          statusCode: 404,
        });
        return;
      default:
        break;
    }
  }

  // Handle rate limit errors
  if (error.statusCode === 429) {
    reply.status(429).send({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded',
      statusCode: 429,
    });
    return;
  }

  // Handle other HTTP errors
  if (error.statusCode && error.statusCode < 500) {
    reply.status(error.statusCode).send({
      error: error.name || 'Client Error',
      message: error.message,
      statusCode: error.statusCode,
    });
    return;
  }

  // Handle unexpected server errors
  reply.status(500).send({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    statusCode: 500,
  });
};