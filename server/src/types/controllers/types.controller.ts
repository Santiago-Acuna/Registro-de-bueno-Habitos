import { Controller, Get, Param, ParseIntPipe, UseGuards, Version } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

import { TypeResponseDto } from '../dto/type-response.dto';
import { TypesService } from '../services/types.service';

@ApiTags('types')
@Controller('types')
@UseGuards(ThrottlerGuard)
export class TypesController {
  constructor(private readonly typesService: TypesService) {}

  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Get all types' })
  @ApiResponse({
    status: 200,
    description: 'List of all types',
    type: [TypeResponseDto],
  })
  async findAll(): Promise<TypeResponseDto[]> {
    return this.typesService.findAll();
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: 'Get type by ID' })
  @ApiResponse({
    status: 200,
    description: 'Type found',
    type: TypeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Type not found',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TypeResponseDto> {
    return this.typesService.findOne(id);
  }
}
