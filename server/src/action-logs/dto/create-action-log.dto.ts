import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsObject, IsOptional, IsUUID } from 'class-validator';

import { UUID } from '../../domain/shared/types/common';

export class CreateActionLogDto {
  @ApiProperty({
    description: 'Start time of the action',
    example: '2024-01-01T10:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @Type(() => Date)
  @IsNotEmpty({ message: 'startTime is required' })
  @IsDate({ message: 'startTime must be a valid date' })
  startTime!: Date;

  @ApiPropertyOptional({
    description: 'End time of the action',
    example: '2024-01-01T11:00:00.000Z',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate({ message: 'endTime must be a valid date' })
  endTime?: Date;

  @ApiProperty({
    description: 'ID of the action type',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    type: String,
    format: 'uuid',
  })
  @IsNotEmpty({ message: 'actionTypeId is required' })
  @IsUUID('all', { message: 'actionTypeId must be a valid UUID' })
  actionTypeId!: UUID;

  @ApiPropertyOptional({
    description: 'ID of the log type (derived from action type if not provided)',
    example: 'b1ffce00-ad1c-5fg9-cc7e-7cc0ce491b22',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('all', { message: 'logTypeId must be a valid UUID' })
  logTypeId?: UUID;

  @ApiPropertyOptional({
    description:
      'Additional data for the specific log type (e.g., development logs, reading logs, pronunciation logs)',
    example: {
      commitName: 'feat: add new feature',
      description: 'Added new feature to the application',
      commitHash: 'abc123def456',
      isForMe: true,
      featuresId: 'c2ggdf11-be2d-6gh0-dd8f-8dd1df502c33',
      commitSizeId: 1,
      commitImportanceId: 2,
      programmingLanguageId: 3,
      externalDependencyId: 1,
    },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject({ message: 'logTypeInfo must be an object' })
  logTypeInfo?: Record<string, unknown>;
}
