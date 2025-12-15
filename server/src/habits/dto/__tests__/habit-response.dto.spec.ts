import { HabitComplexity } from '../../../domain/shared/types/common';
import { HabitResponseDto } from '../habit-response.dto';

describe('HabitResponseDto', () => {
  describe('structure validation', () => {
    it('should have lastActionDate property initialized to null', () => {
      const dto = new HabitResponseDto();

      // Only lastActionDate has a default value (null)
      // Other fields are defined with ! (definite assignment) but not initialized
      expect(dto).toHaveProperty('lastActionDate');
      expect(dto.lastActionDate).toBeNull();
    });

    it('should accept valid UUID for id', () => {
      const dto = new HabitResponseDto();
      dto.id = '123e4567-e89b-12d3-a456-426614174000';

      expect(dto.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should accept string for name', () => {
      const dto = new HabitResponseDto();
      dto.name = 'Morning Exercise';

      expect(dto.name).toBe('Morning Exercise');
      expect(typeof dto.name).toBe('string');
    });

    it('should accept HabitComplexity enum for habitType', () => {
      const dto = new HabitResponseDto();
      dto.habitType = HabitComplexity.SIMPLE;

      expect(dto.habitType).toBe(HabitComplexity.SIMPLE);
    });

    it('should accept string for icon', () => {
      const dto = new HabitResponseDto();
      dto.icon = 'https://example.com/icon.png';

      expect(dto.icon).toBe('https://example.com/icon.png');
      expect(typeof dto.icon).toBe('string');
    });

    it('should accept boolean for isActive', () => {
      const dto = new HabitResponseDto();
      dto.isActive = true;

      expect(dto.isActive).toBe(true);
      expect(typeof dto.isActive).toBe('boolean');
    });

    it('should accept number for totalActionsCount', () => {
      const dto = new HabitResponseDto();
      dto.totalActionsCount = 42;

      expect(dto.totalActionsCount).toBe(42);
      expect(typeof dto.totalActionsCount).toBe('number');
    });

    it('should accept Date for lastActionDate', () => {
      const dto = new HabitResponseDto();
      const date = new Date('2024-01-15T10:30:00.000Z');
      dto.lastActionDate = date;

      expect(dto.lastActionDate).toBe(date);
      expect(dto.lastActionDate).toBeInstanceOf(Date);
    });

    it('should accept null for lastActionDate', () => {
      const dto = new HabitResponseDto();
      dto.lastActionDate = null;

      expect(dto.lastActionDate).toBeNull();
    });

    it('should default lastActionDate to null', () => {
      const dto = new HabitResponseDto();

      expect(dto.lastActionDate).toBeNull();
    });

    it('should accept Date for createdAt', () => {
      const dto = new HabitResponseDto();
      const date = new Date('2024-01-01T00:00:00.000Z');
      dto.createdAt = date;

      expect(dto.createdAt).toBe(date);
      expect(dto.createdAt).toBeInstanceOf(Date);
    });

    it('should accept Date for updatedAt', () => {
      const dto = new HabitResponseDto();
      const date = new Date('2024-01-15T10:30:00.000Z');
      dto.updatedAt = date;

      expect(dto.updatedAt).toBe(date);
      expect(dto.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('complete response object', () => {
    it('should create valid complete response DTO', () => {
      const dto = new HabitResponseDto();
      dto.id = '123e4567-e89b-12d3-a456-426614174000';
      dto.name = 'Morning Exercise';
      dto.habitType = HabitComplexity.SIMPLE;
      dto.icon = 'https://example.com/icon.png';
      dto.isActive = true;
      dto.totalActionsCount = 15;
      dto.lastActionDate = new Date('2024-01-15T10:30:00.000Z');
      dto.createdAt = new Date('2024-01-01T00:00:00.000Z');
      dto.updatedAt = new Date('2024-01-15T10:30:00.000Z');

      expect(dto.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(dto.name).toBe('Morning Exercise');
      expect(dto.habitType).toBe(HabitComplexity.SIMPLE);
      expect(dto.icon).toBe('https://example.com/icon.png');
      expect(dto.isActive).toBe(true);
      expect(dto.totalActionsCount).toBe(15);
      expect(dto.lastActionDate).toBeInstanceOf(Date);
      expect(dto.createdAt).toBeInstanceOf(Date);
      expect(dto.updatedAt).toBeInstanceOf(Date);
    });

    it('should create valid response with null lastActionDate', () => {
      const dto = new HabitResponseDto();
      dto.id = '123e4567-e89b-12d3-a456-426614174000';
      dto.name = 'New Habit';
      dto.habitType = HabitComplexity.COMPLEX;
      dto.icon = 'https://example.com/icon.png';
      dto.isActive = true;
      dto.totalActionsCount = 0;
      dto.lastActionDate = null;
      dto.createdAt = new Date('2024-01-01T00:00:00.000Z');
      dto.updatedAt = new Date('2024-01-01T00:00:00.000Z');

      expect(dto.lastActionDate).toBeNull();
      expect(dto.totalActionsCount).toBe(0);
    });
  });
});
