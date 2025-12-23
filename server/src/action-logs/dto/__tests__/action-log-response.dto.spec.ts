import { ActionLogResponseDto } from '../action-log-response.dto';

describe('ActionLogResponseDto', () => {
  describe('DTO construction', () => {
    it('should create DTO with all required fields', () => {
      const dto = new ActionLogResponseDto();
      dto.id = '123e4567-e89b-12d3-a456-426614174000';
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.endTime = new Date('2024-01-01T11:00:00Z');
      dto.durationSeconds = 3600;
      dto.actionDate = new Date('2024-01-01');
      dto.actionTypeId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      dto.createdAt = new Date('2024-01-01T09:00:00Z');
      dto.updatedAt = new Date('2024-01-01T09:00:00Z');

      expect(dto.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(dto.startTime).toBeInstanceOf(Date);
      expect(dto.endTime).toBeInstanceOf(Date);
      expect(dto.durationSeconds).toBe(3600);
      expect(dto.actionDate).toBeInstanceOf(Date);
      expect(dto.actionTypeId).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
      expect(dto.createdAt).toBeInstanceOf(Date);
      expect(dto.updatedAt).toBeInstanceOf(Date);
    });

    it('should create DTO with null optional fields', () => {
      const dto = new ActionLogResponseDto();
      dto.id = '123e4567-e89b-12d3-a456-426614174000';
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.endTime = null;
      dto.durationSeconds = null;
      dto.actionDate = new Date('2024-01-01');
      dto.actionTypeId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      dto.createdAt = new Date('2024-01-01T09:00:00Z');
      dto.updatedAt = new Date('2024-01-01T09:00:00Z');

      expect(dto.endTime).toBeNull();
      expect(dto.durationSeconds).toBeNull();
    });

    it('should support serialization to JSON', () => {
      const dto = new ActionLogResponseDto();
      dto.id = '123e4567-e89b-12d3-a456-426614174000';
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.endTime = new Date('2024-01-01T11:00:00Z');
      dto.durationSeconds = 3600;
      dto.actionDate = new Date('2024-01-01');
      dto.actionTypeId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      dto.createdAt = new Date('2024-01-01T09:00:00Z');
      dto.updatedAt = new Date('2024-01-01T09:00:00Z');

      const json = JSON.stringify(dto);
      const parsed = JSON.parse(json);

      expect(parsed.id).toBe(dto.id);
      expect(parsed.actionTypeId).toBe(dto.actionTypeId);
      expect(parsed.durationSeconds).toBe(dto.durationSeconds);
    });

    it('should handle timezone information correctly', () => {
      const dto = new ActionLogResponseDto();
      dto.id = '123e4567-e89b-12d3-a456-426614174000';
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.endTime = new Date('2024-01-01T11:00:00Z');
      dto.durationSeconds = 3600;
      dto.actionDate = new Date('2024-01-01');
      dto.actionTypeId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      dto.createdAt = new Date('2024-01-01T09:00:00.000Z');
      dto.updatedAt = new Date('2024-01-01T09:00:00.000Z');

      expect(dto.startTime.toISOString()).toBe('2024-01-01T10:00:00.000Z');
      expect(dto.endTime?.toISOString()).toBe('2024-01-01T11:00:00.000Z');
    });
  });

  describe('property types and constraints', () => {
    it('should have correct property types', () => {
      const dto = new ActionLogResponseDto();
      dto.id = '123e4567-e89b-12d3-a456-426614174000';
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.endTime = new Date('2024-01-01T11:00:00Z');
      dto.durationSeconds = 3600;
      dto.actionDate = new Date('2024-01-01');
      dto.actionTypeId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      dto.createdAt = new Date('2024-01-01T09:00:00Z');
      dto.updatedAt = new Date('2024-01-01T09:00:00Z');

      expect(typeof dto.id).toBe('string');
      expect(dto.startTime instanceof Date).toBe(true);
      expect(dto.endTime instanceof Date).toBe(true);
      expect(typeof dto.durationSeconds).toBe('number');
      expect(dto.actionDate instanceof Date).toBe(true);
      expect(typeof dto.actionTypeId).toBe('string');
      expect(dto.createdAt instanceof Date).toBe(true);
      expect(dto.updatedAt instanceof Date).toBe(true);
    });

    it('should allow null for optional fields', () => {
      const dto = new ActionLogResponseDto();
      dto.id = '123e4567-e89b-12d3-a456-426614174000';
      dto.startTime = new Date('2024-01-01T10:00:00Z');
      dto.endTime = null;
      dto.durationSeconds = null;
      dto.actionDate = new Date('2024-01-01');
      dto.actionTypeId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      dto.createdAt = new Date('2024-01-01T09:00:00Z');
      dto.updatedAt = new Date('2024-01-01T09:00:00Z');

      expect(dto.endTime).toBeNull();
      expect(dto.durationSeconds).toBeNull();
    });
  });
});
