import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  details?: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let errorResponse: ErrorResponse;

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      errorResponse = this.handleHttpException(exception, request);
    }
    // Handle Prisma exceptions
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      errorResponse = this.handlePrismaException(exception, request);
    }
    // Handle validation errors
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      errorResponse = this.handlePrismaValidationError(exception, request);
    }
    // Handle unknown exceptions
    else {
      errorResponse = this.handleUnknownException(exception, request);
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${errorResponse.statusCode} - ${errorResponse.message}`,
      exception instanceof Error ? exception.stack : exception
    );

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private handleHttpException(exception: HttpException, request: Request): ErrorResponse {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    return {
      error: exception.constructor.name,
      message: typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message || exception.message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(typeof exceptionResponse === 'object' && 
          exceptionResponse !== null && 
          'details' in exceptionResponse && 
          { details: (exceptionResponse as any).details }),
    };
  }

  private handlePrismaException(
    exception: Prisma.PrismaClientKnownRequestError,
    request: Request
  ): ErrorResponse {
    let statusCode: HttpStatus;
    let message: string;

    switch (exception.code) {
      case 'P2002':
        statusCode = HttpStatus.CONFLICT;
        message = 'A record with this unique field already exists';
        break;
      case 'P2025':
        statusCode = HttpStatus.NOT_FOUND;
        message = 'The requested record was not found';
        break;
      case 'P2003':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Foreign key constraint violation';
        break;
      case 'P2014':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Invalid relationship data provided';
        break;
      default:
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database error occurred';
    }

    return {
      error: 'DatabaseError',
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      details: {
        code: exception.code,
        meta: exception.meta,
      },
    };
  }

  private handlePrismaValidationError(
    exception: Prisma.PrismaClientValidationError,
    request: Request
  ): ErrorResponse {
    return {
      error: 'ValidationError',
      message: 'Database validation failed',
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: new Date().toISOString(),
      path: request.url,
      details: exception.message,
    };
  }

  private handleUnknownException(exception: unknown, request: Request): ErrorResponse {
    return {
      error: 'InternalServerError',
      message: 'An unexpected error occurred',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      details: exception instanceof Error ? exception.message : 'Unknown error',
    };
  }
}