import { ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

import { HttpExceptionFilter } from '../http-exception.filter';

// Mock Logger
jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  Logger: jest.fn().mockImplementation(() => ({
    error: jest.fn(),
  })),
}));

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockArgumentsHost: ArgumentsHost;
  let mockLogger: jest.Mocked<Logger>;

  // Helper to create mock Request
  const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
    method: 'GET',
    url: '/api/habits',
    ...overrides,
  });

  // Helper to create mock Response
  const createMockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    return res;
  };

  // Helper to create mock ArgumentsHost
  const createMockArgumentsHost = (
    request: Partial<Request>,
    response: Partial<Response>
  ): ArgumentsHost => {
    const mockHttpArgumentsHost = {
      getRequest: jest.fn().mockReturnValue(request),
      getResponse: jest.fn().mockReturnValue(response),
      getNext: jest.fn(),
    };

    return {
      switchToHttp: jest.fn().mockReturnValue(mockHttpArgumentsHost),
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as unknown as ArgumentsHost;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create fresh instances
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockArgumentsHost = createMockArgumentsHost(mockRequest, mockResponse);

    // Create filter instance
    filter = new HttpExceptionFilter();

    // Get logger mock from the filter instance
    mockLogger = (filter as any).logger;
  });

  describe('catch() - Exception dispatcher', () => {
    it('should dispatch HttpException to handleHttpException', () => {
      // Arrange
      const httpException = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
      const handleHttpExceptionSpy = jest.spyOn(filter as any, 'handleHttpException');

      // Act
      filter.catch(httpException, mockArgumentsHost);

      // Assert
      expect(handleHttpExceptionSpy).toHaveBeenCalledWith(httpException, mockRequest);
      expect(mockResponse.status).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should dispatch Prisma.PrismaClientKnownRequestError to handlePrismaException', () => {
      // Arrange
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: { target: ['email'] },
      });
      const handlePrismaExceptionSpy = jest.spyOn(filter as any, 'handlePrismaException');

      // Act
      filter.catch(prismaError, mockArgumentsHost);

      // Assert
      expect(handlePrismaExceptionSpy).toHaveBeenCalledWith(prismaError, mockRequest);
      expect(mockResponse.status).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should dispatch Prisma.PrismaClientValidationError to handlePrismaValidationError', () => {
      // Arrange
      const validationError = new Prisma.PrismaClientValidationError(
        'Validation error: Invalid field',
        { clientVersion: '5.0.0' }
      );
      const handlePrismaValidationErrorSpy = jest.spyOn(
        filter as any,
        'handlePrismaValidationError'
      );

      // Act
      filter.catch(validationError, mockArgumentsHost);

      // Assert
      expect(handlePrismaValidationErrorSpy).toHaveBeenCalledWith(validationError, mockRequest);
      expect(mockResponse.status).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should dispatch unknown exceptions to handleUnknownException', () => {
      // Arrange
      const unknownError = new Error('Something went wrong');
      const handleUnknownExceptionSpy = jest.spyOn(filter as any, 'handleUnknownException');

      // Act
      filter.catch(unknownError, mockArgumentsHost);

      // Assert
      expect(handleUnknownExceptionSpy).toHaveBeenCalledWith(unknownError, mockRequest);
      expect(mockResponse.status).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should log error with request details and status code', () => {
      // Arrange
      const httpException = new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      mockRequest = createMockRequest({ method: 'POST', url: '/api/login' });
      mockArgumentsHost = createMockArgumentsHost(mockRequest, mockResponse);

      // Act
      filter.catch(httpException, mockArgumentsHost);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('POST'),
        expect.any(String)
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('/api/login'),
        expect.any(String)
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('401'),
        expect.any(String)
      );
    });

    it('should log error stack trace when exception is an Error', () => {
      // Arrange
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at Object.<anonymous>';

      // Act
      filter.catch(error, mockArgumentsHost);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('Error: Test error')
      );
    });

    it('should log exception itself when not an Error instance', () => {
      // Arrange
      const plainException = 'String error';

      // Act
      filter.catch(plainException, mockArgumentsHost);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(expect.any(String), plainException);
    });

    it('should send response with correct status code and JSON body', () => {
      // Arrange
      const httpException = new HttpException('Not Found', HttpStatus.NOT_FOUND);

      // Act
      filter.catch(httpException, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          error: 'HttpException',
          message: 'Not Found',
        })
      );
    });
  });

  describe('handleHttpException() - HTTP exception handling', () => {
    it('should extract status code from HttpException.getStatus()', () => {
      // Arrange
      const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

      // Act
      const result = (filter as any).handleHttpException(exception, mockRequest);

      // Assert
      expect(result.statusCode).toBe(403);
    });

    it('should handle string response type', () => {
      // Arrange
      const exception = new HttpException('Simple string error', HttpStatus.BAD_REQUEST);

      // Act
      const result = (filter as any).handleHttpException(exception, mockRequest);

      // Assert
      expect(result.message).toBe('Simple string error');
      expect(result.error).toBe('HttpException');
    });

    it('should handle object response type with message property', () => {
      // Arrange
      const responseObject = { message: 'Validation failed', field: 'email' };
      const exception = new HttpException(responseObject, HttpStatus.BAD_REQUEST);

      // Act
      const result = (filter as any).handleHttpException(exception, mockRequest);

      // Assert
      expect(result.message).toBe('Validation failed');
    });

    it('should handle object response type without message property', () => {
      // Arrange
      const responseObject = { error: 'Some error' };
      const exception = new HttpException(responseObject, HttpStatus.BAD_REQUEST);

      // Act
      const result = (filter as any).handleHttpException(exception, mockRequest);

      // Assert
      expect(result.message).toBe(exception.message);
    });

    it('should include details when present in response object', () => {
      // Arrange
      const responseObject = {
        message: 'Validation error',
        details: { field: 'email', constraint: 'isEmail' },
      };
      const exception = new HttpException(responseObject, HttpStatus.BAD_REQUEST);

      // Act
      const result = (filter as any).handleHttpException(exception, mockRequest);

      // Assert
      expect(result.details).toEqual({ field: 'email', constraint: 'isEmail' });
    });

    it('should not include details when not present in response object', () => {
      // Arrange
      const responseObject = { message: 'Simple error' };
      const exception = new HttpException(responseObject, HttpStatus.BAD_REQUEST);

      // Act
      const result = (filter as any).handleHttpException(exception, mockRequest);

      // Assert
      expect(result.details).toBeUndefined();
    });

    it('should use exception constructor name for error field', () => {
      // Arrange
      class CustomHttpException extends HttpException {}
      const exception = new CustomHttpException('Custom error', HttpStatus.BAD_REQUEST);

      // Act
      const result = (filter as any).handleHttpException(exception, mockRequest);

      // Assert
      expect(result.error).toBe('CustomHttpException');
    });

    it('should include timestamp in ISO format', () => {
      // Arrange
      const exception = new HttpException('Test', HttpStatus.OK);
      const beforeTime = new Date();

      // Act
      const result = (filter as any).handleHttpException(exception, mockRequest);
      const afterTime = new Date();

      // Assert
      expect(result.timestamp).toBeDefined();
      const resultTime = new Date(result.timestamp);
      expect(resultTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(resultTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should include request path from URL', () => {
      // Arrange
      mockRequest.url = '/api/habits/123';
      const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

      // Act
      const result = (filter as any).handleHttpException(exception, mockRequest);

      // Assert
      expect(result.path).toBe('/api/habits/123');
    });

    it('should return complete ErrorResponse structure', () => {
      // Arrange
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      // Act
      const result = (filter as any).handleHttpException(exception, mockRequest);

      // Assert
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('path');
    });
  });

  describe('handlePrismaException() - Prisma error code mapping', () => {
    it('should map P2002 (unique constraint) to 409 Conflict', () => {
      // Arrange
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: { target: ['email'] },
      });

      // Act
      const result = (filter as any).handlePrismaException(prismaError, mockRequest);

      // Assert
      expect(result.statusCode).toBe(HttpStatus.CONFLICT);
      expect(result.message).toBe('A record with this unique field already exists');
    });

    it('should map P2025 (record not found) to 404 Not Found', () => {
      // Arrange
      const prismaError = new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '5.0.0',
        meta: { cause: 'Record to update not found.' },
      });

      // Act
      const result = (filter as any).handlePrismaException(prismaError, mockRequest);

      // Assert
      expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(result.message).toBe('The requested record was not found');
    });

    it('should map P2003 (foreign key constraint) to 400 Bad Request', () => {
      // Arrange
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '5.0.0',
          meta: { field_name: 'userId' },
        }
      );

      // Act
      const result = (filter as any).handlePrismaException(prismaError, mockRequest);

      // Assert
      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(result.message).toBe('Foreign key constraint violation');
    });

    it('should map P2014 (required relation violation) to 400 Bad Request', () => {
      // Arrange
      const prismaError = new Prisma.PrismaClientKnownRequestError('Required relation violation', {
        code: 'P2014',
        clientVersion: '5.0.0',
        meta: { relation_name: 'UserToPost' },
      });

      // Act
      const result = (filter as any).handlePrismaException(prismaError, mockRequest);

      // Assert
      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(result.message).toBe('Invalid relationship data provided');
    });

    it('should fall back to 500 for unknown Prisma error codes', () => {
      // Arrange
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unknown Prisma error', {
        code: 'P9999',
        clientVersion: '5.0.0',
      });

      // Act
      const result = (filter as any).handlePrismaException(prismaError, mockRequest);

      // Assert
      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe('Database error occurred');
    });

    it('should always use "DatabaseError" as error field', () => {
      // Arrange
      const prismaError = new Prisma.PrismaClientKnownRequestError('Test', {
        code: 'P2002',
        clientVersion: '5.0.0',
      });

      // Act
      const result = (filter as any).handlePrismaException(prismaError, mockRequest);

      // Assert
      expect(result.error).toBe('DatabaseError');
    });

    it('should include Prisma error code in details', () => {
      // Arrange
      const prismaError = new Prisma.PrismaClientKnownRequestError('Test', {
        code: 'P2002',
        clientVersion: '5.0.0',
      });

      // Act
      const result = (filter as any).handlePrismaException(prismaError, mockRequest);

      // Assert
      expect(result.details).toHaveProperty('code', 'P2002');
    });

    it('should include Prisma meta information in details', () => {
      // Arrange
      const metaInfo = { target: ['email', 'username'], modelName: 'User' };
      const prismaError = new Prisma.PrismaClientKnownRequestError('Test', {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: metaInfo,
      });

      // Act
      const result = (filter as any).handlePrismaException(prismaError, mockRequest);

      // Assert
      expect(result.details).toHaveProperty('meta', metaInfo);
    });

    it('should include timestamp in ISO format', () => {
      // Arrange
      const prismaError = new Prisma.PrismaClientKnownRequestError('Test', {
        code: 'P2002',
        clientVersion: '5.0.0',
      });
      const beforeTime = new Date();

      // Act
      const result = (filter as any).handlePrismaException(prismaError, mockRequest);
      const afterTime = new Date();

      // Assert
      expect(result.timestamp).toBeDefined();
      const resultTime = new Date(result.timestamp);
      expect(resultTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(resultTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should include request path from URL', () => {
      // Arrange
      mockRequest.url = '/api/habits/create';
      const prismaError = new Prisma.PrismaClientKnownRequestError('Test', {
        code: 'P2002',
        clientVersion: '5.0.0',
      });

      // Act
      const result = (filter as any).handlePrismaException(prismaError, mockRequest);

      // Assert
      expect(result.path).toBe('/api/habits/create');
    });
  });

  describe('handlePrismaValidationError() - Prisma validation errors', () => {
    it('should return 400 Bad Request status', () => {
      // Arrange
      const validationError = new Prisma.PrismaClientValidationError('Invalid input', {
        clientVersion: '5.0.0',
      });

      // Act
      const result = (filter as any).handlePrismaValidationError(validationError, mockRequest);

      // Assert
      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should use "ValidationError" as error field', () => {
      // Arrange
      const validationError = new Prisma.PrismaClientValidationError('Invalid input', {
        clientVersion: '5.0.0',
      });

      // Act
      const result = (filter as any).handlePrismaValidationError(validationError, mockRequest);

      // Assert
      expect(result.error).toBe('ValidationError');
    });

    it('should use "Database validation failed" as message', () => {
      // Arrange
      const validationError = new Prisma.PrismaClientValidationError('Invalid input', {
        clientVersion: '5.0.0',
      });

      // Act
      const result = (filter as any).handlePrismaValidationError(validationError, mockRequest);

      // Assert
      expect(result.message).toBe('Database validation failed');
    });

    it('should include validation error message in details', () => {
      // Arrange
      const errorMessage =
        'Argument name: Invalid value provided. Expected String, received undefined';
      const validationError = new Prisma.PrismaClientValidationError(errorMessage, {
        clientVersion: '5.0.0',
      });

      // Act
      const result = (filter as any).handlePrismaValidationError(validationError, mockRequest);

      // Assert
      expect(result.details).toBe(errorMessage);
    });

    it('should include timestamp in ISO format', () => {
      // Arrange
      const validationError = new Prisma.PrismaClientValidationError('Invalid input', {
        clientVersion: '5.0.0',
      });
      const beforeTime = new Date();

      // Act
      const result = (filter as any).handlePrismaValidationError(validationError, mockRequest);
      const afterTime = new Date();

      // Assert
      expect(result.timestamp).toBeDefined();
      const resultTime = new Date(result.timestamp);
      expect(resultTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(resultTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should include request path from URL', () => {
      // Arrange
      mockRequest.url = '/api/habits';
      const validationError = new Prisma.PrismaClientValidationError('Invalid input', {
        clientVersion: '5.0.0',
      });

      // Act
      const result = (filter as any).handlePrismaValidationError(validationError, mockRequest);

      // Assert
      expect(result.path).toBe('/api/habits');
    });
  });

  describe('handleUnknownException() - Unknown error handling', () => {
    it('should return 500 Internal Server Error status', () => {
      // Arrange
      const error = new Error('Unknown error');

      // Act
      const result = (filter as any).handleUnknownException(error, mockRequest);

      // Assert
      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should use "InternalServerError" as error field', () => {
      // Arrange
      const error = new Error('Unknown error');

      // Act
      const result = (filter as any).handleUnknownException(error, mockRequest);

      // Assert
      expect(result.error).toBe('InternalServerError');
    });

    it('should use "Internal server error" as message', () => {
      // Arrange
      const error = new Error('Unknown error');

      // Act
      const result = (filter as any).handleUnknownException(error, mockRequest);

      // Assert
      expect(result.message).toBe('Internal server error');
    });

    it('should include error message in details when exception is Error', () => {
      // Arrange
      const error = new Error('Detailed error information');

      // Act
      const result = (filter as any).handleUnknownException(error, mockRequest);

      // Assert
      expect(result.details).toBe('Detailed error information');
    });

    it('should use "Unknown error" in details when exception is not Error', () => {
      // Arrange
      const plainException = { something: 'went wrong' };

      // Act
      const result = (filter as any).handleUnknownException(plainException, mockRequest);

      // Assert
      expect(result.details).toBe('Unknown error');
    });

    it('should handle null exception', () => {
      // Arrange
      const nullException = null;

      // Act
      const result = (filter as any).handleUnknownException(nullException, mockRequest);

      // Assert
      expect(result.details).toBe('Unknown error');
      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should handle undefined exception', () => {
      // Arrange
      const undefinedException = undefined;

      // Act
      const result = (filter as any).handleUnknownException(undefinedException, mockRequest);

      // Assert
      expect(result.details).toBe('Unknown error');
      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should handle string exception', () => {
      // Arrange
      const stringException = 'Simple string error';

      // Act
      const result = (filter as any).handleUnknownException(stringException, mockRequest);

      // Assert
      expect(result.details).toBe('Unknown error');
    });

    it('should handle number exception', () => {
      // Arrange
      const numberException = 42;

      // Act
      const result = (filter as any).handleUnknownException(numberException, mockRequest);

      // Assert
      expect(result.details).toBe('Unknown error');
    });

    it('should include timestamp in ISO format', () => {
      // Arrange
      const error = new Error('Test error');
      const beforeTime = new Date();

      // Act
      const result = (filter as any).handleUnknownException(error, mockRequest);
      const afterTime = new Date();

      // Assert
      expect(result.timestamp).toBeDefined();
      const resultTime = new Date(result.timestamp);
      expect(resultTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(resultTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should include request path from URL', () => {
      // Arrange
      mockRequest.url = '/api/unknown';
      const error = new Error('Unknown error');

      // Act
      const result = (filter as any).handleUnknownException(error, mockRequest);

      // Assert
      expect(result.path).toBe('/api/unknown');
    });
  });

  describe('Error response structure consistency', () => {
    it('should return consistent structure for HttpException', () => {
      // Arrange
      const exception = new HttpException('Test', HttpStatus.BAD_REQUEST);

      // Act
      const result = (filter as any).handleHttpException(exception, mockRequest);

      // Assert
      expect(result).toMatchObject({
        error: expect.any(String),
        message: expect.any(String),
        statusCode: expect.any(Number),
        timestamp: expect.any(String),
        path: expect.any(String),
      });
    });

    it('should return consistent structure for Prisma exception', () => {
      // Arrange
      const prismaError = new Prisma.PrismaClientKnownRequestError('Test', {
        code: 'P2002',
        clientVersion: '5.0.0',
      });

      // Act
      const result = (filter as any).handlePrismaException(prismaError, mockRequest);

      // Assert
      expect(result).toMatchObject({
        error: expect.any(String),
        message: expect.any(String),
        statusCode: expect.any(Number),
        timestamp: expect.any(String),
        path: expect.any(String),
        details: expect.any(Object),
      });
    });

    it('should return consistent structure for Prisma validation error', () => {
      // Arrange
      const validationError = new Prisma.PrismaClientValidationError('Test', {
        clientVersion: '5.0.0',
      });

      // Act
      const result = (filter as any).handlePrismaValidationError(validationError, mockRequest);

      // Assert
      expect(result).toMatchObject({
        error: expect.any(String),
        message: expect.any(String),
        statusCode: expect.any(Number),
        timestamp: expect.any(String),
        path: expect.any(String),
        details: expect.any(String),
      });
    });

    it('should return consistent structure for unknown exception', () => {
      // Arrange
      const error = new Error('Unknown');

      // Act
      const result = (filter as any).handleUnknownException(error, mockRequest);

      // Assert
      expect(result).toMatchObject({
        error: expect.any(String),
        message: expect.any(String),
        statusCode: expect.any(Number),
        timestamp: expect.any(String),
        path: expect.any(String),
        details: expect.any(String),
      });
    });
  });

  describe('handlePrismaException() - Enhanced P2002 User-Friendly Messages (US-001)', () => {
    describe('Single field unique constraint violations', () => {
      it('should return user-friendly message for single field "name" violation', () => {
        // Arrange
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed on the fields: (`name`)',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: ['name'] },
          }
        );

        // Act
        const result = (filter as any).handlePrismaException(prismaError, mockRequest);

        // Assert
        expect(result.message).toBe('The name is already in use. Please choose a different name.');
        expect(result.statusCode).toBe(HttpStatus.CONFLICT);
      });

      it('should return user-friendly message for single field "icon" violation', () => {
        // Arrange
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed on the fields: (`icon`)',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: ['icon'] },
          }
        );

        // Act
        const result = (filter as any).handlePrismaException(prismaError, mockRequest);

        // Assert
        expect(result.message).toBe('The icon is already in use. Please choose a different icon.');
        expect(result.statusCode).toBe(HttpStatus.CONFLICT);
      });

      it('should return user-friendly message for single field "email" violation', () => {
        // Arrange
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed on the fields: (`email`)',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: ['email'] },
          }
        );

        // Act
        const result = (filter as any).handlePrismaException(prismaError, mockRequest);

        // Assert
        expect(result.message).toBe('The email is already in use. Please choose a different email.');
        expect(result.statusCode).toBe(HttpStatus.CONFLICT);
      });

      it('should include field name in details object for single field violation', () => {
        // Arrange
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed on the fields: (`name`)',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: ['name'] },
          }
        );

        // Act
        const result = (filter as any).handlePrismaException(prismaError, mockRequest);

        // Assert
        expect(result.details).toHaveProperty('field', 'name');
        expect(result.details).toHaveProperty('code', 'P2002');
        expect(result.details).toHaveProperty('meta', { target: ['name'] });
      });

      it('should maintain 409 CONFLICT status code for P2002 errors', () => {
        // Arrange
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: ['name'] },
          }
        );

        // Act
        const result = (filter as any).handlePrismaException(prismaError, mockRequest);

        // Assert
        expect(result.statusCode).toBe(409);
      });
    });

    describe('Composite unique constraint violations', () => {
      it('should return user-friendly message for two-field composite constraint', () => {
        // Arrange
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed on the fields: (`name`,`icon`)',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: ['name', 'icon'] },
          }
        );

        // Act
        const result = (filter as any).handlePrismaException(prismaError, mockRequest);

        // Assert
        expect(result.message).toBe('A record with this name and icon combination already exists.');
        expect(result.statusCode).toBe(HttpStatus.CONFLICT);
      });

      it('should return user-friendly message for three-field composite constraint', () => {
        // Arrange
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed on the fields: (`userId`,`habitId`,`date`)',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: ['userId', 'habitId', 'date'] },
          }
        );

        // Act
        const result = (filter as any).handlePrismaException(prismaError, mockRequest);

        // Assert
        expect(result.message).toBe(
          'A record with this userId and habitId and date combination already exists.'
        );
      });

      it('should include fields array in details object for composite constraint', () => {
        // Arrange
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed on the fields: (`name`,`icon`)',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: ['name', 'icon'] },
          }
        );

        // Act
        const result = (filter as any).handlePrismaException(prismaError, mockRequest);

        // Assert
        expect(result.details).toHaveProperty('fields', ['name', 'icon']);
        expect(result.details).not.toHaveProperty('field');
        expect(result.details).toHaveProperty('code', 'P2002');
      });
    });

    describe('Edge cases for P2002 error handling', () => {
      it('should handle P2002 with missing meta gracefully', () => {
        // Arrange
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            // meta is undefined
          }
        );

        // Act
        const result = (filter as any).handlePrismaException(prismaError, mockRequest);

        // Assert
        expect(result.message).toBe('A record with this unique field already exists.');
        expect(result.statusCode).toBe(HttpStatus.CONFLICT);
        expect(result.details).not.toHaveProperty('field');
        expect(result.details).not.toHaveProperty('fields');
      });

      it('should handle P2002 with undefined target array', () => {
        // Arrange
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: undefined },
          }
        );

        // Act
        const result = (filter as any).handlePrismaException(prismaError, mockRequest);

        // Assert
        expect(result.message).toBe('A record with this unique field already exists.');
        expect(result.statusCode).toBe(HttpStatus.CONFLICT);
      });

      it('should handle P2002 with empty target array', () => {
        // Arrange
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: [] },
          }
        );

        // Act
        const result = (filter as any).handlePrismaException(prismaError, mockRequest);

        // Assert
        expect(result.message).toBe('A record with this unique field already exists.');
        expect(result.statusCode).toBe(HttpStatus.CONFLICT);
        expect(result.details).not.toHaveProperty('field');
        expect(result.details).not.toHaveProperty('fields');
      });

      it('should handle P2002 with null target', () => {
        // Arrange
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: null },
          }
        );

        // Act
        const result = (filter as any).handlePrismaException(prismaError, mockRequest);

        // Assert
        expect(result.message).toBe('A record with this unique field already exists.');
      });
    });

    describe('buildUniqueConstraintMessage() - Helper method', () => {
      it('should exist as a private method', () => {
        // Assert
        expect(filter).toHaveProperty('buildUniqueConstraintMessage');
        expect(typeof (filter as any).buildUniqueConstraintMessage).toBe('function');
      });

      it('should build message for single field', () => {
        // Act
        const message = (filter as any).buildUniqueConstraintMessage(['name']);

        // Assert
        expect(message).toBe('The name is already in use. Please choose a different name.');
      });

      it('should build message for two fields', () => {
        // Act
        const message = (filter as any).buildUniqueConstraintMessage(['name', 'icon']);

        // Assert
        expect(message).toBe('A record with this name and icon combination already exists.');
      });

      it('should build message for three or more fields', () => {
        // Act
        const message = (filter as any).buildUniqueConstraintMessage([
          'userId',
          'habitId',
          'date',
        ]);

        // Assert
        expect(message).toBe(
          'A record with this userId and habitId and date combination already exists.'
        );
      });

      it('should return fallback message for undefined fields', () => {
        // Act
        const message = (filter as any).buildUniqueConstraintMessage(undefined);

        // Assert
        expect(message).toBe('A record with this unique field already exists.');
      });

      it('should return fallback message for empty array', () => {
        // Act
        const message = (filter as any).buildUniqueConstraintMessage([]);

        // Assert
        expect(message).toBe('A record with this unique field already exists.');
      });

      it('should return fallback message for null', () => {
        // Act
        const message = (filter as any).buildUniqueConstraintMessage(null);

        // Assert
        expect(message).toBe('A record with this unique field already exists.');
      });
    });

    describe('Message formatting requirements', () => {
      it('should use "The" prefix for single field messages', () => {
        // Arrange
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: ['username'] },
          }
        );

        // Act
        const result = (filter as any).handlePrismaException(prismaError, mockRequest);

        // Assert
        expect(result.message).toMatch(/^The /);
      });

      it('should capitalize first letter (sentence case)', () => {
        // Arrange
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: ['name'] },
          }
        );

        // Act
        const result = (filter as any).handlePrismaException(prismaError, mockRequest);

        // Assert
        expect(result.message.charAt(0)).toBe(result.message.charAt(0).toUpperCase());
      });

      it('should end with a period', () => {
        // Arrange
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: ['name'] },
          }
        );

        // Act
        const result = (filter as any).handlePrismaException(prismaError, mockRequest);

        // Assert
        expect(result.message).toMatch(/\.$/);
      });

      it('should provide actionable guidance for single fields', () => {
        // Arrange
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: ['name'] },
          }
        );

        // Act
        const result = (filter as any).handlePrismaException(prismaError, mockRequest);

        // Assert
        expect(result.message).toContain('Please choose a different');
      });

      it('should use field name verbatim from database', () => {
        // Arrange - Test with snake_case field name
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: ['user_email'] },
          }
        );

        // Act
        const result = (filter as any).handlePrismaException(prismaError, mockRequest);

        // Assert
        expect(result.message).toContain('user_email');
        expect(result.message).toBe(
          'The user_email is already in use. Please choose a different user_email.'
        );
      });
    });

    describe('Integration with existing P2002 tests', () => {
      it('should maintain backward compatibility with error response structure', () => {
        // Arrange
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: ['name'] },
          }
        );

        // Act
        const result = (filter as any).handlePrismaException(prismaError, mockRequest);

        // Assert
        expect(result).toMatchObject({
          error: 'DatabaseError',
          message: expect.any(String),
          statusCode: 409,
          timestamp: expect.any(String),
          path: expect.any(String),
          details: expect.objectContaining({
            code: 'P2002',
            meta: { target: ['name'] },
          }),
        });
      });

      it('should not affect other Prisma error codes (P2025, P2003, etc.)', () => {
        // Arrange
        const p2025Error = new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        });

        // Act
        const result = (filter as any).handlePrismaException(p2025Error, mockRequest);

        // Assert
        expect(result.message).toBe('The requested record was not found');
        expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
      });
    });

    describe('Real-world database constraint scenarios', () => {
      it('should handle global_entity_identifiers_name_unique constraint', () => {
        // Arrange - Based on tu_archivo_esquema.sql line 719
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed on the constraint: `global_entity_identifiers_name_unique`',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: ['name'] },
          }
        );

        // Act
        const result = (filter as any).handlePrismaException(prismaError, mockRequest);

        // Assert
        expect(result.message).toBe('The name is already in use. Please choose a different name.');
        expect(result.details).toHaveProperty('field', 'name');
      });

      it('should handle global_entity_identifiers_icon_unique constraint', () => {
        // Arrange - Based on tu_archivo_esquema.sql line 703
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed on the constraint: `global_entity_identifiers_icon_unique`',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: ['icon'] },
          }
        );

        // Act
        const result = (filter as any).handlePrismaException(prismaError, mockRequest);

        // Assert
        expect(result.message).toBe('The icon is already in use. Please choose a different icon.');
        expect(result.details).toHaveProperty('field', 'icon');
      });

      it('should handle global_entity_identifiers_name_icon_unique constraint', () => {
        // Arrange - Based on tu_archivo_esquema.sql line 711
        const prismaError = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed on the constraint: `global_entity_identifiers_name_icon_unique`',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: ['name', 'icon'] },
          }
        );

        // Act
        const result = (filter as any).handlePrismaException(prismaError, mockRequest);

        // Assert
        expect(result.message).toBe('A record with this name and icon combination already exists.');
        expect(result.details).toHaveProperty('fields', ['name', 'icon']);
      });
    });
  });

  describe('Edge cases and integration', () => {
    it('should handle HttpException with empty message', () => {
      // Arrange
      const exception = new HttpException('', HttpStatus.BAD_REQUEST);

      // Act
      const result = (filter as any).handleHttpException(exception, mockRequest);

      // Assert
      expect(result.message).toBeDefined();
      expect(result.statusCode).toBe(400);
    });

    it('should handle request with empty URL', () => {
      // Arrange
      mockRequest.url = '';
      const exception = new HttpException('Test', HttpStatus.BAD_REQUEST);

      // Act
      const result = (filter as any).handleHttpException(exception, mockRequest);

      // Assert
      expect(result.path).toBe('');
    });

    it('should handle Prisma error with no meta', () => {
      // Arrange
      const prismaError = new Prisma.PrismaClientKnownRequestError('Test', {
        code: 'P2002',
        clientVersion: '5.0.0',
      });

      // Act
      const result = (filter as any).handlePrismaException(prismaError, mockRequest);

      // Assert
      expect(result.details.code).toBe('P2002');
      expect(result.details.meta).toBeUndefined();
    });

    it('should handle complex nested error objects', () => {
      // Arrange
      const complexResponse = {
        message: 'Complex error',
        details: {
          nested: {
            deep: {
              field: 'value',
            },
          },
        },
      };
      const exception = new HttpException(complexResponse, HttpStatus.BAD_REQUEST);

      // Act
      const result = (filter as any).handleHttpException(exception, mockRequest);

      // Assert
      expect(result.details).toEqual(complexResponse.details);
    });

    it('should handle HttpException with array response', () => {
      // Arrange
      const arrayResponse = ['error1', 'error2', 'error3'];
      const exception = new HttpException(arrayResponse as any, HttpStatus.BAD_REQUEST);

      // Act
      const result = (filter as any).handleHttpException(exception, mockRequest);

      // Assert
      expect(result.message).toBeDefined();
    });

    it('should properly chain all handlers through catch()', () => {
      // Arrange
      const testCases = [
        new HttpException('HTTP', HttpStatus.BAD_REQUEST),
        new Prisma.PrismaClientKnownRequestError('Prisma', {
          code: 'P2002',
          clientVersion: '5.0.0',
        }),
        new Prisma.PrismaClientValidationError('Validation', { clientVersion: '5.0.0' }),
        new Error('Unknown'),
      ];

      testCases.forEach(exception => {
        // Reset mocks
        jest.clearAllMocks();
        mockResponse = createMockResponse();
        mockArgumentsHost = createMockArgumentsHost(mockRequest, mockResponse);

        // Act
        filter.catch(exception, mockArgumentsHost);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockLogger.error).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle Error with missing stack trace', () => {
      // Arrange
      const error = new Error('Test error');
      delete (error as any).stack;

      // Act
      filter.catch(error, mockArgumentsHost);

      // Assert
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle different HTTP status codes', () => {
      // Arrange
      const statusCodes = [
        HttpStatus.OK,
        HttpStatus.CREATED,
        HttpStatus.BAD_REQUEST,
        HttpStatus.UNAUTHORIZED,
        HttpStatus.FORBIDDEN,
        HttpStatus.NOT_FOUND,
        HttpStatus.CONFLICT,
        HttpStatus.INTERNAL_SERVER_ERROR,
      ];

      statusCodes.forEach(statusCode => {
        // Reset mocks
        jest.clearAllMocks();
        mockResponse = createMockResponse();
        mockArgumentsHost = createMockArgumentsHost(mockRequest, mockResponse);

        const exception = new HttpException('Test', statusCode);

        // Act
        filter.catch(exception, mockArgumentsHost);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(statusCode);
      });
    });
  });
});
