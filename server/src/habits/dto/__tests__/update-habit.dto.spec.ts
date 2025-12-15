import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { HabitComplexity } from '../../../domain/shared/types/common';
import { UpdateHabitDto } from '../update-habit.dto';

describe('UpdateHabitDto', () => {
  describe('valid partial updates', () => {
    it('should validate successfully with all fields', async () => {
      const dto = new UpdateHabitDto();
      dto.name = 'Updated Habit';
      dto.habitType = HabitComplexity.COMPLEX;
      dto.removeICon = true;

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
      dto.removeICon = true;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate successfully with empty object (no fields)', async () => {
      const dto = new UpdateHabitDto();

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept removeICon as false', async () => {
      const dto = new UpdateHabitDto();
      dto.removeICon = false;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('removeICon transformation', () => {
    it('should transform string "true" to boolean true', () => {
      const plain = { removeICon: 'true' };
      const dto = plainToClass(UpdateHabitDto, plain);

      expect(dto.removeICon).toBe(true);
      expect(typeof dto.removeICon).toBe('boolean');
    });

    it('should transform string "false" to boolean false', () => {
      const plain = { removeICon: 'false' };
      const dto = plainToClass(UpdateHabitDto, plain);

      expect(dto.removeICon).toBe(false);
      expect(typeof dto.removeICon).toBe('boolean');
    });

    it('should keep boolean true as true', () => {
      const plain = { removeICon: true };
      const dto = plainToClass(UpdateHabitDto, plain);

      expect(dto.removeICon).toBe(true);
    });

    it('should keep boolean false as false', () => {
      const plain = { removeICon: false };
      const dto = plainToClass(UpdateHabitDto, plain);

      expect(dto.removeICon).toBe(false);
    });

    it('should keep undefined as undefined', () => {
      const plain = {};
      const dto = plainToClass(UpdateHabitDto, plain);

      expect(dto.removeICon).toBeUndefined();
    });

    it('should keep invalid values as-is for validation to catch', () => {
      const plain = { removeICon: 'invalid' };
      const dto = plainToClass(UpdateHabitDto, plain);

      expect(dto.removeICon).toBe('invalid');
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

    it('should fail when name contains only whitespace', async () => {
      const dto = new UpdateHabitDto();
      dto.name = '   ';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const nameErrors = errors.find(err => err.property === 'name');
      expect(nameErrors).toBeDefined();
      expect(nameErrors?.constraints).toHaveProperty('matches');
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
    it('should accept boolean true', async () => {
      const dto = new UpdateHabitDto();
      dto.removeICon = true;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.removeICon).toBe(true);
    });

    it('should accept boolean false', async () => {
      const dto = new UpdateHabitDto();
      dto.removeICon = false;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.removeICon).toBe(false);
    });

    it('should fail when removeICon is a number', async () => {
      const dto = new UpdateHabitDto();
      (dto as any).removeICon = 123;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const removeIconErrors = errors.find(err => err.property === 'removeICon');
      expect(removeIconErrors).toBeDefined();
      expect(removeIconErrors?.constraints).toHaveProperty('isBoolean');
    });

    it('should fail when removeICon is a string (not transformed)', async () => {
      const dto = new UpdateHabitDto();
      (dto as any).removeICon = 'remove';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const removeIconErrors = errors.find(err => err.property === 'removeICon');
      expect(removeIconErrors).toBeDefined();
      expect(removeIconErrors?.constraints).toHaveProperty('isBoolean');
    });

    it('should fail when removeICon is an object', async () => {
      const dto = new UpdateHabitDto();
      (dto as any).removeICon = { remove: true };

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const removeIconErrors = errors.find(err => err.property === 'removeICon');
      expect(removeIconErrors).toBeDefined();
      expect(removeIconErrors?.constraints).toHaveProperty('isBoolean');
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
