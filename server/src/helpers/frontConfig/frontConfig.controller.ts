import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

import { HabitsByTypeResponseDto } from './dto/habits-by-type-response.dto';
import { FrontConfigService } from './frontConfig.service';

@ApiTags('front-config')
@Controller('front-config')
@UseGuards(ThrottlerGuard)
export class FrontConfigController {
  constructor(private readonly frontConfigService: FrontConfigService) {}

  @Get('habits-by-type')
  @ApiOperation({
    summary: 'Get habits organized by type',
    description:
      'Returns all active habits organized by their complexity type (complex, simple, withoutintervals) with their associated action types',
  })
  @ApiResponse({
    status: 200,
    description: 'Habits successfully organized by type',
    type: HabitsByTypeResponseDto,
  })
  async getHabitsByType(): Promise<HabitsByTypeResponseDto> {
    return this.frontConfigService.getHabitsByType();
  }
}
