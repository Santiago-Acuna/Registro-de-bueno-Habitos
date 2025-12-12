import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { ActionTypeQueryDto } from '../action-type-query.dto';
import { CreateActionTypeDto } from '../create-action-type.dto';
import { MostActiveQueryDto } from '../most-active-query.dto';
import { RecentlyActiveQueryDto } from '../recently-active-query.dto';
import { UpdateActionTypeDto } from '../update-action-type.dto';

describe('Action Types DTOs', () => {
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
        expect(hasActionsErrors?.constraints?.['isBoolean']).toContain('hasActions must be a boolean');
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

  describe('MostActiveQueryDto', () => {
    describe('limit field transformation', () => {
      it('should transform string to number', () => {
        const plain = { limit: '20' };
        const dto = plainToClass(MostActiveQueryDto, plain);

        expect(dto.limit).toBe(20);
        expect(typeof dto.limit).toBe('number');
      });

      it('should keep number as number', () => {
        const plain = { limit: 50 };
        const dto = plainToClass(MostActiveQueryDto, plain);

        expect(dto.limit).toBe(50);
        expect(typeof dto.limit).toBe('number');
      });

      it('should use default value of 10 when not provided', () => {
        const plain = {};
        const dto = plainToClass(MostActiveQueryDto, plain);

        expect(dto.limit).toBe(10);
      });
    });

    describe('limit field validation', () => {
      it('should validate successfully with valid limit', async () => {
        const dto = plainToClass(MostActiveQueryDto, {
          limit: '20',
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should validate successfully with default value', async () => {
        const dto = plainToClass(MostActiveQueryDto, {});

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.limit).toBe(10);
      });

      it('should fail when limit is less than 1', async () => {
        const dto = plainToClass(MostActiveQueryDto, {
          limit: '0',
        });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const limitErrors = errors.find(err => err.property === 'limit');
        expect(limitErrors).toBeDefined();
        expect(limitErrors?.constraints).toHaveProperty('min');
        expect(limitErrors?.constraints?.['min']).toContain('limit must be at least 1');
      });

      it('should fail when limit is greater than 100', async () => {
        const dto = plainToClass(MostActiveQueryDto, {
          limit: '101',
        });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const limitErrors = errors.find(err => err.property === 'limit');
        expect(limitErrors).toBeDefined();
        expect(limitErrors?.constraints).toHaveProperty('max');
        expect(limitErrors?.constraints?.['max']).toContain('limit cannot exceed 100');
      });

      it('should fail when limit is not an integer', async () => {
        const dto = plainToClass(MostActiveQueryDto, {
          limit: '10.5',
        });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const limitErrors = errors.find(err => err.property === 'limit');
        expect(limitErrors).toBeDefined();
        expect(limitErrors?.constraints).toHaveProperty('isInt');
        expect(limitErrors?.constraints?.['isInt']).toContain('limit must be an integer');
      });

      it('should accept limit value of 1 (minimum boundary)', async () => {
        const dto = plainToClass(MostActiveQueryDto, {
          limit: '1',
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.limit).toBe(1);
      });

      it('should accept limit value of 100 (maximum boundary)', async () => {
        const dto = plainToClass(MostActiveQueryDto, {
          limit: '100',
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.limit).toBe(100);
      });

      it('should accept limit mid-range value', async () => {
        const dto = plainToClass(MostActiveQueryDto, {
          limit: '50',
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.limit).toBe(50);
      });
    });
  });

  describe('RecentlyActiveQueryDto', () => {
    describe('days field transformation', () => {
      it('should transform string to number', () => {
        const plain = { days: '14' };
        const dto = plainToClass(RecentlyActiveQueryDto, plain);

        expect(dto.days).toBe(14);
        expect(typeof dto.days).toBe('number');
      });

      it('should keep number as number', () => {
        const plain = { days: 30 };
        const dto = plainToClass(RecentlyActiveQueryDto, plain);

        expect(dto.days).toBe(30);
        expect(typeof dto.days).toBe('number');
      });

      it('should use default value of 7 when not provided', () => {
        const plain = {};
        const dto = plainToClass(RecentlyActiveQueryDto, plain);

        expect(dto.days).toBe(7);
      });
    });

    describe('days field validation', () => {
      it('should validate successfully with valid days', async () => {
        const dto = plainToClass(RecentlyActiveQueryDto, {
          days: '14',
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should validate successfully with default value', async () => {
        const dto = plainToClass(RecentlyActiveQueryDto, {});

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.days).toBe(7);
      });

      it('should fail when days is less than 1', async () => {
        const dto = plainToClass(RecentlyActiveQueryDto, {
          days: '0',
        });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const daysErrors = errors.find(err => err.property === 'days');
        expect(daysErrors).toBeDefined();
        expect(daysErrors?.constraints).toHaveProperty('min');
        expect(daysErrors?.constraints?.['min']).toContain('days must be at least 1');
      });

      it('should fail when days is greater than 365', async () => {
        const dto = plainToClass(RecentlyActiveQueryDto, {
          days: '366',
        });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const daysErrors = errors.find(err => err.property === 'days');
        expect(daysErrors).toBeDefined();
        expect(daysErrors?.constraints).toHaveProperty('max');
        expect(daysErrors?.constraints?.['max']).toContain('days cannot exceed 365');
      });

      it('should fail when days is not an integer', async () => {
        const dto = plainToClass(RecentlyActiveQueryDto, {
          days: '7.5',
        });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const daysErrors = errors.find(err => err.property === 'days');
        expect(daysErrors).toBeDefined();
        expect(daysErrors?.constraints).toHaveProperty('isInt');
        expect(daysErrors?.constraints?.['isInt']).toContain('days must be an integer');
      });

      it('should accept days value of 1 (minimum boundary)', async () => {
        const dto = plainToClass(RecentlyActiveQueryDto, {
          days: '1',
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.days).toBe(1);
      });

      it('should accept days value of 365 (maximum boundary)', async () => {
        const dto = plainToClass(RecentlyActiveQueryDto, {
          days: '365',
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.days).toBe(365);
      });

      it('should accept days mid-range value', async () => {
        const dto = plainToClass(RecentlyActiveQueryDto, {
          days: '30',
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.days).toBe(30);
      });
    });

    describe('limit field transformation', () => {
      it('should transform string to number', () => {
        const plain = { limit: '20' };
        const dto = plainToClass(RecentlyActiveQueryDto, plain);

        expect(dto.limit).toBe(20);
        expect(typeof dto.limit).toBe('number');
      });

      it('should keep number as number', () => {
        const plain = { limit: 50 };
        const dto = plainToClass(RecentlyActiveQueryDto, plain);

        expect(dto.limit).toBe(50);
        expect(typeof dto.limit).toBe('number');
      });

      it('should use default value of 10 when not provided', () => {
        const plain = {};
        const dto = plainToClass(RecentlyActiveQueryDto, plain);

        expect(dto.limit).toBe(10);
      });
    });

    describe('limit field validation', () => {
      it('should validate successfully with valid limit', async () => {
        const dto = plainToClass(RecentlyActiveQueryDto, {
          limit: '20',
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should fail when limit is less than 1', async () => {
        const dto = plainToClass(RecentlyActiveQueryDto, {
          limit: '0',
        });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const limitErrors = errors.find(err => err.property === 'limit');
        expect(limitErrors).toBeDefined();
        expect(limitErrors?.constraints).toHaveProperty('min');
        expect(limitErrors?.constraints?.['min']).toContain('limit must be at least 1');
      });

      it('should fail when limit is greater than 100', async () => {
        const dto = plainToClass(RecentlyActiveQueryDto, {
          limit: '101',
        });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const limitErrors = errors.find(err => err.property === 'limit');
        expect(limitErrors).toBeDefined();
        expect(limitErrors?.constraints).toHaveProperty('max');
        expect(limitErrors?.constraints?.['max']).toContain('limit cannot exceed 100');
      });

      it('should fail when limit is not an integer', async () => {
        const dto = plainToClass(RecentlyActiveQueryDto, {
          limit: '10.5',
        });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const limitErrors = errors.find(err => err.property === 'limit');
        expect(limitErrors).toBeDefined();
        expect(limitErrors?.constraints).toHaveProperty('isInt');
        expect(limitErrors?.constraints?.['isInt']).toContain('limit must be an integer');
      });

      it('should accept limit value of 1 (minimum boundary)', async () => {
        const dto = plainToClass(RecentlyActiveQueryDto, {
          limit: '1',
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.limit).toBe(1);
      });

      it('should accept limit value of 100 (maximum boundary)', async () => {
        const dto = plainToClass(RecentlyActiveQueryDto, {
          limit: '100',
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.limit).toBe(100);
      });
    });

    describe('combined fields validation', () => {
      it('should validate successfully with both fields', async () => {
        const dto = plainToClass(RecentlyActiveQueryDto, {
          days: '14',
          limit: '20',
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.days).toBe(14);
        expect(dto.limit).toBe(20);
      });

      it('should validate successfully with only days', async () => {
        const dto = plainToClass(RecentlyActiveQueryDto, {
          days: '30',
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.days).toBe(30);
        expect(dto.limit).toBe(10);
      });

      it('should validate successfully with only limit', async () => {
        const dto = plainToClass(RecentlyActiveQueryDto, {
          limit: '25',
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.days).toBe(7);
        expect(dto.limit).toBe(25);
      });

      it('should validate successfully with empty object (use defaults)', async () => {
        const dto = plainToClass(RecentlyActiveQueryDto, {});

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.days).toBe(7);
        expect(dto.limit).toBe(10);
      });

      it('should fail with invalid days and valid limit', async () => {
        const dto = plainToClass(RecentlyActiveQueryDto, {
          days: '0',
          limit: '10',
        });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const daysErrors = errors.find(err => err.property === 'days');
        expect(daysErrors).toBeDefined();
      });

      it('should fail with valid days and invalid limit', async () => {
        const dto = plainToClass(RecentlyActiveQueryDto, {
          days: '7',
          limit: '101',
        });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const limitErrors = errors.find(err => err.property === 'limit');
        expect(limitErrors).toBeDefined();
      });

      it('should fail with both invalid days and limit', async () => {
        const dto = plainToClass(RecentlyActiveQueryDto, {
          days: '400',
          limit: '200',
        });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.length).toBeGreaterThanOrEqual(2);
      });
    });
  });
});
