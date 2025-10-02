import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateActionTypeDto {
  @ApiPropertyOptional({
    description: 'New name for the action type',
    example: 'Evening Push-ups',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'ActionType name must be a string' })
  @Length(2, 100, { message: 'ActionType name must be between 2 and 100 characters' })
  name?: string;
}
