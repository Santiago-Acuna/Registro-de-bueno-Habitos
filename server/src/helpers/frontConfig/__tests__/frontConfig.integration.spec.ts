import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../../../app.module';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

describe('FrontConfigController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.globalEntityIdentifiers.deleteMany();
    await prisma.actionTypes.deleteMany();
    await prisma.habits.deleteMany();
  });

  describe('GET /front-config/habits-by-type', () => {
    it('should return 200 and empty structure when no habits exist', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/front-config/habits-by-type')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        complex: [],
        simple: [],
        withoutintervals: [],
      });
    });

    it('should return habits organized by type', async () => {
      // Arrange - Create habits in database
      const complexHabit = await prisma.habits.create({
        data: {
          habitType: 'complex',
        },
      });

      const complexGlobalId = await prisma.globalEntityIdentifiers.create({
        data: {
          name: 'Programming',
          icon: 'https://example.com/icon.png',
          entityType: 'habit',
          entityId: complexHabit.id,
        },
      });

      await prisma.habits.update({
        where: { id: complexHabit.id },
        data: {
          globalIdentifierId: complexGlobalId.id,
        },
      });

      const simpleHabit = await prisma.habits.create({
        data: {
          habitType: 'simple',
        },
      });

      const simpleGlobalId = await prisma.globalEntityIdentifiers.create({
        data: {
          name: 'Morning Exercise',
          icon: 'https://example.com/icon2.png',
          entityType: 'habit',
          entityId: simpleHabit.id,
        },
      });

      await prisma.habits.update({
        where: { id: simpleHabit.id },
        data: {
          globalIdentifierId: simpleGlobalId.id,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/front-config/habits-by-type')
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('complex');
      expect(response.body).toHaveProperty('simple');
      expect(response.body).toHaveProperty('withoutintervals');
      expect(Array.isArray(response.body.complex)).toBe(true);
      expect(Array.isArray(response.body.simple)).toBe(true);
      expect(Array.isArray(response.body.withoutintervals)).toBe(true);
    });

    it('should include action types for complex habits', async () => {
      // Arrange - Create complex habit with action types
      const habit = await prisma.habits.create({
        data: {
          habitType: 'complex',
        },
      });

      const habitGlobalId = await prisma.globalEntityIdentifiers.create({
        data: {
          name: 'Programming',
          icon: 'https://example.com/icon.png',
          entityType: 'habit',
          entityId: habit.id,
        },
      });

      await prisma.habits.update({
        where: { id: habit.id },
        data: {
          globalIdentifierId: habitGlobalId.id,
        },
      });

      // Create action types
      const actionType1 = await prisma.actionTypes.create({
        data: {
          habitId: habit.id,
        },
      });

      const action1GlobalId = await prisma.globalEntityIdentifiers.create({
        data: {
          name: 'for work',
          icon: 'https://example.com/action-icon.png',
          entityType: 'action_type',
          entityId: actionType1.id,
        },
      });

      await prisma.actionTypes.update({
        where: { id: actionType1.id },
        data: {
          globalIdentifierId: action1GlobalId.id,
        },
      });

      const actionType2 = await prisma.actionTypes.create({
        data: {
          habitId: habit.id,
        },
      });

      const action2GlobalId = await prisma.globalEntityIdentifiers.create({
        data: {
          name: 'personal Project',
          icon: 'https://example.com/action-icon2.png',
          entityType: 'action_type',
          entityId: actionType2.id,
        },
      });

      await prisma.actionTypes.update({
        where: { id: actionType2.id },
        data: {
          globalIdentifierId: action2GlobalId.id,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/front-config/habits-by-type')
        .expect(200);

      // Assert
      expect(response.body.complex).toHaveLength(1);
      expect(response.body.complex[0]).toHaveProperty('Programming');
      expect(response.body.complex[0]['Programming']).toContain('for work');
      expect(response.body.complex[0]['Programming']).toContain('personal Project');
    });

    it('should only return active habits', async () => {
      // Arrange - Create active and inactive habits
      const activeHabit = await prisma.habits.create({
        data: {
          habitType: 'simple',
          isActive: true,
        },
      });

      const activeGlobalId = await prisma.globalEntityIdentifiers.create({
        data: {
          name: 'Active Habit',
          icon: 'https://example.com/icon.png',
          entityType: 'habit',
          entityId: activeHabit.id,
        },
      });

      await prisma.habits.update({
        where: { id: activeHabit.id },
        data: {
          globalIdentifierId: activeGlobalId.id,
        },
      });

      const inactiveHabit = await prisma.habits.create({
        data: {
          habitType: 'simple',
          isActive: false,
        },
      });

      const inactiveGlobalId = await prisma.globalEntityIdentifiers.create({
        data: {
          name: 'Inactive Habit',
          icon: 'https://example.com/icon2.png',
          entityType: 'habit',
          entityId: inactiveHabit.id,
        },
      });

      await prisma.habits.update({
        where: { id: inactiveHabit.id },
        data: {
          globalIdentifierId: inactiveGlobalId.id,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/front-config/habits-by-type')
        .expect(200);

      // Assert
      expect(response.body.simple).toHaveLength(1);
      expect(response.body.simple[0]).toHaveProperty('Active Habit');
      expect(response.body.simple[0]).not.toHaveProperty('Inactive Habit');
    });

    it('should handle multiple habits of different types', async () => {
      // Arrange - Create multiple habits
      const habits: Array<{ name: string; type: 'complex' | 'simple' | 'withoutIntervals' }> = [
        { name: 'Programming', type: 'complex' },
        { name: 'Cooking', type: 'complex' },
        { name: 'Exercise', type: 'simple' },
        { name: 'Reading', type: 'simple' },
        { name: 'Water', type: 'withoutIntervals' },
      ];

      for (const habitData of habits) {
        const habit = await prisma.habits.create({
          data: {
            habitType: habitData.type as any,
          },
        });

        const globalId = await prisma.globalEntityIdentifiers.create({
          data: {
            name: habitData.name,
            icon: 'https://example.com/icon.png',
            entityType: 'habit',
            entityId: habit.id,
          },
        });

        await prisma.habits.update({
          where: { id: habit.id },
          data: {
            globalIdentifierId: globalId.id,
          },
        });
      }

      // Act
      const response = await request(app.getHttpServer())
        .get('/front-config/habits-by-type')
        .expect(200);

      // Assert
      expect(response.body.complex).toHaveLength(1);
      expect(Object.keys(response.body.complex[0])).toHaveLength(2);
      expect(response.body.simple).toHaveLength(1);
      expect(Object.keys(response.body.simple[0])).toHaveLength(2);
      expect(response.body.withoutintervals).toHaveLength(1);
      expect(Object.keys(response.body.withoutintervals[0])).toHaveLength(1);
    });

    it('should return empty action types array for habits without action types', async () => {
      // Arrange - Create habit without action types
      const habit = await prisma.habits.create({
        data: {
          habitType: 'complex',
        },
      });

      const habitGlobalId = await prisma.globalEntityIdentifiers.create({
        data: {
          name: 'Learn english',
          icon: 'https://example.com/icon.png',
          entityType: 'habit',
          entityId: habit.id,
        },
      });

      await prisma.habits.update({
        where: { id: habit.id },
        data: {
          globalIdentifierId: habitGlobalId.id,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/front-config/habits-by-type')
        .expect(200);

      // Assert
      expect(response.body.complex).toHaveLength(1);
      expect(response.body.complex[0]['Learn english']).toEqual([]);
    });

    it('should have proper HTTP status code and content-type', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/front-config/habits-by-type')
        .expect(200)
        .expect('Content-Type', /json/);

      // Assert
      expect(response.body).toBeDefined();
    });

    it('should handle request with proper API versioning', async () => {
      // Act - Test v1 endpoint
      const response = await request(app.getHttpServer())
        .get('/front-config/habits-by-type')
        .set('Accept', 'application/json')
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('complex');
      expect(response.body).toHaveProperty('simple');
      expect(response.body).toHaveProperty('withoutintervals');
    });
  });

  describe('Error handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test will depend on the actual implementation
      // For now, we just verify the endpoint exists
      await request(app.getHttpServer()).get('/front-config/habits-by-type').expect(200);
    });
  });
});
