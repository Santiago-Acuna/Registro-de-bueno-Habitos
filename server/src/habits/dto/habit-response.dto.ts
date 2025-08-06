import { ApiProperty } from '@nestjs/swagger';
import { HabitComplexity, UUID } from '../../domain/shared/types/common';

export class HabitResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the habit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: UUID;

  @ApiProperty({
    description: 'Name of the habit',
    example: 'Morning Exercise',
  })
  name: string;

  @ApiProperty({
    description: 'Type/complexity of the habit',
    enum: HabitComplexity,
    example: HabitComplexity.SIMPLE,
  })
  habitType: HabitComplexity;

  @ApiProperty({
    description: 'Base64 encoded logo for the habit',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  })
  logo: string;

  @ApiProperty({
    description: 'Whether the habit is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Total number of completed actions',
    example: 15,
  })
  totalActionsCount: number;

  @ApiProperty({
    description: 'Date when the last action was performed',
    example: '2024-01-15T10:30:00.000Z',
    nullable: true,
  })
  lastActionDate: Date | null;

  @ApiProperty({
    description: 'Date when the habit was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the habit was last updated',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}