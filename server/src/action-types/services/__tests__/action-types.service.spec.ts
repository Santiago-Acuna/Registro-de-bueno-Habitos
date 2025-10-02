import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ActionType } from '../../../domain/entities/action-type.entity';
import { UUID, PaginatedResult } from '../../../domain/shared/types/common';
import { ActionTypeName } from '../../../domain/value-objects/action-type-name';
import { CloudinaryService } from '../../../helpers/cloudinary/cloudinary.service';
import { PaginatedResponseDto } from '../../../infrastructure/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../../infrastructure/dto/pagination-query.dto';
import {
  NotFoundError,
  ConflictError,
  ValidationException,
} from '../../../infrastructure/exceptions/app.exceptions';
import { CreateActionTypeDto } from '../../dto/create-action-type.dto';
import { UpdateActionTypeDto } from '../../dto/update-action-type.dto';
import {
  CreateActionTypeData,
  UpdateActionTypeData,
  ActionTypeFilterOptions,
  IActionTypesRepository,
} from '../../interfaces/action-types-repository.interface';
import { ActionTypesService } from '../action-types.service';

// Mock implementations
const mockActionTypesRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByHabitId: jest.fn(),
  findByNameAndHabitId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  incrementActionCount: jest.fn(),
  findMostActive: jest.fn(),
  findRecentlyActive: jest.fn(),
  count: jest.fn(),
  countByHabitId: jest.fn(),
  existsByNameAndHabitId: jest.fn(),
  bulkUpdateActionCounts: jest.fn(),
  findInactive: jest.fn(),
  getStatsByHabitId: jest.fn(),
};

const mockCloudinaryService = {
  uploadImage: jest.fn(),
};

// Mock uuid generation
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-123e4567-e89b-12d3-a456-426614174000'),
}));

describe('ActionTypesService (RED PHASE)', () => {
  let service: ActionTypesService;
  let actionTypesRepository: jest.Mocked<IActionTypesRepository>;
  let cloudinaryService: jest.Mocked<CloudinaryService>;

  // Test data fixtures
  const mockActionTypeId: UUID = '123e4567-e89b-12d3-a456-426614174000';
  const mockHabitId: UUID = '987fcdeb-51a2-43d1-9876-543210987654';
  const mockActionTypeName = 'Morning Push-ups';
  const mockLogo = 'https://example.com/pushups-logo.png';
  const fixedDate = new Date('2024-01-01T00:00:00.000Z');
  const lastActionDate = new Date('2024-01-01T12:00:00.000Z');

  const createMockActionType = (overrides: Partial<any> = {}): ActionType => {
    const actionTypeName = ActionTypeName.create(mockActionTypeName);
    const defaults = {
      id: mockActionTypeId,
      name: actionTypeName,
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

  const createMockMulterFile = (
    overrides: Partial<Express.Multer.File> = {}
  ): Express.Multer.File => ({
    fieldname: 'logo',
    originalname: 'test-logo.png',
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
      providers: [
        ActionTypesService,
        {
          provide: 'IActionTypesRepository',
          useValue: mockActionTypesRepository,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    service = module.get<ActionTypesService>(ActionTypesService);
    actionTypesRepository = module.get('IActionTypesRepository');
    cloudinaryService = module.get(CloudinaryService);

    // Mock Logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  describe('create()', () => {
    const createActionTypeDto: CreateActionTypeDto = {
      name: mockActionTypeName,
      habitId: mockHabitId,
    };
    const mockFile = createMockMulterFile();

    it('should successfully create a new action type', async () => {
      // Arrange
      const expectedActionType = createMockActionType();
      actionTypesRepository.existsByNameAndHabitId.mockResolvedValue(false);
      cloudinaryService.uploadImage.mockResolvedValue({
        success: true,
        url: mockLogo,
        data: {
          publicId: 'test-logo',
          url: mockLogo,
          secureUrl: mockLogo,
          version: 1,
          signature: 'test-signature',
          width: 100,
          height: 100,
          format: 'png',
          resourceType: 'image',
          createdAt: '2024-01-01T00:00:00.000Z',
          tags: [],
          bytes: 1024,
          type: 'upload',
          etag: 'test-etag',
          placeholder: false,
        },
      });
      actionTypesRepository.create.mockResolvedValue(expectedActionType);

      // Act
      const result = await service.create(createActionTypeDto, mockFile);

      // Assert
      expect(actionTypesRepository.existsByNameAndHabitId).toHaveBeenCalledWith(
        createActionTypeDto.name,
        createActionTypeDto.habitId
      );
      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
        mockFile,
        expect.objectContaining({
          public_id: 'test-logo',
          folder: 'action-types',
          resourceType: 'auto',
        })
      );
      // Assert: Service passes only domain fields to repository (no database-generated fields)
      expect(actionTypesRepository.create).toHaveBeenCalledWith({
        name: mockActionTypeName,
        logo: mockLogo,
        habitId: mockHabitId,
      });
      // Assert: Service returns complete entity with database-generated fields
      expect(result).toEqual(
        expect.objectContaining({
          id: mockActionTypeId,
          name: mockActionTypeName,
          logo: mockLogo,
          habitId: mockHabitId,
        })
      );
    });

    it('should throw ConflictError when action type with same name already exists for habit', async () => {
      // Arrange
      actionTypesRepository.existsByNameAndHabitId.mockResolvedValue(true);

      // Act & Assert
      await expect(service.create(createActionTypeDto, mockFile)).rejects.toThrow(ConflictError);
      await expect(service.create(createActionTypeDto, mockFile)).rejects.toThrow(
        `ActionType with name '${createActionTypeDto.name}' already exists for this habit`
      );

      expect(cloudinaryService.uploadImage).not.toHaveBeenCalled();
      expect(actionTypesRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationException when image upload fails', async () => {
      // Arrange
      actionTypesRepository.existsByNameAndHabitId.mockResolvedValue(false);
      cloudinaryService.uploadImage.mockResolvedValue({
        success: false,
        error: { message: 'Invalid image format', name: 'ValidationError' },
      });

      // Act & Assert
      await expect(service.create(createActionTypeDto, mockFile)).rejects.toThrow(
        ValidationException
      );
      await expect(service.create(createActionTypeDto, mockFile)).rejects.toThrow(
        'Invalid image format'
      );

      expect(actionTypesRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationException when image upload has no error message', async () => {
      // Arrange
      actionTypesRepository.existsByNameAndHabitId.mockResolvedValue(false);
      cloudinaryService.uploadImage.mockResolvedValue({
        success: false,
      });

      // Act & Assert
      await expect(service.create(createActionTypeDto, mockFile)).rejects.toThrow(
        'Failed to upload image. Uncontrolled error'
      );
    });

    it('should throw ValidationException for invalid action type name during entity creation', async () => {
      // Arrange
      const invalidDto = { ...createActionTypeDto, name: '' };
      actionTypesRepository.existsByNameAndHabitId.mockResolvedValue(false);
      cloudinaryService.uploadImage.mockResolvedValue({
        success: true,
        url: mockLogo,
        data: {
          publicId: 'test-logo',
          url: mockLogo,
          secureUrl: mockLogo,
          version: 1,
          signature: 'test-signature',
          width: 100,
          height: 100,
          format: 'png',
          resourceType: 'image',
          createdAt: '2024-01-01T00:00:00.000Z',
          tags: [],
          bytes: 1024,
          type: 'upload',
          etag: 'test-etag',
          placeholder: false,
        },
      });

      // Act & Assert
      await expect(service.create(invalidDto, mockFile)).rejects.toThrow(ValidationException);
      await expect(service.create(invalidDto, mockFile)).rejects.toThrow(
        'ActionType name cannot be empty'
      );
    });

    it('should throw ValidationException for invalid logo during entity creation', async () => {
      // Arrange
      actionTypesRepository.existsByNameAndHabitId.mockResolvedValue(false);
      cloudinaryService.uploadImage.mockResolvedValue({
        success: true,
        url: '', // Invalid empty logo
        data: {
          publicId: 'test-logo',
          url: '',
          secureUrl: '',
          version: 1,
          signature: 'test-signature',
          width: 100,
          height: 100,
          format: 'png',
          resourceType: 'image',
          createdAt: '2024-01-01T00:00:00.000Z',
          tags: [],
          bytes: 1024,
          type: 'upload',
          etag: 'test-etag',
          placeholder: false,
        },
      });

      // Act & Assert
      await expect(service.create(createActionTypeDto, mockFile)).rejects.toThrow(
        ValidationException
      );
      await expect(service.create(createActionTypeDto, mockFile)).rejects.toThrow(
        'Logo must be a non-empty string'
      );
    });

    it('should rethrow unexpected errors', async () => {
      // Arrange
      const unexpectedError = new Error('Database connection failed');
      actionTypesRepository.existsByNameAndHabitId.mockRejectedValue(unexpectedError);

      // Act & Assert
      await expect(service.create(createActionTypeDto, mockFile)).rejects.toThrow(
        'Database connection failed'
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
      const mockActionTypes = [createMockActionType(), createMockActionType()];
      const mockPaginatedResult: PaginatedResult<ActionType> = {
        data: mockActionTypes,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      actionTypesRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      const result = await service.findAll(paginationQuery);

      // Assert
      expect(actionTypesRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, undefined);
      expect(result).toBeInstanceOf(PaginatedResponseDto);
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should return paginated list of action types with filters', async () => {
      // Arrange
      const filters: ActionTypeFilterOptions = { habitId: mockHabitId };
      const mockActionTypes = [createMockActionType()];
      const mockPaginatedResult: PaginatedResult<ActionType> = {
        data: mockActionTypes,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      actionTypesRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      const result = await service.findAll(paginationQuery, filters);

      // Assert
      expect(actionTypesRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, filters);
      expect(result.data).toHaveLength(1);
    });

    it('should use default pagination when values not provided', async () => {
      // Arrange
      const paginationQueryWithDefaults = {} as PaginationQueryDto;
      const mockPaginatedResult: PaginatedResult<ActionType> = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      actionTypesRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      await service.findAll(paginationQueryWithDefaults);

      // Assert
      expect(actionTypesRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, undefined);
    });

    it('should map action type entities to response DTOs correctly', async () => {
      // Arrange
      const mockActionType = createMockActionType();
      const mockPaginatedResult: PaginatedResult<ActionType> = {
        data: [mockActionType],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      actionTypesRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      const result = await service.findAll(paginationQuery);

      // Assert
      const actionTypeResponse = result.data[0];
      expect(actionTypeResponse).toEqual({
        id: mockActionType.id,
        name: mockActionType.name.getValue(),
        logo: mockActionType.logo,
        habitId: mockActionType.habitId,
        totalActionsCount: mockActionType.totalActionsCount,
        lastActionDate: mockActionType.lastActionDate,
        createdAt: mockActionType.createdAt,
        updatedAt: mockActionType.updatedAt,
      });
    });
  });

  describe('findByHabitId()', () => {
    const paginationQuery: PaginationQueryDto = { page: 1, limit: 10 };

    it('should return action types for specific habit', async () => {
      // Arrange
      const mockActionTypes = [createMockActionType()];
      const mockPaginatedResult: PaginatedResult<ActionType> = {
        data: mockActionTypes,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      actionTypesRepository.findByHabitId.mockResolvedValue(mockPaginatedResult);

      // Act
      const result = await service.findByHabitId(mockHabitId, paginationQuery);

      // Assert
      expect(actionTypesRepository.findByHabitId).toHaveBeenCalledWith(
        mockHabitId,
        { page: 1, limit: 10 },
        undefined
      );
      expect(result).toBeInstanceOf(PaginatedResponseDto);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].habitId).toBe(mockHabitId);
    });

    it('should apply filters when provided', async () => {
      // Arrange
      const filters: ActionTypeFilterOptions = { hasActions: true };
      const mockPaginatedResult: PaginatedResult<ActionType> = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      actionTypesRepository.findByHabitId.mockResolvedValue(mockPaginatedResult);

      // Act
      await service.findByHabitId(mockHabitId, paginationQuery, filters);

      // Assert
      expect(actionTypesRepository.findByHabitId).toHaveBeenCalledWith(
        mockHabitId,
        { page: 1, limit: 10 },
        filters
      );
    });
  });

  describe('findOne()', () => {
    it('should return action type when found', async () => {
      // Arrange
      const mockActionType = createMockActionType();
      actionTypesRepository.findById.mockResolvedValue(mockActionType);

      // Act
      const result = await service.findOne(mockActionTypeId);

      // Assert
      expect(actionTypesRepository.findById).toHaveBeenCalledWith(mockActionTypeId);
      expect(result).toEqual(
        expect.objectContaining({
          id: mockActionTypeId,
          name: mockActionTypeName,
        })
      );
    });

    it('should throw NotFoundError when action type not found', async () => {
      // Arrange
      actionTypesRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(mockActionTypeId)).rejects.toThrow(NotFoundError);
      await expect(service.findOne(mockActionTypeId)).rejects.toThrow('ActionType');
    });
  });

  describe('update()', () => {
    const updateActionTypeDto: UpdateActionTypeDto = {
      name: 'Updated Push-ups',
    };

    it('should successfully update action type name', async () => {
      // Arrange
      const existingActionType = createMockActionType();
      const updatedActionType = existingActionType.updateName(updateActionTypeDto.name!);
      actionTypesRepository.findById.mockResolvedValue(existingActionType);
      actionTypesRepository.existsByNameAndHabitId.mockResolvedValue(false);
      actionTypesRepository.update.mockResolvedValue(updatedActionType);

      // Act
      const result = await service.update(mockActionTypeId, updateActionTypeDto);

      // Assert
      expect(actionTypesRepository.findById).toHaveBeenCalledWith(mockActionTypeId);
      expect(actionTypesRepository.existsByNameAndHabitId).toHaveBeenCalledWith(
        updateActionTypeDto.name,
        mockHabitId
      );
      expect(actionTypesRepository.update).toHaveBeenCalledWith(
        mockActionTypeId,
        expect.objectContaining({
          name: updateActionTypeDto.name,
        })
      );
      expect(result.name).toBe(updateActionTypeDto.name);
    });

    it('should throw NotFoundError when action type does not exist', async () => {
      // Arrange
      actionTypesRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(mockActionTypeId, updateActionTypeDto)).rejects.toThrow(
        NotFoundError
      );

      expect(actionTypesRepository.existsByNameAndHabitId).not.toHaveBeenCalled();
      expect(actionTypesRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when new name already exists for different action type in same habit', async () => {
      // Arrange
      const existingActionType = createMockActionType();
      actionTypesRepository.findById.mockResolvedValue(existingActionType);
      actionTypesRepository.existsByNameAndHabitId.mockResolvedValue(true);

      // Act & Assert
      await expect(service.update(mockActionTypeId, updateActionTypeDto)).rejects.toThrow(
        ConflictError
      );
      await expect(service.update(mockActionTypeId, updateActionTypeDto)).rejects.toThrow(
        `ActionType with name '${updateActionTypeDto.name}' already exists for this habit`
      );

      expect(actionTypesRepository.update).not.toHaveBeenCalled();
    });

    it('should not check name conflict when name is not being updated', async () => {
      // Arrange
      const updateWithoutName: UpdateActionTypeDto = {}; // No name update
      const existingActionType = createMockActionType();
      actionTypesRepository.findById.mockResolvedValue(existingActionType);
      actionTypesRepository.update.mockResolvedValue(existingActionType);

      // Act
      await service.update(mockActionTypeId, updateWithoutName);

      // Assert
      expect(actionTypesRepository.existsByNameAndHabitId).not.toHaveBeenCalled();
      expect(actionTypesRepository.update).toHaveBeenCalledWith(mockActionTypeId, {});
    });

    it('should not update when new name is same as current name', async () => {
      // Arrange
      const existingActionType = createMockActionType();
      const sameNameDto = { name: mockActionTypeName }; // Same as current name
      actionTypesRepository.findById.mockResolvedValue(existingActionType);
      actionTypesRepository.update.mockResolvedValue(existingActionType);

      // Act
      await service.update(mockActionTypeId, sameNameDto);

      // Assert
      expect(actionTypesRepository.existsByNameAndHabitId).not.toHaveBeenCalled();
    });

    it('should throw ValidationException for invalid action type name', async () => {
      // Arrange
      const invalidUpdateDto = { name: '' }; // Invalid name
      const existingActionType = createMockActionType();
      actionTypesRepository.findById.mockResolvedValue(existingActionType);

      // Act & Assert
      await expect(service.update(mockActionTypeId, invalidUpdateDto)).rejects.toThrow(
        ValidationException
      );
      await expect(service.update(mockActionTypeId, invalidUpdateDto)).rejects.toThrow(
        'ActionType name cannot be empty'
      );
    });

    describe('logo update functionality', () => {
      const updateMockFile = createMockMulterFile({ originalname: 'new-logo.png' });
      const newLogoUrl = 'https://example.com/new-logo.png';

      it('should successfully update action type with new logo', async () => {
        // Arrange
        const existingActionType = createMockActionType();
        const updateDto: UpdateActionTypeDto = {};
        const updatedActionType = existingActionType.updateLogo(newLogoUrl);

        actionTypesRepository.findById.mockResolvedValue(existingActionType);
        cloudinaryService.uploadImage.mockResolvedValue({
          success: true,
          url: newLogoUrl,
          data: {
            publicId: 'new-logo',
            url: newLogoUrl,
            secureUrl: newLogoUrl,
            version: 1,
            signature: 'test-signature',
            width: 100,
            height: 100,
            format: 'png',
            resourceType: 'image',
            createdAt: '2024-01-01T00:00:00.000Z',
            tags: [],
            bytes: 1024,
            type: 'upload',
            etag: 'test-etag',
            placeholder: false,
          },
        });
        actionTypesRepository.update.mockResolvedValue(updatedActionType);

        // Act
        const result = await service.update(mockActionTypeId, updateDto, updateMockFile);

        // Assert
        expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
          updateMockFile,
          expect.objectContaining({
            public_id: 'new-logo',
            folder: 'action-types',
            resourceType: 'auto',
          })
        );
        expect(actionTypesRepository.update).toHaveBeenCalledWith(
          mockActionTypeId,
          expect.objectContaining({
            logo: newLogoUrl,
          })
        );
        expect(result.logo).toBe(newLogoUrl);
      });

      it('should successfully update action type name and logo together', async () => {
        // Arrange
        const existingActionType = createMockActionType();
        const updateDto: UpdateActionTypeDto = {
          name: 'Updated Name',
        };
        let updatedActionType = existingActionType.updateName(updateDto.name!);
        updatedActionType = updatedActionType.updateLogo(newLogoUrl);

        actionTypesRepository.findById.mockResolvedValue(existingActionType);
        actionTypesRepository.existsByNameAndHabitId.mockResolvedValue(false);
        cloudinaryService.uploadImage.mockResolvedValue({
          success: true,
          url: newLogoUrl,
          data: {
            publicId: 'new-logo',
            url: newLogoUrl,
            secureUrl: newLogoUrl,
            version: 1,
            signature: 'test-signature',
            width: 100,
            height: 100,
            format: 'png',
            resourceType: 'image',
            createdAt: '2024-01-01T00:00:00.000Z',
            tags: [],
            bytes: 1024,
            type: 'upload',
            etag: 'test-etag',
            placeholder: false,
          },
        });
        actionTypesRepository.update.mockResolvedValue(updatedActionType);

        // Act
        const result = await service.update(mockActionTypeId, updateDto, updateMockFile);

        // Assert
        expect(actionTypesRepository.existsByNameAndHabitId).toHaveBeenCalledWith(
          updateDto.name,
          mockHabitId
        );
        expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
          updateMockFile,
          expect.any(Object)
        );
        expect(result.name).toBe(updateDto.name);
        expect(result.logo).toBe(newLogoUrl);
      });

      it('should throw ValidationException when logo upload fails', async () => {
        // Arrange
        const existingActionType = createMockActionType();
        const updateWithLogo: UpdateActionTypeDto = {};

        actionTypesRepository.findById.mockResolvedValue(existingActionType);
        cloudinaryService.uploadImage.mockResolvedValue({
          success: false,
          error: { message: 'Invalid image format', name: 'ValidationError' },
        });

        // Act & Assert
        await expect(
          service.update(mockActionTypeId, updateWithLogo, updateMockFile)
        ).rejects.toThrow(ValidationException);
        await expect(
          service.update(mockActionTypeId, updateWithLogo, updateMockFile)
        ).rejects.toThrow('Invalid image format');

        expect(actionTypesRepository.update).not.toHaveBeenCalled();
      });
    });
  });

  describe('remove()', () => {
    it('should successfully remove existing action type', async () => {
      // Arrange
      const existingActionType = createMockActionType();
      actionTypesRepository.findById.mockResolvedValue(existingActionType);
      actionTypesRepository.delete.mockResolvedValue(undefined);

      // Act
      await service.remove(mockActionTypeId);

      // Assert
      expect(actionTypesRepository.findById).toHaveBeenCalledWith(mockActionTypeId);
      expect(actionTypesRepository.delete).toHaveBeenCalledWith(mockActionTypeId);
    });

    it('should throw NotFoundError when action type does not exist', async () => {
      // Arrange
      actionTypesRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(mockActionTypeId)).rejects.toThrow(NotFoundError);

      expect(actionTypesRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('findMostActive()', () => {
    it('should return most active action types', async () => {
      // Arrange
      const mockActiveTypes = [
        createMockActionType({ totalActionsCount: 50 }),
        createMockActionType({ totalActionsCount: 30 }),
      ];
      actionTypesRepository.findMostActive.mockResolvedValue(mockActiveTypes);

      // Act
      const result = await service.findMostActive(5);

      // Assert
      expect(actionTypesRepository.findMostActive).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(2);
      expect(result[0].totalActionsCount).toBe(50);
    });

    it('should validate limit parameter', async () => {
      // Act & Assert
      await expect(service.findMostActive(-1)).rejects.toThrow(ValidationException);
      await expect(service.findMostActive(0)).rejects.toThrow(ValidationException);
      await expect(service.findMostActive(101)).rejects.toThrow(ValidationException);
    });
  });

  describe('findRecentlyActive()', () => {
    it('should return recently active action types', async () => {
      // Arrange
      const mockRecentTypes = [createMockActionType({ lastActionDate })];
      actionTypesRepository.findRecentlyActive.mockResolvedValue(mockRecentTypes);

      // Act
      const result = await service.findRecentlyActive(7, 10);

      // Assert
      expect(actionTypesRepository.findRecentlyActive).toHaveBeenCalledWith(7, 10);
      expect(result).toHaveLength(1);
    });

    it('should validate parameters', async () => {
      // Act & Assert
      await expect(service.findRecentlyActive(-1, 10)).rejects.toThrow(ValidationException);
      await expect(service.findRecentlyActive(7, -1)).rejects.toThrow(ValidationException);
      await expect(service.findRecentlyActive(0, 10)).rejects.toThrow(ValidationException);
      await expect(service.findRecentlyActive(7, 0)).rejects.toThrow(ValidationException);
    });
  });

  describe('getStatsByHabitId()', () => {
    it('should return statistics for habit', async () => {
      // Arrange
      const mockStats = {
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
      };
      actionTypesRepository.getStatsByHabitId.mockResolvedValue(mockStats);

      // Act
      const result = await service.getStatsByHabitId(mockHabitId);

      // Assert
      expect(actionTypesRepository.getStatsByHabitId).toHaveBeenCalledWith(mockHabitId);
      expect(result).toEqual(mockStats);
    });
  });

  describe('mapToResponse() - private method behavior verification', () => {
    it('should correctly map all action type properties to response DTO', async () => {
      // Arrange - Create an action type and test through public method
      const mockActionType = new ActionType(
        mockActionTypeId,
        ActionTypeName.create(mockActionTypeName),
        mockLogo,
        mockHabitId,
        fixedDate,
        new Date('2024-01-02T00:00:00.000Z'), // Different updated date
        5,
        lastActionDate
      );

      actionTypesRepository.findById.mockResolvedValue(mockActionType);

      // Act
      const result = await service.findOne(mockActionTypeId);

      // Assert - Verify all properties are correctly mapped
      expect(result).toEqual({
        id: mockActionTypeId,
        name: mockActionTypeName,
        logo: mockLogo,
        habitId: mockHabitId,
        totalActionsCount: 5,
        lastActionDate,
        createdAt: fixedDate,
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      });
    });
  });

  describe('logging behavior', () => {
    it('should log action type creation', async () => {
      // Arrange
      const createActionTypeDto: CreateActionTypeDto = {
        name: mockActionTypeName,
        habitId: mockHabitId,
      };
      const mockFile = createMockMulterFile();
      const expectedActionType = createMockActionType();

      actionTypesRepository.existsByNameAndHabitId.mockResolvedValue(false);
      cloudinaryService.uploadImage.mockResolvedValue({
        success: true,
        url: mockLogo,
        data: {
          publicId: 'test-logo',
          url: mockLogo,
          secureUrl: mockLogo,
          version: 1,
          signature: 'test-signature',
          width: 100,
          height: 100,
          format: 'png',
          resourceType: 'image',
          createdAt: '2024-01-01T00:00:00.000Z',
          tags: [],
          bytes: 1024,
          type: 'upload',
          etag: 'test-etag',
          placeholder: false,
        },
      });
      actionTypesRepository.create.mockResolvedValue(expectedActionType);

      const logSpy = jest.spyOn(Logger.prototype, 'log');

      // Act
      await service.create(createActionTypeDto, mockFile);

      // Assert
      expect(logSpy).toHaveBeenCalledWith(`Creating new action type: ${mockActionTypeName}`);
      expect(logSpy).toHaveBeenCalledWith(
        `Successfully created action type with id: ${mockActionTypeId}`
      );
    });

    it('should log other service operations', async () => {
      // Arrange
      const mockActionType = createMockActionType();
      actionTypesRepository.findById.mockResolvedValue(mockActionType);
      actionTypesRepository.findAll.mockResolvedValue({
        data: [mockActionType],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      const logSpy = jest.spyOn(Logger.prototype, 'log');

      // Act
      await service.findOne(mockActionTypeId);
      await service.findAll({ page: 1, limit: 10 });

      // Assert
      expect(logSpy).toHaveBeenCalledWith(`Fetching action type with id: ${mockActionTypeId}`);
      expect(logSpy).toHaveBeenCalledWith('Fetching action types - page: 1, limit: 10');
    });
  });

  describe('error handling edge cases', () => {
    it('should handle repository failures gracefully', async () => {
      // Arrange
      const databaseError = new Error('Database connection failed');
      actionTypesRepository.findAll.mockRejectedValue(databaseError);

      // Act & Assert
      await expect(service.findAll({ page: 1, limit: 10 })).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle malformed data from repository', async () => {
      // Arrange
      const malformedActionType = null; // Repository returns null unexpectedly
      actionTypesRepository.findById.mockResolvedValue(malformedActionType);

      // Act & Assert
      await expect(service.findOne(mockActionTypeId)).rejects.toThrow(NotFoundError);
    });

    it('should validate UUID format in service methods', async () => {
      // Arrange
      const invalidUUID = 'invalid-uuid-format' as UUID;

      // Act & Assert
      await expect(service.findOne(invalidUUID)).rejects.toThrow();
    });
  });
});
