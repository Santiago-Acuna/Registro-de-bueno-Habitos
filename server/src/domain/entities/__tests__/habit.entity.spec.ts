import { HabitComplexity } from '../../shared/types/common';
import { IdentifierIcon } from '../../value-objects/identifier-icon';
import { IdentifierName } from '../../value-objects/identifier-name';
import { GlobalEntityIdentifier } from '../global-entity-identifier.entity';
import { Habit } from '../habit.entity';

describe('Habit Domain Entity', () => {
  const validHabitId = '123e4567-e89b-12d3-a456-426614174000';
  const validGlobalIdentifierId = 'global-id-123e4567-e89b-12d3-a456-426614174000';
  const validHabitName = 'Morning Exercise';
  const validHabitType = HabitComplexity.SIMPLE;
  const validIconUrl = 'https://example.com/logo.png';
  const fixedDate = new Date('2024-01-01T00:00:00.000Z');

  // Helper to create mock GlobalEntityIdentifier
  const createMockGlobalIdentifier = (
    name: string = validHabitName,
    icon: string = validIconUrl
  ): GlobalEntityIdentifier => {
    return new GlobalEntityIdentifier(
      validGlobalIdentifierId,
      IdentifierName.create(name),
      IdentifierIcon.create(icon),
      'habit',
      validHabitId
    );
  };

  describe('Date Object Validation', () => {
    it('should reject invalid Date objects', () => {
      const invalidDate = new Date('invalid-date-string'); // Creates invalid Date
      const globalIdentifier = createMockGlobalIdentifier();
      expect(
        () =>
          new Habit(
            validHabitId,
            validHabitType,
            invalidDate,
            invalidDate,
            true,
            0,
            null,
            globalIdentifier
          )
      ).toThrow('Invalid date: createdAt must be a valid Date object');
    });

    it('should reject null createdAt', () => {
      const globalIdentifier = createMockGlobalIdentifier();
      expect(
        () =>
          new Habit(
            validHabitId,
            validHabitType,
            null as any,
            fixedDate,
            true,
            0,
            null,
            globalIdentifier
          )
      ).toThrow('Invalid date: createdAt must be a Date object');
    });

    it('should reject null updatedAt', () => {
      const globalIdentifier = createMockGlobalIdentifier();
      expect(
        () =>
          new Habit(
            validHabitId,
            validHabitType,
            fixedDate,
            null as any,
            true,
            0,
            null,
            globalIdentifier
          )
      ).toThrow('Invalid date: updatedAt must be a Date object');
    });

    it('should store Date objects correctly', () => {
      const globalIdentifier = createMockGlobalIdentifier();
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

      // These should be stored as Date objects
      expect(habit.createdAt instanceof Date).toBe(true);
      expect(habit.updatedAt instanceof Date).toBe(true);
      expect(habit.createdAt).toEqual(fixedDate);
      expect(habit.updatedAt).toEqual(fixedDate);
    });
  });

  describe('Habit constructor', () => {
    it('should create a new habit with valid Date parameters', () => {
      const globalIdentifier = createMockGlobalIdentifier();
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

      expect(habit.id).toBe(validHabitId);
      expect(habit.globalEntityIdentifier.name.getValue()).toBe(validHabitName);
      expect(habit.globalEntityIdentifier.icon.getValue()).toBe(validIconUrl);
      expect(habit.habitType).toBe(validHabitType);
      expect(habit.createdAt instanceof Date).toBe(true);
      expect(habit.updatedAt instanceof Date).toBe(true);
      expect(habit.createdAt).toEqual(fixedDate);
      expect(habit.updatedAt).toEqual(fixedDate);
      expect(habit.isActive).toBe(true);
      expect(habit.totalActionsCount).toBe(0);
      expect(habit.lastActionDate).toBeNull();
    });

    it('should create a habit with current timestamps', () => {
      const globalIdentifier = createMockGlobalIdentifier();
      const beforeCreation = new Date();
      const currentDate = new Date();
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
      const afterCreation = new Date();

      expect(habit.createdAt instanceof Date).toBe(true);
      expect(habit.updatedAt instanceof Date).toBe(true);

      expect(habit.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(habit.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
      expect(habit.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(habit.updatedAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });

    it('should throw error for invalid habit name in globalEntityIdentifier', () => {
      expect(() => {
        new GlobalEntityIdentifier(
          validGlobalIdentifierId,
          IdentifierName.create(''), // Empty name - will throw
          IdentifierIcon.create(validIconUrl),
          'habit',
          validHabitId
        );
      }).toThrow('Identifier name cannot be empty');

      expect(() => {
        new GlobalEntityIdentifier(
          validGlobalIdentifierId,
          IdentifierName.create('a'.repeat(51)), // Too long - will throw
          IdentifierIcon.create(validIconUrl),
          'habit',
          validHabitId
        );
      }).toThrow('Identifier name cannot exceed 50 characters');
    });

    it('should throw error for invalid icon in globalEntityIdentifier', () => {
      expect(() => {
        new GlobalEntityIdentifier(
          validGlobalIdentifierId,
          IdentifierName.create(validHabitName),
          IdentifierIcon.create(''), // Empty icon - will throw
          'habit',
          validHabitId
        );
      }).toThrow('Identifier icon cannot be empty');

      expect(() => {
        new GlobalEntityIdentifier(
          validGlobalIdentifierId,
          IdentifierName.create(validHabitName),
          IdentifierIcon.create('invalid-url'), // Invalid URL format
          'habit',
          validHabitId
        );
      }).toThrow('Identifier icon must be a valid URL');
    });

    it('should throw error for icon URL exceeding max length', () => {
      const longUrl = `https://example.com/${'a'.repeat(500)}`; // Exceeds 500 char limit
      expect(() => {
        new GlobalEntityIdentifier(
          validGlobalIdentifierId,
          IdentifierName.create(validHabitName),
          IdentifierIcon.create(longUrl),
          'habit',
          validHabitId
        );
      }).toThrow('Identifier icon URL cannot exceed 500 characters');
    });
  });

  describe('Habit constructor - additional tests', () => {
    it('should create habit instance with all parameters including Date objects', () => {
      const globalIdentifier = createMockGlobalIdentifier();
      const lastActionDate = fixedDate;
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

      expect(habit.id).toBe(validHabitId);
      expect(habit.globalEntityIdentifier.name.getValue()).toBe(validHabitName);
      expect(habit.globalEntityIdentifier.icon.getValue()).toBe(validIconUrl);
      expect(habit.habitType).toBe(validHabitType);
      expect(habit.isActive).toBe(true);
      expect(habit.totalActionsCount).toBe(5);

      // Test that lastActionDate is a Date object, not a string
      expect(habit.lastActionDate).toBeInstanceOf(Date);
      expect(habit.lastActionDate).toEqual(lastActionDate);
    });

    it('should create habit instance with null lastActionDate', () => {
      const globalIdentifier = createMockGlobalIdentifier();
      const habit = new Habit(
        validHabitId,
        validHabitType,
        fixedDate,
        fixedDate,
        true,
        5,
        null,
        globalIdentifier
      );

      expect(habit.lastActionDate).toBeNull();
    });

    it('should validate that all Date parameters are proper Date objects', () => {
      const globalIdentifier = createMockGlobalIdentifier();
      const createdAt = fixedDate;
      const updatedAt = fixedDate;
      const lastActionDate = fixedDate;

      const habit = new Habit(
        validHabitId,
        validHabitType,
        createdAt,
        updatedAt,
        true,
        5,
        lastActionDate,
        globalIdentifier
      );

      // Validate that all date properties are Date objects
      expect(habit.createdAt).toBeInstanceOf(Date);
      expect(habit.updatedAt).toBeInstanceOf(Date);
      expect(habit.lastActionDate).toBeInstanceOf(Date);

      // Validate that Date objects have correct values
      expect(habit.createdAt).toEqual(createdAt);
      expect(habit.updatedAt).toEqual(updatedAt);
      expect(habit.lastActionDate).toEqual(lastActionDate);
    });

    it('should throw error for invalid lastActionDate', () => {
      const globalIdentifier = createMockGlobalIdentifier();
      const invalidDate = new Date('invalid-date-string');

      expect(
        () =>
          new Habit(
            validHabitId,
            validHabitType,
            fixedDate,
            fixedDate,
            true,
            5,
            invalidDate,
            globalIdentifier
          )
      ).toThrow('Invalid date: lastActionDate must be a valid Date object');
    });

    it('should validate globalEntityIdentifier is provided', () => {
      expect(
        () =>
          new Habit(
            validHabitId,
            validHabitType,
            fixedDate,
            fixedDate,
            true,
            0,
            null,
            null as any // Invalid null globalEntityIdentifier
          )
      ).toThrow();
    });
  });

  describe('updateName()', () => {
    let habit: Habit;

    beforeEach(() => {
      const globalIdentifier = createMockGlobalIdentifier();
      habit = new Habit(
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

    it('should return new habit instance with updated name', () => {
      const newName = 'Evening Meditation';
      const beforeUpdate = new Date();
      const updatedHabit = habit.updateName(newName);
      const afterUpdate = new Date();

      expect(updatedHabit).not.toBe(habit); // New instance
      expect(updatedHabit.globalEntityIdentifier.name.getValue()).toBe(newName);
      expect(updatedHabit.id).toBe(habit.id);
      expect(updatedHabit.habitType).toBe(habit.habitType);
      expect(updatedHabit.globalEntityIdentifier.icon).toBe(habit.globalEntityIdentifier.icon);
      expect(updatedHabit.createdAt).toBe(habit.createdAt);

      expect(updatedHabit.updatedAt instanceof Date).toBe(true);
      expect(updatedHabit.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
      expect(updatedHabit.updatedAt.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());

      expect(updatedHabit.isActive).toBe(habit.isActive);
      expect(updatedHabit.totalActionsCount).toBe(habit.totalActionsCount);
      expect(updatedHabit.lastActionDate).toBe(habit.lastActionDate);
    });

    it('should throw error for invalid new name', () => {
      expect(() => habit.updateName('')).toThrow('Identifier name cannot be empty');
      expect(() => habit.updateName('a'.repeat(51))).toThrow(
        'Identifier name cannot exceed 50 characters'
      );
    });

    it('should preserve original habit instance immutability', () => {
      const originalName = habit.globalEntityIdentifier.name.getValue();
      const originalUpdatedAt = habit.updatedAt;

      habit.updateName('New Name');

      expect(habit.globalEntityIdentifier.name.getValue()).toBe(originalName);
      expect(habit.updatedAt).toBe(originalUpdatedAt);
    });
  });

  describe('updateIcon()', () => {
    let habit: Habit;

    beforeEach(() => {
      const globalIdentifier = createMockGlobalIdentifier();
      habit = new Habit(
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

    it('should return new habit instance with updated icon and updated timestamp', () => {
      const newIconUrl = 'https://example.com/new-logo.png';
      const beforeUpdate = new Date();
      const updatedHabit = habit.updateIcon(newIconUrl);
      const afterUpdate = new Date();

      expect(updatedHabit).not.toBe(habit); // New instance
      expect(updatedHabit.globalEntityIdentifier.icon.getValue()).toBe(newIconUrl);
      expect(updatedHabit.id).toBe(habit.id);
      expect(updatedHabit.globalEntityIdentifier.name).toBe(habit.globalEntityIdentifier.name);
      expect(updatedHabit.habitType).toBe(habit.habitType);
      expect(updatedHabit.createdAt).toBe(habit.createdAt);

      expect(updatedHabit.updatedAt instanceof Date).toBe(true);
      expect(updatedHabit.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
      expect(updatedHabit.updatedAt.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
    });

    it('should throw error for invalid icon URL', () => {
      // Empty string should throw error
      expect(() => habit.updateIcon('')).toThrow('Identifier icon cannot be empty');

      // Invalid URL format should throw error
      expect(() => habit.updateIcon('invalid-url')).toThrow('Identifier icon must be a valid URL');

      // Null should throw error
      expect(() => habit.updateIcon(null as any)).toThrow('Identifier icon must be a string');
    });

    it('should throw error for icon URL exceeding max length', () => {
      const longUrl = `https://example.com/${'a'.repeat(500)}`;
      expect(() => habit.updateIcon(longUrl)).toThrow(
        'Identifier icon URL cannot exceed 500 characters'
      );
    });
  });

  describe('deactivate()', () => {
    let habit: Habit;

    beforeEach(() => {
      const globalIdentifier = createMockGlobalIdentifier();
      habit = new Habit(
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

    it('should return new habit instance with isActive set to false and updated timestamp', () => {
      const beforeDeactivation = new Date();
      const deactivatedHabit = habit.deactivate();
      const afterDeactivation = new Date();

      expect(deactivatedHabit).not.toBe(habit); // New instance
      expect(deactivatedHabit.isActive).toBe(false);
      expect(deactivatedHabit.id).toBe(habit.id);
      expect(deactivatedHabit.globalEntityIdentifier).toBe(habit.globalEntityIdentifier);
      expect(deactivatedHabit.habitType).toBe(habit.habitType);
      expect(deactivatedHabit.createdAt).toBe(habit.createdAt);

      expect(deactivatedHabit.updatedAt instanceof Date).toBe(true);
      expect(deactivatedHabit.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeDeactivation.getTime()
      );
      expect(deactivatedHabit.updatedAt.getTime()).toBeLessThanOrEqual(afterDeactivation.getTime());

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
      const globalIdentifier = createMockGlobalIdentifier();
      const complexHabit = new Habit(
        validHabitId,
        HabitComplexity.COMPLEX,
        fixedDate,
        fixedDate,
        true,
        0,
        null,
        globalIdentifier
      );

      expect(complexHabit.isComplex()).toBe(true);
      expect(complexHabit.isSimple()).toBe(false);
      expect(complexHabit.isWithoutIntervals()).toBe(false);
    });

    it('should correctly identify simple habits', () => {
      const globalIdentifier = createMockGlobalIdentifier();
      const simpleHabit = new Habit(
        validHabitId,
        HabitComplexity.SIMPLE,
        fixedDate,
        fixedDate,
        true,
        0,
        null,
        globalIdentifier
      );

      expect(simpleHabit.isSimple()).toBe(true);
      expect(simpleHabit.isComplex()).toBe(false);
      expect(simpleHabit.isWithoutIntervals()).toBe(false);
    });

    it('should correctly identify without intervals habits', () => {
      const globalIdentifier = createMockGlobalIdentifier();
      const withoutIntervalsHabit = new Habit(
        validHabitId,
        HabitComplexity.WITHOUT_INTERVALS,
        fixedDate,
        fixedDate,
        true,
        0,
        null,
        globalIdentifier
      );

      expect(withoutIntervalsHabit.isWithoutIntervals()).toBe(true);
      expect(withoutIntervalsHabit.isComplex()).toBe(false);
      expect(withoutIntervalsHabit.isSimple()).toBe(false);
    });
  });

  describe('equals()', () => {
    it('should return true for habits with same id', () => {
      const globalIdentifier1 = createMockGlobalIdentifier();
      const globalIdentifier2 = createMockGlobalIdentifier(
        'Different Name',
        'https://example.com/different.png'
      );

      const habit1 = new Habit(
        validHabitId,
        validHabitType,
        fixedDate,
        fixedDate,
        true,
        0,
        null,
        globalIdentifier1
      );
      const habit2 = new Habit(
        validHabitId,
        HabitComplexity.COMPLEX,
        fixedDate,
        fixedDate,
        true,
        0,
        null,
        globalIdentifier2
      );

      expect(habit1.equals(habit2)).toBe(true);
    });

    it('should return false for habits with different ids', () => {
      const globalIdentifier1 = createMockGlobalIdentifier();
      const globalIdentifier2 = createMockGlobalIdentifier();

      const habit1 = new Habit(
        validHabitId,
        validHabitType,
        fixedDate,
        fixedDate,
        true,
        0,
        null,
        globalIdentifier1
      );
      const habit2 = new Habit(
        '987e6543-e21b-34c5-d678-123456789000',
        validHabitType,
        fixedDate,
        fixedDate,
        true,
        0,
        null,
        globalIdentifier2
      );

      expect(habit1.equals(habit2)).toBe(false);
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle habit name at maximum length boundary', () => {
      const maxLengthName = 'a'.repeat(50);
      const globalIdentifier = createMockGlobalIdentifier(maxLengthName);
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

      expect(habit.globalEntityIdentifier.name.getValue()).toBe(maxLengthName);
    });

    it('should handle habit name at minimum length boundary', () => {
      const minLengthName = 'a';
      const globalIdentifier = createMockGlobalIdentifier(minLengthName);
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

      expect(habit.globalEntityIdentifier.name.getValue()).toBe(minLengthName);
    });

    it('should handle icon URL at maximum length boundary', () => {
      const maxLengthUrl = `https://example.com/${'a'.repeat(470)}.png`; // Exactly 500 chars
      const globalIdentifier = createMockGlobalIdentifier(validHabitName, maxLengthUrl);
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

      expect(habit.globalEntityIdentifier.icon.getValue()).toBe(maxLengthUrl);
    });

    it('should handle multiple method calls in sequence', () => {
      const globalIdentifier = createMockGlobalIdentifier();
      const originalHabit = new Habit(
        validHabitId,
        validHabitType,
        fixedDate,
        fixedDate,
        true,
        0,
        null,
        globalIdentifier
      );

      const updatedHabit = originalHabit.updateName('New Name').deactivate();

      expect(updatedHabit.globalEntityIdentifier.name.getValue()).toBe('New Name');
      expect(updatedHabit.isActive).toBe(false);
      expect(updatedHabit.lastActionDate).toBeNull();

      // Original should remain unchanged
      expect(originalHabit.globalEntityIdentifier.name.getValue()).toBe(validHabitName);
      expect(originalHabit.totalActionsCount).toBe(0);
      expect(originalHabit.isActive).toBe(true);
      expect(originalHabit.lastActionDate).toBeNull();
    });
  });
});
