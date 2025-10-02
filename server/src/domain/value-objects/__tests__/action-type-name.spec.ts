import { ActionTypeName } from '../action-type-name';

describe('ActionTypeName Value Object (RED PHASE)', () => {
  const validNames = [
    'Push-ups',
    'Morning Run',
    'Evening Meditation',
    'Reading Books',
    'Guitar Practice',
    'Code Review',
    'Daily Journaling',
    'Yoga Session',
    'Language Learning',
    'Healthy Breakfast',
  ];

  const invalidNames = [
    '', // Empty string
    '   ', // Only whitespace
    '\t\n ', // Only whitespace characters
    'A'.repeat(51), // Too long (over 50 characters)
    'X'.repeat(100), // Way too long
  ];

  const validEdgeCaseNames = [
    'A', // Minimum valid length (1 character)
    'A'.repeat(50), // Maximum valid length (50 characters)
    'Push-Ups & Sit-Ups', // With special characters
    'Morning Run (5km)', // With parentheses and numbers
    'Action-2024: Run & Walk (30min)!', // With ASCII special characters
  ];

  describe('ActionTypeName.create()', () => {
    it.each(validNames)('should create ActionTypeName with valid name: "%s"', validName => {
      // ACT
      const actionTypeName = ActionTypeName.create(validName);

      // ASSERT
      expect(actionTypeName).toBeInstanceOf(ActionTypeName);
      expect(actionTypeName.getValue()).toBe(validName.trim());
    });

    it('should trim whitespace from valid names', () => {
      // ARRANGE
      const nameWithWhitespace = '  Morning Exercise  ';
      const expectedName = 'Morning Exercise';

      // ACT
      const actionTypeName = ActionTypeName.create(nameWithWhitespace);

      // ASSERT
      expect(actionTypeName.getValue()).toBe(expectedName);
    });

    it.each(invalidNames)('should throw error for invalid name: "%s"', invalidName => {
      // ACT & ASSERT
      expect(() => ActionTypeName.create(invalidName)).toThrow();
    });

    it('should throw specific error for empty string', () => {
      expect(() => ActionTypeName.create('')).toThrow('ActionType name cannot be empty');
    });

    it('should throw specific error for whitespace-only string', () => {
      expect(() => ActionTypeName.create('   ')).toThrow('ActionType name cannot be empty');
    });

    it('should throw specific error for too long name', () => {
      const longName = 'A'.repeat(51);
      expect(() => ActionTypeName.create(longName)).toThrow(
        'ActionType name cannot exceed 50 characters'
      );
    });

    it('should throw error for null input', () => {
      expect(() => ActionTypeName.create(null as any)).toThrow('ActionType name must be a string');
    });

    it('should throw error for undefined input', () => {
      expect(() => ActionTypeName.create(undefined as any)).toThrow(
        'ActionType name must be a string'
      );
    });

    it('should throw error for non-string input', () => {
      expect(() => ActionTypeName.create(123 as any)).toThrow('ActionType name must be a string');
      expect(() => ActionTypeName.create({} as any)).toThrow('ActionType name must be a string');
      expect(() => ActionTypeName.create([] as any)).toThrow('ActionType name must be a string');
    });

    it.each(validEdgeCaseNames)('should handle valid edge case name: "%s"', edgeCaseName => {
      // ACT & ASSERT
      expect(() => ActionTypeName.create(edgeCaseName)).not.toThrow();
      const actionTypeName = ActionTypeName.create(edgeCaseName);
      expect(actionTypeName.getValue()).toBe(edgeCaseName.trim());
    });

    it('should throw error for names with emoji characters', () => {
      const namesWithEmojis = [
        'Exercise 🏃‍♂️',
        'Reading 📚 time',
        'Water intake 💧',
        'Meditation 🧘‍♀️',
        '🌅 Morning routine',
        'Healthy eating 🥗🍎',
      ];

      namesWithEmojis.forEach(name => {
        expect(() => ActionTypeName.create(name)).toThrow(
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
        expect(() => ActionTypeName.create(name)).toThrow(
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
        'Japanese プッシュアップ',
        'Cyrillic Отжимания',
        'Chinese 你好',
        'Arabic مرحبا',
        'Hebrew פּוּש-אַפּס',
      ];

      namesWithSymbols.forEach(name => {
        expect(() => ActionTypeName.create(name)).toThrow(
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
        expect(() => ActionTypeName.create(name)).toThrow(
          'Names with Unicode characters are not allowed'
        );
      });
    });
  });

  describe('ActionTypeName equality', () => {
    it('should return true for same values', () => {
      // ARRANGE
      const name1 = ActionTypeName.create('Morning Exercise');
      const name2 = ActionTypeName.create('Morning Exercise');

      // ACT & ASSERT
      expect(name1.equals(name2)).toBe(true);
    });

    it('should return true for same values with different whitespace', () => {
      // ARRANGE
      const name1 = ActionTypeName.create('Morning Exercise');
      const name2 = ActionTypeName.create('  Morning Exercise  ');

      // ACT & ASSERT
      expect(name1.equals(name2)).toBe(true);
    });

    it('should return false for different values', () => {
      // ARRANGE
      const name1 = ActionTypeName.create('Morning Exercise');
      const name2 = ActionTypeName.create('Evening Exercise');

      // ACT & ASSERT
      expect(name1.equals(name2)).toBe(false);
    });

    it('should be case-sensitive', () => {
      // ARRANGE
      const name1 = ActionTypeName.create('Morning Exercise');
      const name2 = ActionTypeName.create('morning exercise');

      // ACT & ASSERT
      expect(name1.equals(name2)).toBe(false);
    });

    it('should handle special characters in comparison', () => {
      // ARRANGE
      const name1 = ActionTypeName.create('Push-Ups & Sit-Ups');
      const name2 = ActionTypeName.create('Push-Ups & Sit-Ups');
      const name3 = ActionTypeName.create('Push-Ups and Sit-Ups');

      // ACT & ASSERT
      expect(name1.equals(name2)).toBe(true);
      expect(name1.equals(name3)).toBe(false);
    });
  });

  describe('ActionTypeName immutability', () => {
    it('should be immutable - getValue() should always return same value', () => {
      // ARRANGE
      const originalName = 'Morning Exercise';
      const actionTypeName = ActionTypeName.create(originalName);

      // ACT
      const value1 = actionTypeName.getValue();
      const value2 = actionTypeName.getValue();

      // ASSERT
      expect(value1).toBe(originalName);
      expect(value2).toBe(originalName);
      expect(value1).toBe(value2);
    });

    it('should not allow modification of returned value', () => {
      // ARRANGE
      const actionTypeName = ActionTypeName.create('Morning Exercise');

      // ACT
      const value = actionTypeName.getValue();

      // ASSERT
      // In TypeScript, strings are immutable, but let's verify the reference
      expect(typeof value).toBe('string');
      expect(value).toBe('Morning Exercise');
    });
  });

  describe('ActionTypeName business rules', () => {
    it('should preserve original casing', () => {
      // ARRANGE
      const mixedCaseName = 'MoRnInG ExErCiSe';

      // ACT
      const actionTypeName = ActionTypeName.create(mixedCaseName);

      // ASSERT
      expect(actionTypeName.getValue()).toBe(mixedCaseName);
    });

    it('should preserve spaces and special characters', () => {
      // ARRANGE
      const specialName = 'Morning Exercise - 30min (High Intensity)';

      // ACT
      const actionTypeName = ActionTypeName.create(specialName);

      // ASSERT
      expect(actionTypeName.getValue()).toBe(specialName);
    });

    it('should handle consecutive spaces', () => {
      // ARRANGE
      const nameWithSpaces = 'Morning    Exercise';

      // ACT
      const actionTypeName = ActionTypeName.create(nameWithSpaces);

      // ASSERT
      expect(actionTypeName.getValue()).toBe(nameWithSpaces.trim());
    });
  });

  describe('ActionTypeName validation boundaries', () => {
    it('should accept exactly 1 character', () => {
      // ACT & ASSERT
      expect(() => ActionTypeName.create('A')).not.toThrow();
      const actionTypeName = ActionTypeName.create('A');
      expect(actionTypeName.getValue()).toBe('A');
    });

    it('should accept exactly 50 characters', () => {
      // ARRANGE
      const exactlyFifty = 'A'.repeat(50);

      // ACT & ASSERT
      expect(() => ActionTypeName.create(exactlyFifty)).not.toThrow();
      const actionTypeName = ActionTypeName.create(exactlyFifty);
      expect(actionTypeName.getValue()).toBe(exactlyFifty);
      expect(actionTypeName.getValue()).toHaveLength(50);
    });

    it('should reject exactly 51 characters', () => {
      const exactlyFiftyOne = 'A'.repeat(51);
      expect(() => ActionTypeName.create(exactlyFiftyOne)).toThrow(
        'ActionType name cannot exceed 50 characters'
      );
    });

    it('should validate length after trimming', () => {
      // ARRANGE
      const nameWithPadding = '  A  '; // Still 'A' after trim (valid now)

      // ACT & ASSERT
      expect(() => ActionTypeName.create(nameWithPadding)).not.toThrow();
      const actionTypeName = ActionTypeName.create(nameWithPadding);
      expect(actionTypeName.getValue()).toBe('A');
    });

    it('should accept exactly 50 characters after trimming', () => {
      // ARRANGE
      const name = ` ${'A'.repeat(50)} `;

      // ACT & ASSERT
      expect(() => ActionTypeName.create(name)).not.toThrow();
      const actionTypeName = ActionTypeName.create(name);
      expect(actionTypeName.getValue()).toBe('A'.repeat(50));
      expect(actionTypeName.getValue()).toHaveLength(50);
    });

    it('should reject 51 characters after trimming', () => {
      // ARRANGE
      const name = ` ${'A'.repeat(51)} `;

      // ACT & ASSERT
      expect(() => ActionTypeName.create(name)).toThrow(
        'ActionType name cannot exceed 50 characters'
      );
    });

    it('should reject string that becomes empty after trimming', () => {
      expect(() => ActionTypeName.create('     ')).toThrow('ActionType name cannot be empty');
    });
  });

  describe('ActionTypeName toString() and valueOf()', () => {
    it('should have proper toString() behavior', () => {
      // ARRANGE
      const name = 'Morning Exercise';
      const actionTypeName = ActionTypeName.create(name);

      // ACT & ASSERT
      expect(actionTypeName.toString()).toBe(name);
      expect(String(actionTypeName)).toBe(name);
    });

    it('should have proper valueOf() behavior', () => {
      // ARRANGE
      const name = 'Morning Exercise';
      const actionTypeName = ActionTypeName.create(name);

      // ACT & ASSERT
      expect(actionTypeName.valueOf()).toBe(name);
    });

    it('should work in string concatenation', () => {
      // ARRANGE
      const name = 'Morning Exercise';
      const actionTypeName = ActionTypeName.create(name);

      // ACT
      const concatenated = `Action: ${actionTypeName}`;

      // ASSERT
      expect(concatenated).toBe('Action: Morning Exercise');
    });

    it('should work in template literals', () => {
      // ARRANGE
      const name = 'Morning Exercise';
      const actionTypeName = ActionTypeName.create(name);

      // ACT
      const templated = `Action: ${actionTypeName}`;

      // ASSERT
      expect(templated).toBe('Action: Morning Exercise');
    });
  });

  describe('ActionTypeName serialization', () => {
    it('should serialize to JSON correctly', () => {
      // ARRANGE
      const name = 'Morning Exercise';
      const actionTypeName = ActionTypeName.create(name);

      // ACT
      const serialized = JSON.stringify(actionTypeName);

      // ASSERT
      expect(serialized).toBe(JSON.stringify(name));
    });

    it('should work in object serialization', () => {
      // ARRANGE
      const name = 'Morning Exercise';
      const actionTypeName = ActionTypeName.create(name);
      const obj = { actionType: actionTypeName };

      // ACT
      const serialized = JSON.stringify(obj);

      // ASSERT
      expect(serialized).toBe(JSON.stringify({ actionType: name }));
    });
  });
});
