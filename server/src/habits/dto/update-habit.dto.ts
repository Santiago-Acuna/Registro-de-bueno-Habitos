import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';

import { CreateHabitDto } from './create-habit.dto';

export class UpdateHabitDto extends PartialType(CreateHabitDto) {
  @ApiProperty({
    description: 'Logo image file for the habit. Set to null to remove the logo.',
    type: 'string',
    format: 'binary',
    required: false,
  })
  logo?: Express.Multer.File | null;
}
