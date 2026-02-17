import { Controller, Get, Param, ParseIntPipe, UseGuards, Version } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

import { ExternalDependencyResponseDto } from '../dto/external-dependency-response.dto';
import { ExternalDependenciesService } from '../services/external-dependencies.service';

@ApiTags('external-dependencies')
@Controller('external-dependencies')
@UseGuards(ThrottlerGuard)
export class ExternalDependenciesController {
  constructor(private readonly externalDependenciesService: ExternalDependenciesService) {}

  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Get all external dependencies' })
  @ApiResponse({
    status: 200,
    description: 'List of all external dependencies',
    type: [ExternalDependencyResponseDto],
  })
  async findAll(): Promise<ExternalDependencyResponseDto[]> {
    return this.externalDependenciesService.findAll();
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: 'Get external dependency by ID' })
  @ApiResponse({
    status: 200,
    description: 'External Dependency found',
    type: ExternalDependencyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'External Dependency not found',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ExternalDependencyResponseDto> {
    return this.externalDependenciesService.findOne(id);
  }
}
