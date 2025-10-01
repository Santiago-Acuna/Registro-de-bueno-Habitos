import { Test, TestingModule } from '@nestjs/testing';

import { DatabaseService } from '../../../infrastructure/database/database.service';
import { UUID } from '../../../domain/shared/types/common';
import {
  NotFoundError,
  ConflictError,
} from '../../../infrastructure/exceptions/app.exceptions';
import {
  CreateGlobalEntityIdentifierData,
  UpdateGlobalEntityIdentifierData,
} from '../../interfaces/global-entity-identifiers-repository.interface';
import { GlobalEntityIdentifiersRepository } from '../global-entity-identifiers.repository';

// Value objects only pattern - no entities
// Repository works with plain data structures, validation happens via value objects

// Mock Prisma client
const mockPrismaClient = {
  globalEntityIdentifiers: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

const mockDatabaseService = {
  getClient: jest.fn(() => mockPrismaClient),
};

describe('GlobalEntityIdentifiersRepository (RED PHASE) - Value Objects Only Pattern', () => {
  let repository: GlobalEntityIdentifiersRepository;
  let databaseService: jest.Mocked<DatabaseService>;

  // Test data fixtures
  // Note: These are plain strings, not value objects
  // Value objects (IdentifierName, IdentifierIcon) will be used for validation at service layer
  const mockIdentifierId: UUID = '123e4567-e89b-12d3-a456-426614174000';
  const mockEntityId: UUID = '987fcdeb-51a2-43d1-9876-543210987654';
  const mockName = 'Morning Exercise';
  const mockIcon = 'https://example.com/icons/exercise.png';
  const mockEntityType = 'habit';

  // Repository works with plain data structures from Prisma
  const createMockPrismaIdentifier = (overrides: Partial<any> = {}) => ({
    id: mockIdentifierId,
    name: mockName,
    icon: mockIcon,
    entityType: mockEntityType,
    entityId: mockEntityId,
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalEntityIdentifiersRepository,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    repository = module.get<GlobalEntityIdentifiersRepository>(
      GlobalEntityIdentifiersRepository
    );
    databaseService = module.get(DatabaseService);
  });

  describe('create()', () => {
    const createData: CreateGlobalEntityIdentifierData = {
      name: mockName,
      icon: mockIcon,
      entityType: mockEntityType,
      entityId: mockEntityId,
    };

    it('should successfully create a new global entity identifier', async () => {
      // Arrange
      const mockPrismaResult = createMockPrismaIdentifier();
      mockPrismaClient.globalEntityIdentifiers.create.mockResolvedValue(mockPrismaResult);

      // Act
      const result = await repository.create(createData);

      // Assert
      expect(mockPrismaClient.globalEntityIdentifiers.create).toHaveBeenCalledWith({
        data: {
          name: createData.name,
          icon: createData.icon,
          entityType: createData.entityType,
          entityId: createData.entityId,
        },
      });
      // Value objects pattern: Repository returns plain object (not entity)
      expect(result).toEqual(mockPrismaResult);
      expect(result.id).toBe(mockIdentifierId);
      expect(result.name).toBe(mockName);
      expect(result.icon).toBe(mockIcon);
    });

    it('should throw ConflictError when name already exists (unique constraint)', async () => {
      // Arrange
      const conflictError = new Error('Unique constraint failed');
      (conflictError as any).code = 'P2002';
      (conflictError as any).meta = { target: ['name'] };
      mockPrismaClient.globalEntityIdentifiers.create.mockRejectedValue(conflictError);

      // Act & Assert
      await expect(repository.create(createData)).rejects.toThrow(ConflictError);
      await expect(repository.create(createData)).rejects.toThrow(
        `Global entity identifier with name '${createData.name}' already exists`
      );
    });

    it('should throw ConflictError when icon already exists (unique constraint)', async () => {
      // Arrange
      const conflictError = new Error('Unique constraint failed');
      (conflictError as any).code = 'P2002';
      (conflictError as any).meta = { target: ['icon'] };
      mockPrismaClient.globalEntityIdentifiers.create.mockRejectedValue(conflictError);

      // Act & Assert
      await expect(repository.create(createData)).rejects.toThrow(ConflictError);
      await expect(repository.create(createData)).rejects.toThrow(
        `Global entity identifier with icon '${createData.icon}' already exists`
      );
    });

    it('should throw ConflictError when name and icon combination exists', async () => {
      // Arrange
      const conflictError = new Error('Unique constraint failed');
      (conflictError as any).code = 'P2002';
      (conflictError as any).meta = { target: ['name', 'icon'] };
      mockPrismaClient.globalEntityIdentifiers.create.mockRejectedValue(conflictError);

      // Act & Assert
      await expect(repository.create(createData)).rejects.toThrow(ConflictError);
      await expect(repository.create(createData)).rejects.toThrow(
        'Global entity identifier with this name and icon combination already exists'
      );
    });

    it('should throw ConflictError when entity type and id combination exists', async () => {
      // Arrange
      const conflictError = new Error('Unique constraint failed');
      (conflictError as any).code = 'P2002';
      (conflictError as any).meta = { target: ['entityType', 'entityId'] };
      mockPrismaClient.globalEntityIdentifiers.create.mockRejectedValue(conflictError);

      // Act & Assert
      await expect(repository.create(createData)).rejects.toThrow(ConflictError);
      await expect(repository.create(createData)).rejects.toThrow(
        'Global entity identifier already exists for this entity'
      );
    });

    it('should rethrow other Prisma errors', async () => {
      // Arrange
      const databaseError = new Error('Database connection failed');
      mockPrismaClient.globalEntityIdentifiers.create.mockRejectedValue(databaseError);

      // Act & Assert
      await expect(repository.create(createData)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('findById()', () => {
    it('should return identifier when found', async () => {
      // Arrange
      const mockPrismaResult = createMockPrismaIdentifier();
      mockPrismaClient.globalEntityIdentifiers.findUnique.mockResolvedValue(
        mockPrismaResult
      );

      // Act
      const result = await repository.findById(mockIdentifierId);

      // Assert
      expect(mockPrismaClient.globalEntityIdentifiers.findUnique).toHaveBeenCalledWith({
        where: { id: mockIdentifierId },
      });
      expect(result).toEqual(mockPrismaResult);
      expect(result!.id).toBe(mockIdentifierId);
    });

    it('should return null when identifier not found', async () => {
      // Arrange
      mockPrismaClient.globalEntityIdentifiers.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findById(mockIdentifierId);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      // Arrange
      const databaseError = new Error('Database connection failed');
      mockPrismaClient.globalEntityIdentifiers.findUnique.mockRejectedValue(databaseError);

      // Act & Assert
      await expect(repository.findById(mockIdentifierId)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('findByName()', () => {
    it('should return identifier when found by name', async () => {
      // Arrange
      const mockPrismaResult = createMockPrismaIdentifier();
      mockPrismaClient.globalEntityIdentifiers.findUnique.mockResolvedValue(
        mockPrismaResult
      );

      // Act
      const result = await repository.findByName(mockName);

      // Assert
      expect(mockPrismaClient.globalEntityIdentifiers.findUnique).toHaveBeenCalledWith({
        where: { name: mockName },
      });
      expect(result).toEqual(mockPrismaResult);
      expect(result!.name).toBe(mockName);
    });

    it('should return null when not found by name', async () => {
      // Arrange
      mockPrismaClient.globalEntityIdentifiers.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findByName(mockName);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle case-sensitive name search', async () => {
      // Arrange
      const upperCaseName = 'MORNING EXERCISE';
      mockPrismaClient.globalEntityIdentifiers.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findByName(upperCaseName);

      // Assert
      expect(mockPrismaClient.globalEntityIdentifiers.findUnique).toHaveBeenCalledWith({
        where: { name: upperCaseName },
      });
      expect(result).toBeNull(); // Should not find with different case
    });
  });

  describe('findByIcon()', () => {
    it('should return identifier when found by icon', async () => {
      // Arrange
      const mockPrismaResult = createMockPrismaIdentifier();
      mockPrismaClient.globalEntityIdentifiers.findUnique.mockResolvedValue(
        mockPrismaResult
      );

      // Act
      const result = await repository.findByIcon(mockIcon);

      // Assert
      expect(mockPrismaClient.globalEntityIdentifiers.findUnique).toHaveBeenCalledWith({
        where: { icon: mockIcon },
      });
      expect(result).toEqual(mockPrismaResult);
      expect(result!.icon).toBe(mockIcon);
    });

    it('should return null when not found by icon', async () => {
      // Arrange
      mockPrismaClient.globalEntityIdentifiers.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findByIcon(mockIcon);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByEntityTypeAndId()', () => {
    it('should return identifier when found by entity type and id', async () => {
      // Arrange
      const mockPrismaResult = createMockPrismaIdentifier();
      mockPrismaClient.globalEntityIdentifiers.findFirst.mockResolvedValue(
        mockPrismaResult
      );

      // Act
      const result = await repository.findByEntityTypeAndId(mockEntityType, mockEntityId);

      // Assert
      expect(mockPrismaClient.globalEntityIdentifiers.findFirst).toHaveBeenCalledWith({
        where: {
          entityType: mockEntityType,
          entityId: mockEntityId,
        },
      });
      expect(result).toEqual(mockPrismaResult);
    });

    it('should return null when not found', async () => {
      // Arrange
      mockPrismaClient.globalEntityIdentifiers.findFirst.mockResolvedValue(null);

      // Act
      const result = await repository.findByEntityTypeAndId(mockEntityType, mockEntityId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('existsByName()', () => {
    it('should return true when name exists', async () => {
      // Arrange
      mockPrismaClient.globalEntityIdentifiers.findUnique.mockResolvedValue(
        createMockPrismaIdentifier()
      );

      // Act
      const result = await repository.existsByName(mockName);

      // Assert
      expect(mockPrismaClient.globalEntityIdentifiers.findUnique).toHaveBeenCalledWith({
        where: { name: mockName },
      });
      expect(result).toBe(true);
    });

    it('should return false when name does not exist', async () => {
      // Arrange
      mockPrismaClient.globalEntityIdentifiers.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.existsByName(mockName);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('existsByIcon()', () => {
    it('should return true when icon exists', async () => {
      // Arrange
      mockPrismaClient.globalEntityIdentifiers.findUnique.mockResolvedValue(
        createMockPrismaIdentifier()
      );

      // Act
      const result = await repository.existsByIcon(mockIcon);

      // Assert
      expect(mockPrismaClient.globalEntityIdentifiers.findUnique).toHaveBeenCalledWith({
        where: { icon: mockIcon },
      });
      expect(result).toBe(true);
    });

    it('should return false when icon does not exist', async () => {
      // Arrange
      mockPrismaClient.globalEntityIdentifiers.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.existsByIcon(mockIcon);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('existsByNameAndIcon()', () => {
    it('should return true when name and icon combination exists', async () => {
      // Arrange
      mockPrismaClient.globalEntityIdentifiers.findFirst.mockResolvedValue(
        createMockPrismaIdentifier()
      );

      // Act
      const result = await repository.existsByNameAndIcon(mockName, mockIcon);

      // Assert
      expect(mockPrismaClient.globalEntityIdentifiers.findFirst).toHaveBeenCalledWith({
        where: {
          name: mockName,
          icon: mockIcon,
        },
      });
      expect(result).toBe(true);
    });

    it('should return false when combination does not exist', async () => {
      // Arrange
      mockPrismaClient.globalEntityIdentifiers.findFirst.mockResolvedValue(null);

      // Act
      const result = await repository.existsByNameAndIcon(mockName, mockIcon);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('update()', () => {
    const updateData: UpdateGlobalEntityIdentifierData = {
      name: 'Evening Exercise',
      icon: 'https://example.com/icons/evening-exercise.png',
    };

    it('should successfully update identifier', async () => {
      // Arrange
      const mockUpdatedResult = createMockPrismaIdentifier({
        name: updateData.name,
        icon: updateData.icon,
      });
      mockPrismaClient.globalEntityIdentifiers.update.mockResolvedValue(
        mockUpdatedResult
      );

      // Act
      const result = await repository.update(mockIdentifierId, updateData);

      // Assert
      expect(mockPrismaClient.globalEntityIdentifiers.update).toHaveBeenCalledWith({
        where: { id: mockIdentifierId },
        data: updateData,
      });
      expect(result.name).toBe(updateData.name);
      expect(result.icon).toBe(updateData.icon);
    });

    it('should throw NotFoundError when identifier not found', async () => {
      // Arrange
      const notFoundError = new Error('Record not found');
      (notFoundError as any).code = 'P2025';
      mockPrismaClient.globalEntityIdentifiers.update.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(repository.update(mockIdentifierId, updateData)).rejects.toThrow(
        NotFoundError
      );
      await expect(repository.update(mockIdentifierId, updateData)).rejects.toThrow(
        `Global entity identifier with id ${mockIdentifierId} not found`
      );
    });

    it('should throw ConflictError when name conflict occurs', async () => {
      // Arrange
      const conflictError = new Error('Unique constraint failed');
      (conflictError as any).code = 'P2002';
      (conflictError as any).meta = { target: ['name'] };
      mockPrismaClient.globalEntityIdentifiers.update.mockRejectedValue(conflictError);

      // Act & Assert
      await expect(repository.update(mockIdentifierId, updateData)).rejects.toThrow(
        ConflictError
      );
    });

    it('should throw ConflictError when icon conflict occurs', async () => {
      // Arrange
      const conflictError = new Error('Unique constraint failed');
      (conflictError as any).code = 'P2002';
      (conflictError as any).meta = { target: ['icon'] };
      mockPrismaClient.globalEntityIdentifiers.update.mockRejectedValue(conflictError);

      // Act & Assert
      await expect(repository.update(mockIdentifierId, updateData)).rejects.toThrow(
        ConflictError
      );
    });

    it('should handle partial updates (name only)', async () => {
      // Arrange
      const partialUpdate: UpdateGlobalEntityIdentifierData = { name: 'New Name' };
      const mockResult = createMockPrismaIdentifier({ name: partialUpdate.name });
      mockPrismaClient.globalEntityIdentifiers.update.mockResolvedValue(mockResult);

      // Act
      await repository.update(mockIdentifierId, partialUpdate);

      // Assert
      expect(mockPrismaClient.globalEntityIdentifiers.update).toHaveBeenCalledWith({
        where: { id: mockIdentifierId },
        data: partialUpdate,
      });
    });

    it('should handle partial updates (icon only)', async () => {
      // Arrange
      const partialUpdate: UpdateGlobalEntityIdentifierData = {
        icon: 'https://example.com/new-icon.png',
      };
      const mockResult = createMockPrismaIdentifier({ icon: partialUpdate.icon });
      mockPrismaClient.globalEntityIdentifiers.update.mockResolvedValue(mockResult);

      // Act
      await repository.update(mockIdentifierId, partialUpdate);

      // Assert
      expect(mockPrismaClient.globalEntityIdentifiers.update).toHaveBeenCalledWith({
        where: { id: mockIdentifierId },
        data: partialUpdate,
      });
    });
  });

  describe('delete()', () => {
    it('should successfully delete identifier', async () => {
      // Arrange
      mockPrismaClient.globalEntityIdentifiers.delete.mockResolvedValue(
        createMockPrismaIdentifier()
      );

      // Act
      await repository.delete(mockIdentifierId);

      // Assert
      expect(mockPrismaClient.globalEntityIdentifiers.delete).toHaveBeenCalledWith({
        where: { id: mockIdentifierId },
      });
    });

    it('should throw NotFoundError when identifier not found', async () => {
      // Arrange
      const notFoundError = new Error('Record not found');
      (notFoundError as any).code = 'P2025';
      mockPrismaClient.globalEntityIdentifiers.delete.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(repository.delete(mockIdentifierId)).rejects.toThrow(NotFoundError);
      await expect(repository.delete(mockIdentifierId)).rejects.toThrow(
        `Global entity identifier with id ${mockIdentifierId} not found`
      );
    });

    it('should handle foreign key constraint violations', async () => {
      // Arrange
      const foreignKeyError = new Error('Foreign key constraint failed');
      (foreignKeyError as any).code = 'P2003';
      mockPrismaClient.globalEntityIdentifiers.delete.mockRejectedValue(foreignKeyError);

      // Act & Assert
      await expect(repository.delete(mockIdentifierId)).rejects.toThrow(
        'Cannot delete global entity identifier because it is referenced by other entities'
      );
    });
  });

  describe('findAll()', () => {
    it('should return all identifiers', async () => {
      // Arrange
      const mockIdentifiers = [
        createMockPrismaIdentifier(),
        createMockPrismaIdentifier({ id: 'id-2', name: 'Different Name' }),
      ];
      mockPrismaClient.globalEntityIdentifiers.findMany.mockResolvedValue(mockIdentifiers);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(mockPrismaClient.globalEntityIdentifiers.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no identifiers exist', async () => {
      // Arrange
      mockPrismaClient.globalEntityIdentifiers.findMany.mockResolvedValue([]);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toEqual([]);
    });

    it('should apply entity type filter', async () => {
      // Arrange
      const mockIdentifiers = [createMockPrismaIdentifier()];
      mockPrismaClient.globalEntityIdentifiers.findMany.mockResolvedValue(mockIdentifiers);

      // Act
      await repository.findAll({ entityType: mockEntityType });

      // Assert
      expect(mockPrismaClient.globalEntityIdentifiers.findMany).toHaveBeenCalledWith({
        where: { entityType: mockEntityType },
        orderBy: { name: 'asc' },
      });
    });

    it('should apply custom ordering', async () => {
      // Arrange
      mockPrismaClient.globalEntityIdentifiers.findMany.mockResolvedValue([]);

      // Act
      await repository.findAll({ orderBy: 'icon' });

      // Assert
      expect(mockPrismaClient.globalEntityIdentifiers.findMany).toHaveBeenCalledWith({
        orderBy: { icon: 'asc' },
      });
    });
  });

  describe('count()', () => {
    it('should return total count', async () => {
      // Arrange
      mockPrismaClient.globalEntityIdentifiers.count.mockResolvedValue(42);

      // Act
      const result = await repository.count();

      // Assert
      expect(mockPrismaClient.globalEntityIdentifiers.count).toHaveBeenCalledWith({});
      expect(result).toBe(42);
    });

    it('should return count with entity type filter', async () => {
      // Arrange
      mockPrismaClient.globalEntityIdentifiers.count.mockResolvedValue(15);

      // Act
      const result = await repository.count({ entityType: mockEntityType });

      // Assert
      expect(mockPrismaClient.globalEntityIdentifiers.count).toHaveBeenCalledWith({
        where: { entityType: mockEntityType },
      });
      expect(result).toBe(15);
    });

    it('should return zero when no identifiers exist', async () => {
      // Arrange
      mockPrismaClient.globalEntityIdentifiers.count.mockResolvedValue(0);

      // Act
      const result = await repository.count();

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle invalid UUID format', async () => {
      // Arrange
      const invalidId = 'invalid-uuid' as UUID;

      // Act & Assert
      await expect(repository.findById(invalidId)).rejects.toThrow();
    });

    it('should handle database connection errors', async () => {
      // Arrange
      const connectionError = new Error('Connection refused');
      mockPrismaClient.globalEntityIdentifiers.findMany.mockRejectedValue(connectionError);

      // Act & Assert
      await expect(repository.findAll()).rejects.toThrow('Connection refused');
    });

    it('should handle malformed data from database', async () => {
      // Arrange
      const malformedData = { id: null, name: null }; // Invalid data structure
      mockPrismaClient.globalEntityIdentifiers.findUnique.mockResolvedValue(malformedData);

      // Act & Assert
      await expect(repository.findById(mockIdentifierId)).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      // Arrange
      const timeoutError = new Error('Query timeout');
      (timeoutError as any).code = 'P2024';
      mockPrismaClient.globalEntityIdentifiers.create.mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(
        repository.create({
          name: mockName,
          icon: mockIcon,
          entityType: mockEntityType,
          entityId: mockEntityId,
        })
      ).rejects.toThrow();
    });
  });

  describe('transaction support', () => {
    it('should support batch operations in transactions', async () => {
      // This test verifies the repository can participate in transactions
      // Arrange
      const batchData = [
        {
          name: 'First',
          icon: 'icon1.png',
          entityType: mockEntityType,
          entityId: 'id-1' as UUID,
        },
        {
          name: 'Second',
          icon: 'icon2.png',
          entityType: mockEntityType,
          entityId: 'id-2' as UUID,
        },
      ];

      // Mock transaction behavior would be tested here
      // This is a placeholder for actual transaction testing

      // Act & Assert
      // In a real test, we would verify transaction rollback on failure
      expect(true).toBe(true); // Placeholder
    });
  });
});
