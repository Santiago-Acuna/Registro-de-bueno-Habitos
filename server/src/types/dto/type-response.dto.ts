import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { SubtypeResponseDto } from '../../subtypes/dto/subtype-response.dto';

export class TypeResponseDto {
  @ApiProperty({
    description: 'Type unique identifier',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Type name',
    example: 'commit_type',
  })
  name!: string;

  @ApiProperty({
    description: 'Type description',
    example: 'Git commit types for development logs',
  })
  description!: string;

  @ApiPropertyOptional({
    description: 'Associated subtypes',
    type: [SubtypeResponseDto],
    isArray: true,
  })
  subtypes?: SubtypeResponseDto[];
}
