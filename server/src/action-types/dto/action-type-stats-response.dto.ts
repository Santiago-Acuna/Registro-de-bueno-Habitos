import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UUID } from '../../domain/shared/types/common';

class ActionTypeStatsSummaryDto {
  @ApiProperty({
    description: 'Action type ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  id: UUID;

  @ApiProperty({
    description: 'Action type name',
    example: 'Morning Push-ups',
  })
  name: string;

  @ApiProperty({
    description: 'Total actions count for this action type',
    example: 50,
    minimum: 0,
  })
  totalActionsCount: number;
}

export class ActionTypeStatsResponseDto {
  @ApiProperty({
    description: 'Total number of action types for the habit',
    example: 5,
    minimum: 0,
  })
  totalActionTypes: number;

  @ApiProperty({
    description: 'Number of action types with at least one action performed',
    example: 4,
    minimum: 0,
  })
  activeActionTypes: number;

  @ApiProperty({
    description: 'Sum of all action counts across all action types',
    example: 100,
    minimum: 0,
  })
  totalActions: number;

  @ApiProperty({
    description: 'Average number of actions per action type',
    example: 20.5,
    minimum: 0,
  })
  averageActionsPerType: number;

  @ApiPropertyOptional({
    description: 'Most active action type (highest action count)',
    type: ActionTypeStatsSummaryDto,
    nullable: true,
  })
  mostActiveActionType?: ActionTypeStatsSummaryDto;

  @ApiPropertyOptional({
    description: 'Least active action type (lowest action count among active ones)',
    type: ActionTypeStatsSummaryDto,
    nullable: true,
  })
  leastActiveActionType?: ActionTypeStatsSummaryDto;

  @ApiProperty({
    description: 'Number of action types with activity in the last 7 days',
    example: 3,
    minimum: 0,
  })
  recentlyActiveCount: number;
}
