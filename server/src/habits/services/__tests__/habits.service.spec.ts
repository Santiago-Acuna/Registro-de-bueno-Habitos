import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Habit } from '../../../domain/entities/habit.entity';
import {
  HabitComplexity,
  UUID,
  PaginatedResult,
  FilterOptions,
} from '../../../domain/shared/types/common';
import { IdentifierName } from '../../../domain/value-objects/identifier-name';
import { CloudinaryService } from '../../../helpers/cloudinary/cloudinary.service';
import { PaginatedResponseDto } from '../../../infrastructure/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../../infrastructure/dto/pagination-query.dto';
import {
  NotFoundError,
  ConflictError,
  ValidationException,
} from '../../../infrastructure/exceptions/app.exceptions';
import { CreateHabitDto } from '../../dto/create-habit.dto';
import { UpdateHabitDto } from '../../dto/update-habit.dto';
import { IHabitsRepository } from '../../interfaces/habits-repository.interface';
import { HabitsService } from '../habits.service';

// Mock implementations
const mockHabitsRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByName: jest.fn(),
};

const mockCloudinaryService = {
  uploadImage: jest.fn(),
};

// Mock uuid generation
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-123e4567-e89b-12d3-a456-426614174000'),
}));

describe('HabitsService', () => {
  let service: HabitsService;
  let habitsRepository: jest.Mocked<IHabitsRepository>;
  let cloudinaryService: jest.Mocked<CloudinaryService>;

  // Test data fixtures
  const mockHabitId: UUID = '123e4567-e89b-12d3-a456-426614174000';
  const mockHabitName = 'Morning Exercise';
  const mockLogo = 'https://example.com/logo.png';
  const fixedDate = new Date('2024-01-01T00:00:00.000Z');

  const createMockHabit = (overrides: Partial<any> = {}): Habit => {
    const habitName = IdentifierName.create(mockHabitName);
    const defaults = {
      id: mockHabitId,
      name: habitName,
      habitType: HabitComplexity.SIMPLE,
      logo: mockLogo,
      createdAt: fixedDate,
      updatedAt: fixedDate,
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
    // Clear all mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HabitsService,
        {
          provide: 'IHabitsRepository',
          useValue: mockHabitsRepository,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    service = module.get<HabitsService>(HabitsService);
    habitsRepository = module.get('IHabitsRepository');
    cloudinaryService = module.get(CloudinaryService);

    // Mock Logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  describe('create()', () => {
    const createHabitDto: CreateHabitDto = {
      name: mockHabitName,
      habitType: HabitComplexity.SIMPLE,
    };
    const mockFile = createMockMulterFile();

    it('should successfully create a new habit', async () => {
      // Arrange
      const expectedHabit = createMockHabit();
      habitsRepository.findByName.mockResolvedValue(null);
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
      habitsRepository.create.mockResolvedValue(expectedHabit);

      // Act
      const result = await service.create(createHabitDto, mockFile);

      // Assert
      expect(habitsRepository.findByName).toHaveBeenCalledWith(createHabitDto.name);
      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
        mockFile,
        expect.objectContaining({
          public_id: 'test-logo',
          folder: 'habits',
          resourceType: 'auto',
        })
      );
      expect(habitsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockHabitName,
          habitType: HabitComplexity.SIMPLE,
          logo: mockLogo,
        })
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: mockHabitId,
          name: mockHabitName,
          habitType: HabitComplexity.SIMPLE,
          logo: mockLogo,
        })
      );
    });

    it('should throw ConflictError when habit with same name already exists', async () => {
      // Arrange
      const existingHabit = createMockHabit();
      habitsRepository.findByName.mockResolvedValue(existingHabit);

      // Act & Assert
      await expect(service.create(createHabitDto, mockFile)).rejects.toThrow(ConflictError);
      await expect(service.create(createHabitDto, mockFile)).rejects.toThrow(
        `Habit with name '${createHabitDto.name}' already exists`
      );

      expect(cloudinaryService.uploadImage).not.toHaveBeenCalled();
      expect(habitsRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationException when image upload fails', async () => {
      // Arrange
      habitsRepository.findByName.mockResolvedValue(null);
      cloudinaryService.uploadImage.mockResolvedValue({
        success: false,
        error: { message: 'Invalid image format', name: 'ValidationError' },
      });

      // Act & Assert
      await expect(service.create(createHabitDto, mockFile)).rejects.toThrow(ValidationException);
      await expect(service.create(createHabitDto, mockFile)).rejects.toThrow(
        'Invalid image format'
      );

      expect(habitsRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationException when image upload has no error message', async () => {
      // Arrange
      habitsRepository.findByName.mockResolvedValue(null);
      cloudinaryService.uploadImage.mockResolvedValue({
        success: false,
      });

      // Act & Assert
      await expect(service.create(createHabitDto, mockFile)).rejects.toThrow(
        'Failed to upload image. Uncontrolled error'
      );
    });

    it('should throw ValidationException for invalid habit name during entity creation', async () => {
      // Arrange
      const invalidDto = { ...createHabitDto, name: '' };
      habitsRepository.findByName.mockResolvedValue(null);
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
    });

    it('should throw ValidationException for invalid logo during entity creation', async () => {
      // Arrange
      habitsRepository.findByName.mockResolvedValue(null);
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
      await expect(service.create(createHabitDto, mockFile)).rejects.toThrow(ValidationException);
    });

    it('should rethrow unexpected errors', async () => {
      // Arrange
      const unexpectedError = new Error('Database connection failed');
      habitsRepository.findByName.mockRejectedValue(unexpectedError);

      // Act & Assert
      await expect(service.create(createHabitDto, mockFile)).rejects.toThrow(
        'Database connection failed'
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
      const mockHabits = [createMockHabit(), createMockHabit()];
      const mockPaginatedResult: PaginatedResult<Habit> = {
        data: mockHabits,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      habitsRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      const result = await service.findAll(paginationQuery);

      // Assert
      expect(habitsRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, undefined);
      expect(result).toBeInstanceOf(PaginatedResponseDto);
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should return paginated list of habits with filters', async () => {
      // Arrange
      const filters: FilterOptions = { isActive: true };
      const mockHabits = [createMockHabit()];
      const mockPaginatedResult: PaginatedResult<Habit> = {
        data: mockHabits,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      habitsRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      const result = await service.findAll(paginationQuery, filters);

      // Assert
      expect(habitsRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, filters);
      expect(result.data).toHaveLength(1);
    });

    it('should use default pagination when values not provided', async () => {
      // Arrange
      const paginationQueryWithDefaults = {} as PaginationQueryDto;
      const mockPaginatedResult: PaginatedResult<Habit> = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      habitsRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      await service.findAll(paginationQueryWithDefaults);

      // Assert
      expect(habitsRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, undefined);
    });

    it('should map habit entities to response DTOs correctly', async () => {
      // Arrange
      const mockHabit = createMockHabit();
      const mockPaginatedResult: PaginatedResult<Habit> = {
        data: [mockHabit],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      habitsRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      const result = await service.findAll(paginationQuery);

      // Assert
      const habitResponse = result.data[0];
      expect(habitResponse).toEqual({
        id: mockHabit.id,
        name: mockHabit.name.getValue(),
        habitType: mockHabit.habitType,
        logo: mockHabit.logo,
        isActive: mockHabit.isActive,
        totalActionsCount: mockHabit.totalActionsCount,
        lastActionDate: mockHabit.lastActionDate,
        createdAt: mockHabit.createdAt,
        updatedAt: mockHabit.updatedAt,
      });
    });
  });

  describe('findOne()', () => {
    it('should return habit when found', async () => {
      // Arrange
      const mockHabit = createMockHabit();
      habitsRepository.findById.mockResolvedValue(mockHabit);

      // Act
      const result = await service.findOne(mockHabitId);

      // Assert
      expect(habitsRepository.findById).toHaveBeenCalledWith(mockHabitId);
      expect(result).toEqual(
        expect.objectContaining({
          id: mockHabitId,
          name: mockHabitName,
        })
      );
    });

    it('should throw NotFoundError when habit not found', async () => {
      // Arrange
      habitsRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(mockHabitId)).rejects.toThrow(NotFoundError);
      await expect(service.findOne(mockHabitId)).rejects.toThrow('Habit');
    });
  });

  describe('update()', () => {
    const updateHabitDto: UpdateHabitDto = {
      name: 'Updated Exercise Name',
    };

    it('should successfully update habit name', async () => {
      // Arrange
      const existingHabit = createMockHabit();
      const updatedHabit = existingHabit.updateName(updateHabitDto.name!);
      habitsRepository.findById.mockResolvedValue(existingHabit);
      habitsRepository.findByName.mockResolvedValue(null); // No name conflict
      habitsRepository.update.mockResolvedValue(updatedHabit);

      // Act
      const result = await service.update(mockHabitId, updateHabitDto);

      // Assert
      expect(habitsRepository.findById).toHaveBeenCalledWith(mockHabitId);
      expect(habitsRepository.findByName).toHaveBeenCalledWith(updateHabitDto.name);
      expect(habitsRepository.update).toHaveBeenCalledWith(
        mockHabitId,
        expect.objectContaining({
          name: expect.objectContaining({ getValue: expect.any(Function) }),
        })
      );
      expect(result.name).toBe(updateHabitDto.name);
    });

    it('should throw NotFoundError when habit does not exist', async () => {
      // Arrange
      habitsRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(mockHabitId, updateHabitDto)).rejects.toThrow(NotFoundError);

      expect(habitsRepository.findByName).not.toHaveBeenCalled();
      expect(habitsRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when new name already exists for different habit', async () => {
      // Arrange
      const existingHabit = createMockHabit();
      const anotherHabitId = 'another-habit-id';
      const anotherHabit = createMockHabit({ id: anotherHabitId });

      habitsRepository.findById.mockResolvedValue(existingHabit);
      habitsRepository.findByName.mockResolvedValue(anotherHabit);

      // Act & Assert
      await expect(service.update(mockHabitId, updateHabitDto)).rejects.toThrow(ConflictError);
      await expect(service.update(mockHabitId, updateHabitDto)).rejects.toThrow(
        `Habit with name '${updateHabitDto.name}' already exists`
      );

      expect(habitsRepository.update).not.toHaveBeenCalled();
    });

    it('should allow update when name belongs to same habit', async () => {
      // Arrange
      const existingHabit = createMockHabit();
      habitsRepository.findById.mockResolvedValue(existingHabit);
      habitsRepository.findByName.mockResolvedValue(existingHabit); // Same habit
      habitsRepository.update.mockResolvedValue(existingHabit);

      // Act
      const result = await service.update(mockHabitId, updateHabitDto);

      // Assert
      expect(habitsRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should not check name conflict when name is not being updated', async () => {
      // Arrange
      const updateWithoutName: UpdateHabitDto = {}; // No name update
      const existingHabit = createMockHabit();
      habitsRepository.findById.mockResolvedValue(existingHabit);
      habitsRepository.update.mockResolvedValue(existingHabit);

      // Act
      await service.update(mockHabitId, updateWithoutName);

      // Assert
      expect(habitsRepository.findByName).not.toHaveBeenCalled();
      expect(habitsRepository.update).toHaveBeenCalledWith(mockHabitId, existingHabit);
    });

    it('should not update when new name is same as current name', async () => {
      // Arrange
      const existingHabit = createMockHabit();
      const sameNameDto = { name: mockHabitName }; // Same as current name
      habitsRepository.findById.mockResolvedValue(existingHabit);
      habitsRepository.update.mockResolvedValue(existingHabit);

      // Act
      await service.update(mockHabitId, sameNameDto);

      // Assert
      expect(habitsRepository.findByName).not.toHaveBeenCalled();
    });

    it('should throw ValidationException for invalid habit name', async () => {
      // Arrange
      const invalidUpdateDto = { name: '' }; // Invalid name
      const existingHabit = createMockHabit();
      habitsRepository.findById.mockResolvedValue(existingHabit);
      habitsRepository.findByName.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(mockHabitId, invalidUpdateDto)).rejects.toThrow(
        ValidationException
      );
    });

    describe('logo update functionality', () => {
      const updateMockFile = createMockMulterFile({ originalname: 'new-logo.png' });
      const newLogoUrl = 'https://example.com/new-logo.png';

      it('should successfully update habit with new logo', async () => {
        // Arrange
        const existingHabit = createMockHabit();
        const updateDto: UpdateHabitDto = {};
        const updatedHabit = existingHabit.updateLogo(newLogoUrl);

        habitsRepository.findById.mockResolvedValue(existingHabit);
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
        habitsRepository.update.mockResolvedValue(updatedHabit);

        // Act
        const result = await service.update(mockHabitId, updateDto, updateMockFile);

        // Assert
        expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
          updateMockFile,
          expect.objectContaining({
            public_id: 'new-logo',
            folder: 'habits',
            resourceType: 'auto',
          })
        );
        expect(habitsRepository.update).toHaveBeenCalledWith(
          mockHabitId,
          expect.objectContaining({
            logo: newLogoUrl,
          })
        );
        expect(result.logo).toBe(newLogoUrl);
      });

      it('should successfully update habit name and logo together', async () => {
        // Arrange
        const existingHabit = createMockHabit();
        const updateDto: UpdateHabitDto = {
          name: 'Updated Name'
        };
        let updatedHabit = existingHabit.updateName(updateDto.name!);
        updatedHabit = updatedHabit.updateLogo(newLogoUrl);

        habitsRepository.findById.mockResolvedValue(existingHabit);
        habitsRepository.findByName.mockResolvedValue(null);
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
        habitsRepository.update.mockResolvedValue(updatedHabit);

        // Act
        const result = await service.update(mockHabitId, updateDto, updateMockFile);

        // Assert
        expect(habitsRepository.findByName).toHaveBeenCalledWith(updateDto.name);
        expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(updateMockFile, expect.any(Object));
        expect(result.name).toBe(updateDto.name);
        expect(result.logo).toBe(newLogoUrl);
      });

      it('should throw ValidationException when logo upload fails', async () => {
        // Arrange
        const existingHabit = createMockHabit();
        const updateWithLogo: UpdateHabitDto = {};

        habitsRepository.findById.mockResolvedValue(existingHabit);
        cloudinaryService.uploadImage.mockResolvedValue({
          success: false,
          error: { message: 'Invalid image format', name: 'ValidationError' },
        });

        // Act & Assert
        await expect(service.update(mockHabitId, updateWithLogo, updateMockFile)).rejects.toThrow(
          ValidationException
        );
        await expect(service.update(mockHabitId, updateWithLogo, updateMockFile)).rejects.toThrow(
          'Invalid image format'
        );

        expect(habitsRepository.update).not.toHaveBeenCalled();
      });

      it('should throw ValidationException when logo upload has no error message', async () => {
        // Arrange
        const existingHabit = createMockHabit();
        const updateWithLogo: UpdateHabitDto = {};

        habitsRepository.findById.mockResolvedValue(existingHabit);
        cloudinaryService.uploadImage.mockResolvedValue({
          success: false,
        });

        // Act & Assert
        await expect(service.update(mockHabitId, updateWithLogo, updateMockFile)).rejects.toThrow(
          'Failed to upload image. Uncontrolled error'
        );
      });

      it('should throw ValidationException for invalid logo during entity update', async () => {
        // Arrange
        const existingHabit = createMockHabit();
        const updateWithLogo: UpdateHabitDto = {};

        habitsRepository.findById.mockResolvedValue(existingHabit);
        cloudinaryService.uploadImage.mockResolvedValue({
          success: true,
          url: '', // Invalid empty logo URL
          data: {
            publicId: 'new-logo',
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
        await expect(service.update(mockHabitId, updateWithLogo, updateMockFile)).rejects.toThrow(
          ValidationException
        );
        await expect(service.update(mockHabitId, updateWithLogo, updateMockFile)).rejects.toThrow(
          'Logo must be a non-empty string'
        );
      });

      it('should validate logo file size constraints', async () => {
        // Arrange
        const existingHabit = createMockHabit();
        const largeLogo = 'x'.repeat(3 * 1024 * 1024); // 3MB string (exceeds 2MB limit)
        const updateWithLogo: UpdateHabitDto = {};

        habitsRepository.findById.mockResolvedValue(existingHabit);
        cloudinaryService.uploadImage.mockResolvedValue({
          success: true,
          url: largeLogo,
          data: {
            publicId: 'new-logo',
            url: largeLogo,
            secureUrl: largeLogo,
            version: 1,
            signature: 'test-signature',
            width: 100,
            height: 100,
            format: 'png',
            resourceType: 'image',
            createdAt: '2024-01-01T00:00:00.000Z',
            tags: [],
            bytes: 3 * 1024 * 1024,
            type: 'upload',
            etag: 'test-etag',
            placeholder: false,
          },
        });

        // Act & Assert
        await expect(service.update(mockHabitId, updateWithLogo, updateMockFile)).rejects.toThrow(
          ValidationException
        );
        await expect(service.update(mockHabitId, updateWithLogo, updateMockFile)).rejects.toThrow(
          'Logo size cannot exceed 2MB'
        );
      });

      it('should not update logo when no logo is provided in update', async () => {
        // Arrange
        const existingHabit = createMockHabit();
        const updateWithoutLogo: UpdateHabitDto = { name: 'Updated Name' };
        const updatedHabit = existingHabit.updateName(updateWithoutLogo.name!);

        habitsRepository.findById.mockResolvedValue(existingHabit);
        habitsRepository.findByName.mockResolvedValue(null);
        habitsRepository.update.mockResolvedValue(updatedHabit);

        // Act
        await service.update(mockHabitId, updateWithoutLogo);

        // Assert
        expect(cloudinaryService.uploadImage).not.toHaveBeenCalled();
        expect(habitsRepository.update).toHaveBeenCalledWith(
          mockHabitId,
          expect.objectContaining({
            logo: existingHabit.logo, // Should keep original logo
          })
        );
      });
    });
  });

  describe('remove()', () => {
    it('should successfully remove existing habit', async () => {
      // Arrange
      const existingHabit = createMockHabit();
      habitsRepository.findById.mockResolvedValue(existingHabit);
      habitsRepository.delete.mockResolvedValue(undefined);

      // Act
      await service.remove(mockHabitId);

      // Assert
      expect(habitsRepository.findById).toHaveBeenCalledWith(mockHabitId);
      expect(habitsRepository.delete).toHaveBeenCalledWith(mockHabitId);
    });

    it('should throw NotFoundError when habit does not exist', async () => {
      // Arrange
      habitsRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(mockHabitId)).rejects.toThrow(NotFoundError);

      expect(habitsRepository.delete).not.toHaveBeenCalled();
    });
  });


  describe('mapToResponse() - private method behavior verification', () => {
    it('should correctly map all habit properties to response DTO', async () => {
      // Arrange - Create a habit and test through public method
      const mockHabit = new Habit(
        mockHabitId,
        IdentifierName.create(mockHabitName),
        HabitComplexity.COMPLEX,
        mockLogo,
        fixedDate,
        new Date('2024-01-02T00:00:00.000Z'), // Different updated date
        false, // inactive
        5,
        new Date('2024-01-01T12:00:00.000Z') // Last action date
      );

      habitsRepository.findById.mockResolvedValue(mockHabit);

      // Act
      const result = await service.findOne(mockHabitId);

      // Assert - Verify all properties are correctly mapped
      expect(result).toEqual({
        id: mockHabitId,
        name: mockHabitName,
        habitType: HabitComplexity.COMPLEX,
        logo: mockLogo,
        isActive: false,
        totalActionsCount: 5,
        lastActionDate: new Date('2024-01-01T12:00:00.000Z'),
        createdAt: fixedDate,
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      });
    });
  });

  describe('logging behavior', () => {
    it('should log habit creation', async () => {
      // Arrange
      const createHabitDto: CreateHabitDto = {
        name: mockHabitName,
        habitType: HabitComplexity.SIMPLE,
      };
      const mockFile = createMockMulterFile();
      const expectedHabit = createMockHabit();

      habitsRepository.findByName.mockResolvedValue(null);
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
      habitsRepository.create.mockResolvedValue(expectedHabit);

      const logSpy = jest.spyOn(Logger.prototype, 'log');

      // Act
      await service.create(createHabitDto, mockFile);

      // Assert
      expect(logSpy).toHaveBeenCalledWith(`Creating new habit: ${mockHabitName}`);
      expect(logSpy).toHaveBeenCalledWith(`Successfully created habit with id: ${mockHabitId}`);
    });

    it('should log other service operations', async () => {
      // Arrange
      const mockHabit = createMockHabit();
      habitsRepository.findById.mockResolvedValue(mockHabit);
      habitsRepository.findAll.mockResolvedValue({
        data: [mockHabit],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      const logSpy = jest.spyOn(Logger.prototype, 'log');

      // Act
      await service.findOne(mockHabitId);
      await service.findAll({ page: 1, limit: 10 });

      // Assert
      expect(logSpy).toHaveBeenCalledWith(`Fetching habit with id: ${mockHabitId}`);
      expect(logSpy).toHaveBeenCalledWith('Fetching habits - page: 1, limit: 10');
    });
  });
});
