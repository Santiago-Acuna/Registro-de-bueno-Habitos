import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UUID } from '../../domain/shared/types/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import {
  NotFoundError,
  ConflictError,
  ValidationException,
} from '../../infrastructure/exceptions/app.exceptions';
import { GlobalEntityIdentifiersModule } from '../global-entity-identifiers.module';
import { GlobalEntityIdentifiersRepository } from '../repositories/global-entity-identifiers.repository';
import { GlobalEntityIdentifiersService } from '../services/global-entity-identifiers.service';

// Value objects only pattern - no entities
// This module uses value objects (IdentifierName, IdentifierIcon) for validation
// Services and repositories work with plain data structures (not domain entities)
// Similar to action-types module which uses ActionTypeName value object

// Mock Prisma service with in-memory data store
class MockPrismaService {
  private identifiers: Map<string, any> = new Map();
  private nextId = 1;

  private generateId(): string {
    const id = this.nextId++;
    // Generate a valid UUID v4 format
    const hex = id.toString(16).padStart(8, '0');
    return `${hex.substring(0, 8)}-${hex.substring(0, 4)}-4${hex.substring(1, 4)}-a${hex.substring(1, 4)}-${hex.substring(0, 12).padEnd(12, '0')}`;
  }

  globalEntityIdentifiers = {
    create: jest.fn(async ({ data }: { data: any }) => {
          const id = this.generateId();

          // Check for name uniqueness constraint
          const existingWithName = Array.from(this.identifiers.values()).find(
            identifier => identifier.name === data.name
          );
          if (existingWithName) {
            const error = new Error(
              'Unique constraint failed on the constraint: `global_entity_identifiers_name_unique`'
            );
            (error as any).code = 'P2002';
            (error as any).meta = { target: ['name'] };
            throw error;
          }

          // Check for icon uniqueness constraint
          const existingWithIcon = Array.from(this.identifiers.values()).find(
            identifier => identifier.icon === data.icon
          );
          if (existingWithIcon) {
            const error = new Error(
              'Unique constraint failed on the constraint: `global_entity_identifiers_icon_unique`'
            );
            (error as any).code = 'P2002';
            (error as any).meta = { target: ['icon'] };
            throw error;
          }

          // Check for name+icon combination uniqueness
          const existingWithBoth = Array.from(this.identifiers.values()).find(
            identifier => identifier.name === data.name && identifier.icon === data.icon
          );
          if (existingWithBoth) {
            const error = new Error(
              'Unique constraint failed on the constraint: `global_entity_identifiers_name_icon_unique`'
            );
            (error as any).code = 'P2002';
            (error as any).meta = { target: ['name', 'icon'] };
            throw error;
          }

          // Check for entityType+entityId combination uniqueness
          const existingEntity = Array.from(this.identifiers.values()).find(
            identifier =>
              identifier.entityType === data.entityType && identifier.entityId === data.entityId
          );
          if (existingEntity) {
            const error = new Error(
              'Unique constraint failed on the constraint: `global_entity_identifiers_entity_unique`'
            );
            (error as any).code = 'P2002';
            (error as any).meta = { target: ['entityType', 'entityId'] };
            throw error;
          }

          const identifier = {
            id,
            name: data.name,
            icon: data.icon,
            entityType: data.entityType,
            entityId: data.entityId,
          };

          this.identifiers.set(id, identifier);
          return identifier;
        }),

        findUnique: jest.fn(async ({ where }) => {
          if (where.id) {
            return this.identifiers.get(where.id) || null;
          }
          if (where.name) {
            return (
              Array.from(this.identifiers.values()).find(
                identifier => identifier.name === where.name
              ) || null
            );
          }
          if (where.icon) {
            return (
              Array.from(this.identifiers.values()).find(
                identifier => identifier.icon === where.icon
              ) || null
            );
          }
          return null;
        }),

        findFirst: jest.fn(async ({ where }) => {
          return (
            Array.from(this.identifiers.values()).find(
              identifier =>
                (!where.name || identifier.name === where.name) &&
                (!where.icon || identifier.icon === where.icon) &&
                (!where.entityType || identifier.entityType === where.entityType) &&
                (!where.entityId || identifier.entityId === where.entityId)
            ) || null
          );
        }),

        findMany: jest.fn(async ({ where, orderBy }: { where?: any; orderBy?: any }) => {
          let results = Array.from(this.identifiers.values());

          // Apply filters
          if (where) {
            if (where.entityType) {
              results = results.filter(identifier => identifier.entityType === where.entityType);
            }
          }

          // Apply ordering
          if (orderBy) {
            const field = Object.keys(orderBy)[0] as string;
            const direction = orderBy[field];
            results.sort((a: any, b: any) => {
              if (direction === 'asc') {
                return a[field] > b[field] ? 1 : -1;
              } else {
                return a[field] < b[field] ? 1 : -1;
              }
            });
          }

          return results;
        }),

        count: jest.fn(async (args?: { where?: any }) => {
          let results = Array.from(this.identifiers.values());

          if (args?.where?.entityType) {
            results = results.filter(identifier => identifier.entityType === args.where.entityType);
          }

          return results.length;
        }),

        update: jest.fn(async ({ where, data }) => {
          const identifier = this.identifiers.get(where.id);
          if (!identifier) {
            const error = new Error('Record not found');
            (error as any).code = 'P2025';
            throw error;
          }

          // Check for name uniqueness constraint if name is being updated
          if (data.name && data.name !== identifier.name) {
            const existing = Array.from(this.identifiers.values()).find(
              i => i.id !== where.id && i.name === data.name
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

          // Check for icon uniqueness constraint if icon is being updated
          if (data.icon && data.icon !== identifier.icon) {
            const existing = Array.from(this.identifiers.values()).find(
              i => i.id !== where.id && i.icon === data.icon
            );
            if (existing) {
              const error = new Error(
                'Unique constraint failed on the constraint: `global_entity_identifiers_icon_unique`'
              );
              (error as any).code = 'P2002';
              (error as any).meta = { target: ['icon'] };
              throw error;
            }
          }

          const updated = {
            ...identifier,
            ...data,
          };

          this.identifiers.set(where.id, updated);
          return updated;
        }),

        delete: jest.fn(async ({ where }) => {
          const identifier = this.identifiers.get(where.id);
          if (!identifier) {
            const error = new Error('Record not found');
            (error as any).code = 'P2025';
            throw error;
          }

          this.identifiers.delete(where.id);
          return identifier;
        }),
      };

  clearData() {
    this.identifiers.clear();
    this.nextId = 1;
  }
}

describe('GlobalEntityIdentifiers Integration Tests (RED PHASE) - Value Objects Pattern', () => {
  let app: INestApplication;
  let service: GlobalEntityIdentifiersService;
  let repository: GlobalEntityIdentifiersRepository;
  let mockPrismaService: MockPrismaService;

  // Test data fixtures
  // Plain strings used for testing - validation happens via value objects at service layer
  const mockEntityId: UUID = '987fcdeb-51a2-43d1-9876-543210987654';
  const mockName = 'Morning Exercise';
  const mockIcon = 'https://example.com/icons/exercise.png';
  const mockEntityType = 'habit';

  beforeAll(async () => {
    mockPrismaService = new MockPrismaService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GlobalEntityIdentifiersModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();

    service = app.get(GlobalEntityIdentifiersService);
    repository = app.get('IGlobalEntityIdentifiersRepository');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrismaService.clearData();
  });

  describe('Full CRUD Flow Integration', () => {
    it('should complete full CRUD lifecycle successfully', async () => {
      // 1. CREATE - Should create new global entity identifier
      // Value objects pattern: Service validates name/icon using IdentifierName/IdentifierIcon value objects
      const createResult = await service.create({
        name: mockName,
        icon: mockIcon,
        entityType: mockEntityType,
        entityId: mockEntityId,
      });

      const identifierId = createResult.id;
      // Returns plain object (not domain entity)
      expect(createResult).toMatchObject({
        id: expect.any(String),
        name: mockName,
        icon: mockIcon,
        entityType: mockEntityType,
        entityId: mockEntityId,
      });

      // 2. READ BY ID - Should retrieve the created identifier
      const getByIdResult = await service.findById(identifierId);
      expect(getByIdResult).toMatchObject({
        id: identifierId,
        name: mockName,
        icon: mockIcon,
      });

      // 3. READ BY NAME - Should find by name
      const getByNameResult = await service.findByName(mockName);
      expect(getByNameResult).toMatchObject({
        id: identifierId,
        name: mockName,
      });

      // 4. READ BY ICON - Should find by icon
      const getByIconResult = await service.findByIcon(mockIcon);
      expect(getByIconResult).toMatchObject({
        id: identifierId,
        icon: mockIcon,
      });

      // 5. READ BY ENTITY - Should find by entity type and id
      const getByEntityResult = await service.findByEntityTypeAndId(mockEntityType, mockEntityId);
      expect(getByEntityResult).toMatchObject({
        id: identifierId,
        entityType: mockEntityType,
        entityId: mockEntityId,
      });

      // 6. UPDATE NAME - Should update name
      const updateNameResult = await service.update(identifierId, {
        name: 'Evening Exercise',
      });
      expect(updateNameResult.name).toBe('Evening Exercise');
      expect(updateNameResult.icon).toBe(mockIcon); // Icon unchanged

      // 7. UPDATE ICON - Should update icon
      const newIcon = 'https://example.com/icons/evening.png';
      const updateIconResult = await service.update(identifierId, {
        icon: newIcon,
      });
      expect(updateIconResult.icon).toBe(newIcon);
      expect(updateIconResult.name).toBe('Evening Exercise'); // Name from previous update

      // 8. UPDATE BOTH - Should update both name and icon
      const updateBothResult = await service.update(identifierId, {
        name: 'Night Exercise',
        icon: 'https://example.com/icons/night.png',
      });
      expect(updateBothResult.name).toBe('Night Exercise');
      expect(updateBothResult.icon).toBe('https://example.com/icons/night.png');

      // 9. DELETE - Should remove identifier
      await service.delete(identifierId);

      // 10. VERIFY DELETION - Should throw NotFoundError
      await expect(service.findById(identifierId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('Global Uniqueness Enforcement', () => {
    it('should enforce global unique constraint for name', async () => {
      // Create first identifier
      const result1 = await service.create({
        name: mockName,
        icon: mockIcon,
        entityType: mockEntityType,
        entityId: mockEntityId,
      });

      expect(result1.name).toBe(mockName);

      // Attempt to create second identifier with same name but different icon and entity
      const differentEntityId: UUID = '111e1111-e11e-11e1-a111-111111111111';
      await expect(
        service.create({
          name: mockName, // Same name
          icon: 'https://example.com/icons/different.png', // Different icon
          entityType: 'action-type', // Different entity type
          entityId: differentEntityId, // Different entity id
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should enforce global unique constraint for icon', async () => {
      // Create first identifier
      await service.create({
        name: mockName,
        icon: mockIcon,
        entityType: mockEntityType,
        entityId: mockEntityId,
      });

      // Attempt to create second identifier with same icon but different name and entity
      const differentEntityId: UUID = '222e2222-e22e-22e2-a222-222222222222';
      await expect(
        service.create({
          name: 'Different Name', // Different name
          icon: mockIcon, // Same icon
          entityType: 'action-type', // Different entity type
          entityId: differentEntityId, // Different entity id
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should enforce unique constraint for entity type and id combination', async () => {
      // Create first identifier
      await service.create({
        name: mockName,
        icon: mockIcon,
        entityType: mockEntityType,
        entityId: mockEntityId,
      });

      // Attempt to create second identifier for same entity (even with different name/icon)
      await expect(
        service.create({
          name: 'Different Name',
          icon: 'https://example.com/icons/different.png',
          entityType: mockEntityType, // Same entity type
          entityId: mockEntityId, // Same entity id
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should reject allow same name and icon if at least one is different', async () => {
      // This test verifies that the unique constraints work correctly
      // Create first identifier
      await service.create({
        name: 'Name1',
        icon: 'https://example.com/icons/icon1.png',
        entityType: mockEntityType,
        entityId: '111e1111-e11e-11e1-a111-111111111111' as UUID,
      });

      // Should fail: same name (even with different icon and entity)
      await expect(
        service.create({
          name: 'Name1', // Same name
          icon: 'https://example.com/icons/icon2.png',
          entityType: 'action-type',
          entityId: '222e2222-e22e-22e2-a222-222222222222' as UUID,
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('Existence Checks Integration', () => {
    it('should correctly check existence by name', async () => {
      // Initially should not exist
      expect(await service.existsByName(mockName)).toBe(false);

      // Create identifier
      await service.create({
        name: mockName,
        icon: mockIcon,
        entityType: mockEntityType,
        entityId: mockEntityId,
      });

      // Now should exist
      expect(await service.existsByName(mockName)).toBe(true);

      // Different name should not exist
      expect(await service.existsByName('Non-existent Name')).toBe(false);
    });

    it('should correctly check existence by icon', async () => {
      // Initially should not exist
      expect(await service.existsByIcon(mockIcon)).toBe(false);

      // Create identifier
      await service.create({
        name: mockName,
        icon: mockIcon,
        entityType: mockEntityType,
        entityId: mockEntityId,
      });

      // Now should exist
      expect(await service.existsByIcon(mockIcon)).toBe(true);

      // Different icon should not exist
      expect(await service.existsByIcon('https://example.com/other.png')).toBe(false);
    });
  });

  describe('Update Operations Integration', () => {
    it('should prevent updating to an existing name', async () => {
      // Create two identifiers
      const result1 = await service.create({
        name: 'First Name',
        icon: 'https://example.com/icons/icon1.png',
        entityType: mockEntityType,
        entityId: '111e1111-e11e-11e1-a111-111111111111' as UUID,
      });

      await service.create({
        name: 'Second Name',
        icon: 'https://example.com/icons/icon2.png',
        entityType: 'action-type',
        entityId: '222e2222-e22e-22e2-a222-222222222222' as UUID,
      });

      // Attempt to update first to have the same name as second
      await expect(service.update(result1.id, { name: 'Second Name' })).rejects.toThrow(
        ConflictError
      );
    });

    it('should prevent updating to an existing icon', async () => {
      // Create two identifiers
      const result1 = await service.create({
        name: 'First Name',
        icon: 'https://example.com/icons/icon1.png',
        entityType: mockEntityType,
        entityId: '111e1111-e11e-11e1-a111-111111111111' as UUID,
      });

      await service.create({
        name: 'Second Name',
        icon: 'https://example.com/icons/icon2.png',
        entityType: 'action-type',
        entityId: '222e2222-e22e-22e2-a222-222222222222' as UUID,
      });

      // Attempt to update first to have the same icon as second
      await expect(service.update(result1.id, { icon: 'https://example.com/icons/icon2.png' })).rejects.toThrow(
        ConflictError
      );
    });

    it('should allow updating to same name (no-op)', async () => {
      // Create identifier
      const result = await service.create({
        name: mockName,
        icon: mockIcon,
        entityType: mockEntityType,
        entityId: mockEntityId,
      });

      // Update to same name should succeed
      const updated = await service.update(result.id, { name: mockName });
      expect(updated.name).toBe(mockName);
    });

    it('should allow updating to same icon (no-op)', async () => {
      // Create identifier
      const result = await service.create({
        name: mockName,
        icon: mockIcon,
        entityType: mockEntityType,
        entityId: mockEntityId,
      });

      // Update to same icon should succeed
      const updated = await service.update(result.id, { icon: mockIcon });
      expect(updated.icon).toBe(mockIcon);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle not found errors correctly', async () => {
      const nonExistentId = '999e9999-e99e-4999-a999-999999999999' as UUID;

      // Test various operations with non-existent ID
      await expect(service.findById(nonExistentId)).rejects.toThrow(NotFoundError);
      await expect(service.update(nonExistentId, { name: 'New Name' })).rejects.toThrow(
        NotFoundError
      );
      await expect(service.delete(nonExistentId)).rejects.toThrow(NotFoundError);
    });

    it('should validate empty name', async () => {
      await expect(
        service.create({
          name: '',
          icon: mockIcon,
          entityType: mockEntityType,
          entityId: mockEntityId,
        })
      ).rejects.toThrow(ValidationException);
    });

    it('should validate empty icon', async () => {
      await expect(
        service.create({
          name: mockName,
          icon: '',
          entityType: mockEntityType,
          entityId: mockEntityId,
        })
      ).rejects.toThrow(ValidationException);
    });

    it('should validate entity type', async () => {
      await expect(
        service.create({
          name: mockName,
          icon: mockIcon,
          entityType: 'invalid-type' as any,
          entityId: mockEntityId,
        })
      ).rejects.toThrow(ValidationException);
    });

    it('should validate name length', async () => {
      const tooLongName = 'A'.repeat(256);
      await expect(
        service.create({
          name: tooLongName,
          icon: mockIcon,
          entityType: mockEntityType,
          entityId: mockEntityId,
        })
      ).rejects.toThrow(ValidationException);
    });

    it('should trim and validate whitespace-only names', async () => {
      await expect(
        service.create({
          name: '   ',
          icon: mockIcon,
          entityType: mockEntityType,
          entityId: mockEntityId,
        })
      ).rejects.toThrow(ValidationException);
    });
  });

  describe('Query Operations Integration', () => {
    it('should find all identifiers', async () => {
      // Create multiple identifiers
      await service.create({
        name: 'First',
        icon: 'https://example.com/icons/icon1.png',
        entityType: 'habit',
        entityId: '111e1111-e11e-11e1-a111-111111111111' as UUID,
      });

      await service.create({
        name: 'Second',
        icon: 'https://example.com/icons/icon2.png',
        entityType: 'habit',
        entityId: '222e2222-e22e-22e2-a222-222222222222' as UUID,
      });

      await service.create({
        name: 'Third',
        icon: 'https://example.com/icons/icon3.png',
        entityType: 'action-type',
        entityId: '333e3333-e33e-33e3-a333-333333333333' as UUID,
      });

      // Get all
      const allIdentifiers = await repository.findAll();
      expect(allIdentifiers).toHaveLength(3);
    });

    it('should filter by entity type', async () => {
      // Create identifiers with different entity types
      await service.create({
        name: 'Habit 1',
        icon: 'https://example.com/icons/habit1.png',
        entityType: 'habit',
        entityId: '111e1111-e11e-11e1-a111-111111111111' as UUID,
      });

      await service.create({
        name: 'Habit 2',
        icon: 'https://example.com/icons/habit2.png',
        entityType: 'habit',
        entityId: '222e2222-e22e-22e2-a222-222222222222' as UUID,
      });

      await service.create({
        name: 'Action Type 1',
        icon: 'https://example.com/icons/action1.png',
        entityType: 'action-type',
        entityId: '333e3333-e33e-33e3-a333-333333333333' as UUID,
      });

      // Filter by habit entity type
      const habits = await repository.findAll({ entityType: 'habit' });
      expect(Array.isArray(habits)).toBe(true);
      expect(habits).toHaveLength(2);
      if (Array.isArray(habits)) {
        expect(habits.every(h => h.entityType === 'habit')).toBe(true);
      }

      // Filter by action-type entity type
      const actionTypes = await repository.findAll({ entityType: 'action-type' });
      expect(Array.isArray(actionTypes)).toBe(true);
      expect(actionTypes).toHaveLength(1);
      if (Array.isArray(actionTypes) && actionTypes[0]) {
        expect(actionTypes[0].entityType).toBe('action-type');
      }
    });

    it('should count identifiers correctly', async () => {
      // Initially zero
      expect(await repository.count()).toBe(0);

      // Create some identifiers
      await service.create({
        name: 'First',
        icon: 'https://example.com/icons/icon1.png',
        entityType: 'habit',
        entityId: '111e1111-e11e-11e1-a111-111111111111' as UUID,
      });

      expect(await repository.count()).toBe(1);

      await service.create({
        name: 'Second',
        icon: 'https://example.com/icons/icon2.png',
        entityType: 'action-type',
        entityId: '222e2222-e22e-22e2-a222-222222222222' as UUID,
      });

      expect(await repository.count()).toBe(2);

      // Count with filter
      expect(await repository.count({ entityType: 'habit' })).toBe(1);
      expect(await repository.count({ entityType: 'action-type' })).toBe(1);
    });
  });

  describe('Concurrent Operations Integration', () => {
    it('should handle concurrent creation attempts with same name', async () => {
      // Attempt to create multiple identifiers with same name concurrently
      const concurrentCreations = [
        service.create({
          name: mockName,
          icon: 'https://example.com/icons/icon1.png',
          entityType: 'habit',
          entityId: '111e1111-e11e-11e1-a111-111111111111' as UUID,
        }),
        service.create({
          name: mockName,
          icon: 'https://example.com/icons/icon2.png',
          entityType: 'action-type',
          entityId: '222e2222-e22e-22e2-a222-222222222222' as UUID,
        }),
      ];

      // One should succeed, one should fail
      const results = await Promise.allSettled(concurrentCreations);
      const succeeded = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      expect(succeeded).toHaveLength(1);
      expect(failed).toHaveLength(1);
    });

    it('should handle concurrent updates correctly', async () => {
      // Create identifier
      const result = await service.create({
        name: mockName,
        icon: mockIcon,
        entityType: mockEntityType,
        entityId: mockEntityId,
      });

      // Perform concurrent updates
      const updates = [
        service.update(result.id, { name: 'Update 1' }),
        service.update(result.id, { name: 'Update 2' }),
      ];

      await Promise.all(updates);

      // Verify final state
      const final = await service.findById(result.id);
      expect(final).toBeDefined();
      expect(['Update 1', 'Update 2']).toContain(final.name);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle special characters in name', async () => {
      const specialName = "O'Brien's Exercise <>&\"'";
      const result = await service.create({
        name: specialName,
        icon: mockIcon,
        entityType: mockEntityType,
        entityId: mockEntityId,
      });

      expect(result.name).toBe(specialName);

      // Should be able to find it
      const found = await service.findByName(specialName);
      expect(found).toBeDefined();
      expect(found!.name).toBe(specialName);
    });

    it('should handle special characters in icon URL', async () => {
      const specialIcon = "https://example.com/icon?param=value&other='quoted'";
      const result = await service.create({
        name: mockName,
        icon: specialIcon,
        entityType: mockEntityType,
        entityId: mockEntityId,
      });

      expect(result.icon).toBe(specialIcon);

      // Should be able to find it
      const found = await service.findByIcon(specialIcon);
      expect(found).toBeDefined();
      expect(found!.icon).toBe(specialIcon);
    });

    it('should handle maximum name length', async () => {
      const maxLengthName = 'A'.repeat(50); // Maximum allowed
      const result = await service.create({
        name: maxLengthName,
        icon: mockIcon,
        entityType: mockEntityType,
        entityId: mockEntityId,
      });

      expect(result.name).toBe(maxLengthName);
      expect(result.name).toHaveLength(255);
    });

    it('should trim whitespace from names', async () => {
      const nameWithWhitespace = '  Morning Exercise  ';
      const trimmedName = 'Morning Exercise';

      const result = await service.create({
        name: nameWithWhitespace,
        icon: mockIcon,
        entityType: mockEntityType,
        entityId: mockEntityId,
      });

      expect(result.name).toBe(trimmedName);

      // Should be findable by trimmed name
      const found = await service.findByName(trimmedName);
      expect(found).toBeDefined();
    });

    it('should handle multiple deletes and recreates', async () => {
      // Create
      const result1 = await service.create({
        name: mockName,
        icon: mockIcon,
        entityType: mockEntityType,
        entityId: mockEntityId,
      });

      // Delete
      await service.delete(result1.id);

      // Recreate with same data (should succeed since previous was deleted)
      const result2 = await service.create({
        name: mockName,
        icon: mockIcon,
        entityType: mockEntityType,
        entityId: mockEntityId,
      });

      expect(result2).toBeDefined();
      expect(result2.name).toBe(mockName);
      expect(result2.id).not.toBe(result1.id); // Different ID
    });
  });

  describe('Data Integrity Integration', () => {
    it('should maintain referential integrity between entities', async () => {
      // This test would verify that the global entity identifier
      // correctly links to the entity it represents
      const habitId: UUID = '111e1111-e11e-11e1-a111-111111111111';

      const result = await service.create({
        name: mockName,
        icon: mockIcon,
        entityType: 'habit',
        entityId: habitId,
      });

      // Verify we can find by entity
      const foundByEntity = await service.findByEntityTypeAndId('habit', habitId);
      expect(foundByEntity).toBeDefined();
      expect(foundByEntity!.entityId).toBe(habitId);
      expect(foundByEntity!.id).toBe(result.id);
    });

    it('should ensure one identifier per entity', async () => {
      const habitId: UUID = '111e1111-e11e-11e1-a111-111111111111';

      // Create first identifier for habit
      await service.create({
        name: 'First Name',
        icon: 'https://example.com/icons/icon1.png',
        entityType: 'habit',
        entityId: habitId,
      });

      // Attempt to create second identifier for same habit
      await expect(
        service.create({
          name: 'Second Name',
          icon: 'https://example.com/icons/icon2.png',
          entityType: 'habit',
          entityId: habitId, // Same entity
        })
      ).rejects.toThrow(ConflictError);
    });
  });
});
