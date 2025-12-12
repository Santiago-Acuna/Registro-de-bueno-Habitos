import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { HabitsQueryDto } from '../habits-query.dto';

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
