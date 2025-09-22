import { Test, TestingModule } from '@nestjs/testing';

import { Habit } from '../../../domain/entities/habit.entity';
import {
  HabitComplexity,
  UUID,
  PaginationParams,
  FilterOptions,
} from '../../../domain/shared/types/common';
import { HabitName } from '../../../domain/value-objects/habit-name';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { NotFoundError } from '../../../infrastructure/exceptions/app.exceptions';
import { HabitsRepository } from '../habits.repository';

// Mock uuid generation
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-123e4567-e89b-12d3-a456-426614174000'),
}));

// Mock Prisma Service
const mockPrismaService = {
  habits: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
};

describe('HabitsRepository', () => {
  let repository: HabitsRepository;

  // Test data fixtures
  const mockHabitId: UUID = '123e4567-e89b-12d3-a456-426614174000';
  const mockHabitName = 'Morning Exercise';
  const mockLogo = 'https://example.com/logo.png';
  const fixedDate = new Date('2024-01-01T00:00:00.000Z');

  const createMockHabit = (overrides: Partial<any> = {}): Habit => {
    const habitName = HabitName.create(mockHabitName);
    const defaults = {
      id: mockHabitId,
      name: habitName,
      habitType: HabitComplexity.SIMPLE,
      logo: mockLogo,
      createdAt: fixedDate.toISOString(),
      updatedAt: fixedDate.toISOString(),
      isActive: true,
      totalActionsCount: 0,
      lastActionDate: null,
    };
    const merged = { ...defaults, ...overrides };
    return new Habit(
      merged.id,
      merged.name,
      merged.habitType,
      merged.logo,
      merged.createdAt,
      merged.updatedAt,
      merged.isActive,
      merged.totalActionsCount,
      merged.lastActionDate
    );
  };

  const createMockPrismaData = (overrides: Partial<any> = {}): any => ({
    id: mockHabitId,
    name: mockHabitName,
    habitType: HabitComplexity.SIMPLE,
    logo: mockLogo,
    isActive: true,
    totalActionsCount: 0,
    lastActionDate: null,
    createdAt: fixedDate.toISOString(),
    updatedAt: fixedDate.toISOString(),
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HabitsRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<HabitsRepository>(HabitsRepository);
  });

  describe('create()', () => {
    it('should successfully create a new habit', async () => {
      // Arrange
      const habit = createMockHabit();
      const mockPrismaData = createMockPrismaData();
      mockPrismaService.habits.create.mockResolvedValue(mockPrismaData);

      // Act
      const result = await repository.create(habit);

      // Assert
      expect(mockPrismaService.habits.create).toHaveBeenCalledWith({
        data: {
          id: 'mocked-uuid-123e4567-e89b-12d3-a456-426614174000',
          name: mockHabitName,
          habitType: HabitComplexity.SIMPLE,
          logo: mockLogo,
          isActive: true,
          totalActionsCount: 0,
          lastActionDate: null,
        },
      });
      expect(result).toBeInstanceOf(Habit);
      expect(result.id).toBe(mockHabitId);
      expect(result.name.getValue()).toBe(mockHabitName);
    });

    it('should generate new UUID for habit creation', async () => {
      // Arrange
      const habit = createMockHabit();
      const mockPrismaData = createMockPrismaData();
      mockPrismaService.habits.create.mockResolvedValue(mockPrismaData);

      // Act
      await repository.create(habit);

      // Assert
      expect(mockPrismaService.habits.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            id: 'mocked-uuid-123e4567-e89b-12d3-a456-426614174000',
          }),
        })
      );
    });

    it('should handle habit with complex type', async () => {
      // Arrange
      const complexHabit = createMockHabit({ habitType: HabitComplexity.COMPLEX });
      const mockPrismaData = createMockPrismaData({ habitType: HabitComplexity.COMPLEX });
      mockPrismaService.habits.create.mockResolvedValue(mockPrismaData);

      // Act
      const result = await repository.create(complexHabit);

      // Assert
      expect(mockPrismaService.habits.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            habitType: HabitComplexity.COMPLEX,
          }),
        })
      );
      expect(result.habitType).toBe(HabitComplexity.COMPLEX);
    });

    it('should handle habit with action count and last action date', async () => {
      // Arrange
      const lastActionDate = new Date('2024-01-01T12:00:00.000Z').toISOString();
      const habitWithActions = createMockHabit({
        totalActionsCount: 5,
        lastActionDate,
      });
      const mockPrismaData = createMockPrismaData({
        totalActionsCount: 5,
        lastActionDate,
      });
      mockPrismaService.habits.create.mockResolvedValue(mockPrismaData);

      // Act
      const result = await repository.create(habitWithActions);

      // Assert
      expect(mockPrismaService.habits.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalActionsCount: 5,
            lastActionDate,
          }),
        })
      );
      expect(result.totalActionsCount).toBe(5);
      expect(result.lastActionDate).toBe(lastActionDate);
    });

    it('should propagate database errors', async () => {
      // Arrange
      const habit = createMockHabit();
      const dbError = new Error('Database connection failed');
      mockPrismaService.habits.create.mockRejectedValue(dbError);

      // Act & Assert
      await expect(repository.create(habit)).rejects.toThrow('Database connection failed');
    });
  });

  describe('findById()', () => {
    it('should return habit when found', async () => {
      // Arrange
      const mockPrismaData = createMockPrismaData();
      mockPrismaService.habits.findUnique.mockResolvedValue(mockPrismaData);

      // Act
      const result = await repository.findById(mockHabitId);

      // Assert
      expect(mockPrismaService.habits.findUnique).toHaveBeenCalledWith({
        where: { id: mockHabitId },
      });
      expect(result).toBeInstanceOf(Habit);
      expect(result!.id).toBe(mockHabitId);
      expect(result!.name.getValue()).toBe(mockHabitName);
    });

    it('should return null when habit not found', async () => {
      // Arrange
      mockPrismaService.habits.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findById(mockHabitId);

      // Assert
      expect(mockPrismaService.habits.findUnique).toHaveBeenCalledWith({
        where: { id: mockHabitId },
      });
      expect(result).toBeNull();
    });

    it('should propagate database errors', async () => {
      // Arrange
      const dbError = new Error('Database error');
      mockPrismaService.habits.findUnique.mockRejectedValue(dbError);

      // Act & Assert
      await expect(repository.findById(mockHabitId)).rejects.toThrow('Database error');
    });
  });

  describe('findAll()', () => {
    const paginationParams: PaginationParams = { page: 1, limit: 10 };

    it('should return paginated habits without filters', async () => {
      // Arrange
      const mockHabitsData = [createMockPrismaData(), createMockPrismaData()];
      mockPrismaService.habits.findMany.mockResolvedValue(mockHabitsData);
      mockPrismaService.habits.count.mockResolvedValue(2);

      // Act
      const result = await repository.findAll(paginationParams);

      // Assert
      expect(mockPrismaService.habits.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrismaService.habits.count).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual({
        data: expect.arrayContaining([expect.any(Habit)]),
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(result.data).toHaveLength(2);
    });

    it('should return paginated habits with isActive filter', async () => {
      // Arrange
      const filters: FilterOptions = { isActive: true };
      const mockHabitsData = [createMockPrismaData({ isActive: true })];
      mockPrismaService.habits.findMany.mockResolvedValue(mockHabitsData);
      mockPrismaService.habits.count.mockResolvedValue(1);

      // Act
      await repository.findAll(paginationParams, filters);

      // Assert
      expect(mockPrismaService.habits.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrismaService.habits.count).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });

    it('should return paginated habits with isActive false filter', async () => {
      // Arrange
      const filters: FilterOptions = { isActive: false };
      const mockHabitsData = [createMockPrismaData({ isActive: false })];
      mockPrismaService.habits.findMany.mockResolvedValue(mockHabitsData);
      mockPrismaService.habits.count.mockResolvedValue(1);

      // Act
      await repository.findAll(paginationParams, filters);

      // Assert
      expect(mockPrismaService.habits.findMany).toHaveBeenCalledWith({
        where: { isActive: false },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should calculate correct skip value for pagination', async () => {
      // Arrange
      const page2Params: PaginationParams = { page: 2, limit: 5 };
      mockPrismaService.habits.findMany.mockResolvedValue([]);
      mockPrismaService.habits.count.mockResolvedValue(0);

      // Act
      await repository.findAll(page2Params);

      // Assert
      expect(mockPrismaService.habits.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (page - 1) * limit = (2 - 1) * 5 = 5
          take: 5,
        })
      );
    });

    it('should calculate correct total pages', async () => {
      // Arrange
      mockPrismaService.habits.findMany.mockResolvedValue([]);
      mockPrismaService.habits.count.mockResolvedValue(23); // 23 total items

      // Act
      const result = await repository.findAll({ page: 1, limit: 10 });

      // Assert
      expect(result.totalPages).toBe(3); // Math.ceil(23 / 10) = 3
    });

    it('should handle empty result set', async () => {
      // Arrange
      mockPrismaService.habits.findMany.mockResolvedValue([]);
      mockPrismaService.habits.count.mockResolvedValue(0);

      // Act
      const result = await repository.findAll(paginationParams);

      // Assert
      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });

    it('should order results by createdAt descending', async () => {
      // Arrange
      mockPrismaService.habits.findMany.mockResolvedValue([]);
      mockPrismaService.habits.count.mockResolvedValue(0);

      // Act
      await repository.findAll(paginationParams);

      // Assert
      expect(mockPrismaService.habits.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });
  });

  describe('update()', () => {
    it('should successfully update habit with all fields', async () => {
      // Arrange
      const updatedHabit = createMockHabit({
        name: HabitName.create('Updated Name'),
        logo: 'new-logo.png',
        habitType: HabitComplexity.COMPLEX,
        isActive: false,
        totalActionsCount: 5,
        lastActionDate: new Date('2024-01-02T00:00:00.000Z'),
      });
      const mockUpdatedData = createMockPrismaData({
        name: 'Updated Name',
        logo: 'new-logo.png',
        habitType: HabitComplexity.COMPLEX,
        isActive: false,
        totalActionsCount: 5,
        lastActionDate: new Date('2024-01-02T00:00:00.000Z'),
      });
      mockPrismaService.habits.update.mockResolvedValue(mockUpdatedData);

      // Act
      const result = await repository.update(mockHabitId, updatedHabit);

      // Assert
      expect(mockPrismaService.habits.update).toHaveBeenCalledWith({
        where: { id: mockHabitId },
        data: {
          name: 'Updated Name',
          logo: 'new-logo.png',
          habitType: HabitComplexity.COMPLEX,
          isActive: false,
          totalActionsCount: 5,
          lastActionDate: new Date('2024-01-02T00:00:00.000Z'),
        },
      });
      expect(result).toBeInstanceOf(Habit);
      expect(result.name.getValue()).toBe('Updated Name');
    });

    it('should update only provided fields', async () => {
      // Arrange
      const partialUpdate = { name: HabitName.create('Partial Update') };
      const mockUpdatedData = createMockPrismaData({ name: 'Partial Update' });
      mockPrismaService.habits.update.mockResolvedValue(mockUpdatedData);

      // Act
      const result = await repository.update(mockHabitId, partialUpdate);

      // Assert
      expect(mockPrismaService.habits.update).toHaveBeenCalledWith({
        where: { id: mockHabitId },
        data: { name: 'Partial Update' },
      });
      expect(result.name.getValue()).toBe('Partial Update');
    });

    it('should handle updating isActive to false', async () => {
      // Arrange
      const partialUpdate = { isActive: false };
      const mockUpdatedData = createMockPrismaData({ isActive: false });
      mockPrismaService.habits.update.mockResolvedValue(mockUpdatedData);

      // Act
      await repository.update(mockHabitId, partialUpdate);

      // Assert
      expect(mockPrismaService.habits.update).toHaveBeenCalledWith({
        where: { id: mockHabitId },
        data: { isActive: false },
      });
    });

    it('should handle updating totalActionsCount to 0', async () => {
      // Arrange
      const partialUpdate = { totalActionsCount: 0 };
      const mockUpdatedData = createMockPrismaData({ totalActionsCount: 0 });
      mockPrismaService.habits.update.mockResolvedValue(mockUpdatedData);

      // Act
      await repository.update(mockHabitId, partialUpdate);

      // Assert
      expect(mockPrismaService.habits.update).toHaveBeenCalledWith({
        where: { id: mockHabitId },
        data: { totalActionsCount: 0 },
      });
    });

    it('should handle updating lastActionDate to null', async () => {
      // Arrange
      const partialUpdate = { lastActionDate: null };
      const mockUpdatedData = createMockPrismaData({ lastActionDate: null });
      mockPrismaService.habits.update.mockResolvedValue(mockUpdatedData);

      // Act
      await repository.update(mockHabitId, partialUpdate);

      // Assert
      expect(mockPrismaService.habits.update).toHaveBeenCalledWith({
        where: { id: mockHabitId },
        data: { lastActionDate: null },
      });
    });

    it('should throw NotFoundError when habit does not exist', async () => {
      // Arrange
      const partialUpdate = { name: HabitName.create('Updated Name') };
      const prismaError = { code: 'P2025', message: 'Record not found' };
      mockPrismaService.habits.update.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(repository.update(mockHabitId, partialUpdate)).rejects.toThrow(NotFoundError);
      await expect(repository.update(mockHabitId, partialUpdate)).rejects.toThrow('Habit');
    });

    it('should propagate other database errors', async () => {
      // Arrange
      const partialUpdate = { name: HabitName.create('Updated Name') };
      const dbError = new Error('Database constraint violation');
      mockPrismaService.habits.update.mockRejectedValue(dbError);

      // Act & Assert
      await expect(repository.update(mockHabitId, partialUpdate)).rejects.toThrow(
        'Database constraint violation'
      );
    });

    it('should not update when no fields provided', async () => {
      // Arrange
      const emptyUpdate = {};
      const mockUpdatedData = createMockPrismaData();
      mockPrismaService.habits.update.mockResolvedValue(mockUpdatedData);

      // Act
      await repository.update(mockHabitId, emptyUpdate);

      // Assert
      expect(mockPrismaService.habits.update).toHaveBeenCalledWith({
        where: { id: mockHabitId },
        data: {},
      });
    });
  });

  describe('delete()', () => {
    it('should perform soft delete by setting isActive to false', async () => {
      // Arrange
      mockPrismaService.habits.update.mockResolvedValue(createMockPrismaData({ isActive: false }));

      // Act
      await repository.delete(mockHabitId);

      // Assert
      expect(mockPrismaService.habits.update).toHaveBeenCalledWith({
        where: { id: mockHabitId },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundError when habit does not exist', async () => {
      // Arrange
      const prismaError = { code: 'P2025', message: 'Record not found' };
      mockPrismaService.habits.update.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(repository.delete(mockHabitId)).rejects.toThrow(NotFoundError);
      await expect(repository.delete(mockHabitId)).rejects.toThrow('Habit');
    });

    it('should propagate other database errors', async () => {
      // Arrange
      const dbError = new Error('Database error');
      mockPrismaService.habits.update.mockRejectedValue(dbError);

      // Act & Assert
      await expect(repository.delete(mockHabitId)).rejects.toThrow('Database error');
    });
  });

  describe('findByName()', () => {
    it('should return habit when found by name and active', async () => {
      // Arrange
      const mockPrismaData = createMockPrismaData();
      mockPrismaService.habits.findFirst.mockResolvedValue(mockPrismaData);

      // Act
      const result = await repository.findByName(mockHabitName);

      // Assert
      expect(mockPrismaService.habits.findFirst).toHaveBeenCalledWith({
        where: {
          name: mockHabitName,
          isActive: true,
        },
      });
      expect(result).toBeInstanceOf(Habit);
      expect(result!.name.getValue()).toBe(mockHabitName);
    });

    it('should return null when habit not found', async () => {
      // Arrange
      mockPrismaService.habits.findFirst.mockResolvedValue(null);

      // Act
      const result = await repository.findByName('Non-existent Habit');

      // Assert
      expect(mockPrismaService.habits.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'Non-existent Habit',
          isActive: true,
        },
      });
      expect(result).toBeNull();
    });

    it('should only find active habits', async () => {
      // Arrange
      mockPrismaService.habits.findFirst.mockResolvedValue(null);

      // Act
      await repository.findByName(mockHabitName);

      // Assert
      expect(mockPrismaService.habits.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });

    it('should handle case-sensitive name matching', async () => {
      // Arrange
      const caseSensitiveName = 'Morning EXERCISE';
      mockPrismaService.habits.findFirst.mockResolvedValue(null);

      // Act
      await repository.findByName(caseSensitiveName);

      // Assert
      expect(mockPrismaService.habits.findFirst).toHaveBeenCalledWith({
        where: {
          name: caseSensitiveName,
          isActive: true,
        },
      });
    });
  });


  describe('mapToDomain() - domain mapping verification', () => {
    it('should correctly map all Prisma data to domain entity', async () => {
      // Arrange
      const complexPrismaData = createMockPrismaData({
        name: 'Complex Habit',
        habitType: HabitComplexity.WITHOUT_INTERVALS,
        logo: 'complex-logo.png',
        isActive: false,
        totalActionsCount: 10,
        lastActionDate: new Date('2024-01-01T12:00:00.000Z'),
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z',
      });
      mockPrismaService.habits.findUnique.mockResolvedValue(complexPrismaData);

      // Act
      const result = await repository.findById(mockHabitId);

      // Assert
      expect(result).toBeInstanceOf(Habit);
      expect(result!.id).toBe(mockHabitId);
      expect(result!.name).toBeInstanceOf(HabitName);
      expect(result!.name.getValue()).toBe('Complex Habit');
      expect(result!.habitType).toBe(HabitComplexity.WITHOUT_INTERVALS);
      expect(result!.logo).toBe('complex-logo.png');
      expect(result!.isActive).toBe(false);
      expect(result!.totalActionsCount).toBe(10);
      expect(result!.lastActionDate).toEqual(new Date('2024-01-01T12:00:00.000Z'));
      expect(result!.createdAt).toEqual('2024-01-01T00:00:00.000Z');
      expect(result!.updatedAt).toEqual('2024-01-01T12:00:00.000Z');
    });

    it('should handle null lastActionDate in domain mapping', async () => {
      // Arrange
      const prismaDataWithNullDate = createMockPrismaData({ lastActionDate: null });
      mockPrismaService.habits.findUnique.mockResolvedValue(prismaDataWithNullDate);

      // Act
      const result = await repository.findById(mockHabitId);

      // Assert
      expect(result!.lastActionDate).toBeNull();
    });

    it('should correctly map all habit complexity types', async () => {
      // Test each habit complexity type
      const complexityTypes = [
        HabitComplexity.SIMPLE,
        HabitComplexity.COMPLEX,
        HabitComplexity.WITHOUT_INTERVALS,
      ];

      for (const complexity of complexityTypes) {
        const prismaData = createMockPrismaData({ habitType: complexity });
        mockPrismaService.habits.findUnique.mockResolvedValue(prismaData);

        const result = await repository.findById(mockHabitId);

        expect(result!.habitType).toBe(complexity);
      }
    });

    it('should create valid HabitName value object during mapping', async () => {
      // Arrange
      const prismaData = createMockPrismaData({ name: 'Valid Habit Name' });
      mockPrismaService.habits.findUnique.mockResolvedValue(prismaData);

      // Act
      const result = await repository.findById(mockHabitId);

      // Assert
      expect(result!.name).toBeInstanceOf(HabitName);
      expect(result!.name.getValue()).toBe('Valid Habit Name');
      expect(() => result!.name.getValue()).not.toThrow();
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle concurrent database operations', async () => {
      // Arrange
      const mockPrismaData = createMockPrismaData();
      mockPrismaService.habits.findUnique.mockResolvedValue(mockPrismaData);
      mockPrismaService.habits.update.mockResolvedValue(mockPrismaData);

      // Act - Simulate concurrent operations
      const promises = [
        repository.findById(mockHabitId),
        repository.findById(mockHabitId),
      ];

      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result).toBeInstanceOf(Habit);
      });
    });

    it('should handle empty habit name during domain mapping', async () => {
      // Arrange
      const prismaDataWithEmptyName = createMockPrismaData({ name: '' });
      mockPrismaService.habits.findUnique.mockResolvedValue(prismaDataWithEmptyName);

      // Act & Assert - Should throw during HabitName creation
      await expect(repository.findById(mockHabitId)).rejects.toThrow('Habit name cannot be empty');
    });

    it('should handle very long habit names during domain mapping', async () => {
      // Arrange
      const veryLongName = 'a'.repeat(51); // Exceeds max length
      const prismaDataWithLongName = createMockPrismaData({ name: veryLongName });
      mockPrismaService.habits.findUnique.mockResolvedValue(prismaDataWithLongName);

      // Act & Assert - Should throw during HabitName creation
      await expect(repository.findById(mockHabitId)).rejects.toThrow(
        'Habit name cannot exceed 50 characters'
      );
    });

    it('should handle database connection timeouts', async () => {
      // Arrange
      const timeoutError = new Error('Connection timeout');
      mockPrismaService.habits.findUnique.mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(repository.findById(mockHabitId)).rejects.toThrow('Connection timeout');
    });
  });
});
