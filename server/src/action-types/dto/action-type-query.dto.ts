import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsBoolean, IsInt, IsUUID, Min, Max } from 'class-validator';

import { UUID } from '../../domain/shared/types/common';

export class ActionTypeQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by habit ID',
    example: '987fcdeb-51a2-43d1-9876-543210987654',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Habit ID must be a valid UUID' })
  habitId?: UUID;

  @ApiPropertyOptional({
    description: 'Filter action types that have at least one action performed',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'hasActions must be a boolean' })
  hasActions?: boolean;

  @ApiPropertyOptional({
    description: 'Filter action types with recent activity within specified days',
    example: 7,
    minimum: 1,
    maximum: 365,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'recentActivityDays must be an integer' })
  @Min(1, { message: 'recentActivityDays must be at least 1' })
  @Max(365, { message: 'recentActivityDays cannot exceed 365' })
  recentActivityDays?: number;
}
