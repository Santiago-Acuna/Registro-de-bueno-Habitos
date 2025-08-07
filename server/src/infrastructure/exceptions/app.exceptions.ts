import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly details?: unknown
  ) {
    super(
      {
        error: AppException.name,
        message,
        statusCode,
        ...(details ? { details } : {}),
      },
      statusCode
    );
  }
}

export class ValidationException extends AppException {
  constructor(message: string, details?: unknown) {
    super(message, HttpStatus.BAD_REQUEST, details);
    this.name = 'ValidationException';
  }
}

export class NotFoundError extends AppException {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(message, HttpStatus.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppException {
  constructor(message: string, details?: unknown) {
    super(message, HttpStatus.CONFLICT, details);
    this.name = 'ConflictError';
  }
}

export class UnauthorizedError extends AppException {
  constructor(message: string = 'Unauthorized access') {
    super(message, HttpStatus.UNAUTHORIZED);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppException {
  constructor(message: string = 'Forbidden access') {
    super(message, HttpStatus.FORBIDDEN);
    this.name = 'ForbiddenError';
  }
}

export class BadRequestError extends AppException {
  constructor(message: string, details?: unknown) {
    super(message, HttpStatus.BAD_REQUEST, details);
    this.name = 'BadRequestError';
  }
}