import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

import { UUID } from '../../domain/shared/types/common';

export class CreateActionTypeDto {
  @ApiProperty({
    description: 'Name of the action type',
    example: 'Morning Push-ups',
    minLength: 2,
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'ActionType name is required' })
  @IsString({ message: 'ActionType name must be a string' })
  @Length(2, 50, { message: 'ActionType name must be between 2 and 50 characters' })
  name!: string;

  @ApiProperty({
    description: 'UUID of the habit this action type belongs to',
    example: '987fcdeb-51a2-43d1-9876-543210987654',
    format: 'uuid',
  })
  @IsNotEmpty({ message: 'Habit ID is required' })
  @IsUUID(4, { message: 'Habit ID must be a valid UUID' })
  habitId!: UUID;
}
