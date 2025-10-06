import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../infrastructure/dto/pagination-query.dto';

export class HabitsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter habits by active status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;
}
