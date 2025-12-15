import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { IActionTypesRepository } from '../../../action-types/interfaces/action-types-repository.interface';
import { ActionType } from '../../../domain/entities/action-type.entity';
import { GlobalEntityIdentifier } from '../../../domain/entities/global-entity-identifier.entity';
import { Habit } from '../../../domain/entities/habit.entity';
import { HabitComplexity, UUID } from '../../../domain/shared/types/common';
import { IdentifierIcon } from '../../../domain/value-objects/identifier-icon';
import { IdentifierName } from '../../../domain/value-objects/identifier-name';
import { IHabitsRepository } from '../../../habits/interfaces/habits-repository.interface';
import { FrontConfigService } from '../frontConfig.service';

// Mock implementations
const mockHabitsRepository = {
  findAll: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByName: jest.fn(),
};

const mockActionTypesRepository = {
  findByHabitId: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByNameAndHabitId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findMostActive: jest.fn(),
  findRecentlyActive: jest.fn(),
  count: jest.fn(),
  countByHabitId: jest.fn(),
  existsByNameAndHabitId: jest.fn(),
  bulkUpdateActionCounts: jest.fn(),
  findInactive: jest.fn(),
  getStatsByHabitId: jest.fn(),
};

describe('FrontConfigService', () => {
  let service: FrontConfigService;
  let habitsRepository: jest.Mocked<IHabitsRepository>;
  let actionTypesRepository: jest.Mocked<IActionTypesRepository>;

  // Test data fixtures
  const fixedDate = new Date('2024-01-01T00:00:00.000Z');

  // Helper to create mock GlobalEntityIdentifier
  const createMockGlobalIdentifier = (
    id: UUID,
    name: string,
    icon: string,
    entityType: string,
    entityId: UUID
  ): GlobalEntityIdentifier => {
    return new GlobalEntityIdentifier(
      id,
      IdentifierName.create(name),
      IdentifierIcon.create(icon),
      entityType,
      entityId
    );
  };

  // Helper to create mock Habit
  const createMockHabit = (
    id: UUID,
    name: string,
    habitType: HabitComplexity,
    icon: string = 'https://example.com/icon.png'
  ): Habit => {
    const globalIdentifier = createMockGlobalIdentifier(`global-${id}`, name, icon, 'habit', id);

    return new Habit(id, habitType, fixedDate, fixedDate, true, 0, null, globalIdentifier);
  };

  // Helper to create mock ActionType
  const createMockActionType = (
    id: UUID,
    habitId: UUID,
    name: string,
    icon: string = 'https://example.com/action-icon.png'
  ): ActionType => {
    const globalIdentifier = createMockGlobalIdentifier(
      `global-action-${id}`,
      name,
      icon,
      'action_type',
      id
    );

    return new ActionType(id, habitId, fixedDate, fixedDate, 0, null, globalIdentifier);
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FrontConfigService,
        {
          provide: 'IHabitsRepository',
          useValue: mockHabitsRepository,
        },
        {
          provide: 'IActionTypesRepository',
          useValue: mockActionTypesRepository,
        },
      ],
    }).compile();

    service = module.get<FrontConfigService>(FrontConfigService);
    habitsRepository = module.get('IHabitsRepository');
    actionTypesRepository = module.get('IActionTypesRepository');
  });

  describe('getHabitsByType()', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
      expect(service.getHabitsByType).toBeDefined();
    });

    it('should return empty arrays when no habits exist', async () => {
      // Arrange
      habitsRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
      });

      // Act
      const result = await service.getHabitsByType();

      // Assert
      expect(habitsRepository.findAll).toHaveBeenCalledWith(
        { page: 1, limit: 100 },
        { isActive: true }
      );
      expect(result).toEqual({
        complex: [],
        simple: [],
        withoutintervals: [],
      });
    });

    it('should group habits by habitType correctly', async () => {
      // Arrange
      const complexHabit = createMockHabit('habit-1', 'Programming', HabitComplexity.COMPLEX);
      const simpleHabit = createMockHabit('habit-2', 'Morning Exercise', HabitComplexity.SIMPLE);
      const withoutIntervalsHabit = createMockHabit(
        'habit-3',
        'Daily Meditation',
        HabitComplexity.WITHOUT_INTERVALS
      );

      habitsRepository.findAll.mockResolvedValue({
        data: [complexHabit, simpleHabit, withoutIntervalsHabit],
        total: 3,
        page: 1,
        limit: 100,
        totalPages: 1,
      });

      actionTypesRepository.findByHabitId.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
      });

      // Act
      const result = await service.getHabitsByType();

      // Assert
      expect(result.complex).toHaveLength(1);
      expect(result.simple).toHaveLength(1);
      expect(result.withoutintervals).toHaveLength(1);
    });

    it('should include action types for complex habits', async () => {
      // Arrange
      const complexHabit = createMockHabit('habit-1', 'Programming', HabitComplexity.COMPLEX);

      const actionType1 = createMockActionType('action-1', 'habit-1', 'for work');
      const actionType2 = createMockActionType('action-2', 'habit-1', 'personal Project');

      habitsRepository.findAll.mockResolvedValue({
        data: [complexHabit],
        total: 1,
        page: 1,
        limit: 100,
        totalPages: 1,
      });

      actionTypesRepository.findByHabitId.mockResolvedValue({
        data: [actionType1, actionType2],
        total: 2,
        page: 1,
        limit: 100,
        totalPages: 1,
      });

      // Act
      const result = await service.getHabitsByType();

      // Assert
      expect(result.complex).toHaveLength(1);
      expect(result.complex[0]!['Programming']).toEqual(['for work', 'personal Project']);
    });

    it('should include empty action types array for habits without action types', async () => {
      // Arrange
      const complexHabit = createMockHabit('habit-1', 'Learn english', HabitComplexity.COMPLEX);

      habitsRepository.findAll.mockResolvedValue({
        data: [complexHabit],
        total: 1,
        page: 1,
        limit: 100,
        totalPages: 1,
      });

      actionTypesRepository.findByHabitId.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
      });

      // Act
      const result = await service.getHabitsByType();

      // Assert
      expect(result.complex).toHaveLength(1);
      expect(result.complex[0]!['Learn english']).toEqual([]);
    });

    it('should fetch action types for each habit separately', async () => {
      // Arrange
      const habit1 = createMockHabit('habit-1', 'Programming', HabitComplexity.COMPLEX);
      const habit2 = createMockHabit('habit-2', 'Exercise', HabitComplexity.SIMPLE);

      habitsRepository.findAll.mockResolvedValue({
        data: [habit1, habit2],
        total: 2,
        page: 1,
        limit: 100,
        totalPages: 1,
      });

      actionTypesRepository.findByHabitId.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
      });

      // Act
      await service.getHabitsByType();

      // Assert
      expect(actionTypesRepository.findByHabitId).toHaveBeenCalledTimes(2);
      expect(actionTypesRepository.findByHabitId).toHaveBeenCalledWith(
        'habit-1',
        { page: 1, limit: 100 },
        { isActive: true }
      );
      expect(actionTypesRepository.findByHabitId).toHaveBeenCalledWith(
        'habit-2',
        { page: 1, limit: 100 },
        { isActive: true }
      );
    });

    it('should handle multiple complex habits with different action types', async () => {
      // Arrange
      const habit1 = createMockHabit('habit-1', 'Programming', HabitComplexity.COMPLEX);
      const habit2 = createMockHabit('habit-2', 'Learn english', HabitComplexity.COMPLEX);

      const actionType1 = createMockActionType('action-1', 'habit-1', 'for work');
      const actionType2 = createMockActionType('action-2', 'habit-1', 'personal Project');
      const actionType3 = createMockActionType('action-3', 'habit-2', 'Reading');
      const actionType4 = createMockActionType('action-4', 'habit-2', 'Listening');

      habitsRepository.findAll.mockResolvedValue({
        data: [habit1, habit2],
        total: 2,
        page: 1,
        limit: 100,
        totalPages: 1,
      });

      actionTypesRepository.findByHabitId
        .mockResolvedValueOnce({
          data: [actionType1, actionType2],
          total: 2,
          page: 1,
          limit: 100,
          totalPages: 1,
        })
        .mockResolvedValueOnce({
          data: [actionType3, actionType4],
          total: 2,
          page: 1,
          limit: 100,
          totalPages: 1,
        });

      // Act
      const result = await service.getHabitsByType();

      // Assert
      expect(result.complex).toHaveLength(1);
      expect(result.complex[0]!['Programming']).toEqual(['for work', 'personal Project']);
      expect(result.complex[0]!['Learn english']).toEqual(['Reading', 'Listening']);
    });

    it('should only fetch active habits', async () => {
      // Arrange
      habitsRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
      });

      // Act
      await service.getHabitsByType();

      // Assert
      expect(habitsRepository.findAll).toHaveBeenCalledWith(
        { page: 1, limit: 100 },
        { isActive: true }
      );
    });

    it('should only fetch active action types', async () => {
      // Arrange
      const complexHabit = createMockHabit('habit-1', 'Programming', HabitComplexity.COMPLEX);

      habitsRepository.findAll.mockResolvedValue({
        data: [complexHabit],
        total: 1,
        page: 1,
        limit: 100,
        totalPages: 1,
      });

      actionTypesRepository.findByHabitId.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
      });

      // Act
      await service.getHabitsByType();

      // Assert
      expect(actionTypesRepository.findByHabitId).toHaveBeenCalledWith(
        'habit-1',
        { page: 1, limit: 100 },
        { isActive: true }
      );
    });

    it('should return correct structure with all three complexity types', async () => {
      // Arrange
      const habits = [
        createMockHabit('habit-1', 'Programming', HabitComplexity.COMPLEX),
        createMockHabit('habit-2', 'Cooking', HabitComplexity.COMPLEX),
        createMockHabit('habit-3', 'Exercise', HabitComplexity.SIMPLE),
        createMockHabit('habit-4', 'Reading', HabitComplexity.SIMPLE),
        createMockHabit('habit-5', 'Water', HabitComplexity.WITHOUT_INTERVALS),
      ];

      habitsRepository.findAll.mockResolvedValue({
        data: habits,
        total: 5,
        page: 1,
        limit: 100,
        totalPages: 1,
      });

      actionTypesRepository.findByHabitId.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
      });

      // Act
      const result = await service.getHabitsByType();

      // Assert
      expect(result.complex).toHaveLength(1);
      expect(Object.keys(result.complex[0]!)).toHaveLength(2);
      expect(result.simple).toHaveLength(1);
      expect(Object.keys(result.simple[0]!)).toHaveLength(2);
      expect(result.withoutintervals).toHaveLength(1);
      expect(Object.keys(result.withoutintervals[0]!)).toHaveLength(1);
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      habitsRepository.findAll.mockRejectedValue(error);

      // Act & Assert
      await expect(service.getHabitsByType()).rejects.toThrow('Database connection failed');
    });

    it('should handle action types repository errors', async () => {
      // Arrange
      const complexHabit = createMockHabit('habit-1', 'Programming', HabitComplexity.COMPLEX);

      habitsRepository.findAll.mockResolvedValue({
        data: [complexHabit],
        total: 1,
        page: 1,
        limit: 100,
        totalPages: 1,
      });

      const error = new Error('Failed to fetch action types');
      actionTypesRepository.findByHabitId.mockRejectedValue(error);

      // Act & Assert
      await expect(service.getHabitsByType()).rejects.toThrow('Failed to fetch action types');
    });

    it('should use correct pagination parameters for fetching all habits', async () => {
      // Arrange
      habitsRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
      });

      // Act
      await service.getHabitsByType();

      // Assert
      expect(habitsRepository.findAll).toHaveBeenCalledWith(
        { page: 1, limit: 100 },
        expect.any(Object)
      );
    });

    it('should map habit names correctly from GlobalEntityIdentifier', async () => {
      // Arrange
      const habit = createMockHabit('habit-1', 'My Custom Habit', HabitComplexity.SIMPLE);

      habitsRepository.findAll.mockResolvedValue({
        data: [habit],
        total: 1,
        page: 1,
        limit: 100,
        totalPages: 1,
      });

      actionTypesRepository.findByHabitId.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
      });

      // Act
      const result = await service.getHabitsByType();

      // Assert
      expect(result.simple[0]).toHaveProperty('My Custom Habit');
    });

    it('should map action type names correctly from GlobalEntityIdentifier', async () => {
      // Arrange
      const habit = createMockHabit('habit-1', 'Programming', HabitComplexity.COMPLEX);
      const actionType = createMockActionType('action-1', 'habit-1', 'Custom Action Name');

      habitsRepository.findAll.mockResolvedValue({
        data: [habit],
        total: 1,
        page: 1,
        limit: 100,
        totalPages: 1,
      });

      actionTypesRepository.findByHabitId.mockResolvedValue({
        data: [actionType],
        total: 1,
        page: 1,
        limit: 100,
        totalPages: 1,
      });

      // Act
      const result = await service.getHabitsByType();

      // Assert
      expect(result.complex[0]!['Programming']).toContain('Custom Action Name');
    });
  });

  describe('edge cases', () => {
    it('should handle habits with special characters in names', async () => {
      // Arrange
      const habit = createMockHabit('habit-1', 'C++ Programming', HabitComplexity.COMPLEX);

      habitsRepository.findAll.mockResolvedValue({
        data: [habit],
        total: 1,
        page: 1,
        limit: 100,
        totalPages: 1,
      });

      actionTypesRepository.findByHabitId.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
      });

      // Act
      const result = await service.getHabitsByType();

      // Assert
      expect(result.complex[0]).toHaveProperty('C++ Programming');
    });

    it('should handle action types with special characters', async () => {
      // Arrange
      const habit = createMockHabit('habit-1', 'Programming', HabitComplexity.COMPLEX);
      const actionType = createMockActionType('action-1', 'habit-1', 'C# & .NET');

      habitsRepository.findAll.mockResolvedValue({
        data: [habit],
        total: 1,
        page: 1,
        limit: 100,
        totalPages: 1,
      });

      actionTypesRepository.findByHabitId.mockResolvedValue({
        data: [actionType],
        total: 1,
        page: 1,
        limit: 100,
        totalPages: 1,
      });

      // Act
      const result = await service.getHabitsByType();

      // Assert
      expect(result.complex[0]!['Programming']).toContain('C# & .NET');
    });

    it('should handle large number of habits', async () => {
      // Arrange
      const manyHabits = Array.from({ length: 100 }, (_, i) =>
        createMockHabit(`habit-${i}`, `Habit ${i}`, HabitComplexity.SIMPLE)
      );

      habitsRepository.findAll.mockResolvedValue({
        data: manyHabits,
        total: 100,
        page: 1,
        limit: 100,
        totalPages: 1,
      });

      actionTypesRepository.findByHabitId.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
      });

      // Act
      const result = await service.getHabitsByType();

      // Assert
      expect(result.simple).toHaveLength(1);
      expect(Object.keys(result.simple[0]!)).toHaveLength(100);
    });

    it('should handle large number of action types for a single habit', async () => {
      // Arrange
      const habit = createMockHabit('habit-1', 'Programming', HabitComplexity.COMPLEX);
      const manyActionTypes = Array.from({ length: 50 }, (_, i) =>
        createMockActionType(`action-${i}`, 'habit-1', `Action ${i}`)
      );

      habitsRepository.findAll.mockResolvedValue({
        data: [habit],
        total: 1,
        page: 1,
        limit: 100,
        totalPages: 1,
      });

      actionTypesRepository.findByHabitId.mockResolvedValue({
        data: manyActionTypes,
        total: 50,
        page: 1,
        limit: 100,
        totalPages: 1,
      });

      // Act
      const result = await service.getHabitsByType();

      // Assert
      expect(result.complex[0]!['Programming']).toHaveLength(50);
    });
  });

  describe('logging', () => {
    it('should log when fetching habits by type', async () => {
      // Arrange
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      habitsRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
      });

      // Act
      await service.getHabitsByType();

      // Assert - Verify logger was used (implementation will add logging)
      // This test will fail initially until logging is implemented
      expect(loggerSpy).toHaveBeenCalled();
      loggerSpy.mockRestore();
    });
  });
});
