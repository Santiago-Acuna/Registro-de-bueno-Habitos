import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUID } from '../../domain/shared/types/common';

/**
 * Response DTO for validation function data.
 * This represents READ-ONLY configuration data that is managed via SQL scripts,
 * not through the API. The frontend uses this to apply client-side validations.
 */
export class LogColumnValidationResponseDto {
  @ApiProperty({
    description: 'Log column validation junction table ID (read-only)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  id!: UUID;

  @ApiProperty({
    description: 'Validation function ID (read-only, references validationFunctions table)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  validationFunctionId!: UUID;

  @ApiProperty({
    description: 'Name of the validation function (read-only configuration)',
    example: 'isNotEmpty',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  functionName!: string;

  @ApiProperty({
    description: 'JavaScript code of the validation function (read-only configuration)',
    example: 'return value !== null && value !== undefined && value !== "";',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  functionCode!: string;

  @ApiProperty({
    description:
      'Indicates if this validation should be executed on the frontend (read-only configuration)',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsNotEmpty()
  isForFront!: boolean;
}

/**
 * Response DTO for log column data with associated validation functions.
 * This represents READ-ONLY configuration that defines the structure of log entries.
 * The validations array contains pre-configured validation rules from the database.
 */
export class LogColumnResponseDto {
  @ApiProperty({
    description: 'Log column ID (read-only)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  id!: UUID;

  @ApiProperty({
    description: 'Column name (read-only configuration)',
    example: 'commitName',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Column data type (read-only configuration)',
    example: 'text',
    enum: ['text', 'number', 'boolean', 'select_simple', 'select_multiple'],
  })
  @IsEnum(['text', 'number', 'boolean', 'select_simple', 'select_multiple'])
  @IsNotEmpty()
  type!: 'text' | 'number' | 'boolean' | 'select_simple' | 'select_multiple';

  @ApiProperty({
    description: 'Log type ID this column belongs to (read-only)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  logTypeId!: UUID;

  @ApiPropertyOptional({
    description:
      'Identifies the data source for select-type columns. Present only when type is select_simple or select_multiple.',
    example: 'programmingLanguages',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  selectSource?: string | null;

  @ApiProperty({
    description:
      'Array of validation functions for this column (read-only configuration from database)',
    type: [LogColumnValidationResponseDto],
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogColumnValidationResponseDto)
  validations!: LogColumnValidationResponseDto[];
}
