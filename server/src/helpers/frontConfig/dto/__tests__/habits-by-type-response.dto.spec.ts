import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { HabitsByTypeResponseDto } from '../habits-by-type-response.dto';

describe('HabitsByTypeResponseDto', () => {
  describe('structure validation', () => {
    it('should be defined', () => {
      expect(HabitsByTypeResponseDto).toBeDefined();
    });

    it('should validate a properly structured response', async () => {
      // Arrange
      const validDto = {
        complex: [
          {
            Programming: ['for work', 'personal Project'],
            'Learn english': [],
          },
        ],
        simple: [
          {
            'Morning Exercise': ['Cardio'],
          },
        ],
        withoutintervals: [
          {
            'Daily Meditation': [],
          },
        ],
      };

      const dto = plainToClass(HabitsByTypeResponseDto, validDto);

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should validate empty response structure', async () => {
      // Arrange
      const emptyDto = {
        complex: [],
        simple: [],
        withoutintervals: [],
      };

      const dto = plainToClass(HabitsByTypeResponseDto, emptyDto);

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should have complex property', () => {
      // Arrange
      const dto = new HabitsByTypeResponseDto();

      // Assert
      expect(dto).toHaveProperty('complex');
    });

    it('should have simple property', () => {
      // Arrange
      const dto = new HabitsByTypeResponseDto();

      // Assert
      expect(dto).toHaveProperty('simple');
    });

    it('should have withoutintervals property', () => {
      // Arrange
      const dto = new HabitsByTypeResponseDto();

      // Assert
      expect(dto).toHaveProperty('withoutintervals');
    });
  });

  describe('Swagger/OpenAPI documentation', () => {
    it('should have ApiProperty decorators for all fields', () => {
      // This test verifies that Swagger documentation is properly set up
      const complexMetadata = Reflect.getMetadata(
        'swagger/apiModelProperties',
        HabitsByTypeResponseDto.prototype,
        'complex'
      );
      const simpleMetadata = Reflect.getMetadata(
        'swagger/apiModelProperties',
        HabitsByTypeResponseDto.prototype,
        'simple'
      );
      const withoutintervalsMetadata = Reflect.getMetadata(
        'swagger/apiModelProperties',
        HabitsByTypeResponseDto.prototype,
        'withoutintervals'
      );

      expect(complexMetadata).toBeDefined();
      expect(simpleMetadata).toBeDefined();
      expect(withoutintervalsMetadata).toBeDefined();
    });
  });

  describe('data structure', () => {
    it('should accept objects with habit names as keys and action type arrays as values', () => {
      // Arrange
      const dto = new HabitsByTypeResponseDto();
      dto.complex = [
        {
          Programming: ['for work', 'personal Project'],
        },
      ];

      // Assert
      expect(dto.complex[0]!['Programming']).toEqual(['for work', 'personal Project']);
    });

    it('should accept empty action type arrays', () => {
      // Arrange
      const dto = new HabitsByTypeResponseDto();
      dto.complex = [
        {
          'Learn english': [],
        },
      ];

      // Assert
      expect(dto.complex[0]!['Learn english']).toEqual([]);
    });

    it('should accept multiple habits in a single category', () => {
      // Arrange
      const dto = new HabitsByTypeResponseDto();
      dto.complex = [
        {
          Programming: ['for work', 'personal Project'],
          'Learn english': ['Reading', 'Listening'],
          Cooking: [],
        },
      ];

      // Assert
      expect(Object.keys(dto.complex[0]!)).toHaveLength(3);
    });

    it('should accept habits across all three categories', () => {
      // Arrange
      const dto = new HabitsByTypeResponseDto();
      dto.complex = [{ Programming: ['work'] }];
      dto.simple = [{ Exercise: ['cardio'] }];
      dto.withoutintervals = [{ Water: [] }];

      // Assert
      expect(dto.complex).toHaveLength(1);
      expect(dto.simple).toHaveLength(1);
      expect(dto.withoutintervals).toHaveLength(1);
    });
  });

  describe('validation rules', () => {
    it('should apply default value if complex is missing from source', async () => {
      // Arrange
      const partialDto = {
        simple: [],
        withoutintervals: [],
      };

      const dto = plainToClass(HabitsByTypeResponseDto, partialDto);

      // Act
      const errors = await validate(dto);

      // Assert - default value is applied, so no validation errors
      expect(dto.complex).toEqual([]);
      expect(errors.length).toBe(0);
    });

    it('should apply default value if simple is missing from source', async () => {
      // Arrange
      const partialDto = {
        complex: [],
        withoutintervals: [],
      };

      const dto = plainToClass(HabitsByTypeResponseDto, partialDto);

      // Act
      const errors = await validate(dto);

      // Assert - default value is applied, so no validation errors
      expect(dto.simple).toEqual([]);
      expect(errors.length).toBe(0);
    });

    it('should apply default value if withoutintervals is missing from source', async () => {
      // Arrange
      const partialDto = {
        complex: [],
        simple: [],
      };

      const dto = plainToClass(HabitsByTypeResponseDto, partialDto);

      // Act
      const errors = await validate(dto);

      // Assert - default value is applied, so no validation errors
      expect(dto.withoutintervals).toEqual([]);
      expect(errors.length).toBe(0);
    });

    it('should fail validation if complex is not an array', async () => {
      // Arrange
      const invalidDto = {
        complex: 'not an array',
        simple: [],
        withoutintervals: [],
      };

      const dto = plainToClass(HabitsByTypeResponseDto, invalidDto);

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === 'complex')).toBe(true);
    });

    it('should fail validation if simple is not an array', async () => {
      // Arrange
      const invalidDto = {
        complex: [],
        simple: 'not an array',
        withoutintervals: [],
      };

      const dto = plainToClass(HabitsByTypeResponseDto, invalidDto);

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === 'simple')).toBe(true);
    });

    it('should fail validation if withoutintervals is not an array', async () => {
      // Arrange
      const invalidDto = {
        complex: [],
        simple: [],
        withoutintervals: 'not an array',
      };

      const dto = plainToClass(HabitsByTypeResponseDto, invalidDto);

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === 'withoutintervals')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle habits with special characters in names', () => {
      // Arrange
      const dto = new HabitsByTypeResponseDto();
      dto.complex = [
        {
          'C++ Programming': ['Object-Oriented', 'Functional'],
        },
      ];

      // Assert
      expect(dto.complex[0]).toHaveProperty('C++ Programming');
    });

    it('should handle action types with special characters', () => {
      // Arrange
      const dto = new HabitsByTypeResponseDto();
      dto.complex = [
        {
          Programming: ['C# & .NET', 'Node.js/Express'],
        },
      ];

      // Assert
      expect(dto.complex[0]!['Programming']).toContain('C# & .NET');
      expect(dto.complex[0]!['Programming']).toContain('Node.js/Express');
    });

    it('should handle long habit names', () => {
      // Arrange
      const longHabitName =
        'Very long habit name that describes a complex activity in great detail';
      const dto = new HabitsByTypeResponseDto();
      dto.complex = [
        {
          [longHabitName]: [],
        },
      ];

      // Assert
      expect(dto.complex[0]).toHaveProperty(longHabitName);
    });

    it('should handle many action types for a single habit', () => {
      // Arrange
      const manyActionTypes = Array.from({ length: 50 }, (_, i) => `Action ${i + 1}`);
      const dto = new HabitsByTypeResponseDto();
      dto.complex = [
        {
          Programming: manyActionTypes,
        },
      ];

      // Assert
      expect(dto.complex[0]!['Programming']).toHaveLength(50);
    });

    it('should handle many habits in a single category', () => {
      // Arrange
      const manyHabits: Record<string, string[]> = {};
      for (let i = 0; i < 50; i++) {
        manyHabits[`Habit ${i}`] = [];
      }

      const dto = new HabitsByTypeResponseDto();
      dto.simple = [manyHabits];

      // Assert
      expect(Object.keys(dto.simple[0]!)).toHaveLength(50);
    });
  });

  describe('serialization', () => {
    it('should serialize to JSON correctly', () => {
      // Arrange
      const dto = new HabitsByTypeResponseDto();
      dto.complex = [{ Programming: ['work'] }];
      dto.simple = [{ Exercise: ['cardio'] }];
      dto.withoutintervals = [{ Water: [] }];

      // Act
      const json = JSON.stringify(dto);
      const parsed = JSON.parse(json);

      // Assert
      expect(parsed).toHaveProperty('complex');
      expect(parsed).toHaveProperty('simple');
      expect(parsed).toHaveProperty('withoutintervals');
      expect(parsed.complex[0]['Programming']).toEqual(['work']);
    });

    it('should deserialize from JSON correctly', () => {
      // Arrange
      const json = JSON.stringify({
        complex: [{ Programming: ['work'] }],
        simple: [{ Exercise: ['cardio'] }],
        withoutintervals: [{ Water: [] }],
      });

      // Act
      const dto = plainToClass(HabitsByTypeResponseDto, JSON.parse(json));

      // Assert
      expect(dto.complex[0]!['Programming']).toEqual(['work']);
      expect(dto.simple[0]!['Exercise']).toEqual(['cardio']);
      expect(dto.withoutintervals[0]!['Water']).toEqual([]);
    });
  });
});
