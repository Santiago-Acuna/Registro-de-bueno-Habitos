import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FeatureResponseDto {
  @ApiProperty({
    description: 'Feature unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Feature name',
    example: 'Dark mode support',
  })
  name!: string;

  @ApiProperty({
    description: 'Feature description',
    example: 'Add dark mode support to the application UI',
  })
  description!: string;

  @ApiProperty({
    description: 'Whether the feature is ready',
    example: false,
  })
  ready!: boolean;

  @ApiPropertyOptional({
    description: 'Date when the feature was completed',
    example: '2024-06-15',
    nullable: true,
    type: String,
  })
  completedAt!: Date | null;
}
