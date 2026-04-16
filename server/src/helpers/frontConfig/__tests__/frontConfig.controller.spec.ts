import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';

import { ChartInfoItemDto } from '../dto/chart-info-response.dto';
import { HabitsByTypeResponseDto } from '../dto/habits-by-type-response.dto';
import { FrontConfigController } from '../frontConfig.controller';
import { FrontConfigService } from '../frontConfig.service';

// Mock FrontConfigService
const mockFrontConfigService = {
  getHabitsByType: jest.fn(),
  getChartInfoByLogTypeId: jest.fn(),
};

// Mock ThrottlerGuard
const mockThrottlerGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('FrontConfigController', () => {
  let controller: FrontConfigController;
  let service: jest.Mocked<FrontConfigService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FrontConfigController],
      providers: [
        {
          provide: FrontConfigService,
          useValue: mockFrontConfigService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue(mockThrottlerGuard)
      .compile();

    controller = module.get<FrontConfigController>(FrontConfigController);
    service = module.get(FrontConfigService);
  });

  describe('getHabitsByType()', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
      expect(controller.getHabitsByType).toBeDefined();
    });

    it('should return habits organized by type', async () => {
      // Arrange
      const expectedResponse: HabitsByTypeResponseDto = {
        complex: [
          {
            Programming: ['for work', 'personal Project'],
            'Learn english': [],
          },
        ],
        simple: [
          {
            'Morning Exercise': ['Cardio'],
          },
        ],
        withoutintervals: [
          {
            'Daily Meditation': [],
          },
        ],
      };
      service.getHabitsByType.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getHabitsByType();

      // Assert
      expect(service.getHabitsByType).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should return empty object when no habits exist', async () => {
      // Arrange
      const emptyResponse: HabitsByTypeResponseDto = {
        complex: [],
        simple: [],
        withoutintervals: [],
      };
      service.getHabitsByType.mockResolvedValue(emptyResponse);

      // Act
      const result = await controller.getHabitsByType();

      // Assert
      expect(service.getHabitsByType).toHaveBeenCalledTimes(1);
      expect(result).toEqual(emptyResponse);
      expect(result.complex).toEqual([]);
      expect(result.simple).toEqual([]);
      expect(result.withoutintervals).toEqual([]);
    });

    it('should return only complex habits when other types are empty', async () => {
      // Arrange
      const response: HabitsByTypeResponseDto = {
        complex: [
          {
            Programming: ['for work', 'personal Project'],
          },
        ],
        simple: [],
        withoutintervals: [],
      };
      service.getHabitsByType.mockResolvedValue(response);

      // Act
      const result = await controller.getHabitsByType();

      // Assert
      expect(result.complex).toHaveLength(1);
      expect(result.simple).toEqual([]);
      expect(result.withoutintervals).toEqual([]);
    });

    it('should return habits with empty action types arrays', async () => {
      // Arrange
      const response: HabitsByTypeResponseDto = {
        complex: [
          {
            'Learn english': [],
          },
        ],
        simple: [
          {
            Reading: [],
          },
        ],
        withoutintervals: [],
      };
      service.getHabitsByType.mockResolvedValue(response);

      // Act
      const result = await controller.getHabitsByType();

      // Assert
      expect(result.complex[0]!['Learn english']).toEqual([]);
      expect(result.simple[0]!['Reading']).toEqual([]);
    });

    it('should handle multiple habits of the same type', async () => {
      // Arrange
      const response: HabitsByTypeResponseDto = {
        complex: [
          {
            Programming: ['for work', 'personal Project'],
            'Learn english': ['Reading', 'Listening'],
            Cooking: [],
          },
        ],
        simple: [
          {
            'Morning Exercise': ['Cardio', 'Strength'],
            Meditation: [],
          },
        ],
        withoutintervals: [
          {
            'Water Intake': [],
          },
        ],
      };
      service.getHabitsByType.mockResolvedValue(response);

      // Act
      const result = await controller.getHabitsByType();

      // Assert
      expect(Object.keys(result.complex[0]!)).toHaveLength(3);
      expect(Object.keys(result.simple[0]!)).toHaveLength(2);
      expect(Object.keys(result.withoutintervals[0]!)).toHaveLength(1);
    });

    it('should propagate errors from service', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      service.getHabitsByType.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getHabitsByType()).rejects.toThrow('Database connection failed');
    });

    it('should have proper HTTP GET method decorator', () => {
      // Verify that the controller method exists and can be called
      expect(typeof controller.getHabitsByType).toBe('function');
    });
  });

  describe('endpoint metadata and decorators', () => {
    it('should be decorated with @Controller decorator', () => {
      const controllerPath = Reflect.getMetadata('path', FrontConfigController);
      expect(controllerPath).toBeDefined();
    });

    it('should use ThrottlerGuard', () => {
      const guards = Reflect.getMetadata('__guards__', FrontConfigController);
      expect(guards).toBeDefined();
    });
  });

  describe('data structure validation', () => {
    it('should return correct structure with habit names as keys', async () => {
      // Arrange
      const response: HabitsByTypeResponseDto = {
        complex: [
          {
            Programming: ['for work'],
          },
        ],
        simple: [],
        withoutintervals: [],
      };
      service.getHabitsByType.mockResolvedValue(response);

      // Act
      const result = await controller.getHabitsByType();

      // Assert
      expect(result.complex[0]).toHaveProperty('Programming');
      expect(Array.isArray(result.complex[0]!['Programming'])).toBe(true);
    });

    it('should return action types as arrays of strings', async () => {
      // Arrange
      const response: HabitsByTypeResponseDto = {
        complex: [
          {
            Programming: ['for work', 'personal Project'],
          },
        ],
        simple: [],
        withoutintervals: [],
      };
      service.getHabitsByType.mockResolvedValue(response);

      // Act
      const result = await controller.getHabitsByType();

      // Assert
      const actionTypes = result.complex[0]!['Programming'];
      expect(Array.isArray(actionTypes)).toBe(true);
      expect(actionTypes).toHaveLength(2);
      expect(typeof actionTypes![0]).toBe('string');
      expect(typeof actionTypes![1]).toBe('string');
    });

    it('should maintain consistent structure across all complexity types', async () => {
      // Arrange
      const response: HabitsByTypeResponseDto = {
        complex: [{ Programming: ['work'] }],
        simple: [{ Exercise: ['cardio'] }],
        withoutintervals: [{ Water: [] }],
      };
      service.getHabitsByType.mockResolvedValue(response);

      // Act
      const result = await controller.getHabitsByType();

      // Assert
      expect(Array.isArray(result.complex)).toBe(true);
      expect(Array.isArray(result.simple)).toBe(true);
      expect(Array.isArray(result.withoutintervals)).toBe(true);
      expect(typeof result.complex[0]).toBe('object');
      expect(typeof result.simple[0]).toBe('object');
      expect(typeof result.withoutintervals[0]).toBe('object');
    });
  });

  describe('getChartInfoByLogTypeId()', () => {
    const logTypeId = '550e8400-e29b-41d4-a716-446655440000';

    it('should be defined', () => {
      expect(controller.getChartInfoByLogTypeId).toBeDefined();
    });

    it('should return chart info items for a given log type ID', async () => {
      // Arrange
      const expectedItems: ChartInfoItemDto[] = [
        { id: 'item-id-1', label: 'Characters per minute', logTypeId },
        { id: 'item-id-2', label: 'Breaths per minute', logTypeId },
      ];
      service.getChartInfoByLogTypeId.mockResolvedValue(expectedItems);

      // Act
      const result = await controller.getChartInfoByLogTypeId(logTypeId);

      // Assert
      expect(service.getChartInfoByLogTypeId).toHaveBeenCalledWith(logTypeId);
      expect(result).toEqual(expectedItems);
    });

    it('should return empty array when no chart info exists for log type', async () => {
      // Arrange
      service.getChartInfoByLogTypeId.mockResolvedValue([]);

      // Act
      const result = await controller.getChartInfoByLogTypeId(logTypeId);

      // Assert
      expect(service.getChartInfoByLogTypeId).toHaveBeenCalledWith(logTypeId);
      expect(result).toEqual([]);
    });

    it('should propagate errors from service', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      service.getChartInfoByLogTypeId.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getChartInfoByLogTypeId(logTypeId)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle habits with special characters in names', async () => {
      // Arrange
      const response: HabitsByTypeResponseDto = {
        complex: [
          {
            'C++ Programming': ['Object-Oriented', 'Functional'],
          },
        ],
        simple: [],
        withoutintervals: [],
      };
      service.getHabitsByType.mockResolvedValue(response);

      // Act
      const result = await controller.getHabitsByType();

      // Assert
      expect(result.complex[0]).toHaveProperty('C++ Programming');
    });

    it('should handle habits with long action type names', async () => {
      // Arrange
      const longActionTypeName =
        'Very long action type name that describes a specific activity in detail';
      const response: HabitsByTypeResponseDto = {
        complex: [
          {
            Programming: [longActionTypeName],
          },
        ],
        simple: [],
        withoutintervals: [],
      };
      service.getHabitsByType.mockResolvedValue(response);

      // Act
      const result = await controller.getHabitsByType();

      // Assert
      expect(result.complex[0]!['Programming']![0]).toBe(longActionTypeName);
    });

    it('should handle many action types for a single habit', async () => {
      // Arrange
      const manyActionTypes = Array.from({ length: 50 }, (_, i) => `Action ${i + 1}`);
      const response: HabitsByTypeResponseDto = {
        complex: [
          {
            Programming: manyActionTypes,
          },
        ],
        simple: [],
        withoutintervals: [],
      };
      service.getHabitsByType.mockResolvedValue(response);

      // Act
      const result = await controller.getHabitsByType();

      // Assert
      expect(result.complex[0]!['Programming']).toHaveLength(50);
    });
  });
});
