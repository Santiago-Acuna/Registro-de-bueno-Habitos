import { ApiProperty } from '@nestjs/swagger';

export class ChartInfoItemDto {
  @ApiProperty({
    description: 'Unique identifier of the chart info entry',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Label used for chart display',
    example: 'Characters per minute',
  })
  label!: string;

  @ApiProperty({
    description: 'Log type ID this chart info belongs to',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  logTypeId!: string;
}
