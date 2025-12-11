import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { HabitComplexity } from '../../../domain/shared/types/common';
import { CreateHabitDto } from '../create-habit.dto';
import { HabitResponseDto } from '../habit-response.dto';
import { HabitsQueryDto } from '../habits-query.dto';
import { UpdateHabitDto } from '../update-habit.dto';

describe('Habits DTOs (RED PHASE)', () => {
  describe('CreateHabitDto', () => {
    describe('valid habit creation', () => {
      it('should validate successfully with all required fields', async () => {
        const dto = new CreateHabitDto();
        dto.name = 'Morning Exercise';
        dto.habitType = HabitComplexity.SIMPLE;

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.name).toBe('Morning Exercise');
        expect(dto.habitType).toBe(HabitComplexity.SIMPLE);
      });

      it('should accept name with minimum length of 1 character', async () => {
        const dto = new CreateHabitDto();
        dto.name = 'A';
        dto.habitType = HabitComplexity.SIMPLE;

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should accept name with maximum length of 50 characters', async () => {
        const dto = new CreateHabitDto();
        dto.name = 'a'.repeat(50);
        dto.habitType = HabitComplexity.SIMPLE;

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.name).toHaveLength(50);
      });

      it('should accept SIMPLE habit type', async () => {
        const dto = new CreateHabitDto();
        dto.name = 'Simple Habit';
        dto.habitType = HabitComplexity.SIMPLE;

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should accept COMPLEX habit type', async () => {
        const dto = new CreateHabitDto();
        dto.name = 'Complex Habit';
        dto.habitType = HabitComplexity.COMPLEX;

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should accept WITHOUT_INTERVALS habit type', async () => {
        const dto = new CreateHabitDto();
        dto.name = 'Without Intervals Habit';
        dto.habitType = HabitComplexity.WITHOUT_INTERVALS;

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should accept name with special characters', async () => {
        const dto = new CreateHabitDto();
        dto.name = 'Habit-2024: Exercise & Meditation (30min)!';
        dto.habitType = HabitComplexity.SIMPLE;

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should accept name with numbers', async () => {
        const dto = new CreateHabitDto();
        dto.name = '30 Min Morning Exercise 123';
        dto.habitType = HabitComplexity.SIMPLE;

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('name validation failures', () => {
      it('should fail when name is empty string', async () => {
        const dto = new CreateHabitDto();
        dto.name = '';
        dto.habitType = HabitComplexity.SIMPLE;

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const nameErrors = errors.find(err => err.property === 'name');
        expect(nameErrors).toBeDefined();
        expect(nameErrors?.constraints).toHaveProperty('isNotEmpty');
      });

      it('should fail when name exceeds 50 characters', async () => {
        const dto = new CreateHabitDto();
        dto.name = 'a'.repeat(51);
        dto.habitType = HabitComplexity.SIMPLE;

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const nameErrors = errors.find(err => err.property === 'name');
        expect(nameErrors).toBeDefined();
        expect(nameErrors?.constraints).toHaveProperty('maxLength');
      });

      it('should fail when name is not a string (number)', async () => {
        const dto = new CreateHabitDto();
        (dto as any).name = 123;
        dto.habitType = HabitComplexity.SIMPLE;

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const nameErrors = errors.find(err => err.property === 'name');
        expect(nameErrors).toBeDefined();
        expect(nameErrors?.constraints).toHaveProperty('isString');
      });

      it('should fail when name is not a string (boolean)', async () => {
        const dto = new CreateHabitDto();
        (dto as any).name = true;
        dto.habitType = HabitComplexity.SIMPLE;

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const nameErrors = errors.find(err => err.property === 'name');
        expect(nameErrors).toBeDefined();
        expect(nameErrors?.constraints).toHaveProperty('isString');
      });

      it('should fail when name is not a string (object)', async () => {
        const dto = new CreateHabitDto();
        (dto as any).name = { value: 'test' };
        dto.habitType = HabitComplexity.SIMPLE;

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const nameErrors = errors.find(err => err.property === 'name');
        expect(nameErrors).toBeDefined();
        expect(nameErrors?.constraints).toHaveProperty('isString');
      });

      it('should fail when name is not a string (array)', async () => {
        const dto = new CreateHabitDto();
        (dto as any).name = ['test'];
        dto.habitType = HabitComplexity.SIMPLE;

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const nameErrors = errors.find(err => err.property === 'name');
        expect(nameErrors).toBeDefined();
        expect(nameErrors?.constraints).toHaveProperty('isString');
      });

      it('should fail when name is not a string (null)', async () => {
        const dto = new CreateHabitDto();
        (dto as any).name = null;
        dto.habitType = HabitComplexity.SIMPLE;

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const nameErrors = errors.find(err => err.property === 'name');
        expect(nameErrors).toBeDefined();
        expect(nameErrors?.constraints).toHaveProperty('isString');
      });

      it('should fail when name is undefined', async () => {
        const dto = new CreateHabitDto();
        dto.habitType = HabitComplexity.SIMPLE;

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const nameErrors = errors.find(err => err.property === 'name');
        expect(nameErrors).toBeDefined();
        expect(nameErrors?.constraints).toHaveProperty('isNotEmpty');
      });

      it('should accept name with only whitespace (no trimming in validator)', async () => {
        const dto = new CreateHabitDto();
        dto.name = '   ';
        dto.habitType = HabitComplexity.SIMPLE;

        const errors = await validate(dto);

        // class-validator does not trim by default, so '   ' passes MinLength(1)
        expect(errors).toHaveLength(0);
      });
    });

    describe('habitType validation failures', () => {
      it('should fail when habitType is invalid enum value', async () => {
        const dto = new CreateHabitDto();
        dto.name = 'Test Habit';
        (dto as any).habitType = 'INVALID_TYPE';

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const habitTypeErrors = errors.find(err => err.property === 'habitType');
        expect(habitTypeErrors).toBeDefined();
        expect(habitTypeErrors?.constraints).toHaveProperty('isEnum');
      });

      it('should fail when habitType is undefined', async () => {
        const dto = new CreateHabitDto();
        dto.name = 'Test Habit';

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const habitTypeErrors = errors.find(err => err.property === 'habitType');
        expect(habitTypeErrors).toBeDefined();
      });

      it('should fail when habitType is null', async () => {
        const dto = new CreateHabitDto();
        dto.name = 'Test Habit';
        (dto as any).habitType = null;

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const habitTypeErrors = errors.find(err => err.property === 'habitType');
        expect(habitTypeErrors).toBeDefined();
        expect(habitTypeErrors?.constraints).toHaveProperty('isEnum');
      });

      it('should fail when habitType is a number', async () => {
        const dto = new CreateHabitDto();
        dto.name = 'Test Habit';
        (dto as any).habitType = 123;

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const habitTypeErrors = errors.find(err => err.property === 'habitType');
        expect(habitTypeErrors).toBeDefined();
        expect(habitTypeErrors?.constraints).toHaveProperty('isEnum');
      });

      it('should fail when habitType is an object', async () => {
        const dto = new CreateHabitDto();
        dto.name = 'Test Habit';
        (dto as any).habitType = { type: 'SIMPLE' };

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const habitTypeErrors = errors.find(err => err.property === 'habitType');
        expect(habitTypeErrors).toBeDefined();
        expect(habitTypeErrors?.constraints).toHaveProperty('isEnum');
      });
    });

    describe('boundary conditions', () => {
      it('should accept exactly 1 character name', async () => {
        const dto = new CreateHabitDto();
        dto.name = 'X';
        dto.habitType = HabitComplexity.SIMPLE;

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should accept exactly 50 character name', async () => {
        const dto = new CreateHabitDto();
        dto.name = 'a'.repeat(50);
        dto.habitType = HabitComplexity.SIMPLE;

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should reject exactly 51 character name', async () => {
        const dto = new CreateHabitDto();
        dto.name = 'a'.repeat(51);
        dto.habitType = HabitComplexity.SIMPLE;

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const nameErrors = errors.find(err => err.property === 'name');
        expect(nameErrors).toBeDefined();
      });

      it('should reject 100 character name', async () => {
        const dto = new CreateHabitDto();
        dto.name = 'a'.repeat(100);
        dto.habitType = HabitComplexity.SIMPLE;

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const nameErrors = errors.find(err => err.property === 'name');
        expect(nameErrors).toBeDefined();
      });
    });
  });

  describe('UpdateHabitDto', () => {
    describe('valid partial updates', () => {
      it('should validate successfully with all fields', async () => {
        const dto = new UpdateHabitDto();
        dto.name = 'Updated Habit';
        dto.habitType = HabitComplexity.COMPLEX;
        dto.removeICon = 'true';

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should validate successfully with only name', async () => {
        const dto = new UpdateHabitDto();
        dto.name = 'Updated Name Only';

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should validate successfully with only habitType', async () => {
        const dto = new UpdateHabitDto();
        dto.habitType = HabitComplexity.COMPLEX;

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should validate successfully with only removeICon', async () => {
        const dto = new UpdateHabitDto();
        dto.removeICon = 'true';

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should validate successfully with empty object (no fields)', async () => {
        const dto = new UpdateHabitDto();

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should accept valid removeICon string', async () => {
        const dto = new UpdateHabitDto();
        dto.removeICon = 'remove';

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('name validation when provided', () => {
      it('should fail when name is empty string', async () => {
        const dto = new UpdateHabitDto();
        dto.name = '';

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const nameErrors = errors.find(err => err.property === 'name');
        expect(nameErrors).toBeDefined();
      });

      it('should fail when name exceeds 50 characters', async () => {
        const dto = new UpdateHabitDto();
        dto.name = 'a'.repeat(51);

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const nameErrors = errors.find(err => err.property === 'name');
        expect(nameErrors).toBeDefined();
      });

      it('should fail when name is not a string', async () => {
        const dto = new UpdateHabitDto();
        (dto as any).name = 123;

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const nameErrors = errors.find(err => err.property === 'name');
        expect(nameErrors).toBeDefined();
      });

      it('should accept valid name with 50 characters', async () => {
        const dto = new UpdateHabitDto();
        dto.name = 'a'.repeat(50);

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('habitType validation when provided', () => {
      it('should fail when habitType is invalid', async () => {
        const dto = new UpdateHabitDto();
        (dto as any).habitType = 'INVALID';

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const habitTypeErrors = errors.find(err => err.property === 'habitType');
        expect(habitTypeErrors).toBeDefined();
      });

      it('should accept valid SIMPLE habitType', async () => {
        const dto = new UpdateHabitDto();
        dto.habitType = HabitComplexity.SIMPLE;

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should accept valid COMPLEX habitType', async () => {
        const dto = new UpdateHabitDto();
        dto.habitType = HabitComplexity.COMPLEX;

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should accept valid WITHOUT_INTERVALS habitType', async () => {
        const dto = new UpdateHabitDto();
        dto.habitType = HabitComplexity.WITHOUT_INTERVALS;

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('removeICon validation', () => {
      it('should fail when removeICon is not a string', async () => {
        const dto = new UpdateHabitDto();
        (dto as any).removeICon = 123;

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const removeIconErrors = errors.find(err => err.property === 'removeICon');
        expect(removeIconErrors).toBeDefined();
        expect(removeIconErrors?.constraints).toHaveProperty('isString');
      });

      it('should fail when removeICon is boolean', async () => {
        const dto = new UpdateHabitDto();
        (dto as any).removeICon = true;

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const removeIconErrors = errors.find(err => err.property === 'removeICon');
        expect(removeIconErrors).toBeDefined();
      });

      it('should fail when removeICon is object', async () => {
        const dto = new UpdateHabitDto();
        (dto as any).removeICon = { remove: true };

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const removeIconErrors = errors.find(err => err.property === 'removeICon');
        expect(removeIconErrors).toBeDefined();
      });

      it('should accept removeICon as undefined (optional)', async () => {
        const dto = new UpdateHabitDto();
        // removeICon is optional, leaving it undefined

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.removeICon).toBeUndefined();
      });
    });

    describe('icon field handling', () => {
      it('should accept icon as undefined (optional)', async () => {
        const dto = new UpdateHabitDto();
        // icon is optional, leaving it undefined

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.icon).toBeUndefined();
      });

      it('should accept icon as null (to remove)', async () => {
        const dto = new UpdateHabitDto();
        dto.icon = null;

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });
  });

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

  describe('HabitsQueryDto', () => {
    describe('isActive transformation', () => {
      it('should transform string "true" to boolean true', () => {
        const plain = { isActive: 'true' };
        const dto = plainToClass(HabitsQueryDto, plain);

        expect(dto.isActive).toBe(true);
        expect(typeof dto.isActive).toBe('boolean');
      });

      it('should transform string "false" to boolean false', () => {
        const plain = { isActive: 'false' };
        const dto = plainToClass(HabitsQueryDto, plain);

        expect(dto.isActive).toBe(false);
        expect(typeof dto.isActive).toBe('boolean');
      });

      it('should keep undefined as undefined', () => {
        const plain = {};
        const dto = plainToClass(HabitsQueryDto, plain);

        expect(dto.isActive).toBeUndefined();
      });

      it('should keep boolean true as true', () => {
        const plain = { isActive: true };
        const dto = plainToClass(HabitsQueryDto, plain);

        expect(dto.isActive).toBe(true);
      });

      it('should keep boolean false as false', () => {
        const plain = { isActive: false };
        const dto = plainToClass(HabitsQueryDto, plain);

        expect(dto.isActive).toBe(false);
      });

      it('should keep invalid values as-is for validation to catch', () => {
        const plain = { isActive: 'invalid' };
        const dto = plainToClass(HabitsQueryDto, plain);

        expect(dto.isActive).toBe('invalid');
      });

      it('should keep numeric values as-is for validation to catch', () => {
        const plain = { isActive: 1 };
        const dto = plainToClass(HabitsQueryDto, plain);

        expect(dto.isActive).toBe(1);
      });

      it('should keep object values as-is for validation to catch', () => {
        const plain = { isActive: { value: true } };
        const dto = plainToClass(HabitsQueryDto, plain);

        expect(dto.isActive).toEqual({ value: true });
      });
    });

    describe('isActive validation', () => {
      it('should validate successfully with isActive as true', async () => {
        const dto = plainToClass(HabitsQueryDto, { isActive: 'true' });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.isActive).toBe(true);
      });

      it('should validate successfully with isActive as false', async () => {
        const dto = plainToClass(HabitsQueryDto, { isActive: 'false' });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.isActive).toBe(false);
      });

      it('should validate successfully without isActive field', async () => {
        const dto = plainToClass(HabitsQueryDto, {});

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.isActive).toBeUndefined();
      });

      it('should be optional field', async () => {
        const dto = new HabitsQueryDto();

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('pagination fields inheritance', () => {
      it('should inherit page field from PaginationQueryDto', () => {
        const dto = new HabitsQueryDto();
        dto.page = 1;

        expect(dto).toHaveProperty('page');
        expect(dto.page).toBe(1);
      });

      it('should inherit limit field from PaginationQueryDto', () => {
        const dto = new HabitsQueryDto();
        dto.limit = 10;

        expect(dto).toHaveProperty('limit');
        expect(dto.limit).toBe(10);
      });

      it('should validate page and limit fields from parent class', async () => {
        const dto = plainToClass(HabitsQueryDto, {
          page: '2',
          limit: '20',
          isActive: 'true',
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.page).toBe(2);
        expect(dto.limit).toBe(20);
        expect(dto.isActive).toBe(true);
      });

      it('should validate all fields together', async () => {
        const dto = plainToClass(HabitsQueryDto, {
          page: '1',
          limit: '50',
          isActive: 'false',
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.page).toBe(1);
        expect(dto.limit).toBe(50);
        expect(dto.isActive).toBe(false);
      });
    });

    describe('complete query scenarios', () => {
      it('should handle complete query with all parameters', () => {
        const plain = {
          page: '3',
          limit: '25',
          isActive: 'true',
        };
        const dto = plainToClass(HabitsQueryDto, plain);

        expect(dto.page).toBe(3);
        expect(dto.limit).toBe(25);
        expect(dto.isActive).toBe(true);
      });

      it('should handle query with only pagination', () => {
        const plain = {
          page: '1',
          limit: '10',
        };
        const dto = plainToClass(HabitsQueryDto, plain);

        expect(dto.page).toBe(1);
        expect(dto.limit).toBe(10);
        expect(dto.isActive).toBeUndefined();
      });

      it('should handle query with only isActive filter', () => {
        const plain = {
          isActive: 'false',
        };
        const dto = plainToClass(HabitsQueryDto, plain);

        expect(dto.isActive).toBe(false);
        expect(dto.page).toBeUndefined();
        expect(dto.limit).toBeUndefined();
      });

      it('should handle empty query object', () => {
        const plain = {};
        const dto = plainToClass(HabitsQueryDto, plain);

        expect(dto.page).toBeUndefined();
        expect(dto.limit).toBeUndefined();
        expect(dto.isActive).toBeUndefined();
      });
    });
  });
});
