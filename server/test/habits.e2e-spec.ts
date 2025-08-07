import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HabitComplexity } from '../src/domain/shared/types/common';

describe('HabitsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply the same global pipes as in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/v1/habits (POST)', () => {
    it('should create a new habit', () => {
      const createHabitDto = {
        name: 'Morning Exercise',
        habitType: HabitComplexity.SIMPLE,
        logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      };

      return request(app.getHttpServer())
        .post('/api/v1/habits')
        .send(createHabitDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(createHabitDto.name);
          expect(res.body.habitType).toBe(createHabitDto.habitType);
          expect(res.body.isActive).toBe(true);
          expect(res.body.totalActionsCount).toBe(0);
        });
    });

    it('should return 400 for invalid habit data', () => {
      const invalidHabitDto = {
        name: '', // Invalid: empty name
        habitType: 'INVALID_TYPE',
        logo: 'invalid-logo',
      };

      return request(app.getHttpServer())
        .post('/api/v1/habits')
        .send(invalidHabitDto)
        .expect(400);
    });

    it('should return 409 for duplicate habit name', async () => {
      const createHabitDto = {
        name: 'Duplicate Habit',
        habitType: HabitComplexity.SIMPLE,
        logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      };

      // Create first habit
      await request(app.getHttpServer())
        .post('/api/v1/habits')
        .send(createHabitDto)
        .expect(201);

      // Try to create duplicate
      return request(app.getHttpServer())
        .post('/api/v1/habits')
        .send(createHabitDto)
        .expect(409);
    });
  });

  describe('/api/v1/habits (GET)', () => {
    it('should return paginated habits', async () => {
      // Create test habits
      const habitsToCreate = [
        {
          name: 'Habit 1',
          habitType: HabitComplexity.SIMPLE,
          logo: 'data:image/png;base64,test1',
        },
        {
          name: 'Habit 2',
          habitType: HabitComplexity.COMPLEX,
          logo: 'data:image/png;base64,test2',
        },
      ];

      for (const habit of habitsToCreate) {
        await request(app.getHttpServer())
          .post('/api/v1/habits')
          .send(habit);
      }

      return request(app.getHttpServer())
        .get('/api/v1/habits?page=1&limit=10')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(res.body).toHaveProperty('totalPages');
          expect(res.body.data).toHaveLength(2);
        });
    });
  });

  describe('/api/v1/habits/:id (GET)', () => {
    it('should return a habit by id', async () => {
      const createHabitDto = {
        name: 'Test Habit',
        habitType: HabitComplexity.SIMPLE,
        logo: 'data:image/png;base64,test',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/habits')
        .send(createHabitDto);

      const habitId = createResponse.body.id;

      return request(app.getHttpServer())
        .get(`/api/v1/habits/${habitId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(habitId);
          expect(res.body.name).toBe(createHabitDto.name);
        });
    });

    it('should return 404 for non-existent habit', () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      
      return request(app.getHttpServer())
        .get(`/api/v1/habits/${nonExistentId}`)
        .expect(404);
    });
  });
});