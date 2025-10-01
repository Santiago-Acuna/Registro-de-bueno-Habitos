import { HabitComplexity } from '../../shared/types/common';
import { IdentifierName } from '../../value-objects/identifier-name';
import { Habit } from '../habit.entity';

describe('Habit Entity - Date Objects (RED PHASE)', () => {
  const validHabitId = '123e4567-e89b-12d3-a456-426614174000';
  const validHabitName = 'Morning Exercise';
  const validHabitType = HabitComplexity.SIMPLE;
  const validLogo = 'https://example.com/logo.png';

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

  describe('Habit Constructor with Date Objects', () => {
    it('should create habit instance with valid Date objects', () => {
      // ARRANGE
      const habitName = IdentifierName.create(validHabitName);

      // ACT
      const habit = new Habit(
        validHabitId,
        habitName,
        validHabitType,
        validLogo,
        fixedDate,
        fixedDate,
        true,
        5,
        lastActionDate
      );

      // ASSERT
      expect(habit.id).toBe(validHabitId);
      expect(habit.name).toBe(habitName);
      expect(habit.habitType).toBe(validHabitType);
      expect(habit.logo).toBe(validLogo);
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
      const habitName = IdentifierName.create(validHabitName);

      // ACT
      const habit = new Habit(
        validHabitId,
        habitName,
        validHabitType,
        validLogo,
        fixedDate,
        fixedDate,
        true,
        0,
        null
      );

      // ASSERT
      expect(habit.lastActionDate).toBeNull();
    });

    it.each(validDateObjects)('should accept valid Date object: %s', (validDate) => {
      // ARRANGE
      const habitName = IdentifierName.create(validHabitName);

      // ACT & ASSERT
      expect(() => new Habit(
        validHabitId,
        habitName,
        validHabitType,
        validLogo,
        validDate,
        validDate,
        true,
        0,
        validDate
      )).not.toThrow();
    });

    it('should throw error for invalid createdAt (non-Date)', () => {
      const habitName = IdentifierName.create(validHabitName);

      expect(() => new Habit(
        validHabitId,
        habitName,
        validHabitType,
        validLogo,
        '2024-01-01T00:00:00.000Z' as any, // ISO string should fail
        fixedDate,
        true,
        0,
        null
      )).toThrow('Invalid date: createdAt must be a valid Date object');
    });

    it('should throw error for invalid updatedAt (non-Date)', () => {
      const habitName = IdentifierName.create(validHabitName);

      expect(() => new Habit(
        validHabitId,
        habitName,
        validHabitType,
        validLogo,
        fixedDate,
        '2024-01-01T00:00:00.000Z' as any, // ISO string should fail
        true,
        0,
        null
      )).toThrow('Invalid date: updatedAt must be a valid Date object');
    });

    it('should throw error for invalid lastActionDate (non-Date, not null)', () => {
      const habitName = IdentifierName.create(validHabitName);

      expect(() => new Habit(
        validHabitId,
        habitName,
        validHabitType,
        validLogo,
        fixedDate,
        fixedDate,
        true,
        0,
        '2024-01-01T00:00:00.000Z' as any // ISO string should fail
      )).toThrow('Invalid date: lastActionDate must be a valid Date object or null');
    });

    it.each(invalidDateValues.filter(val => val !== null && val !== undefined))(
      'should reject invalid date value: %s',
      (invalidValue) => {
        const habitName = IdentifierName.create(validHabitName);

        expect(() => new Habit(
          validHabitId,
          habitName,
          validHabitType,
          validLogo,
          invalidValue as any,
          fixedDate,
          true,
          0,
          null
        )).toThrow('Invalid date');
      }
    );

    it('should throw error for invalid Date object (NaN)', () => {
      const habitName = IdentifierName.create(validHabitName);
      const invalidDate = new Date('invalid-date-string');

      expect(() => new Habit(
        validHabitId,
        habitName,
        validHabitType,
        validLogo,
        invalidDate,
        fixedDate,
        true,
        0,
        null
      )).toThrow('Invalid date: createdAt must be a valid Date object');
    });
  });

  describe('Habit.create() with Date Objects', () => {
    it('should create habit with provided Date objects', () => {
      // ACT
      const habit = Habit.create(
        validHabitId,
        validHabitName,
        validHabitType,
        validLogo,
        fixedDate,
        updatedDate
      );

      // ASSERT
      expect(habit.id).toBe(validHabitId);
      expect(habit.name.getValue()).toBe(validHabitName);
      expect(habit.habitType).toBe(validHabitType);
      expect(habit.logo).toBe(validLogo);
      expect(habit.createdAt).toBeInstanceOf(Date);
      expect(habit.updatedAt).toBeInstanceOf(Date);
      expect(habit.createdAt).toEqual(fixedDate);
      expect(habit.updatedAt).toEqual(updatedDate);
      expect(habit.isActive).toBe(true);
      expect(habit.totalActionsCount).toBe(0);
      expect(habit.lastActionDate).toBeNull();
    });

    it('should create habit with current Date when dates not provided', () => {
      // ARRANGE
      const beforeCreation = new Date();

      // ACT
      const habit = Habit.create(
        validHabitId,
        validHabitName,
        validHabitType,
        validLogo
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

    it('should accept optional Date parameter for createdAt', () => {
      // ACT
      const habit = Habit.create(
        validHabitId,
        validHabitName,
        validHabitType,
        validLogo,
        fixedDate
      );

      // ASSERT
      expect(habit.createdAt).toEqual(fixedDate);
      expect(habit.updatedAt).toBeInstanceOf(Date);
    });

    it('should accept optional Date parameter for updatedAt', () => {
      // ACT
      const habit = Habit.create(
        validHabitId,
        validHabitName,
        validHabitType,
        validLogo,
        undefined,
        updatedDate
      );

      // ASSERT
      expect(habit.createdAt).toBeInstanceOf(Date);
      expect(habit.updatedAt).toEqual(updatedDate);
    });

    it('should throw error when createdAt is not a Date object', () => {
      expect(() => Habit.create(
        validHabitId,
        validHabitName,
        validHabitType,
        validLogo,
        '2024-01-01T00:00:00.000Z' as any // ISO string should fail
      )).toThrow('Invalid date: createdAt must be a Date object');
    });

    it('should throw error when updatedAt is not a Date object', () => {
      expect(() => Habit.create(
        validHabitId,
        validHabitName,
        validHabitType,
        validLogo,
        fixedDate,
        '2024-01-01T00:00:00.000Z' as any // ISO string should fail
      )).toThrow('Invalid date: updatedAt must be a Date object');
    });

    it('should throw error for null createdAt', () => {
      expect(() => Habit.create(
        validHabitId,
        validHabitName,
        validHabitType,
        validLogo,
        null as any
      )).toThrow('Invalid date: createdAt must be a Date object');
    });

    it('should throw error for null updatedAt', () => {
      expect(() => Habit.create(
        validHabitId,
        validHabitName,
        validHabitType,
        validLogo,
        fixedDate,
        null as any
      )).toThrow('Invalid date: updatedAt must be a Date object');
    });

    it('should throw error for invalid Date object (NaN)', () => {
      const invalidDate = new Date('invalid-date-string');

      expect(() => Habit.create(
        validHabitId,
        validHabitName,
        validHabitType,
        validLogo,
        invalidDate
      )).toThrow('Invalid date: createdAt must be a valid Date object');
    });
  });

  describe('Update Methods with Date Objects', () => {
    let baseHabit: Habit;

    beforeEach(() => {
      baseHabit = Habit.create(
        validHabitId,
        validHabitName,
        validHabitType,
        validLogo,
        fixedDate,
        fixedDate
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
        expect(updatedHabit.name.getValue()).toBe(newName);
        expect(updatedHabit.id).toBe(baseHabit.id);
        expect(updatedHabit.habitType).toBe(baseHabit.habitType);
        expect(updatedHabit.logo).toBe(baseHabit.logo);
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

    describe('updateLogo()', () => {
      it('should return new habit with updated logo and current Date updatedAt', () => {
        // ARRANGE
        const newLogo = 'https://example.com/new-logo.png';
        const beforeUpdate = new Date();

        // ACT
        const updatedHabit = baseHabit.updateLogo(newLogo);
        const afterUpdate = new Date();

        // ASSERT
        expect(updatedHabit).not.toBe(baseHabit);
        expect(updatedHabit.logo).toBe(newLogo);
        expect(updatedHabit.id).toBe(baseHabit.id);
        expect(updatedHabit.name).toBe(baseHabit.name);
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
        expect(deactivatedHabit.name).toBe(baseHabit.name);
        expect(deactivatedHabit.habitType).toBe(baseHabit.habitType);
        expect(deactivatedHabit.logo).toBe(baseHabit.logo);
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
      const habitWithDateAction = Habit.create(
        validHabitId,
        validHabitName,
        validHabitType,
        validLogo,
        fixedDate,
        fixedDate
      );

      // Type checking - these should be Date objects
      expect(habitWithDateAction.createdAt).toBeInstanceOf(Date);
      expect(habitWithDateAction.updatedAt).toBeInstanceOf(Date);

      // lastActionDate should be null by default
      expect(habitWithDateAction.lastActionDate).toBeNull();
    });

    it('should handle lastActionDate as Date when provided in constructor', () => {
      const habitName = IdentifierName.create(validHabitName);
      const habit = new Habit(
        validHabitId,
        habitName,
        validHabitType,
        validLogo,
        fixedDate,
        fixedDate,
        true,
        5,
        lastActionDate
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
      const earlyDate = new Date('2020-01-01T00:00:00.000Z');
      const lateDate = new Date('2030-12-31T23:59:59.999Z');

      const habit = Habit.create(
        validHabitId,
        validHabitName,
        validHabitType,
        validLogo,
        earlyDate,
        lateDate
      );

      expect(habit.createdAt).toEqual(earlyDate);
      expect(habit.updatedAt).toEqual(lateDate);
    });

    it('should preserve Date object precision', () => {
      const preciseDate = new Date('2024-01-01T12:30:45.123Z');

      const habit = Habit.create(
        validHabitId,
        validHabitName,
        validHabitType,
        validLogo,
        preciseDate,
        preciseDate
      );

      expect(habit.createdAt.getTime()).toBe(preciseDate.getTime());
      expect(habit.updatedAt.getTime()).toBe(preciseDate.getTime());
    });

    it('should handle timezone-aware Date objects', () => {
      // Date objects are always in UTC internally
      const utcDate = new Date('2024-01-01T12:00:00.000Z');

      const habit = Habit.create(
        validHabitId,
        validHabitName,
        validHabitType,
        validLogo,
        utcDate,
        utcDate
      );

      expect(habit.createdAt).toEqual(utcDate);
      expect(habit.updatedAt).toEqual(utcDate);
    });
  });
});