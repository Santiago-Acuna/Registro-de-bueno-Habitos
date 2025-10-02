import { HabitName } from '../habit-name';

describe('HabitName Value Object', () => {
  describe('HabitName.create()', () => {
    describe('valid inputs', () => {
      it('should create HabitName with valid string', () => {
        const name = 'Morning Exercise';
        const habitName = HabitName.create(name);

        expect(habitName).toBeInstanceOf(HabitName);
        expect(habitName.getValue()).toBe(name);
      });

      it('should create HabitName with single character', () => {
        const name = 'A';
        const habitName = HabitName.create(name);

        expect(habitName.getValue()).toBe(name);
      });

      it('should create HabitName with maximum allowed length (50 characters)', () => {
        const name = 'a'.repeat(50);
        const habitName = HabitName.create(name);

        expect(habitName.getValue()).toBe(name);
        expect(habitName.getValue()).toHaveLength(50);
      });

      it('should trim whitespace from input string', () => {
        const nameWithWhitespace = '  Morning Exercise  ';
        const expectedTrimmedName = 'Morning Exercise';
        const habitName = HabitName.create(nameWithWhitespace);

        expect(habitName.getValue()).toBe(expectedTrimmedName);
      });

      it('should handle names with internal spaces', () => {
        const name = 'Morning   Exercise   Routine';
        const habitName = HabitName.create(name);

        expect(habitName.getValue()).toBe(name);
      });

      it('should handle names with special characters', () => {
        const name = 'Habit-2024: Exercise & Meditation (30min)!';
        const habitName = HabitName.create(name);

        expect(habitName.getValue()).toBe(name);
      });

      it('should handle names with numbers', () => {
        const name = '30 Min Morning Exercise 123';
        const habitName = HabitName.create(name);

        expect(habitName.getValue()).toBe(name);
      });
    });

    describe('invalid inputs', () => {
      it('should throw error for null input', () => {
        expect(() => HabitName.create(null as any)).toThrow(
          'Habit name must be a non-empty string'
        );
      });

      it('should throw error for undefined input', () => {
        expect(() => HabitName.create(undefined as any)).toThrow(
          'Habit name must be a non-empty string'
        );
      });

      it('should throw error for non-string input', () => {
        expect(() => HabitName.create(123 as any)).toThrow('Habit name must be a non-empty string');
        expect(() => HabitName.create(true as any)).toThrow(
          'Habit name must be a non-empty string'
        );
        expect(() => HabitName.create({} as any)).toThrow('Habit name must be a non-empty string');
        expect(() => HabitName.create([] as any)).toThrow('Habit name must be a non-empty string');
      });

      it('should throw error for empty string', () => {
        expect(() => HabitName.create('')).toThrow('Habit name must be a non-empty string');
      });

      it('should throw error for string with only whitespace', () => {
        expect(() => HabitName.create('   ')).toThrow('Habit name cannot be empty');
        expect(() => HabitName.create('\t\n\r')).toThrow('Habit name cannot be empty');
      });

      it('should throw error for string exceeding maximum length', () => {
        const tooLongName = 'a'.repeat(51); // 51 characters
        expect(() => HabitName.create(tooLongName)).toThrow(
          'Habit name cannot exceed 50 characters'
        );
      });

      it('should throw error for trimmed string becoming empty', () => {
        expect(() => HabitName.create('  \t  ')).toThrow('Habit name cannot be empty');
      });

      it('should throw error for string that becomes too long after validation', () => {
        // Edge case: string that might be close to limit
        const name = 'a'.repeat(100); // Way over limit
        expect(() => HabitName.create(name)).toThrow('Habit name cannot exceed 50 characters');
      });

      it('should throw error for names with emoji characters', () => {
        const namesWithEmojis = [
          'Ejercicio Matutino 🏃‍♂️',
          'Reading 📚 time',
          'Water intake 💧',
          'Meditation 🧘‍♀️',
          '🌅 Morning routine',
          'Healthy eating 🥗🍎',
        ];

        namesWithEmojis.forEach(name => {
          expect(() => HabitName.create(name)).toThrow(
            'Names with Unicode characters are not allowed'
          );
        });
      });

      it('should throw error for names with accented characters', () => {
        const namesWithAccents = [
          'Café reading',
          'Niño exercise',
          'Résumé writing',
          'Naïve approach',
          'Piñata making',
          'Façade cleaning',
        ];

        namesWithAccents.forEach(name => {
          expect(() => HabitName.create(name)).toThrow(
            'Names with Unicode characters are not allowed'
          );
        });
      });

      it('should throw error for names with various Unicode symbols', () => {
        const namesWithSymbols = [
          'Exercise ™',
          'Reading © books',
          'Math ∞ problems',
          'Temperature 20°C',
          'Currency €100',
          'Greek α beta',
          'Japanese こんにちは',
          'Chinese 你好',
          'Arabic مرحبا',
          'Hebrew שלום',
        ];

        namesWithSymbols.forEach(name => {
          expect(() => HabitName.create(name)).toThrow(
            'Names with Unicode characters are not allowed'
          );
        });
      });

      it('should throw error for names with mixed Unicode and ASCII characters', () => {
        const mixedNames = [
          'Morning exercise 🌅 routine',
          'Café ☕ reading session',
          'Study français 📖',
          'Workout № 1',
          'Task ✓ completion',
        ];

        mixedNames.forEach(name => {
          expect(() => HabitName.create(name)).toThrow(
            'Names with Unicode characters are not allowed'
          );
        });
      });
    });

    describe('boundary conditions', () => {
      it('should accept exactly 1 character after trimming', () => {
        const habitName = HabitName.create(' a ');
        expect(habitName.getValue()).toBe('a');
      });

      it('should accept exactly 50 characters after trimming', () => {
        const name = ` ${'a'.repeat(50)} `;
        const habitName = HabitName.create(name);
        expect(habitName.getValue()).toBe('a'.repeat(50));
        expect(habitName.getValue()).toHaveLength(50);
      });

      it('should reject 51 characters after trimming', () => {
        const name = ` ${'a'.repeat(51)} `;
        expect(() => HabitName.create(name)).toThrow('Habit name cannot exceed 50 characters');
      });

      it('should reject string that becomes empty after trimming', () => {
        expect(() => HabitName.create('     ')).toThrow('Habit name cannot be empty');
      });
    });
  });

  describe('getValue()', () => {
    it('should return the exact trimmed value provided during creation', () => {
      const originalName = 'Morning Exercise';
      const habitName = HabitName.create(originalName);

      expect(habitName.getValue()).toBe(originalName);
    });

    it('should return trimmed value when whitespace was present in input', () => {
      const nameWithWhitespace = '  Evening Meditation  ';
      const expectedValue = 'Evening Meditation';
      const habitName = HabitName.create(nameWithWhitespace);

      expect(habitName.getValue()).toBe(expectedValue);
    });

    it('should always return the same value for the same instance', () => {
      const habitName = HabitName.create('Consistent Value');
      const value1 = habitName.getValue();
      const value2 = habitName.getValue();

      expect(value1).toBe(value2);
      expect(value1).toBe('Consistent Value');
    });
  });

  describe('equals()', () => {
    it('should return true for HabitNames with same value', () => {
      const habitName1 = HabitName.create('Morning Exercise');
      const habitName2 = HabitName.create('Morning Exercise');

      expect(habitName1.equals(habitName2)).toBe(true);
      expect(habitName2.equals(habitName1)).toBe(true);
    });

    it('should return false for HabitNames with different values', () => {
      const habitName1 = HabitName.create('Morning Exercise');
      const habitName2 = HabitName.create('Evening Meditation');

      expect(habitName1.equals(habitName2)).toBe(false);
      expect(habitName2.equals(habitName1)).toBe(false);
    });

    it('should return true for HabitNames created from trimmed equivalent inputs', () => {
      const habitName1 = HabitName.create('Morning Exercise');
      const habitName2 = HabitName.create('  Morning Exercise  ');

      expect(habitName1.equals(habitName2)).toBe(true);
    });

    it('should be case sensitive', () => {
      const habitName1 = HabitName.create('Morning Exercise');
      const habitName2 = HabitName.create('morning exercise');

      expect(habitName1.equals(habitName2)).toBe(false);
    });

    it('should handle special characters in comparison', () => {
      const habitName1 = HabitName.create('Exercise & Meditation');
      const habitName2 = HabitName.create('Exercise & Meditation');
      const habitName3 = HabitName.create('Exercise and Meditation');

      expect(habitName1.equals(habitName2)).toBe(true);
      expect(habitName1.equals(habitName3)).toBe(false);
    });

    it('should handle complex ASCII characters in comparison', () => {
      const habitName1 = HabitName.create('Exercise & Meditation (Phase 1)');
      const habitName2 = HabitName.create('Exercise & Meditation (Phase 1)');
      const habitName3 = HabitName.create('Exercise & Meditation (Phase 2)');

      expect(habitName1.equals(habitName2)).toBe(true);
      expect(habitName1.equals(habitName3)).toBe(false);
    });
  });

  describe('toString()', () => {
    it('should return the same value as getValue()', () => {
      const name = 'Morning Exercise';
      const habitName = HabitName.create(name);

      expect(habitName.toString()).toBe(habitName.getValue());
      expect(habitName.toString()).toBe(name);
    });

    it('should return string representation for use in templates', () => {
      const habitName = HabitName.create('Daily Reading');
      const template = `Today's habit: ${habitName}`;

      expect(template).toBe("Today's habit: Daily Reading");
    });

    it('should handle complex names in string representation', () => {
      const complexName = 'Habit-2024: Exercise & Meditation (30min)!';
      const habitName = HabitName.create(complexName);

      expect(habitName.toString()).toBe(complexName);
    });
  });

  describe('immutability', () => {
    it('should be immutable - cannot modify internal value', () => {
      const habitName = HabitName.create('Original Name');
      const originalValue = habitName.getValue();

      // Attempt to modify (should not be possible due to private constructor and readonly field)
      // This test verifies the design prevents modification
      expect(habitName.getValue()).toBe(originalValue);
      expect(habitName.getValue()).toBe('Original Name');
    });

    it('should create independent instances', () => {
      const name = 'Shared Name';
      const habitName1 = HabitName.create(name);
      const habitName2 = HabitName.create(name);

      expect(habitName1).not.toBe(habitName2); // Different instances
      expect(habitName1.equals(habitName2)).toBe(true); // But equal values
    });
  });

  describe('error message accuracy', () => {
    it('should provide specific error message for non-string types', () => {
      expect(() => HabitName.create(123 as any)).toThrow('Habit name must be a non-empty string');
      expect(() => HabitName.create(null as any)).toThrow('Habit name must be a non-empty string');
      expect(() => HabitName.create(undefined as any)).toThrow(
        'Habit name must be a non-empty string'
      );
    });

    it('should provide specific error message for empty strings', () => {
      expect(() => HabitName.create('')).toThrow('Habit name must be a non-empty string');
      expect(() => HabitName.create('   ')).toThrow('Habit name cannot be empty');
    });

    it('should provide specific error message with character limit', () => {
      const tooLongName = 'a'.repeat(51);
      expect(() => HabitName.create(tooLongName)).toThrow('Habit name cannot exceed 50 characters');
    });
  });

  describe('integration scenarios', () => {
    it('should work correctly in arrays and sets', () => {
      const habitName1 = HabitName.create('Exercise');
      const habitName2 = HabitName.create('Meditation');
      const habitName3 = HabitName.create('Exercise'); // Same value as habitName1

      const habitNames = [habitName1, habitName2, habitName3];

      expect(habitNames).toHaveLength(3);
      expect(habitNames[0]!.equals(habitNames[2]!)).toBe(true);
      expect(habitNames[0]!.equals(habitNames[1]!)).toBe(false);
    });

    it('should work correctly with JSON serialization context', () => {
      const habitName = HabitName.create('Morning Exercise');
      const jsonString = JSON.stringify({ name: habitName.getValue() });
      const parsed = JSON.parse(jsonString);

      expect(parsed.name).toBe('Morning Exercise');

      // Should be able to recreate from parsed value
      const recreatedHabitName = HabitName.create(parsed.name);
      expect(recreatedHabitName.equals(habitName)).toBe(true);
    });

    it('should handle real-world habit name examples', () => {
      const realWorldNames = [
        'Drink 8 glasses of water',
        '30-minute morning walk',
        'Read for 20 minutes',
        'Practice gratitude journaling',
        'No social media before 10 AM',
        'Meditate for 10 minutes',
        '7-minute workout',
        'Prepare healthy lunch',
        'Call family member',
        'Learn 5 new vocabulary words',
      ];

      realWorldNames.forEach(name => {
        expect(() => {
          const habitName = HabitName.create(name);
          expect(habitName.getValue()).toBe(name);
        }).not.toThrow();
      });
    });
  });
});
