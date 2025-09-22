import { HabitComplexity } from '../../shared/types/common';
import { HabitName } from '../../value-objects/habit-name';
import { Habit } from '../habit.entity';
import { z } from 'zod';

describe('Habit Domain Entity', () => {
  const validHabitId = '123e4567-e89b-12d3-a456-426614174000';
  const validHabitName = 'Morning Exercise';
  const validHabitType = HabitComplexity.SIMPLE;
  const validLogo = 'https://example.com/logo.png';
  const fixedIsoDate = '2024-01-01T00:00:00.000Z';
  const validIsoDateFormats = [
    '2024-01-01T00:00:00.000Z',
    '2024-01-01T12:30:45.123Z',
    '2024-12-31T23:59:59.999Z',
    '2024-01-01T00:00:00Z'
  ];
  const invalidDateFormats = [
    '2024-01-01',
    '2024/01/01',
    '01-01-2024',
    '2024-1-1T00:00:00Z',
    '2024-01-01 00:00:00',
    '2024-01-01T25:00:00Z',
    '2024-13-01T00:00:00Z',
    '2024-01-32T00:00:00Z',
    'invalid-date',
    null,
    undefined,
    '',
    '2024-01-01T00:00:00+02:00'
  ];

  // Helper function to validate ISO 8601 format compatible with PostgreSQL TIMESTAMP WITH TIME ZONE
  const isValidPostgresIsoDate = (dateString: string): boolean => {
    try {
      if (!dateString || typeof dateString !== 'string') {
        return false;
      }

      // Must be ISO 8601 format with Z timezone (UTC) for PostgreSQL compatibility
      const isoDateSchema = z.string().regex(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/,
        'Must be ISO 8601 format with UTC timezone (Z)'
      );
      isoDateSchema.parse(dateString);

      // Additional validation: ensure it's a valid date
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return false;
      }

      // Normalize to compare (both should produce the same ISO string)
      const normalizedInput = dateString.includes('.') ? dateString : dateString.replace('Z', '.000Z');
      return date.toISOString() === normalizedInput;
    } catch {
      return false;
    }
  };

  // Helper function to validate and parse ISO 8601 dates
  const validateIsoDate = (dateString: string | null | undefined): string => {
    if (!dateString || typeof dateString !== 'string') {
      throw new Error('Invalid date format: Date must be a non-empty string');
    }
    if (!isValidPostgresIsoDate(dateString)) {
      throw new Error('Invalid date format: Must be ISO 8601 format with UTC timezone (YYYY-MM-DDTHH:mm:ss.sssZ)');
    }
    return dateString;
  };

  describe('ISO 8601 Date Format Validation', () => {
    describe('Valid ISO 8601 formats', () => {
      it.each(validIsoDateFormats)('should accept valid ISO 8601 format: %s', (validDate) => {
        expect(() => Habit.create(
          validHabitId,
          validHabitName,
          validHabitType,
          validLogo,
          validDate,
          validDate
        )).not.toThrow();
      });

      it('should validate ISO 8601 format with helper function', () => {
        validIsoDateFormats.forEach(dateString => {
          expect(isValidPostgresIsoDate(dateString)).toBe(true);
        });

        // Test the validateIsoDate helper
        validIsoDateFormats.forEach(dateString => {
          expect(() => validateIsoDate(dateString)).not.toThrow();
        });
      });
    });

    describe('Invalid date formats', () => {
      it.each(invalidDateFormats.filter(date => date !== null && date !== undefined))(
        'should reject invalid date format: %s', (invalidDate) => {
        expect(() => Habit.create(
          validHabitId,
          validHabitName,
          validHabitType,
          validLogo,
          invalidDate as string,
          invalidDate as string
        )).toThrow('Invalid date format');
      });

      it('should reject null createdAt', () => {
        expect(() => Habit.create(
          validHabitId,
          validHabitName,
          validHabitType,
          validLogo,
          null as any,
          fixedIsoDate
        )).toThrow('Invalid date format');
      });

      it('should reject null updatedAt', () => {
        expect(() => Habit.create(
          validHabitId,
          validHabitName,
          validHabitType,
          validLogo,
          fixedIsoDate,
          null as any
        )).toThrow('Invalid date format');
      });

      it('should validate dates are compatible with PostgreSQL TIMESTAMP WITH TIME ZONE', () => {
        invalidDateFormats.forEach(dateString => {
          if (dateString !== null && dateString !== undefined && dateString !== '') {
            expect(isValidPostgresIsoDate(dateString)).toBe(false);
          }
        });
      });
    });

    describe('PostgreSQL TIMESTAMP WITH TIME ZONE compatibility', () => {
      it('should only accept UTC timezone (Z) for PostgreSQL compatibility', () => {
        const utcDate = '2024-01-01T12:00:00.000Z';
        const offsetDate = '2024-01-01T12:00:00.000+02:00';

        expect(isValidPostgresIsoDate(utcDate)).toBe(true);
        expect(isValidPostgresIsoDate(offsetDate)).toBe(false);
      });

      it('should ensure date strings can be stored as PostgreSQL TIMESTAMP WITH TIME ZONE', () => {
        const validDate = '2024-01-01T12:00:00.000Z';
        const habit = Habit.create(
          validHabitId,
          validHabitName,
          validHabitType,
          validLogo,
          validDate,
          validDate
        );

        // These should be stored as ISO strings, not Date objects
        expect(typeof habit.createdAt).toBe('string');
        expect(typeof habit.updatedAt).toBe('string');
        expect(habit.createdAt).toBe(validDate);
        expect(habit.updatedAt).toBe(validDate);
      });
    });
  });

  describe('Habit.create()', () => {
    it('should create a new habit with valid ISO 8601 date parameters', () => {
      const habit = Habit.create(
        validHabitId,
        validHabitName,
        validHabitType,
        validLogo,
        fixedIsoDate,
        fixedIsoDate
      );

      expect(habit.id).toBe(validHabitId);
      expect(habit.name.getValue()).toBe(validHabitName);
      expect(habit.habitType).toBe(validHabitType);
      expect(habit.logo).toBe(validLogo);
      expect(habit.createdAt).toBe(fixedIsoDate);
      expect(habit.updatedAt).toBe(fixedIsoDate);
      expect(habit.isActive).toBe(true);
      expect(habit.totalActionsCount).toBe(0);
      expect(habit.lastActionDate).toBeNull();
    });

    it('should create a habit with default timestamps when not provided', () => {
      const beforeCreation = new Date();
      const habit = Habit.create(validHabitId, validHabitName, validHabitType, validLogo);
      const afterCreation = new Date();

      expect(typeof habit.createdAt).toBe('string');
      expect(typeof habit.updatedAt).toBe('string');
      expect(isValidPostgresIsoDate(habit.createdAt)).toBe(true);
      expect(isValidPostgresIsoDate(habit.updatedAt)).toBe(true);

      const createdAtDate = new Date(habit.createdAt);
      const updatedAtDate = new Date(habit.updatedAt);
      expect(createdAtDate.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(createdAtDate.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
      expect(updatedAtDate.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(updatedAtDate.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });

    it('should throw error for invalid habit name', () => {
      expect(() => Habit.create(validHabitId, '', validHabitType, validLogo)).toThrow(
        'Habit name must be a non-empty string'
      );

      expect(() => Habit.create(validHabitId, 'a'.repeat(51), validHabitType, validLogo)).toThrow(
        'Habit name cannot exceed 50 characters'
      );
    });

    it('should throw error for invalid logo', () => {
      expect(() => Habit.create(validHabitId, validHabitName, validHabitType, '')).toThrow(
        'Logo must be a non-empty string'
      );

      expect(() => Habit.create(validHabitId, validHabitName, validHabitType, null as any)).toThrow(
        'Logo must be a non-empty string'
      );
    });

    it('should throw error for logo exceeding 2MB size', () => {
      const largeLogo = 'a'.repeat(2 * 1024 * 1024 + 1); // Slightly over 2MB
      expect(() => Habit.create(validHabitId, validHabitName, validHabitType, largeLogo)).toThrow(
        'Logo size cannot exceed 2MB'
      );
    });
  });

  describe('Habit constructor', () => {
    it('should create habit instance with all parameters', () => {
      const habitName = HabitName.create(validHabitName);
      const habit = new Habit(
        validHabitId,
        habitName,
        validHabitType,
        validLogo,
        fixedIsoDate,
        fixedIsoDate,
        true,
        5,
        fixedIsoDate
      );

      expect(habit.id).toBe(validHabitId);
      expect(habit.name).toBe(habitName);
      expect(habit.habitType).toBe(validHabitType);
      expect(habit.logo).toBe(validLogo);
      expect(habit.isActive).toBe(true);
      expect(habit.totalActionsCount).toBe(5);
      expect(habit.lastActionDate).toBe(fixedIsoDate);
    });

    it('should validate logo during construction', () => {
      const habitName = HabitName.create(validHabitName);
      expect(
        () => new Habit(validHabitId, habitName, validHabitType, '', fixedIsoDate, fixedIsoDate)
      ).toThrow('Logo must be a non-empty string');
    });
  });

  describe('updateName()', () => {
    let habit: Habit;

    beforeEach(() => {
      habit = Habit.create(
        validHabitId,
        validHabitName,
        validHabitType,
        validLogo,
        fixedIsoDate,
        fixedIsoDate
      );
    });

    it('should return new habit instance with updated name', () => {
      const newName = 'Evening Meditation';
      const beforeUpdate = new Date();
      const updatedHabit = habit.updateName(newName);
      const afterUpdate = new Date();

      expect(updatedHabit).not.toBe(habit); // New instance
      expect(updatedHabit.name.getValue()).toBe(newName);
      expect(updatedHabit.id).toBe(habit.id);
      expect(updatedHabit.habitType).toBe(habit.habitType);
      expect(updatedHabit.logo).toBe(habit.logo);
      expect(updatedHabit.createdAt).toBe(habit.createdAt);

      expect(typeof updatedHabit.updatedAt).toBe('string');
      expect(isValidPostgresIsoDate(updatedHabit.updatedAt)).toBe(true);
      const updatedAtDate = new Date(updatedHabit.updatedAt);
      expect(updatedAtDate.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
      expect(updatedAtDate.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());

      expect(updatedHabit.isActive).toBe(habit.isActive);
      expect(updatedHabit.totalActionsCount).toBe(habit.totalActionsCount);
      expect(updatedHabit.lastActionDate).toBe(habit.lastActionDate);
    });

    it('should throw error for invalid new name', () => {
      expect(() => habit.updateName('')).toThrow('Habit name must be a non-empty string');
      expect(() => habit.updateName('a'.repeat(51))).toThrow(
        'Habit name cannot exceed 50 characters'
      );
    });

    it('should preserve original habit instance immutability', () => {
      const originalName = habit.name.getValue();
      const originalUpdatedAt = habit.updatedAt;

      habit.updateName('New Name');

      expect(habit.name.getValue()).toBe(originalName);
      expect(habit.updatedAt).toBe(originalUpdatedAt);
    });
  });

  describe('updateLogo()', () => {
    let habit: Habit;

    beforeEach(() => {
      habit = Habit.create(
        validHabitId,
        validHabitName,
        validHabitType,
        validLogo,
        fixedIsoDate,
        fixedIsoDate
      );
    });

    it('should return new habit instance with updated logo and ISO 8601 updatedAt', () => {
      const newLogo = 'https://example.com/new-logo.png';
      const beforeUpdate = new Date();
      const updatedHabit = habit.updateLogo(newLogo);
      const afterUpdate = new Date();

      expect(updatedHabit).not.toBe(habit); // New instance
      expect(updatedHabit.logo).toBe(newLogo);
      expect(updatedHabit.id).toBe(habit.id);
      expect(updatedHabit.name).toBe(habit.name);
      expect(updatedHabit.habitType).toBe(habit.habitType);
      expect(updatedHabit.createdAt).toBe(habit.createdAt);

      expect(typeof updatedHabit.updatedAt).toBe('string');
      expect(isValidPostgresIsoDate(updatedHabit.updatedAt)).toBe(true);
      const updatedAtDate = new Date(updatedHabit.updatedAt);
      expect(updatedAtDate.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
      expect(updatedAtDate.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
    });

    it('should throw error for invalid new logo', () => {
      expect(() => habit.updateLogo('')).toThrow('Logo must be a non-empty string');
      expect(() => habit.updateLogo(null as any)).toThrow('Logo must be a non-empty string');
    });

    it('should throw error for logo exceeding 2MB size', () => {
      const largeLogo = 'a'.repeat(2 * 1024 * 1024 + 1);
      expect(() => habit.updateLogo(largeLogo)).toThrow('Logo size cannot exceed 2MB');
    });
  });

  describe('deactivate()', () => {
    let habit: Habit;

    beforeEach(() => {
      habit = Habit.create(
        validHabitId,
        validHabitName,
        validHabitType,
        validLogo,
        fixedIsoDate,
        fixedIsoDate
      );
    });

    it('should return new habit instance with isActive set to false and ISO 8601 updatedAt', () => {
      const beforeDeactivation = new Date();
      const deactivatedHabit = habit.deactivate();
      const afterDeactivation = new Date();

      expect(deactivatedHabit).not.toBe(habit); // New instance
      expect(deactivatedHabit.isActive).toBe(false);
      expect(deactivatedHabit.id).toBe(habit.id);
      expect(deactivatedHabit.name).toBe(habit.name);
      expect(deactivatedHabit.habitType).toBe(habit.habitType);
      expect(deactivatedHabit.logo).toBe(habit.logo);
      expect(deactivatedHabit.createdAt).toBe(habit.createdAt);

      expect(typeof deactivatedHabit.updatedAt).toBe('string');
      expect(isValidPostgresIsoDate(deactivatedHabit.updatedAt)).toBe(true);
      const updatedAtDate = new Date(deactivatedHabit.updatedAt);
      expect(updatedAtDate.getTime()).toBeGreaterThanOrEqual(beforeDeactivation.getTime());
      expect(updatedAtDate.getTime()).toBeLessThanOrEqual(afterDeactivation.getTime());

      expect(deactivatedHabit.totalActionsCount).toBe(habit.totalActionsCount);
      expect(deactivatedHabit.lastActionDate).toBe(habit.lastActionDate);
    });

    it('should preserve original habit instance immutability', () => {
      const originalIsActive = habit.isActive;
      const originalUpdatedAt = habit.updatedAt;

      habit.deactivate();

      expect(habit.isActive).toBe(originalIsActive);
      expect(habit.updatedAt).toBe(originalUpdatedAt);
    });
  });


  describe('habit type check methods', () => {
    it('should correctly identify complex habits', () => {
      const complexHabit = Habit.create(
        validHabitId,
        validHabitName,
        HabitComplexity.COMPLEX,
        validLogo
      );

      expect(complexHabit.isComplex()).toBe(true);
      expect(complexHabit.isSimple()).toBe(false);
      expect(complexHabit.isWithoutIntervals()).toBe(false);
    });

    it('should correctly identify simple habits', () => {
      const simpleHabit = Habit.create(
        validHabitId,
        validHabitName,
        HabitComplexity.SIMPLE,
        validLogo
      );

      expect(simpleHabit.isSimple()).toBe(true);
      expect(simpleHabit.isComplex()).toBe(false);
      expect(simpleHabit.isWithoutIntervals()).toBe(false);
    });

    it('should correctly identify without intervals habits', () => {
      const withoutIntervalsHabit = Habit.create(
        validHabitId,
        validHabitName,
        HabitComplexity.WITHOUT_INTERVALS,
        validLogo
      );

      expect(withoutIntervalsHabit.isWithoutIntervals()).toBe(true);
      expect(withoutIntervalsHabit.isComplex()).toBe(false);
      expect(withoutIntervalsHabit.isSimple()).toBe(false);
    });
  });

  describe('equals()', () => {
    it('should return true for habits with same id', () => {
      const habit1 = Habit.create(validHabitId, validHabitName, validHabitType, validLogo);
      const habit2 = Habit.create(
        validHabitId,
        'Different Name',
        HabitComplexity.COMPLEX,
        'different-logo.png'
      );

      expect(habit1.equals(habit2)).toBe(true);
    });

    it('should return false for habits with different ids', () => {
      const habit1 = Habit.create(validHabitId, validHabitName, validHabitType, validLogo);
      const habit2 = Habit.create(
        '987e6543-e21b-34c5-d678-123456789000',
        validHabitName,
        validHabitType,
        validLogo
      );

      expect(habit1.equals(habit2)).toBe(false);
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle habit name at maximum length boundary', () => {
      const maxLengthName = 'a'.repeat(50);
      const habit = Habit.create(validHabitId, maxLengthName, validHabitType, validLogo);

      expect(habit.name.getValue()).toBe(maxLengthName);
    });

    it('should handle habit name at minimum length boundary', () => {
      const minLengthName = 'a';
      const habit = Habit.create(validHabitId, minLengthName, validHabitType, validLogo);

      expect(habit.name.getValue()).toBe(minLengthName);
    });

    it('should handle logo at maximum size boundary', () => {
      const maxSizeLogo = 'a'.repeat(2 * 1024 * 1024); // Exactly 2MB
      const habit = Habit.create(validHabitId, validHabitName, validHabitType, maxSizeLogo);

      expect(habit.logo).toBe(maxSizeLogo);
    });

    it('should handle multiple method calls in sequence', () => {
      const originalHabit = Habit.create(validHabitId, validHabitName, validHabitType, validLogo);

      const updatedHabit = originalHabit
        .updateName('New Name')
        .deactivate();

      expect(updatedHabit.name.getValue()).toBe('New Name');
      expect(updatedHabit.isActive).toBe(false);
      expect(updatedHabit.lastActionDate).toBeNull();

      // Original should remain unchanged
      expect(originalHabit.name.getValue()).toBe(validHabitName);
      expect(originalHabit.totalActionsCount).toBe(0);
      expect(originalHabit.isActive).toBe(true);
      expect(originalHabit.lastActionDate).toBeNull();
    });
  });
});
