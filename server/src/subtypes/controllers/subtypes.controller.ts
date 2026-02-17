import { Controller, Get, Param, ParseIntPipe, Query, UseGuards, Version } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

import { SubtypeQueryDto } from '../dto/subtype-query.dto';
import { SubtypeResponseDto } from '../dto/subtype-response.dto';
import { SubtypesService } from '../services/subtypes.service';

@ApiTags('subtypes')
@Controller('subtypes')
@UseGuards(ThrottlerGuard)
export class SubtypesController {
  constructor(private readonly subtypesService: SubtypesService) {}

  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Get all subtypes' })
  @ApiResponse({
    status: 200,
    description: 'List of all subtypes',
    type: [SubtypeResponseDto],
  })
  async findAll(@Query() query: SubtypeQueryDto): Promise<SubtypeResponseDto[]> {
    const filters = query.typeId ? { typeId: query.typeId } : undefined;
    return this.subtypesService.findAll(filters);
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: 'Get subtype by ID' })
  @ApiResponse({
    status: 200,
    description: 'Subtype found',
    type: SubtypeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Subtype not found',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SubtypeResponseDto> {
    return this.subtypesService.findOne(id);
  }
}
