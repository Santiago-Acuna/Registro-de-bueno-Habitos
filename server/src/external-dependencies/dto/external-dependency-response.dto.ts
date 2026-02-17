import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExternalDependencyResponseDto {
  @ApiProperty({
    description: 'External Dependency unique identifier',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'External Dependency name',
    example: 'React',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Programming Language ID',
    example: 1,
    nullable: true,
  })
  programmingLanguageId!: number | null;
}
