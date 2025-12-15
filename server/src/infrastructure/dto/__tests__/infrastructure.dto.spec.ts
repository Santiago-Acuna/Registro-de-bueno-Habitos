import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { PaginatedResponseDto } from '../paginated-response.dto';
import { PaginationQueryDto } from '../pagination-query.dto';

describe('Infrastructure DTOs (RED PHASE)', () => {
  describe('PaginationQueryDto', () => {
    describe('page field transformation', () => {
      it('should transform string to number', () => {
        const plain = { page: '5' };
        const dto = plainToClass(PaginationQueryDto, plain);

        expect(dto.page).toBe(5);
        expect(typeof dto.page).toBe('number');
      });

      it('should keep number as number', () => {
        const plain = { page: 3 };
        const dto = plainToClass(PaginationQueryDto, plain);

        expect(dto.page).toBe(3);
        expect(typeof dto.page).toBe('number');
      });

      it('should keep undefined as undefined', () => {
        const plain = {};
        const dto = plainToClass(PaginationQueryDto, plain);

        expect(dto.page).toBeUndefined();
      });

      it('should transform "1" to 1', () => {
        const plain = { page: '1' };
        const dto = plainToClass(PaginationQueryDto, plain);

        expect(dto.page).toBe(1);
      });

      it('should transform "100" to 100', () => {
        const plain = { page: '100' };
        const dto = plainToClass(PaginationQueryDto, plain);

        expect(dto.page).toBe(100);
      });
    });

    describe('limit field transformation', () => {
      it('should transform string to number', () => {
        const plain = { limit: '20' };
        const dto = plainToClass(PaginationQueryDto, plain);

        expect(dto.limit).toBe(20);
        expect(typeof dto.limit).toBe('number');
      });

      it('should keep number as number', () => {
        const plain = { limit: 50 };
        const dto = plainToClass(PaginationQueryDto, plain);

        expect(dto.limit).toBe(50);
        expect(typeof dto.limit).toBe('number');
      });

      it('should keep undefined as undefined', () => {
        const plain = {};
        const dto = plainToClass(PaginationQueryDto, plain);

        expect(dto.limit).toBeUndefined();
      });

      it('should transform "1" to 1', () => {
        const plain = { limit: '1' };
        const dto = plainToClass(PaginationQueryDto, plain);

        expect(dto.limit).toBe(1);
      });

      it('should transform "100" to 100', () => {
        const plain = { limit: '100' };
        const dto = plainToClass(PaginationQueryDto, plain);

        expect(dto.limit).toBe(100);
      });
    });

    describe('page field validation', () => {
      it('should validate successfully with valid page', async () => {
        const dto = plainToClass(PaginationQueryDto, { page: '1' });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should validate successfully without page field (optional)', async () => {
        const dto = plainToClass(PaginationQueryDto, {});

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.page).toBeUndefined();
      });

      it('should fail when page is less than 1', async () => {
        const dto = plainToClass(PaginationQueryDto, { page: '0' });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const pageErrors = errors.find(err => err.property === 'page');
        expect(pageErrors).toBeDefined();
        expect(pageErrors?.constraints).toHaveProperty('min');
        expect(pageErrors?.constraints?.['min']).toContain('must not be less than 1');
      });

      it('should fail when page is negative', async () => {
        const dto = plainToClass(PaginationQueryDto, { page: '-5' });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const pageErrors = errors.find(err => err.property === 'page');
        expect(pageErrors).toBeDefined();
        expect(pageErrors?.constraints).toHaveProperty('min');
      });

      it('should fail when page is not a number', async () => {
        const dto = plainToClass(PaginationQueryDto, { page: 'invalid' });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const pageErrors = errors.find(err => err.property === 'page');
        expect(pageErrors).toBeDefined();
        expect(pageErrors?.constraints).toHaveProperty('isInt');
      });

      it('should reject decimal page values', async () => {
        const dto = plainToClass(PaginationQueryDto, { page: '1.5' });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const pageErrors = errors.find(err => err.property === 'page');
        expect(pageErrors).toBeDefined();
        expect(pageErrors?.constraints).toHaveProperty('isInt');
      });

      it('should accept page value of 1 (boundary)', async () => {
        const dto = plainToClass(PaginationQueryDto, { page: '1' });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.page).toBe(1);
      });

      it('should accept large page numbers', async () => {
        const dto = plainToClass(PaginationQueryDto, { page: '999999' });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.page).toBe(999999);
      });
    });

    describe('limit field validation', () => {
      it('should validate successfully with valid limit', async () => {
        const dto = plainToClass(PaginationQueryDto, { limit: '10' });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should validate successfully without limit field (optional)', async () => {
        const dto = plainToClass(PaginationQueryDto, {});

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.limit).toBeUndefined();
      });

      it('should fail when limit is less than 1', async () => {
        const dto = plainToClass(PaginationQueryDto, { limit: '0' });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const limitErrors = errors.find(err => err.property === 'limit');
        expect(limitErrors).toBeDefined();
        expect(limitErrors?.constraints).toHaveProperty('min');
        expect(limitErrors?.constraints?.['min']).toContain('must not be less than 1');
      });

      it('should fail when limit is greater than 100', async () => {
        const dto = plainToClass(PaginationQueryDto, { limit: '101' });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const limitErrors = errors.find(err => err.property === 'limit');
        expect(limitErrors).toBeDefined();
        expect(limitErrors?.constraints).toHaveProperty('max');
        expect(limitErrors?.constraints?.['max']).toContain('must not be greater than 100');
      });

      it('should fail when limit is negative', async () => {
        const dto = plainToClass(PaginationQueryDto, { limit: '-10' });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const limitErrors = errors.find(err => err.property === 'limit');
        expect(limitErrors).toBeDefined();
        expect(limitErrors?.constraints).toHaveProperty('min');
      });

      it('should fail when limit is not a number', async () => {
        const dto = plainToClass(PaginationQueryDto, { limit: 'invalid' });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const limitErrors = errors.find(err => err.property === 'limit');
        expect(limitErrors).toBeDefined();
        expect(limitErrors?.constraints).toHaveProperty('isInt');
      });

      it('should reject decimal limit values', async () => {
        const dto = plainToClass(PaginationQueryDto, { limit: '10.5' });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const limitErrors = errors.find(err => err.property === 'limit');
        expect(limitErrors).toBeDefined();
        expect(limitErrors?.constraints).toHaveProperty('isInt');
      });

      it('should accept limit value of 1 (minimum boundary)', async () => {
        const dto = plainToClass(PaginationQueryDto, { limit: '1' });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.limit).toBe(1);
      });

      it('should accept limit value of 100 (maximum boundary)', async () => {
        const dto = plainToClass(PaginationQueryDto, { limit: '100' });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.limit).toBe(100);
      });

      it('should accept limit value of 50 (mid-range)', async () => {
        const dto = plainToClass(PaginationQueryDto, { limit: '50' });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.limit).toBe(50);
      });
    });

    describe('combined field validation', () => {
      it('should validate successfully with both page and limit', async () => {
        const dto = plainToClass(PaginationQueryDto, {
          page: '2',
          limit: '20',
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.page).toBe(2);
        expect(dto.limit).toBe(20);
      });

      it('should validate successfully with only page', async () => {
        const dto = plainToClass(PaginationQueryDto, { page: '3' });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.page).toBe(3);
        expect(dto.limit).toBeUndefined();
      });

      it('should validate successfully with only limit', async () => {
        const dto = plainToClass(PaginationQueryDto, { limit: '25' });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.page).toBeUndefined();
        expect(dto.limit).toBe(25);
      });

      it('should validate successfully with empty object', async () => {
        const dto = plainToClass(PaginationQueryDto, {});

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.page).toBeUndefined();
        expect(dto.limit).toBeUndefined();
      });

      it('should fail with invalid page and valid limit', async () => {
        const dto = plainToClass(PaginationQueryDto, {
          page: '0',
          limit: '10',
        });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const pageErrors = errors.find(err => err.property === 'page');
        expect(pageErrors).toBeDefined();
      });

      it('should fail with valid page and invalid limit', async () => {
        const dto = plainToClass(PaginationQueryDto, {
          page: '1',
          limit: '101',
        });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const limitErrors = errors.find(err => err.property === 'limit');
        expect(limitErrors).toBeDefined();
      });

      it('should fail with both invalid page and limit', async () => {
        const dto = plainToClass(PaginationQueryDto, {
          page: '-1',
          limit: '200',
        });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('PaginatedResponseDto', () => {
    describe('constructor', () => {
      it('should create instance with all required fields', () => {
        const data = [{ id: 1 }, { id: 2 }];
        const dto = new PaginatedResponseDto(data, 50, 1, 10);

        expect(dto.data).toEqual(data);
        expect(dto.total).toBe(50);
        expect(dto.page).toBe(1);
        expect(dto.limit).toBe(10);
        expect(dto.totalPages).toBe(5);
      });

      it('should calculate totalPages correctly for exact division', () => {
        const data = [{ id: 1 }];
        const dto = new PaginatedResponseDto(data, 100, 1, 10);

        expect(dto.totalPages).toBe(10);
      });

      it('should calculate totalPages correctly with remainder', () => {
        const data = [{ id: 1 }];
        const dto = new PaginatedResponseDto(data, 95, 1, 10);

        expect(dto.totalPages).toBe(10);
      });

      it('should calculate totalPages as 1 when total is less than limit', () => {
        const data = [{ id: 1 }];
        const dto = new PaginatedResponseDto(data, 5, 1, 10);

        expect(dto.totalPages).toBe(1);
      });

      it('should calculate totalPages as 0 when total is 0', () => {
        const data: any[] = [];
        const dto = new PaginatedResponseDto(data, 0, 1, 10);

        expect(dto.totalPages).toBe(0);
      });

      it('should handle single item per page', () => {
        const data = [{ id: 1 }];
        const dto = new PaginatedResponseDto(data, 50, 1, 1);

        expect(dto.totalPages).toBe(50);
      });

      it('should handle large limit (100)', () => {
        const data = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }));
        const dto = new PaginatedResponseDto(data, 250, 1, 100);

        expect(dto.totalPages).toBe(3);
      });
    });

    describe('data field', () => {
      it('should store array of items', () => {
        const data = [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ];
        const dto = new PaginatedResponseDto(data, 2, 1, 10);

        expect(dto.data).toEqual(data);
        expect(Array.isArray(dto.data)).toBe(true);
        expect(dto.data).toHaveLength(2);
      });

      it('should handle empty array', () => {
        const data: any[] = [];
        const dto = new PaginatedResponseDto(data, 0, 1, 10);

        expect(dto.data).toEqual([]);
        expect(Array.isArray(dto.data)).toBe(true);
        expect(dto.data).toHaveLength(0);
      });

      it('should preserve item types', () => {
        interface TestItem {
          id: number;
          name: string;
        }
        const data: TestItem[] = [
          { id: 1, name: 'Test' },
          { id: 2, name: 'Test2' },
        ];
        const dto = new PaginatedResponseDto<TestItem>(data, 2, 1, 10);

        expect(dto.data[0]?.id).toBe(1);
        expect(dto.data[0]?.name).toBe('Test');
      });
    });

    describe('pagination metadata', () => {
      it('should store current page number', () => {
        const data = [{ id: 1 }];
        const dto = new PaginatedResponseDto(data, 50, 3, 10);

        expect(dto.page).toBe(3);
      });

      it('should store limit value', () => {
        const data = [{ id: 1 }];
        const dto = new PaginatedResponseDto(data, 50, 1, 25);

        expect(dto.limit).toBe(25);
      });

      it('should store total count', () => {
        const data = [{ id: 1 }];
        const dto = new PaginatedResponseDto(data, 123, 1, 10);

        expect(dto.total).toBe(123);
      });

      it('should calculate correct totalPages for last page', () => {
        const data = [{ id: 1 }];
        const dto = new PaginatedResponseDto(data, 95, 10, 10);

        expect(dto.totalPages).toBe(10);
        expect(dto.page).toBe(10);
      });
    });

    describe('edge cases', () => {
      it('should handle total equals limit', () => {
        const data = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
        const dto = new PaginatedResponseDto(data, 10, 1, 10);

        expect(dto.totalPages).toBe(1);
      });

      it('should handle total is 1', () => {
        const data = [{ id: 1 }];
        const dto = new PaginatedResponseDto(data, 1, 1, 10);

        expect(dto.totalPages).toBe(1);
        expect(dto.data).toHaveLength(1);
      });

      it('should handle limit of 1 with multiple items', () => {
        const data = [{ id: 1 }];
        const dto = new PaginatedResponseDto(data, 10, 1, 1);

        expect(dto.totalPages).toBe(10);
      });

      it('should handle very large total', () => {
        const data = [{ id: 1 }];
        const dto = new PaginatedResponseDto(data, 10000, 1, 10);

        expect(dto.totalPages).toBe(1000);
      });

      it('should handle decimal totalPages calculation (round up)', () => {
        const data = [{ id: 1 }];
        const dto = new PaginatedResponseDto(data, 7, 1, 3);

        expect(dto.totalPages).toBe(3);
      });
    });

    describe('generic type support', () => {
      it('should work with string array', () => {
        const data = ['item1', 'item2', 'item3'];
        const dto = new PaginatedResponseDto<string>(data, 3, 1, 10);

        expect(dto.data).toEqual(['item1', 'item2', 'item3']);
        expect(typeof dto.data[0]).toBe('string');
      });

      it('should work with number array', () => {
        const data = [1, 2, 3, 4, 5];
        const dto = new PaginatedResponseDto<number>(data, 5, 1, 10);

        expect(dto.data).toEqual([1, 2, 3, 4, 5]);
        expect(typeof dto.data[0]).toBe('number');
      });

      it('should work with complex object array', () => {
        interface ComplexItem {
          id: number;
          name: string;
          metadata: {
            created: Date;
            tags: string[];
          };
        }
        const data: ComplexItem[] = [
          {
            id: 1,
            name: 'Test',
            metadata: { created: new Date(), tags: ['tag1'] },
          },
        ];
        const dto = new PaginatedResponseDto<ComplexItem>(data, 1, 1, 10);

        expect(dto.data[0]?.metadata.tags).toEqual(['tag1']);
      });
    });
  });
});
