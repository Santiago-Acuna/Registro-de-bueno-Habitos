import { IdentifierName } from '../identifier-name';

describe('IdentifierName Value Object (RED PHASE)', () => {
  const validNames = [
    'User',
    'Product',
    'Category',
    'Item',
    'Resource',
    'Element',
    'Component',
    'Module',
    'Service',
    'Handler',
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
    'Action-Type-123', // With hyphens and numbers
    'User_Profile_Data', // With underscores
    'Type-2024: Main (v1.0)!', // With ASCII special characters
  ];

  describe('IdentifierName.create()', () => {
    it.each(validNames)('should create IdentifierName with valid name: "%s"', validName => {
      // ACT
      const identifierName = IdentifierName.create(validName);

      // ASSERT
      expect(identifierName).toBeInstanceOf(IdentifierName);
      expect(identifierName.getValue()).toBe(validName.trim());
    });

    it('should trim whitespace from valid names', () => {
      // ARRANGE
      const nameWithWhitespace = '  Product Category  ';
      const expectedName = 'Product Category';

      // ACT
      const identifierName = IdentifierName.create(nameWithWhitespace);

      // ASSERT
      expect(identifierName.getValue()).toBe(expectedName);
    });

    it.each(invalidNames)('should throw error for invalid name: "%s"', invalidName => {
      // ACT & ASSERT
      expect(() => IdentifierName.create(invalidName)).toThrow();
    });

    it('should throw specific error for empty string', () => {
      expect(() => IdentifierName.create('')).toThrow('Identifier name cannot be empty');
    });

    it('should throw specific error for whitespace-only string', () => {
      expect(() => IdentifierName.create('   ')).toThrow('Identifier name cannot be empty');
    });

    it('should throw specific error for too long name', () => {
      const longName = 'A'.repeat(51);
      expect(() => IdentifierName.create(longName)).toThrow(
        'Identifier name cannot exceed 50 characters'
      );
    });

    it('should throw error for null input', () => {
      expect(() => IdentifierName.create(null as any)).toThrow('Identifier name must be a string');
    });

    it('should throw error for undefined input', () => {
      expect(() => IdentifierName.create(undefined as any)).toThrow(
        'Identifier name must be a string'
      );
    });

    it('should throw error for non-string input', () => {
      expect(() => IdentifierName.create(123 as any)).toThrow('Identifier name must be a string');
      expect(() => IdentifierName.create({} as any)).toThrow('Identifier name must be a string');
      expect(() => IdentifierName.create([] as any)).toThrow('Identifier name must be a string');
    });

    it.each(validEdgeCaseNames)('should handle valid edge case name: "%s"', edgeCaseName => {
      // ACT & ASSERT
      expect(() => IdentifierName.create(edgeCaseName)).not.toThrow();
      const identifierName = IdentifierName.create(edgeCaseName);
      expect(identifierName.getValue()).toBe(edgeCaseName.trim());
    });

    it('should throw error for names with emoji characters', () => {
      const namesWithEmojis = [
        'User 👤',
        'Product 📦 item',
        'Category 🏷️',
        'Resource 📁',
        '🎯 Target',
        'Item 🛒🎁',
      ];

      namesWithEmojis.forEach(name => {
        expect(() => IdentifierName.create(name)).toThrow(
          'Names with Unicode characters are not allowed'
        );
      });
    });

    it('should allow names with Spanish accented vowels (á, é, í, ó, ú)', () => {
      const namesWithSpanishAccents = [
        'Categoría Principal',
        'Módulo de Gestión',
        'Sección Pública',
        'Área de Trabajo',
        'Información General',
        'Función Básica',
      ];

      namesWithSpanishAccents.forEach(name => {
        expect(() => IdentifierName.create(name)).not.toThrow();
        const identifierName = IdentifierName.create(name);
        expect(identifierName.getValue()).toBe(name.trim());
      });
    });

    it('should allow names with Spanish uppercase accented vowels (Á, É, Í, Ó, Ú)', () => {
      const namesWithUppercaseAccents = [
        'ÁREA PRINCIPAL',
        'MÓDULO ÁGIL',
        'SECCIÓN ÚNICA',
        'CATEGORÍA ESPECÍFICA',
        'INFORMACIÓN',
      ];

      namesWithUppercaseAccents.forEach(name => {
        expect(() => IdentifierName.create(name)).not.toThrow();
        const identifierName = IdentifierName.create(name);
        expect(identifierName.getValue()).toBe(name.trim());
      });
    });

    it('should allow names with Spanish special characters (ñ, Ñ, ü, Ü)', () => {
      const namesWithSpanishSpecialChars = [
        'Diseño Modular',
        'Año Nuevo',
        'Niño Feliz',
        'Pingüino Digital',
        'Müller Account',
        'ESPAÑA Technology',
        'ÑANDÚ System',
      ];

      namesWithSpanishSpecialChars.forEach(name => {
        expect(() => IdentifierName.create(name)).not.toThrow();
        const identifierName = IdentifierName.create(name);
        expect(identifierName.getValue()).toBe(name.trim());
      });
    });

    it('should allow mixed Spanish characters with regular ASCII', () => {
      const mixedNames = [
        'Categoría-123',
        'Módulo_Principal',
        'Sección (Español)',
        'Año-2024: Versión 1.0',
        'Información & Datos',
        'Niño-Product-Type',
        'Gestión Ágil: Módulo #1',
      ];

      mixedNames.forEach(name => {
        expect(() => IdentifierName.create(name)).not.toThrow();
        const identifierName = IdentifierName.create(name);
        expect(identifierName.getValue()).toBe(name.trim());
      });
    });

    it('should allow all Spanish vowels with accents in a single name', () => {
      const allSpanishVowels = 'Sección Única Información Módulo Área';

      expect(() => IdentifierName.create(allSpanishVowels)).not.toThrow();
      const identifierName = IdentifierName.create(allSpanishVowels);
      expect(identifierName.getValue()).toBe(allSpanishVowels);
    });

    it('should preserve Spanish character casing', () => {
      const mixedCaseSpanish = [
        'Categoría',
        'CATEGORÍA',
        'categoría',
        'Niño',
        'NIÑO',
        'niño',
        'Pingüino',
        'PINGÜINO',
      ];

      mixedCaseSpanish.forEach(name => {
        const identifierName = IdentifierName.create(name);
        expect(identifierName.getValue()).toBe(name);
      });
    });

    it('should throw error for names with non-Spanish accented characters', () => {
      const namesWithNonSpanishAccents = [
        'Naïve implementation', // French ï
        'Façade pattern', // French ç
        'Straße address', // German ß
        'Øresund bridge', // Nordic ø
        'Łódź city', // Polish ł
      ];

      namesWithNonSpanishAccents.forEach(name => {
        expect(() => IdentifierName.create(name)).toThrow(
          'Names with Unicode characters are not allowed'
        );
      });
    });

    it('should throw error for names with various Unicode symbols', () => {
      const namesWithSymbols = [
        'Product ™',
        'Category © item',
        'Math ∞ type',
        'Temperature 20°C',
        'Currency €100',
        'Greek α beta',
        'Japanese カテゴリー',
        'Cyrillic Категория',
        'Chinese 类别',
        'Arabic فئة',
        'Hebrew קטגוריה',
      ];

      namesWithSymbols.forEach(name => {
        expect(() => IdentifierName.create(name)).toThrow(
          'Names with Unicode characters are not allowed'
        );
      });
    });

    it('should throw error for names with mixed Unicode and ASCII characters', () => {
      const mixedNames = [
        'Product 🏷️ category',
        'Café ☕ type',
        'Item français 📖',
        'Type № 1',
        'Category ✓ verified',
      ];

      mixedNames.forEach(name => {
        expect(() => IdentifierName.create(name)).toThrow(
          'Names with Unicode characters are not allowed'
        );
      });
    });
  });

  describe('IdentifierName equality', () => {
    it('should return true for same values', () => {
      // ARRANGE
      const name1 = IdentifierName.create('Product Category');
      const name2 = IdentifierName.create('Product Category');

      // ACT & ASSERT
      expect(name1.equals(name2)).toBe(true);
    });

    it('should return true for same Spanish values', () => {
      // ARRANGE
      const name1 = IdentifierName.create('Categoría Principal');
      const name2 = IdentifierName.create('Categoría Principal');

      // ACT & ASSERT
      expect(name1.equals(name2)).toBe(true);
    });

    it('should be case-sensitive with Spanish characters', () => {
      // ARRANGE
      const name1 = IdentifierName.create('Categoría');
      const name2 = IdentifierName.create('categoría');
      const name3 = IdentifierName.create('CATEGORÍA');

      // ACT & ASSERT
      expect(name1.equals(name2)).toBe(false);
      expect(name1.equals(name3)).toBe(false);
      expect(name2.equals(name3)).toBe(false);
    });

    it('should distinguish between accented and non-accented characters', () => {
      // ARRANGE
      const name1 = IdentifierName.create('Categoria');
      const name2 = IdentifierName.create('Categoría');

      // ACT & ASSERT
      expect(name1.equals(name2)).toBe(false);
    });

    it('should handle Spanish special characters in comparison', () => {
      // ARRANGE
      const name1 = IdentifierName.create('Diseño Modular');
      const name2 = IdentifierName.create('Diseño Modular');
      const name3 = IdentifierName.create('Diseno Modular');

      // ACT & ASSERT
      expect(name1.equals(name2)).toBe(true);
      expect(name1.equals(name3)).toBe(false);
    });

    it('should return true for same values with different whitespace', () => {
      // ARRANGE
      const name1 = IdentifierName.create('Product Category');
      const name2 = IdentifierName.create('  Product Category  ');

      // ACT & ASSERT
      expect(name1.equals(name2)).toBe(true);
    });

    it('should return false for different values', () => {
      // ARRANGE
      const name1 = IdentifierName.create('Product Category');
      const name2 = IdentifierName.create('User Profile');

      // ACT & ASSERT
      expect(name1.equals(name2)).toBe(false);
    });

    it('should be case-sensitive', () => {
      // ARRANGE
      const name1 = IdentifierName.create('Product Category');
      const name2 = IdentifierName.create('product category');

      // ACT & ASSERT
      expect(name1.equals(name2)).toBe(false);
    });

    it('should handle special characters in comparison', () => {
      // ARRANGE
      const name1 = IdentifierName.create('User-Profile & Data');
      const name2 = IdentifierName.create('User-Profile & Data');
      const name3 = IdentifierName.create('User-Profile and Data');

      // ACT & ASSERT
      expect(name1.equals(name2)).toBe(true);
      expect(name1.equals(name3)).toBe(false);
    });

    it('should return true when comparing same instance', () => {
      // ARRANGE
      const name = IdentifierName.create('Product Category');

      // ACT & ASSERT
      expect(name.equals(name)).toBe(true);
    });

    it('should handle null comparison', () => {
      // ARRANGE
      const name = IdentifierName.create('Product Category');

      // ACT & ASSERT
      expect(name.equals(null as any)).toBe(false);
    });

    it('should handle undefined comparison', () => {
      // ARRANGE
      const name = IdentifierName.create('Product Category');

      // ACT & ASSERT
      expect(name.equals(undefined as any)).toBe(false);
    });
  });

  describe('IdentifierName immutability', () => {
    it('should be immutable - getValue() should always return same value', () => {
      // ARRANGE
      const originalName = 'Product Category';
      const identifierName = IdentifierName.create(originalName);

      // ACT
      const value1 = identifierName.getValue();
      const value2 = identifierName.getValue();

      // ASSERT
      expect(value1).toBe(originalName);
      expect(value2).toBe(originalName);
      expect(value1).toBe(value2);
    });

    it('should not allow modification of returned value', () => {
      // ARRANGE
      const identifierName = IdentifierName.create('Product Category');

      // ACT
      const value = identifierName.getValue();

      // ASSERT
      // In TypeScript, strings are immutable, but let's verify the reference
      expect(typeof value).toBe('string');
      expect(value).toBe('Product Category');
    });

    it('should prevent external mutation attempts', () => {
      // ARRANGE
      const identifierName = IdentifierName.create('Original Name');
      const value1 = identifierName.getValue();

      // ACT
      // Attempt to modify (this would fail at compile time, but test runtime)
      const modifiedAttempt = value1.toUpperCase();

      // ASSERT
      expect(identifierName.getValue()).toBe('Original Name');
      expect(identifierName.getValue()).not.toBe(modifiedAttempt);
    });
  });

  describe('IdentifierName business rules', () => {
    it('should preserve original casing', () => {
      // ARRANGE
      const mixedCaseName = 'PrOdUcT CaTeGoRy';

      // ACT
      const identifierName = IdentifierName.create(mixedCaseName);

      // ASSERT
      expect(identifierName.getValue()).toBe(mixedCaseName);
    });

    it('should preserve spaces and special characters', () => {
      // ARRANGE
      const specialName = 'Product Category - Type 1 (Main)';

      // ACT
      const identifierName = IdentifierName.create(specialName);

      // ASSERT
      expect(identifierName.getValue()).toBe(specialName);
    });

    it('should handle consecutive spaces', () => {
      // ARRANGE
      const nameWithSpaces = 'Product    Category';

      // ACT
      const identifierName = IdentifierName.create(nameWithSpaces);

      // ASSERT
      expect(identifierName.getValue()).toBe(nameWithSpaces.trim());
    });

    it('should preserve numbers in names', () => {
      // ARRANGE
      const nameWithNumbers = 'Product123 Category456';

      // ACT
      const identifierName = IdentifierName.create(nameWithNumbers);

      // ASSERT
      expect(identifierName.getValue()).toBe(nameWithNumbers);
    });

    it('should preserve ASCII special characters', () => {
      // ARRANGE
      const specialChars = 'Type-A_B!@#$%^&*()+={}[]|:;<>,.?/~`';

      // ACT & ASSERT
      expect(() => IdentifierName.create(specialChars)).not.toThrow();
      const identifierName = IdentifierName.create(specialChars);
      expect(identifierName.getValue()).toBe(specialChars);
    });
  });

  describe('IdentifierName validation boundaries', () => {
    it('should accept exactly 1 character', () => {
      // ACT & ASSERT
      expect(() => IdentifierName.create('A')).not.toThrow();
      const identifierName = IdentifierName.create('A');
      expect(identifierName.getValue()).toBe('A');
    });

    it('should accept single Spanish characters', () => {
      const singleSpanishChars = [
        'á',
        'é',
        'í',
        'ó',
        'ú',
        'Á',
        'É',
        'Í',
        'Ó',
        'Ú',
        'ñ',
        'Ñ',
        'ü',
        'Ü',
      ];

      singleSpanishChars.forEach(char => {
        expect(() => IdentifierName.create(char)).not.toThrow();
        const identifierName = IdentifierName.create(char);
        expect(identifierName.getValue()).toBe(char);
      });
    });

    it('should accept exactly 50 characters', () => {
      // ARRANGE
      const exactlyFifty = 'A'.repeat(50);

      // ACT & ASSERT
      expect(() => IdentifierName.create(exactlyFifty)).not.toThrow();
      const identifierName = IdentifierName.create(exactlyFifty);
      expect(identifierName.getValue()).toBe(exactlyFifty);
      expect(identifierName.getValue()).toHaveLength(50);
    });

    it('should accept exactly 50 characters with Spanish letters', () => {
      // ARRANGE
      const fiftyWithSpanish = 'Categoría Principal Módulo Información Española Ab'; // 50 chars

      // ACT & ASSERT
      expect(fiftyWithSpanish).toHaveLength(50);
      expect(() => IdentifierName.create(fiftyWithSpanish)).not.toThrow();
      const identifierName = IdentifierName.create(fiftyWithSpanish);
      expect(identifierName.getValue()).toBe(fiftyWithSpanish);
      expect(identifierName.getValue()).toHaveLength(50);
    });

    it('should count Spanish characters correctly for length validation', () => {
      // ARRANGE - Each Spanish character should count as 1 character
      const spanishName = 'áéíóúñü'; // 7 characters

      // ACT & ASSERT
      expect(spanishName).toHaveLength(7);
      expect(() => IdentifierName.create(spanishName)).not.toThrow();
      const identifierName = IdentifierName.create(spanishName);
      expect(identifierName.getValue()).toHaveLength(7);
    });

    it('should reject exactly 51 characters', () => {
      const exactlyFiftyOne = 'A'.repeat(51);
      expect(() => IdentifierName.create(exactlyFiftyOne)).toThrow(
        'Identifier name cannot exceed 50 characters'
      );
    });

    it('should reject 51 characters with Spanish letters', () => {
      // ARRANGE
      const fiftyOneWithSpanish = 'Categoría Principal Módulo Información Española ABC'; // 51 chars

      // ACT & ASSERT
      expect(fiftyOneWithSpanish).toHaveLength(51);
      expect(() => IdentifierName.create(fiftyOneWithSpanish)).toThrow(
        'Identifier name cannot exceed 50 characters'
      );
    });

    it('should validate length after trimming', () => {
      // ARRANGE
      const nameWithPadding = '  A  '; // Still 'A' after trim (valid)

      // ACT & ASSERT
      expect(() => IdentifierName.create(nameWithPadding)).not.toThrow();
      const identifierName = IdentifierName.create(nameWithPadding);
      expect(identifierName.getValue()).toBe('A');
    });

    it('should accept exactly 50 characters after trimming', () => {
      // ARRANGE
      const name = ` ${'A'.repeat(50)} `;

      // ACT & ASSERT
      expect(() => IdentifierName.create(name)).not.toThrow();
      const identifierName = IdentifierName.create(name);
      expect(identifierName.getValue()).toBe('A'.repeat(50));
      expect(identifierName.getValue()).toHaveLength(50);
    });

    it('should reject 51 characters after trimming', () => {
      // ARRANGE
      const name = ` ${'A'.repeat(51)} `;

      // ACT & ASSERT
      expect(() => IdentifierName.create(name)).toThrow(
        'Identifier name cannot exceed 50 characters'
      );
    });

    it('should reject string that becomes empty after trimming', () => {
      expect(() => IdentifierName.create('     ')).toThrow('Identifier name cannot be empty');
    });

    it('should reject names with 100 characters', () => {
      const longName = 'A'.repeat(100);
      expect(() => IdentifierName.create(longName)).toThrow(
        'Identifier name cannot exceed 50 characters'
      );
    });

    it('should reject names with 500 characters', () => {
      const veryLongName = 'A'.repeat(500);
      expect(() => IdentifierName.create(veryLongName)).toThrow(
        'Identifier name cannot exceed 50 characters'
      );
    });
  });

  describe('IdentifierName toString() and valueOf()', () => {
    it('should have proper toString() behavior', () => {
      // ARRANGE
      const name = 'Product Category';
      const identifierName = IdentifierName.create(name);

      // ACT & ASSERT
      expect(identifierName.toString()).toBe(name);
      expect(String(identifierName)).toBe(name);
    });

    it('should have proper valueOf() behavior', () => {
      // ARRANGE
      const name = 'Product Category';
      const identifierName = IdentifierName.create(name);

      // ACT & ASSERT
      expect(identifierName.valueOf()).toBe(name);
    });

    it('should work in string concatenation', () => {
      // ARRANGE
      const name = 'Product Category';
      const identifierName = IdentifierName.create(name);

      // ACT
      const concatenated = `Identifier: ${identifierName}`;

      // ASSERT
      expect(concatenated).toBe('Identifier: Product Category');
    });

    it('should work in template literals', () => {
      // ARRANGE
      const name = 'Product Category';
      const identifierName = IdentifierName.create(name);

      // ACT
      const templated = `Identifier: ${identifierName}`;

      // ASSERT
      expect(templated).toBe('Identifier: Product Category');
    });

    it('should work with String constructor', () => {
      // ARRANGE
      const name = 'Product Category';
      const identifierName = IdentifierName.create(name);

      // ACT
      const stringified = String(identifierName);

      // ASSERT
      expect(stringified).toBe(name);
    });
  });

  describe('IdentifierName serialization', () => {
    it('should serialize to JSON correctly', () => {
      // ARRANGE
      const name = 'Product Category';
      const identifierName = IdentifierName.create(name);

      // ACT
      const serialized = JSON.stringify(identifierName);

      // ASSERT
      expect(serialized).toBe(JSON.stringify(name));
    });

    it('should serialize Spanish characters to JSON correctly', () => {
      // ARRANGE
      const spanishName = 'Categoría Principal';
      const identifierName = IdentifierName.create(spanishName);

      // ACT
      const serialized = JSON.stringify(identifierName);
      const deserialized = JSON.parse(serialized);

      // ASSERT
      expect(serialized).toBe(JSON.stringify(spanishName));
      expect(deserialized).toBe(spanishName);
    });

    it('should serialize Spanish special characters to JSON correctly', () => {
      // ARRANGE
      const specialSpanish = 'Diseño Niño Pingüino';
      const identifierName = IdentifierName.create(specialSpanish);

      // ACT
      const serialized = JSON.stringify(identifierName);
      const deserialized = JSON.parse(serialized);

      // ASSERT
      expect(deserialized).toBe(specialSpanish);
      expect(deserialized).toContain('ñ');
      expect(deserialized).toContain('ü');
    });

    it('should work in object serialization', () => {
      // ARRANGE
      const name = 'Product Category';
      const identifierName = IdentifierName.create(name);
      const obj = { identifier: identifierName };

      // ACT
      const serialized = JSON.stringify(obj);

      // ASSERT
      expect(serialized).toBe(JSON.stringify({ identifier: name }));
    });

    it('should work in array serialization', () => {
      // ARRANGE
      const name1 = IdentifierName.create('Category1');
      const name2 = IdentifierName.create('Category2');
      const arr = [name1, name2];

      // ACT
      const serialized = JSON.stringify(arr);

      // ASSERT
      expect(serialized).toBe(JSON.stringify(['Category1', 'Category2']));
    });

    it('should work in nested object serialization', () => {
      // ARRANGE
      const identifierName = IdentifierName.create('Product');
      const obj = {
        meta: {
          identifier: identifierName,
          description: 'Test',
        },
      };

      // ACT
      const serialized = JSON.stringify(obj);

      // ASSERT
      expect(serialized).toBe(
        JSON.stringify({
          meta: {
            identifier: 'Product',
            description: 'Test',
          },
        })
      );
    });
  });

  describe('IdentifierName Spanish character validation edge cases', () => {
    it('should handle consecutive Spanish accented characters', () => {
      // ARRANGE
      const consecutiveAccents = 'áéíóúñü';

      // ACT & ASSERT
      expect(() => IdentifierName.create(consecutiveAccents)).not.toThrow();
      const identifierName = IdentifierName.create(consecutiveAccents);
      expect(identifierName.getValue()).toBe(consecutiveAccents);
    });

    it('should handle Spanish characters at the start of name', () => {
      const names = ['Ñandú System', 'Ángel Product', 'Únicamente Valid'];

      names.forEach(name => {
        expect(() => IdentifierName.create(name)).not.toThrow();
        const identifierName = IdentifierName.create(name);
        expect(identifierName.getValue()).toBe(name);
      });
    });

    it('should handle Spanish characters at the end of name', () => {
      const names = ['System Españ', 'Product Niñ', 'Valid Información'];

      names.forEach(name => {
        expect(() => IdentifierName.create(name)).not.toThrow();
        const identifierName = IdentifierName.create(name);
        expect(identifierName.getValue()).toBe(name);
      });
    });

    it('should handle Spanish characters with numbers', () => {
      const names = ['Categoría123', '2024Año', 'Módulo-01', 'Versión 2.0 Información', '99 Niños'];

      names.forEach(name => {
        expect(() => IdentifierName.create(name)).not.toThrow();
        const identifierName = IdentifierName.create(name);
        expect(identifierName.getValue()).toBe(name);
      });
    });

    it('should handle Spanish characters with hyphens', () => {
      const names = ['Categoría-Principal', 'Módulo-Gestión', 'Diseño-Avanzado', 'Año-Nuevo'];

      names.forEach(name => {
        expect(() => IdentifierName.create(name)).not.toThrow();
        const identifierName = IdentifierName.create(name);
        expect(identifierName.getValue()).toBe(name);
      });
    });

    it('should handle Spanish characters with underscores', () => {
      const names = ['Categoría_Principal', 'Módulo_Gestión', 'Información_Básica', 'Año_Fiscal'];

      names.forEach(name => {
        expect(() => IdentifierName.create(name)).not.toThrow();
        const identifierName = IdentifierName.create(name);
        expect(identifierName.getValue()).toBe(name);
      });
    });

    it('should handle Spanish characters with parentheses', () => {
      const names = [
        'Categoría (Principal)',
        'Módulo (Gestión Avanzada)',
        '(Información) Básica',
        'Año Nuevo (2024)',
      ];

      names.forEach(name => {
        expect(() => IdentifierName.create(name)).not.toThrow();
        const identifierName = IdentifierName.create(name);
        expect(identifierName.getValue()).toBe(name);
      });
    });

    it('should trim whitespace from Spanish names', () => {
      // ARRANGE
      const nameWithWhitespace = '  Categoría Principal  ';
      const expectedName = 'Categoría Principal';

      // ACT
      const identifierName = IdentifierName.create(nameWithWhitespace);

      // ASSERT
      expect(identifierName.getValue()).toBe(expectedName);
    });

    it('should handle multiple words with Spanish characters', () => {
      const names = [
        'Gestión de Información',
        'Módulo Principal de Diseño',
        'Año Nuevo Español',
        'Sección Única para Niños',
      ];

      names.forEach(name => {
        expect(() => IdentifierName.create(name)).not.toThrow();
        const identifierName = IdentifierName.create(name);
        expect(identifierName.getValue()).toBe(name);
      });
    });

    it('should allow combination of all Spanish special characters', () => {
      const allSpanishSpecial = 'Año Niño Pingüino Información Módulo Sección';

      expect(() => IdentifierName.create(allSpanishSpecial)).not.toThrow();
      const identifierName = IdentifierName.create(allSpanishSpecial);
      expect(identifierName.getValue()).toBe(allSpanishSpecial);
    });
  });

  describe('IdentifierName ASCII validation', () => {
    it('should accept all ASCII letters (a-z, A-Z)', () => {
      // ARRANGE - Use exactly 50 characters (25 lowercase + 25 uppercase)
      const asciiLetters = 'abcdefghijklmnopqrstuvwxyABCDEFGHIJKLMNOPQRSTUVWXY';

      // ACT & ASSERT
      expect(() => IdentifierName.create(asciiLetters)).not.toThrow();
      const identifierName = IdentifierName.create(asciiLetters);
      expect(identifierName.getValue()).toBe(asciiLetters);
    });

    it('should accept all ASCII digits (0-9)', () => {
      // ARRANGE
      const asciiDigits = '0123456789';

      // ACT & ASSERT
      expect(() => IdentifierName.create(asciiDigits)).not.toThrow();
      const identifierName = IdentifierName.create(asciiDigits);
      expect(identifierName.getValue()).toBe(asciiDigits);
    });

    it('should accept all ASCII special characters', () => {
      // ARRANGE
      const asciiSpecial = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

      // ACT & ASSERT
      expect(() => IdentifierName.create(asciiSpecial)).not.toThrow();
      const identifierName = IdentifierName.create(asciiSpecial);
      expect(identifierName.getValue()).toBe(asciiSpecial);
    });

    it('should accept ASCII space character', () => {
      // ARRANGE
      const nameWithSpace = 'Product Category';

      // ACT & ASSERT
      expect(() => IdentifierName.create(nameWithSpace)).not.toThrow();
      const identifierName = IdentifierName.create(nameWithSpace);
      expect(identifierName.getValue()).toBe(nameWithSpace);
    });

    it('should reject Latin-1 Supplement characters (0x80-0xFF)', () => {
      const latin1Chars = [
        'Name with © copyright',
        'Product ® registered',
        'Currency £ symbol',
        'Degree 90° angle',
        'Division ÷ sign',
      ];

      latin1Chars.forEach(name => {
        expect(() => IdentifierName.create(name)).toThrow(
          'Names with Unicode characters are not allowed'
        );
      });
    });
  });
});
