import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProgrammingLanguageResponseDto {
  @ApiProperty({
    description: 'Programming Language unique identifier',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Programming Language name',
    example: 'JavaScript',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Programming Language icon URL',
    example: 'https://example.com/icons/javascript.png',
    nullable: true,
  })
  icon!: string | null;
}
