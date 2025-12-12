import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

import { CreateHabitDto } from './create-habit.dto';

export class UpdateHabitDto extends PartialType(CreateHabitDto) {
  @ApiProperty({
    description: 'Logo image file for the habit. Set to null to remove the logo.',
    type: 'string',
    format: 'binary',
    required: false,
  })
  icon?: Express.Multer.File | null;

  @ApiProperty({
    description: 'Set to true to remove the current logo',
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  removeICon?: boolean;
}
