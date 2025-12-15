import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../database/prisma.service';
import { HealthController } from '../health.controller';

// Mock PrismaService
const mockPrismaService = {
  healthCheck: jest.fn(),
};

// Helper to create mock ConfigService
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createMockConfigService = (config: Record<string, any> = {}) => ({
  get: jest.fn((key: string, defaultValue?: any) => {
    const defaultConfig: Record<string, any> = {
      API_VERSION: 'v1',
      NODE_ENV: 'development',
      ...config,
    };
    return defaultConfig[key] !== undefined ? defaultConfig[key] : defaultValue;
  }),
});

// Mock process.uptime
const originalProcessUptime = process.uptime;

describe('HealthController (RED PHASE)', () => {
  let controller: HealthController;
  let prismaService: jest.Mocked<PrismaService>;
  let configService: jest.Mocked<ConfigService>;
  let mockProcessUptime: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Mock process.uptime
    mockProcessUptime = jest.fn();
    process.uptime = mockProcessUptime;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: createMockConfigService(),
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    prismaService = module.get(PrismaService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    // Restore original process.uptime
    process.uptime = originalProcessUptime;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('constructor and initialization', () => {
    it('should create HealthController instance', () => {
      expect(controller).toBeDefined();
      expect(controller.healthCheck).toBeDefined();
      expect(controller.constructor.name).toBe('HealthController');
    });

    it('should inject PrismaService dependency', () => {
      expect(controller['prismaService']).toBeDefined();
      expect(controller['prismaService']).toBe(prismaService);
    });

    it('should inject ConfigService dependency', () => {
      expect(controller['configService']).toBeDefined();
      expect(controller['configService']).toBe(configService);
    });
  });

  describe('healthCheck() - Success Scenarios', () => {
    it('should return health check response with status "ok" when database is connected', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(123.456);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result.status).toBe('ok');
      expect(result.database.connected).toBe(true);
    });

    it('should call prismaService.healthCheck() to verify database connectivity', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(100);

      // Act
      await controller.healthCheck();

      // Assert
      expect(prismaService.healthCheck).toHaveBeenCalledTimes(1);
      expect(prismaService.healthCheck).toHaveBeenCalledWith();
    });

    it('should return current timestamp in ISO format', async () => {
      // Arrange
      const fixedDate = new Date('2024-01-15T10:30:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => fixedDate as any);
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result.timestamp).toBe('2024-01-15T10:30:00.000Z');
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

      // Cleanup
      jest.restoreAllMocks();
    });

    it('should return API version from ConfigService', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn((key: string, defaultValue?: any) => {
        if (key === 'API_VERSION') return 'v2';
        return defaultValue || 'development';
      });
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(configService.get).toHaveBeenCalledWith('API_VERSION', 'v1');
      expect(result.version).toBe('v2');
    });

    it('should use default version "v1" when ConfigService returns undefined', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      configService.get.mockReturnValue(undefined);
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result.version).toBe('v1');
    });

    it('should return environment from ConfigService', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn((key: string, defaultValue?: any) => {
        if (key === 'NODE_ENV') return 'production';
        return defaultValue || 'v1';
      });
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(configService.get).toHaveBeenCalledWith('NODE_ENV', 'development');
      expect(result.environment).toBe('production');
    });

    it('should use default environment "development" when ConfigService returns undefined', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      configService.get.mockReturnValue(undefined);
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result.environment).toBe('development');
    });

    it('should return database connection status as connected true when healthy', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result.database).toBeDefined();
      expect(result.database.connected).toBe(true);
    });

    it('should return process uptime in seconds', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(456.789);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(mockProcessUptime).toHaveBeenCalledTimes(1);
      expect(result.uptime).toBe(456.789);
    });

    it('should return complete health check response structure with all fields', async () => {
      // Arrange
      const fixedDate = new Date('2024-01-15T10:30:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => fixedDate as any);
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn((key: string, defaultValue?: any) => {
        if (key === 'API_VERSION') return 'v2';
        if (key === 'NODE_ENV') return 'staging';
        return defaultValue;
      });
      mockProcessUptime.mockReturnValue(999.123);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result).toEqual({
        status: 'ok',
        timestamp: '2024-01-15T10:30:00.000Z',
        version: 'v2',
        environment: 'staging',
        database: {
          connected: true,
        },
        uptime: 999.123,
      });

      // Cleanup
      jest.restoreAllMocks();
    });
  });

  describe('healthCheck() - Failure Scenarios', () => {
    it('should return status "error" when database is unhealthy', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(false);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result.status).toBe('error');
    });

    it('should return database connected false when healthCheck returns false', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(false);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result.database.connected).toBe(false);
    });

    it('should return complete error response when database fails', async () => {
      // Arrange
      const fixedDate = new Date('2024-01-15T10:30:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => fixedDate as any);
      prismaService.healthCheck.mockResolvedValue(false);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(200.5);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result).toEqual({
        status: 'error',
        timestamp: '2024-01-15T10:30:00.000Z',
        version: 'v1',
        environment: 'development',
        database: {
          connected: false,
        },
        uptime: 200.5,
      });

      // Cleanup
      jest.restoreAllMocks();
    });

    it('should still return timestamp even when database fails', async () => {
      // Arrange
      const fixedDate = new Date('2024-01-15T10:30:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => fixedDate as any);
      prismaService.healthCheck.mockResolvedValue(false);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result.timestamp).toBe('2024-01-15T10:30:00.000Z');

      // Cleanup
      jest.restoreAllMocks();
    });

    it('should still return version and environment when database fails', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(false);
      (configService.get as jest.Mock) = jest.fn((key: string, defaultValue?: any) => {
        if (key === 'API_VERSION') return 'v3';
        if (key === 'NODE_ENV') return 'test';
        return defaultValue;
      });
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result.version).toBe('v3');
      expect(result.environment).toBe('test');
    });

    it('should still return uptime when database fails', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(false);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(555.777);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result.uptime).toBe(555.777);
    });
  });

  describe('healthCheck() - Configuration Edge Cases', () => {
    it('should handle ConfigService returning null for API_VERSION', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn((key: string, defaultValue?: any) => {
        if (key === 'API_VERSION') return null as any;
        return defaultValue;
      });
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result.version).toBe('v1');
    });

    it('should handle ConfigService returning null for NODE_ENV', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn((key: string, defaultValue?: any) => {
        if (key === 'NODE_ENV') return null as any;
        return defaultValue;
      });
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result.environment).toBe('development');
    });

    it('should handle ConfigService returning empty string for API_VERSION', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn((key: string, defaultValue?: any) => {
        if (key === 'API_VERSION') return '';
        return defaultValue;
      });
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result.version).toBe('v1');
    });

    it('should handle ConfigService returning empty string for NODE_ENV', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn((key: string, defaultValue?: any) => {
        if (key === 'NODE_ENV') return '';
        return defaultValue;
      });
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result.environment).toBe('development');
    });

    it('should use custom version when provided by ConfigService', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn((key: string, defaultValue?: any) => {
        if (key === 'API_VERSION') return 'v10.5.2';
        return defaultValue || 'development';
      });
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result.version).toBe('v10.5.2');
    });

    it('should use custom environment when provided by ConfigService', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn((key: string, defaultValue?: any) => {
        if (key === 'NODE_ENV') return 'production';
        return defaultValue || 'v1';
      });
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result.environment).toBe('production');
    });
  });

  describe('healthCheck() - Uptime Edge Cases', () => {
    it('should handle zero uptime', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(0);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result.uptime).toBe(0);
    });

    it('should handle very small uptime values', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(0.001);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result.uptime).toBe(0.001);
    });

    it('should handle large uptime values', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(999999999.999);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result.uptime).toBe(999999999.999);
    });

    it('should handle decimal uptime precision', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(123.456789);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result.uptime).toBe(123.456789);
    });
  });

  describe('healthCheck() - Response Structure Validation', () => {
    it('should have all required fields in response', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('database');
      expect(result).toHaveProperty('uptime');
    });

    it('should have database object with connected property', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result.database).toHaveProperty('connected');
      expect(typeof result.database.connected).toBe('boolean');
    });

    it('should have status field as "ok" or "error" string', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(typeof result.status).toBe('string');
      expect(['ok', 'error']).toContain(result.status);
    });

    it('should have timestamp as ISO 8601 string', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(typeof result.timestamp).toBe('string');
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });

    it('should have version as string', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(typeof result.version).toBe('string');
    });

    it('should have environment as string', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(typeof result.environment).toBe('string');
    });

    it('should have uptime as number', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(100.5);

      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(typeof result.uptime).toBe('number');
    });

    it('should not have any extra fields beyond the contract', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(100);

      // Act
      const result = await controller.healthCheck();

      // Assert
      const expectedKeys = ['status', 'timestamp', 'version', 'environment', 'database', 'uptime'];
      expect(Object.keys(result).sort()).toEqual(expectedKeys.sort());
    });
  });

  describe('healthCheck() - Concurrent Requests', () => {
    it('should handle multiple concurrent health check requests', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(100);

      // Act
      const results = await Promise.all([
        controller.healthCheck(),
        controller.healthCheck(),
        controller.healthCheck(),
      ]);

      // Assert
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.status).toBe('ok');
        expect(result.database.connected).toBe(true);
      });
      expect(prismaService.healthCheck).toHaveBeenCalledTimes(3);
    });

    it('should return independent timestamps for concurrent requests', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(100);

      // Act
      const results = await Promise.all([
        controller.healthCheck(),
        controller.healthCheck(),
        controller.healthCheck(),
      ]);

      // Assert
      results.forEach(result => {
        expect(result.timestamp).toBeDefined();
        expect(typeof result.timestamp).toBe('string');
      });
    });
  });

  describe('healthCheck() - Integration with Dependencies', () => {
    it('should call ConfigService.get with correct parameters for version', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(100);

      // Act
      await controller.healthCheck();

      // Assert
      expect(configService.get).toHaveBeenCalledWith('API_VERSION', 'v1');
    });

    it('should call ConfigService.get with correct parameters for environment', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(100);

      // Act
      await controller.healthCheck();

      // Assert
      expect(configService.get).toHaveBeenCalledWith('NODE_ENV', 'development');
    });

    it('should call ConfigService.get exactly twice per health check', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(100);

      // Act
      await controller.healthCheck();

      // Assert
      expect(configService.get).toHaveBeenCalledTimes(2);
    });

    it('should call process.uptime exactly once per health check', async () => {
      // Arrange
      prismaService.healthCheck.mockResolvedValue(true);
      (configService.get as jest.Mock) = jest.fn(
        (_key: string, defaultValue?: any) => defaultValue
      );
      mockProcessUptime.mockReturnValue(100);

      // Act
      await controller.healthCheck();

      // Assert
      expect(mockProcessUptime).toHaveBeenCalledTimes(1);
      expect(mockProcessUptime).toHaveBeenCalledWith();
    });
  });

  describe('healthCheck() - Different Environment Scenarios', () => {
    const environments = ['development', 'staging', 'production', 'test'];
    const versions = ['v1', 'v2', 'v3', 'v1.0.0', 'v2.5.1'];

    environments.forEach(env => {
      it(`should work correctly in ${env} environment`, async () => {
        // Arrange
        prismaService.healthCheck.mockResolvedValue(true);
        (configService.get as jest.Mock) = jest.fn((key: string, defaultValue?: any) => {
          if (key === 'NODE_ENV') return env;
          return defaultValue || 'v1';
        });
        mockProcessUptime.mockReturnValue(100);

        // Act
        const result = await controller.healthCheck();

        // Assert
        expect(result.environment).toBe(env);
        expect(result.status).toBe('ok');
      });
    });

    versions.forEach(version => {
      it(`should work correctly with version ${version}`, async () => {
        // Arrange
        prismaService.healthCheck.mockResolvedValue(true);
        (configService.get as jest.Mock) = jest.fn((key: string, defaultValue?: any) => {
          if (key === 'API_VERSION') return version;
          return defaultValue || 'development';
        });
        mockProcessUptime.mockReturnValue(100);

        // Act
        const result = await controller.healthCheck();

        // Assert
        expect(result.version).toBe(version);
        expect(result.status).toBe('ok');
      });
    });
  });
});
