import { validate } from 'class-validator';

import { HabitComplexity } from '../../../domain/shared/types/common';
import { CreateHabitDto } from '../create-habit.dto';

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

    it('should fail when name contains only whitespace', async () => {
      const dto = new CreateHabitDto();
      dto.name = '   ';
      dto.habitType = HabitComplexity.SIMPLE;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const nameErrors = errors.find(err => err.property === 'name');
      expect(nameErrors).toBeDefined();
      expect(nameErrors?.constraints).toHaveProperty('matches');
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
