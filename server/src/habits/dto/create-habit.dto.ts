import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty, MaxLength, MinLength, Matches } from 'class-validator';

import { HabitComplexity } from '../../domain/shared/types/common';

export class CreateHabitDto {
  @ApiProperty({
    description: 'Name of the habit',
    example: 'Morning Exercise',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  @Matches(/\S/, { message: 'name must contain at least one non-whitespace character' })
  name!: string;

  @ApiProperty({
    description: 'Type/complexity of the habit',
    enum: HabitComplexity,
    example: HabitComplexity.SIMPLE,
  })
  @IsEnum(HabitComplexity)
  habitType!: HabitComplexity;
}
