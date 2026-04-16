import { Controller, Get, Param, ParseUUIDPipe, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

import { ChartInfoItemDto } from './dto/chart-info-response.dto';
import { HabitsByTypeResponseDto } from './dto/habits-by-type-response.dto';
import { FrontConfigService } from './frontConfig.service';

@ApiTags('front-config')
@Controller('front-config')
@UseGuards(ThrottlerGuard)
export class FrontConfigController {
  constructor(private readonly frontConfigService: FrontConfigService) {}

  @Version('1')
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

  @Version('1')
  @Get('chart-info/:logTypeId')
  @ApiOperation({
    summary: 'Get chart info by log type ID',
    description: 'Returns all chart info entries associated with the given log type ID',
  })
  @ApiParam({
    name: 'logTypeId',
    description: 'UUID of the log type',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Chart info entries for the given log type',
    type: ChartInfoItemDto,
    isArray: true,
  })
  async getChartInfoByLogTypeId(
    @Param('logTypeId', ParseUUIDPipe) logTypeId: string
  ): Promise<ChartInfoItemDto[]> {
    return this.frontConfigService.getChartInfoByLogTypeId(logTypeId);
  }
}
