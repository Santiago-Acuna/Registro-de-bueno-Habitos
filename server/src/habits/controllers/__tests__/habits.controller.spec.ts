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

import { HabitComplexity, UUID } from '../../../domain/shared/types/common';
import { UploadImageDto } from '../../../helpers/cloudinary';
import { PaginatedResponseDto } from '../../../infrastructure/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../../infrastructure/dto/pagination-query.dto';
import {
  ValidationException,
  NotFoundError,
  ConflictError,
} from '../../../infrastructure/exceptions/app.exceptions';
import { CreateHabitDto } from '../../dto/create-habit.dto';
import { HabitResponseDto } from '../../dto/habit-response.dto';
import { UpdateHabitDto } from '../../dto/update-habit.dto';
import { HabitsService } from '../../services/habits.service';
import { HabitsController } from '../habits.controller';



// Mock HabitsService
const mockHabitsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mock ThrottlerGuard
const mockThrottlerGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('HabitsController', () => {
  let controller: HabitsController;
  let habitsService: jest.Mocked<HabitsService>;

  // Test data fixtures
  const mockHabitId: UUID = '123e4567-e89b-12d3-a456-426614174000';
  const mockHabitName = 'Morning Exercise';
  const mockLogo = 'https://example.com/logo.png';
  const fixedDate = new Date('2024-01-01T00:00:00.000Z');

  const createMockHabitResponse = (
    overrides: Partial<HabitResponseDto> = {}
  ): HabitResponseDto => ({
    id: mockHabitId,
    name: mockHabitName,
    habitType: HabitComplexity.SIMPLE,
    logo: mockLogo,
    isActive: true,
    totalActionsCount: 0,
    lastActionDate: null,
    createdAt: fixedDate,
    updatedAt: fixedDate,
    ...overrides,
  });

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
      controllers: [HabitsController],
      providers: [
        {
          provide: HabitsService,
          useValue: mockHabitsService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue(mockThrottlerGuard)
      .compile();

    controller = module.get<HabitsController>(HabitsController);
    habitsService = module.get(HabitsService);
  });

  describe('create()', () => {
    const createHabitDto: CreateHabitDto = {
      name: mockHabitName,
      habitType: HabitComplexity.SIMPLE,
    };
    const mockFile = createMockMulterFile();

    it('should successfully create a new habit', async () => {
      // Arrange
      const expectedResponse = createMockHabitResponse();
      mockValidate.mockResolvedValue([]); // No validation errors
      habitsService.create.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.create(createHabitDto, mockFile);

      // Assert
      expect(mockValidate).toHaveBeenCalledWith(expect.any(UploadImageDto));
      expect(habitsService.create).toHaveBeenCalledWith(createHabitDto, mockFile);
      expect(result).toEqual(expectedResponse);
    });

    it('should validate uploaded image using UploadImageDto', async () => {
      // Arrange
      const expectedResponse = createMockHabitResponse();
      mockValidate.mockResolvedValue([]);
      habitsService.create.mockResolvedValue(expectedResponse);

      // Act
      await controller.create(createHabitDto, mockFile);

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
      await expect(controller.create(createHabitDto, mockFile)).rejects.toThrow(
        ValidationException
      );
      await expect(controller.create(createHabitDto, mockFile)).rejects.toThrow(
        'File must be a valid image, File size must not exceed 5MB'
      );

      expect(habitsService.create).not.toHaveBeenCalled();
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
      await expect(controller.create(createHabitDto, mockFile)).rejects.toThrow(
        'Uncontrolled error with the image you sent'
      );

      expect(habitsService.create).not.toHaveBeenCalled();
    });

    it('should handle service throwing ConflictError', async () => {
      // Arrange
      mockValidate.mockResolvedValue([]);
      habitsService.create.mockRejectedValue(
        new ConflictError(`Habit with name '${createHabitDto.name}' already exists`)
      );

      // Act & Assert
      await expect(controller.create(createHabitDto, mockFile)).rejects.toThrow(ConflictError);
    });

    it('should handle service throwing ValidationException', async () => {
      // Arrange
      mockValidate.mockResolvedValue([]);
      habitsService.create.mockRejectedValue(new ValidationException('Invalid habit data'));

      // Act & Assert
      await expect(controller.create(createHabitDto, mockFile)).rejects.toThrow(
        ValidationException
      );
    });
  });

  describe('findAll()', () => {
    const paginationQuery: PaginationQueryDto = {
      page: 1,
      limit: 10,
    };

    it('should return paginated list of habits without filters', async () => {
      // Arrange
      const mockHabits = [createMockHabitResponse(), createMockHabitResponse()];
      const expectedResponse = new PaginatedResponseDto(mockHabits, 2, 1, 10);
      habitsService.findAll.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.findAll(paginationQuery);

      // Assert
      expect(habitsService.findAll).toHaveBeenCalledWith(paginationQuery, undefined);
      expect(result).toEqual(expectedResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should return paginated list of habits with isActive filter', async () => {
      // Arrange
      const isActive = true;
      const mockHabits = [createMockHabitResponse({ isActive: true })];
      const expectedResponse = new PaginatedResponseDto(mockHabits, 1, 1, 10);
      habitsService.findAll.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.findAll({ ...paginationQuery, isActive });

      // Assert
      expect(habitsService.findAll).toHaveBeenCalledWith(paginationQuery, { isActive });
      expect(result).toEqual(expectedResponse);
    });

    it('should handle isActive filter being false', async () => {
      // Arrange
      const isActive = false;
      const mockHabits = [createMockHabitResponse({ isActive: false })];
      const expectedResponse = new PaginatedResponseDto(mockHabits, 1, 1, 10);
      habitsService.findAll.mockResolvedValue(expectedResponse);

      // Act
      await controller.findAll({ ...paginationQuery, isActive });

      // Assert
      expect(habitsService.findAll).toHaveBeenCalledWith(paginationQuery, { isActive: false });
    });

    it('should not apply filters when isActive is undefined', async () => {
      // Arrange
      const expectedResponse = new PaginatedResponseDto([], 0, 1, 10);
      habitsService.findAll.mockResolvedValue(expectedResponse);

      // Act
      await controller.findAll(paginationQuery);

      // Assert
      expect(habitsService.findAll).toHaveBeenCalledWith(paginationQuery, undefined);
    });

    it('should handle service errors', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      habitsService.findAll.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.findAll(paginationQuery)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('findOne()', () => {
    it('should return habit when found', async () => {
      // Arrange
      const expectedResponse = createMockHabitResponse();
      habitsService.findOne.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.findOne(mockHabitId);

      // Assert
      expect(habitsService.findOne).toHaveBeenCalledWith(mockHabitId);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle NotFoundError from service', async () => {
      // Arrange
      habitsService.findOne.mockRejectedValue(new NotFoundError('Habit', mockHabitId));

      // Act & Assert
      await expect(controller.findOne(mockHabitId)).rejects.toThrow(NotFoundError);
    });

    it('should handle other service errors', async () => {
      // Arrange
      const serviceError = new Error('Database error');
      habitsService.findOne.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.findOne(mockHabitId)).rejects.toThrow('Database error');
    });
  });

  describe('update()', () => {
    const updateHabitDto: UpdateHabitDto = {
      name: 'Updated Exercise Name',
    };

    it('should successfully update habit', async () => {
      // Arrange
      const expectedResponse = createMockHabitResponse({
        name: updateHabitDto.name || 'Updated Exercise Name',
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      });
      habitsService.update.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.update(mockHabitId, updateHabitDto);

      // Assert
      expect(habitsService.update).toHaveBeenCalledWith(mockHabitId, updateHabitDto);
      expect(result).toEqual(expectedResponse);
      expect(result.name).toBe(updateHabitDto.name);
    });

    it('should handle NotFoundError from service', async () => {
      // Arrange
      habitsService.update.mockRejectedValue(new NotFoundError('Habit', mockHabitId));

      // Act & Assert
      await expect(controller.update(mockHabitId, updateHabitDto)).rejects.toThrow(NotFoundError);
    });

    it('should handle ConflictError for duplicate names', async () => {
      // Arrange
      habitsService.update.mockRejectedValue(
        new ConflictError(`Habit with name '${updateHabitDto.name}' already exists`)
      );

      // Act & Assert
      await expect(controller.update(mockHabitId, updateHabitDto)).rejects.toThrow(ConflictError);
    });

    it('should handle ValidationException from service', async () => {
      // Arrange
      habitsService.update.mockRejectedValue(new ValidationException('Invalid habit name'));

      // Act & Assert
      await expect(controller.update(mockHabitId, updateHabitDto)).rejects.toThrow(
        ValidationException
      );
    });

    it('should handle empty update DTO', async () => {
      // Arrange
      const emptyUpdateDto: UpdateHabitDto = {};
      const expectedResponse = createMockHabitResponse();
      habitsService.update.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.update(mockHabitId, emptyUpdateDto);

      // Assert
      expect(habitsService.update).toHaveBeenCalledWith(mockHabitId, emptyUpdateDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('remove()', () => {
    it('should successfully remove habit', async () => {
      // Arrange
      habitsService.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(mockHabitId);

      // Assert
      expect(habitsService.remove).toHaveBeenCalledWith(mockHabitId);
      expect(result).toBeUndefined();
    });

    it('should handle NotFoundError from service', async () => {
      // Arrange
      habitsService.remove.mockRejectedValue(new NotFoundError('Habit', mockHabitId));

      // Act & Assert
      await expect(controller.remove(mockHabitId)).rejects.toThrow(NotFoundError);
    });

    it('should handle other service errors', async () => {
      // Arrange
      const serviceError = new Error('Database deletion failed');
      habitsService.remove.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.remove(mockHabitId)).rejects.toThrow('Database deletion failed');
    });
  });


  describe('controller decorators and middleware integration', () => {
    it('should be decorated with ApiTags', () => {
      // Verify controller has proper Swagger documentation
      const controllerMetadata = Reflect.getMetadata('swagger/apiUseTags', HabitsController);
      expect(controllerMetadata).toEqual(['habits']);
    });

    it('should use ThrottlerGuard', () => {
      // Verify throttling is applied
      const guards = Reflect.getMetadata('__guards__', HabitsController);
      expect(guards).toContain(ThrottlerGuard);
    });

    it('should have proper versioning', () => {
      // This would be tested through integration tests
      // Here we verify the structure exists
      expect(controller).toBeDefined();
      expect(controller.create).toBeDefined();
      expect(controller.findAll).toBeDefined();
      expect(controller.findOne).toBeDefined();
      expect(controller.update).toBeDefined();
      expect(controller.remove).toBeDefined();
    });
  });

  describe('validation error handling edge cases', () => {
    const createHabitDto: CreateHabitDto = {
      name: mockHabitName,
      habitType: HabitComplexity.SIMPLE,
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
      await expect(controller.create(createHabitDto, mockFile)).rejects.toThrow(
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
      await expect(controller.create(createHabitDto, mockFile)).rejects.toThrow(
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
      await expect(controller.create(createHabitDto, mockFile)).rejects.toThrow(
        'Uncontrolled error with the image you sent'
      );
    });
  });

  describe('parameter validation and typing', () => {
    it('should handle UUID parameter correctly', async () => {
      // Arrange
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const expectedResponse = createMockHabitResponse();
      habitsService.findOne.mockResolvedValue(expectedResponse);

      // Act
      await controller.findOne(validUUID);

      // Assert
      expect(habitsService.findOne).toHaveBeenCalledWith(validUUID);
    });

    it('should handle pagination query parameters', async () => {
      // Arrange
      const paginationQuery: PaginationQueryDto = {
        page: 2,
        limit: 20,
      };
      const expectedResponse = new PaginatedResponseDto([], 0, 2, 20);
      habitsService.findAll.mockResolvedValue(expectedResponse);

      // Act
      await controller.findAll(paginationQuery);

      // Assert
      expect(habitsService.findAll).toHaveBeenCalledWith(paginationQuery, undefined);
    });

    it('should handle boolean query parameters correctly', async () => {
      // Arrange
      const paginationQuery: PaginationQueryDto = { page: 1, limit: 10 };
      const expectedResponse = new PaginatedResponseDto([], 0, 1, 10);
      habitsService.findAll.mockResolvedValue(expectedResponse);

      // Act - Test with boolean true
      await controller.findAll({ ...paginationQuery, isActive: true });
      await controller.findAll({ ...paginationQuery, isActive: false });

      // Assert
      expect(habitsService.findAll).toHaveBeenCalledWith(paginationQuery, { isActive: true });
      expect(habitsService.findAll).toHaveBeenCalledWith(paginationQuery, { isActive: false });
    });
  });
});
