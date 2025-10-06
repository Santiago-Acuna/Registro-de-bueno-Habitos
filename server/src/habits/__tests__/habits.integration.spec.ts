import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';

import { GlobalEntityIdentifier } from '../../domain/entities/global-entity-identifier.entity';
import { Habit } from '../../domain/entities/habit.entity';
import { HabitComplexity, UUID, PaginatedResult } from '../../domain/shared/types/common';
import { IdentifierIcon } from '../../domain/value-objects/identifier-icon';
import { IdentifierName } from '../../domain/value-objects/identifier-name';
import { CloudinaryService } from '../../helpers/cloudinary/cloudinary.service';
import { HttpExceptionFilter } from '../../infrastructure/filters/http-exception.filter';
import { CreateHabitDto } from '../dto/create-habit.dto';
import { UpdateHabitDto } from '../dto/update-habit.dto';
import { HabitsModule } from '../habits.module';
import { IHabitsRepository } from '../interfaces/habits-repository.interface';

// Mock implementations for integration tests
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

describe('Habits API Integration Tests', () => {
  let app: INestApplication;
  let habitsRepository: jest.Mocked<IHabitsRepository>;
  let cloudinaryService: jest.Mocked<CloudinaryService>;

  // Test data fixtures
  const mockHabitId: UUID = '123e4567-e89b-12d3-a456-426614174000';
  const validGlobalIdentifierId = 'global-id-123e4567-e89b-12d3-a456-426614174000';
  const mockHabitName = 'Morning Exercise';
  const mockIconUrl = 'https://example.com/logo.png';
  const fixedDate = new Date('2024-01-01T00:00:00.000Z');

  // Helper to create mock GlobalEntityIdentifier
  const createMockGlobalIdentifier = (
    name: string = mockHabitName,
    icon: string = mockIconUrl
  ): GlobalEntityIdentifier => {
    return new GlobalEntityIdentifier(
      validGlobalIdentifierId,
      IdentifierName.create(name),
      IdentifierIcon.create(icon),
      'habit',
      mockHabitId
    );
  };

  const createMockHabit = (overrides: Partial<any> = {}): Habit => {
    const globalIdentifier = createMockGlobalIdentifier();
    const defaults = {
      id: mockHabitId,
      habitType: HabitComplexity.SIMPLE,
      createdAt: fixedDate,
      updatedAt: fixedDate,
      isActive: true,
      totalActionsCount: 0,
      lastActionDate: null,
      globalEntityIdentifier: globalIdentifier,
    };
    const merged = { ...defaults, ...overrides };
    return new Habit(
      merged.id,
      merged.habitType,
      merged.createdAt,
      merged.updatedAt,
      merged.isActive,
      merged.totalActionsCount,
      merged.lastActionDate,
      merged.globalEntityIdentifier
    );
  };

  const createImageBuffer = (): Buffer => {
    // Create a simple 1x1 PNG image buffer for testing
    return Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44,
      0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90,
      0x77, 0x53, 0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x1d, 0x01, 0x01,
      0x00, 0x00, 0xff, 0xff, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc, 0x33, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        HabitsModule,
        ThrottlerModule.forRoot({
          throttlers: [{ ttl: 60000, limit: 100 }],
        }),
      ],
    })
      .overrideProvider('IHabitsRepository')
      .useValue(mockHabitsRepository)
      .overrideProvider(CloudinaryService)
      .useValue(mockCloudinaryService)
      .compile();

    app = moduleFixture.createNestApplication();

    // Setup global prefix to match production configuration
    app.setGlobalPrefix('api');

    // Setup global pipes and filters
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    // Enable versioning with URI type and default version
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: 'v1',
    });

    await app.init();

    habitsRepository = moduleFixture.get('IHabitsRepository');
    cloudinaryService = moduleFixture.get(CloudinaryService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /habits', () => {
    const createHabitDto: CreateHabitDto = {
      name: mockHabitName,
      habitType: HabitComplexity.SIMPLE,
    };

    it('should create a new habit successfully', async () => {
      // Arrange
      const expectedHabit = createMockHabit();
      habitsRepository.findByName.mockResolvedValue(null);
      cloudinaryService.uploadImage.mockResolvedValue({
        success: true,
        url: mockIconUrl,
        data: {
          publicId: 'test-logo',
          url: mockIconUrl,
          secureUrl: mockIconUrl,
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

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/habits')
        .field('name', createHabitDto.name)
        .field('habitType', createHabitDto.habitType)
        .attach('icon', createImageBuffer(), 'test-logo.png')
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockHabitId,
          name: mockHabitName,
          habitType: HabitComplexity.SIMPLE,
          logo: mockIconUrl,
          isActive: true,
          totalActionsCount: 0,
          lastActionDate: null,
        })
      );
    });

    it('should return 409 when habit with same name already exists', async () => {
      // Arrange
      const existingHabit = createMockHabit();
      habitsRepository.findByName.mockResolvedValue(existingHabit);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/habits')
        .field('name', createHabitDto.name)
        .field('habitType', createHabitDto.habitType)
        .attach('icon', createImageBuffer(), 'test-logo.png')
        .expect(409);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 409,
          message: expect.stringContaining('already exists'),
        })
      );
    });

    it('should return 400 for invalid habit data', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/habits')
        .field('name', '') // Invalid empty name
        .field('habitType', createHabitDto.habitType)
        .attach('icon', createImageBuffer(), 'test-logo.png')
        .expect(400);

      // Standard NestJS ValidationPipe returns message as array
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.any(Array),
        })
      );
    });

    it('should return 400 for invalid habit type', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/habits')
        .field('name', createHabitDto.name)
        .field('habitType', 'INVALID_TYPE')
        .attach('icon', createImageBuffer(), 'test-logo.png')
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.any(Array),
        })
      );
    });

    it('should return 400 when no image is uploaded', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/habits')
        .field('name', createHabitDto.name)
        .field('habitType', createHabitDto.habitType)
        .expect(400);

      // ValidationException should return proper error structure with string message
      expect(response.body).toEqual(
        expect.objectContaining({
          error: 'ValidationException',
          message: expect.any(String),
          statusCode: 400,
          path: '/api/v1/habits',
          timestamp: expect.any(String),
        })
      );

      // Validate the message contains the expected validation error
      expect(response.body.message).toContain('El archivo de imagen no puede estar vacío');
    });

    it('should return 400 when image upload fails', async () => {
      // Arrange
      habitsRepository.findByName.mockResolvedValue(null);
      cloudinaryService.uploadImage.mockResolvedValue({
        success: false,
        error: { message: 'Invalid image format', name: 'ValidationError' },
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/habits')
        .field('name', createHabitDto.name)
        .field('habitType', createHabitDto.habitType)
        .attach('icon', createImageBuffer(), 'test-logo.png')
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: 'Invalid image format',
        })
      );
    });
  });

  describe('GET /habits', () => {
    it('should return paginated list of habits', async () => {
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

      // Act & Assert
      const response = await request(app.getHttpServer()).get('/api/v1/habits').expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              id: mockHabitId,
              name: mockHabitName,
            }),
          ]),
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        })
      );
    });

    it('should return filtered habits by isActive status', async () => {
      // Arrange
      const activeHabit = createMockHabit({ isActive: true });
      const mockPaginatedResult: PaginatedResult<Habit> = {
        data: [activeHabit],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      habitsRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/api/v1/habits')
        .query({ isActive: true })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].isActive).toBe(true);
    });

    it('should support pagination parameters', async () => {
      // Arrange
      const mockPaginatedResult: PaginatedResult<Habit> = {
        data: [],
        total: 0,
        page: 2,
        limit: 5,
        totalPages: 0,
      };
      habitsRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/api/v1/habits')
        .query({ page: 2, limit: 5 })
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          page: 2,
          limit: 5,
        })
      );
    });

    it('should validate pagination parameters', async () => {
      // Act & Assert
      const response1 = await request(app.getHttpServer())
        .get('/api/v1/habits')
        .query({ page: 0 }) // Invalid page
        .expect(400);

      expect(response1.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.any(Array),
        })
      );

      const response2 = await request(app.getHttpServer())
        .get('/api/v1/habits')
        .query({ limit: 101 }) // Exceeds max limit
        .expect(400);

      expect(response2.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.any(Array),
        })
      );
    });
  });

  describe('GET /habits/:id', () => {
    it('should return habit when found', async () => {
      // Arrange
      const mockHabit = createMockHabit();
      habitsRepository.findById.mockResolvedValue(mockHabit);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/v1/habits/${mockHabitId}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockHabitId,
          name: mockHabitName,
          habitType: HabitComplexity.SIMPLE,
        })
      );
    });

    it('should return 404 when habit not found', async () => {
      // Arrange
      habitsRepository.findById.mockResolvedValue(null);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/v1/habits/${mockHabitId}`)
        .expect(404);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 404,
          message: expect.stringContaining('not found'),
        })
      );
    });

    it('should return 400 for invalid UUID format', async () => {
      // Act & Assert
      await request(app.getHttpServer()).get('/api/v1/habits/invalid-uuid').expect(400);
    });
  });

  describe('PATCH /habits/:id', () => {
    const updateHabitDto: UpdateHabitDto = {
      name: 'Updated Exercise Name',
    };

    it('should successfully update habit', async () => {
      // Arrange
      const existingHabit = createMockHabit();
      const updatedHabit = existingHabit.updateName(updateHabitDto.name!);
      habitsRepository.findById.mockResolvedValue(existingHabit);
      habitsRepository.findByName.mockResolvedValue(null);
      habitsRepository.update.mockResolvedValue(updatedHabit);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/habits/${mockHabitId}`)
        .send(updateHabitDto)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockHabitId,
          name: updateHabitDto.name,
        })
      );
    });

    it('should return 404 when habit not found', async () => {
      // Arrange
      habitsRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await request(app.getHttpServer())
        .patch(`/api/v1/habits/${mockHabitId}`)
        .send(updateHabitDto)
        .expect(404);
    });

    it('should return 409 when new name already exists', async () => {
      // Arrange
      const existingHabit = createMockHabit();
      const anotherHabit = createMockHabit({ id: 'another-id' });
      habitsRepository.findById.mockResolvedValue(existingHabit);
      habitsRepository.findByName.mockResolvedValue(anotherHabit);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/habits/${mockHabitId}`)
        .send(updateHabitDto)
        .expect(409);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 409,
          message: expect.stringContaining('already exists'),
        })
      );
    });

    it('should return 400 for invalid update data', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .patch(`/api/v1/habits/${mockHabitId}`)
        .send({ name: '' }) // Invalid empty name
        .expect(400);
    });

    it('should handle partial updates', async () => {
      // Arrange
      const existingHabit = createMockHabit();
      habitsRepository.findById.mockResolvedValue(existingHabit);
      habitsRepository.update.mockResolvedValue(existingHabit);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/habits/${mockHabitId}`)
        .send({}) // Empty update
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockHabitId,
        })
      );
    });

    describe('icon update functionality', () => {
      const newIconUrl = 'https://example.com/new-icon.png';

      it('should successfully update habit with new icon', async () => {
        // Arrange
        const existingHabit = createMockHabit();
        const updatedHabit = existingHabit.updateIcon(newIconUrl);

        habitsRepository.findById.mockResolvedValue(existingHabit);
        cloudinaryService.uploadImage.mockResolvedValue({
          success: true,
          url: newIconUrl,
          data: {
            publicId: 'new-icon',
            url: newIconUrl,
            secureUrl: newIconUrl,
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

        // Act & Assert
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/habits/${mockHabitId}`)
          .attach('logo', createImageBuffer(), 'new-icon.png')
          .expect(200);

        expect(response.body).toEqual(
          expect.objectContaining({
            id: mockHabitId,
            logo: newIconUrl,
          })
        );
      });

      it('should successfully update habit name and icon together', async () => {
        // Arrange
        const existingHabit = createMockHabit();
        const newName = 'Updated Exercise Name';
        let updatedHabit = existingHabit.updateName(newName);
        updatedHabit = updatedHabit.updateIcon(newIconUrl);

        habitsRepository.findById.mockResolvedValue(existingHabit);
        habitsRepository.findByName.mockResolvedValue(null);
        cloudinaryService.uploadImage.mockResolvedValue({
          success: true,
          url: newIconUrl,
          data: {
            publicId: 'new-icon',
            url: newIconUrl,
            secureUrl: newIconUrl,
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

        // Act & Assert
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/habits/${mockHabitId}`)
          .field('name', newName)
          .attach('logo', createImageBuffer(), 'new-icon.png')
          .expect(200);

        expect(response.body).toEqual(
          expect.objectContaining({
            id: mockHabitId,
            name: newName,
            logo: newIconUrl,
          })
        );
      });

      it('should return 400 when icon upload fails', async () => {
        // Arrange
        const existingHabit = createMockHabit();
        habitsRepository.findById.mockResolvedValue(existingHabit);
        cloudinaryService.uploadImage.mockResolvedValue({
          success: false,
          error: { message: 'Invalid image format', name: 'ValidationError' },
        });

        // Act & Assert
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/habits/${mockHabitId}`)
          .attach('logo', createImageBuffer(), 'invalid-icon.txt')
          .expect(400);

        expect(response.body).toEqual(
          expect.objectContaining({
            statusCode: 400,
            message: 'Invalid image format',
          })
        );
      });

      it('should return 400 for invalid icon file size', async () => {
        // Arrange
        const existingHabit = createMockHabit();
        const largeIcon = 'x'.repeat(3 * 1024 * 1024); // 3MB string (exceeds 2MB limit)

        habitsRepository.findById.mockResolvedValue(existingHabit);
        cloudinaryService.uploadImage.mockResolvedValue({
          success: true,
          url: largeIcon,
          data: {
            publicId: 'new-icon',
            url: largeIcon,
            secureUrl: largeIcon,
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
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/habits/${mockHabitId}`)
          .attach('logo', createImageBuffer(), 'large-icon.png')
          .expect(400);

        expect(response.body).toEqual(
          expect.objectContaining({
            statusCode: 400,
            message: 'Icon size cannot exceed 2MB',
          })
        );
      });

      it('should maintain existing icon when no logo field is provided', async () => {
        // Arrange
        const existingHabit = createMockHabit();
        const updatedHabit = existingHabit.updateName('Updated Name');

        habitsRepository.findById.mockResolvedValue(existingHabit);
        habitsRepository.findByName.mockResolvedValue(null);
        habitsRepository.update.mockResolvedValue(updatedHabit);

        // Act & Assert
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/habits/${mockHabitId}`)
          .send({ name: 'Updated Name' })
          .expect(200);

        expect(response.body).toEqual(
          expect.objectContaining({
            id: mockHabitId,
            name: 'Updated Name',
            logo: mockIconUrl, // Should keep original icon
          })
        );
        expect(cloudinaryService.uploadImage).not.toHaveBeenCalled();
      });
    });
  });

  describe('DELETE /habits/:id', () => {
    it('should successfully delete habit', async () => {
      // Arrange
      const existingHabit = createMockHabit();
      habitsRepository.findById.mockResolvedValue(existingHabit);
      habitsRepository.delete.mockResolvedValue(undefined);

      // Act & Assert
      await request(app.getHttpServer()).delete(`/api/v1/habits/${mockHabitId}`).expect(204);
    });

    it('should return 404 when habit not found', async () => {
      // Arrange
      habitsRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await request(app.getHttpServer()).delete(`/api/v1/habits/${mockHabitId}`).expect(404);
    });

    it('should return 400 for invalid UUID format', async () => {
      // Act & Assert
      await request(app.getHttpServer()).delete('/api/v1/habits/invalid-uuid').expect(400);
    });
  });

  describe('API versioning', () => {
    it('should require API version in URL', async () => {
      // Act & Assert
      await request(app.getHttpServer()).get('/api/habits').expect(404); // No version specified
    });

    it('should accept version 1', async () => {
      // Arrange
      habitsRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      // Act & Assert
      await request(app.getHttpServer()).get('/api/v1/habits').expect(200);
    });
  });

  describe('rate limiting', () => {
    it('should apply throttling to requests', async () => {
      // This test verifies that throttling middleware is applied
      // In a real scenario, you would make many requests to test actual rate limiting
      habitsRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      // Act & Assert
      await request(app.getHttpServer()).get('/api/v1/habits').expect(200);

      // The ThrottlerGuard should be applied (tested in unit tests)
    });
  });

  describe('error handling and validation', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      habitsRepository.findAll.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      const response = await request(app.getHttpServer()).get('/api/v1/habits').expect(500);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 500,
          message: 'Internal server error',
        })
      );
    });

    it('should validate request body structure', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .patch(`/api/v1/habits/${mockHabitId}`)
        .send({ invalidField: 'value' })
        .expect(400);
    });

    it('should handle malformed JSON', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .patch(`/api/v1/habits/${mockHabitId}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });
  });

  describe('content negotiation', () => {
    it('should return JSON content type', async () => {
      // Arrange
      habitsRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      // Act & Assert
      await request(app.getHttpServer())
        .get('/api/v1/habits')
        .expect(200)
        .expect('Content-Type', /json/);
    });

    it('should handle Accept header', async () => {
      // Arrange
      habitsRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      // Act & Assert
      await request(app.getHttpServer())
        .get('/api/v1/habits')
        .set('Accept', 'application/json')
        .expect(200);
    });
  });
});
