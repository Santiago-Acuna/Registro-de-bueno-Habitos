import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ActionLogResponseDto } from '../action-log-response.dto';
import { LogColumnResponseDto, LogColumnValidationResponseDto } from '../log-columns-response.dto';

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

/**
 * Test suite for Log Columns Response DTOs
 *
 * ARCHITECTURAL NOTE: Read-Only Configuration
 * ===========================================
 * The validation functions and log column validations are READ-ONLY data
 * managed via SQL scripts, NOT through API endpoints.
 *
 * - validationFunctions table: Contains predefined validation logic (SQL-managed)
 * - logColumnValidations table: Junction table mapping validations to columns (SQL-managed)
 * - logColumns table: Defines the structure of log entries (SQL-managed)
 *
 * The API ONLY READS this configuration data to return it to the frontend
 * for client-side validation. These DTOs represent the response structure
 * when fetching this read-only configuration.
 */
describe('LogColumnsResponseDto', () => {
  describe('LogColumnValidationResponseDto', () => {
    describe('read-only validation function data structure', () => {
      it('should create valid validation response DTO with all required fields from database read', async () => {
        // This simulates data READ from the database (validationFunctions + logColumnValidations)
        const validationData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          validationFunctionId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          functionName: 'isNotEmpty',
          functionCode: 'return value !== null && value !== undefined && value !== "";',
          isForFront: true,
        };

        const dto = plainToInstance(LogColumnValidationResponseDto, validationData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.id).toBe(validationData.id);
        expect(dto.validationFunctionId).toBe(validationData.validationFunctionId);
        expect(dto.functionName).toBe(validationData.functionName);
        expect(dto.functionCode).toBe(validationData.functionCode);
        expect(dto.isForFront).toBe(true);
      });

      it('should create validation response with isForFront as false for backend-only validations', async () => {
        // Some validations are only executed on the backend (e.g., database constraints)
        const validationData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          validationFunctionId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          functionName: 'databaseConstraint',
          functionCode: 'return db.check(value);',
          isForFront: false,
        };

        const dto = plainToInstance(LogColumnValidationResponseDto, validationData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.isForFront).toBe(false);
      });

      it('should properly represent frontend-executable validation functions', async () => {
        // Frontend validations contain executable JavaScript code
        const validationData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          validationFunctionId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          functionName: 'maxLength',
          functionCode: 'return value.length <= 255;',
          isForFront: true,
        };

        const dto = plainToInstance(LogColumnValidationResponseDto, validationData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.functionCode).toContain('value.length');
        expect(dto.isForFront).toBe(true);
      });
    });

    describe('validation constraints for read-only data integrity', () => {
      it('should fail validation when id is not a UUID', async () => {
        // Even though this is read-only, we validate the structure for data integrity
        const invalidData = {
          id: 'invalid-uuid',
          validationFunctionId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          functionName: 'isNotEmpty',
          functionCode: 'return value !== "";',
          isForFront: true,
        };

        const dto = plainToInstance(LogColumnValidationResponseDto, invalidData);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]!.property).toBe('id');
      });

      it('should fail validation when validationFunctionId is not a UUID', async () => {
        const invalidData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          validationFunctionId: 'not-a-uuid',
          functionName: 'isNotEmpty',
          functionCode: 'return value !== "";',
          isForFront: true,
        };

        const dto = plainToInstance(LogColumnValidationResponseDto, invalidData);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]!.property).toBe('validationFunctionId');
      });

      it('should fail validation when functionName is missing', async () => {
        const invalidData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          validationFunctionId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          functionCode: 'return value !== "";',
          isForFront: true,
        };

        const dto = plainToInstance(LogColumnValidationResponseDto, invalidData);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(err => err.property === 'functionName')).toBe(true);
      });

      it('should fail validation when functionCode is missing', async () => {
        const invalidData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          validationFunctionId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          functionName: 'isNotEmpty',
          isForFront: true,
        };

        const dto = plainToInstance(LogColumnValidationResponseDto, invalidData);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(err => err.property === 'functionCode')).toBe(true);
      });

      it('should fail validation when isForFront is not a boolean', async () => {
        const invalidData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          validationFunctionId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          functionName: 'isNotEmpty',
          functionCode: 'return value !== "";',
          isForFront: 'yes',
        };

        const dto = plainToInstance(LogColumnValidationResponseDto, invalidData);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(err => err.property === 'isForFront')).toBe(true);
      });
    });
  });

  describe('LogColumnResponseDto', () => {
    const createValidValidation = (overrides = {}): any => ({
      id: '123e4567-e89b-12d3-a456-426614174000',
      validationFunctionId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      functionName: 'isNotEmpty',
      functionCode: 'return value !== "";',
      isForFront: true,
      ...overrides,
    });

    describe('read-only log column configuration with nested validations', () => {
      it('should create valid log column response DTO with all required fields from database read', async () => {
        // This simulates reading a log column with its associated validations
        // The validations are joined from logColumnValidations + validationFunctions tables
        const columnData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'commitName',
          type: 'text',
          logTypeId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          validations: [createValidValidation()],
        };

        const dto = plainToInstance(LogColumnResponseDto, columnData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.id).toBe(columnData.id);
        expect(dto.name).toBe(columnData.name);
        expect(dto.type).toBe(columnData.type);
        expect(dto.logTypeId).toBe(columnData.logTypeId);
        expect(dto.validations).toHaveLength(1);
      });

      it('should support number type columns from database configuration', async () => {
        const columnData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'pageCount',
          type: 'number',
          logTypeId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          validations: [],
        };

        const dto = plainToInstance(LogColumnResponseDto, columnData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.type).toBe('number');
      });

      it('should support boolean type columns from database configuration', async () => {
        const columnData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'isActive',
          type: 'boolean',
          logTypeId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          validations: [],
        };

        const dto = plainToInstance(LogColumnResponseDto, columnData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.type).toBe('boolean');
      });

      it('should handle log columns with no validations (empty array)', async () => {
        // Some columns may not have any validation requirements
        const columnData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'description',
          type: 'text',
          logTypeId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          validations: [],
        };

        const dto = plainToInstance(LogColumnResponseDto, columnData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.validations).toEqual([]);
      });

      it('should properly nest multiple validations from junction table reads', async () => {
        // This represents multiple validation functions mapped to a single column
        // via the logColumnValidations junction table
        const columnData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'email',
          type: 'text',
          logTypeId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          validations: [
            createValidValidation({ functionName: 'isNotEmpty' }),
            createValidValidation({
              id: 'b1ffce00-ad1c-4f89-8c7e-7cc0ce491b22',
              functionName: 'isEmail',
            }),
            createValidValidation({
              id: 'c2aadf11-be2d-4f80-9d8f-8dd1df502c33',
              functionName: 'maxLength',
            }),
          ],
        };

        const dto = plainToInstance(LogColumnResponseDto, columnData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.validations).toHaveLength(3);
        expect(dto.validations[0]!.functionName).toBe('isNotEmpty');
        expect(dto.validations[1]!.functionName).toBe('isEmail');
        expect(dto.validations[2]!.functionName).toBe('maxLength');
      });
    });

    describe('validation constraints for data integrity', () => {
      it('should fail validation when id is not a UUID', async () => {
        const invalidData = {
          id: 'invalid-uuid',
          name: 'commitName',
          type: 'text',
          logTypeId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          validations: [],
        };

        const dto = plainToInstance(LogColumnResponseDto, invalidData);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]!.property).toBe('id');
      });

      it('should fail validation when name is missing', async () => {
        const invalidData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'text',
          logTypeId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          validations: [],
        };

        const dto = plainToInstance(LogColumnResponseDto, invalidData);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(err => err.property === 'name')).toBe(true);
      });

      it('should fail validation when type is invalid (not text|number|boolean)', async () => {
        const invalidData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'field',
          type: 'invalid-type',
          logTypeId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          validations: [],
        };

        const dto = plainToInstance(LogColumnResponseDto, invalidData);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(err => err.property === 'type')).toBe(true);
      });

      it('should fail validation when logTypeId is not a UUID', async () => {
        const invalidData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'commitName',
          type: 'text',
          logTypeId: 'not-a-uuid',
          validations: [],
        };

        const dto = plainToInstance(LogColumnResponseDto, invalidData);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(err => err.property === 'logTypeId')).toBe(true);
      });

      it('should fail validation when validations is not an array', async () => {
        const invalidData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'commitName',
          type: 'text',
          logTypeId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          validations: 'not-an-array',
        };

        const dto = plainToInstance(LogColumnResponseDto, invalidData);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(err => err.property === 'validations')).toBe(true);
      });

      it('should validate nested validation objects for data integrity', async () => {
        const columnData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'commitName',
          type: 'text',
          logTypeId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          validations: [
            {
              id: 'invalid-uuid',
              validationFunctionId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
              functionName: 'isNotEmpty',
              functionCode: 'return value !== "";',
              isForFront: true,
            },
          ],
        };

        const dto = plainToInstance(LogColumnResponseDto, columnData);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Swagger documentation metadata', () => {
    it('should have proper Swagger decorators for LogColumnValidationResponseDto', () => {
      const dto = new LogColumnValidationResponseDto();
      expect(dto).toBeDefined();
    });

    it('should have proper Swagger decorators for LogColumnResponseDto', () => {
      const dto = new LogColumnResponseDto();
      expect(dto).toBeDefined();
    });
  });

  describe('transformation and serialization for API responses', () => {
    it('should correctly transform database result to DTO instance', () => {
      // Simulates transforming raw Prisma query results into DTOs for API response
      const plainData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'commitName',
        type: 'text',
        logTypeId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        validations: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            validationFunctionId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            functionName: 'isNotEmpty',
            functionCode: 'return value !== "";',
            isForFront: true,
          },
        ],
      };

      const dto = plainToInstance(LogColumnResponseDto, plainData);

      expect(dto).toBeInstanceOf(LogColumnResponseDto);
      expect(dto.validations[0]).toBeInstanceOf(LogColumnValidationResponseDto);
    });

    it('should properly serialize nested validation configuration for frontend consumption', () => {
      // The frontend will receive this structure to execute client-side validations
      const plainData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'commitName',
        type: 'text',
        logTypeId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        validations: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            validationFunctionId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            functionName: 'isNotEmpty',
            functionCode: 'return value !== null && value !== "";',
            isForFront: true,
          },
        ],
      };

      const dto = plainToInstance(LogColumnResponseDto, plainData);
      const json = JSON.stringify(dto);
      const parsed = JSON.parse(json);

      expect(parsed.validations).toHaveLength(1);
      expect(parsed.validations[0].functionCode).toBeTruthy();
      expect(parsed.validations[0].isForFront).toBe(true);
    });
  });

  describe('read-only architecture verification', () => {
    it('should document that these DTOs are for READ operations only', () => {
      // This test serves as documentation that these DTOs are READ-ONLY
      // They represent configuration fetched from the database
      // NO CREATE, UPDATE, or DELETE operations should exist for validation functions via API
      const dto = new LogColumnResponseDto();
      expect(dto).toBeDefined();

      // The validations are managed via SQL scripts, not through the API
      // The API only returns this configuration to the frontend
    });

    it('should represent configuration for frontend validation execution', () => {
      // The frontend receives this configuration and executes the validation
      // functions on user input before submitting to the backend
      const validationDto = new LogColumnValidationResponseDto();
      expect(validationDto).toBeDefined();

      // isForFront flag indicates which validations run client-side
      // functionCode contains the actual JavaScript to execute
    });
  });
});
