import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class SubtypeQueryDto {
  @ApiPropertyOptional({
    description: 'Filter subtypes by parent type ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  typeId?: number;
}
