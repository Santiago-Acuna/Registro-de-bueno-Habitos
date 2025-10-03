// Mock cloudinary module to avoid ValidatorConstraint compilation issues
jest.mock('../../../helpers/cloudinary', () => ({
  UploadImageDto: class MockUploadImageDto {
    image: any;
  },
  CloudinaryService: jest.fn().mockImplementation(() => ({
    uploadImage: jest.fn(),
    deleteImage: jest.fn(),
  })),
  CloudinaryModule: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { validate } from 'class-validator';

// Mock class-validator for unit tests
jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validate: jest.fn(),
}));

const mockValidate = validate as jest.MockedFunction<typeof validate>;

import { UUID } from '../../../domain/shared/types/common';
import { UploadImageDto } from '../../../helpers/cloudinary';
import { PaginatedResponseDto } from '../../../infrastructure/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../../infrastructure/dto/pagination-query.dto';
import {
  ValidationException,
  NotFoundError,
  ConflictError,
} from '../../../infrastructure/exceptions/app.exceptions';
import { ActionTypeQueryDto } from '../../dto/action-type-query.dto';
import { ActionTypeResponseDto } from '../../dto/action-type-response.dto';
import { CreateActionTypeDto } from '../../dto/create-action-type.dto';
import { UpdateActionTypeDto } from '../../dto/update-action-type.dto';
import { ActionTypesService } from '../../services/action-types.service';
import { ActionTypesController } from '../action-types.controller';

// Mock ActionTypesService
const mockActionTypesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByHabitId: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mock ThrottlerGuard
const mockThrottlerGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('ActionTypesController', () => {
  let controller: ActionTypesController;
  let actionTypesService: jest.Mocked<ActionTypesService>;

  // Test data fixtures
  const mockActionTypeId: UUID = '123e4567-e89b-12d3-a456-426614174000';
  const mockHabitId: UUID = '987fcdeb-51a2-43d1-9876-543210987654';
  const mockActionTypeName = 'Morning Push-ups';
  const mockLogo = 'https://example.com/pushups-logo.png';
  const fixedDate = new Date('2024-01-01T00:00:00.000Z');

  const createMockActionTypeResponse = (
    overrides: Partial<ActionTypeResponseDto> = {}
  ): ActionTypeResponseDto => ({
    id: mockActionTypeId,
    name: mockActionTypeName,
    logo: mockLogo,
    habitId: mockHabitId,
    totalActionsCount: 0,
    lastActionDate: null,
    createdAt: fixedDate,
    updatedAt: fixedDate,
    ...overrides,
  });

  const createMockMulterFile = (
    overrides: Partial<Express.Multer.File> = {}
  ): Express.Multer.File => ({
    fieldname: 'icon',
    originalname: 'test-icon.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: 1024,
    buffer: Buffer.from('fake image data'),
    destination: '',
    filename: '',
    path: '',
    stream: {} as any,
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActionTypesController],
      providers: [
        {
          provide: ActionTypesService,
          useValue: mockActionTypesService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue(mockThrottlerGuard)
      .compile();

    controller = module.get<ActionTypesController>(ActionTypesController);
    actionTypesService = module.get(ActionTypesService);
  });

  describe('create()', () => {
    const createActionTypeDto: CreateActionTypeDto = {
      name: mockActionTypeName,
      habitId: mockHabitId,
    };
    const mockFile = createMockMulterFile();

    it('should successfully create a new action type', async () => {
      // Arrange
      const expectedResponse = createMockActionTypeResponse();
      mockValidate.mockResolvedValue([]); // No validation errors
      actionTypesService.create.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.create(createActionTypeDto, mockFile);

      // Assert
      expect(mockValidate).toHaveBeenCalledWith(expect.any(UploadImageDto));
      expect(actionTypesService.create).toHaveBeenCalledWith(createActionTypeDto, mockFile);
      expect(result).toEqual(expectedResponse);
    });

    it('should validate uploaded image using UploadImageDto', async () => {
      // Arrange
      const expectedResponse = createMockActionTypeResponse();
      mockValidate.mockResolvedValue([]);
      actionTypesService.create.mockResolvedValue(expectedResponse);

      // Act
      await controller.create(createActionTypeDto, mockFile);

      // Assert
      expect(mockValidate).toHaveBeenCalledTimes(1);
      const validateCall = mockValidate.mock.calls[0];
      expect(validateCall).toBeDefined();
      const uploadImageDto = validateCall?.[0] as unknown as UploadImageDto;
      expect(uploadImageDto).toBeInstanceOf(UploadImageDto);
      expect(uploadImageDto.image).toBe(mockFile);
    });

    it('should throw ValidationException when image validation fails', async () => {
      // Arrange
      const validationErrors = [
        {
          property: 'image',
          constraints: {
            isImageFile: 'File must be a valid image',
            maxFileSize: 'File size must not exceed 5MB',
          },
        },
      ];
      mockValidate.mockResolvedValue(validationErrors as any);

      // Act & Assert
      await expect(controller.create(createActionTypeDto, mockFile)).rejects.toThrow(
        ValidationException
      );
      await expect(controller.create(createActionTypeDto, mockFile)).rejects.toThrow(
        'File must be a valid image, File size must not exceed 5MB'
      );

      expect(actionTypesService.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationException with default message when no constraint messages', async () => {
      // Arrange
      const validationErrors = [
        {
          property: 'image',
          constraints: undefined,
        },
      ];
      mockValidate.mockResolvedValue(validationErrors as any);

      // Act & Assert
      await expect(controller.create(createActionTypeDto, mockFile)).rejects.toThrow(
        'Uncontrolled error with the image you sent'
      );

      expect(actionTypesService.create).not.toHaveBeenCalled();
    });

    it('should handle service throwing ConflictError', async () => {
      // Arrange
      mockValidate.mockResolvedValue([]);
      actionTypesService.create.mockRejectedValue(
        new ConflictError(
          `ActionType with name '${createActionTypeDto.name}' already exists for this habit`
        )
      );

      // Act & Assert
      await expect(controller.create(createActionTypeDto, mockFile)).rejects.toThrow(ConflictError);
    });

    it('should handle service throwing ValidationException', async () => {
      // Arrange
      mockValidate.mockResolvedValue([]);
      actionTypesService.create.mockRejectedValue(
        new ValidationException('Invalid action type data')
      );

      // Act & Assert
      await expect(controller.create(createActionTypeDto, mockFile)).rejects.toThrow(
        ValidationException
      );
    });
  });

  describe('findAll()', () => {
    const paginationQuery: PaginationQueryDto = {
      page: 1,
      limit: 10,
    };

    it('should return paginated list of action types without filters', async () => {
      // Arrange
      const mockActionTypes = [createMockActionTypeResponse(), createMockActionTypeResponse()];
      const expectedResponse = new PaginatedResponseDto(mockActionTypes, 2, 1, 10);
      actionTypesService.findAll.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.findAll(paginationQuery);

      // Assert
      expect(actionTypesService.findAll).toHaveBeenCalledWith(paginationQuery, undefined);
      expect(result).toEqual(expectedResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should return paginated list of action types with habitId filter', async () => {
      // Arrange
      const queryDto: ActionTypeQueryDto = {
        habitId: mockHabitId,
      };
      const mockActionTypes = [createMockActionTypeResponse({ habitId: mockHabitId })];
      const expectedResponse = new PaginatedResponseDto(mockActionTypes, 1, 1, 10);
      actionTypesService.findAll.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.findAll({ ...paginationQuery, ...queryDto });

      // Assert
      expect(actionTypesService.findAll).toHaveBeenCalledWith(paginationQuery, {
        habitId: mockHabitId,
      });
      expect(result).toEqual(expectedResponse);
    });

    it('should handle hasActions filter being true', async () => {
      // Arrange
      const queryDto: ActionTypeQueryDto = {
        hasActions: true,
      };
      const mockActionTypes = [createMockActionTypeResponse({ totalActionsCount: 5 })];
      const expectedResponse = new PaginatedResponseDto(mockActionTypes, 1, 1, 10);
      actionTypesService.findAll.mockResolvedValue(expectedResponse);

      // Act
      await controller.findAll({ ...paginationQuery, ...queryDto });

      // Assert
      expect(actionTypesService.findAll).toHaveBeenCalledWith(paginationQuery, {
        hasActions: true,
      });
    });

    it('should handle hasActions filter being false', async () => {
      // Arrange
      const queryDto: ActionTypeQueryDto = {
        hasActions: false,
      };
      const mockActionTypes = [createMockActionTypeResponse({ totalActionsCount: 0 })];
      const expectedResponse = new PaginatedResponseDto(mockActionTypes, 1, 1, 10);
      actionTypesService.findAll.mockResolvedValue(expectedResponse);

      // Act
      await controller.findAll({ ...paginationQuery, ...queryDto });

      // Assert
      expect(actionTypesService.findAll).toHaveBeenCalledWith(paginationQuery, {
        hasActions: false,
      });
    });

    it('should not apply filters when all filter parameters are undefined', async () => {
      // Arrange
      const expectedResponse = new PaginatedResponseDto([], 0, 1, 10);
      actionTypesService.findAll.mockResolvedValue(expectedResponse);

      // Act
      await controller.findAll(paginationQuery);

      // Assert
      expect(actionTypesService.findAll).toHaveBeenCalledWith(paginationQuery, undefined);
    });

    it('should handle service errors', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      actionTypesService.findAll.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.findAll(paginationQuery)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle multiple filters combined', async () => {
      // Arrange
      const queryDto: ActionTypeQueryDto = {
        habitId: mockHabitId,
        hasActions: true,
        recentActivityDays: 7,
      };
      const expectedResponse = new PaginatedResponseDto([], 0, 1, 10);
      actionTypesService.findAll.mockResolvedValue(expectedResponse);

      // Act
      await controller.findAll({ ...paginationQuery, ...queryDto });

      // Assert
      expect(actionTypesService.findAll).toHaveBeenCalledWith(paginationQuery, {
        habitId: mockHabitId,
        hasActions: true,
        recentActivityDays: 7,
      });
    });
  });

  describe('findByHabitId()', () => {
    const paginationQuery: PaginationQueryDto = {
      page: 1,
      limit: 10,
    };

    it('should return action types for specific habit', async () => {
      // Arrange
      const mockActionTypes = [createMockActionTypeResponse({ habitId: mockHabitId })];
      const expectedResponse = new PaginatedResponseDto(mockActionTypes, 1, 1, 10);
      actionTypesService.findByHabitId.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.findByHabitId(mockHabitId, paginationQuery);

      // Assert
      expect(actionTypesService.findByHabitId).toHaveBeenCalledWith(
        mockHabitId,
        paginationQuery,
        undefined
      );
      expect(result).toEqual(expectedResponse);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.habitId).toBe(mockHabitId);
    });

    it('should handle pagination and filters for habit-specific query', async () => {
      // Arrange
      const queryDto: ActionTypeQueryDto = {
        hasActions: true,
      };
      const expectedResponse = new PaginatedResponseDto([], 0, 2, 5);
      actionTypesService.findByHabitId.mockResolvedValue(expectedResponse);

      // Act
      await controller.findByHabitId(mockHabitId, { page: 2, limit: 5 }, queryDto);

      // Assert
      expect(actionTypesService.findByHabitId).toHaveBeenCalledWith(
        mockHabitId,
        { page: 2, limit: 5 },
        { hasActions: true }
      );
    });

    it('should handle empty results', async () => {
      // Arrange
      const expectedResponse = new PaginatedResponseDto([], 0, 1, 10);
      actionTypesService.findByHabitId.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.findByHabitId(mockHabitId, paginationQuery);

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle service errors', async () => {
      // Arrange
      const serviceError = new Error('Database query failed');
      actionTypesService.findByHabitId.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.findByHabitId(mockHabitId, paginationQuery)).rejects.toThrow(
        'Database query failed'
      );
    });
  });

  describe('findOne()', () => {
    it('should return action type when found', async () => {
      // Arrange
      const expectedResponse = createMockActionTypeResponse();
      actionTypesService.findOne.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.findOne(mockActionTypeId);

      // Assert
      expect(actionTypesService.findOne).toHaveBeenCalledWith(mockActionTypeId);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle NotFoundError from service', async () => {
      // Arrange
      actionTypesService.findOne.mockRejectedValue(
        new NotFoundError('ActionType', mockActionTypeId)
      );

      // Act & Assert
      await expect(controller.findOne(mockActionTypeId)).rejects.toThrow(NotFoundError);
    });

    it('should handle other service errors', async () => {
      // Arrange
      const serviceError = new Error('Database error');
      actionTypesService.findOne.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.findOne(mockActionTypeId)).rejects.toThrow('Database error');
    });
  });

  describe('update()', () => {
    const updateActionTypeDto: UpdateActionTypeDto = {
      name: 'Updated Push-ups Name',
    };

    it('should successfully update action type without file', async () => {
      // Arrange
      const expectedResponse = createMockActionTypeResponse({
        name: updateActionTypeDto.name ?? 'Updated Push-ups Name',
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      });
      actionTypesService.update.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.update(mockActionTypeId, updateActionTypeDto);

      // Assert
      expect(actionTypesService.update).toHaveBeenCalledWith(mockActionTypeId, updateActionTypeDto);
      expect(result).toEqual(expectedResponse);
      expect(result.name).toBe(updateActionTypeDto.name);
    });

    it('should successfully update action type with file', async () => {
      // Arrange
      const mockFile = createMockMulterFile();
      const expectedResponse = createMockActionTypeResponse({
        name: updateActionTypeDto.name ?? 'Updated Push-ups Name',
        logo: 'https://example.com/new-icon.png',
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      });
      mockValidate.mockResolvedValue([]);
      actionTypesService.update.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.update(mockActionTypeId, updateActionTypeDto, mockFile);

      // Assert
      expect(mockValidate).toHaveBeenCalledWith(expect.any(UploadImageDto));
      expect(actionTypesService.update).toHaveBeenCalledWith(
        mockActionTypeId,
        updateActionTypeDto,
        mockFile
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should validate uploaded file when provided', async () => {
      // Arrange
      const mockFile = createMockMulterFile();
      const expectedResponse = createMockActionTypeResponse();
      mockValidate.mockResolvedValue([]);
      actionTypesService.update.mockResolvedValue(expectedResponse);

      // Act
      await controller.update(mockActionTypeId, updateActionTypeDto, mockFile);

      // Assert
      expect(mockValidate).toHaveBeenCalledTimes(1);
      const validateCall = mockValidate.mock.calls[0];
      const uploadImageDto = validateCall?.[0] as unknown as UploadImageDto;
      expect(uploadImageDto).toBeInstanceOf(UploadImageDto);
      expect(uploadImageDto.image).toBe(mockFile);
    });

    it('should throw ValidationException when file validation fails', async () => {
      // Arrange
      const mockFile = createMockMulterFile();
      const validationErrors = [
        {
          property: 'image',
          constraints: {
            isImageFile: 'Invalid image format',
          },
        },
      ];
      mockValidate.mockResolvedValue(validationErrors as any);

      // Act & Assert
      await expect(
        controller.update(mockActionTypeId, updateActionTypeDto, mockFile)
      ).rejects.toThrow(ValidationException);
      await expect(
        controller.update(mockActionTypeId, updateActionTypeDto, mockFile)
      ).rejects.toThrow('Invalid image format');

      expect(actionTypesService.update).not.toHaveBeenCalled();
    });

    it('should handle NotFoundError from service', async () => {
      // Arrange
      actionTypesService.update.mockRejectedValue(
        new NotFoundError('ActionType', mockActionTypeId)
      );

      // Act & Assert
      await expect(controller.update(mockActionTypeId, updateActionTypeDto)).rejects.toThrow(
        NotFoundError
      );
    });

    it('should handle ConflictError for duplicate names', async () => {
      // Arrange
      actionTypesService.update.mockRejectedValue(
        new ConflictError(
          `ActionType with name '${updateActionTypeDto.name}' already exists for this habit`
        )
      );

      // Act & Assert
      await expect(controller.update(mockActionTypeId, updateActionTypeDto)).rejects.toThrow(
        ConflictError
      );
    });

    it('should handle ValidationException from service', async () => {
      // Arrange
      actionTypesService.update.mockRejectedValue(
        new ValidationException('Invalid action type name')
      );

      // Act & Assert
      await expect(controller.update(mockActionTypeId, updateActionTypeDto)).rejects.toThrow(
        ValidationException
      );
    });

    it('should handle empty update DTO', async () => {
      // Arrange
      const emptyUpdateDto: UpdateActionTypeDto = {};
      const expectedResponse = createMockActionTypeResponse();
      actionTypesService.update.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.update(mockActionTypeId, emptyUpdateDto);

      // Assert
      expect(actionTypesService.update).toHaveBeenCalledWith(mockActionTypeId, emptyUpdateDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('remove()', () => {
    it('should successfully remove action type', async () => {
      // Arrange
      actionTypesService.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(mockActionTypeId);

      // Assert
      expect(actionTypesService.remove).toHaveBeenCalledWith(mockActionTypeId);
      expect(result).toBeUndefined();
    });

    it('should handle NotFoundError from service', async () => {
      // Arrange
      actionTypesService.remove.mockRejectedValue(
        new NotFoundError('ActionType', mockActionTypeId)
      );

      // Act & Assert
      await expect(controller.remove(mockActionTypeId)).rejects.toThrow(NotFoundError);
    });

    it('should handle other service errors', async () => {
      // Arrange
      const serviceError = new Error('Database deletion failed');
      actionTypesService.remove.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.remove(mockActionTypeId)).rejects.toThrow('Database deletion failed');
    });
  });

  describe('controller decorators and middleware integration', () => {
    it('should be decorated with ApiTags', () => {
      // Verify controller has proper Swagger documentation
      const controllerMetadata = Reflect.getMetadata('swagger/apiUseTags', ActionTypesController);
      expect(controllerMetadata).toEqual(['action-types']);
    });

    it('should use ThrottlerGuard', () => {
      // Verify throttling is applied
      const guards = Reflect.getMetadata('__guards__', ActionTypesController);
      expect(guards).toContain(ThrottlerGuard);
    });

    it('should have proper versioning', () => {
      // This would be tested through integration tests
      // Here we verify the structure exists
      expect(controller).toBeDefined();
      expect(controller.create).toBeDefined();
      expect(controller.findAll).toBeDefined();
      expect(controller.findByHabitId).toBeDefined();
      expect(controller.findOne).toBeDefined();
      expect(controller.update).toBeDefined();
      expect(controller.remove).toBeDefined();
    });
  });

  describe('validation error handling edge cases', () => {
    const createActionTypeDto: CreateActionTypeDto = {
      name: mockActionTypeName,
      habitId: mockHabitId,
    };
    const mockFile = createMockMulterFile();

    it('should handle validation errors with empty constraints', async () => {
      // Arrange
      const validationErrors = [
        {
          property: 'image',
          constraints: {},
        },
      ];
      mockValidate.mockResolvedValue(validationErrors as any);

      // Act & Assert
      await expect(controller.create(createActionTypeDto, mockFile)).rejects.toThrow(
        'Uncontrolled error with the image you sent'
      );
    });

    it('should handle multiple validation errors', async () => {
      // Arrange
      const validationErrors = [
        {
          property: 'image',
          constraints: {
            isImageFile: 'Must be image',
            maxFileSize: 'Too large',
          },
        },
        {
          property: 'image',
          constraints: {
            imageFormat: 'Invalid format',
          },
        },
      ];
      mockValidate.mockResolvedValue(validationErrors as any);

      // Act & Assert
      await expect(controller.create(createActionTypeDto, mockFile)).rejects.toThrow(
        'Must be image, Too large; Invalid format'
      );
    });

    it('should handle validation errors with null constraints', async () => {
      // Arrange
      const validationErrors = [
        {
          property: 'image',
          constraints: null,
        },
      ];
      mockValidate.mockResolvedValue(validationErrors as any);

      // Act & Assert
      await expect(controller.create(createActionTypeDto, mockFile)).rejects.toThrow(
        'Uncontrolled error with the image you sent'
      );
    });
  });

  describe('parameter validation and typing', () => {
    it('should handle UUID parameter correctly', async () => {
      // Arrange
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const expectedResponse = createMockActionTypeResponse();
      actionTypesService.findOne.mockResolvedValue(expectedResponse);

      // Act
      await controller.findOne(validUUID);

      // Assert
      expect(actionTypesService.findOne).toHaveBeenCalledWith(validUUID);
    });

    it('should handle pagination query parameters', async () => {
      // Arrange
      const paginationQuery: PaginationQueryDto = {
        page: 2,
        limit: 20,
      };
      const expectedResponse = new PaginatedResponseDto([], 0, 2, 20);
      actionTypesService.findAll.mockResolvedValue(expectedResponse);

      // Act
      await controller.findAll(paginationQuery);

      // Assert
      expect(actionTypesService.findAll).toHaveBeenCalledWith(paginationQuery, undefined);
    });

    it('should handle boolean query parameters correctly', async () => {
      // Arrange
      const paginationQuery: PaginationQueryDto = { page: 1, limit: 10 };
      const expectedResponse = new PaginatedResponseDto([], 0, 1, 10);
      actionTypesService.findAll.mockResolvedValue(expectedResponse);

      // Act - Test with boolean true
      await controller.findAll({ ...paginationQuery, hasActions: true });
      await controller.findAll({ ...paginationQuery, hasActions: false });

      // Assert
      expect(actionTypesService.findAll).toHaveBeenCalledWith(paginationQuery, {
        hasActions: true,
      });
      expect(actionTypesService.findAll).toHaveBeenCalledWith(paginationQuery, {
        hasActions: false,
      });
    });
  });
});
