import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ActionLog } from '../../../domain/entities/action-log.entity';
import { UUID, PaginatedResult, FilterOptions } from '../../../domain/shared/types/common';
import { PaginatedResponseDto } from '../../../infrastructure/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../../infrastructure/dto/pagination-query.dto';
import {
  NotFoundError,
  ValidationException,
} from '../../../infrastructure/exceptions/app.exceptions';
import { CreateActionLogDto } from '../../dto/create-action-log.dto';
import { IActionLogsRepository } from '../../interfaces/action-logs-repository.interface';
import { ActionLogsService } from '../action-logs.service';

// Mock implementations
const mockActionLogsRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByActionTypeId: jest.fn(),
};

describe('ActionLogsService', () => {
  let service: ActionLogsService;
  let actionLogsRepository: jest.Mocked<IActionLogsRepository>;

  // Test data fixtures
  const mockActionLogId: UUID = '123e4567-e89b-12d3-a456-426614174000';
  const mockActionTypeId: UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const fixedStartTime = new Date('2024-01-01T10:00:00.000Z');
  const fixedEndTime = new Date('2024-01-01T11:00:00.000Z');
  const fixedActionDate = new Date('2024-01-01');
  const fixedCreatedAt = new Date('2024-01-01T09:00:00.000Z');
  const fixedUpdatedAt = new Date('2024-01-01T09:00:00.000Z');

  const createMockActionLog = (overrides: Partial<any> = {}): ActionLog => {
    const defaults = {
      id: mockActionLogId,
      startTime: fixedStartTime,
      endTime: fixedEndTime,
      durationSeconds: 3600,
      actionDate: fixedActionDate,
      actionTypeId: mockActionTypeId,
      createdAt: fixedCreatedAt,
      updatedAt: fixedUpdatedAt,
    };
    const merged = { ...defaults, ...overrides };
    return new ActionLog(
      merged.id,
      merged.startTime,
      merged.endTime,
      merged.durationSeconds,
      merged.actionDate,
      merged.actionTypeId,
      merged.createdAt,
      merged.updatedAt
    );
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActionLogsService,
        {
          provide: 'IActionLogsRepository',
          useValue: mockActionLogsRepository,
        },
      ],
    }).compile();

    service = module.get<ActionLogsService>(ActionLogsService);
    actionLogsRepository = module.get('IActionLogsRepository');

    // Mock Logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  describe('create()', () => {
    const createActionLogDto: CreateActionLogDto = {
      startTime: fixedStartTime,
      endTime: fixedEndTime,
      actionTypeId: mockActionTypeId,
    };

    it('should successfully create a new action log', async () => {
      // Arrange
      const expectedActionLog = createMockActionLog();
      actionLogsRepository.create.mockResolvedValue(expectedActionLog);

      // Act
      const result = await service.create(createActionLogDto);

      // Assert
      expect(actionLogsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          startTime: fixedStartTime,
          endTime: fixedEndTime,
          actionTypeId: mockActionTypeId,
        })
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: mockActionLogId,
          startTime: fixedStartTime,
          endTime: fixedEndTime,
          durationSeconds: 3600,
          actionDate: fixedActionDate,
          actionTypeId: mockActionTypeId,
        })
      );
    });

    it('should create action log with only required fields', async () => {
      // Arrange
      const minimalDto: CreateActionLogDto = {
        startTime: fixedStartTime,
        actionTypeId: mockActionTypeId,
      };
      const expectedActionLog = createMockActionLog({
        endTime: null,
        durationSeconds: null,
      });
      actionLogsRepository.create.mockResolvedValue(expectedActionLog);

      // Act
      const result = await service.create(minimalDto);

      // Assert
      expect(actionLogsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          startTime: fixedStartTime,
          actionTypeId: mockActionTypeId,
        })
      );
      expect(result.endTime).toBeNull();
      expect(result.durationSeconds).toBeNull();
    });

    it('should throw ValidationException when endTime is before startTime', async () => {
      // Arrange
      const invalidDto: CreateActionLogDto = {
        startTime: fixedEndTime,
        endTime: fixedStartTime,
        actionTypeId: mockActionTypeId,
      };

      // Act & Assert
      await expect(service.create(invalidDto)).rejects.toThrow(ValidationException);
      await expect(service.create(invalidDto)).rejects.toThrow(
        'End time must be after or equal to start time'
      );

      expect(actionLogsRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when action type does not exist', async () => {
      // Arrange
      actionLogsRepository.create.mockRejectedValue(
        new NotFoundError('ActionType', mockActionTypeId)
      );

      // Act & Assert
      await expect(service.create(createActionLogDto)).rejects.toThrow(NotFoundError);

      expect(actionLogsRepository.create).toHaveBeenCalled();
    });

    it('should rethrow unexpected errors', async () => {
      // Arrange
      const unexpectedError = new Error('Database connection failed');
      actionLogsRepository.create.mockRejectedValue(unexpectedError);

      // Act & Assert
      await expect(service.create(createActionLogDto)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('findAll()', () => {
    const paginationQuery: PaginationQueryDto = {
      page: 1,
      limit: 10,
    };

    it('should return paginated list of action logs without filters', async () => {
      // Arrange
      const mockActionLogs = [createMockActionLog(), createMockActionLog()];
      const mockPaginatedResult: PaginatedResult<ActionLog> = {
        data: mockActionLogs,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      actionLogsRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      const result = await service.findAll(paginationQuery);

      // Assert
      expect(actionLogsRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, undefined);
      expect(result).toBeInstanceOf(PaginatedResponseDto);
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should return paginated list with actionTypeId filter', async () => {
      // Arrange
      const filters: FilterOptions = { actionTypeId: mockActionTypeId };
      const mockActionLogs = [createMockActionLog()];
      const mockPaginatedResult: PaginatedResult<ActionLog> = {
        data: mockActionLogs,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      actionLogsRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      const result = await service.findAll(paginationQuery, filters);

      // Assert
      expect(actionLogsRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, filters);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.actionTypeId).toBe(mockActionTypeId);
    });

    it('should return paginated list with date range filter', async () => {
      // Arrange
      const filters: FilterOptions = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      };
      const mockActionLogs = [createMockActionLog()];
      const mockPaginatedResult: PaginatedResult<ActionLog> = {
        data: mockActionLogs,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      actionLogsRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      const result = await service.findAll(paginationQuery, filters);

      // Assert
      expect(actionLogsRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, filters);
      expect(result.data).toHaveLength(1);
    });

    it('should use default pagination when values not provided', async () => {
      // Arrange
      const paginationQueryWithDefaults = {} as PaginationQueryDto;
      const mockPaginatedResult: PaginatedResult<ActionLog> = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      actionLogsRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      await service.findAll(paginationQueryWithDefaults);

      // Assert
      expect(actionLogsRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, undefined);
    });

    it('should map action log entities to response DTOs correctly', async () => {
      // Arrange
      const mockActionLog = createMockActionLog();
      const mockPaginatedResult: PaginatedResult<ActionLog> = {
        data: [mockActionLog],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      actionLogsRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      const result = await service.findAll(paginationQuery);

      // Assert
      const actionLogResponse = result.data[0];
      expect(actionLogResponse).toEqual({
        id: mockActionLog.id,
        startTime: mockActionLog.startTime,
        endTime: mockActionLog.endTime,
        durationSeconds: mockActionLog.durationSeconds,
        actionDate: mockActionLog.actionDate,
        actionTypeId: mockActionLog.actionTypeId,
        createdAt: mockActionLog.createdAt,
        updatedAt: mockActionLog.updatedAt,
      });
    });

    it('should handle empty results', async () => {
      // Arrange
      const mockPaginatedResult: PaginatedResult<ActionLog> = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      actionLogsRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      const result = await service.findAll(paginationQuery);

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('findOne()', () => {
    it('should return action log when found', async () => {
      // Arrange
      const mockActionLog = createMockActionLog();
      actionLogsRepository.findById.mockResolvedValue(mockActionLog);

      // Act
      const result = await service.findOne(mockActionLogId);

      // Assert
      expect(actionLogsRepository.findById).toHaveBeenCalledWith(mockActionLogId);
      expect(result).toEqual(
        expect.objectContaining({
          id: mockActionLogId,
          startTime: fixedStartTime,
          endTime: fixedEndTime,
        })
      );
    });

    it('should throw NotFoundError when action log not found', async () => {
      // Arrange
      actionLogsRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(mockActionLogId)).rejects.toThrow(NotFoundError);
      await expect(service.findOne(mockActionLogId)).rejects.toThrow('ActionLog');
      await expect(service.findOne(mockActionLogId)).rejects.toThrow(mockActionLogId);
    });

    it('should handle different action log IDs', async () => {
      // Arrange
      const differentId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const mockActionLog = createMockActionLog({ id: differentId });
      actionLogsRepository.findById.mockResolvedValue(mockActionLog);

      // Act
      const result = await service.findOne(differentId);

      // Assert
      expect(actionLogsRepository.findById).toHaveBeenCalledWith(differentId);
      expect(result.id).toBe(differentId);
    });
  });

  describe('mapToResponse() - private method behavior verification', () => {
    it('should correctly map all action log properties to response DTO', async () => {
      // Arrange
      const mockActionLog = createMockActionLog({
        endTime: null,
        durationSeconds: null,
      });

      actionLogsRepository.findById.mockResolvedValue(mockActionLog);

      // Act
      const result = await service.findOne(mockActionLogId);

      // Assert
      expect(result).toEqual({
        id: mockActionLogId,
        startTime: fixedStartTime,
        endTime: null,
        durationSeconds: null,
        actionDate: fixedActionDate,
        actionTypeId: mockActionTypeId,
        createdAt: fixedCreatedAt,
        updatedAt: fixedUpdatedAt,
      });
    });

    it('should handle action logs with all fields populated', async () => {
      // Arrange
      const mockActionLog = createMockActionLog();
      actionLogsRepository.findById.mockResolvedValue(mockActionLog);

      // Act
      const result = await service.findOne(mockActionLogId);

      // Assert
      expect(result.endTime).toEqual(fixedEndTime);
      expect(result.durationSeconds).toBe(3600);
    });
  });

  describe('logging behavior', () => {
    it('should log action log creation', async () => {
      // Arrange
      const createActionLogDto: CreateActionLogDto = {
        startTime: fixedStartTime,
        actionTypeId: mockActionTypeId,
      };
      const expectedActionLog = createMockActionLog();

      actionLogsRepository.create.mockResolvedValue(expectedActionLog);

      const logSpy = jest.spyOn(Logger.prototype, 'log');

      // Act
      await service.create(createActionLogDto);

      // Assert
      expect(logSpy).toHaveBeenCalledWith(
        `Creating new action log for action type: ${mockActionTypeId}`
      );
      expect(logSpy).toHaveBeenCalledWith(
        `Successfully created action log with id: ${mockActionLogId}`
      );
    });

    it('should log other service operations', async () => {
      // Arrange
      const mockActionLog = createMockActionLog();
      actionLogsRepository.findById.mockResolvedValue(mockActionLog);
      actionLogsRepository.findAll.mockResolvedValue({
        data: [mockActionLog],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      const logSpy = jest.spyOn(Logger.prototype, 'log');

      // Act
      await service.findOne(mockActionLogId);
      await service.findAll({ page: 1, limit: 10 });

      // Assert
      expect(logSpy).toHaveBeenCalledWith(`Fetching action log with id: ${mockActionLogId}`);
      expect(logSpy).toHaveBeenCalledWith('Fetching action logs - page: 1, limit: 10');
    });
  });

  describe('error handling', () => {
    it('should handle repository errors gracefully', async () => {
      // Arrange
      const dbError = new Error('Database connection lost');
      actionLogsRepository.findAll.mockRejectedValue(dbError);

      // Act & Assert
      await expect(service.findAll({ page: 1, limit: 10 })).rejects.toThrow(
        'Database connection lost'
      );
    });

    it('should propagate validation errors', async () => {
      // Arrange
      const invalidDto: CreateActionLogDto = {
        startTime: fixedEndTime,
        endTime: fixedStartTime,
        actionTypeId: mockActionTypeId,
      };

      // Act & Assert
      await expect(service.create(invalidDto)).rejects.toThrow(ValidationException);
    });
  });
});
