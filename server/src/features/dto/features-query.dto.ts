import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class FeaturesQueryDto {
  @ApiPropertyOptional({
    description: 'Filter features by ready status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  ready?: boolean;

  @ApiPropertyOptional({
    description: 'Filter features by completion date (ISO 8601 date string)',
    example: '2024-06-15',
  })
  @IsOptional()
  @IsDateString()
  completedAt?: string;
}
