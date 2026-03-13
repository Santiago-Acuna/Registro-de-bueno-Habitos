import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UUID } from '../../domain/shared/types/common';

export class ActionLogResponseDto {
  @ApiProperty({
    description: 'Action log ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
    format: 'uuid',
  })
  id!: UUID;

  @ApiProperty({
    description: 'Start time of the action',
    example: '2024-01-01T10:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  startTime!: Date;

  @ApiPropertyOptional({
    description: 'End time of the action',
    example: '2024-01-01T11:00:00.000Z',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  endTime!: Date | null;

  @ApiPropertyOptional({
    description: 'Duration in seconds',
    example: 3600,
    type: Number,
    nullable: true,
  })
  durationSeconds!: number | null;

  @ApiProperty({
    description: 'Date of the action',
    example: '2024-01-01',
    type: String,
    format: 'date',
  })
  actionDate!: Date;

  @ApiProperty({
    description: 'ID of the action type',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    type: String,
    format: 'uuid',
  })
  actionTypeId!: UUID;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T09:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T09:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'Specialized log data for the associated log type (development, reading, pronunciation)',
    type: Object,
    nullable: true,
  })
  logTypeData!: Record<string, unknown> | null;
}
