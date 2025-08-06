import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Version,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

import { HabitsService } from '../services/habits.service';
import { CreateHabitDto } from '../dto/create-habit.dto';
import { UpdateHabitDto } from '../dto/update-habit.dto';
import { HabitResponseDto } from '../dto/habit-response.dto';
import { PaginationQueryDto } from '../../infrastructure/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../../infrastructure/dto/paginated-response.dto';
import { UUID } from '../../domain/shared/types/common';

@ApiTags('habits')
@Controller('habits')
@UseGuards(ThrottlerGuard)
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new habit',
    description: 'Creates a new habit with the provided information. Habit names must be unique.',
  })
  @ApiBody({ type: CreateHabitDto })
  @ApiResponse({
    status: 201,
    description: 'Habit created successfully',
    type: HabitResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
    schema: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
        statusCode: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Habit with the same name already exists',
  })
  async create(@Body() createHabitDto: CreateHabitDto): Promise<HabitResponseDto> {
    return this.habitsService.create(createHabitDto);
  }

  @Get()
  @Version('1')
  @ApiOperation({ 
    summary: 'Get all habits',
    description: 'Retrieves a paginated list of habits with optional filtering.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of habits retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/HabitResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('isActive') isActive?: boolean
  ): Promise<PaginatedResponseDto<HabitResponseDto>> {
    const filters = isActive !== undefined ? { isActive } : undefined;
    return this.habitsService.findAll(paginationQuery, filters);
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ 
    summary: 'Get habit by ID',
    description: 'Retrieves a specific habit by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Unique identifier of the habit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Habit retrieved successfully',
    type: HabitResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Habit not found',
  })
  async findOne(@Param('id') id: UUID): Promise<HabitResponseDto> {
    return this.habitsService.findOne(id);
  }

  @Patch(':id')
  @Version('1')
  @ApiOperation({ 
    summary: 'Update habit',
    description: 'Updates a habit with the provided information. Only provided fields will be updated.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Unique identifier of the habit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateHabitDto })
  @ApiResponse({
    status: 200,
    description: 'Habit updated successfully',
    type: HabitResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Habit not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Habit with the same name already exists',
  })
  async update(
    @Param('id') id: UUID,
    @Body() updateHabitDto: UpdateHabitDto
  ): Promise<HabitResponseDto> {
    return this.habitsService.update(id, updateHabitDto);
  }

  @Delete(':id')
  @Version('1')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete habit',
    description: 'Soft deletes a habit by setting its status to inactive.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Unique identifier of the habit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Habit deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Habit not found',
  })
  async remove(@Param('id') id: UUID): Promise<void> {
    return this.habitsService.remove(id);
  }

  @Post(':id/increment-action')
  @Version('1')
  @ApiOperation({ 
    summary: 'Increment habit action count',
    description: 'Increments the action count for a habit and updates the last action date.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Unique identifier of the habit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Action count incremented successfully',
    type: HabitResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Habit not found',
  })
  async incrementActionCount(@Param('id') id: UUID): Promise<HabitResponseDto> {
    return this.habitsService.incrementActionCount(id);
  }
}