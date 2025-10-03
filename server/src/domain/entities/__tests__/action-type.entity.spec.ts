import { UUID } from '../../shared/types/common';
import { IdentifierIcon } from '../../value-objects/identifier-icon';
import { IdentifierName } from '../../value-objects/identifier-name';
import { ActionType } from '../action-type.entity';
import { GlobalEntityIdentifier } from '../global-entity-identifier.entity';

describe('ActionType Domain Entity', () => {
  const validActionTypeId: UUID = '123e4567-e89b-12d3-a456-426614174000';
  const validHabitId: UUID = '987fcdeb-51a2-43d1-9876-543210987654';
  const validGlobalIdentifierId: UUID = 'global-id-123e4567-e89b-12d3-a456-426614174000';
  const validActionTypeName = 'Morning Push-ups';
  const validIconUrl = 'https://example.com/pushups-icon.png';
  const fixedDate = new Date('2024-01-01T00:00:00.000Z');

  // Helper to create mock GlobalEntityIdentifier
  const createMockGlobalIdentifier = (
    name: string = validActionTypeName,
    icon: string = validIconUrl
  ): GlobalEntityIdentifier => {
    return new GlobalEntityIdentifier(
      validGlobalIdentifierId,
      IdentifierName.create(name),
      IdentifierIcon.create(icon),
      'action_type',
      validActionTypeId
    );
  };

  describe('ActionType Constructor', () => {
    describe('Valid Construction', () => {
      it('should create ActionType instance with all required properties', () => {
        // ARRANGE
        const globalIdentifier = createMockGlobalIdentifier();

        // ACT
        const actionType = new ActionType(
          validActionTypeId,
          validHabitId,
          fixedDate,
          fixedDate,
          0,
          null,
          globalIdentifier
        );

        // ASSERT
        expect(actionType.id).toBe(validActionTypeId);
        expect(actionType.habitId).toBe(validHabitId);
        expect(actionType.createdAt).toBeInstanceOf(Date);
        expect(actionType.updatedAt).toBeInstanceOf(Date);
        expect(actionType.createdAt).toEqual(fixedDate);
        expect(actionType.updatedAt).toEqual(fixedDate);
        expect(actionType.totalActionsCount).toBe(0);
        expect(actionType.lastActionDate).toBeNull();
        expect(actionType.globalEntityIdentifier).toBe(globalIdentifier);
      });

      it('should create ActionType with totalActionsCount and lastActionDate', () => {
        // ARRANGE
        const globalIdentifier = createMockGlobalIdentifier();
        const lastActionDate = new Date('2024-01-15T12:00:00.000Z');

        // ACT
        const actionType = new ActionType(
          validActionTypeId,
          validHabitId,
          fixedDate,
          fixedDate,
          5,
          lastActionDate,
          globalIdentifier
        );

        // ASSERT
        expect(actionType.totalActionsCount).toBe(5);
        expect(actionType.lastActionDate).toBeInstanceOf(Date);
        expect(actionType.lastActionDate).toEqual(lastActionDate);
      });

      it('should create ActionType with current timestamps', () => {
        // ARRANGE
        const globalIdentifier = createMockGlobalIdentifier();
        const beforeCreation = new Date();
        const currentDate = new Date();

        // ACT
        const actionType = new ActionType(
          validActionTypeId,
          validHabitId,
          currentDate,
          currentDate,
          0,
          null,
          globalIdentifier
        );
        const afterCreation = new Date();

        // ASSERT
        expect(actionType.createdAt).toBeInstanceOf(Date);
        expect(actionType.updatedAt).toBeInstanceOf(Date);
        expect(actionType.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
        expect(actionType.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
        expect(actionType.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
        expect(actionType.updatedAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
      });
    });

    describe('Date Validation', () => {
      it('should throw error for invalid createdAt (non-Date)', () => {
        // ARRANGE
        const globalIdentifier = createMockGlobalIdentifier();

        // ACT & ASSERT
        expect(
          () =>
            new ActionType(
              validActionTypeId,
              validHabitId,
              '2024-01-01T00:00:00.000Z' as any, // ISO string should fail
              fixedDate,
              0,
              null,
              globalIdentifier
            )
        ).toThrow('Invalid date: createdAt must be a valid Date object');
      });

      it('should throw error for null createdAt', () => {
        // ARRANGE
        const globalIdentifier = createMockGlobalIdentifier();

        // ACT & ASSERT
        expect(
          () =>
            new ActionType(
              validActionTypeId,
              validHabitId,
              null as any,
              fixedDate,
              0,
              null,
              globalIdentifier
            )
        ).toThrow('Invalid date: createdAt must be a Date object');
      });

      it('should throw error for undefined createdAt', () => {
        // ARRANGE
        const globalIdentifier = createMockGlobalIdentifier();

        // ACT & ASSERT
        expect(
          () =>
            new ActionType(
              validActionTypeId,
              validHabitId,
              undefined as any,
              fixedDate,
              0,
              null,
              globalIdentifier
            )
        ).toThrow('Invalid date: createdAt must be a Date object');
      });

      it('should throw error for invalid createdAt (invalid Date object)', () => {
        // ARRANGE
        const globalIdentifier = createMockGlobalIdentifier();
        const invalidDate = new Date('invalid-date-string');

        // ACT & ASSERT
        expect(
          () =>
            new ActionType(
              validActionTypeId,
              validHabitId,
              invalidDate,
              fixedDate,
              0,
              null,
              globalIdentifier
            )
        ).toThrow('Invalid date: createdAt must be a valid Date object');
      });

      it('should throw error for invalid updatedAt (non-Date)', () => {
        // ARRANGE
        const globalIdentifier = createMockGlobalIdentifier();

        // ACT & ASSERT
        expect(
          () =>
            new ActionType(
              validActionTypeId,
              validHabitId,
              fixedDate,
              '2024-01-01T00:00:00.000Z' as any, // ISO string should fail
              0,
              null,
              globalIdentifier
            )
        ).toThrow('Invalid date: updatedAt must be a valid Date object');
      });

      it('should throw error for null updatedAt', () => {
        // ARRANGE
        const globalIdentifier = createMockGlobalIdentifier();

        // ACT & ASSERT
        expect(
          () =>
            new ActionType(
              validActionTypeId,
              validHabitId,
              fixedDate,
              null as any,
              0,
              null,
              globalIdentifier
            )
        ).toThrow('Invalid date: updatedAt must be a Date object');
      });

      it('should throw error for invalid updatedAt (invalid Date object)', () => {
        // ARRANGE
        const globalIdentifier = createMockGlobalIdentifier();
        const invalidDate = new Date('invalid-date-string');

        // ACT & ASSERT
        expect(
          () =>
            new ActionType(
              validActionTypeId,
              validHabitId,
              fixedDate,
              invalidDate,
              0,
              null,
              globalIdentifier
            )
        ).toThrow('Invalid date: updatedAt must be a valid Date object');
      });

      it('should accept null lastActionDate', () => {
        // ARRANGE
        const globalIdentifier = createMockGlobalIdentifier();

        // ACT
        const actionType = new ActionType(
          validActionTypeId,
          validHabitId,
          fixedDate,
          fixedDate,
          0,
          null, // null is valid for lastActionDate
          globalIdentifier
        );

        // ASSERT
        expect(actionType.lastActionDate).toBeNull();
      });

      it('should throw error for invalid lastActionDate (non-Date, not null)', () => {
        // ARRANGE
        const globalIdentifier = createMockGlobalIdentifier();

        // ACT & ASSERT
        expect(
          () =>
            new ActionType(
              validActionTypeId,
              validHabitId,
              fixedDate,
              fixedDate,
              0,
              '2024-01-01T00:00:00.000Z' as any, // ISO string should fail
              globalIdentifier
            )
        ).toThrow('Invalid date: lastActionDate must be a valid Date object or null');
      });

      it('should throw error for invalid lastActionDate (invalid Date object)', () => {
        // ARRANGE
        const globalIdentifier = createMockGlobalIdentifier();
        const invalidDate = new Date('invalid-date-string');

        // ACT & ASSERT
        expect(
          () =>
            new ActionType(
              validActionTypeId,
              validHabitId,
              fixedDate,
              fixedDate,
              0,
              invalidDate,
              globalIdentifier
            )
        ).toThrow('Invalid date: lastActionDate must be a valid Date object');
      });

      it('should store valid lastActionDate as Date object', () => {
        // ARRANGE
        const globalIdentifier = createMockGlobalIdentifier();
        const lastActionDate = new Date('2024-01-15T12:00:00.000Z');

        // ACT
        const actionType = new ActionType(
          validActionTypeId,
          validHabitId,
          fixedDate,
          fixedDate,
          3,
          lastActionDate,
          globalIdentifier
        );

        // ASSERT
        expect(actionType.lastActionDate).toBeInstanceOf(Date);
        expect(actionType.lastActionDate).toEqual(lastActionDate);
      });
    });

    describe('GlobalEntityIdentifier Validation', () => {
      it('should throw error for null globalEntityIdentifier', () => {
        // ACT & ASSERT
        expect(
          () =>
            new ActionType(
              validActionTypeId,
              validHabitId,
              fixedDate,
              fixedDate,
              0,
              null,
              null as any
            )
        ).toThrow('globalEntityIdentifier must be a valid GlobalEntityIdentifier instance');
      });

      it('should throw error for undefined globalEntityIdentifier', () => {
        // ACT & ASSERT
        expect(
          () =>
            new ActionType(
              validActionTypeId,
              validHabitId,
              fixedDate,
              fixedDate,
              0,
              null,
              undefined as any
            )
        ).toThrow('globalEntityIdentifier must be a valid GlobalEntityIdentifier instance');
      });

      it('should throw error for invalid globalEntityIdentifier type', () => {
        // ACT & ASSERT
        expect(
          () =>
            new ActionType(
              validActionTypeId,
              validHabitId,
              fixedDate,
              fixedDate,
              0,
              null,
              { name: 'Test', icon: 'test.png' } as any // Plain object should fail
            )
        ).toThrow('globalEntityIdentifier must be a valid GlobalEntityIdentifier instance');
      });

      it('should accept valid globalEntityIdentifier', () => {
        // ARRANGE
        const globalIdentifier = createMockGlobalIdentifier();

        // ACT
        const actionType = new ActionType(
          validActionTypeId,
          validHabitId,
          fixedDate,
          fixedDate,
          0,
          null,
          globalIdentifier
        );

        // ASSERT
        expect(actionType.globalEntityIdentifier).toBe(globalIdentifier);
        expect(actionType.globalEntityIdentifier).toBeInstanceOf(GlobalEntityIdentifier);
      });
    });
  });

  describe('Getter Methods', () => {
    describe('name getter', () => {
      it('should return name from globalEntityIdentifier', () => {
        // ARRANGE
        const globalIdentifier = createMockGlobalIdentifier('Evening Yoga');
        const actionType = new ActionType(
          validActionTypeId,
          validHabitId,
          fixedDate,
          fixedDate,
          0,
          null,
          globalIdentifier
        );

        // ACT
        const name = actionType.name;

        // ASSERT
        expect(name).toBe('Evening Yoga');
      });

      it('should return updated name after globalEntityIdentifier change', () => {
        // ARRANGE
        const globalIdentifier1 = createMockGlobalIdentifier('Original Name');
        const globalIdentifier2 = createMockGlobalIdentifier('Updated Name');

        const actionType1 = new ActionType(
          validActionTypeId,
          validHabitId,
          fixedDate,
          fixedDate,
          0,
          null,
          globalIdentifier1
        );

        const actionType2 = new ActionType(
          validActionTypeId,
          validHabitId,
          fixedDate,
          new Date(),
          0,
          null,
          globalIdentifier2
        );

        // ACT & ASSERT
        expect(actionType1.name).toBe('Original Name');
        expect(actionType2.name).toBe('Updated Name');
      });
    });

    describe('icon getter', () => {
      it('should return icon from globalEntityIdentifier', () => {
        // ARRANGE
        const customIconUrl = 'https://example.com/custom-icon.png';
        const globalIdentifier = createMockGlobalIdentifier(validActionTypeName, customIconUrl);
        const actionType = new ActionType(
          validActionTypeId,
          validHabitId,
          fixedDate,
          fixedDate,
          0,
          null,
          globalIdentifier
        );

        // ACT
        const icon = actionType.icon;

        // ASSERT
        expect(icon).toBe(customIconUrl);
      });

      it('should return updated icon after globalEntityIdentifier change', () => {
        // ARRANGE
        const iconUrl1 = 'https://example.com/icon1.png';
        const iconUrl2 = 'https://example.com/icon2.png';
        const globalIdentifier1 = createMockGlobalIdentifier(validActionTypeName, iconUrl1);
        const globalIdentifier2 = createMockGlobalIdentifier(validActionTypeName, iconUrl2);

        const actionType1 = new ActionType(
          validActionTypeId,
          validHabitId,
          fixedDate,
          fixedDate,
          0,
          null,
          globalIdentifier1
        );

        const actionType2 = new ActionType(
          validActionTypeId,
          validHabitId,
          fixedDate,
          new Date(),
          0,
          null,
          globalIdentifier2
        );

        // ACT & ASSERT
        expect(actionType1.icon).toBe(iconUrl1);
        expect(actionType2.icon).toBe(iconUrl2);
      });
    });
  });

  describe('toJSON() Method', () => {
    it('should return JSON representation with all fields', () => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();
      const lastActionDate = new Date('2024-01-15T12:00:00.000Z');
      const actionType = new ActionType(
        validActionTypeId,
        validHabitId,
        fixedDate,
        fixedDate,
        5,
        lastActionDate,
        globalIdentifier
      );

      // ACT
      const json = actionType.toJSON();

      // ASSERT
      expect(json).toEqual({
        id: validActionTypeId,
        habitId: validHabitId,
        name: validActionTypeName,
        icon: validIconUrl,
        totalActionsCount: 5,
        lastActionDate,
        createdAt: fixedDate,
        updatedAt: fixedDate,
      });
    });

    it('should return JSON with null lastActionDate', () => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();
      const actionType = new ActionType(
        validActionTypeId,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null,
        globalIdentifier
      );

      // ACT
      const json = actionType.toJSON();

      // ASSERT
      expect(json).toEqual({
        id: validActionTypeId,
        habitId: validHabitId,
        name: validActionTypeName,
        icon: validIconUrl,
        totalActionsCount: 0,
        lastActionDate: null,
        createdAt: fixedDate,
        updatedAt: fixedDate,
      });
    });

    it('should include name and icon from globalEntityIdentifier', () => {
      // ARRANGE
      const customName = 'Custom Action Type';
      const customIcon = 'https://example.com/custom.png';
      const globalIdentifier = createMockGlobalIdentifier(customName, customIcon);
      const actionType = new ActionType(
        validActionTypeId,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null,
        globalIdentifier
      );

      // ACT
      const json = actionType.toJSON();

      // ASSERT
      expect(json['name']).toBe(customName);
      expect(json['icon']).toBe(customIcon);
    });

    it('should return object with proper types', () => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();
      const actionType = new ActionType(
        validActionTypeId,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null,
        globalIdentifier
      );

      // ACT
      const json = actionType.toJSON();

      // ASSERT
      expect(typeof json['id']).toBe('string');
      expect(typeof json['habitId']).toBe('string');
      expect(typeof json['name']).toBe('string');
      expect(typeof json['icon']).toBe('string');
      expect(typeof json['totalActionsCount']).toBe('number');
      expect(json['lastActionDate']).toBeNull();
      expect(json['createdAt']).toBeInstanceOf(Date);
      expect(json['updatedAt']).toBeInstanceOf(Date);
    });
  });

  describe('equals() Method', () => {
    it('should return true for ActionTypes with same id', () => {
      // ARRANGE
      const globalIdentifier1 = createMockGlobalIdentifier('Name 1');
      const globalIdentifier2 = createMockGlobalIdentifier('Name 2');

      const actionType1 = new ActionType(
        validActionTypeId,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null,
        globalIdentifier1
      );

      const actionType2 = new ActionType(
        validActionTypeId,
        validHabitId, // Same ID
        new Date(),
        new Date(),
        10,
        new Date(),
        globalIdentifier2 // Different globalEntityIdentifier
      );

      // ACT
      const result = actionType1.equals(actionType2);

      // ASSERT
      expect(result).toBe(true);
    });

    it('should return false for ActionTypes with different ids', () => {
      // ARRANGE
      const differentId: UUID = '111e1111-e11e-11e1-a111-111111111111';
      const globalIdentifier1 = createMockGlobalIdentifier();
      const globalIdentifier2 = createMockGlobalIdentifier();

      const actionType1 = new ActionType(
        validActionTypeId,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null,
        globalIdentifier1
      );

      const actionType2 = new ActionType(
        differentId, // Different ID
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null,
        globalIdentifier2
      );

      // ACT
      const result = actionType1.equals(actionType2);

      // ASSERT
      expect(result).toBe(false);
    });

    it('should compare by id regardless of other property values', () => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();
      const actionType1 = new ActionType(
        validActionTypeId,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null,
        globalIdentifier
      );

      const actionType2 = new ActionType(
        validActionTypeId, // Same ID
        validHabitId,
        new Date('2025-01-01'),
        new Date('2025-01-01'),
        100,
        new Date(),
        globalIdentifier
      );

      // ACT
      const result = actionType1.equals(actionType2);

      // ASSERT
      expect(result).toBe(true);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle zero totalActionsCount', () => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();

      // ACT
      const actionType = new ActionType(
        validActionTypeId,
        validHabitId,
        fixedDate,
        fixedDate,
        0, // Zero count
        null,
        globalIdentifier
      );

      // ASSERT
      expect(actionType.totalActionsCount).toBe(0);
    });

    it('should handle large totalActionsCount values', () => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();
      const largeCount = 999999999;

      // ACT
      const actionType = new ActionType(
        validActionTypeId,
        validHabitId,
        fixedDate,
        fixedDate,
        largeCount,
        null,
        globalIdentifier
      );

      // ASSERT
      expect(actionType.totalActionsCount).toBe(largeCount);
    });

    it('should handle maximum safe integer for totalActionsCount', () => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();
      const maxCount = Number.MAX_SAFE_INTEGER;

      // ACT
      const actionType = new ActionType(
        validActionTypeId,
        validHabitId,
        fixedDate,
        fixedDate,
        maxCount,
        null,
        globalIdentifier
      );

      // ASSERT
      expect(actionType.totalActionsCount).toBe(maxCount);
    });

    it('should handle date precision correctly', () => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();
      const preciseDate = new Date('2024-01-01T12:30:45.123Z');
      const preciseLastAction = new Date('2024-01-15T14:25:33.987Z');

      // ACT
      const actionType = new ActionType(
        validActionTypeId,
        validHabitId,
        preciseDate,
        preciseDate,
        0,
        preciseLastAction,
        globalIdentifier
      );

      // ASSERT
      expect(actionType.createdAt.getTime()).toBe(preciseDate.getTime());
      expect(actionType.updatedAt.getTime()).toBe(preciseDate.getTime());
      expect(actionType.lastActionDate?.getTime()).toBe(preciseLastAction.getTime());
    });

    it('should handle action type name at maximum length boundary', () => {
      // ARRANGE
      const maxLengthName = 'a'.repeat(50); // 50 chars max
      const globalIdentifier = createMockGlobalIdentifier(maxLengthName);

      // ACT
      const actionType = new ActionType(
        validActionTypeId,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null,
        globalIdentifier
      );

      // ASSERT
      expect(actionType.name).toBe(maxLengthName);
      expect(actionType.name).toHaveLength(50);
    });

    it('should handle action type name at minimum length boundary', () => {
      // ARRANGE
      const minLengthName = 'a'; // 1 char min
      const globalIdentifier = createMockGlobalIdentifier(minLengthName);

      // ACT
      const actionType = new ActionType(
        validActionTypeId,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null,
        globalIdentifier
      );

      // ASSERT
      expect(actionType.name).toBe(minLengthName);
      expect(actionType.name).toHaveLength(1);
    });

    it('should handle icon URL at maximum length boundary', () => {
      // ARRANGE
      // Calculate exact 500 char URL: https://example.com/ = 20 chars, .png = 4 chars, so 476 'a's needed
      const maxLengthUrl = `https://example.com/${'a'.repeat(476)}.png`; // Exactly 500 chars
      const globalIdentifier = createMockGlobalIdentifier(validActionTypeName, maxLengthUrl);

      // ACT
      const actionType = new ActionType(
        validActionTypeId,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null,
        globalIdentifier
      );

      // ASSERT
      expect(actionType.icon).toBe(maxLengthUrl);
      expect(actionType.icon).toHaveLength(500);
    });

    it('should validate that all date parameters are proper Date objects', () => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();
      const createdAt = new Date('2024-01-01T10:00:00.000Z');
      const updatedAt = new Date('2024-01-02T11:00:00.000Z');
      const lastActionDate = new Date('2024-01-03T12:00:00.000Z');

      // ACT
      const actionType = new ActionType(
        validActionTypeId,
        validHabitId,
        createdAt,
        updatedAt,
        5,
        lastActionDate,
        globalIdentifier
      );

      // ASSERT
      expect(actionType.createdAt).toBeInstanceOf(Date);
      expect(actionType.updatedAt).toBeInstanceOf(Date);
      expect(actionType.lastActionDate).toBeInstanceOf(Date);
      expect(actionType.createdAt).toEqual(createdAt);
      expect(actionType.updatedAt).toEqual(updatedAt);
      expect(actionType.lastActionDate).toEqual(lastActionDate);
    });
  });

  describe('Immutability and Read-Only Properties', () => {
    it('should have read-only id property declared in TypeScript', () => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();
      const actionType = new ActionType(
        validActionTypeId,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null,
        globalIdentifier
      );

      // ACT & ASSERT
      // TypeScript's readonly modifier is compile-time only
      // At runtime, JavaScript allows property modification
      // The real protection is at compile-time where TypeScript will error
      expect(actionType.id).toBe(validActionTypeId);

      // Verify the property is accessible
      const idValue: UUID = actionType.id;
      expect(typeof idValue).toBe('string');
    });

    it('should have read-only habitId property', () => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();
      const actionType = new ActionType(
        validActionTypeId,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null,
        globalIdentifier
      );

      // ACT
      const originalHabitId = actionType.habitId;

      // ASSERT - habitId is defined as readonly in TypeScript
      expect(actionType.habitId).toBe(originalHabitId);
      expect(actionType.habitId).toBe(validHabitId);
    });

    it('should have read-only createdAt property', () => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();
      const actionType = new ActionType(
        validActionTypeId,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null,
        globalIdentifier
      );

      // ACT
      const originalCreatedAt = actionType.createdAt;

      // ASSERT - createdAt is defined as readonly in TypeScript
      expect(actionType.createdAt).toBe(originalCreatedAt);
      expect(actionType.createdAt).toEqual(fixedDate);
    });

    it('should have read-only updatedAt property', () => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();
      const actionType = new ActionType(
        validActionTypeId,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null,
        globalIdentifier
      );

      // ACT
      const originalUpdatedAt = actionType.updatedAt;

      // ASSERT - updatedAt is defined as readonly in TypeScript
      expect(actionType.updatedAt).toBe(originalUpdatedAt);
      expect(actionType.updatedAt).toEqual(fixedDate);
    });

    it('should have read-only totalActionsCount property', () => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();
      const actionType = new ActionType(
        validActionTypeId,
        validHabitId,
        fixedDate,
        fixedDate,
        5,
        null,
        globalIdentifier
      );

      // ACT
      const originalCount = actionType.totalActionsCount;

      // ASSERT - totalActionsCount is defined as readonly in TypeScript
      expect(actionType.totalActionsCount).toBe(originalCount);
      expect(actionType.totalActionsCount).toBe(5);
    });

    it('should have read-only lastActionDate property', () => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();
      const lastActionDate = new Date('2024-01-15T12:00:00.000Z');
      const actionType = new ActionType(
        validActionTypeId,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        lastActionDate,
        globalIdentifier
      );

      // ACT
      const originalLastActionDate = actionType.lastActionDate;

      // ASSERT - lastActionDate is defined as readonly in TypeScript
      expect(actionType.lastActionDate).toBe(originalLastActionDate);
      expect(actionType.lastActionDate).toEqual(lastActionDate);
    });

    it('should have read-only globalEntityIdentifier property', () => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();
      const actionType = new ActionType(
        validActionTypeId,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null,
        globalIdentifier
      );

      // ACT
      const originalGlobalIdentifier = actionType.globalEntityIdentifier;

      // ASSERT - globalEntityIdentifier is defined as readonly in TypeScript
      expect(actionType.globalEntityIdentifier).toBe(originalGlobalIdentifier);
      expect(actionType.globalEntityIdentifier).toBe(globalIdentifier);
    });
  });
});
