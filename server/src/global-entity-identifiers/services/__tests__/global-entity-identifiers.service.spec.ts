import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UUID } from '../../../domain/shared/types/common';
import {
  NotFoundError,
  ConflictError,
  ValidationException,
} from '../../../infrastructure/exceptions/app.exceptions';
import {
  CreateGlobalEntityIdentifierData,
  UpdateGlobalEntityIdentifierData,
  IGlobalEntityIdentifiersRepository,
} from '../../interfaces/global-entity-identifiers-repository.interface';
import { GlobalEntityIdentifiersService } from '../global-entity-identifiers.service';

// Value objects only pattern - no entities
// Service layer uses value objects (IdentifierName, IdentifierIcon) for validation
// Repository operations work with plain data structures

// Mock implementations
const mockGlobalEntityIdentifiersRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  findByIcon: jest.fn(),
  findByEntityTypeAndId: jest.fn(),
  existsByName: jest.fn(),
  existsByIcon: jest.fn(),
  existsByNameAndIcon: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn(),
};

describe('GlobalEntityIdentifiersService (RED PHASE) - Value Objects Pattern', () => {
  let service: GlobalEntityIdentifiersService;
  let repository: jest.Mocked<IGlobalEntityIdentifiersRepository>;

  // Test data fixtures
  // Plain data structures - validation will be done via IdentifierName, IdentifierIcon value objects
  const mockIdentifierId: UUID = '123e4567-e89b-12d3-a456-426614174000';
  const mockEntityId: UUID = '987fcdeb-51a2-43d1-9876-543210987654';
  const mockName = 'Morning Exercise';
  const mockIcon = 'https://example.com/icons/exercise.png';
  const mockEntityType = 'habit';

  // Service returns plain objects (not domain entities)
  const createMockGlobalEntityIdentifier = (overrides: Partial<any> = {}) => ({
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
        GlobalEntityIdentifiersService,
        {
          provide: 'IGlobalEntityIdentifiersRepository',
          useValue: mockGlobalEntityIdentifiersRepository,
        },
      ],
    }).compile();

    service = module.get<GlobalEntityIdentifiersService>(GlobalEntityIdentifiersService);
    repository = module.get('IGlobalEntityIdentifiersRepository');

    // Mock Logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
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
      const expectedIdentifier = createMockGlobalEntityIdentifier();
      repository.existsByName.mockResolvedValue(false);
      repository.existsByIcon.mockResolvedValue(false);
      repository.create.mockResolvedValue(expectedIdentifier);

      // Act
      const result = await service.create(createData);

      // Assert
      expect(repository.existsByName).toHaveBeenCalledWith(createData.name);
      expect(repository.existsByIcon).toHaveBeenCalledWith(createData.icon);
      expect(repository.create).toHaveBeenCalledWith(createData);
      expect(result).toEqual(expectedIdentifier);
    });

    it('should throw ConflictError when name already exists globally', async () => {
      // Arrange
      repository.existsByName.mockResolvedValue(true);

      // Act & Assert
      await expect(service.create(createData)).rejects.toThrow(ConflictError);
      await expect(service.create(createData)).rejects.toThrow(
        `Global entity identifier with name '${createData.name}' already exists`
      );

      expect(repository.existsByIcon).not.toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when icon already exists globally', async () => {
      // Arrange
      repository.existsByName.mockResolvedValue(false);
      repository.existsByIcon.mockResolvedValue(true);

      // Act & Assert
      await expect(service.create(createData)).rejects.toThrow(ConflictError);
      await expect(service.create(createData)).rejects.toThrow(
        `Global entity identifier with icon '${createData.icon}' already exists`
      );

      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationException when name is empty (validated by IdentifierName value object)', async () => {
      // Arrange
      const invalidData = { ...createData, name: '' };

      // Act & Assert
      // Value object pattern: Service validates using IdentifierName.create() before repository call
      await expect(service.create(invalidData)).rejects.toThrow(ValidationException);
      await expect(service.create(invalidData)).rejects.toThrow('Name cannot be empty');

      expect(repository.existsByName).not.toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationException when icon is empty (validated by IdentifierIcon value object)', async () => {
      // Arrange
      const invalidData = { ...createData, icon: '' };

      // Act & Assert
      // Value object pattern: Service validates using IdentifierIcon.create() before repository call
      await expect(service.create(invalidData)).rejects.toThrow(ValidationException);
      await expect(service.create(invalidData)).rejects.toThrow('Icon cannot be empty');

      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationException when entityType is invalid', async () => {
      // Arrange
      const invalidData = { ...createData, entityType: 'invalid-type' };

      // Act & Assert
      await expect(service.create(invalidData)).rejects.toThrow(ValidationException);
      await expect(service.create(invalidData)).rejects.toThrow(
        'Entity type must be one of: habit, action-type'
      );

      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should rethrow unexpected errors', async () => {
      // Arrange
      const unexpectedError = new Error('Database connection failed');
      repository.existsByName.mockRejectedValue(unexpectedError);

      // Act & Assert
      await expect(service.create(createData)).rejects.toThrow('Database connection failed');
    });
  });

  describe('findById()', () => {
    it('should return global entity identifier when found', async () => {
      // Arrange
      const mockIdentifier = createMockGlobalEntityIdentifier();
      repository.findById.mockResolvedValue(mockIdentifier);

      // Act
      const result = await service.findById(mockIdentifierId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(mockIdentifierId);
      expect(result).toEqual(mockIdentifier);
    });

    it('should throw NotFoundError when identifier not found', async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(mockIdentifierId)).rejects.toThrow(NotFoundError);
      await expect(service.findById(mockIdentifierId)).rejects.toThrow(
        'Global entity identifier not found'
      );
    });

    it('should handle database errors', async () => {
      // Arrange
      const databaseError = new Error('Connection timeout');
      repository.findById.mockRejectedValue(databaseError);

      // Act & Assert
      await expect(service.findById(mockIdentifierId)).rejects.toThrow('Connection timeout');
    });
  });

  describe('findByName()', () => {
    it('should return global entity identifier when found by name', async () => {
      // Arrange
      const mockIdentifier = createMockGlobalEntityIdentifier();
      repository.findByName.mockResolvedValue(mockIdentifier);

      // Act
      const result = await service.findByName(mockName);

      // Assert
      expect(repository.findByName).toHaveBeenCalledWith(mockName);
      expect(result).toEqual(mockIdentifier);
    });

    it('should return null when not found by name', async () => {
      // Arrange
      repository.findByName.mockResolvedValue(null);

      // Act
      const result = await service.findByName(mockName);

      // Assert
      expect(result).toBeNull();
    });

    it('should throw ValidationException for empty name', async () => {
      // Act & Assert
      await expect(service.findByName('')).rejects.toThrow(ValidationException);
      await expect(service.findByName('')).rejects.toThrow('Name cannot be empty');

      expect(repository.findByName).not.toHaveBeenCalled();
    });
  });

  describe('findByIcon()', () => {
    it('should return global entity identifier when found by icon', async () => {
      // Arrange
      const mockIdentifier = createMockGlobalEntityIdentifier();
      repository.findByIcon.mockResolvedValue(mockIdentifier);

      // Act
      const result = await service.findByIcon(mockIcon);

      // Assert
      expect(repository.findByIcon).toHaveBeenCalledWith(mockIcon);
      expect(result).toEqual(mockIdentifier);
    });

    it('should return null when not found by icon', async () => {
      // Arrange
      repository.findByIcon.mockResolvedValue(null);

      // Act
      const result = await service.findByIcon(mockIcon);

      // Assert
      expect(result).toBeNull();
    });

    it('should throw ValidationException for empty icon', async () => {
      // Act & Assert
      await expect(service.findByIcon('')).rejects.toThrow(ValidationException);
      await expect(service.findByIcon('')).rejects.toThrow('Icon cannot be empty');

      expect(repository.findByIcon).not.toHaveBeenCalled();
    });
  });

  describe('findByEntityTypeAndId()', () => {
    it('should return global entity identifier when found', async () => {
      // Arrange
      const mockIdentifier = createMockGlobalEntityIdentifier();
      repository.findByEntityTypeAndId.mockResolvedValue(mockIdentifier);

      // Act
      const result = await service.findByEntityTypeAndId(mockEntityType, mockEntityId);

      // Assert
      expect(repository.findByEntityTypeAndId).toHaveBeenCalledWith(mockEntityType, mockEntityId);
      expect(result).toEqual(mockIdentifier);
    });

    it('should return null when not found', async () => {
      // Arrange
      repository.findByEntityTypeAndId.mockResolvedValue(null);

      // Act
      const result = await service.findByEntityTypeAndId(mockEntityType, mockEntityId);

      // Assert
      expect(result).toBeNull();
    });

    it('should throw ValidationException for invalid entity type', async () => {
      // Act & Assert
      await expect(service.findByEntityTypeAndId('invalid', mockEntityId)).rejects.toThrow(
        ValidationException
      );

      expect(repository.findByEntityTypeAndId).not.toHaveBeenCalled();
    });
  });

  describe('update()', () => {
    const updateData: UpdateGlobalEntityIdentifierData = {
      name: 'Evening Exercise',
      icon: 'https://example.com/icons/evening-exercise.png',
    };

    it('should successfully update name only', async () => {
      // Arrange
      const existingIdentifier = createMockGlobalEntityIdentifier();
      const updateNameOnly = { name: 'Evening Exercise' };
      const updatedIdentifier = { ...existingIdentifier, ...updateNameOnly };

      repository.findById.mockResolvedValue(existingIdentifier);
      repository.existsByName.mockResolvedValue(false);
      repository.update.mockResolvedValue(updatedIdentifier);

      // Act
      const result = await service.update(mockIdentifierId, updateNameOnly);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(mockIdentifierId);
      expect(repository.existsByName).toHaveBeenCalledWith(updateNameOnly.name);
      expect(repository.update).toHaveBeenCalledWith(mockIdentifierId, updateNameOnly);
      expect(result.name).toBe(updateNameOnly.name);
    });

    it('should successfully update icon only', async () => {
      // Arrange
      const existingIdentifier = createMockGlobalEntityIdentifier();
      const updateIconOnly = { icon: 'https://example.com/icons/new-icon.png' };
      const updatedIdentifier = { ...existingIdentifier, ...updateIconOnly };

      repository.findById.mockResolvedValue(existingIdentifier);
      repository.existsByIcon.mockResolvedValue(false);
      repository.update.mockResolvedValue(updatedIdentifier);

      // Act
      const result = await service.update(mockIdentifierId, updateIconOnly);

      // Assert
      expect(repository.existsByIcon).toHaveBeenCalledWith(updateIconOnly.icon);
      expect(repository.update).toHaveBeenCalledWith(mockIdentifierId, updateIconOnly);
      expect(result.icon).toBe(updateIconOnly.icon);
    });

    it('should successfully update both name and icon', async () => {
      // Arrange
      const existingIdentifier = createMockGlobalEntityIdentifier();
      const updatedIdentifier = { ...existingIdentifier, ...updateData };

      repository.findById.mockResolvedValue(existingIdentifier);
      repository.existsByName.mockResolvedValue(false);
      repository.existsByIcon.mockResolvedValue(false);
      repository.update.mockResolvedValue(updatedIdentifier);

      // Act
      const result = await service.update(mockIdentifierId, updateData);

      // Assert
      expect(repository.existsByName).toHaveBeenCalledWith(updateData.name);
      expect(repository.existsByIcon).toHaveBeenCalledWith(updateData.icon);
      expect(repository.update).toHaveBeenCalledWith(mockIdentifierId, updateData);
      expect(result.name).toBe(updateData.name);
      expect(result.icon).toBe(updateData.icon);
    });

    it('should throw NotFoundError when identifier does not exist', async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(mockIdentifierId, updateData)).rejects.toThrow(NotFoundError);

      expect(repository.existsByName).not.toHaveBeenCalled();
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when new name already exists', async () => {
      // Arrange
      const existingIdentifier = createMockGlobalEntityIdentifier();
      repository.findById.mockResolvedValue(existingIdentifier);
      repository.existsByName.mockResolvedValue(true);

      // Act & Assert
      await expect(service.update(mockIdentifierId, updateData)).rejects.toThrow(ConflictError);
      await expect(service.update(mockIdentifierId, updateData)).rejects.toThrow(
        `Global entity identifier with name '${updateData.name}' already exists`
      );

      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when new icon already exists', async () => {
      // Arrange
      const existingIdentifier = createMockGlobalEntityIdentifier();
      repository.findById.mockResolvedValue(existingIdentifier);
      repository.existsByName.mockResolvedValue(false);
      repository.existsByIcon.mockResolvedValue(true);

      // Act & Assert
      await expect(service.update(mockIdentifierId, updateData)).rejects.toThrow(ConflictError);
      await expect(service.update(mockIdentifierId, updateData)).rejects.toThrow(
        `Global entity identifier with icon '${updateData.icon}' already exists`
      );

      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should not check for conflicts when name is unchanged', async () => {
      // Arrange
      const existingIdentifier = createMockGlobalEntityIdentifier();
      const sameNameUpdate = { name: mockName }; // Same as existing
      repository.findById.mockResolvedValue(existingIdentifier);
      repository.update.mockResolvedValue(existingIdentifier);

      // Act
      await service.update(mockIdentifierId, sameNameUpdate);

      // Assert
      expect(repository.existsByName).not.toHaveBeenCalled();
    });

    it('should not check for conflicts when icon is unchanged', async () => {
      // Arrange
      const existingIdentifier = createMockGlobalEntityIdentifier();
      const sameIconUpdate = { icon: mockIcon }; // Same as existing
      repository.findById.mockResolvedValue(existingIdentifier);
      repository.update.mockResolvedValue(existingIdentifier);

      // Act
      await service.update(mockIdentifierId, sameIconUpdate);

      // Assert
      expect(repository.existsByIcon).not.toHaveBeenCalled();
    });

    it('should throw ValidationException for empty name', async () => {
      // Arrange
      const existingIdentifier = createMockGlobalEntityIdentifier();
      const invalidUpdate = { name: '' };
      repository.findById.mockResolvedValue(existingIdentifier);

      // Act & Assert
      await expect(service.update(mockIdentifierId, invalidUpdate)).rejects.toThrow(
        ValidationException
      );

      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw ValidationException for empty icon', async () => {
      // Arrange
      const existingIdentifier = createMockGlobalEntityIdentifier();
      const invalidUpdate = { icon: '' };
      repository.findById.mockResolvedValue(existingIdentifier);

      // Act & Assert
      await expect(service.update(mockIdentifierId, invalidUpdate)).rejects.toThrow(
        ValidationException
      );

      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should handle empty update object', async () => {
      // Arrange
      const existingIdentifier = createMockGlobalEntityIdentifier();
      repository.findById.mockResolvedValue(existingIdentifier);
      repository.update.mockResolvedValue(existingIdentifier);

      // Act
      const result = await service.update(mockIdentifierId, {});

      // Assert
      expect(repository.update).toHaveBeenCalledWith(mockIdentifierId, {});
      expect(result).toEqual(existingIdentifier);
    });
  });

  describe('delete()', () => {
    it('should successfully delete existing global entity identifier', async () => {
      // Arrange
      const existingIdentifier = createMockGlobalEntityIdentifier();
      repository.findById.mockResolvedValue(existingIdentifier);
      repository.delete.mockResolvedValue(undefined);

      // Act
      await service.delete(mockIdentifierId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(mockIdentifierId);
      expect(repository.delete).toHaveBeenCalledWith(mockIdentifierId);
    });

    it('should throw NotFoundError when identifier does not exist', async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.delete(mockIdentifierId)).rejects.toThrow(NotFoundError);

      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should handle database errors during deletion', async () => {
      // Arrange
      const existingIdentifier = createMockGlobalEntityIdentifier();
      const deleteError = new Error('Foreign key constraint violation');
      repository.findById.mockResolvedValue(existingIdentifier);
      repository.delete.mockRejectedValue(deleteError);

      // Act & Assert
      await expect(service.delete(mockIdentifierId)).rejects.toThrow(
        'Foreign key constraint violation'
      );
    });
  });

  describe('existsByName()', () => {
    it('should return true when name exists', async () => {
      // Arrange
      repository.existsByName.mockResolvedValue(true);

      // Act
      const result = await service.existsByName(mockName);

      // Assert
      expect(repository.existsByName).toHaveBeenCalledWith(mockName);
      expect(result).toBe(true);
    });

    it('should return false when name does not exist', async () => {
      // Arrange
      repository.existsByName.mockResolvedValue(false);

      // Act
      const result = await service.existsByName(mockName);

      // Assert
      expect(result).toBe(false);
    });

    it('should throw ValidationException for empty name', async () => {
      // Act & Assert
      await expect(service.existsByName('')).rejects.toThrow(ValidationException);

      expect(repository.existsByName).not.toHaveBeenCalled();
    });
  });

  describe('existsByIcon()', () => {
    it('should return true when icon exists', async () => {
      // Arrange
      repository.existsByIcon.mockResolvedValue(true);

      // Act
      const result = await service.existsByIcon(mockIcon);

      // Assert
      expect(repository.existsByIcon).toHaveBeenCalledWith(mockIcon);
      expect(result).toBe(true);
    });

    it('should return false when icon does not exist', async () => {
      // Arrange
      repository.existsByIcon.mockResolvedValue(false);

      // Act
      const result = await service.existsByIcon(mockIcon);

      // Assert
      expect(result).toBe(false);
    });

    it('should throw ValidationException for empty icon', async () => {
      // Act & Assert
      await expect(service.existsByIcon('')).rejects.toThrow(ValidationException);

      expect(repository.existsByIcon).not.toHaveBeenCalled();
    });
  });

  describe('logging behavior', () => {
    it('should log identifier creation', async () => {
      // Arrange
      const createData: CreateGlobalEntityIdentifierData = {
        name: mockName,
        icon: mockIcon,
        entityType: mockEntityType,
        entityId: mockEntityId,
      };
      const mockIdentifier = createMockGlobalEntityIdentifier();

      repository.existsByName.mockResolvedValue(false);
      repository.existsByIcon.mockResolvedValue(false);
      repository.create.mockResolvedValue(mockIdentifier);

      const logSpy = jest.spyOn(Logger.prototype, 'log');

      // Act
      await service.create(createData);

      // Assert
      expect(logSpy).toHaveBeenCalledWith(
        `Creating global entity identifier: ${mockName} for ${mockEntityType}`
      );
      expect(logSpy).toHaveBeenCalledWith(
        `Successfully created global entity identifier with id: ${mockIdentifierId}`
      );
    });

    it('should log other service operations', async () => {
      // Arrange
      const mockIdentifier = createMockGlobalEntityIdentifier();
      repository.findById.mockResolvedValue(mockIdentifier);

      const logSpy = jest.spyOn(Logger.prototype, 'log');

      // Act
      await service.findById(mockIdentifierId);

      // Assert
      expect(logSpy).toHaveBeenCalledWith(
        `Fetching global entity identifier with id: ${mockIdentifierId}`
      );
    });
  });

  describe('error handling edge cases', () => {
    it('should handle repository failures gracefully', async () => {
      // Arrange
      const databaseError = new Error('Database connection failed');
      repository.findById.mockRejectedValue(databaseError);

      // Act & Assert
      await expect(service.findById(mockIdentifierId)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should validate UUID format', async () => {
      // Arrange
      const invalidUUID = 'invalid-uuid-format' as UUID;

      // Act & Assert
      await expect(service.findById(invalidUUID)).rejects.toThrow();
    });

    it('should handle null/undefined values appropriately', async () => {
      // Act & Assert
      await expect(service.findByName(null as any)).rejects.toThrow();
      await expect(service.findByIcon(undefined as any)).rejects.toThrow();
    });

    it('should handle special characters in name and icon', async () => {
      // Arrange
      const specialName = "O'Brien's Habit <script>alert('xss')</script>";
      const specialIcon = "https://example.com/icon?param=value&other='quoted'";

      repository.existsByName.mockResolvedValue(false);
      repository.existsByIcon.mockResolvedValue(false);
      repository.create.mockResolvedValue(
        createMockGlobalEntityIdentifier({ name: specialName, icon: specialIcon })
      );

      // Act
      const result = await service.create({
        name: specialName,
        icon: specialIcon,
        entityType: mockEntityType,
        entityId: mockEntityId,
      });

      // Assert
      expect(result.name).toBe(specialName);
      expect(result.icon).toBe(specialIcon);
    });
  });

  describe('boundary and edge cases', () => {
    it('should handle very long names (boundary test)', async () => {
      // Arrange
      const longName = 'A'.repeat(255); // Maximum length
      repository.existsByName.mockResolvedValue(false);
      repository.existsByIcon.mockResolvedValue(false);
      repository.create.mockResolvedValue(createMockGlobalEntityIdentifier({ name: longName }));

      // Act
      const result = await service.create({
        name: longName,
        icon: mockIcon,
        entityType: mockEntityType,
        entityId: mockEntityId,
      });

      // Assert
      expect(result.name).toBe(longName);
    });

    it('should reject names exceeding maximum length', async () => {
      // Arrange
      const tooLongName = 'A'.repeat(256); // Exceeds maximum

      // Act & Assert
      await expect(
        service.create({
          name: tooLongName,
          icon: mockIcon,
          entityType: mockEntityType,
          entityId: mockEntityId,
        })
      ).rejects.toThrow(ValidationException);
    });

    it('should handle whitespace-only names', async () => {
      // Act & Assert
      await expect(
        service.create({
          name: '   ',
          icon: mockIcon,
          entityType: mockEntityType,
          entityId: mockEntityId,
        })
      ).rejects.toThrow(ValidationException);
    });

    it('should trim whitespace from names', async () => {
      // Arrange
      const nameWithWhitespace = '  Morning Exercise  ';
      const trimmedName = 'Morning Exercise';

      repository.existsByName.mockResolvedValue(false);
      repository.existsByIcon.mockResolvedValue(false);
      repository.create.mockResolvedValue(createMockGlobalEntityIdentifier({ name: trimmedName }));

      // Act
      const result = await service.create({
        name: nameWithWhitespace,
        icon: mockIcon,
        entityType: mockEntityType,
        entityId: mockEntityId,
      });

      // Assert
      expect(repository.existsByName).toHaveBeenCalledWith(trimmedName);
      expect(result.name).toBe(trimmedName);
    });
  });
});
