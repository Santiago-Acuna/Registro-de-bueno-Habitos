import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Version,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { validate } from 'class-validator';

import { UUID } from '../../domain/shared/types/common';
import { UploadImageDto } from '../../helpers/cloudinary';
import { PaginatedResponseDto } from '../../infrastructure/dto/paginated-response.dto';
import { ValidationException } from '../../infrastructure/exceptions/app.exceptions';
import { ActionTypeQueryDto } from '../dto/action-type-query.dto';
import { ActionTypeResponseDto } from '../dto/action-type-response.dto';
import { CreateActionTypeDto } from '../dto/create-action-type.dto';
import { UpdateActionTypeDto } from '../dto/update-action-type.dto';
import { ActionTypeFilterOptions } from '../interfaces/action-types-repository.interface';
import { ActionTypesService } from '../services/action-types.service';

@ApiTags('action-types')
@Controller('action-types')
@UseGuards(ThrottlerGuard)
export class ActionTypesController {
  constructor(private readonly actionTypesService: ActionTypesService) {}

  @Post()
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('icon'))
  async create(
    @Body() createActionTypeDto: CreateActionTypeDto,
    @UploadedFile() icon?: Express.Multer.File
  ): Promise<ActionTypeResponseDto> {
    if (icon) {
      const uploadImageDto = new UploadImageDto();
      uploadImageDto.image = icon;

      const errors = await validate(uploadImageDto);
      if (errors.length > 0) {
        const errorGroups = errors.map(err => Object.values(err.constraints ?? {}));
        const nonEmptyGroups = errorGroups.filter(group => group.length > 0);
        const message =
          nonEmptyGroups.length > 0
            ? nonEmptyGroups.map(group => group.join(', ')).join('; ')
            : 'Uncontrolled error with the image you sent';
        throw new ValidationException(message);
      }
    }

    return this.actionTypesService.create(createActionTypeDto, icon);
  }

  @Get()
  @Version('1')
  async findAll(
    @Query() query: ActionTypeQueryDto
  ): Promise<PaginatedResponseDto<ActionTypeResponseDto>> {
    const { page = 1, limit = 10, habitId, hasActions, recentActivityDays } = query;
    const paginationQuery = { page, limit };

    const filterParams: Partial<ActionTypeFilterOptions> = {};
    if (habitId !== undefined) filterParams.habitId = habitId;
    if (hasActions !== undefined) filterParams.hasActions = hasActions;
    if (recentActivityDays !== undefined) filterParams.recentActivityDays = recentActivityDays;

    const filters = this.extractFilters(filterParams);

    return this.actionTypesService.findAll(paginationQuery, filters);
  }

  @Get('habit/:habitId')
  @Version('1')
  async findByHabitId(
    @Param('habitId', ParseUUIDPipe) habitId: UUID,
    @Query() query: ActionTypeQueryDto
  ): Promise<PaginatedResponseDto<ActionTypeResponseDto>> {
    const { page = 1, limit = 10, hasActions, recentActivityDays } = query;
    const paginationQuery = { page, limit };

    const filterParams: Partial<ActionTypeFilterOptions> = {};
    if (hasActions !== undefined) filterParams.hasActions = hasActions;
    if (recentActivityDays !== undefined) {
      filterParams.recentActivityDays = recentActivityDays;
    }

    const filters = this.extractFilters(filterParams);

    return this.actionTypesService.findByHabitId(habitId, paginationQuery, filters);
  }

  @Get(':id')
  @Version('1')
  async findOne(@Param('id', ParseUUIDPipe) id: UUID): Promise<ActionTypeResponseDto> {
    return this.actionTypesService.findOne(id);
  }

  @Patch(':id')
  @Version('1')
  @UseInterceptors(FileInterceptor('icon'))
  async update(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() updateActionTypeDto: UpdateActionTypeDto,
    @UploadedFile() icon?: Express.Multer.File
  ): Promise<ActionTypeResponseDto> {
    if (icon) {
      const uploadImageDto = new UploadImageDto();
      uploadImageDto.image = icon;

      const errors = await validate(uploadImageDto);
      if (errors.length > 0) {
        const errorGroups = errors.map(err => Object.values(err.constraints ?? {}));
        const nonEmptyGroups = errorGroups.filter(group => group.length > 0);
        const message =
          nonEmptyGroups.length > 0
            ? nonEmptyGroups.map(group => group.join(', ')).join('; ')
            : 'Uncontrolled error with the image you sent';
        throw new ValidationException(message);
      }
    }

    return icon
      ? this.actionTypesService.update(id, updateActionTypeDto, icon)
      : this.actionTypesService.update(id, updateActionTypeDto);
  }

  @Delete(':id')
  @Version('1')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: UUID): Promise<void> {
    return this.actionTypesService.remove(id);
  }

  private extractFilters(
    filterParams: Partial<ActionTypeFilterOptions>
  ): ActionTypeFilterOptions | undefined {
    const filters: Partial<ActionTypeFilterOptions> = {};

    if (filterParams.habitId !== undefined) {
      filters.habitId = filterParams.habitId;
    }

    if (filterParams.hasActions !== undefined) {
      filters.hasActions = filterParams.hasActions;
    }

    if (filterParams.recentActivityDays !== undefined) {
      filters.recentActivityDays = filterParams.recentActivityDays;
    }

    return Object.keys(filters).length > 0 ? (filters as ActionTypeFilterOptions) : undefined;
  }
}
