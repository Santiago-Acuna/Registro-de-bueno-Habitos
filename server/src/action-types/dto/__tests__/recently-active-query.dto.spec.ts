import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { RecentlyActiveQueryDto } from '../recently-active-query.dto';

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
