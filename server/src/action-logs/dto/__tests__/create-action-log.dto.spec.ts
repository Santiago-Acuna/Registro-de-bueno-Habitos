import { validate } from 'class-validator';

import { CreateActionLogDto } from '../create-action-log.dto';

describe('CreateActionLogDto', () => {
  describe('valid action log creation', () => {
    it('should validate successfully with all required fields', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.startTime).toBeInstanceOf(Date);
      expect(dto.actionTypeId).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should validate successfully with optional endTime', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.endTime = new Date('2024-01-01T11:00:00Z');
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.endTime).toBeInstanceOf(Date);
    });

    it('should validate successfully with optional durationSeconds', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.durationSeconds = 3600;
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.durationSeconds).toBe(3600);
    });

    it('should validate successfully with optional actionDate', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.actionDate = new Date('2024-01-01');
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.actionDate).toBeInstanceOf(Date);
    });

    it('should validate with all fields provided', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.endTime = new Date('2024-01-01T11:30:00Z');
      dto.durationSeconds = 5400;
      dto.actionDate = new Date('2024-01-01');
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept valid UUID for actionTypeId', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.actionTypeId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('startTime validation failures', () => {
    it('should fail when startTime is undefined', async () => {
      const dto = new CreateActionLogDto();
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const startTimeErrors = errors.find(err => err.property === 'startTime');
      expect(startTimeErrors).toBeDefined();
      expect(startTimeErrors?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when startTime is not a Date', async () => {
      const dto = new CreateActionLogDto();
      (dto as any).startTime = 'invalid-date';
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const startTimeErrors = errors.find(err => err.property === 'startTime');
      expect(startTimeErrors).toBeDefined();
      expect(startTimeErrors?.constraints).toHaveProperty('isDate');
    });

    it('should fail when startTime is null', async () => {
      const dto = new CreateActionLogDto();
      (dto as any).startTime = null;
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const startTimeErrors = errors.find(err => err.property === 'startTime');
      expect(startTimeErrors).toBeDefined();
    });

    it('should fail when startTime is a number', async () => {
      const dto = new CreateActionLogDto();
      (dto as any).startTime = 1234567890;
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const startTimeErrors = errors.find(err => err.property === 'startTime');
      expect(startTimeErrors).toBeDefined();
    });
  });

  describe('endTime validation', () => {
    it('should accept undefined endTime', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail when endTime is not a Date', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      (dto as any).endTime = 'invalid-date';
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const endTimeErrors = errors.find(err => err.property === 'endTime');
      expect(endTimeErrors).toBeDefined();
      expect(endTimeErrors?.constraints).toHaveProperty('isDate');
    });

    it('should fail when endTime is before startTime', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.endTime = new Date('2024-01-01T09:00:00Z');
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const endTimeErrors = errors.find(err => err.property === 'endTime');
      expect(endTimeErrors).toBeDefined();
    });
  });

  describe('durationSeconds validation', () => {
    it('should accept positive integer', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.durationSeconds = 100;
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail when durationSeconds is negative', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.durationSeconds = -100;
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const durationErrors = errors.find(err => err.property === 'durationSeconds');
      expect(durationErrors).toBeDefined();
      expect(durationErrors?.constraints).toHaveProperty('min');
    });

    it('should fail when durationSeconds is not a number', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      (dto as any).durationSeconds = 'invalid';
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const durationErrors = errors.find(err => err.property === 'durationSeconds');
      expect(durationErrors).toBeDefined();
      expect(durationErrors?.constraints).toHaveProperty('isNumber');
    });

    it('should fail when durationSeconds is a decimal', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.durationSeconds = 100.5;
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const durationErrors = errors.find(err => err.property === 'durationSeconds');
      expect(durationErrors).toBeDefined();
      expect(durationErrors?.constraints).toHaveProperty('isInt');
    });
  });

  describe('actionTypeId validation failures', () => {
    it('should fail when actionTypeId is undefined', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const actionTypeIdErrors = errors.find(err => err.property === 'actionTypeId');
      expect(actionTypeIdErrors).toBeDefined();
      expect(actionTypeIdErrors?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when actionTypeId is not a valid UUID', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.actionTypeId = 'invalid-uuid';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const actionTypeIdErrors = errors.find(err => err.property === 'actionTypeId');
      expect(actionTypeIdErrors).toBeDefined();
      expect(actionTypeIdErrors?.constraints).toHaveProperty('isUuid');
    });

    it('should fail when actionTypeId is null', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      (dto as any).actionTypeId = null;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const actionTypeIdErrors = errors.find(err => err.property === 'actionTypeId');
      expect(actionTypeIdErrors).toBeDefined();
    });

    it('should fail when actionTypeId is empty string', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.actionTypeId = '';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const actionTypeIdErrors = errors.find(err => err.property === 'actionTypeId');
      expect(actionTypeIdErrors).toBeDefined();
    });

    it('should fail when actionTypeId is a number', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      (dto as any).actionTypeId = 123;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const actionTypeIdErrors = errors.find(err => err.property === 'actionTypeId');
      expect(actionTypeIdErrors).toBeDefined();
    });
  });

  describe('actionDate validation', () => {
    it('should accept valid date', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.actionDate = new Date('2024-01-01');
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail when actionDate is not a Date', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      (dto as any).actionDate = 'invalid-date';
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const actionDateErrors = errors.find(err => err.property === 'actionDate');
      expect(actionDateErrors).toBeDefined();
      expect(actionDateErrors?.constraints).toHaveProperty('isDate');
    });
  });

  describe('boundary conditions', () => {
    it('should accept durationSeconds of 0', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.durationSeconds = 0;
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept very large durationSeconds', async () => {
      const dto = new CreateActionLogDto();
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.durationSeconds = 86400; // 24 hours in seconds
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept same startTime and endTime', async () => {
      const date = new Date('2024-01-01T10:00:00Z');
      const dto = new CreateActionLogDto();
      dto.startTime = date;
      dto.endTime = date;
      dto.actionTypeId = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });
});
