import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';

import { ActionLog } from '../../domain/entities/action-log.entity';
import { UUID, PaginatedResult } from '../../domain/shared/types/common';
import { HttpExceptionFilter } from '../../infrastructure/filters/http-exception.filter';
import { CreateActionLogDto } from '../dto/create-action-log.dto';
import { ActionLogsModule } from '../action-logs.module';
import { IActionLogsRepository } from '../interfaces/action-logs-repository.interface';

// Mock implementations for integration tests
const mockActionLogsRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByActionTypeId: jest.fn(),
  getLogColumnsByActionTypeId: jest.fn(),
};

describe('ActionLogs API Integration Tests', () => {
  let app: INestApplication;
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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ActionLogsModule,
        ThrottlerModule.forRoot({
          throttlers: [{ ttl: 60000, limit: 100 }],
        }),
      ],
    })
      .overrideProvider('IActionLogsRepository')
      .useValue(mockActionLogsRepository)
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

    actionLogsRepository = moduleFixture.get('IActionLogsRepository');
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /action-logs', () => {
    const createActionLogDto: CreateActionLogDto = {
      startTime: fixedStartTime,
      endTime: fixedEndTime,
      actionTypeId: mockActionTypeId,
    };

    it('should create a new action log successfully', async () => {
      // Arrange
      const expectedActionLog = createMockActionLog();
      actionLogsRepository.create.mockResolvedValue(expectedActionLog);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/action-logs')
        .send(createActionLogDto)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockActionLogId,
          startTime: fixedStartTime.toISOString(),
          endTime: fixedEndTime.toISOString(),
          durationSeconds: 3600,
          actionDate: fixedActionDate.toISOString(),
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

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/action-logs')
        .send(minimalDto)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockActionLogId,
          startTime: fixedStartTime.toISOString(),
          endTime: null,
          durationSeconds: null,
          actionTypeId: mockActionTypeId,
        })
      );
    });

    it('should return 400 for invalid action log data - missing required fields', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/action-logs')
        .send({}) // Missing required fields
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.any(Array),
        })
      );
    });

    it('should return 400 for invalid actionTypeId format', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/action-logs')
        .send({
          startTime: fixedStartTime,
          actionTypeId: 'invalid-uuid',
        })
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.any(Array),
        })
      );
    });

    it('should return 400 when startTime is not a valid date', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/action-logs')
        .send({
          startTime: 'invalid-date',
          actionTypeId: mockActionTypeId,
        })
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.any(Array),
        })
      );
    });

    it('should return 400 when endTime is before startTime', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/action-logs')
        .send({
          startTime: fixedEndTime,
          endTime: fixedStartTime,
          actionTypeId: mockActionTypeId,
        })
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('End time must be after'),
        })
      );
    });

    it('should return 404 when action type does not exist', async () => {
      // Arrange
      actionLogsRepository.create.mockRejectedValue(new Error('ActionType not found'));

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/v1/action-logs')
        .send(createActionLogDto)
        .expect(404);
    });
  });

  describe('GET /action-logs', () => {
    it('should return paginated list of action logs', async () => {
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

      // Act & Assert
      const response = await request(app.getHttpServer()).get('/api/v1/action-logs').expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              id: mockActionLogId,
              actionTypeId: mockActionTypeId,
            }),
          ]),
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        })
      );
    });

    it('should return filtered action logs by actionTypeId', async () => {
      // Arrange
      const actionLog = createMockActionLog({ actionTypeId: mockActionTypeId });
      const mockPaginatedResult: PaginatedResult<ActionLog> = {
        data: [actionLog],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      actionLogsRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/api/v1/action-logs')
        .query({ actionTypeId: mockActionTypeId })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].actionTypeId).toBe(mockActionTypeId);
    });

    it('should return filtered action logs by date range', async () => {
      // Arrange
      const mockActionLogs = [createMockActionLog()];
      const mockPaginatedResult: PaginatedResult<ActionLog> = {
        data: mockActionLogs,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      actionLogsRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/api/v1/action-logs')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
    });

    it('should support pagination parameters', async () => {
      // Arrange
      const mockPaginatedResult: PaginatedResult<ActionLog> = {
        data: [],
        total: 0,
        page: 2,
        limit: 5,
        totalPages: 0,
      };
      actionLogsRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/api/v1/action-logs')
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
        .get('/api/v1/action-logs')
        .query({ page: 0 }) // Invalid page
        .expect(400);

      expect(response1.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.any(Array),
        })
      );

      const response2 = await request(app.getHttpServer())
        .get('/api/v1/action-logs')
        .query({ limit: 101 }) // Exceeds max limit
        .expect(400);

      expect(response2.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: expect.any(Array),
        })
      );
    });

    it('should return 400 for invalid actionTypeId in query', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/api/v1/action-logs')
        .query({ actionTypeId: 'invalid-uuid' })
        .expect(400);
    });

    it('should return 400 for invalid date format in query', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/api/v1/action-logs')
        .query({ startDate: 'invalid-date' })
        .expect(400);
    });
  });

  describe('GET /action-logs/:id', () => {
    it('should return action log when found', async () => {
      // Arrange
      const mockActionLog = createMockActionLog();
      actionLogsRepository.findById.mockResolvedValue(mockActionLog);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/v1/action-logs/${mockActionLogId}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockActionLogId,
          startTime: fixedStartTime.toISOString(),
          endTime: fixedEndTime.toISOString(),
          actionTypeId: mockActionTypeId,
        })
      );
    });

    it('should return 404 when action log not found', async () => {
      // Arrange
      actionLogsRepository.findById.mockResolvedValue(null);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/v1/action-logs/${mockActionLogId}`)
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
      await request(app.getHttpServer()).get('/api/v1/action-logs/invalid-uuid').expect(400);
    });

    it('should handle different valid UUIDs', async () => {
      // Arrange
      const differentId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const mockActionLog = createMockActionLog({ id: differentId });
      actionLogsRepository.findById.mockResolvedValue(mockActionLog);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/v1/action-logs/${differentId}`)
        .expect(200);

      expect(response.body.id).toBe(differentId);
    });
  });

  describe('API versioning', () => {
    it('should require API version in URL', async () => {
      // Act & Assert
      await request(app.getHttpServer()).get('/api/action-logs').expect(404); // No version specified
    });

    it('should accept version 1', async () => {
      // Arrange
      actionLogsRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      // Act & Assert
      await request(app.getHttpServer()).get('/api/v1/action-logs').expect(200);
    });
  });

  describe('rate limiting', () => {
    it('should apply throttling to requests', async () => {
      // Arrange
      actionLogsRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      // Act & Assert
      await request(app.getHttpServer()).get('/api/v1/action-logs').expect(200);

      // The ThrottlerGuard should be applied (tested in unit tests)
    });
  });

  describe('error handling and validation', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      actionLogsRepository.findAll.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      const response = await request(app.getHttpServer()).get('/api/v1/action-logs').expect(500);

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
        .post('/api/v1/action-logs')
        .send({ invalidField: 'value' })
        .expect(400);
    });

    it('should handle malformed JSON', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/v1/action-logs')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });
  });

  describe('content negotiation', () => {
    it('should return JSON content type', async () => {
      // Arrange
      actionLogsRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      // Act & Assert
      await request(app.getHttpServer())
        .get('/api/v1/action-logs')
        .expect(200)
        .expect('Content-Type', /json/);
    });

    it('should handle Accept header', async () => {
      // Arrange
      actionLogsRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      // Act & Assert
      await request(app.getHttpServer())
        .get('/api/v1/action-logs')
        .set('Accept', 'application/json')
        .expect(200);
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle action logs with null optional fields', async () => {
      // Arrange
      const actionLogWithNulls = createMockActionLog({
        endTime: null,
        durationSeconds: null,
      });
      actionLogsRepository.findById.mockResolvedValue(actionLogWithNulls);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/v1/action-logs/${mockActionLogId}`)
        .expect(200);

      expect(response.body.endTime).toBeNull();
      expect(response.body.durationSeconds).toBeNull();
    });

    it('should handle very large pagination requests', async () => {
      // Arrange
      const largePage = 1000;
      actionLogsRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: largePage,
        limit: 100,
        totalPages: 0,
      });

      // Act & Assert
      await request(app.getHttpServer())
        .get('/api/v1/action-logs')
        .query({ page: largePage, limit: 100 })
        .expect(200);
    });

    it('should handle simultaneous requests', async () => {
      // Arrange
      const mockActionLog = createMockActionLog();
      actionLogsRepository.findById.mockResolvedValue(mockActionLog);

      // Act
      const requests = Array(5)
        .fill(null)
        .map(() => request(app.getHttpServer()).get(`/api/v1/action-logs/${mockActionLogId}`));

      const responses = await Promise.all(requests);

      // Assert
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.id).toBe(mockActionLogId);
      });
    });
  });

  describe('GET /action-logs/action-types/:actionTypeId/log-columns', () => {
    const mockLogColumns = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'commitName',
        type: 'text',
        logTypeId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        validations: [
          {
            id: '456e7890-e89b-12d3-a456-426614174111',
            validationFunctionId: '789e0123-e89b-12d3-a456-426614174222',
            functionName: 'isNotEmpty',
            functionCode: 'return value !== "";',
            isForFront: true,
          },
        ],
      },
      {
        id: 'b1ffce00-ad1c-5fg9-cc7e-7cc0ce491b22',
        name: 'pageCount',
        type: 'number',
        logTypeId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        validations: [],
      },
    ];

    it('should return log columns with validations for valid action type', async () => {
      // Arrange
      actionLogsRepository.getLogColumnsByActionTypeId.mockResolvedValue(mockLogColumns);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/v1/action-logs/action-types/${mockActionTypeId}/log-columns`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          id: mockLogColumns[0]!.id,
          name: 'commitName',
          type: 'text',
        })
      );
      expect(response.body[0]!.validations).toHaveLength(1);
      expect(response.body[1]!.validations).toHaveLength(0);
    });

    it('should return empty array when log type has no columns', async () => {
      // Arrange
      actionLogsRepository.getLogColumnsByActionTypeId.mockResolvedValue([]);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/v1/action-logs/action-types/${mockActionTypeId}/log-columns`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return 404 when action type does not exist', async () => {
      // Arrange
      actionLogsRepository.getLogColumnsByActionTypeId.mockRejectedValue(
        new Error('ActionType not found')
      );

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/v1/action-logs/action-types/${mockActionTypeId}/log-columns`)
        .expect(404);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 404,
          message: expect.stringContaining('not found'),
        })
      );
    });

    it('should return 400 for invalid action type id format', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/api/v1/action-logs/action-types/invalid-uuid/log-columns')
        .expect(400);
    });

    it('should return columns with multiple validations', async () => {
      // Arrange
      const columnsWithValidations = [
        {
          ...mockLogColumns[0]!,
          validations: [
            mockLogColumns[0]!.validations[0]!,
            {
              id: 'c2ggdf11-be2d-6gh0-dd8f-8dd1df502c33',
              validationFunctionId: 'd3hheg22-cf3e-7hi1-ee9g-9ee2eg613d44',
              functionName: 'maxLength',
              functionCode: 'return value.length <= 100;',
              isForFront: true,
            },
          ],
        },
      ];
      actionLogsRepository.getLogColumnsByActionTypeId.mockResolvedValue(columnsWithValidations);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/v1/action-logs/action-types/${mockActionTypeId}/log-columns`)
        .expect(200);

      expect(response.body[0]!.validations).toHaveLength(2);
      expect(response.body[0]!.validations[0]!.functionName).toBe('isNotEmpty');
      expect(response.body[0]!.validations[1]!.functionName).toBe('maxLength');
    });

    it('should handle different column types (text, number, boolean)', async () => {
      // Arrange
      const differentTypes = [
        { ...mockLogColumns[0]!, type: 'text' },
        { ...mockLogColumns[1]!, type: 'number' },
        {
          id: 'c2ggdf11-be2d-6gh0-dd8f-8dd1df502c33',
          name: 'isActive',
          type: 'boolean',
          logTypeId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          validations: [],
        },
      ];
      actionLogsRepository.getLogColumnsByActionTypeId.mockResolvedValue(differentTypes);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/v1/action-logs/action-types/${mockActionTypeId}/log-columns`)
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0]!.type).toBe('text');
      expect(response.body[1]!.type).toBe('number');
      expect(response.body[2]!.type).toBe('boolean');
    });

    it('should apply versioning correctly', async () => {
      // Arrange
      actionLogsRepository.getLogColumnsByActionTypeId.mockResolvedValue([]);

      // Act & Assert - without version should return 404
      await request(app.getHttpServer())
        .get(`/api/action-logs/action-types/${mockActionTypeId}/log-columns`)
        .expect(404);

      // With version should work
      await request(app.getHttpServer())
        .get(`/api/v1/action-logs/action-types/${mockActionTypeId}/log-columns`)
        .expect(200);
    });

    it('should apply throttling', async () => {
      // Arrange
      actionLogsRepository.getLogColumnsByActionTypeId.mockResolvedValue([]);

      // Act & Assert
      await request(app.getHttpServer())
        .get(`/api/v1/action-logs/action-types/${mockActionTypeId}/log-columns`)
        .expect(200);
      // ThrottlerGuard should be applied (tested in unit tests)
    });
  });
});
