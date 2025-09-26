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
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { validate } from 'class-validator';

import { UUID } from '../../domain/shared/types/common';
import { UploadImageDto } from '../../helpers/cloudinary';
import { ApiFile } from '../../infrastructure/decorators';
import { PaginatedResponseDto } from '../../infrastructure/dto/paginated-response.dto';
import { ValidationException } from '../../infrastructure/exceptions/app.exceptions';
import { CreateHabitDto } from '../dto/create-habit.dto';
import { HabitResponseDto } from '../dto/habit-response.dto';
import { HabitsQueryDto } from '../dto/habits-query.dto';
import { UpdateHabitDto } from '../dto/update-habit.dto';
import { HabitsService } from '../services/habits.service';

@ApiTags('habits')
@Controller('habits')
@UseGuards(ThrottlerGuard)
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}
  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new habit',
    description: 'Creates a new habit with the provided information. Habit names must be unique.',
  })
  @ApiFile('logo')
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
  async create(
    @Body() createHabitDto: CreateHabitDto,
    @UploadedFile() logo: Express.Multer.File
  ): Promise<HabitResponseDto> {
    const uploadImageDto = new UploadImageDto();
    uploadImageDto.image = logo;

    const errors = await validate(uploadImageDto);
    if (errors.length > 0) {
      const errorGroups = errors.map(err => Object.values(err.constraints || {}));
      const nonEmptyGroups = errorGroups.filter(group => group.length > 0);
      const message = nonEmptyGroups.length > 0
        ? nonEmptyGroups.map(group => group.join(', ')).join('; ')
        : 'Uncontrolled error with the image you sent';
      throw new ValidationException(message);
    }

    return this.habitsService.create(createHabitDto, logo);
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
    @Query() query: HabitsQueryDto
  ): Promise<PaginatedResponseDto<HabitResponseDto>> {
    const { page = 1, limit = 10, isActive } = query;
    const paginationQuery = { page, limit };
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
  async findOne(@Param('id', ParseUUIDPipe) id: UUID): Promise<HabitResponseDto> {
    return this.habitsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('logo'))
  @Version('1')
  @ApiOperation({
    summary: 'Update habit',
    description:
      'Updates a habit with the provided information. Only provided fields will be updated.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Unique identifier of the habit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiFile('logo')
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
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() updateHabitDto: UpdateHabitDto,
    @UploadedFile() logo?: Express.Multer.File
  ): Promise<HabitResponseDto> {
    // Validate logo if provided
    if (logo) {
      const uploadImageDto = new UploadImageDto();
      uploadImageDto.image = logo;

      const errors = await validate(uploadImageDto);
      if (errors.length > 0) {
        const errorGroups = errors.map(err => Object.values(err.constraints || {}));
        const nonEmptyGroups = errorGroups.filter(group => group.length > 0);
        const message = nonEmptyGroups.length > 0
          ? nonEmptyGroups.map(group => group.join(', ')).join('; ')
          : 'Uncontrolled error with the image you sent';
        throw new ValidationException(message);
      }
    }

    return logo ? this.habitsService.update(id, updateHabitDto, logo) : this.habitsService.update(id, updateHabitDto);
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
  async remove(@Param('id', ParseUUIDPipe) id: UUID): Promise<void> {
    return this.habitsService.remove(id);
  }

}
