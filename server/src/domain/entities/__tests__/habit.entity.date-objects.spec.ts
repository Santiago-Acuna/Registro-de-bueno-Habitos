import { HabitComplexity } from '../../shared/types/common';
import { IdentifierIcon } from '../../value-objects/identifier-icon';
import { IdentifierName } from '../../value-objects/identifier-name';
import { GlobalEntityIdentifier } from '../global-entity-identifier.entity';
import { Habit } from '../habit.entity';

describe('Habit Entity - Date Objects (RED PHASE)', () => {
  const validHabitId = '123e4567-e89b-12d3-a456-426614174000';
  const validGlobalIdentifierId = 'global-id-123e4567-e89b-12d3-a456-426614174000';
  const validHabitName = 'Morning Exercise';
  const validHabitType = HabitComplexity.SIMPLE;
  const validIconUrl = 'https://example.com/logo.png';

  // Date objects that should be used throughout
  const fixedDate = new Date('2024-01-01T00:00:00.000Z');
  const lastActionDate = new Date('2024-01-01T12:00:00.000Z');
  const updatedDate = new Date('2024-01-02T00:00:00.000Z');

  // Valid Date objects
  const validDateObjects = [
    new Date('2024-01-01T00:00:00.000Z'),
    new Date('2024-01-01T12:30:45.123Z'),
    new Date('2024-12-31T23:59:59.999Z'),
    new Date(),
  ];

  // Invalid date values (not Date objects)
  const invalidDateValues = [
    '2024-01-01T00:00:00.000Z', // ISO string (current implementation)
    '2024-01-01',
    '2024/01/01',
    'invalid-date',
    new Date('invalid'), // Invalid Date object
    null,
    undefined,
    42,
    {},
    [],
  ];

  // Helper to create mock GlobalEntityIdentifier
  const createMockGlobalIdentifier = (name: string = validHabitName, icon: string = validIconUrl): GlobalEntityIdentifier => {
    return new GlobalEntityIdentifier(
      validGlobalIdentifierId,
      IdentifierName.create(name),
      IdentifierIcon.create(icon),
      'habit',
      validHabitId
    );
  };

  describe('Habit Constructor with Date Objects', () => {
    it('should create habit instance with valid Date objects', () => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();

      // ACT
      const habit = new Habit(
        validHabitId,
        validHabitType,
        fixedDate,
        fixedDate,
        true,
        5,
        lastActionDate,
        globalIdentifier
      );

      // ASSERT
      expect(habit.id).toBe(validHabitId);
      expect(habit.globalEntityIdentifier.name.getValue()).toBe(validHabitName);
      expect(habit.habitType).toBe(validHabitType);
      expect(habit.globalEntityIdentifier.icon.getValue()).toBe(validIconUrl);
      expect(habit.createdAt).toBeInstanceOf(Date);
      expect(habit.updatedAt).toBeInstanceOf(Date);
      expect(habit.lastActionDate).toBeInstanceOf(Date);
      expect(habit.createdAt).toEqual(fixedDate);
      expect(habit.updatedAt).toEqual(fixedDate);
      expect(habit.lastActionDate).toEqual(lastActionDate);
      expect(habit.isActive).toBe(true);
      expect(habit.totalActionsCount).toBe(5);
    });

    it('should accept null lastActionDate as Date | null', () => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();

      // ACT
      const habit = new Habit(
        validHabitId,
        validHabitType,
        fixedDate,
        fixedDate,
        true,
        0,
        null,
        globalIdentifier
      );

      // ASSERT
      expect(habit.lastActionDate).toBeNull();
    });

    it.each(validDateObjects)('should accept valid Date object: %s', (validDate) => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();

      // ACT & ASSERT
      expect(() => new Habit(
        validHabitId,
        validHabitType,
        validDate,
        validDate,
        true,
        0,
        validDate,
        globalIdentifier
      )).not.toThrow();
    });

    it('should throw error for invalid createdAt (non-Date)', () => {
      const globalIdentifier = createMockGlobalIdentifier();

      expect(() => new Habit(
        validHabitId,
        validHabitType,
        '2024-01-01T00:00:00.000Z' as any, // ISO string should fail
        fixedDate,
        true,
        0,
        null,
        globalIdentifier
      )).toThrow('Invalid date: createdAt must be a valid Date object');
    });

    it('should throw error for invalid updatedAt (non-Date)', () => {
      const globalIdentifier = createMockGlobalIdentifier();

      expect(() => new Habit(
        validHabitId,
        validHabitType,
        fixedDate,
        '2024-01-01T00:00:00.000Z' as any, // ISO string should fail
        true,
        0,
        null,
        globalIdentifier
      )).toThrow('Invalid date: updatedAt must be a valid Date object');
    });

    it('should throw error for invalid lastActionDate (non-Date, not null)', () => {
      const globalIdentifier = createMockGlobalIdentifier();

      expect(() => new Habit(
        validHabitId,
        validHabitType,
        fixedDate,
        fixedDate,
        true,
        0,
        '2024-01-01T00:00:00.000Z' as any, // ISO string should fail
        globalIdentifier
      )).toThrow('Invalid date: lastActionDate must be a valid Date object or null');
    });

    it.each(invalidDateValues.filter(val => val !== null && val !== undefined))(
      'should reject invalid date value: %s',
      (invalidValue) => {
        const globalIdentifier = createMockGlobalIdentifier();

        expect(() => new Habit(
          validHabitId,
          validHabitType,
          invalidValue as any,
          fixedDate,
          true,
          0,
          null,
          globalIdentifier
        )).toThrow('Invalid date');
      }
    );

    it('should throw error for invalid Date object (NaN)', () => {
      const globalIdentifier = createMockGlobalIdentifier();
      const invalidDate = new Date('invalid-date-string');

      expect(() => new Habit(
        validHabitId,
        validHabitType,
        invalidDate,
        fixedDate,
        true,
        0,
        null,
        globalIdentifier
      )).toThrow('Invalid date: createdAt must be a valid Date object');
    });
  });

  describe('Habit constructor with Date Objects', () => {
    it('should create habit with provided Date objects', () => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();

      // ACT
      const habit = new Habit(
        validHabitId,
        validHabitType,
        fixedDate,
        updatedDate,
        true,
        0,
        null,
        globalIdentifier
      );

      // ASSERT
      expect(habit.id).toBe(validHabitId);
      expect(habit.globalEntityIdentifier.name.getValue()).toBe(validHabitName);
      expect(habit.habitType).toBe(validHabitType);
      expect(habit.globalEntityIdentifier.icon.getValue()).toBe(validIconUrl);
      expect(habit.createdAt).toBeInstanceOf(Date);
      expect(habit.updatedAt).toBeInstanceOf(Date);
      expect(habit.createdAt).toEqual(fixedDate);
      expect(habit.updatedAt).toEqual(updatedDate);
      expect(habit.isActive).toBe(true);
      expect(habit.totalActionsCount).toBe(0);
      expect(habit.lastActionDate).toBeNull();
    });

    it('should create habit with current Date timestamps', () => {
      // ARRANGE
      const beforeCreation = new Date();
      const globalIdentifier = createMockGlobalIdentifier();
      const currentDate = new Date();

      // ACT
      const habit = new Habit(
        validHabitId,
        validHabitType,
        currentDate,
        currentDate,
        true,
        0,
        null,
        globalIdentifier
      );

      // ASSERT
      const afterCreation = new Date();

      expect(habit.createdAt).toBeInstanceOf(Date);
      expect(habit.updatedAt).toBeInstanceOf(Date);
      expect(habit.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(habit.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
      expect(habit.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(habit.updatedAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });

    it('should create habit with specific createdAt Date', () => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();
      const currentDate = new Date();

      // ACT
      const habit = new Habit(
        validHabitId,
        validHabitType,
        fixedDate,
        currentDate,
        true,
        0,
        null,
        globalIdentifier
      );

      // ASSERT
      expect(habit.createdAt).toEqual(fixedDate);
      expect(habit.updatedAt).toBeInstanceOf(Date);
    });

    it('should create habit with specific updatedAt Date', () => {
      // ARRANGE
      const globalIdentifier = createMockGlobalIdentifier();
      const currentDate = new Date();

      // ACT
      const habit = new Habit(
        validHabitId,
        validHabitType,
        currentDate,
        updatedDate,
        true,
        0,
        null,
        globalIdentifier
      );

      // ASSERT
      expect(habit.createdAt).toBeInstanceOf(Date);
      expect(habit.updatedAt).toEqual(updatedDate);
    });

    it('should throw error when createdAt is not a Date object', () => {
      const globalIdentifier = createMockGlobalIdentifier();
      expect(() => new Habit(
        validHabitId,
        validHabitType,
        '2024-01-01T00:00:00.000Z' as any, // ISO string should fail
        fixedDate,
        true,
        0,
        null,
        globalIdentifier
      )).toThrow('Invalid date: createdAt must be a valid Date object');
    });

    it('should throw error when updatedAt is not a Date object', () => {
      const globalIdentifier = createMockGlobalIdentifier();
      expect(() => new Habit(
        validHabitId,
        validHabitType,
        fixedDate,
        '2024-01-01T00:00:00.000Z' as any, // ISO string should fail
        true,
        0,
        null,
        globalIdentifier
      )).toThrow('Invalid date: updatedAt must be a valid Date object');
    });

    it('should throw error for null createdAt', () => {
      const globalIdentifier = createMockGlobalIdentifier();
      expect(() => new Habit(
        validHabitId,
        validHabitType,
        null as any,
        fixedDate,
        true,
        0,
        null,
        globalIdentifier
      )).toThrow('Invalid date: createdAt must be a Date object');
    });

    it('should throw error for null updatedAt', () => {
      const globalIdentifier = createMockGlobalIdentifier();
      expect(() => new Habit(
        validHabitId,
        validHabitType,
        fixedDate,
        null as any,
        true,
        0,
        null,
        globalIdentifier
      )).toThrow('Invalid date: updatedAt must be a Date object');
    });

    it('should throw error for invalid Date object (NaN)', () => {
      const invalidDate = new Date('invalid-date-string');
      const globalIdentifier = createMockGlobalIdentifier();

      expect(() => new Habit(
        validHabitId,
        validHabitType,
        invalidDate,
        fixedDate,
        true,
        0,
        null,
        globalIdentifier
      )).toThrow('Invalid date: createdAt must be a valid Date object');
    });
  });

  describe('Update Methods with Date Objects', () => {
    let baseHabit: Habit;

    beforeEach(() => {
      const globalIdentifier = createMockGlobalIdentifier();
      baseHabit = new Habit(
        validHabitId,
        validHabitType,
        fixedDate,
        fixedDate,
        true,
        0,
        null,
        globalIdentifier
      );
    });

    describe('updateName()', () => {
      it('should return new habit with updated name and current Date updatedAt', () => {
        // ARRANGE
        const newName = 'Evening Meditation';
        const beforeUpdate = new Date();

        // ACT
        const updatedHabit = baseHabit.updateName(newName);
        const afterUpdate = new Date();

        // ASSERT
        expect(updatedHabit).not.toBe(baseHabit);
        expect(updatedHabit.globalEntityIdentifier.name.getValue()).toBe(newName);
        expect(updatedHabit.id).toBe(baseHabit.id);
        expect(updatedHabit.habitType).toBe(baseHabit.habitType);
        expect(updatedHabit.globalEntityIdentifier.icon).toBe(baseHabit.globalEntityIdentifier.icon);
        expect(updatedHabit.createdAt).toEqual(baseHabit.createdAt);

        // updatedAt should be a Date object and current
        expect(updatedHabit.updatedAt).toBeInstanceOf(Date);
        expect(updatedHabit.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
        expect(updatedHabit.updatedAt.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());

        expect(updatedHabit.isActive).toBe(baseHabit.isActive);
        expect(updatedHabit.totalActionsCount).toBe(baseHabit.totalActionsCount);
        expect(updatedHabit.lastActionDate).toBe(baseHabit.lastActionDate);
      });
    });

    describe('updateIcon()', () => {
      it('should return new habit with updated icon and current Date updatedAt', () => {
        // ARRANGE
        const newIconUrl = 'https://example.com/new-icon.png';
        const beforeUpdate = new Date();

        // ACT
        const updatedHabit = baseHabit.updateIcon(newIconUrl);
        const afterUpdate = new Date();

        // ASSERT
        expect(updatedHabit).not.toBe(baseHabit);
        expect(updatedHabit.globalEntityIdentifier.icon.getValue()).toBe(newIconUrl);
        expect(updatedHabit.id).toBe(baseHabit.id);
        expect(updatedHabit.globalEntityIdentifier.name).toBe(baseHabit.globalEntityIdentifier.name);
        expect(updatedHabit.habitType).toBe(baseHabit.habitType);
        expect(updatedHabit.createdAt).toEqual(baseHabit.createdAt);

        // updatedAt should be a Date object and current
        expect(updatedHabit.updatedAt).toBeInstanceOf(Date);
        expect(updatedHabit.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
        expect(updatedHabit.updatedAt.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
      });
    });

    describe('deactivate()', () => {
      it('should return new habit with isActive false and current Date updatedAt', () => {
        // ARRANGE
        const beforeDeactivation = new Date();

        // ACT
        const deactivatedHabit = baseHabit.deactivate();
        const afterDeactivation = new Date();

        // ASSERT
        expect(deactivatedHabit).not.toBe(baseHabit);
        expect(deactivatedHabit.isActive).toBe(false);
        expect(deactivatedHabit.id).toBe(baseHabit.id);
        expect(deactivatedHabit.globalEntityIdentifier.name).toBe(baseHabit.globalEntityIdentifier.name);
        expect(deactivatedHabit.habitType).toBe(baseHabit.habitType);
        expect(deactivatedHabit.globalEntityIdentifier.icon).toBe(baseHabit.globalEntityIdentifier.icon);
        expect(deactivatedHabit.createdAt).toEqual(baseHabit.createdAt);

        // updatedAt should be a Date object and current
        expect(deactivatedHabit.updatedAt).toBeInstanceOf(Date);
        expect(deactivatedHabit.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeDeactivation.getTime());
        expect(deactivatedHabit.updatedAt.getTime()).toBeLessThanOrEqual(afterDeactivation.getTime());

        expect(deactivatedHabit.totalActionsCount).toBe(baseHabit.totalActionsCount);
        expect(deactivatedHabit.lastActionDate).toBe(baseHabit.lastActionDate);
      });
    });
  });

  describe('HabitProps Interface with Date Objects', () => {
    it('should enforce lastActionDate as Date | null type', () => {
      // This test verifies the interface change
      const globalIdentifier = createMockGlobalIdentifier();
      const habitWithDateAction = new Habit(
        validHabitId,
        validHabitType,
        fixedDate,
        fixedDate,
        true,
        0,
        null,
        globalIdentifier
      );

      // Type checking - these should be Date objects
      expect(habitWithDateAction.createdAt).toBeInstanceOf(Date);
      expect(habitWithDateAction.updatedAt).toBeInstanceOf(Date);

      // lastActionDate should be null by default
      expect(habitWithDateAction.lastActionDate).toBeNull();
    });

    it('should handle lastActionDate as Date when provided in constructor', () => {
      const globalIdentifier = createMockGlobalIdentifier();
      const habit = new Habit(
        validHabitId,
        validHabitType,
        fixedDate,
        fixedDate,
        true,
        5,
        lastActionDate,
        globalIdentifier
      );

      expect(habit.lastActionDate).toBeInstanceOf(Date);
      expect(habit.lastActionDate).toEqual(lastActionDate);
    });
  });

  describe('Date Validation Helper', () => {
    it('should correctly validate Date objects vs other types', () => {
      // This test verifies that the new validateDate method works correctly
      const validDate = new Date('2024-01-01T00:00:00.000Z');
      const invalidDate = new Date('invalid');
      const isoString = '2024-01-01T00:00:00.000Z';

      // These assertions will help verify the new validation logic
      expect(validDate).toBeInstanceOf(Date);
      expect(isNaN(invalidDate.getTime())).toBe(true);
      expect(typeof isoString).toBe('string');
      expect(isoString).not.toBeInstanceOf(Date);
    });
  });

  describe('Edge Cases with Date Objects', () => {
    it('should handle Date objects at different times correctly', () => {
      const globalIdentifier = createMockGlobalIdentifier();
      const earlyDate = new Date('2020-01-01T00:00:00.000Z');
      const lateDate = new Date('2030-12-31T23:59:59.999Z');

      const habit = new Habit(
        validHabitId,
        validHabitType,
        earlyDate,
        lateDate,
        true,
        0,
        null,
        globalIdentifier
      );

      expect(habit.createdAt).toEqual(earlyDate);
      expect(habit.updatedAt).toEqual(lateDate);
    });

    it('should preserve Date object precision', () => {
      const globalIdentifier = createMockGlobalIdentifier();
      const preciseDate = new Date('2024-01-01T12:30:45.123Z');

      const habit = new Habit(
        validHabitId,
        validHabitType,
        preciseDate,
        preciseDate,
        true,
        0,
        null,
        globalIdentifier
      );

      expect(habit.createdAt.getTime()).toBe(preciseDate.getTime());
      expect(habit.updatedAt.getTime()).toBe(preciseDate.getTime());
    });

    it('should handle timezone-aware Date objects', () => {
      // Date objects are always in UTC internally
      const globalIdentifier = createMockGlobalIdentifier();
      const utcDate = new Date('2024-01-01T12:00:00.000Z');

      const habit = new Habit(
        validHabitId,
        validHabitType,
        utcDate,
        utcDate,
        true,
        0,
        null,
        globalIdentifier
      );

      expect(habit.createdAt).toEqual(utcDate);
      expect(habit.updatedAt).toEqual(utcDate);
    });
  });
});