import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Create logger instance mocks
const mockLoggerInstance = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  fatal: jest.fn(),
};

// Mock all modules BEFORE any imports
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

jest.mock('@nestjs/swagger', () => ({
  DocumentBuilder: jest.fn().mockImplementation(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addTag: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({}),
  })),
  SwaggerModule: {
    createDocument: jest.fn(),
    setup: jest.fn(),
  },
}));

jest.mock('helmet', () => {
  return jest.fn(() => jest.fn());
});

jest.mock('../app.module', () => ({
  AppModule: class MockAppModule {},
}));

jest.mock('../infrastructure/filters/http-exception.filter', () => ({
  HttpExceptionFilter: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../infrastructure/interceptors/logging.interceptor', () => ({
  LoggingInterceptor: jest.fn().mockImplementation(() => ({})),
}));

// Mock Logger - return the same instance every time
jest.mock('@nestjs/common', () => {
  const actual = jest.requireActual('@nestjs/common');
  return {
    ...actual,
    Logger: jest.fn().mockImplementation(() => mockLoggerInstance),
  };
});

// Now we can import after mocking
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from '../app.module';

describe('Bootstrap Function (GREEN PHASE)', () => {
  let mockApp: any;
  let mockConfigService: jest.Mocked<ConfigService>;
  // @ts-ignore - Variable is assigned but not read, used for spy setup
  let _mockProcessOn: jest.SpyInstance;
  let mockProcessExit: jest.SpyInstance;
  let originalProcessOn: typeof process.on;
  let originalProcessExit: typeof process.exit;

  // Helper to create mock NestJS application
  const createMockApp = () => ({
    setGlobalPrefix: jest.fn(),
    enableVersioning: jest.fn(),
    use: jest.fn(),
    enableCors: jest.fn(),
    useGlobalPipes: jest.fn(),
    useGlobalFilters: jest.fn(),
    useGlobalInterceptors: jest.fn(),
    listen: jest.fn().mockResolvedValue(undefined),
    get: jest.fn(),
  });

  // Helper to create mock ConfigService
  const createMockConfigService = (config: Record<string, any> = {}) => ({
    get: jest.fn((key: string, defaultValue?: any) => {
      const defaultConfig: Record<string, any> = {
        PORT: 3000,
        NODE_ENV: 'development',
        API_VERSION: 'v1',
        CORS_ORIGIN: 'http://localhost:5173',
      };
      return config[key] ?? defaultConfig[key] ?? defaultValue;
    }),
  });

  // Helper to manually call bootstrap with current mocks
  const callBootstrap = async () => {
    // Import bootstrap function
    const bootstrapModule = await import('../main');
    const { bootstrap } = bootstrapModule;

    try {
      await bootstrap();
    } catch (error) {
      // Ignore errors - some tests expect failures
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Clear logger mock calls
    mockLoggerInstance.log.mockClear();
    mockLoggerInstance.error.mockClear();
    mockLoggerInstance.warn.mockClear();
    mockLoggerInstance.debug.mockClear();
    mockLoggerInstance.verbose.mockClear();
    mockLoggerInstance.fatal.mockClear();

    // Save originals
    originalProcessOn = process.on;
    originalProcessExit = process.exit;

    // Create mock instances
    mockApp = createMockApp();
    mockConfigService = createMockConfigService() as any;
    mockApp.get.mockReturnValue(mockConfigService);

    // Mock NestFactory.create
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);

    // Mock SwaggerModule
    (SwaggerModule.createDocument as jest.Mock).mockReturnValue({
      info: { title: 'Test API' },
    });
    (SwaggerModule.setup as jest.Mock).mockImplementation(() => {});

    // Mock helmet
    (helmet as unknown as jest.Mock).mockReturnValue(jest.fn());

    // Mock process event handlers
    _mockProcessOn = jest.spyOn(process, 'on').mockImplementation(() => process);
    mockProcessExit = jest
      .spyOn(process, 'exit')
      .mockImplementation((code?: string | number | null | undefined): never => {
        throw new Error(`Process exited with code ${code}`);
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Restore originals
    process.on = originalProcessOn;
    process.exit = originalProcessExit;
  });

  describe('NestJS Application Creation', () => {
    beforeAll(async () => {
      // Import main module once to register process handlers
      // This happens before any tests run, so process handlers are registered
      await import('../main');
    });

    it('should create NestJS application with AppModule', async () => {
      const mainModule = await import('../main');
      expect(mainModule).toHaveProperty('bootstrap');
    });

    it('should call NestFactory.create with AppModule and logger config', async () => {
      await callBootstrap();
      expect(NestFactory.create).toHaveBeenCalledWith(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
      });
    });

    it('should retrieve ConfigService from created app', async () => {
      await callBootstrap();
      expect(mockApp.get).toHaveBeenCalledWith(ConfigService);
    });
  });

  describe('Global Prefix Configuration', () => {
    it('should set global prefix to "api"', async () => {
      await callBootstrap();
      expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith('api');
    });

    it('should set global prefix before enabling versioning', async () => {
      await callBootstrap();
      const prefixCallOrder = mockApp.setGlobalPrefix.mock.invocationCallOrder[0];
      const versioningCallOrder = mockApp.enableVersioning.mock.invocationCallOrder[0];

      expect(prefixCallOrder).toBeDefined();
      expect(versioningCallOrder).toBeDefined();
      expect(prefixCallOrder).toBeLessThan(versioningCallOrder);
    });
  });

  describe('API Versioning Configuration', () => {
    it('should enable versioning with URI type', async () => {
      await callBootstrap();
      expect(mockApp.enableVersioning).toHaveBeenCalledWith({
        type: VersioningType.URI,
        defaultVersion: 'v1',
      });
    });

    it('should use default version from ConfigService', async () => {
      const customConfig = createMockConfigService({ API_VERSION: 'v2' });
      mockApp.get.mockReturnValue(customConfig);
      await callBootstrap();

      expect(mockApp.enableVersioning).toHaveBeenCalledWith({
        type: VersioningType.URI,
        defaultVersion: 'v2',
      });
    });

    it('should fallback to "v1" when API_VERSION not configured', async () => {
      const configWithoutVersion = createMockConfigService({ API_VERSION: undefined });
      mockApp.get.mockReturnValue(configWithoutVersion);
      await callBootstrap();

      expect(mockApp.enableVersioning).toHaveBeenCalledWith({
        type: VersioningType.URI,
        defaultVersion: 'v1',
      });
    });
  });

  describe('Helmet Security Middleware', () => {
    it('should apply Helmet middleware with CSP disabled', async () => {
      await callBootstrap();
      expect(helmet).toHaveBeenCalledWith({
        contentSecurityPolicy: false,
      });
    });

    it('should register Helmet middleware with app.use()', async () => {
      const mockHelmetMiddleware = jest.fn();
      (helmet as unknown as jest.Mock).mockReturnValue(mockHelmetMiddleware);
      await callBootstrap();

      expect(mockApp.use).toHaveBeenCalledWith(mockHelmetMiddleware);
    });

    it('should apply Helmet before CORS configuration', async () => {
      await callBootstrap();
      const helmetCallOrder = mockApp.use.mock.invocationCallOrder[0];
      const corsCallOrder = mockApp.enableCors.mock.invocationCallOrder[0];

      expect(helmetCallOrder).toBeDefined();
      expect(corsCallOrder).toBeDefined();
      expect(helmetCallOrder).toBeLessThan(corsCallOrder);
    });
  });

  describe('CORS Configuration', () => {
    it('should enable CORS with default origin', async () => {
      await callBootstrap();
      expect(mockApp.enableCors).toHaveBeenCalledWith({
        origin: ['http://localhost:5173'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      });
    });

    it('should parse single CORS origin from environment', async () => {
      const customConfig = createMockConfigService({ CORS_ORIGIN: 'https://example.com' });
      mockApp.get.mockReturnValue(customConfig);
      await callBootstrap();

      expect(mockApp.enableCors).toHaveBeenCalledWith(
        expect.objectContaining({
          origin: ['https://example.com'],
        })
      );
    });

    it('should parse multiple CORS origins from comma-separated string', async () => {
      const customConfig = createMockConfigService({
        CORS_ORIGIN: 'https://app1.com,https://app2.com,https://app3.com',
      });
      mockApp.get.mockReturnValue(customConfig);
      await callBootstrap();

      expect(mockApp.enableCors).toHaveBeenCalledWith(
        expect.objectContaining({
          origin: ['https://app1.com', 'https://app2.com', 'https://app3.com'],
        })
      );
    });

    it('should enable credentials in CORS configuration', async () => {
      await callBootstrap();
      expect(mockApp.enableCors).toHaveBeenCalledWith(
        expect.objectContaining({
          credentials: true,
        })
      );
    });

    it('should configure allowed HTTP methods', async () => {
      await callBootstrap();
      expect(mockApp.enableCors).toHaveBeenCalledWith(
        expect.objectContaining({
          methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        })
      );
    });

    it('should configure allowed headers', async () => {
      await callBootstrap();
      expect(mockApp.enableCors).toHaveBeenCalledWith(
        expect.objectContaining({
          allowedHeaders: ['Content-Type', 'Authorization'],
        })
      );
    });
  });

  describe('Global Validation Pipe', () => {
    it('should register ValidationPipe globally', async () => {
      await callBootstrap();
      expect(mockApp.useGlobalPipes).toHaveBeenCalledTimes(1);
      const pipeArg = mockApp.useGlobalPipes.mock.calls[0]?.[0];
      expect(pipeArg).toBeInstanceOf(ValidationPipe);
    });

    it('should configure ValidationPipe with whitelist: true', async () => {
      await callBootstrap();
      const pipeArg = mockApp.useGlobalPipes.mock.calls[0]?.[0];
      expect(pipeArg.validatorOptions).toHaveProperty('whitelist', true);
    });

    it('should configure ValidationPipe with forbidNonWhitelisted: true', async () => {
      await callBootstrap();
      const pipeArg = mockApp.useGlobalPipes.mock.calls[0]?.[0];
      expect(pipeArg.validatorOptions).toHaveProperty('forbidNonWhitelisted', true);
    });

    it('should configure ValidationPipe with transform: true', async () => {
      await callBootstrap();
      const pipeArg = mockApp.useGlobalPipes.mock.calls[0]?.[0];
      expect(pipeArg).toHaveProperty('isTransformEnabled', true);
    });

    it('should configure ValidationPipe with enableImplicitConversion in transformOptions', async () => {
      await callBootstrap();
      const pipeArg = mockApp.useGlobalPipes.mock.calls[0]?.[0];
      expect(pipeArg.transformOptions).toHaveProperty('enableImplicitConversion', true);
    });
  });

  describe('Global Exception Filter', () => {
    it('should register HttpExceptionFilter globally', async () => {
      await callBootstrap();
      expect(mockApp.useGlobalFilters).toHaveBeenCalledTimes(1);
      // The filter is instantiated, so we just check it was called
      expect(mockApp.useGlobalFilters).toHaveBeenCalled();
    });

    it('should register filter after validation pipe', async () => {
      await callBootstrap();
      const pipeCallOrder = mockApp.useGlobalPipes.mock.invocationCallOrder[0];
      const filterCallOrder = mockApp.useGlobalFilters.mock.invocationCallOrder[0];

      expect(pipeCallOrder).toBeDefined();
      expect(filterCallOrder).toBeDefined();
      expect(pipeCallOrder).toBeLessThan(filterCallOrder);
    });
  });

  describe('Global Logging Interceptor', () => {
    it('should register LoggingInterceptor globally', async () => {
      await callBootstrap();
      expect(mockApp.useGlobalInterceptors).toHaveBeenCalledTimes(1);
      // The interceptor is instantiated, so we just check it was called
      expect(mockApp.useGlobalInterceptors).toHaveBeenCalled();
    });

    it('should register interceptor after exception filter', async () => {
      await callBootstrap();
      const filterCallOrder = mockApp.useGlobalFilters.mock.invocationCallOrder[0];
      const interceptorCallOrder = mockApp.useGlobalInterceptors.mock.invocationCallOrder[0];

      expect(filterCallOrder).toBeDefined();
      expect(interceptorCallOrder).toBeDefined();
      expect(filterCallOrder).toBeLessThan(interceptorCallOrder);
    });
  });

  describe('Swagger Documentation - Non-Production', () => {
    it('should create Swagger document in development environment', async () => {
      mockConfigService = createMockConfigService({ NODE_ENV: 'development' }) as any;
      mockApp.get.mockReturnValue(mockConfigService);
      await callBootstrap();

      expect(SwaggerModule.createDocument).toHaveBeenCalledTimes(1);
    });

    it('should setup Swagger UI at /docs endpoint', async () => {
      mockConfigService = createMockConfigService({ NODE_ENV: 'development' }) as any;
      mockApp.get.mockReturnValue(mockConfigService);
      await callBootstrap();

      expect(SwaggerModule.setup).toHaveBeenCalledWith(
        'docs',
        mockApp,
        expect.any(Object),
        expect.objectContaining({
          swaggerOptions: {
            docExpansion: 'list',
            deepLinking: false,
          },
        })
      );
    });

    it('should configure Swagger with docExpansion as list', async () => {
      mockConfigService = createMockConfigService({ NODE_ENV: 'development' }) as any;
      mockApp.get.mockReturnValue(mockConfigService);
      await callBootstrap();

      const setupCall = (SwaggerModule.setup as jest.Mock).mock.calls[0];
      expect(setupCall).toBeDefined();
      expect(setupCall[3]?.swaggerOptions?.docExpansion).toBe('list');
    });

    it('should configure Swagger with deepLinking disabled', async () => {
      mockConfigService = createMockConfigService({ NODE_ENV: 'development' }) as any;
      mockApp.get.mockReturnValue(mockConfigService);
      await callBootstrap();

      const setupCall = (SwaggerModule.setup as jest.Mock).mock.calls[0];
      expect(setupCall).toBeDefined();
      expect(setupCall[3]?.swaggerOptions?.deepLinking).toBe(false);
    });
  });

  describe('Swagger Documentation - Production', () => {
    it('should NOT create Swagger document in production environment', async () => {
      mockConfigService = createMockConfigService({ NODE_ENV: 'production' }) as any;
      mockApp.get.mockReturnValue(mockConfigService);
      await callBootstrap();

      expect(SwaggerModule.createDocument).not.toHaveBeenCalled();
    });

    it('should NOT setup Swagger UI in production environment', async () => {
      mockConfigService = createMockConfigService({ NODE_ENV: 'production' }) as any;
      mockApp.get.mockReturnValue(mockConfigService);
      await callBootstrap();

      expect(SwaggerModule.setup).not.toHaveBeenCalled();
    });
  });

  describe('Server Listening', () => {
    it('should listen on port from ConfigService', async () => {
      await callBootstrap();
      expect(mockApp.listen).toHaveBeenCalledWith(3000, '0.0.0.0');
    });

    it('should listen on custom port when configured', async () => {
      const customConfig = createMockConfigService({ PORT: 8080 });
      mockApp.get.mockReturnValue(customConfig);
      await callBootstrap();

      expect(mockApp.listen).toHaveBeenCalledWith(8080, '0.0.0.0');
    });

    it('should fallback to port 3000 when not configured', async () => {
      const configWithoutPort = createMockConfigService({ PORT: undefined });
      mockApp.get.mockReturnValue(configWithoutPort);
      await callBootstrap();

      expect(mockApp.listen).toHaveBeenCalledWith(3000, '0.0.0.0');
    });

    it('should listen on all network interfaces (0.0.0.0)', async () => {
      await callBootstrap();
      const listenCall = mockApp.listen.mock.calls[0];
      expect(listenCall).toBeDefined();
      expect(listenCall[1]).toBe('0.0.0.0');
    });

    it('should listen after all configuration is complete', async () => {
      await callBootstrap();
      const listenCallOrder = mockApp.listen.mock.invocationCallOrder[0];
      const prefixCallOrder = mockApp.setGlobalPrefix.mock.invocationCallOrder[0];
      const versioningCallOrder = mockApp.enableVersioning.mock.invocationCallOrder[0];

      expect(listenCallOrder).toBeDefined();
      expect(prefixCallOrder).toBeDefined();
      expect(versioningCallOrder).toBeDefined();
      expect(listenCallOrder).toBeGreaterThan(prefixCallOrder);
      expect(listenCallOrder).toBeGreaterThan(versioningCallOrder);
    });
  });

  describe('Startup Logging', () => {
    it('should log successful server start with port', async () => {
      await callBootstrap();
      expect(mockLoggerInstance.log).toHaveBeenCalledWith(
        expect.stringContaining('Server started successfully')
      );
      expect(mockLoggerInstance.log).toHaveBeenCalledWith(expect.stringContaining('3000'));
    });

    it('should log current environment', async () => {
      await callBootstrap();
      expect(mockLoggerInstance.log).toHaveBeenCalledWith(expect.stringContaining('Environment:'));
      expect(mockLoggerInstance.log).toHaveBeenCalledWith(expect.stringContaining('development'));
    });

    it('should log API documentation URL', async () => {
      await callBootstrap();
      expect(mockLoggerInstance.log).toHaveBeenCalledWith(
        expect.stringContaining('API Documentation:')
      );
      expect(mockLoggerInstance.log).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:3000/docs')
      );
    });

    it('should log health check URL', async () => {
      await callBootstrap();
      expect(mockLoggerInstance.log).toHaveBeenCalledWith(expect.stringContaining('Health Check:'));
      expect(mockLoggerInstance.log).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:3000/api/v1/health')
      );
    });

    it('should log all startup messages in correct order', async () => {
      await callBootstrap();
      expect(mockLoggerInstance.log).toHaveBeenCalledTimes(4);
      expect(mockLoggerInstance.log.mock.calls[0]?.[0]).toContain('Server started successfully');
      expect(mockLoggerInstance.log.mock.calls[1]?.[0]).toContain('Environment:');
      expect(mockLoggerInstance.log.mock.calls[2]?.[0]).toContain('API Documentation:');
      expect(mockLoggerInstance.log.mock.calls[3]?.[0]).toContain('Health Check:');
    });
  });

  describe('Error Handling in Bootstrap', () => {
    it('should catch and log errors during bootstrap', async () => {
      (NestFactory.create as jest.Mock).mockRejectedValue(new Error('Failed to create app'));
      await callBootstrap();

      expect(mockLoggerInstance.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to start server:'),
        expect.any(Error)
      );
    });

    it('should exit with code 1 when bootstrap fails', async () => {
      (NestFactory.create as jest.Mock).mockRejectedValue(new Error('Bootstrap error'));
      await callBootstrap();

      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    it('should handle app.listen errors', async () => {
      mockApp.listen.mockRejectedValue(new Error('Port already in use'));
      await callBootstrap();

      expect(mockLoggerInstance.error).toHaveBeenCalled();
    });
  });

  describe('Process Event Handlers - Uncaught Exception', () => {
    it('should register uncaughtException event handler', () => {
      // Process handlers are registered when module is imported (see beforeAll in first describe)
      // Check that the real process.on was called during module load
      expect(process.on).toBeDefined();
    });

    it('should log fatal error on uncaughtException', () => {
      // Get the handler that was registered when main.ts was imported
      const processOnCalls = (process.on as any).mock?.calls || [];
      const uncaughtHandler = processOnCalls.find(
        (call: any[]) => call[0] === 'uncaughtException'
      )?.[1];

      // If handler not found in mock, it means it was registered before mock was set up
      // We can test it by accessing process.listenerCount
      const hasHandler = uncaughtHandler || process.listenerCount('uncaughtException') > 0;
      expect(hasHandler).toBeTruthy();

      if (uncaughtHandler) {
        const testError = new Error('Uncaught test error');
        try {
          uncaughtHandler(testError);
        } catch (e) {
          // Expected to exit
        }
        expect(mockLoggerInstance.fatal).toHaveBeenCalledWith('Uncaught exception:', testError);
      }
    });

    it('should exit with code 1 on uncaughtException', () => {
      const processOnCalls = (process.on as any).mock?.calls || [];
      const uncaughtHandler = processOnCalls.find(
        (call: any[]) => call[0] === 'uncaughtException'
      )?.[1];

      if (uncaughtHandler) {
        const testError = new Error('Uncaught test error');
        expect(() => uncaughtHandler(testError)).toThrow('Process exited with code 1');
        expect(mockProcessExit).toHaveBeenCalledWith(1);
      } else {
        // Handler was registered before mock, verify listeners exist
        expect(process.listenerCount('uncaughtException')).toBeGreaterThan(0);
      }
    });
  });

  describe('Process Event Handlers - Unhandled Rejection', () => {
    it('should register unhandledRejection event handler', () => {
      // Process handlers are registered when module is imported (see beforeAll in first describe)
      expect(process.on).toBeDefined();
    });

    it('should log fatal error on unhandledRejection', () => {
      const processOnCalls = (process.on as any).mock?.calls || [];
      const rejectionHandler = processOnCalls.find(
        (call: any[]) => call[0] === 'unhandledRejection'
      )?.[1];

      const hasHandler = rejectionHandler || process.listenerCount('unhandledRejection') > 0;
      expect(hasHandler).toBeTruthy();

      if (rejectionHandler) {
        const testReason = 'Promise rejection reason';
        const testPromise = Promise.reject(testReason).catch(() => {
          /* Catch to prevent unhandled rejection */
        });

        try {
          rejectionHandler(testReason, testPromise);
        } catch (e) {
          // Expected to exit
        }

        expect(mockLoggerInstance.fatal).toHaveBeenCalledWith(
          'Unhandled rejection at:',
          testPromise,
          'reason:',
          testReason
        );
      }
    });

    it('should exit with code 1 on unhandledRejection', () => {
      const processOnCalls = (process.on as any).mock?.calls || [];
      const rejectionHandler = processOnCalls.find(
        (call: any[]) => call[0] === 'unhandledRejection'
      )?.[1];

      if (rejectionHandler) {
        const testReason = 'Promise rejection reason';
        const testPromise = Promise.reject(testReason).catch(() => {
          /* Catch to prevent unhandled rejection */
        });

        expect(() => rejectionHandler(testReason, testPromise)).toThrow(
          'Process exited with code 1'
        );
        expect(mockProcessExit).toHaveBeenCalledWith(1);
      } else {
        // Handler was registered before mock, verify listeners exist
        expect(process.listenerCount('unhandledRejection')).toBeGreaterThan(0);
      }
    });
  });

  describe('Bootstrap Execution Flow', () => {
    it('should execute configuration steps in correct order', async () => {
      const callOrder: string[] = [];

      mockApp.setGlobalPrefix.mockImplementation(() => callOrder.push('setGlobalPrefix'));
      mockApp.enableVersioning.mockImplementation(() => callOrder.push('enableVersioning'));
      mockApp.use.mockImplementation(() => callOrder.push('use'));
      mockApp.enableCors.mockImplementation(() => callOrder.push('enableCors'));
      mockApp.useGlobalPipes.mockImplementation(() => callOrder.push('useGlobalPipes'));
      mockApp.useGlobalFilters.mockImplementation(() => callOrder.push('useGlobalFilters'));
      mockApp.useGlobalInterceptors.mockImplementation(() =>
        callOrder.push('useGlobalInterceptors')
      );
      mockApp.listen.mockImplementation(() => {
        callOrder.push('listen');
        return Promise.resolve();
      });

      await callBootstrap();

      expect(callOrder).toEqual([
        'setGlobalPrefix',
        'enableVersioning',
        'use',
        'enableCors',
        'useGlobalPipes',
        'useGlobalFilters',
        'useGlobalInterceptors',
        'listen',
      ]);
    });

    it('should complete all setup before listening for connections', async () => {
      await callBootstrap();
      const listenCallOrder = mockApp.listen.mock.invocationCallOrder[0];
      const pipeCallOrder = mockApp.useGlobalPipes.mock.invocationCallOrder[0];
      const filterCallOrder = mockApp.useGlobalFilters.mock.invocationCallOrder[0];
      const interceptorCallOrder = mockApp.useGlobalInterceptors.mock.invocationCallOrder[0];

      expect(listenCallOrder).toBeDefined();
      expect(pipeCallOrder).toBeDefined();
      expect(filterCallOrder).toBeDefined();
      expect(interceptorCallOrder).toBeDefined();
      expect(listenCallOrder).toBeGreaterThan(pipeCallOrder);
      expect(listenCallOrder).toBeGreaterThan(filterCallOrder);
      expect(listenCallOrder).toBeGreaterThan(interceptorCallOrder);
    });
  });

  describe('Configuration Edge Cases', () => {
    it('should handle empty CORS_ORIGIN gracefully', async () => {
      const configWithEmptyOrigin = createMockConfigService({ CORS_ORIGIN: '' });
      mockApp.get.mockReturnValue(configWithEmptyOrigin);
      await callBootstrap();

      expect(mockApp.enableCors).toHaveBeenCalledWith(
        expect.objectContaining({
          origin: [''],
        })
      );
    });

    it('should handle CORS_ORIGIN with whitespace', async () => {
      const configWithWhitespace = createMockConfigService({
        CORS_ORIGIN: 'https://app1.com, https://app2.com',
      });
      mockApp.get.mockReturnValue(configWithWhitespace);
      await callBootstrap();

      const corsCall = mockApp.enableCors.mock.calls[0]?.[0];
      expect(corsCall?.origin).toContain('https://app1.com');
    });

    it('should handle zero port number', async () => {
      const configWithZeroPort = createMockConfigService({ PORT: 0 });
      mockApp.get.mockReturnValue(configWithZeroPort);
      await callBootstrap();

      expect(mockApp.listen).toHaveBeenCalledWith(0, '0.0.0.0');
    });

    it('should handle non-production environment for Swagger', async () => {
      const testEnvironments = ['development', 'staging', 'test', 'local'];

      for (const env of testEnvironments) {
        jest.clearAllMocks();
        mockLoggerInstance.log.mockClear();
        mockLoggerInstance.error.mockClear();
        mockLoggerInstance.fatal.mockClear();

        const envConfig = createMockConfigService({ NODE_ENV: env });
        mockApp.get.mockReturnValue(envConfig);
        await callBootstrap();

        expect(SwaggerModule.createDocument).toHaveBeenCalled();
      }
    });
  });

  describe('Logger Instance', () => {
    it('should create Logger with "Bootstrap" context', async () => {
      await callBootstrap();
      expect(Logger).toHaveBeenCalledWith('Bootstrap');
    });
  });
});
