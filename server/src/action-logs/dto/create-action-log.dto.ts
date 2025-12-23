import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

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
}
