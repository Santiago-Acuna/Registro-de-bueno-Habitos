import { Test, TestingModule } from '@nestjs/testing';

import { ActionType } from '../../../domain/entities/action-type.entity';
import { UUID, PaginationParams } from '../../../domain/shared/types/common';
import { ActionTypeName } from '../../../domain/value-objects/action-type-name';
import { DatabaseService } from '../../../infrastructure/database/database.service';
import { NotFoundError, ConflictError } from '../../../infrastructure/exceptions/app.exceptions';
import {
  CreateActionTypeData,
  UpdateActionTypeData,
  ActionTypeFilterOptions,
  ActionTypeStats,
} from '../../interfaces/action-types-repository.interface';
import { ActionTypesRepository } from '../action-types.repository';

// Mock Prisma client
const mockPrismaClient = {
  actionTypes: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    updateMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockDatabaseService = {
  getClient: jest.fn(() => mockPrismaClient),
};

describe('ActionTypesRepository (RED PHASE)', () => {
  let repository: ActionTypesRepository;
  let databaseService: jest.Mocked<DatabaseService>;

  // Test data fixtures
  const mockActionTypeId: UUID = '123e4567-e89b-12d3-a456-426614174000';
  const mockHabitId: UUID = '987fcdeb-51a2-43d1-9876-543210987654';
  const mockActionTypeName = 'Morning Push-ups';
  const mockLogo = 'https://example.com/pushups-logo.png';
  const fixedDate = new Date('2024-01-01T00:00:00.000Z');
  const lastActionDate = new Date('2024-01-01T12:00:00.000Z');

  const createMockPrismaActionType = (overrides: Partial<any> = {}) => ({
    id: mockActionTypeId,
    name: mockActionTypeName,
    logo: mockLogo,
    habitId: mockHabitId,
    lastActionDate: null,
    totalActionsCount: 0,
    createdAt: fixedDate,
    updatedAt: fixedDate,
    ...overrides,
  });

  const createMockActionType = (overrides: Partial<any> = {}): ActionType => {
    const defaults = {
      id: mockActionTypeId,
      name: ActionTypeName.create(mockActionTypeName),
      logo: mockLogo,
      habitId: mockHabitId,
      createdAt: fixedDate,
      updatedAt: fixedDate,
      totalActionsCount: 0,
      lastActionDate: null,
    };
    const merged = { ...defaults, ...overrides };
    return new ActionType(
      merged.id,
      merged.name,
      merged.logo,
      merged.habitId,
      merged.createdAt,
      merged.updatedAt,
      merged.totalActionsCount,
      merged.lastActionDate
    );
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActionTypesRepository,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    repository = module.get<ActionTypesRepository>(ActionTypesRepository);
    databaseService = module.get(DatabaseService);
  });

  describe('create()', () => {
    const createData: CreateActionTypeData = {
      name: mockActionTypeName,
      logo: mockLogo,
      habitId: mockHabitId,
    };

    it('should successfully create a new action type', async () => {
      // Arrange
      const mockPrismaResult = createMockPrismaActionType();
      mockPrismaClient.actionTypes.create.mockResolvedValue(mockPrismaResult);

      // Act
      const result = await repository.create(createData);

      // Assert
      expect(mockPrismaClient.actionTypes.create).toHaveBeenCalledWith({
        data: {
          name: createData.name,
          logo: createData.logo,
          habitId: createData.habitId,
        },
      });
      expect(result).toBeInstanceOf(ActionType);
      // Verify returned entity has database-generated fields populated
      expect(result.id).toBe(mockActionTypeId);
      expect(result.name.getValue()).toBe(mockActionTypeName);
      expect(result.logo).toBe(mockLogo);
      expect(result.habitId).toBe(mockHabitId);
      expect(result.createdAt).toEqual(fixedDate);
      expect(result.updatedAt).toEqual(fixedDate);
      expect(result.totalActionsCount).toBe(0);
      expect(result.lastActionDate).toBeNull();
    });

    it('should throw ConflictError when name already exists for habit', async () => {
      // Arrange
      const conflictError = new Error('Unique constraint failed');
      (conflictError as any).code = 'P2002';
      (conflictError as any).meta = { target: ['name', 'habitId'] };
      mockPrismaClient.actionTypes.create.mockRejectedValue(conflictError);

      // Act & Assert
      await expect(repository.create(createData)).rejects.toThrow(ConflictError);
      await expect(repository.create(createData)).rejects.toThrow(
        `ActionType with name '${createData.name}' already exists for this habit`
      );
    });

    it('should rethrow other Prisma errors', async () => {
      // Arrange
      const databaseError = new Error('Database connection failed');
      mockPrismaClient.actionTypes.create.mockRejectedValue(databaseError);

      // Act & Assert
      await expect(repository.create(createData)).rejects.toThrow('Database connection failed');
    });

    it('should handle invalid data validation', async () => {
      // Arrange
      const invalidData = { ...createData, name: '' };

      // Act & Assert
      await expect(repository.create(invalidData)).rejects.toThrow();
    });
  });

  describe('findById()', () => {
    it('should return action type when found', async () => {
      // Arrange
      const mockPrismaResult = createMockPrismaActionType();
      mockPrismaClient.actionTypes.findUnique.mockResolvedValue(mockPrismaResult);

      // Act
      const result = await repository.findById(mockActionTypeId);

      // Assert
      expect(mockPrismaClient.actionTypes.findUnique).toHaveBeenCalledWith({
        where: { id: mockActionTypeId },
      });
      expect(result).toBeInstanceOf(ActionType);
      expect(result!.id).toBe(mockActionTypeId);
    });

    it('should return null when action type not found', async () => {
      // Arrange
      mockPrismaClient.actionTypes.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findById(mockActionTypeId);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      // Arrange
      const databaseError = new Error('Database connection failed');
      mockPrismaClient.actionTypes.findUnique.mockRejectedValue(databaseError);

      // Act & Assert
      await expect(repository.findById(mockActionTypeId)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('findAll()', () => {
    const paginationParams: PaginationParams = { page: 1, limit: 10 };

    it('should return paginated action types without filters', async () => {
      // Arrange
      const mockActionTypes = [createMockPrismaActionType(), createMockPrismaActionType()];
      mockPrismaClient.actionTypes.findMany.mockResolvedValue(mockActionTypes);
      mockPrismaClient.actionTypes.count.mockResolvedValue(2);

      // Act
      const result = await repository.findAll(paginationParams);

      // Assert
      expect(mockPrismaClient.actionTypes.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrismaClient.actionTypes.count).toHaveBeenCalledWith({});
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should apply habitId filter correctly', async () => {
      // Arrange
      const filters: ActionTypeFilterOptions = { habitId: mockHabitId };
      mockPrismaClient.actionTypes.findMany.mockResolvedValue([]);
      mockPrismaClient.actionTypes.count.mockResolvedValue(0);

      // Act
      await repository.findAll(paginationParams, filters);

      // Assert
      expect(mockPrismaClient.actionTypes.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        where: { habitId: mockHabitId },
      });
      expect(mockPrismaClient.actionTypes.count).toHaveBeenCalledWith({
        where: { habitId: mockHabitId },
      });
    });

    it('should apply hasActions filter correctly', async () => {
      // Arrange
      const filters: ActionTypeFilterOptions = { hasActions: true };
      mockPrismaClient.actionTypes.findMany.mockResolvedValue([]);
      mockPrismaClient.actionTypes.count.mockResolvedValue(0);

      // Act
      await repository.findAll(paginationParams, filters);

      // Assert
      expect(mockPrismaClient.actionTypes.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        where: { totalActionsCount: { gt: 0 } },
      });
    });

    it('should apply recentActivityDays filter correctly', async () => {
      // Arrange
      const filters: ActionTypeFilterOptions = { recentActivityDays: 7 };
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      mockPrismaClient.actionTypes.findMany.mockResolvedValue([]);
      mockPrismaClient.actionTypes.count.mockResolvedValue(0);

      // Act
      await repository.findAll(paginationParams, filters);

      // Assert
      expect(mockPrismaClient.actionTypes.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        where: {
          lastActionDate: {
            gte: expect.any(Date),
          },
        },
      });
    });

    it('should combine multiple filters correctly', async () => {
      // Arrange
      const filters: ActionTypeFilterOptions = {
        habitId: mockHabitId,
        hasActions: true,
      };
      mockPrismaClient.actionTypes.findMany.mockResolvedValue([]);
      mockPrismaClient.actionTypes.count.mockResolvedValue(0);

      // Act
      await repository.findAll(paginationParams, filters);

      // Assert
      expect(mockPrismaClient.actionTypes.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        where: {
          habitId: mockHabitId,
          totalActionsCount: { gt: 0 },
        },
      });
    });

    it('should handle pagination correctly', async () => {
      // Arrange
      const pageParams: PaginationParams = { page: 3, limit: 5 };
      mockPrismaClient.actionTypes.findMany.mockResolvedValue([]);
      mockPrismaClient.actionTypes.count.mockResolvedValue(20);

      // Act
      const result = await repository.findAll(pageParams);

      // Assert
      expect(mockPrismaClient.actionTypes.findMany).toHaveBeenCalledWith({
        skip: 10, // (page - 1) * limit = (3 - 1) * 5 = 10
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(5);
      expect(result.totalPages).toBe(4); // ceil(20 / 5) = 4
    });
  });

  describe('findByHabitId()', () => {
    const paginationParams: PaginationParams = { page: 1, limit: 10 };

    it('should return action types for specific habit', async () => {
      // Arrange
      const mockActionTypes = [createMockPrismaActionType()];
      mockPrismaClient.actionTypes.findMany.mockResolvedValue(mockActionTypes);
      mockPrismaClient.actionTypes.count.mockResolvedValue(1);

      // Act
      const result = await repository.findByHabitId(mockHabitId, paginationParams);

      // Assert
      expect(mockPrismaClient.actionTypes.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        where: { habitId: mockHabitId },
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].habitId).toBe(mockHabitId);
    });

    it('should apply additional filters for habit-specific query', async () => {
      // Arrange
      const filters: ActionTypeFilterOptions = { hasActions: true };
      mockPrismaClient.actionTypes.findMany.mockResolvedValue([]);
      mockPrismaClient.actionTypes.count.mockResolvedValue(0);

      // Act
      await repository.findByHabitId(mockHabitId, paginationParams, filters);

      // Assert
      expect(mockPrismaClient.actionTypes.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        where: {
          habitId: mockHabitId,
          totalActionsCount: { gt: 0 },
        },
      });
    });
  });

  describe('findByNameAndHabitId()', () => {
    it('should return action type when found by name and habitId', async () => {
      // Arrange
      const mockPrismaResult = createMockPrismaActionType();
      mockPrismaClient.actionTypes.findFirst.mockResolvedValue(mockPrismaResult);

      // Act
      const result = await repository.findByNameAndHabitId(mockActionTypeName, mockHabitId);

      // Assert
      expect(mockPrismaClient.actionTypes.findFirst).toHaveBeenCalledWith({
        where: {
          name: mockActionTypeName,
          habitId: mockHabitId,
        },
      });
      expect(result).toBeInstanceOf(ActionType);
      expect(result!.name.getValue()).toBe(mockActionTypeName);
      expect(result!.habitId).toBe(mockHabitId);
    });

    it('should return null when not found', async () => {
      // Arrange
      mockPrismaClient.actionTypes.findFirst.mockResolvedValue(null);

      // Act
      const result = await repository.findByNameAndHabitId(mockActionTypeName, mockHabitId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('update()', () => {
    const updateData: UpdateActionTypeData = {
      name: 'Updated Push-ups',
      logo: 'https://example.com/updated-logo.png',
    };

    it('should successfully update action type', async () => {
      // Arrange
      const mockUpdatedResult = createMockPrismaActionType({
        name: updateData.name,
        logo: updateData.logo,
        updatedAt: new Date(),
      });
      mockPrismaClient.actionTypes.update.mockResolvedValue(mockUpdatedResult);

      // Act
      const result = await repository.update(mockActionTypeId, updateData);

      // Assert
      expect(mockPrismaClient.actionTypes.update).toHaveBeenCalledWith({
        where: { id: mockActionTypeId },
        data: updateData,
      });
      expect(result).toBeInstanceOf(ActionType);
      expect(result.name.getValue()).toBe(updateData.name);
      expect(result.logo).toBe(updateData.logo);
    });

    it('should throw NotFoundError when action type not found', async () => {
      // Arrange
      const notFoundError = new Error('Record not found');
      (notFoundError as any).code = 'P2025';
      mockPrismaClient.actionTypes.update.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(repository.update(mockActionTypeId, updateData)).rejects.toThrow(NotFoundError);
      await expect(repository.update(mockActionTypeId, updateData)).rejects.toThrow(
        `ActionType with id ${mockActionTypeId} not found`
      );
    });

    it('should throw ConflictError when name conflict occurs', async () => {
      // Arrange
      const conflictError = new Error('Unique constraint failed');
      (conflictError as any).code = 'P2002';
      (conflictError as any).meta = { target: ['name', 'habitId'] };
      mockPrismaClient.actionTypes.update.mockRejectedValue(conflictError);

      // Act & Assert
      await expect(repository.update(mockActionTypeId, updateData)).rejects.toThrow(ConflictError);
    });

    it('should handle partial updates', async () => {
      // Arrange
      const partialUpdate: UpdateActionTypeData = { name: 'New Name Only' };
      const mockResult = createMockPrismaActionType({ name: partialUpdate.name });
      mockPrismaClient.actionTypes.update.mockResolvedValue(mockResult);

      // Act
      await repository.update(mockActionTypeId, partialUpdate);

      // Assert
      expect(mockPrismaClient.actionTypes.update).toHaveBeenCalledWith({
        where: { id: mockActionTypeId },
        data: partialUpdate,
      });
    });
  });

  describe('delete()', () => {
    it('should successfully delete action type', async () => {
      // Arrange
      mockPrismaClient.actionTypes.delete.mockResolvedValue(createMockPrismaActionType());

      // Act
      await repository.delete(mockActionTypeId);

      // Assert
      expect(mockPrismaClient.actionTypes.delete).toHaveBeenCalledWith({
        where: { id: mockActionTypeId },
      });
    });

    it('should throw NotFoundError when action type not found', async () => {
      // Arrange
      const notFoundError = new Error('Record not found');
      (notFoundError as any).code = 'P2025';
      mockPrismaClient.actionTypes.delete.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(repository.delete(mockActionTypeId)).rejects.toThrow(NotFoundError);
      await expect(repository.delete(mockActionTypeId)).rejects.toThrow(
        `ActionType with id ${mockActionTypeId} not found`
      );
    });
  });

  describe('findMostActive()', () => {
    it('should return most active action types sorted by count', async () => {
      // Arrange
      const mockActiveTypes = [
        createMockPrismaActionType({ totalActionsCount: 50 }),
        createMockPrismaActionType({ totalActionsCount: 30 }),
      ];
      mockPrismaClient.actionTypes.findMany.mockResolvedValue(mockActiveTypes);

      // Act
      const result = await repository.findMostActive(5);

      // Assert
      expect(mockPrismaClient.actionTypes.findMany).toHaveBeenCalledWith({
        take: 5,
        orderBy: { totalActionsCount: 'desc' },
        where: { totalActionsCount: { gt: 0 } },
      });
      expect(result).toHaveLength(2);
      expect(result[0].totalActionsCount).toBe(50);
    });
  });

  describe('findRecentlyActive()', () => {
    it('should return recently active action types', async () => {
      // Arrange
      const days = 7;
      const mockRecentTypes = [createMockPrismaActionType({ lastActionDate })];
      mockPrismaClient.actionTypes.findMany.mockResolvedValue(mockRecentTypes);

      // Act
      const result = await repository.findRecentlyActive(days, 10);

      // Assert
      expect(mockPrismaClient.actionTypes.findMany).toHaveBeenCalledWith({
        take: 10,
        orderBy: { lastActionDate: 'desc' },
        where: {
          lastActionDate: {
            gte: expect.any(Date),
          },
        },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('count()', () => {
    it('should return total count without filters', async () => {
      // Arrange
      mockPrismaClient.actionTypes.count.mockResolvedValue(25);

      // Act
      const result = await repository.count();

      // Assert
      expect(mockPrismaClient.actionTypes.count).toHaveBeenCalledWith({});
      expect(result).toBe(25);
    });

    it('should return count with filters', async () => {
      // Arrange
      const filters: ActionTypeFilterOptions = { habitId: mockHabitId };
      mockPrismaClient.actionTypes.count.mockResolvedValue(5);

      // Act
      const result = await repository.count(filters);

      // Assert
      expect(mockPrismaClient.actionTypes.count).toHaveBeenCalledWith({
        where: { habitId: mockHabitId },
      });
      expect(result).toBe(5);
    });
  });

  describe('countByHabitId()', () => {
    it('should return count for specific habit', async () => {
      // Arrange
      mockPrismaClient.actionTypes.count.mockResolvedValue(3);

      // Act
      const result = await repository.countByHabitId(mockHabitId);

      // Assert
      expect(mockPrismaClient.actionTypes.count).toHaveBeenCalledWith({
        where: { habitId: mockHabitId },
      });
      expect(result).toBe(3);
    });
  });

  describe('existsByNameAndHabitId()', () => {
    it('should return true when action type exists', async () => {
      // Arrange
      mockPrismaClient.actionTypes.findFirst.mockResolvedValue(createMockPrismaActionType());

      // Act
      const result = await repository.existsByNameAndHabitId(mockActionTypeName, mockHabitId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when action type does not exist', async () => {
      // Arrange
      mockPrismaClient.actionTypes.findFirst.mockResolvedValue(null);

      // Act
      const result = await repository.existsByNameAndHabitId(mockActionTypeName, mockHabitId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('bulkUpdateActionCounts()', () => {
    it('should update multiple action counts in transaction', async () => {
      // Arrange
      const updates = [
        { id: mockActionTypeId, incrementBy: 2, actionDate: new Date() },
        { id: 'another-id' as UUID, incrementBy: 1, actionDate: new Date() },
      ];
      const mockUpdatedTypes = [
        createMockPrismaActionType({ totalActionsCount: 2 }),
        createMockPrismaActionType({ id: 'another-id', totalActionsCount: 1 }),
      ];

      mockPrismaClient.$transaction.mockImplementation(async operations => {
        return Promise.all(operations.map(() => mockUpdatedTypes[0]));
      });

      // Act
      const result = await repository.bulkUpdateActionCounts(updates);

      // Assert
      expect(mockPrismaClient.$transaction).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });

  describe('findInactive()', () => {
    it('should return action types inactive for specified days', async () => {
      // Arrange
      const days = 30;
      const params: PaginationParams = { page: 1, limit: 10 };
      const mockInactiveTypes = [createMockPrismaActionType()];
      mockPrismaClient.actionTypes.findMany.mockResolvedValue(mockInactiveTypes);
      mockPrismaClient.actionTypes.count.mockResolvedValue(1);

      // Act
      const result = await repository.findInactive(days, params);

      // Assert
      expect(mockPrismaClient.actionTypes.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        where: {
          OR: [{ lastActionDate: null }, { lastActionDate: { lt: expect.any(Date) } }],
        },
      });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getStatsByHabitId()', () => {
    it('should return comprehensive statistics for habit', async () => {
      // Arrange
      const mockStats = {
        _count: { id: 5 },
        _sum: { totalActionsCount: 100 },
        _avg: { totalActionsCount: 20 },
        _max: { totalActionsCount: 50 },
        _min: { totalActionsCount: 0 },
      };
      const mockActiveCount = 4;
      const mockRecentCount = 3;
      const mockMostActive = createMockPrismaActionType({ totalActionsCount: 50 });
      const mockLeastActive = createMockPrismaActionType({ totalActionsCount: 0 });

      mockPrismaClient.actionTypes.aggregate.mockResolvedValue(mockStats);
      mockPrismaClient.actionTypes.count
        .mockResolvedValueOnce(mockActiveCount) // hasActions count
        .mockResolvedValueOnce(mockRecentCount); // recent activity count
      mockPrismaClient.actionTypes.findFirst
        .mockResolvedValueOnce(mockMostActive) // most active
        .mockResolvedValueOnce(mockLeastActive); // least active

      // Act
      const result = await repository.getStatsByHabitId(mockHabitId);

      // Assert
      expect(result).toEqual({
        totalActionTypes: 5,
        activeActionTypes: 4,
        totalActions: 100,
        averageActionsPerType: 20,
        mostActiveActionType: {
          id: mockActionTypeId,
          name: mockActionTypeName,
          totalActionsCount: 50,
        },
        leastActiveActionType: {
          id: mockActionTypeId,
          name: mockActionTypeName,
          totalActionsCount: 0,
        },
        recentlyActiveCount: 3,
      } as ActionTypeStats);
    });

    it('should handle empty statistics', async () => {
      // Arrange
      const mockEmptyStats = {
        _count: { id: 0 },
        _sum: { totalActionsCount: null },
        _avg: { totalActionsCount: null },
        _max: { totalActionsCount: null },
        _min: { totalActionsCount: null },
      };
      mockPrismaClient.actionTypes.aggregate.mockResolvedValue(mockEmptyStats);
      mockPrismaClient.actionTypes.count.mockResolvedValue(0);
      mockPrismaClient.actionTypes.findFirst.mockResolvedValue(null);

      // Act
      const result = await repository.getStatsByHabitId(mockHabitId);

      // Assert
      expect(result.totalActionTypes).toBe(0);
      expect(result.totalActions).toBe(0);
      expect(result.averageActionsPerType).toBe(0);
      expect(result.mostActiveActionType).toBeUndefined();
      expect(result.leastActiveActionType).toBeUndefined();
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle invalid UUID format', async () => {
      // Arrange
      const invalidId = 'invalid-uuid' as UUID;

      // Act & Assert
      await expect(repository.findById(invalidId)).rejects.toThrow();
    });

    it('should handle database connection errors', async () => {
      // Arrange
      const connectionError = new Error('Connection refused');
      mockPrismaClient.actionTypes.findMany.mockRejectedValue(connectionError);

      // Act & Assert
      await expect(repository.findAll({ page: 1, limit: 10 })).rejects.toThrow(
        'Connection refused'
      );
    });

    it('should handle malformed data from database', async () => {
      // Arrange
      const malformedData = { id: null, name: null }; // Invalid data structure
      mockPrismaClient.actionTypes.findUnique.mockResolvedValue(malformedData);

      // Act & Assert
      await expect(repository.findById(mockActionTypeId)).rejects.toThrow();
    });
  });
});
