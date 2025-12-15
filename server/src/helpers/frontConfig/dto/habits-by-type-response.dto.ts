import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class HabitsByTypeResponseDto {
  @ApiProperty({
    description: 'Complex habits organized by name with their action types',
    example: [
      {
        Programming: ['for work', 'personal Project'],
        'Learn english': ['Reading', 'Listening'],
      },
    ],
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
  })
  @IsArray()
  complex: Array<Record<string, string[]>> = [];

  @ApiProperty({
    description: 'Simple habits organized by name with their action types',
    example: [
      {
        'Morning Exercise': ['Cardio', 'Strength'],
        Meditation: [],
      },
    ],
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
  })
  @IsArray()
  simple: Array<Record<string, string[]>> = [];

  @ApiProperty({
    description: 'Habits without intervals organized by name with their action types',
    example: [
      {
        'Water Intake': [],
        'Daily Meditation': [],
      },
    ],
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
  })
  @IsArray()
  withoutintervals: Array<Record<string, string[]>> = [];
}
