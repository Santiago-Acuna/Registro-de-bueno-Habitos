import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateActionTypeDto } from '../update-action-type.dto';

describe('UpdateActionTypeDto', () => {
  describe('name field validation', () => {
    it('should validate successfully with valid name', async () => {
      const dto = plainToClass(UpdateActionTypeDto, {
        name: 'Evening Push-ups',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate successfully without name field (optional)', async () => {
      const dto = plainToClass(UpdateActionTypeDto, {});

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.name).toBeUndefined();
    });

    it('should fail when name is not a string', async () => {
      const dto = plainToClass(UpdateActionTypeDto, {
        name: 123,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const nameErrors = errors.find(err => err.property === 'name');
      expect(nameErrors).toBeDefined();
      expect(nameErrors?.constraints).toHaveProperty('isString');
      expect(nameErrors?.constraints?.['isString']).toContain('ActionType name must be a string');
    });

    it('should fail when name is too short (less than 2 characters)', async () => {
      const dto = plainToClass(UpdateActionTypeDto, {
        name: 'a',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const nameErrors = errors.find(err => err.property === 'name');
      expect(nameErrors).toBeDefined();
      expect(nameErrors?.constraints).toHaveProperty('isLength');
      expect(nameErrors?.constraints?.['isLength']).toContain('ActionType name must be between 2 and 50 characters');
    });

    it('should fail when name is too long (more than 50 characters)', async () => {
      const dto = plainToClass(UpdateActionTypeDto, {
        name: 'a'.repeat(51),
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const nameErrors = errors.find(err => err.property === 'name');
      expect(nameErrors).toBeDefined();
      expect(nameErrors?.constraints).toHaveProperty('isLength');
    });

    it('should accept name with exactly 2 characters (minimum boundary)', async () => {
      const dto = plainToClass(UpdateActionTypeDto, {
        name: 'ab',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept name with exactly 50 characters (maximum boundary)', async () => {
      const dto = plainToClass(UpdateActionTypeDto, {
        name: 'a'.repeat(50),
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail when name is empty string', async () => {
      const dto = plainToClass(UpdateActionTypeDto, {
        name: '',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const nameErrors = errors.find(err => err.property === 'name');
      expect(nameErrors).toBeDefined();
    });
  });
});
