import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { MostActiveQueryDto } from '../most-active-query.dto';

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
