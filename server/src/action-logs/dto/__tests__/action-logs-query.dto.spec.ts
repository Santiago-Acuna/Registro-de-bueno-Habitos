import { validate } from 'class-validator';

import { ActionLogsQueryDto } from '../action-logs-query.dto';

describe('ActionLogsQueryDto', () => {
  describe('valid query parameters', () => {
    it('should validate successfully with actionTypeId filter', async () => {
      const dto = new ActionLogsQueryDto();
      dto.page = 1;
      dto.limit = 10;
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.actionTypeId).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should validate successfully with startDate filter', async () => {
      const dto = new ActionLogsQueryDto();
      dto.page = 1;
      dto.limit = 10;
      dto.startDate = new Date('2024-01-01');

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.startDate).toBeInstanceOf(Date);
    });

    it('should validate successfully with endDate filter', async () => {
      const dto = new ActionLogsQueryDto();
      dto.page = 1;
      dto.limit = 10;
      dto.endDate = new Date('2024-12-31');

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.endDate).toBeInstanceOf(Date);
    });

    it('should validate successfully with all filters', async () => {
      const dto = new ActionLogsQueryDto();
      dto.page = 1;
      dto.limit = 10;
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';
      dto.startDate = new Date('2024-01-01');
      dto.endDate = new Date('2024-12-31');

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate successfully without filters', async () => {
      const dto = new ActionLogsQueryDto();
      dto.page = 1;
      dto.limit = 10;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept valid pagination parameters', async () => {
      const dto = new ActionLogsQueryDto();
      dto.page = 5;
      dto.limit = 50;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(5);
      expect(dto.limit).toBe(50);
    });
  });

  describe('pagination validation', () => {
    it('should fail when page is less than 1', async () => {
      const dto = new ActionLogsQueryDto();
      dto.page = 0;
      dto.limit = 10;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const pageErrors = errors.find(err => err.property === 'page');
      expect(pageErrors).toBeDefined();
      expect(pageErrors?.constraints).toHaveProperty('min');
    });

    it('should fail when page is negative', async () => {
      const dto = new ActionLogsQueryDto();
      dto.page = -1;
      dto.limit = 10;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const pageErrors = errors.find(err => err.property === 'page');
      expect(pageErrors).toBeDefined();
    });

    it('should fail when limit is less than 1', async () => {
      const dto = new ActionLogsQueryDto();
      dto.page = 1;
      dto.limit = 0;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const limitErrors = errors.find(err => err.property === 'limit');
      expect(limitErrors).toBeDefined();
      expect(limitErrors?.constraints).toHaveProperty('min');
    });

    it('should fail when limit exceeds maximum', async () => {
      const dto = new ActionLogsQueryDto();
      dto.page = 1;
      dto.limit = 101; // Assuming max limit is 100

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const limitErrors = errors.find(err => err.property === 'limit');
      expect(limitErrors).toBeDefined();
      expect(limitErrors?.constraints).toHaveProperty('max');
    });
  });

  describe('actionTypeId validation', () => {
    it('should fail when actionTypeId is not a valid UUID', async () => {
      const dto = new ActionLogsQueryDto();
      dto.page = 1;
      dto.limit = 10;
      dto.actionTypeId = 'invalid-uuid';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const actionTypeIdErrors = errors.find(err => err.property === 'actionTypeId');
      expect(actionTypeIdErrors).toBeDefined();
      expect(actionTypeIdErrors?.constraints).toHaveProperty('isUuid');
    });

    it('should fail when actionTypeId is empty string', async () => {
      const dto = new ActionLogsQueryDto();
      dto.page = 1;
      dto.limit = 10;
      dto.actionTypeId = '';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const actionTypeIdErrors = errors.find(err => err.property === 'actionTypeId');
      expect(actionTypeIdErrors).toBeDefined();
    });
  });

  describe('date range validation', () => {
    it('should fail when startDate is not a Date', async () => {
      const dto = new ActionLogsQueryDto();
      dto.page = 1;
      dto.limit = 10;
      (dto as any).startDate = 'invalid-date';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const startDateErrors = errors.find(err => err.property === 'startDate');
      expect(startDateErrors).toBeDefined();
      expect(startDateErrors?.constraints).toHaveProperty('isDate');
    });

    it('should fail when endDate is not a Date', async () => {
      const dto = new ActionLogsQueryDto();
      dto.page = 1;
      dto.limit = 10;
      (dto as any).endDate = 'invalid-date';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const endDateErrors = errors.find(err => err.property === 'endDate');
      expect(endDateErrors).toBeDefined();
      expect(endDateErrors?.constraints).toHaveProperty('isDate');
    });

    it('should fail when endDate is before startDate', async () => {
      const dto = new ActionLogsQueryDto();
      dto.page = 1;
      dto.limit = 10;
      dto.startDate = new Date('2024-12-31');
      dto.endDate = new Date('2024-01-01');

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const endDateErrors = errors.find(err => err.property === 'endDate');
      expect(endDateErrors).toBeDefined();
    });

    it('should accept same startDate and endDate', async () => {
      const date = new Date('2024-01-01');
      const dto = new ActionLogsQueryDto();
      dto.page = 1;
      dto.limit = 10;
      dto.startDate = date;
      dto.endDate = date;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('boundary conditions', () => {
    it('should accept page at minimum value', async () => {
      const dto = new ActionLogsQueryDto();
      dto.page = 1;
      dto.limit = 10;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept limit at minimum value', async () => {
      const dto = new ActionLogsQueryDto();
      dto.page = 1;
      dto.limit = 1;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept limit at maximum value', async () => {
      const dto = new ActionLogsQueryDto();
      dto.page = 1;
      dto.limit = 100;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });
});
