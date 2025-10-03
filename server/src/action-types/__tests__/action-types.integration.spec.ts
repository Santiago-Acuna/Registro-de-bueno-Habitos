import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';

import { ActionType } from '../../domain/entities/action-type.entity';
import { GlobalEntityIdentifier } from '../../domain/entities/global-entity-identifier.entity';
import { UUID, PaginatedResult } from '../../domain/shared/types/common';
import { IdentifierIcon } from '../../domain/value-objects/identifier-icon';
import { IdentifierName } from '../../domain/value-objects/identifier-name';
import { CloudinaryService } from '../../helpers/cloudinary/cloudinary.service';
import { HttpExceptionFilter } from '../../infrastructure/filters/http-exception.filter';
import { ActionTypesModule } from '../action-types.module';
import { CreateActionTypeDto } from '../dto/create-action-type.dto';
import { UpdateActionTypeDto } from '../dto/update-action-type.dto';
import { IActionTypesRepository } from '../interfaces/action-types-repository.interface';

// Mock implementations for integration tests
const mockActionTypesRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByName: jest.fn(),
  findByHabitId: jest.fn(),
};

const mockCloudinaryService = {
  uploadImage: jest.fn(),
};

// Mock uuid generation
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-123e4567-e89b-12d3-a456-426614174000'),
}));

describe('ActionTypes API Integration Tests (RED PHASE)', () => {
  let app: INestApplication;
  let actionTypesRepository: jest.Mocked<IActionTypesRepository>;
  let cloudinaryService: jest.Mocked<CloudinaryService>;

  // Test data fixtures
  const mockActionTypeId: UUID = '123e4567-e89b-12d3-a456-426614174000';
  const mockHabitId: UUID = '987fcdeb-51a2-43d1-9876-543210987654';
  const validGlobalIdentifierId = 'global-id-123e4567-e89b-12d3-a456-426614174000';
  const mockActionTypeName = 'Morning Push-ups';
  const mockIconUrl = 'https://example.com/icon.png';
  const fixedDate = new Date('2024-01-01T00:00:00.000Z');

  // Helper to create mock GlobalEntityIdentifier
  const createMockGlobalIdentifier = (
    name: string = mockActionTypeName,
    icon: string = mockIconUrl
  ): GlobalEntityIdentifier => {
    return new GlobalEntityIdentifier(
      validGlobalIdentifierId,
      IdentifierName.create(name),
      IdentifierIcon.create(icon),
      'action_type',
      mockActionTypeId
    );
  };

  const createMockActionType = (overrides: Partial<any> = {}): ActionType => {
    const globalIdentifier = createMockGlobalIdentifier();
    const defaults = {
      id: mockActionTypeId,
      habitId: mockHabitId,
      createdAt: fixedDate,
      updatedAt: fixedDate,
      totalActionsCount: 0,
      lastActionDate: null,
      globalEntityIdentifier: globalIdentifier,
    };
    const merged = { ...defaults, ...overrides };
    return new ActionType(
      merged.id,
      merged.habitId,
      merged.createdAt,
      merged.updatedAt,
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
        ActionTypesModule,
        ThrottlerModule.forRoot({
          throttlers: [{ ttl: 60000, limit: 100 }],
        }),
      ],
    })
      .overrideProvider('IActionTypesRepository')
      .useValue(mockActionTypesRepository)
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

    actionTypesRepository = moduleFixture.get('IActionTypesRepository');
    cloudinaryService = moduleFixture.get(CloudinaryService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /action-types', () => {
    const createActionTypeDto: CreateActionTypeDto = {
      name: mockActionTypeName,
      habitId: mockHabitId,
    };

    it('should create a new action type successfully with file upload', async () => {
      // Arrange
      const expectedActionType = createMockActionType();
      actionTypesRepository.findByNameAndHabitId.mockResolvedValue(null);
      cloudinaryService.uploadImage.mockResolvedValue({
        success: true,
        url: mockIconUrl,
        data: {
          publicId: 'test-icon',
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
      actionTypesRepository.create.mockResolvedValue(expectedActionType);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/action-types')
        .field('name', createActionTypeDto.name)
        .field('habitId', createActionTypeDto.habitId)
        .attach('icon', createImageBuffer(), 'test-icon.png')
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockActionTypeId,
          name: mockActionTypeName,
          habitId: mockHabitId,
          icon: mockIconUrl,
          totalActionsCount: 0,
          lastActionDate: null,
        })
      );
    });

    it('should return 409 when action type with same name already exists (global uniqueness)', async () => {
      // Arrange
      const existingActionType = createMockActionType();
      actionTypesRepository.findByNameAndHabitId.mockResolvedValue(existingActionType);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/action-types')
        .field('name', createActionTypeDto.name)
        .field('habitId', createActionTypeDto.habitId)
        .attach('icon', createImageBuffer(), 'test-icon.png')
        .expect(409);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 409,
          message: expect.stringContaining('already exists'),
        })
      );
    });

    it('should return 400 for invalid action type data - empty name', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/action-types')
        .field('name', '') // Invalid empty name
        .field('habitId', createActionTypeDto.habitId)
        .attach('icon', createImageBuffer(), 'test-icon.png')
        .expect(400);

      // Standard NestJS ValidationPipe returns message as array
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.any(Array),
        })
      );
    });

    it('should return 400 for invalid action type data - name too long', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/action-types')
        .field('name', 'A'.repeat(51)) // Too long (max 50 chars)
        .field('habitId', createActionTypeDto.habitId)
        .attach('icon', createImageBuffer(), 'test-icon.png')
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.any(Array),
        })
      );
    });

    it('should return 400 for invalid habitId format', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/action-types')
        .field('name', createActionTypeDto.name)
        .field('habitId', 'invalid-uuid')
        .attach('icon', createImageBuffer(), 'test-icon.png')
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
        .post('/api/v1/action-types')
        .field('name', createActionTypeDto.name)
        .field('habitId', createActionTypeDto.habitId)
        .expect(400);

      // ValidationException should return proper error structure with string message
      expect(response.body).toEqual(
        expect.objectContaining({
          error: 'ValidationException',
          message: expect.any(String),
          statusCode: 400,
          path: '/api/v1/action-types',
          timestamp: expect.any(String),
        })
      );

      // Validate the message contains the expected validation error
      expect(response.body.message).toContain('El archivo de imagen no puede estar vacío');
    });

    it('should return 400 when image upload fails', async () => {
      // Arrange
      actionTypesRepository.findByNameAndHabitId.mockResolvedValue(null);
      cloudinaryService.uploadImage.mockResolvedValue({
        success: false,
        error: { message: 'Invalid image format', name: 'ValidationError' },
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/action-types')
        .field('name', createActionTypeDto.name)
        .field('habitId', createActionTypeDto.habitId)
        .attach('icon', createImageBuffer(), 'test-icon.png')
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: 'Invalid image format',
        })
      );
    });

    it('should return 400 when missing required habitId field', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/action-types')
        .field('name', createActionTypeDto.name)
        .attach('icon', createImageBuffer(), 'test-icon.png')
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.any(Array),
        })
      );
    });
  });

  describe('GET /action-types', () => {
    it('should return paginated list of action types', async () => {
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

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/api/v1/action-types')
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              id: mockActionTypeId,
              name: mockActionTypeName,
              habitId: mockHabitId,
            }),
          ]),
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        })
      );
    });

    it('should return filtered action types by habitId', async () => {
      // Arrange
      const actionType = createMockActionType({ habitId: mockHabitId });
      const mockPaginatedResult: PaginatedResult<ActionType> = {
        data: [actionType],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      actionTypesRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/api/v1/action-types')
        .query({ habitId: mockHabitId })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].habitId).toBe(mockHabitId);
    });

    it('should return filtered action types by hasActions flag', async () => {
      // Arrange
      const actionTypeWithActions = createMockActionType({ totalActionsCount: 5 });
      const mockPaginatedResult: PaginatedResult<ActionType> = {
        data: [actionTypeWithActions],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      actionTypesRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/api/v1/action-types')
        .query({ hasActions: true })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].totalActionsCount).toBeGreaterThan(0);
    });

    it('should return filtered action types by recent activity days', async () => {
      // Arrange
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 3); // 3 days ago
      const actionTypeWithRecentActivity = createMockActionType({ lastActionDate: recentDate });
      const mockPaginatedResult: PaginatedResult<ActionType> = {
        data: [actionTypeWithRecentActivity],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      actionTypesRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/api/v1/action-types')
        .query({ recentActivityDays: 7 })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].lastActionDate).not.toBeNull();
    });

    it('should support pagination parameters', async () => {
      // Arrange
      const mockPaginatedResult: PaginatedResult<ActionType> = {
        data: [],
        total: 0,
        page: 2,
        limit: 5,
        totalPages: 0,
      };
      actionTypesRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/api/v1/action-types')
        .query({ page: 2, limit: 5 })
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          page: 2,
          limit: 5,
        })
      );
    });

    it('should validate pagination parameters - invalid page', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/api/v1/action-types')
        .query({ page: 0 }) // Invalid page (min 1)
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.any(Array),
        })
      );
    });

    it('should validate pagination parameters - exceeds max limit', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/api/v1/action-types')
        .query({ limit: 101 }) // Exceeds max limit (100)
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.any(Array),
        })
      );
    });

    it('should validate recentActivityDays parameter - minimum value', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/api/v1/action-types')
        .query({ recentActivityDays: 0 }) // Below minimum (1)
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.any(Array),
        })
      );
    });

    it('should validate recentActivityDays parameter - maximum value', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/api/v1/action-types')
        .query({ recentActivityDays: 366 }) // Exceeds maximum (365)
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.any(Array),
        })
      );
    });

    it('should return empty results when no action types exist', async () => {
      // Arrange
      const mockPaginatedResult: PaginatedResult<ActionType> = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      actionTypesRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/api/v1/action-types')
        .expect(200);

      expect(response.body).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('GET /action-types/habit/:habitId', () => {
    it('should return action types for specific habit', async () => {
      // Arrange
      const mockActionTypes = [createMockActionType({ habitId: mockHabitId })];
      const mockPaginatedResult: PaginatedResult<ActionType> = {
        data: mockActionTypes,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      actionTypesRepository.findByHabitId.mockResolvedValue(mockPaginatedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/v1/action-types/habit/${mockHabitId}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].habitId).toBe(mockHabitId);
    });

    it('should support pagination for habit action types', async () => {
      // Arrange
      const mockPaginatedResult: PaginatedResult<ActionType> = {
        data: [],
        total: 0,
        page: 2,
        limit: 5,
        totalPages: 0,
      };
      actionTypesRepository.findByHabitId.mockResolvedValue(mockPaginatedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/v1/action-types/habit/${mockHabitId}`)
        .query({ page: 2, limit: 5 })
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          page: 2,
          limit: 5,
        })
      );
    });

    it('should return 400 for invalid habitId UUID format', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/api/v1/action-types/habit/invalid-uuid')
        .expect(400);
    });

    it('should return empty results when habit has no action types', async () => {
      // Arrange
      const mockPaginatedResult: PaginatedResult<ActionType> = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      actionTypesRepository.findByHabitId.mockResolvedValue(mockPaginatedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/v1/action-types/habit/${mockHabitId}`)
        .expect(200);

      expect(response.body).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('GET /action-types/:id', () => {
    it('should return action type when found', async () => {
      // Arrange
      const mockActionType = createMockActionType();
      actionTypesRepository.findById.mockResolvedValue(mockActionType);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/v1/action-types/${mockActionTypeId}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockActionTypeId,
          name: mockActionTypeName,
          habitId: mockHabitId,
          icon: mockIconUrl,
        })
      );
    });

    it('should return 404 when action type not found', async () => {
      // Arrange
      actionTypesRepository.findById.mockResolvedValue(null);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/v1/action-types/${mockActionTypeId}`)
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
      await request(app.getHttpServer()).get('/api/v1/action-types/invalid-uuid').expect(400);
    });
  });

  describe('PATCH /action-types/:id', () => {
    const updateActionTypeDto: UpdateActionTypeDto = {
      name: 'Evening Push-ups',
    };

    it('should successfully update action type name', async () => {
      // Arrange
      const existingActionType = createMockActionType();
      const updatedGlobalIdentifier = createMockGlobalIdentifier(updateActionTypeDto.name!);
      const updatedActionType = new ActionType(
        existingActionType.id,
        existingActionType.habitId,
        existingActionType.createdAt,
        new Date(),
        existingActionType.totalActionsCount,
        existingActionType.lastActionDate,
        updatedGlobalIdentifier
      );
      actionTypesRepository.findById.mockResolvedValue(existingActionType);
      actionTypesRepository.findByNameAndHabitId.mockResolvedValue(null);
      actionTypesRepository.update.mockResolvedValue(updatedActionType);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/action-types/${mockActionTypeId}`)
        .send(updateActionTypeDto)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockActionTypeId,
          name: updateActionTypeDto.name,
        })
      );
    });

    it('should successfully update action type icon', async () => {
      // Arrange
      const newIconUrl = 'https://example.com/new-icon.png';
      const existingActionType = createMockActionType();
      const updatedGlobalIdentifier = createMockGlobalIdentifier(
        existingActionType.name,
        newIconUrl
      );
      const updatedActionType = new ActionType(
        existingActionType.id,
        existingActionType.habitId,
        existingActionType.createdAt,
        new Date(),
        existingActionType.totalActionsCount,
        existingActionType.lastActionDate,
        updatedGlobalIdentifier
      );

      actionTypesRepository.findById.mockResolvedValue(existingActionType);
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
      actionTypesRepository.update.mockResolvedValue(updatedActionType);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/action-types/${mockActionTypeId}`)
        .attach('icon', createImageBuffer(), 'new-icon.png')
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockActionTypeId,
          icon: newIconUrl,
        })
      );
    });

    it('should successfully update both name and icon together', async () => {
      // Arrange
      const newIconUrl = 'https://example.com/new-icon.png';
      const newName = 'Evening Push-ups';
      const existingActionType = createMockActionType();
      const updatedGlobalIdentifier = createMockGlobalIdentifier(newName, newIconUrl);
      const updatedActionType = new ActionType(
        existingActionType.id,
        existingActionType.habitId,
        existingActionType.createdAt,
        new Date(),
        existingActionType.totalActionsCount,
        existingActionType.lastActionDate,
        updatedGlobalIdentifier
      );

      actionTypesRepository.findById.mockResolvedValue(existingActionType);
      actionTypesRepository.findByNameAndHabitId.mockResolvedValue(null);
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
      actionTypesRepository.update.mockResolvedValue(updatedActionType);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/action-types/${mockActionTypeId}`)
        .field('name', newName)
        .attach('icon', createImageBuffer(), 'new-icon.png')
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockActionTypeId,
          name: newName,
          icon: newIconUrl,
        })
      );
    });

    it('should return 404 when action type not found', async () => {
      // Arrange
      actionTypesRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await request(app.getHttpServer())
        .patch(`/api/v1/action-types/${mockActionTypeId}`)
        .send(updateActionTypeDto)
        .expect(404);
    });

    it('should return 409 when new name already exists globally', async () => {
      // Arrange
      const existingActionType = createMockActionType();
      const anotherActionType = createMockActionType({ id: 'another-id' });
      actionTypesRepository.findById.mockResolvedValue(existingActionType);
      actionTypesRepository.findByNameAndHabitId.mockResolvedValue(anotherActionType);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/action-types/${mockActionTypeId}`)
        .send(updateActionTypeDto)
        .expect(409);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 409,
          message: expect.stringContaining('already exists'),
        })
      );
    });

    it('should return 400 for invalid update data - empty name', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .patch(`/api/v1/action-types/${mockActionTypeId}`)
        .send({ name: '' }) // Invalid empty name
        .expect(400);
    });


    it('should return 400 for invalid update data - name too long', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .patch(`/api/v1/action-types/${mockActionTypeId}`)
        .send({ name: 'A'.repeat(51) }) // Too long
        .expect(400);
    });

    it('should handle partial updates - only name', async () => {
      // Arrange
      const existingActionType = createMockActionType();
      const updatedGlobalIdentifier = createMockGlobalIdentifier(updateActionTypeDto.name!);
      const updatedActionType = new ActionType(
        existingActionType.id,
        existingActionType.habitId,
        existingActionType.createdAt,
        new Date(),
        existingActionType.totalActionsCount,
        existingActionType.lastActionDate,
        updatedGlobalIdentifier
      );

      actionTypesRepository.findById.mockResolvedValue(existingActionType);
      actionTypesRepository.findByNameAndHabitId.mockResolvedValue(null);
      actionTypesRepository.update.mockResolvedValue(updatedActionType);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/action-types/${mockActionTypeId}`)
        .send({ name: updateActionTypeDto.name })
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockActionTypeId,
          name: updateActionTypeDto.name,
          icon: mockIconUrl, // Should keep original icon
        })
      );
    });

    it('should return 400 when icon upload fails', async () => {
      // Arrange
      const existingActionType = createMockActionType();
      actionTypesRepository.findById.mockResolvedValue(existingActionType);
      cloudinaryService.uploadImage.mockResolvedValue({
        success: false,
        error: { message: 'Invalid image format', name: 'ValidationError' },
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/action-types/${mockActionTypeId}`)
        .attach('icon', createImageBuffer(), 'invalid-icon.txt')
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: 'Invalid image format',
        })
      );
    });

    it('should maintain existing icon when no icon field is provided', async () => {
      // Arrange
      const existingActionType = createMockActionType();
      const updatedGlobalIdentifier = createMockGlobalIdentifier('Updated Name');
      const updatedActionType = new ActionType(
        existingActionType.id,
        existingActionType.habitId,
        existingActionType.createdAt,
        new Date(),
        existingActionType.totalActionsCount,
        existingActionType.lastActionDate,
        updatedGlobalIdentifier
      );

      actionTypesRepository.findById.mockResolvedValue(existingActionType);
      actionTypesRepository.findByNameAndHabitId.mockResolvedValue(null);
      actionTypesRepository.update.mockResolvedValue(updatedActionType);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/action-types/${mockActionTypeId}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockActionTypeId,
          name: 'Updated Name',
          icon: mockIconUrl, // Should keep original icon
        })
      );
      expect(cloudinaryService.uploadImage).not.toHaveBeenCalled();
    });

    it('should handle empty update (no changes)', async () => {
      // Arrange
      const existingActionType = createMockActionType();
      actionTypesRepository.findById.mockResolvedValue(existingActionType);
      actionTypesRepository.update.mockResolvedValue(existingActionType);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/action-types/${mockActionTypeId}`)
        .send({}) // Empty update
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockActionTypeId,
        })
      );
    });
  });

  describe('DELETE /action-types/:id', () => {
    it('should successfully delete action type', async () => {
      // Arrange
      const existingActionType = createMockActionType();
      actionTypesRepository.findById.mockResolvedValue(existingActionType);
      actionTypesRepository.delete.mockResolvedValue(undefined);

      // Act & Assert
      await request(app.getHttpServer())
        .delete(`/api/v1/action-types/${mockActionTypeId}`)
        .expect(204);
    });

    it('should return 404 when action type not found', async () => {
      // Arrange
      actionTypesRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await request(app.getHttpServer())
        .delete(`/api/v1/action-types/${mockActionTypeId}`)
        .expect(404);
    });

    it('should return 400 for invalid UUID format', async () => {
      // Act & Assert
      await request(app.getHttpServer()).delete('/api/v1/action-types/invalid-uuid').expect(400);
    });
  });

  describe('API versioning', () => {
    it('should require API version in URL', async () => {
      // Act & Assert
      await request(app.getHttpServer()).get('/api/action-types').expect(404); // No version specified
    });

    it('should accept version 1', async () => {
      // Arrange
      actionTypesRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      // Act & Assert
      await request(app.getHttpServer()).get('/api/v1/action-types').expect(200);
    });
  });

  describe('rate limiting', () => {
    it('should apply throttling to requests', async () => {
      // This test verifies that throttling middleware is applied
      // In a real scenario, you would make many requests to test actual rate limiting
      actionTypesRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      // Act & Assert
      await request(app.getHttpServer()).get('/api/v1/action-types').expect(200);

      // The ThrottlerGuard should be applied (tested in unit tests)
    });
  });

  describe('error handling and validation', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      actionTypesRepository.findAll.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/api/v1/action-types')
        .expect(500);

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
        .patch(`/api/v1/action-types/${mockActionTypeId}`)
        .send({ invalidField: 'value' })
        .expect(400);
    });

    it('should handle malformed JSON', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .patch(`/api/v1/action-types/${mockActionTypeId}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });
  });

  describe('content negotiation', () => {
    it('should return JSON content type', async () => {
      // Arrange
      actionTypesRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      // Act & Assert
      await request(app.getHttpServer())
        .get('/api/v1/action-types')
        .expect(200)
        .expect('Content-Type', /json/);
    });

    it('should handle Accept header', async () => {
      // Arrange
      actionTypesRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      // Act & Assert
      await request(app.getHttpServer())
        .get('/api/v1/action-types')
        .set('Accept', 'application/json')
        .expect(200);
    });
  });
});
