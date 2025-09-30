import { ActionType } from '../action-type.entity';
import { ActionTypeName } from '../../value-objects/action-type-name';
import { UUID } from '../../shared/types/common';

describe('ActionType Entity (RED PHASE)', () => {
  const validActionTypeId: UUID = '123e4567-e89b-12d3-a456-426614174000';
  const validHabitId: UUID = '987fcdeb-51a2-43d1-9876-543210987654';
  const validActionTypeName = 'Morning Push-ups';
  const validLogo = 'https://example.com/pushups-logo.png';
  const fixedDate = new Date('2024-01-01T00:00:00.000Z');
  const lastActionDate = new Date('2024-01-01T12:00:00.000Z');

  describe('ActionType Constructor', () => {
    it('should create ActionType instance with all required properties', () => {
      // ARRANGE
      const actionTypeName = ActionTypeName.create(validActionTypeName);

      // ACT
      const actionType = new ActionType(
        validActionTypeId,
        actionTypeName,
        validLogo,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null
      );

      // ASSERT
      expect(actionType.id).toBe(validActionTypeId);
      expect(actionType.name).toBe(actionTypeName);
      expect(actionType.logo).toBe(validLogo);
      expect(actionType.habitId).toBe(validHabitId);
      expect(actionType.createdAt).toBeInstanceOf(Date);
      expect(actionType.updatedAt).toBeInstanceOf(Date);
      expect(actionType.createdAt).toEqual(fixedDate);
      expect(actionType.updatedAt).toEqual(fixedDate);
      expect(actionType.totalActionsCount).toBe(0);
      expect(actionType.lastActionDate).toBeNull();
    });

    it('should create ActionType with totalActionsCount and lastActionDate', () => {
      // ARRANGE
      const actionTypeName = ActionTypeName.create(validActionTypeName);

      // ACT
      const actionType = new ActionType(
        validActionTypeId,
        actionTypeName,
        validLogo,
        validHabitId,
        fixedDate,
        fixedDate,
        5,
        lastActionDate
      );

      // ASSERT
      expect(actionType.totalActionsCount).toBe(5);
      expect(actionType.lastActionDate).toBeInstanceOf(Date);
      expect(actionType.lastActionDate).toEqual(lastActionDate);
    });

    it('should throw error for invalid createdAt (non-Date)', () => {
      const actionTypeName = ActionTypeName.create(validActionTypeName);

      expect(() => new ActionType(
        validActionTypeId,
        actionTypeName,
        validLogo,
        validHabitId,
        '2024-01-01T00:00:00.000Z' as any, // ISO string should fail
        fixedDate,
        0,
        null
      )).toThrow('Invalid date: createdAt must be a valid Date object');
    });

    it('should throw error for invalid updatedAt (non-Date)', () => {
      const actionTypeName = ActionTypeName.create(validActionTypeName);

      expect(() => new ActionType(
        validActionTypeId,
        actionTypeName,
        validLogo,
        validHabitId,
        fixedDate,
        '2024-01-01T00:00:00.000Z' as any, // ISO string should fail
        0,
        null
      )).toThrow('Invalid date: updatedAt must be a valid Date object');
    });

    it('should throw error for invalid lastActionDate (non-Date, not null)', () => {
      const actionTypeName = ActionTypeName.create(validActionTypeName);

      expect(() => new ActionType(
        validActionTypeId,
        actionTypeName,
        validLogo,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        '2024-01-01T00:00:00.000Z' as any // ISO string should fail
      )).toThrow('Invalid date: lastActionDate must be a valid Date object or null');
    });

    it('should throw error for empty logo', () => {
      const actionTypeName = ActionTypeName.create(validActionTypeName);

      expect(() => new ActionType(
        validActionTypeId,
        actionTypeName,
        '', // Empty logo should fail
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null
      )).toThrow('Logo must be a non-empty string');
    });

    it('should throw error for invalid logo type', () => {
      const actionTypeName = ActionTypeName.create(validActionTypeName);

      expect(() => new ActionType(
        validActionTypeId,
        actionTypeName,
        null as any, // null logo should fail
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null
      )).toThrow('Logo must be a non-empty string');
    });

    it('should throw error for negative totalActionsCount', () => {
      const actionTypeName = ActionTypeName.create(validActionTypeName);

      expect(() => new ActionType(
        validActionTypeId,
        actionTypeName,
        validLogo,
        validHabitId,
        fixedDate,
        fixedDate,
        -1, // Negative count should fail
        null
      )).toThrow('Total actions count must be a non-negative integer');
    });

    it('should throw error for non-integer totalActionsCount', () => {
      const actionTypeName = ActionTypeName.create(validActionTypeName);

      expect(() => new ActionType(
        validActionTypeId,
        actionTypeName,
        validLogo,
        validHabitId,
        fixedDate,
        fixedDate,
        3.5 as any, // Float should fail
        null
      )).toThrow('Total actions count must be a non-negative integer');
    });

    it('should throw error for invalid UUID format in id', () => {
      const actionTypeName = ActionTypeName.create(validActionTypeName);

      expect(() => new ActionType(
        'invalid-uuid' as UUID,
        actionTypeName,
        validLogo,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null
      )).toThrow('Invalid UUID format for id');
    });

    it('should throw error for invalid UUID format in habitId', () => {
      const actionTypeName = ActionTypeName.create(validActionTypeName);

      expect(() => new ActionType(
        validActionTypeId,
        actionTypeName,
        validLogo,
        'invalid-habit-uuid' as UUID,
        fixedDate,
        fixedDate,
        0,
        null
      )).toThrow('Invalid UUID format for habitId');
    });
  });

  describe('ActionType.create() factory method', () => {
    it('should create ActionType without database-generated fields', () => {
      // ACT
      const actionType = ActionType.create(
        validActionTypeName,
        validLogo,
        validHabitId
      );

      // ASSERT
      // Domain fields should be set
      expect(actionType.name.getValue()).toBe(validActionTypeName);
      expect(actionType.logo).toBe(validLogo);
      expect(actionType.habitId).toBe(validHabitId);

      // Database-generated fields should NOT be set by create() method
      // These will be generated by the database upon insertion
      expect(actionType.id).toBeUndefined();
      expect(actionType.createdAt).toBeUndefined();
      expect(actionType.updatedAt).toBeUndefined();
      expect(actionType.totalActionsCount).toBeUndefined();
      expect(actionType.lastActionDate).toBeUndefined();
    });

    it('should throw error for invalid ActionType name', () => {
      expect(() => ActionType.create(
        '', // Empty name should fail
        validLogo,
        validHabitId
      )).toThrow('ActionType name cannot be empty');
    });

    it('should throw error for invalid logo during creation', () => {
      expect(() => ActionType.create(
        validActionTypeName,
        '', // Empty logo should fail
        validHabitId
      )).toThrow('Logo must be a non-empty string');
    });

    it('should throw error for invalid habitId', () => {
      expect(() => ActionType.create(
        validActionTypeName,
        validLogo,
        'invalid-uuid' as UUID
      )).toThrow('Invalid UUID format for habitId');
    });
  });

  describe('ActionType update methods', () => {
    let baseActionType: ActionType;

    beforeEach(() => {
      // Use constructor for existing entities with all fields populated
      const actionTypeName = ActionTypeName.create(validActionTypeName);
      baseActionType = new ActionType(
        validActionTypeId,
        actionTypeName,
        validLogo,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null
      );
    });

    describe('updateName()', () => {
      it('should return new ActionType with updated name and current updatedAt', () => {
        // ARRANGE
        const newName = 'Evening Stretching';
        const beforeUpdate = new Date();

        // ACT
        const updatedActionType = baseActionType.updateName(newName);
        const afterUpdate = new Date();

        // ASSERT
        expect(updatedActionType).not.toBe(baseActionType);
        expect(updatedActionType.name.getValue()).toBe(newName);
        expect(updatedActionType.id).toBe(baseActionType.id);
        expect(updatedActionType.logo).toBe(baseActionType.logo);
        expect(updatedActionType.habitId).toBe(baseActionType.habitId);
        expect(updatedActionType.createdAt).toEqual(baseActionType.createdAt);

        // updatedAt should be current Date
        expect(updatedActionType.updatedAt).toBeInstanceOf(Date);
        expect(updatedActionType.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
        expect(updatedActionType.updatedAt.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());

        expect(updatedActionType.totalActionsCount).toBe(baseActionType.totalActionsCount);
        expect(updatedActionType.lastActionDate).toBe(baseActionType.lastActionDate);
      });

      it('should throw error for invalid name', () => {
        expect(() => baseActionType.updateName('')).toThrow('ActionType name cannot be empty');
      });
    });

    describe('updateLogo()', () => {
      it('should return new ActionType with updated logo and current updatedAt', () => {
        // ARRANGE
        const newLogo = 'https://example.com/new-stretching-logo.png';
        const beforeUpdate = new Date();

        // ACT
        const updatedActionType = baseActionType.updateLogo(newLogo);
        const afterUpdate = new Date();

        // ASSERT
        expect(updatedActionType).not.toBe(baseActionType);
        expect(updatedActionType.logo).toBe(newLogo);
        expect(updatedActionType.id).toBe(baseActionType.id);
        expect(updatedActionType.name).toBe(baseActionType.name);
        expect(updatedActionType.habitId).toBe(baseActionType.habitId);
        expect(updatedActionType.createdAt).toEqual(baseActionType.createdAt);

        // updatedAt should be current Date
        expect(updatedActionType.updatedAt).toBeInstanceOf(Date);
        expect(updatedActionType.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
        expect(updatedActionType.updatedAt.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
      });

      it('should throw error for empty logo', () => {
        expect(() => baseActionType.updateLogo('')).toThrow('Logo must be a non-empty string');
      });

      it('should throw error for null logo', () => {
        expect(() => baseActionType.updateLogo(null as any)).toThrow('Logo must be a string');
      });
    });

  });

  describe('ActionType business logic methods', () => {
    let actionType: ActionType;

    beforeEach(() => {
      actionType = new ActionType(
        validActionTypeId,
        ActionTypeName.create(validActionTypeName),
        validLogo,
        validHabitId,
        fixedDate,
        fixedDate,
        10,
        lastActionDate
      );
    });

    describe('hasActions()', () => {
      it('should return true when totalActionsCount > 0', () => {
        expect(actionType.hasActions()).toBe(true);
      });

      it('should return false when totalActionsCount is 0', () => {
        const actionTypeName = ActionTypeName.create(validActionTypeName);
        const noActionsType = new ActionType(
          validActionTypeId,
          actionTypeName,
          validLogo,
          validHabitId,
          fixedDate,
          fixedDate,
          0, // Zero actions
          null
        );

        expect(noActionsType.hasActions()).toBe(false);
      });
    });

    describe('hasRecentAction()', () => {
      it('should return true when lastActionDate is within specified days', () => {
        // ARRANGE
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 1); // 1 day ago
        const recentActionType = new ActionType(
          validActionTypeId,
          ActionTypeName.create(validActionTypeName),
          validLogo,
          validHabitId,
          fixedDate,
          fixedDate,
          5,
          recentDate
        );

        // ACT & ASSERT
        expect(recentActionType.hasRecentAction(7)).toBe(true); // Within 7 days
      });

      it('should return false when lastActionDate is beyond specified days', () => {
        // ARRANGE
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 10); // 10 days ago
        const oldActionType = new ActionType(
          validActionTypeId,
          ActionTypeName.create(validActionTypeName),
          validLogo,
          validHabitId,
          fixedDate,
          fixedDate,
          5,
          oldDate
        );

        // ACT & ASSERT
        expect(oldActionType.hasRecentAction(7)).toBe(false); // Beyond 7 days
      });

      it('should return false when lastActionDate is null', () => {
        const actionTypeName = ActionTypeName.create(validActionTypeName);
        const noActionType = new ActionType(
          validActionTypeId,
          actionTypeName,
          validLogo,
          validHabitId,
          fixedDate,
          fixedDate,
          0,
          null // No last action date
        );

        expect(noActionType.hasRecentAction(7)).toBe(false);
      });

      it('should throw error for invalid days parameter', () => {
        expect(() => actionType.hasRecentAction(-1))
          .toThrow('Days must be a positive number');
        expect(() => actionType.hasRecentAction(0))
          .toThrow('Days must be a positive number');
      });
    });

    describe('isActivelyUsed()', () => {
      it('should return true when has actions and recent activity', () => {
        // ARRANGE
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 3); // 3 days ago
        const activeActionType = new ActionType(
          validActionTypeId,
          ActionTypeName.create(validActionTypeName),
          validLogo,
          validHabitId,
          fixedDate,
          fixedDate,
          5,
          recentDate
        );

        // ACT & ASSERT
        expect(activeActionType.isActivelyUsed(7)).toBe(true);
      });

      it('should return false when has no actions', () => {
        const actionTypeName = ActionTypeName.create(validActionTypeName);
        const noActionsType = new ActionType(
          validActionTypeId,
          actionTypeName,
          validLogo,
          validHabitId,
          fixedDate,
          fixedDate,
          0, // No actions
          null
        );

        expect(noActionsType.isActivelyUsed(7)).toBe(false);
      });

      it('should return false when has actions but no recent activity', () => {
        // ARRANGE
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 30); // 30 days ago
        const inactiveActionType = new ActionType(
          validActionTypeId,
          ActionTypeName.create(validActionTypeName),
          validLogo,
          validHabitId,
          fixedDate,
          fixedDate,
          10,
          oldDate
        );

        // ACT & ASSERT
        expect(inactiveActionType.isActivelyUsed(7)).toBe(false);
      });
    });
  });

  describe('ActionType equality and comparison', () => {
    it('should return true for same id', () => {
      const actionTypeName1 = ActionTypeName.create(validActionTypeName);
      const actionTypeName2 = ActionTypeName.create('Different Name');

      const actionType1 = new ActionType(
        validActionTypeId,
        actionTypeName1,
        validLogo,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null
      );
      const actionType2 = new ActionType(
        validActionTypeId,
        actionTypeName2,
        'different-logo.png',
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null
      );

      expect(actionType1.equals(actionType2)).toBe(true);
    });

    it('should return false for different id', () => {
      const actionTypeName = ActionTypeName.create(validActionTypeName);
      const differentId: UUID = '987fcdeb-51a2-43d1-9876-543210987654';

      const actionType1 = new ActionType(
        validActionTypeId,
        actionTypeName,
        validLogo,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null
      );
      const actionType2 = new ActionType(
        differentId,
        actionTypeName,
        validLogo,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null
      );

      expect(actionType1.equals(actionType2)).toBe(false);
    });

    it('should return true for belongsToHabit with matching habitId', () => {
      const actionTypeName = ActionTypeName.create(validActionTypeName);
      const actionType = new ActionType(
        validActionTypeId,
        actionTypeName,
        validLogo,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null
      );

      expect(actionType.belongsToHabit(validHabitId)).toBe(true);
    });

    it('should return false for belongsToHabit with different habitId', () => {
      const actionTypeName = ActionTypeName.create(validActionTypeName);
      const actionType = new ActionType(
        validActionTypeId,
        actionTypeName,
        validLogo,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null
      );
      const differentHabitId: UUID = '111e1111-e11e-11e1-a111-111111111111';

      expect(actionType.belongsToHabit(differentHabitId)).toBe(false);
    });
  });

  describe('Database-generated fields behavior', () => {
    it('should NOT accept id parameter in create() method', () => {
      // ACT
      const actionType = ActionType.create(
        validActionTypeName,
        validLogo,
        validHabitId
      );

      // ASSERT
      expect(actionType.id).toBeUndefined();
    });

    it('should NOT accept createdAt parameter in create() method', () => {
      // ACT
      const actionType = ActionType.create(
        validActionTypeName,
        validLogo,
        validHabitId
      );

      // ASSERT
      expect(actionType.createdAt).toBeUndefined();
    });

    it('should NOT accept updatedAt parameter in create() method', () => {
      // ACT
      const actionType = ActionType.create(
        validActionTypeName,
        validLogo,
        validHabitId
      );

      // ASSERT
      expect(actionType.updatedAt).toBeUndefined();
    });

    it('should NOT accept totalActionsCount parameter in create() method', () => {
      // ACT
      const actionType = ActionType.create(
        validActionTypeName,
        validLogo,
        validHabitId
      );

      // ASSERT
      expect(actionType.totalActionsCount).toBeUndefined();
    });

    it('should NOT accept lastActionDate parameter in create() method', () => {
      // ACT
      const actionType = ActionType.create(
        validActionTypeName,
        validLogo,
        validHabitId
      );

      // ASSERT
      expect(actionType.lastActionDate).toBeUndefined();
    });

    it('should create valid ActionType for database insertion with only domain fields', () => {
      // ACT
      const actionType = ActionType.create(
        validActionTypeName,
        validLogo,
        validHabitId
      );

      // ASSERT - only domain-specific fields should be populated
      expect(actionType.name).toBeInstanceOf(ActionTypeName);
      expect(actionType.name.getValue()).toBe(validActionTypeName);
      expect(actionType.logo).toBe(validLogo);
      expect(actionType.habitId).toBe(validHabitId);

      // Database will generate these
      expect(actionType.id).toBeUndefined();
      expect(actionType.createdAt).toBeUndefined();
      expect(actionType.updatedAt).toBeUndefined();
      expect(actionType.totalActionsCount).toBeUndefined();
      expect(actionType.lastActionDate).toBeUndefined();
    });
  });

  describe('Edge cases and validation', () => {
    it('should handle maximum safe integer for totalActionsCount', () => {
      const maxCount = Number.MAX_SAFE_INTEGER;
      const actionTypeName = ActionTypeName.create(validActionTypeName);

      const actionType = new ActionType(
        validActionTypeId,
        actionTypeName,
        validLogo,
        validHabitId,
        fixedDate,
        fixedDate,
        maxCount,
        null
      );

      expect(actionType.totalActionsCount).toBe(maxCount);
    });

    it('should handle date precision correctly', () => {
      const preciseDate = new Date('2024-01-01T12:30:45.123Z');
      const actionTypeName = ActionTypeName.create(validActionTypeName);
      const actionType = new ActionType(
        validActionTypeId,
        actionTypeName,
        validLogo,
        validHabitId,
        preciseDate,
        preciseDate,
        0,
        null
      );

      expect(actionType.createdAt.getTime()).toBe(preciseDate.getTime());
      expect(actionType.updatedAt.getTime()).toBe(preciseDate.getTime());
    });

    it('should validate logo size constraints', () => {
      // Test for extremely large logo (simulating base64 image > 2MB)
      const largeLogo = 'data:image/png;base64,' + 'a'.repeat(3 * 1024 * 1024); // 3MB
      const actionTypeName = ActionTypeName.create(validActionTypeName);

      expect(() => new ActionType(
        validActionTypeId,
        actionTypeName,
        largeLogo,
        validHabitId,
        fixedDate,
        fixedDate,
        0,
        null
      )).toThrow('Logo size cannot exceed 2MB');
    });
  });
});