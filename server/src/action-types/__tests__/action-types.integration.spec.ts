import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { ActionType } from '../../domain/entities/action-type.entity';
import { UUID } from '../../domain/shared/types/common';
import { ActionTypeName } from '../../domain/value-objects/action-type-name';
import { CloudinaryService } from '../../helpers/cloudinary/cloudinary.service';
import { DatabaseService } from '../../infrastructure/database/database.service';
import {
  NotFoundError,
  ConflictError,
  ValidationException,
} from '../../infrastructure/exceptions/app.exceptions';
import { GlobalExceptionFilter } from '../../infrastructure/filters/global-exception.filter';
import { ActionTypesModule } from '../action-types.module';
import { ActionTypesRepository } from '../repositories/action-types.repository';
import { ActionTypesService } from '../services/action-types.service';

// Mock Cloudinary service
const mockCloudinaryService = {
  uploadImage: jest.fn(),
};

// Mock Database service with in-memory data store
class MockDatabaseService {
  private actionTypes: Map<string, any> = new Map();
  private nextId = 1;

  private generateId(): string {
    return `test-${this.nextId++}-e89b-12d3-a456-426614174000`;
  }

  getClient() {
    return {
      actionTypes: {
        create: jest.fn(async ({ data }) => {
          const id = this.generateId();
          const actionType = {
            id,
            name: data.name,
            logo: data.logo,
            habitId: data.habitId,
            totalActionsCount: 0,
            lastActionDate: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Check for global name uniqueness constraint violation (enforced by global_entity_identifiers table)
          const existingWithName = Array.from(this.actionTypes.values()).find(
            at => at.name === data.name
          );
          if (existingWithName) {
            const error = new Error(
              'Unique constraint failed on the constraint: `global_entity_identifiers_name_unique`'
            );
            (error as any).code = 'P2002';
            (error as any).meta = { target: ['name'] };
            throw error;
          }

          this.actionTypes.set(id, actionType);
          return actionType;
        }),

        findUnique: jest.fn(async ({ where }) => {
          return this.actionTypes.get(where.id) || null;
        }),

        findFirst: jest.fn(async ({ where }) => {
          return (
            Array.from(this.actionTypes.values()).find(
              at =>
                (!where.name || at.name === where.name) &&
                (!where.habitId || at.habitId === where.habitId)
            ) || null
          );
        }),

        findMany: jest.fn(async ({ where, skip, take, orderBy }) => {
          let results = Array.from(this.actionTypes.values());

          // Apply filters
          if (where) {
            if (where.habitId) {
              results = results.filter(at => at.habitId === where.habitId);
            }
            if (where.totalActionsCount?.gt !== undefined) {
              results = results.filter(at => at.totalActionsCount > where.totalActionsCount.gt);
            }
            if (where.totalActionsCount?.gte !== undefined) {
              results = results.filter(at => at.totalActionsCount >= where.totalActionsCount.gte);
            }
            if (where.totalActionsCount?.lte !== undefined) {
              results = results.filter(at => at.totalActionsCount <= where.totalActionsCount.lte);
            }
            if (where.lastActionDate?.gte) {
              results = results.filter(
                at =>
                  at.lastActionDate &&
                  new Date(at.lastActionDate) >= new Date(where.lastActionDate.gte)
              );
            }
          }

          // Apply ordering
          if (orderBy) {
            if (orderBy.createdAt) {
              results.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return orderBy.createdAt === 'desc' ? dateB - dateA : dateA - dateB;
              });
            }
            if (orderBy.totalActionsCount) {
              results.sort((a, b) => {
                return orderBy.totalActionsCount === 'desc'
                  ? b.totalActionsCount - a.totalActionsCount
                  : a.totalActionsCount - b.totalActionsCount;
              });
            }
            if (orderBy.lastActionDate) {
              results.sort((a, b) => {
                const dateA = a.lastActionDate ? new Date(a.lastActionDate).getTime() : 0;
                const dateB = b.lastActionDate ? new Date(b.lastActionDate).getTime() : 0;
                return orderBy.lastActionDate === 'desc' ? dateB - dateA : dateA - dateB;
              });
            }
          }

          // Apply pagination
          if (skip) results = results.slice(skip);
          if (take) results = results.slice(0, take);

          return results;
        }),

        count: jest.fn(async ({ where }) => {
          let results = Array.from(this.actionTypes.values());

          if (where) {
            if (where.habitId) {
              results = results.filter(at => at.habitId === where.habitId);
            }
            if (where.totalActionsCount?.gt !== undefined) {
              results = results.filter(at => at.totalActionsCount > where.totalActionsCount.gt);
            }
          }

          return results.length;
        }),

        update: jest.fn(async ({ where, data }) => {
          const actionType = this.actionTypes.get(where.id);
          if (!actionType) {
            const error = new Error('Record not found');
            (error as any).code = 'P2025';
            throw error;
          }

          // Check for global name uniqueness constraint if name is being updated (enforced by global_entity_identifiers table)
          if (data.name) {
            const existing = Array.from(this.actionTypes.values()).find(
              at => at.id !== where.id && at.name === data.name
            );
            if (existing) {
              const error = new Error(
                'Unique constraint failed on the constraint: `global_entity_identifiers_name_unique`'
              );
              (error as any).code = 'P2002';
              (error as any).meta = { target: ['name'] };
              throw error;
            }
          }

          const updated = {
            ...actionType,
            ...data,
            updatedAt: new Date(),
          };

          // Handle increment operation
          if (data.totalActionsCount?.increment) {
            updated.totalActionsCount =
              actionType.totalActionsCount + data.totalActionsCount.increment;
          }

          this.actionTypes.set(where.id, updated);
          return updated;
        }),

        delete: jest.fn(async ({ where }) => {
          const actionType = this.actionTypes.get(where.id);
          if (!actionType) {
            const error = new Error('Record not found');
            (error as any).code = 'P2025';
            throw error;
          }

          this.actionTypes.delete(where.id);
          return actionType;
        }),

        aggregate: jest.fn(async ({ where, _count, _sum, _avg, _max, _min }) => {
          let results = Array.from(this.actionTypes.values());

          if (where?.habitId) {
            results = results.filter(at => at.habitId === where.habitId);
          }

          const stats: any = {};

          if (_count) {
            stats._count = { id: results.length };
          }

          if (_sum) {
            stats._sum = {
              totalActionsCount: results.reduce((sum, at) => sum + at.totalActionsCount, 0) || null,
            };
          }

          if (_avg) {
            const total = results.reduce((sum, at) => sum + at.totalActionsCount, 0);
            stats._avg = {
              totalActionsCount: results.length > 0 ? total / results.length : null,
            };
          }

          if (_max) {
            const max = Math.max(...results.map(at => at.totalActionsCount));
            stats._max = {
              totalActionsCount: results.length > 0 ? max : null,
            };
          }

          if (_min) {
            const min = Math.min(...results.map(at => at.totalActionsCount));
            stats._min = {
              totalActionsCount: results.length > 0 ? min : null,
            };
          }

          return stats;
        }),
      },

      $transaction: jest.fn(async operations => {
        return Promise.all(operations.map((op: any) => op()));
      }),
    };
  }

  clearData() {
    this.actionTypes.clear();
    this.nextId = 1;
  }
}

describe('ActionTypes Integration Tests (RED PHASE)', () => {
  let app: INestApplication;
  let service: ActionTypesService;
  let repository: ActionTypesRepository;
  let mockDatabaseService: MockDatabaseService;

  // Test data fixtures
  const mockHabitId: UUID = '987fcdeb-51a2-43d1-9876-543210987654';
  const mockActionTypeName = 'Morning Push-ups';
  const mockLogo = 'https://example.com/pushups-logo.png';

  const createMockFile = () => {
    const buffer = Buffer.from('fake image data');
    return {
      fieldname: 'logo',
      originalname: 'test-logo.png',
      encoding: '7bit',
      mimetype: 'image/png',
      size: buffer.length,
      buffer,
    };
  };

  beforeAll(async () => {
    mockDatabaseService = new MockDatabaseService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ActionTypesModule],
    })
      .overrideProvider(DatabaseService)
      .useValue(mockDatabaseService)
      .overrideProvider(CloudinaryService)
      .useValue(mockCloudinaryService)
      .compile();

    app = moduleFixture.createNestApplication();

    // Add validation pipe and global exception filter
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      })
    );
    app.useGlobalFilters(new GlobalExceptionFilter());

    service = app.get(ActionTypesService);
    repository = app.get(ActionTypesRepository);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabaseService.clearData();

    // Setup default Cloudinary mock response
    mockCloudinaryService.uploadImage.mockResolvedValue({
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
  });

  describe('Full CRUD Flow Integration', () => {
    it('should complete full CRUD lifecycle successfully', async () => {
      // 1. CREATE - Should create new action type
      // Request contains ONLY domain fields: name, habitId, and logo file
      const createResponse = await request(app.getHttpServer())
        .post('/action-types')
        .field('name', mockActionTypeName)
        .field('habitId', mockHabitId)
        .attach('logo', createMockFile().buffer, 'test-logo.png')
        .expect(201);

      const actionTypeId = createResponse.body.id;
      // Response assertions verify complete entity with database-generated fields
      expect(createResponse.body).toMatchObject({
        id: expect.any(String),
        name: mockActionTypeName,
        habitId: mockHabitId,
        logo: mockLogo,
        totalActionsCount: 0,
        lastActionDate: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      // 2. READ - Should retrieve the created action type
      const getResponse = await request(app.getHttpServer())
        .get(`/action-types/${actionTypeId}`)
        .expect(200);

      expect(getResponse.body).toMatchObject({
        id: actionTypeId,
        name: mockActionTypeName,
        habitId: mockHabitId,
        logo: mockLogo,
        totalActionsCount: 0,
        lastActionDate: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      // 3. UPDATE - Should update action type name
      const updateDto = { name: 'Evening Push-ups' };
      const updateResponse = await request(app.getHttpServer())
        .patch(`/action-types/${actionTypeId}`)
        .send(updateDto)
        .expect(200);

      expect(updateResponse.body.name).toBe(updateDto.name);

      // 4. DELETE - Should remove action type
      await request(app.getHttpServer()).delete(`/action-types/${actionTypeId}`).expect(204);

      // 5. VERIFY DELETION - Should return 404
      await request(app.getHttpServer()).get(`/action-types/${actionTypeId}`).expect(404);
    });
  });

  describe('Business Logic Integration', () => {
    it('should enforce global unique constraint for action type name (enforced by database)', async () => {
      // Create first action type - request contains ONLY domain fields
      const response1 = await request(app.getHttpServer())
        .post('/action-types')
        .field('name', mockActionTypeName)
        .field('habitId', mockHabitId)
        .attach('logo', createMockFile().buffer, 'test-logo.png')
        .expect(201);

      expect(response1.body.name).toBe(mockActionTypeName);

      // Attempt to create second action type with same name (even for same habit) should fail
      // Request contains ONLY domain fields
      const response2 = await request(app.getHttpServer())
        .post('/action-types')
        .field('name', mockActionTypeName)
        .field('habitId', mockHabitId)
        .attach('logo', createMockFile().buffer, 'test-logo-2.png')
        .expect(409);

      // Verify error indicates global uniqueness constraint violation
      expect(response2.body.message).toMatch(
        /already exists|duplicate|unique|global_entity_identifiers_name_unique/i
      );
    });

    it('should NOT allow duplicate action type names globally (enforced by database)', async () => {
      const habit1Id: UUID = '111e1111-e11e-11e1-a111-111111111111';
      const habit2Id: UUID = '222e2222-e22e-22e2-a222-222222222222';

      // First request: Create action type for first habit - should succeed (name is unique globally)
      const response1 = await request(app.getHttpServer())
        .post('/action-types')
        .field('name', mockActionTypeName)
        .field('habitId', habit1Id)
        .attach('logo', createMockFile().buffer, 'test-logo.png')
        .expect(201);

      // Verify first action type was created successfully
      expect(response1.body.name).toBe(mockActionTypeName);
      expect(response1.body.habitId).toBe(habit1Id);

      // Second request: Attempt to create action type with same name but different habit - should fail
      // This demonstrates that action type names are globally unique across ALL habits
      // Constraint is enforced by global_entity_identifiers.name UNIQUE constraint in database
      const response2 = await request(app.getHttpServer())
        .post('/action-types')
        .field('name', mockActionTypeName)
        .field('habitId', habit2Id)
        .attach('logo', createMockFile().buffer, 'test-logo.png')
        .expect(409);

      // Verify error response indicates duplicate name (global uniqueness violation)
      expect(response2.body.message).toMatch(
        /already exists|duplicate|unique|global_entity_identifiers_name_unique/i
      );
    });
  });

  describe('Filtering and Pagination Integration', () => {
    it('should filter action types by habit correctly', async () => {
      const habit1Id: UUID = '111e1111-e11e-11e1-a111-111111111111';
      const habit2Id: UUID = '222e2222-e22e-22e2-a222-222222222222';

      // Create action types for different habits - requests contain ONLY domain fields
      await request(app.getHttpServer())
        .post('/action-types')
        .field('name', 'Push-ups')
        .field('habitId', habit1Id)
        .attach('logo', createMockFile().buffer, 'pushups.png')
        .expect(201);

      await request(app.getHttpServer())
        .post('/action-types')
        .field('name', 'Pull-ups')
        .field('habitId', habit1Id)
        .attach('logo', createMockFile().buffer, 'pullups.png')
        .expect(201);

      await request(app.getHttpServer())
        .post('/action-types')
        .field('name', 'Running')
        .field('habitId', habit2Id)
        .attach('logo', createMockFile().buffer, 'running.png')
        .expect(201);

      // Filter by habit1
      const habit1Response = await request(app.getHttpServer())
        .get(`/action-types/habit/${habit1Id}`)
        .expect(200);

      expect(habit1Response.body.data).toHaveLength(2);
      expect(habit1Response.body.data.every((at: any) => at.habitId === habit1Id)).toBe(true);

      // Filter by habit2
      const habit2Response = await request(app.getHttpServer())
        .get(`/action-types/habit/${habit2Id}`)
        .expect(200);

      expect(habit2Response.body.data).toHaveLength(1);
      expect(habit2Response.body.data[0].habitId).toBe(habit2Id);
    });

    it('should handle pagination correctly', async () => {
      // Create multiple action types - requests contain ONLY domain fields
      for (let i = 1; i <= 15; i++) {
        await request(app.getHttpServer())
          .post('/action-types')
          .field('name', `Action Type ${i}`)
          .field('habitId', mockHabitId)
          .attach('logo', createMockFile().buffer, `action-${i}.png`)
          .expect(201);
      }

      // Test pagination
      const page1Response = await request(app.getHttpServer())
        .get('/action-types')
        .query({ page: 1, limit: 5 })
        .expect(200);

      expect(page1Response.body.data).toHaveLength(5);
      expect(page1Response.body.total).toBe(15);
      expect(page1Response.body.page).toBe(1);
      expect(page1Response.body.limit).toBe(5);
      expect(page1Response.body.totalPages).toBe(3);

      const page2Response = await request(app.getHttpServer())
        .get('/action-types')
        .query({ page: 2, limit: 5 })
        .expect(200);

      expect(page2Response.body.data).toHaveLength(5);
      expect(page2Response.body.page).toBe(2);

      const page3Response = await request(app.getHttpServer())
        .get('/action-types')
        .query({ page: 3, limit: 5 })
        .expect(200);

      expect(page3Response.body.data).toHaveLength(5);
      expect(page3Response.body.page).toBe(3);
    });
  });

  describe('Analytics Endpoints Integration', () => {});

  describe('Error Handling Integration', () => {
    it('should handle validation errors properly', async () => {
      // Test various validation scenarios - requests contain ONLY domain fields
      // All requests attempt to send only name and habitId (domain fields)
      const validationCases = [
        {
          data: { name: '', habitId: mockHabitId },
          expectedStatus: 400,
          description: 'empty name',
        },
        {
          data: { name: 'A', habitId: mockHabitId },
          expectedStatus: 400,
          description: 'name too short',
        },
        {
          data: { name: 'A'.repeat(51), habitId: mockHabitId },
          expectedStatus: 400,
          description: 'name too long',
        },
        {
          data: { name: mockActionTypeName, habitId: 'invalid-uuid' },
          expectedStatus: 400,
          description: 'invalid UUID',
        },
        {
          data: { name: mockActionTypeName },
          expectedStatus: 400,
          description: 'missing habitId',
        },
      ];

      for (const testCase of validationCases) {
        await request(app.getHttpServer())
          .post('/action-types')
          .field('name', testCase.data.name || '')
          .field('habitId', testCase.data.habitId || '')
          .attach('logo', createMockFile().buffer, 'test-logo.png')
          .expect(testCase.expectedStatus);
      }
    });

    it('should handle Cloudinary upload failures', async () => {
      // Mock Cloudinary failure
      mockCloudinaryService.uploadImage.mockResolvedValueOnce({
        success: false,
        error: { message: 'Invalid image format', name: 'ValidationError' },
      });

      // Request contains ONLY domain fields
      await request(app.getHttpServer())
        .post('/action-types')
        .field('name', mockActionTypeName)
        .field('habitId', mockHabitId)
        .attach('logo', createMockFile().buffer, 'test-logo.png')
        .expect(422);
    });

    it('should handle not found errors correctly', async () => {
      const nonExistentId = '999e9999-e99e-99e9-a999-999999999999';

      // Test various endpoints with non-existent ID
      await request(app.getHttpServer()).get(`/action-types/${nonExistentId}`).expect(404);

      await request(app.getHttpServer())
        .patch(`/action-types/${nonExistentId}`)
        .send({ name: 'New Name' })
        .expect(404);

      await request(app.getHttpServer()).delete(`/action-types/${nonExistentId}`).expect(404);
    });
  });

  describe('Performance and Load Integration', () => {
    it('should handle concurrent requests correctly', async () => {
      // Create multiple action types concurrently - requests contain ONLY domain fields
      const concurrentRequests = Array(10)
        .fill(null)
        .map((_, index) =>
          request(app.getHttpServer())
            .post('/action-types')
            .field('name', `Concurrent Action ${index}`)
            .field('habitId', mockHabitId)
            .attach('logo', createMockFile().buffer, `concurrent-${index}.png`)
        );

      const responses = await Promise.all(concurrentRequests);

      // All should succeed - responses contain complete entities
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('createdAt');
        expect(response.body).toHaveProperty('updatedAt');
      });

      // Verify all were created with unique IDs
      const ids = responses.map(r => r.body.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
    });

    it('should handle large pagination requests efficiently', async () => {
      // Create many action types - requests contain ONLY domain fields
      const createPromises = Array(50)
        .fill(null)
        .map((_, index) =>
          request(app.getHttpServer())
            .post('/action-types')
            .field('name', `Large Dataset Action ${index}`)
            .field('habitId', mockHabitId)
            .attach('logo', createMockFile().buffer, `large-${index}.png`)
        );

      await Promise.all(createPromises);

      // Test large pagination request
      const response = await request(app.getHttpServer())
        .get('/action-types')
        .query({ page: 1, limit: 50 })
        .expect(200);

      expect(response.body.data).toHaveLength(50);
      expect(response.body.total).toBe(50);
      expect(response.body.totalPages).toBe(1);
    });
  });
});
