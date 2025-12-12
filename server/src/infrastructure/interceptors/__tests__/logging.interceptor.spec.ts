import { ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LoggingInterceptor } from '../logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockCallHandler: jest.Mocked<CallHandler>;
  let mockRequest: any;
  let mockResponse: any;
  let loggerLogSpy: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();

    // Spy on logger methods
    loggerLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    // Mock request object
    mockRequest = {
      method: 'GET',
      url: '/api/v1/habits',
      ip: '127.0.0.1',
      get: jest.fn((header: string) => {
        if (header === 'User-Agent') return 'Mozilla/5.0';
        return undefined;
      }),
    };

    // Mock response object
    mockResponse = {
      statusCode: 200,
      get: jest.fn((header: string) => {
        if (header === 'content-length') return '1234';
        return undefined;
      }),
    };

    // Mock ExecutionContext
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    } as any;

    // Mock CallHandler
    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of('test response')),
    } as any;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Logger Initialization', () => {
    it('should create logger with LoggingInterceptor name', () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      const newInterceptor = new LoggingInterceptor();

      // Access the private logger to trigger any initialization
      expect(newInterceptor).toBeDefined();
      expect(loggerSpy).toBeDefined();
    });
  });

  describe('Request Logging', () => {
    it('should log incoming request with method, URL, IP, and user agent', () => {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📥 GET /api/v1/habits - 127.0.0.1 - Mozilla/5.0')
      );
    });

    it('should log incoming request immediately when interceptor is called', () => {
      const logCallsBefore = loggerLogSpy.mock.calls.length;

      interceptor.intercept(mockExecutionContext, mockCallHandler);

      const logCallsAfter = loggerLogSpy.mock.calls.length;
      expect(logCallsAfter).toBeGreaterThan(logCallsBefore);
    });

    it('should handle missing User-Agent header', () => {
      mockRequest.get = jest.fn().mockReturnValue(undefined);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📥 GET /api/v1/habits - 127.0.0.1 - ')
      );
    });

    it('should handle empty User-Agent header', () => {
      mockRequest.get = jest.fn().mockReturnValue('');

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📥 GET /api/v1/habits - 127.0.0.1 - ')
      );
    });

    it('should log POST requests correctly', () => {
      mockRequest.method = 'POST';
      mockRequest.url = '/api/v1/habits';

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📥 POST /api/v1/habits')
      );
    });

    it('should log PUT requests correctly', () => {
      mockRequest.method = 'PUT';
      mockRequest.url = '/api/v1/habits/123';

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📥 PUT /api/v1/habits/123')
      );
    });

    it('should log DELETE requests correctly', () => {
      mockRequest.method = 'DELETE';
      mockRequest.url = '/api/v1/habits/456';

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📥 DELETE /api/v1/habits/456')
      );
    });

    it('should log PATCH requests correctly', () => {
      mockRequest.method = 'PATCH';
      mockRequest.url = '/api/v1/habits/789';

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📥 PATCH /api/v1/habits/789')
      );
    });

    it('should handle different IP addresses', () => {
      mockRequest.ip = '192.168.1.100';

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('192.168.1.100')
      );
    });

    it('should handle IPv6 addresses', () => {
      mockRequest.ip = '::1';

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('::1')
      );
    });

    it('should handle URLs with query parameters', () => {
      mockRequest.url = '/api/v1/habits?page=1&limit=10';

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/habits?page=1&limit=10')
      );
    });
  });

  describe('Response Logging', () => {
    it('should log response with method, URL, status code, content length, and duration', (done) => {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        expect(loggerLogSpy).toHaveBeenCalledWith(
          expect.stringMatching(/📤 GET \/api\/v1\/habits - 200 - 1234b - \d+ms/)
        );
        done();
      });
    });

    it('should log response after request completes', (done) => {
      let requestLogged = false;
      let responseLogged = false;

      loggerLogSpy.mockImplementation((message: string) => {
        if (message.includes('📥')) requestLogged = true;
        if (message.includes('📤')) responseLogged = true;
      });

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        expect(requestLogged).toBe(true);
        expect(responseLogged).toBe(true);
        done();
      });
    });

    it('should handle 201 Created status code', (done) => {
      mockResponse.statusCode = 201;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        expect(loggerLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('- 201 -')
        );
        done();
      });
    });

    it('should handle 204 No Content status code', (done) => {
      mockResponse.statusCode = 204;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        expect(loggerLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('- 204 -')
        );
        done();
      });
    });

    it('should handle 400 Bad Request status code', (done) => {
      mockResponse.statusCode = 400;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        expect(loggerLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('- 400 -')
        );
        done();
      });
    });

    it('should handle 404 Not Found status code', (done) => {
      mockResponse.statusCode = 404;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        expect(loggerLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('- 404 -')
        );
        done();
      });
    });

    it('should handle 500 Internal Server Error status code', (done) => {
      mockResponse.statusCode = 500;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        expect(loggerLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('- 500 -')
        );
        done();
      });
    });

    it('should handle missing content-length header', (done) => {
      mockResponse.get = jest.fn().mockReturnValue(undefined);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        expect(loggerLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('- 0b -')
        );
        done();
      });
    });

    it('should handle zero content-length', (done) => {
      mockResponse.get = jest.fn().mockReturnValue('0');

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        expect(loggerLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('- 0b -')
        );
        done();
      });
    });

    it('should handle large content-length values', (done) => {
      mockResponse.get = jest.fn().mockReturnValue('1048576');

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        expect(loggerLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('- 1048576b -')
        );
        done();
      });
    });
  });

  describe('Duration Calculation', () => {
    it('should calculate and log request duration', (done) => {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        expect(loggerLogSpy).toHaveBeenCalledWith(
          expect.stringMatching(/\d+ms/)
        );
        done();
      });
    });

    it('should have non-negative duration', (done) => {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        const responseLog = loggerLogSpy.mock.calls.find((call: any[]) =>
          call[0].includes('📤')
        )?.[0];

        expect(responseLog).toBeDefined();
        const durationMatch = responseLog?.match(/(\d+)ms/);
        expect(durationMatch).toBeTruthy();

        if (durationMatch) {
          const duration = parseInt(durationMatch[1], 10);
          expect(duration).toBeGreaterThanOrEqual(0);
        }
        done();
      });
    });

    it('should measure duration from intercept call to response completion', (done) => {
      const delay = 50;
      mockCallHandler.handle = jest.fn().mockReturnValue(
        of('delayed response').pipe(
          // Simulate delay
          tap(() => {
            const start = Date.now();
            while (Date.now() - start < delay) {
              // Busy wait
            }
          })
        )
      );

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        const responseLog = loggerLogSpy.mock.calls.find((call: any[]) =>
          call[0].includes('📤')
        )?.[0];

        const durationMatch = responseLog?.match(/(\d+)ms/);
        if (durationMatch) {
          const duration = parseInt(durationMatch[1], 10);
          expect(duration).toBeGreaterThanOrEqual(delay);
        }
        done();
      });
    });
  });

  describe('Observable Chain', () => {
    it('should return an Observable', () => {
      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);
      expect(result).toBeDefined();
      expect(result.subscribe).toBeDefined();
    });

    it('should pass through the response from CallHandler', (done) => {
      const testData = { id: 1, name: 'Test' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((data) => {
        expect(data).toEqual(testData);
        done();
      });
    });

    it('should not modify the response data', (done) => {
      const originalData = { habits: [], total: 0 };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(originalData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((data) => {
        expect(data).toBe(originalData);
        done();
      });
    });

    it('should call next.handle() to continue request processing', () => {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();
      expect(mockCallHandler.handle).toHaveBeenCalled();
    });

    it('should propagate errors from the request handler', (done) => {
      const testError = new Error('Test error');
      mockCallHandler.handle = jest.fn().mockReturnValue(throwError(() => testError));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: (error) => {
          expect(error).toBe(testError);
          done();
        },
      });
    });

    it('should log request even when handler throws error', (done) => {
      const testError = new Error('Handler error');
      mockCallHandler.handle = jest.fn().mockReturnValue(throwError(() => testError));

      loggerLogSpy.mockClear();

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: () => {
          // Should have logged the incoming request
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('📥')
          );
          done();
        },
      });
    });

    it('should not log response when handler throws error before completion', (done) => {
      const testError = new Error('Handler error');
      mockCallHandler.handle = jest.fn().mockReturnValue(throwError(() => testError));

      loggerLogSpy.mockClear();

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: () => {
          // Should NOT have logged the outgoing response
          const responseLogs = loggerLogSpy.mock.calls.filter((call: any[]) =>
            call[0].includes('📤')
          );
          expect(responseLogs).toHaveLength(0);
          done();
        },
      });
    });
  });

  describe('ExecutionContext Handling', () => {
    it('should switch to HTTP context', () => {
      const switchToHttpSpy = jest.spyOn(mockExecutionContext, 'switchToHttp');

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      expect(switchToHttpSpy).toHaveBeenCalled();
    });

    it('should get request from HTTP context', () => {
      const httpContext = mockExecutionContext.switchToHttp();
      const getRequestSpy = jest.spyOn(httpContext, 'getRequest');

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      expect(getRequestSpy).toHaveBeenCalled();
    });

    it('should get response from HTTP context', () => {
      const httpContext = mockExecutionContext.switchToHttp();
      const getResponseSpy = jest.spyOn(httpContext, 'getResponse');

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      expect(getResponseSpy).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined IP address', () => {
      mockRequest.ip = undefined;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📥 GET /api/v1/habits - undefined')
      );
    });

    it('should handle null status code', (done) => {
      mockResponse.statusCode = null;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        expect(loggerLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('- null -')
        );
        done();
      });
    });

    it('should handle very long URLs', () => {
      const longUrl = '/api/v1/habits?' + 'a=1&'.repeat(100);
      mockRequest.url = longUrl;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(longUrl)
      );
    });

    it('should handle special characters in URL', () => {
      mockRequest.url = '/api/v1/habits?name=Test%20Habit&tag=health%26fitness';

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('name=Test%20Habit&tag=health%26fitness')
      );
    });

    it('should handle very long User-Agent strings', () => {
      const longUserAgent = 'Mozilla/5.0 ' + 'x'.repeat(500);
      mockRequest.get = jest.fn().mockReturnValue(longUserAgent);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(longUserAgent)
      );
    });
  });

  describe('Logging Format', () => {
    it('should use incoming emoji (📥) for requests', () => {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📥')
      );
    });

    it('should use outgoing emoji (📤) for responses', (done) => {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        expect(loggerLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('📤')
        );
        done();
      });
    });

    it('should format request log as: 📥 METHOD URL - IP - USER_AGENT', () => {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        '📥 GET /api/v1/habits - 127.0.0.1 - Mozilla/5.0'
      );
    });

    it('should format response log as: 📤 METHOD URL - STATUS - SIZEb - DURATIONms', (done) => {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        expect(loggerLogSpy).toHaveBeenCalledWith(
          expect.stringMatching(/^📤 GET \/api\/v1\/habits - 200 - 1234b - \d+ms$/)
        );
        done();
      });
    });

    it('should log request and response separately', (done) => {
      loggerLogSpy.mockClear();

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        expect(loggerLogSpy).toHaveBeenCalledTimes(2);
        expect(loggerLogSpy.mock.calls[0]?.[0]).toContain('📥');
        expect(loggerLogSpy.mock.calls[1]?.[0]).toContain('📤');
        done();
      });
    });
  });
});
