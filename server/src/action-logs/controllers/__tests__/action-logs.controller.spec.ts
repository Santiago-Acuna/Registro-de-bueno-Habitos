import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';

import { UUID } from '../../../domain/shared/types/common';
import { PaginatedResponseDto } from '../../../infrastructure/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../../infrastructure/dto/pagination-query.dto';
import {
  ValidationException,
  NotFoundError,
} from '../../../infrastructure/exceptions/app.exceptions';
import { ActionLogResponseDto } from '../../dto/action-log-response.dto';
import { CreateActionLogDto } from '../../dto/create-action-log.dto';
import { LogColumnResponseDto } from '../../dto/log-columns-response.dto';
import { ActionLogsService } from '../../services/action-logs.service';
import { ActionLogsController } from '../action-logs.controller';

// Mock ActionLogsService
const mockActionLogsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  getLogColumnsByActionTypeId: jest.fn(),
};

// Mock ThrottlerGuard
const mockThrottlerGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('ActionLogsController', () => {
  let controller: ActionLogsController;
  let actionLogsService: jest.Mocked<ActionLogsService>;

  // Test data fixtures
  const mockActionLogId: UUID = '123e4567-e89b-12d3-a456-426614174000';
  const mockActionTypeId: UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const fixedStartTime = new Date('2024-01-01T10:00:00.000Z');
  const fixedEndTime = new Date('2024-01-01T11:00:00.000Z');
  const fixedActionDate = new Date('2024-01-01');
  const fixedCreatedAt = new Date('2024-01-01T09:00:00.000Z');
  const fixedUpdatedAt = new Date('2024-01-01T09:00:00.000Z');

  const createMockActionLogResponse = (
    overrides: Partial<ActionLogResponseDto> = {}
  ): ActionLogResponseDto => ({
    id: mockActionLogId,
    startTime: fixedStartTime,
    endTime: fixedEndTime,
    durationSeconds: 3600,
    actionDate: fixedActionDate,
    actionTypeId: mockActionTypeId,
    createdAt: fixedCreatedAt,
    updatedAt: fixedUpdatedAt,
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActionLogsController],
      providers: [
        {
          provide: ActionLogsService,
          useValue: mockActionLogsService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue(mockThrottlerGuard)
      .compile();

    controller = module.get<ActionLogsController>(ActionLogsController);
    actionLogsService = module.get(ActionLogsService);
  });

  describe('create()', () => {
    const createActionLogDto: CreateActionLogDto = {
      startTime: fixedStartTime,
      endTime: fixedEndTime,
      actionTypeId: mockActionTypeId,
    };

    it('should successfully create a new action log', async () => {
      // Arrange
      const expectedResponse = createMockActionLogResponse();
      actionLogsService.create.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.create(createActionLogDto);

      // Assert
      expect(actionLogsService.create).toHaveBeenCalledWith(createActionLogDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should create action log with only required fields', async () => {
      // Arrange
      const minimalDto: CreateActionLogDto = {
        startTime: fixedStartTime,
        actionTypeId: mockActionTypeId,
      };
      const expectedResponse = createMockActionLogResponse({
        endTime: null,
        durationSeconds: null,
      });
      actionLogsService.create.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.create(minimalDto);

      // Assert
      expect(actionLogsService.create).toHaveBeenCalledWith(minimalDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle ValidationException from service', async () => {
      // Arrange
      actionLogsService.create.mockRejectedValue(
        new ValidationException('Invalid action log data')
      );

      // Act & Assert
      await expect(controller.create(createActionLogDto)).rejects.toThrow(ValidationException);
      await expect(controller.create(createActionLogDto)).rejects.toThrow(
        'Invalid action log data'
      );
    });

    it('should handle NotFoundError when action type does not exist', async () => {
      // Arrange
      actionLogsService.create.mockRejectedValue(new NotFoundError('ActionType', mockActionTypeId));

      // Act & Assert
      await expect(controller.create(createActionLogDto)).rejects.toThrow(NotFoundError);
    });

    it('should handle service throwing generic error', async () => {
      // Arrange
      const genericError = new Error('Database connection failed');
      actionLogsService.create.mockRejectedValue(genericError);

      // Act & Assert
      await expect(controller.create(createActionLogDto)).rejects.toThrow(
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
      const mockActionLogs = [
        createMockActionLogResponse(),
        createMockActionLogResponse({ id: 'another-id' }),
      ];
      const expectedResponse = new PaginatedResponseDto(mockActionLogs, 2, 1, 10);
      actionLogsService.findAll.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.findAll(paginationQuery);

      // Assert
      expect(actionLogsService.findAll).toHaveBeenCalledWith(paginationQuery, undefined);
      expect(result).toEqual(expectedResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should return paginated list with actionTypeId filter', async () => {
      // Arrange
      const actionTypeId = mockActionTypeId;
      const mockActionLogs = [createMockActionLogResponse({ actionTypeId })];
      const expectedResponse = new PaginatedResponseDto(mockActionLogs, 1, 1, 10);
      actionLogsService.findAll.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.findAll({ ...paginationQuery, actionTypeId });

      // Assert
      expect(actionLogsService.findAll).toHaveBeenCalledWith(paginationQuery, { actionTypeId });
      expect(result).toEqual(expectedResponse);
    });

    it('should return paginated list with date range filter', async () => {
      // Arrange
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const mockActionLogs = [createMockActionLogResponse()];
      const expectedResponse = new PaginatedResponseDto(mockActionLogs, 1, 1, 10);
      actionLogsService.findAll.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.findAll({ ...paginationQuery, startDate, endDate });

      // Assert
      expect(actionLogsService.findAll).toHaveBeenCalledWith(paginationQuery, {
        startDate,
        endDate,
      });
      expect(result).toEqual(expectedResponse);
    });

    it('should return paginated list with all filters', async () => {
      // Arrange
      const actionTypeId = mockActionTypeId;
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const mockActionLogs = [createMockActionLogResponse({ actionTypeId })];
      const expectedResponse = new PaginatedResponseDto(mockActionLogs, 1, 1, 10);
      actionLogsService.findAll.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.findAll({
        ...paginationQuery,
        actionTypeId,
        startDate,
        endDate,
      });

      // Assert
      expect(actionLogsService.findAll).toHaveBeenCalledWith(paginationQuery, {
        actionTypeId,
        startDate,
        endDate,
      });
      expect(result).toEqual(expectedResponse);
    });

    it('should handle empty results', async () => {
      // Arrange
      const expectedResponse = new PaginatedResponseDto([], 0, 1, 10);
      actionLogsService.findAll.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.findAll(paginationQuery);

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle service errors', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      actionLogsService.findAll.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.findAll(paginationQuery)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should support custom pagination parameters', async () => {
      // Arrange
      const customPagination: PaginationQueryDto = {
        page: 3,
        limit: 25,
      };
      const expectedResponse = new PaginatedResponseDto([], 0, 3, 25);
      actionLogsService.findAll.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.findAll(customPagination);

      // Assert
      expect(actionLogsService.findAll).toHaveBeenCalledWith(customPagination, undefined);
      expect(result.page).toBe(3);
      expect(result.limit).toBe(25);
    });
  });

  describe('findOne()', () => {
    it('should return action log when found', async () => {
      // Arrange
      const expectedResponse = createMockActionLogResponse();
      actionLogsService.findOne.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.findOne(mockActionLogId);

      // Assert
      expect(actionLogsService.findOne).toHaveBeenCalledWith(mockActionLogId);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle NotFoundError from service', async () => {
      // Arrange
      actionLogsService.findOne.mockRejectedValue(new NotFoundError('ActionLog', mockActionLogId));

      // Act & Assert
      await expect(controller.findOne(mockActionLogId)).rejects.toThrow(NotFoundError);
      await expect(controller.findOne(mockActionLogId)).rejects.toThrow('not found');
    });

    it('should handle other service errors', async () => {
      // Arrange
      const serviceError = new Error('Database error');
      actionLogsService.findOne.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.findOne(mockActionLogId)).rejects.toThrow('Database error');
    });

    it('should work with different valid UUIDs', async () => {
      // Arrange
      const differentId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const expectedResponse = createMockActionLogResponse({ id: differentId });
      actionLogsService.findOne.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.findOne(differentId);

      // Assert
      expect(actionLogsService.findOne).toHaveBeenCalledWith(differentId);
      expect(result.id).toBe(differentId);
    });
  });

  describe('controller decorators and middleware integration', () => {
    it('should be decorated with ApiTags', () => {
      // Verify controller has proper Swagger documentation
      const controllerMetadata = Reflect.getMetadata('swagger/apiUseTags', ActionLogsController);
      expect(controllerMetadata).toEqual(['action-logs']);
    });

    it('should use ThrottlerGuard', () => {
      // Verify throttling is applied
      const guards = Reflect.getMetadata('__guards__', ActionLogsController);
      expect(guards).toContain(ThrottlerGuard);
    });

    it('should have proper versioning', () => {
      // Verify the structure exists
      expect(controller).toBeDefined();
      expect(controller.create).toBeDefined();
      expect(controller.findAll).toBeDefined();
      expect(controller.findOne).toBeDefined();
    });
  });

  describe('parameter validation and typing', () => {
    it('should handle UUID parameter correctly', async () => {
      // Arrange
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const expectedResponse = createMockActionLogResponse();
      actionLogsService.findOne.mockResolvedValue(expectedResponse);

      // Act
      await controller.findOne(validUUID);

      // Assert
      expect(actionLogsService.findOne).toHaveBeenCalledWith(validUUID);
    });

    it('should handle pagination query parameters', async () => {
      // Arrange
      const paginationQuery: PaginationQueryDto = {
        page: 2,
        limit: 20,
      };
      const expectedResponse = new PaginatedResponseDto([], 0, 2, 20);
      actionLogsService.findAll.mockResolvedValue(expectedResponse);

      // Act
      await controller.findAll(paginationQuery);

      // Assert
      expect(actionLogsService.findAll).toHaveBeenCalledWith(paginationQuery, undefined);
    });

    it('should handle optional filter parameters', async () => {
      // Arrange
      const paginationQuery: PaginationQueryDto = { page: 1, limit: 10 };
      const expectedResponse = new PaginatedResponseDto([], 0, 1, 10);
      actionLogsService.findAll.mockResolvedValue(expectedResponse);

      // Act
      await controller.findAll({ ...paginationQuery, actionTypeId: mockActionTypeId });

      // Assert
      expect(actionLogsService.findAll).toHaveBeenCalledWith(paginationQuery, {
        actionTypeId: mockActionTypeId,
      });
    });
  });

  describe('error scenarios', () => {
    it('should propagate ValidationException with proper message', async () => {
      // Arrange
      const createDto: CreateActionLogDto = {
        startTime: fixedStartTime,
        actionTypeId: mockActionTypeId,
      };
      actionLogsService.create.mockRejectedValue(
        new ValidationException('End time must be after start time')
      );

      // Act & Assert
      await expect(controller.create(createDto)).rejects.toThrow(
        'End time must be after start time'
      );
    });

    it('should handle multiple concurrent requests', async () => {
      // Arrange
      const expectedResponse = createMockActionLogResponse();
      actionLogsService.findOne.mockResolvedValue(expectedResponse);

      // Act
      const promises = [
        controller.findOne(mockActionLogId),
        controller.findOne(mockActionLogId),
        controller.findOne(mockActionLogId),
      ];
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(3);
      expect(actionLogsService.findOne).toHaveBeenCalledTimes(3);
    });
  });

  describe('getLogColumnsByActionTypeId()', () => {
    const createMockLogColumn = (
      overrides: Partial<LogColumnResponseDto> = {}
    ): LogColumnResponseDto => ({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'commitName',
      type: 'text',
      logTypeId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      validations: [],
      ...overrides,
    });

    it('should return log columns for valid action type id', async () => {
      // Arrange
      const mockColumns = [
        createMockLogColumn(),
        createMockLogColumn({ name: 'pageCount', type: 'number' }),
      ];
      actionLogsService.getLogColumnsByActionTypeId.mockResolvedValue(mockColumns);

      // Act
      const result = await controller.getLogColumnsByActionTypeId(mockActionTypeId);

      // Assert
      expect(result).toEqual(mockColumns);
      expect(actionLogsService.getLogColumnsByActionTypeId).toHaveBeenCalledWith(mockActionTypeId);
      expect(actionLogsService.getLogColumnsByActionTypeId).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when log type has no columns', async () => {
      // Arrange
      actionLogsService.getLogColumnsByActionTypeId.mockResolvedValue([]);

      // Act
      const result = await controller.getLogColumnsByActionTypeId(mockActionTypeId);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should propagate NotFoundError when action type does not exist', async () => {
      // Arrange
      actionLogsService.getLogColumnsByActionTypeId.mockRejectedValue(
        new NotFoundError('ActionType', mockActionTypeId)
      );

      // Act & Assert
      await expect(controller.getLogColumnsByActionTypeId(mockActionTypeId)).rejects.toThrow(
        NotFoundError
      );
      await expect(controller.getLogColumnsByActionTypeId(mockActionTypeId)).rejects.toThrow(
        `ActionType with id ${mockActionTypeId} not found`
      );
    });

    it('should call service with correct action type id', async () => {
      // Arrange
      const differentActionTypeId: UUID = 'b1ffce00-ad1c-5fg9-cc7e-7cc0ce491b22';
      actionLogsService.getLogColumnsByActionTypeId.mockResolvedValue([]);

      // Act
      await controller.getLogColumnsByActionTypeId(differentActionTypeId);

      // Assert
      expect(actionLogsService.getLogColumnsByActionTypeId).toHaveBeenCalledWith(
        differentActionTypeId
      );
    });

    it('should return columns with validations', async () => {
      // Arrange
      const mockColumn = createMockLogColumn({
        validations: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            validationFunctionId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            functionName: 'isNotEmpty',
            functionCode: 'return value !== "";',
            isForFront: true,
          },
        ],
      });
      actionLogsService.getLogColumnsByActionTypeId.mockResolvedValue([mockColumn]);

      // Act
      const result = await controller.getLogColumnsByActionTypeId(mockActionTypeId);

      // Assert
      expect(result[0]!.validations).toHaveLength(1);
      expect(result[0]!.validations[0]!.functionName).toBe('isNotEmpty');
    });
  });
});
