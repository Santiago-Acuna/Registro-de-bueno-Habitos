import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { ActionTypeQueryDto } from '../action-type-query.dto';

describe('ActionTypeQueryDto', () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000';

  describe('habitId field validation', () => {
    it('should validate successfully with valid habitId', async () => {
      const dto = plainToClass(ActionTypeQueryDto, {
        habitId: validUUID,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate successfully without habitId (optional)', async () => {
      const dto = plainToClass(ActionTypeQueryDto, {});

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.habitId).toBeUndefined();
    });

    it('should fail when habitId is not a valid UUID', async () => {
      const dto = plainToClass(ActionTypeQueryDto, {
        habitId: 'invalid-uuid',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const habitIdErrors = errors.find(err => err.property === 'habitId');
      expect(habitIdErrors).toBeDefined();
      expect(habitIdErrors?.constraints).toHaveProperty('isUuid');
      expect(habitIdErrors?.constraints?.['isUuid']).toContain('Habit ID must be a valid UUID');
    });
  });

  describe('hasActions field transformation', () => {
    it('should transform string "true" to boolean true', () => {
      const plain = { hasActions: 'true' };
      const dto = plainToClass(ActionTypeQueryDto, plain);

      expect(dto.hasActions).toBe(true);
      expect(typeof dto.hasActions).toBe('boolean');
    });

    it('should transform string "false" to boolean false', () => {
      const plain = { hasActions: 'false' };
      const dto = plainToClass(ActionTypeQueryDto, plain);

      expect(dto.hasActions).toBe(false);
      expect(typeof dto.hasActions).toBe('boolean');
    });

    it('should keep boolean true as boolean', () => {
      const plain = { hasActions: true };
      const dto = plainToClass(ActionTypeQueryDto, plain);

      expect(dto.hasActions).toBe(true);
      expect(typeof dto.hasActions).toBe('boolean');
    });

    it('should keep boolean false as boolean', () => {
      const plain = { hasActions: false };
      const dto = plainToClass(ActionTypeQueryDto, plain);

      expect(dto.hasActions).toBe(false);
      expect(typeof dto.hasActions).toBe('boolean');
    });

    it('should keep undefined as undefined', () => {
      const plain = {};
      const dto = plainToClass(ActionTypeQueryDto, plain);

      expect(dto.hasActions).toBeUndefined();
    });
  });

  describe('hasActions field validation', () => {
    it('should validate successfully with boolean true', async () => {
      const dto = plainToClass(ActionTypeQueryDto, {
        hasActions: true,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate successfully with string "true"', async () => {
      const dto = plainToClass(ActionTypeQueryDto, {
        hasActions: 'true',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.hasActions).toBe(true);
    });

    it('should validate successfully with string "false"', async () => {
      const dto = plainToClass(ActionTypeQueryDto, {
        hasActions: 'false',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.hasActions).toBe(false);
    });

    it('should fail when hasActions is not a boolean', async () => {
      const dto = plainToClass(ActionTypeQueryDto, {
        hasActions: 'invalid',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const hasActionsErrors = errors.find(err => err.property === 'hasActions');
      expect(hasActionsErrors).toBeDefined();
      expect(hasActionsErrors?.constraints).toHaveProperty('isBoolean');
      expect(hasActionsErrors?.constraints?.['isBoolean']).toContain(
        'hasActions must be a boolean'
      );
    });
  });

  describe('recentActivityDays field transformation', () => {
    it('should transform string to number', () => {
      const plain = { recentActivityDays: '7' };
      const dto = plainToClass(ActionTypeQueryDto, plain);

      expect(dto.recentActivityDays).toBe(7);
      expect(typeof dto.recentActivityDays).toBe('number');
    });

    it('should keep number as number', () => {
      const plain = { recentActivityDays: 30 };
      const dto = plainToClass(ActionTypeQueryDto, plain);

      expect(dto.recentActivityDays).toBe(30);
      expect(typeof dto.recentActivityDays).toBe('number');
    });

    it('should keep undefined as undefined', () => {
      const plain = {};
      const dto = plainToClass(ActionTypeQueryDto, plain);

      expect(dto.recentActivityDays).toBeUndefined();
    });
  });

  describe('recentActivityDays field validation', () => {
    it('should validate successfully with valid days', async () => {
      const dto = plainToClass(ActionTypeQueryDto, {
        recentActivityDays: '7',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate successfully without recentActivityDays (optional)', async () => {
      const dto = plainToClass(ActionTypeQueryDto, {});

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.recentActivityDays).toBeUndefined();
    });

    it('should fail when recentActivityDays is less than 1', async () => {
      const dto = plainToClass(ActionTypeQueryDto, {
        recentActivityDays: '0',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const daysErrors = errors.find(err => err.property === 'recentActivityDays');
      expect(daysErrors).toBeDefined();
      expect(daysErrors?.constraints).toHaveProperty('min');
      expect(daysErrors?.constraints?.['min']).toContain('recentActivityDays must be at least 1');
    });

    it('should fail when recentActivityDays is greater than 365', async () => {
      const dto = plainToClass(ActionTypeQueryDto, {
        recentActivityDays: '366',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const daysErrors = errors.find(err => err.property === 'recentActivityDays');
      expect(daysErrors).toBeDefined();
      expect(daysErrors?.constraints).toHaveProperty('max');
      expect(daysErrors?.constraints?.['max']).toContain('recentActivityDays cannot exceed 365');
    });

    it('should fail when recentActivityDays is not an integer', async () => {
      const dto = plainToClass(ActionTypeQueryDto, {
        recentActivityDays: '7.5',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const daysErrors = errors.find(err => err.property === 'recentActivityDays');
      expect(daysErrors).toBeDefined();
      expect(daysErrors?.constraints).toHaveProperty('isInt');
      expect(daysErrors?.constraints?.['isInt']).toContain('recentActivityDays must be an integer');
    });

    it('should accept recentActivityDays value of 1 (minimum boundary)', async () => {
      const dto = plainToClass(ActionTypeQueryDto, {
        recentActivityDays: '1',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.recentActivityDays).toBe(1);
    });

    it('should accept recentActivityDays value of 365 (maximum boundary)', async () => {
      const dto = plainToClass(ActionTypeQueryDto, {
        recentActivityDays: '365',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.recentActivityDays).toBe(365);
    });

    it('should accept recentActivityDays mid-range value', async () => {
      const dto = plainToClass(ActionTypeQueryDto, {
        recentActivityDays: '30',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.recentActivityDays).toBe(30);
    });
  });

  describe('combined fields validation', () => {
    it('should validate successfully with all fields', async () => {
      const dto = plainToClass(ActionTypeQueryDto, {
        habitId: validUUID,
        hasActions: 'true',
        recentActivityDays: '7',
        page: '1',
        limit: '10',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate successfully with only habitId', async () => {
      const dto = plainToClass(ActionTypeQueryDto, {
        habitId: validUUID,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate successfully with empty object', async () => {
      const dto = plainToClass(ActionTypeQueryDto, {});

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });
});
