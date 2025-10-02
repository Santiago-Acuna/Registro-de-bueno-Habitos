import { GlobalEntityIdentifier } from '../global-entity-identifier.entity';
import { IdentifierName } from '../../value-objects/identifier-name';
import { IdentifierIcon } from '../../value-objects/identifier-icon';
import { UUID } from '../../shared/types/common';

describe('GlobalEntityIdentifier Entity (RED PHASE) - Updated create() signature', () => {
  // Test data fixtures
  const mockName = 'Morning Exercise';
  const mockIcon = 'https://example.com/icons/exercise.png';
  const mockEntityType = 'habit';
  const mockEntityId: UUID = '987fcdeb-51a2-43d1-9876-543210987654';
  const mockDatabaseGeneratedId: UUID = '123e4567-e89b-12d3-a456-426614174000';

  describe('create() static factory method - without id parameter', () => {
    it('should create a GlobalEntityIdentifier without requiring an id parameter', () => {
      // Act - create() should NOT require id as first parameter
      const identifier = GlobalEntityIdentifier.create(
        mockName,
        mockIcon,
        mockEntityType,
        mockEntityId
      );

      // Assert
      expect(identifier).toBeInstanceOf(GlobalEntityIdentifier);
      expect(identifier.name).toBeInstanceOf(IdentifierName);
      expect(identifier.name.getValue()).toBe(mockName);
      expect(identifier.icon).toBeInstanceOf(IdentifierIcon);
      expect(identifier.icon.getValue()).toBe(mockIcon);
      expect(identifier.entityType).toBe(mockEntityType);
      expect(identifier.entityId).toBe(mockEntityId);
    });

    it('should generate a temporary/placeholder id when created without explicit id', () => {
      // Act
      const identifier = GlobalEntityIdentifier.create(
        mockName,
        mockIcon,
        mockEntityType,
        mockEntityId
      );

      // Assert - the id should exist (even if temporary/placeholder)
      expect(identifier.id).toBeDefined();
      expect(typeof identifier.id).toBe('string');
      expect(identifier.id.length).toBeGreaterThan(0);
    });

    it('should create identifier with valid name value object', () => {
      // Act
      const identifier = GlobalEntityIdentifier.create(
        mockName,
        mockIcon,
        mockEntityType,
        mockEntityId
      );

      // Assert
      expect(identifier.name.getValue()).toBe(mockName);
    });

    it('should create identifier with valid icon value object', () => {
      // Act
      const identifier = GlobalEntityIdentifier.create(
        mockName,
        mockIcon,
        mockEntityType,
        mockEntityId
      );

      // Assert
      expect(identifier.icon.getValue()).toBe(mockIcon);
    });

    it('should throw error for invalid empty name', () => {
      // Act & Assert
      expect(() =>
        GlobalEntityIdentifier.create(
          '', // Invalid: empty name
          mockIcon,
          mockEntityType,
          mockEntityId
        )
      ).toThrow('Identifier name cannot be empty');
    });

    it('should throw error for invalid empty icon', () => {
      // Act & Assert
      expect(() =>
        GlobalEntityIdentifier.create(
          mockName,
          '', // Invalid: empty icon
          mockEntityType,
          mockEntityId
        )
      ).toThrow('Identifier icon cannot be empty');
    });

    it('should throw error for invalid entity type', () => {
      // Act & Assert
      expect(() =>
        GlobalEntityIdentifier.create(
          mockName,
          mockIcon,
          'invalid-type', // Invalid entity type
          mockEntityId
        )
      ).toThrow('Invalid entity type: invalid-type');
    });

    it('should accept "habit" as valid entity type', () => {
      // Act
      const identifier = GlobalEntityIdentifier.create(
        mockName,
        mockIcon,
        'habit',
        mockEntityId
      );

      // Assert
      expect(identifier.entityType).toBe('habit');
    });

    it('should accept "action_type" as valid entity type', () => {
      // Act
      const identifier = GlobalEntityIdentifier.create(
        mockName,
        mockIcon,
        'action_type',
        mockEntityId
      );

      // Assert
      expect(identifier.entityType).toBe('action_type');
    });

    it('should be case-insensitive for entity type validation', () => {
      // Act
      const identifier1 = GlobalEntityIdentifier.create(
        mockName,
        mockIcon,
        'HABIT',
        mockEntityId
      );

      const identifier2 = GlobalEntityIdentifier.create(
        'Different Name',
        'different-icon.png',
        'ACTION_TYPE',
        '111e1111-e11e-11e1-a111-111111111111' as UUID
      );

      // Assert
      expect(identifier1.entityType).toBe('HABIT');
      expect(identifier2.entityType).toBe('ACTION_TYPE');
    });
  });

  describe('constructor - should still accept id for database reconstruction', () => {
    it('should create identifier with explicit id when reconstructing from database', () => {
      // Arrange
      const identifierName = IdentifierName.create(mockName);
      const identifierIcon = IdentifierIcon.create(mockIcon);

      // Act - constructor should still accept id for when we reconstruct from DB
      const identifier = new GlobalEntityIdentifier(
        mockDatabaseGeneratedId,
        identifierName,
        identifierIcon,
        mockEntityType,
        mockEntityId
      );

      // Assert
      expect(identifier.id).toBe(mockDatabaseGeneratedId);
      expect(identifier.name).toBe(identifierName);
      expect(identifier.icon).toBe(identifierIcon);
      expect(identifier.entityType).toBe(mockEntityType);
      expect(identifier.entityId).toBe(mockEntityId);
    });

    it('should validate entity type in constructor', () => {
      // Arrange
      const identifierName = IdentifierName.create(mockName);
      const identifierIcon = IdentifierIcon.create(mockIcon);

      // Act & Assert
      expect(
        () =>
          new GlobalEntityIdentifier(
            mockDatabaseGeneratedId,
            identifierName,
            identifierIcon,
            'invalid-type',
            mockEntityId
          )
      ).toThrow('Invalid entity type: invalid-type');
    });
  });

  describe('equals() method', () => {
    it('should compare identifiers by id', () => {
      // Arrange
      const id1: UUID = '111e1111-e11e-11e1-a111-111111111111';
      const id2: UUID = '222e2222-e22e-22e2-a222-222222222222';

      const identifier1 = GlobalEntityIdentifier.create(
        mockName,
        mockIcon,
        mockEntityType,
        mockEntityId
      );

      // Manually set id for testing purposes (in real scenario, DB would set it)
      (identifier1 as any).id = id1;

      const identifier2 = GlobalEntityIdentifier.create(
        'Different Name',
        'different-icon.png',
        'action_type',
        '333e3333-e33e-33e3-a333-333333333333' as UUID
      );
      (identifier2 as any).id = id2;

      const identifier3 = GlobalEntityIdentifier.create(
        'Another Name',
        'another-icon.png',
        mockEntityType,
        '444e4444-e44e-44e4-a444-444444444444' as UUID
      );
      (identifier3 as any).id = id1; // Same id as identifier1

      // Act & Assert
      expect(identifier1.equals(identifier2)).toBe(false);
      expect(identifier1.equals(identifier3)).toBe(true); // Same id
    });
  });

  describe('value object creation within create()', () => {
    it('should create IdentifierName value object from string', () => {
      // Act
      const identifier = GlobalEntityIdentifier.create(
        mockName,
        mockIcon,
        mockEntityType,
        mockEntityId
      );

      // Assert
      expect(identifier.name).toBeInstanceOf(IdentifierName);
      expect(identifier.name.getValue()).toBe(mockName);
    });

    it('should create IdentifierIcon value object from string', () => {
      // Act
      const identifier = GlobalEntityIdentifier.create(
        mockName,
        mockIcon,
        mockEntityType,
        mockEntityId
      );

      // Assert
      expect(identifier.icon).toBeInstanceOf(IdentifierIcon);
      expect(identifier.icon.getValue()).toBe(mockIcon);
    });

    it('should propagate IdentifierName validation errors', () => {
      // Act & Assert - IdentifierName validates max length (50 characters)
      const tooLongName = 'A'.repeat(51);
      expect(() =>
        GlobalEntityIdentifier.create(
          tooLongName,
          mockIcon,
          mockEntityType,
          mockEntityId
        )
      ).toThrow('Identifier name cannot exceed 50 characters');
    });

    it('should handle whitespace in names through IdentifierName', () => {
      // Arrange
      const nameWithWhitespace = '  Morning Exercise  ';
      const expectedTrimmed = 'Morning Exercise';

      // Act
      const identifier = GlobalEntityIdentifier.create(
        nameWithWhitespace,
        mockIcon,
        mockEntityType,
        mockEntityId
      );

      // Assert - IdentifierName should trim whitespace
      expect(identifier.name.getValue()).toBe(expectedTrimmed);
    });
  });

  describe('immutability', () => {
    it('should have readonly id property', () => {
      // Arrange
      const identifier = GlobalEntityIdentifier.create(
        mockName,
        mockIcon,
        mockEntityType,
        mockEntityId
      );

      // Act & Assert - TypeScript should prevent this, but verify at runtime
      expect(() => {
        (identifier as any).id = 'new-id';
      }).toThrow();
    });

    it('should have readonly name property', () => {
      // Arrange
      const identifier = GlobalEntityIdentifier.create(
        mockName,
        mockIcon,
        mockEntityType,
        mockEntityId
      );

      // Act & Assert
      expect(() => {
        (identifier as any).name = IdentifierName.create('New Name');
      }).toThrow();
    });

    it('should have readonly icon property', () => {
      // Arrange
      const identifier = GlobalEntityIdentifier.create(
        mockName,
        mockIcon,
        mockEntityType,
        mockEntityId
      );

      // Act & Assert
      expect(() => {
        (identifier as any).icon = IdentifierIcon.create('new-icon.png');
      }).toThrow();
    });

    it('should have readonly entityType property', () => {
      // Arrange
      const identifier = GlobalEntityIdentifier.create(
        mockName,
        mockIcon,
        mockEntityType,
        mockEntityId
      );

      // Act & Assert
      expect(() => {
        (identifier as any).entityType = 'action_type';
      }).toThrow();
    });

    it('should have readonly entityId property', () => {
      // Arrange
      const identifier = GlobalEntityIdentifier.create(
        mockName,
        mockIcon,
        mockEntityType,
        mockEntityId
      );

      // Act & Assert
      expect(() => {
        (identifier as any).entityId = '999e9999-e99e-99e9-a999-999999999999';
      }).toThrow();
    });
  });

  describe('entity type validation edge cases', () => {
    it('should reject null entity type', () => {
      // Act & Assert
      expect(() =>
        GlobalEntityIdentifier.create(
          mockName,
          mockIcon,
          null as any,
          mockEntityId
        )
      ).toThrow();
    });

    it('should reject undefined entity type', () => {
      // Act & Assert
      expect(() =>
        GlobalEntityIdentifier.create(
          mockName,
          mockIcon,
          undefined as any,
          mockEntityId
        )
      ).toThrow();
    });

    it('should reject empty string entity type', () => {
      // Act & Assert
      expect(() =>
        GlobalEntityIdentifier.create(
          mockName,
          mockIcon,
          '',
          mockEntityId
        )
      ).toThrow();
    });
  });

  describe('multiple instances creation', () => {
    it('should create multiple independent instances without id collisions', () => {
      // Act - create multiple instances
      const identifier1 = GlobalEntityIdentifier.create(
        'Name 1',
        'icon1.png',
        'habit',
        '111e1111-e11e-11e1-a111-111111111111' as UUID
      );

      const identifier2 = GlobalEntityIdentifier.create(
        'Name 2',
        'icon2.png',
        'habit',
        '222e2222-e22e-22e2-a222-222222222222' as UUID
      );

      const identifier3 = GlobalEntityIdentifier.create(
        'Name 3',
        'icon3.png',
        'action_type',
        '333e3333-e33e-33e3-a333-333333333333' as UUID
      );

      // Assert - all should have unique ids (even if temporary)
      expect(identifier1.id).toBeDefined();
      expect(identifier2.id).toBeDefined();
      expect(identifier3.id).toBeDefined();

      // They should be different instances
      expect(identifier1).not.toBe(identifier2);
      expect(identifier2).not.toBe(identifier3);
      expect(identifier1).not.toBe(identifier3);
    });
  });

  describe('create() parameter order validation', () => {
    it('should have correct parameter order: name, icon, entityType, entityId', () => {
      // This test documents the expected parameter order
      // Act
      const identifier = GlobalEntityIdentifier.create(
        mockName,       // 1st: name
        mockIcon,       // 2nd: icon
        mockEntityType, // 3rd: entityType
        mockEntityId    // 4th: entityId
      );

      // Assert
      expect(identifier.name.getValue()).toBe(mockName);
      expect(identifier.icon.getValue()).toBe(mockIcon);
      expect(identifier.entityType).toBe(mockEntityType);
      expect(identifier.entityId).toBe(mockEntityId);
    });
  });
});
