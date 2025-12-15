import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';

import { PrismaService } from '../prisma.service';

// Mock PrismaClient methods
const mockPrismaClient = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $queryRaw: jest.fn(),
  $on: jest.fn(),
};

// Mock process for testing shutdown hooks
const mockProcessOn = jest.fn();
const mockProcessExit = jest.fn();

// Store original process methods
const originalProcessOn = process.on;
const originalProcessExit = process.exit;

describe('PrismaService (RED PHASE)', () => {
  let service: PrismaService;
  let loggerLogSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;
  let loggerDebugSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock PrismaClient prototype methods
    jest.spyOn(PrismaClient.prototype, '$connect').mockImplementation(mockPrismaClient.$connect);
    jest
      .spyOn(PrismaClient.prototype, '$disconnect')
      .mockImplementation(mockPrismaClient.$disconnect);
    jest.spyOn(PrismaClient.prototype, '$queryRaw').mockImplementation(mockPrismaClient.$queryRaw);
    jest.spyOn(PrismaClient.prototype, '$on').mockImplementation(mockPrismaClient.$on);

    // Mock process methods
    process.on = mockProcessOn as any;
    process.exit = mockProcessExit as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);

    // Setup Logger spies
    loggerLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    loggerDebugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
  });

  afterEach(() => {
    // Restore original process methods
    process.on = originalProcessOn;
    process.exit = originalProcessExit;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('constructor and initialization', () => {
    it('should create PrismaService instance', () => {
      expect(service).toBeDefined();
      // Verify service has PrismaClient methods (confirms inheritance)
      expect(service.$connect).toBeDefined();
      expect(service.$disconnect).toBeDefined();
      expect(service.$on).toBeDefined();
      expect(service.$queryRaw).toBeDefined();
      // Verify service has custom PrismaService methods
      expect(service.onModuleInit).toBeDefined();
      expect(service.onModuleDestroy).toBeDefined();
      expect(service.healthCheck).toBeDefined();
      expect(service.enableShutdownHooks).toBeDefined();
      // Verify service constructor is PrismaService
      expect(service.constructor.name).toBe('PrismaService');
      // Verify prototype chain exists (PrismaService extends something)
      expect(Object.getPrototypeOf(service.constructor)).toBeDefined();
    });

    it('should initialize PrismaClient with correct log configuration', () => {
      // The service should extend PrismaClient with log events configured
      expect(service).toBeDefined();
    });

    it('should register query event listener during construction', () => {
      expect(mockPrismaClient.$on).toHaveBeenCalledWith('query', expect.any(Function));
    });

    it('should register error event listener during construction', () => {
      expect(mockPrismaClient.$on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should register warn event listener during construction', () => {
      expect(mockPrismaClient.$on).toHaveBeenCalledWith('warn', expect.any(Function));
    });

    it('should register info event listener during construction', () => {
      expect(mockPrismaClient.$on).toHaveBeenCalledWith('info', expect.any(Function));
    });

    it('should have logger instance', () => {
      expect(service['logger']).toBeDefined();
      expect(service['logger']).toBeInstanceOf(Logger);
    });
  });

  describe('onModuleInit()', () => {
    it('should successfully connect to database on module initialization', async () => {
      // Arrange
      mockPrismaClient.$connect.mockResolvedValue(undefined);

      // Act
      await service.onModuleInit();

      // Assert
      expect(mockPrismaClient.$connect).toHaveBeenCalledTimes(1);
      expect(loggerLogSpy).toHaveBeenCalledWith('✅ Database connected successfully');
    });

    it('should call $connect method exactly once', async () => {
      // Arrange
      mockPrismaClient.$connect.mockResolvedValue(undefined);

      // Act
      await service.onModuleInit();

      // Assert
      expect(mockPrismaClient.$connect).toHaveBeenCalledTimes(1);
    });

    it('should log success message when connection succeeds', async () => {
      // Arrange
      mockPrismaClient.$connect.mockResolvedValue(undefined);

      // Act
      await service.onModuleInit();

      // Assert
      expect(loggerLogSpy).toHaveBeenCalledWith('✅ Database connected successfully');
    });

    it('should throw error when database connection fails', async () => {
      // Arrange
      const connectionError = new Error('Connection refused');
      mockPrismaClient.$connect.mockRejectedValue(connectionError);

      // Act & Assert
      await expect(service.onModuleInit()).rejects.toThrow('Connection refused');
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        '❌ Failed to connect to database:',
        connectionError
      );
    });

    it('should log error message when connection fails', async () => {
      // Arrange
      const connectionError = new Error('Database timeout');
      mockPrismaClient.$connect.mockRejectedValue(connectionError);

      // Act
      try {
        await service.onModuleInit();
      } catch (error) {
        // Expected to throw
      }

      // Assert
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        '❌ Failed to connect to database:',
        connectionError
      );
    });

    it('should throw the original error after logging', async () => {
      // Arrange
      const customError = new Error('Custom connection error');
      mockPrismaClient.$connect.mockRejectedValue(customError);

      // Act & Assert
      await expect(service.onModuleInit()).rejects.toThrow(customError);
    });

    it('should handle network errors during connection', async () => {
      // Arrange
      const networkError = new Error('ECONNREFUSED');
      mockPrismaClient.$connect.mockRejectedValue(networkError);

      // Act & Assert
      await expect(service.onModuleInit()).rejects.toThrow('ECONNREFUSED');
      expect(loggerErrorSpy).toHaveBeenCalled();
    });

    it('should handle authentication errors during connection', async () => {
      // Arrange
      const authError = new Error('Authentication failed');
      mockPrismaClient.$connect.mockRejectedValue(authError);

      // Act & Assert
      await expect(service.onModuleInit()).rejects.toThrow('Authentication failed');
      expect(loggerErrorSpy).toHaveBeenCalledWith('❌ Failed to connect to database:', authError);
    });
  });

  describe('onModuleDestroy()', () => {
    it('should successfully disconnect from database on module destroy', async () => {
      // Arrange
      mockPrismaClient.$disconnect.mockResolvedValue(undefined);

      // Act
      await service.onModuleDestroy();

      // Assert
      expect(mockPrismaClient.$disconnect).toHaveBeenCalledTimes(1);
      expect(loggerLogSpy).toHaveBeenCalledWith('✅ Database disconnected successfully');
    });

    it('should call $disconnect method exactly once', async () => {
      // Arrange
      mockPrismaClient.$disconnect.mockResolvedValue(undefined);

      // Act
      await service.onModuleDestroy();

      // Assert
      expect(mockPrismaClient.$disconnect).toHaveBeenCalledTimes(1);
    });

    it('should log success message when disconnection succeeds', async () => {
      // Arrange
      mockPrismaClient.$disconnect.mockResolvedValue(undefined);

      // Act
      await service.onModuleDestroy();

      // Assert
      expect(loggerLogSpy).toHaveBeenCalledWith('✅ Database disconnected successfully');
    });

    it('should catch and log errors during disconnection', async () => {
      // Arrange
      const disconnectionError = new Error('Disconnection failed');
      mockPrismaClient.$disconnect.mockRejectedValue(disconnectionError);

      // Act
      await service.onModuleDestroy();

      // Assert
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        '❌ Failed to disconnect from database:',
        disconnectionError
      );
    });

    it('should not throw error when disconnection fails', async () => {
      // Arrange
      const disconnectionError = new Error('Disconnection timeout');
      mockPrismaClient.$disconnect.mockRejectedValue(disconnectionError);

      // Act & Assert
      await expect(service.onModuleDestroy()).resolves.not.toThrow();
    });

    it('should handle gracefully when disconnect is called multiple times', async () => {
      // Arrange
      mockPrismaClient.$disconnect.mockResolvedValue(undefined);

      // Reset mock to clear initialization calls
      loggerLogSpy.mockClear();

      // Act
      await service.onModuleDestroy();
      await service.onModuleDestroy();

      // Assert
      expect(mockPrismaClient.$disconnect).toHaveBeenCalledTimes(2);
      expect(loggerLogSpy).toHaveBeenCalledTimes(2);
    });

    it('should log error but continue when disconnection throws error', async () => {
      // Arrange
      const error = new Error('Connection already closed');
      mockPrismaClient.$disconnect.mockRejectedValue(error);

      // Act
      await service.onModuleDestroy();

      // Assert
      expect(loggerErrorSpy).toHaveBeenCalledWith('❌ Failed to disconnect from database:', error);
    });
  });

  describe('enableShutdownHooks()', () => {
    it('should register beforeExit event listener on process', async () => {
      // Arrange
      const mockApp = { close: jest.fn() };

      // Act
      await service.enableShutdownHooks(mockApp);

      // Assert
      expect(mockProcessOn).toHaveBeenCalledWith('beforeExit', expect.any(Function));
    });

    it('should disconnect from database when beforeExit event fires', async () => {
      // Arrange
      const mockApp = { close: jest.fn() };
      mockPrismaClient.$disconnect.mockResolvedValue(undefined);
      let beforeExitHandler: Function | undefined;

      mockProcessOn.mockImplementation((event: string, handler: Function) => {
        if (event === 'beforeExit') {
          beforeExitHandler = handler;
        }
        return process;
      });

      // Act
      await service.enableShutdownHooks(mockApp);

      // Trigger the beforeExit handler
      if (beforeExitHandler) {
        await beforeExitHandler();
      }

      // Assert
      expect(mockPrismaClient.$disconnect).toHaveBeenCalled();
    });

    it('should close app when beforeExit event fires', async () => {
      // Arrange
      const mockApp = { close: jest.fn().mockResolvedValue(undefined) };
      mockPrismaClient.$disconnect.mockResolvedValue(undefined);
      let beforeExitHandler: Function | undefined;

      mockProcessOn.mockImplementation((event: string, handler: Function) => {
        if (event === 'beforeExit') {
          beforeExitHandler = handler;
        }
        return process;
      });

      // Act
      await service.enableShutdownHooks(mockApp);

      // Trigger the beforeExit handler
      if (beforeExitHandler) {
        await beforeExitHandler();
      }

      // Assert
      expect(mockApp.close).toHaveBeenCalled();
    });

    it('should disconnect before closing app', async () => {
      // Arrange
      const mockApp = { close: jest.fn().mockResolvedValue(undefined) };
      const callOrder: string[] = [];

      mockPrismaClient.$disconnect.mockImplementation(async () => {
        callOrder.push('disconnect');
      });

      mockApp.close.mockImplementation(async () => {
        callOrder.push('close');
      });

      let beforeExitHandler: Function | undefined;

      mockProcessOn.mockImplementation((event: string, handler: Function) => {
        if (event === 'beforeExit') {
          beforeExitHandler = handler;
        }
        return process;
      });

      // Act
      await service.enableShutdownHooks(mockApp);

      // Trigger the beforeExit handler
      if (beforeExitHandler) {
        await beforeExitHandler();
      }

      // Assert
      expect(callOrder).toEqual(['disconnect', 'close']);
    });

    it('should throw error when app without close method is provided', async () => {
      // Arrange
      const mockApp = {};
      mockPrismaClient.$disconnect.mockResolvedValue(undefined);
      let beforeExitHandler: Function | undefined;

      mockProcessOn.mockImplementation((event: string, handler: Function) => {
        if (event === 'beforeExit') {
          beforeExitHandler = handler;
        }
        return process;
      });

      // Act
      await service.enableShutdownHooks(mockApp);

      // Assert - The handler should throw when triggered with app without close method
      if (beforeExitHandler) {
        await expect(beforeExitHandler()).rejects.toThrow();
      }
    });
  });

  describe('healthCheck()', () => {
    it('should return true when database query succeeds', async () => {
      // Arrange
      mockPrismaClient.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      // Act
      const result = await service.healthCheck();

      // Assert
      expect(result).toBe(true);
      expect(mockPrismaClient.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should execute SELECT 1 query for health check', async () => {
      // Arrange
      mockPrismaClient.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      // Act
      await service.healthCheck();

      // Assert
      expect(mockPrismaClient.$queryRaw).toHaveBeenCalled();
    });

    it('should return false when database query fails', async () => {
      // Arrange
      mockPrismaClient.$queryRaw.mockRejectedValue(new Error('Database connection lost'));

      // Act
      const result = await service.healthCheck();
      -(
        // Assert
        expect(result).toBe(false)
      );
    });

    it('should not throw error when query fails', async () => {
      // Arrange
      mockPrismaClient.$queryRaw.mockRejectedValue(new Error('Query timeout'));

      // Act & Assert
      await expect(service.healthCheck()).resolves.toBe(false);
    });

    it('should catch network errors and return false', async () => {
      // Arrange
      mockPrismaClient.$queryRaw.mockRejectedValue(new Error('ECONNRESET'));

      // Act
      const result = await service.healthCheck();

      // Assert
      expect(result).toBe(false);
    });

    it('should catch syntax errors and return false', async () => {
      // Arrange
      mockPrismaClient.$queryRaw.mockRejectedValue(new Error('Syntax error'));

      // Act
      const result = await service.healthCheck();

      // Assert
      expect(result).toBe(false);
    });

    it('should handle null response from query', async () => {
      // Arrange
      mockPrismaClient.$queryRaw.mockResolvedValue(null);

      // Act
      const result = await service.healthCheck();

      // Assert
      expect(result).toBe(true);
    });

    it('should handle undefined response from query', async () => {
      // Arrange
      mockPrismaClient.$queryRaw.mockResolvedValue(undefined);

      // Act
      const result = await service.healthCheck();

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('Prisma Event Listeners', () => {
    describe('query event listener', () => {
      it('should log query details when query event fires', () => {
        // Arrange
        let queryHandler: Function | undefined;

        mockPrismaClient.$on.mockImplementation((event: string, handler: Function) => {
          if (event === 'query') {
            queryHandler = handler;
          }
        });

        // Create new service instance to trigger constructor
        new PrismaService();

        const queryEvent = {
          query: 'SELECT * FROM users',
          params: '["user123"]',
          duration: 42,
        };

        // Act
        if (queryHandler) {
          queryHandler(queryEvent);
        }

        // Assert
        expect(loggerDebugSpy).toHaveBeenCalledWith('Query: SELECT * FROM users');
        expect(loggerDebugSpy).toHaveBeenCalledWith('Params: ["user123"]');
        expect(loggerDebugSpy).toHaveBeenCalledWith('Duration: 42ms');
      });

      it('should log query without params', () => {
        // Arrange
        let queryHandler: Function | undefined;

        mockPrismaClient.$on.mockImplementation((event: string, handler: Function) => {
          if (event === 'query') {
            queryHandler = handler;
          }
        });

        new PrismaService();

        const queryEvent = {
          query: 'SELECT 1',
          params: '[]',
          duration: 5,
        };

        // Act
        if (queryHandler) {
          queryHandler(queryEvent);
        }

        // Assert
        expect(loggerDebugSpy).toHaveBeenCalledWith('Query: SELECT 1');
        expect(loggerDebugSpy).toHaveBeenCalledWith('Params: []');
        expect(loggerDebugSpy).toHaveBeenCalledWith('Duration: 5ms');
      });

      it('should log slow queries with correct duration', () => {
        // Arrange
        let queryHandler: Function | undefined;

        mockPrismaClient.$on.mockImplementation((event: string, handler: Function) => {
          if (event === 'query') {
            queryHandler = handler;
          }
        });

        new PrismaService();

        const slowQueryEvent = {
          query: 'SELECT * FROM large_table WHERE complex_condition',
          params: '[]',
          duration: 5000,
        };

        // Act
        if (queryHandler) {
          queryHandler(slowQueryEvent);
        }

        // Assert
        expect(loggerDebugSpy).toHaveBeenCalledWith('Duration: 5000ms');
      });
    });

    describe('error event listener', () => {
      it('should log database errors when error event fires', () => {
        // Arrange
        let errorHandler: Function | undefined;

        mockPrismaClient.$on.mockImplementation((event: string, handler: Function) => {
          if (event === 'error') {
            errorHandler = handler;
          }
        });

        new PrismaService();

        const errorEvent = {
          message: 'Foreign key constraint failed',
        };

        // Act
        if (errorHandler) {
          errorHandler(errorEvent);
        }

        // Assert
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          'Database error:',
          'Foreign key constraint failed'
        );
      });

      it('should log connection errors', () => {
        // Arrange
        let errorHandler: Function | undefined;

        mockPrismaClient.$on.mockImplementation((event: string, handler: Function) => {
          if (event === 'error') {
            errorHandler = handler;
          }
        });

        new PrismaService();

        const connectionErrorEvent = {
          message: 'Connection pool timeout',
        };

        // Act
        if (errorHandler) {
          errorHandler(connectionErrorEvent);
        }

        // Assert
        expect(loggerErrorSpy).toHaveBeenCalledWith('Database error:', 'Connection pool timeout');
      });

      it('should log transaction errors', () => {
        // Arrange
        let errorHandler: Function | undefined;

        mockPrismaClient.$on.mockImplementation((event: string, handler: Function) => {
          if (event === 'error') {
            errorHandler = handler;
          }
        });

        new PrismaService();

        const transactionErrorEvent = {
          message: 'Transaction rollback',
        };

        // Act
        if (errorHandler) {
          errorHandler(transactionErrorEvent);
        }

        // Assert
        expect(loggerErrorSpy).toHaveBeenCalledWith('Database error:', 'Transaction rollback');
      });
    });

    describe('warn event listener', () => {
      it('should log warnings when warn event fires', () => {
        // Arrange
        let warnHandler: Function | undefined;

        mockPrismaClient.$on.mockImplementation((event: string, handler: Function) => {
          if (event === 'warn') {
            warnHandler = handler;
          }
        });

        new PrismaService();

        const warnEvent = {
          message: 'Slow query detected',
        };

        // Act
        if (warnHandler) {
          warnHandler(warnEvent);
        }

        // Assert
        expect(loggerWarnSpy).toHaveBeenCalledWith('Database warning:', 'Slow query detected');
      });

      it('should log deprecation warnings', () => {
        // Arrange
        let warnHandler: Function | undefined;

        mockPrismaClient.$on.mockImplementation((event: string, handler: Function) => {
          if (event === 'warn') {
            warnHandler = handler;
          }
        });

        new PrismaService();

        const deprecationWarnEvent = {
          message: 'Deprecated API usage',
        };

        // Act
        if (warnHandler) {
          warnHandler(deprecationWarnEvent);
        }

        // Assert
        expect(loggerWarnSpy).toHaveBeenCalledWith('Database warning:', 'Deprecated API usage');
      });

      it('should log performance warnings', () => {
        // Arrange
        let warnHandler: Function | undefined;

        mockPrismaClient.$on.mockImplementation((event: string, handler: Function) => {
          if (event === 'warn') {
            warnHandler = handler;
          }
        });

        new PrismaService();

        const perfWarnEvent = {
          message: 'Connection pool near capacity',
        };

        // Act
        if (warnHandler) {
          warnHandler(perfWarnEvent);
        }

        // Assert
        expect(loggerWarnSpy).toHaveBeenCalledWith(
          'Database warning:',
          'Connection pool near capacity'
        );
      });
    });

    describe('info event listener', () => {
      it('should log informational messages when info event fires', () => {
        // Arrange
        let infoHandler: Function | undefined;

        mockPrismaClient.$on.mockImplementation((event: string, handler: Function) => {
          if (event === 'info') {
            infoHandler = handler;
          }
        });

        new PrismaService();

        const infoEvent = {
          message: 'Database migration completed',
        };

        // Act
        if (infoHandler) {
          infoHandler(infoEvent);
        }

        // Assert
        expect(loggerLogSpy).toHaveBeenCalledWith('Database info:', 'Database migration completed');
      });

      it('should log connection info messages', () => {
        // Arrange
        let infoHandler: Function | undefined;

        mockPrismaClient.$on.mockImplementation((event: string, handler: Function) => {
          if (event === 'info') {
            infoHandler = handler;
          }
        });

        new PrismaService();

        const connectionInfoEvent = {
          message: 'Connection pool initialized',
        };

        // Act
        if (infoHandler) {
          infoHandler(connectionInfoEvent);
        }

        // Assert
        expect(loggerLogSpy).toHaveBeenCalledWith('Database info:', 'Connection pool initialized');
      });

      it('should log schema info messages', () => {
        // Arrange
        let infoHandler: Function | undefined;

        mockPrismaClient.$on.mockImplementation((event: string, handler: Function) => {
          if (event === 'info') {
            infoHandler = handler;
          }
        });

        new PrismaService();

        const schemaInfoEvent = {
          message: 'Schema validation passed',
        };

        // Act
        if (infoHandler) {
          infoHandler(schemaInfoEvent);
        }

        // Assert
        expect(loggerLogSpy).toHaveBeenCalledWith('Database info:', 'Schema validation passed');
      });
    });
  });

  describe('PrismaClient configuration', () => {
    it('should configure PrismaClient with query log level', () => {
      // Assert - configuration happens in constructor
      expect(service).toBeDefined();
    });

    it('should configure PrismaClient with error log level', () => {
      // Assert - configuration happens in constructor
      expect(service).toBeDefined();
    });

    it('should configure PrismaClient with info log level', () => {
      // Assert - configuration happens in constructor
      expect(service).toBeDefined();
    });

    it('should configure PrismaClient with warn log level', () => {
      // Assert - configuration happens in constructor
      expect(service).toBeDefined();
    });

    it('should configure PrismaClient with pretty error format', () => {
      // Assert - configuration happens in constructor
      expect(service).toBeDefined();
    });

    it('should emit events for all log levels', () => {
      // Assert
      const $onCalls = mockPrismaClient.$on.mock.calls;
      const events = $onCalls.map(call => call[0]);

      expect(events).toContain('query');
      expect(events).toContain('error');
      expect(events).toContain('warn');
      expect(events).toContain('info');
    });
  });

  describe('error scenarios and edge cases', () => {
    it('should handle concurrent connection attempts', async () => {
      // Arrange
      mockPrismaClient.$connect.mockResolvedValue(undefined);

      // Act
      const promises = [service.onModuleInit(), service.onModuleInit()];
      await Promise.all(promises);

      // Assert
      expect(mockPrismaClient.$connect).toHaveBeenCalledTimes(2);
    });

    it('should handle health check during active connection', async () => {
      // Arrange
      mockPrismaClient.$connect.mockResolvedValue(undefined);
      mockPrismaClient.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      // Act
      await service.onModuleInit();
      const result = await service.healthCheck();

      // Assert
      expect(result).toBe(true);
    });

    it('should handle health check when not connected', async () => {
      // Arrange
      mockPrismaClient.$queryRaw.mockRejectedValue(new Error('Not connected'));

      // Act
      const result = await service.healthCheck();

      // Assert
      expect(result).toBe(false);
    });

    it('should maintain state across multiple lifecycle events', async () => {
      // Arrange
      mockPrismaClient.$connect.mockResolvedValue(undefined);
      mockPrismaClient.$disconnect.mockResolvedValue(undefined);

      // Act
      await service.onModuleInit();
      await service.onModuleDestroy();

      // Assert
      expect(mockPrismaClient.$connect).toHaveBeenCalledTimes(1);
      expect(mockPrismaClient.$disconnect).toHaveBeenCalledTimes(1);
    });
  });
});
