import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsUUID } from 'class-validator';

import { IsDateAfterOrEqual } from '../../common/validators/is-date-after-or-equal.validator';
import { UUID } from '../../domain/shared/types/common';
import { PaginationQueryDto } from '../../infrastructure/dto/pagination-query.dto';

export class ActionLogsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by action type ID',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('all', { message: 'actionTypeId must be a valid UUID' })
  actionTypeId?: UUID;

  @ApiPropertyOptional({
    description: 'Filter by start date',
    example: '2024-01-01',
    type: String,
    format: 'date',
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate({ message: 'startDate must be a valid date' })
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Filter by end date',
    example: '2024-12-31',
    type: String,
    format: 'date',
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate({ message: 'endDate must be a valid date' })
  @IsDateAfterOrEqual('startDate', {
    message: 'endDate must be after or equal to startDate',
  })
  endDate?: Date;
}
