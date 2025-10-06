import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UUID } from '../../domain/shared/types/common';

export class ActionTypeResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the action type',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  id!: UUID;

  @ApiProperty({
    description: 'Name of the action type',
    example: 'Morning Push-ups',
  })
  name!: string;

  @ApiProperty({
    description: 'Icon URL for the action type',
    example: 'https://example.com/pushups-icon.png',
  })
  icon!: string;

  @ApiProperty({
    description: 'UUID of the habit this action type belongs to',
    example: '987fcdeb-51a2-43d1-9876-543210987654',
    format: 'uuid',
  })
  habitId!: UUID;

  @ApiProperty({
    description: 'Total number of times this action has been performed',
    example: 15,
    minimum: 0,
  })
  totalActionsCount!: number;

  @ApiPropertyOptional({
    description: 'Date when this action was last performed',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
    nullable: true,
  })
  lastActionDate!: Date | null;

  @ApiProperty({
    description: 'Date when the action type was created',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Date when the action type was last updated',
    example: '2024-01-02T12:00:00.000Z',
    format: 'date-time',
  })
  updatedAt!: Date;
}
