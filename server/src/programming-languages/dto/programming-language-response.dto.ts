import { ApiProperty } from '@nestjs/swagger';

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
}
