import { ApiProperty } from '@nestjs/swagger';

export class SubtypeResponseDto {
  @ApiProperty({
    description: 'Subtype unique identifier',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Parent type ID',
    example: 1,
  })
  typeId!: number;

  @ApiProperty({
    description: 'Subtype name',
    example: 'feat',
  })
  name!: string;

  @ApiProperty({
    description: 'Subtype description',
    example: 'A new feature',
  })
  description!: string;
}
