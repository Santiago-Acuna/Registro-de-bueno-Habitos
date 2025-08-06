import { IsString, IsEnum, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
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
  name: string;

  @ApiProperty({
    description: 'Type/complexity of the habit',
    enum: HabitComplexity,
    example: HabitComplexity.SIMPLE,
  })
  @IsEnum(HabitComplexity)
  habitType: HabitComplexity;

  @ApiProperty({
    description: 'Base64 encoded logo for the habit',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  })
  @IsString()
  @IsNotEmpty()
  logo: string;
}