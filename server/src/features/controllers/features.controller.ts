import { Controller, Get, Param, Query, UseGuards, Version } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

import { FeatureResponseDto } from '../dto/feature-response.dto';
import { FeaturesQueryDto } from '../dto/features-query.dto';
import { FeaturesService } from '../services/features.service';

@ApiTags('features')
@Controller('features')
@UseGuards(ThrottlerGuard)
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Get all features with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of features',
    type: [FeatureResponseDto],
  })
  async findAll(@Query() query: FeaturesQueryDto): Promise<FeatureResponseDto[]> {
    const filters = {
      ...(query.ready !== undefined && { ready: query.ready }),
      ...(query.completedAt !== undefined && { completedAt: new Date(query.completedAt) }),
    };

    return this.featuresService.findAll(Object.keys(filters).length > 0 ? filters : undefined);
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: 'Get feature by ID' })
  @ApiResponse({
    status: 200,
    description: 'Feature found',
    type: FeatureResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Feature not found',
  })
  async findOne(@Param('id') id: string): Promise<FeatureResponseDto> {
    return this.featuresService.findOne(id);
  }
}
