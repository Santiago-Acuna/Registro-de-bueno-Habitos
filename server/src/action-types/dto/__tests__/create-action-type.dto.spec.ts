import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateActionTypeDto } from '../create-action-type.dto';

describe('CreateActionTypeDto', () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000';

  describe('name field validation', () => {
    it('should validate successfully with valid name and habitId', async () => {
      const dto = plainToClass(CreateActionTypeDto, {
        name: 'Morning Push-ups',
        habitId: validUUID,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail when name is missing', async () => {
      const dto = plainToClass(CreateActionTypeDto, {
        habitId: validUUID,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const nameErrors = errors.find(err => err.property === 'name');
      expect(nameErrors).toBeDefined();
      expect(nameErrors?.constraints).toHaveProperty('isNotEmpty');
      expect(nameErrors?.constraints?.['isNotEmpty']).toContain('ActionType name is required');
    });

    it('should fail when name is empty string', async () => {
      const dto = plainToClass(CreateActionTypeDto, {
        name: '',
        habitId: validUUID,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const nameErrors = errors.find(err => err.property === 'name');
      expect(nameErrors).toBeDefined();
      expect(nameErrors?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when name is not a string', async () => {
      const dto = plainToClass(CreateActionTypeDto, {
        name: 123,
        habitId: validUUID,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const nameErrors = errors.find(err => err.property === 'name');
      expect(nameErrors).toBeDefined();
      expect(nameErrors?.constraints).toHaveProperty('isString');
      expect(nameErrors?.constraints?.['isString']).toContain('ActionType name must be a string');
    });

    it('should fail when name is too short (less than 2 characters)', async () => {
      const dto = plainToClass(CreateActionTypeDto, {
        name: 'a',
        habitId: validUUID,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const nameErrors = errors.find(err => err.property === 'name');
      expect(nameErrors).toBeDefined();
      expect(nameErrors?.constraints).toHaveProperty('isLength');
      expect(nameErrors?.constraints?.['isLength']).toContain('ActionType name must be between 2 and 50 characters');
    });

    it('should fail when name is too long (more than 50 characters)', async () => {
      const dto = plainToClass(CreateActionTypeDto, {
        name: 'a'.repeat(51),
        habitId: validUUID,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const nameErrors = errors.find(err => err.property === 'name');
      expect(nameErrors).toBeDefined();
      expect(nameErrors?.constraints).toHaveProperty('isLength');
    });

    it('should accept name with exactly 2 characters (minimum boundary)', async () => {
      const dto = plainToClass(CreateActionTypeDto, {
        name: 'ab',
        habitId: validUUID,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept name with exactly 50 characters (maximum boundary)', async () => {
      const dto = plainToClass(CreateActionTypeDto, {
        name: 'a'.repeat(50),
        habitId: validUUID,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept name with special characters', async () => {
      const dto = plainToClass(CreateActionTypeDto, {
        name: 'Morning Push-ups & Sit-ups!',
        habitId: validUUID,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('habitId field validation', () => {
    it('should fail when habitId is missing', async () => {
      const dto = plainToClass(CreateActionTypeDto, {
        name: 'Morning Push-ups',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const habitIdErrors = errors.find(err => err.property === 'habitId');
      expect(habitIdErrors).toBeDefined();
      expect(habitIdErrors?.constraints).toHaveProperty('isNotEmpty');
      expect(habitIdErrors?.constraints?.['isNotEmpty']).toContain('Habit ID is required');
    });

    it('should fail when habitId is not a valid UUID', async () => {
      const dto = plainToClass(CreateActionTypeDto, {
        name: 'Morning Push-ups',
        habitId: 'invalid-uuid',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const habitIdErrors = errors.find(err => err.property === 'habitId');
      expect(habitIdErrors).toBeDefined();
      expect(habitIdErrors?.constraints).toHaveProperty('isUuid');
      expect(habitIdErrors?.constraints?.['isUuid']).toContain('Habit ID must be a valid UUID');
    });

    it('should fail when habitId is empty string', async () => {
      const dto = plainToClass(CreateActionTypeDto, {
        name: 'Morning Push-ups',
        habitId: '',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const habitIdErrors = errors.find(err => err.property === 'habitId');
      expect(habitIdErrors).toBeDefined();
    });

    it('should accept valid UUID v4', async () => {
      const dto = plainToClass(CreateActionTypeDto, {
        name: 'Morning Push-ups',
        habitId: '987fcdeb-51a2-43d1-9876-543210987654',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });
});
