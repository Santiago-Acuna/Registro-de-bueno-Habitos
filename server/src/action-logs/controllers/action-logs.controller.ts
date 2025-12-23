import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

import { UUID, FilterOptions } from '../../domain/shared/types/common';
import { PaginatedResponseDto } from '../../infrastructure/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../infrastructure/dto/pagination-query.dto';
import { ActionLogResponseDto } from '../dto/action-log-response.dto';
import { ActionLogsQueryDto } from '../dto/action-logs-query.dto';
import { CreateActionLogDto } from '../dto/create-action-log.dto';
import { ActionLogsService } from '../services/action-logs.service';

@ApiTags('action-logs')
@Controller('action-logs')
@UseGuards(ThrottlerGuard)
export class ActionLogsController {
  constructor(private readonly actionLogsService: ActionLogsService) {}

  @Post()
  @Version('1')
  @ApiOperation({ summary: 'Create a new action log' })
  @ApiBody({ type: CreateActionLogDto })
  @ApiResponse({
    status: 201,
    description: 'Action log created successfully',
    type: ActionLogResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Action type not found' })
  async create(@Body() createActionLogDto: CreateActionLogDto): Promise<ActionLogResponseDto> {
    return this.actionLogsService.create(createActionLogDto);
  }

  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Get all action logs with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of action logs',
    type: PaginatedResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  async findAll(
    @Query() query: ActionLogsQueryDto
  ): Promise<PaginatedResponseDto<ActionLogResponseDto>> {
    const { page, limit, actionTypeId, startDate, endDate } = query;

    const paginationQuery: PaginationQueryDto = {
      page: page || 1,
      limit: limit || 10,
    };

    const filters: FilterOptions | undefined =
      actionTypeId || startDate || endDate
        ? {
            ...(actionTypeId && { actionTypeId }),
            ...(startDate && { startDate }),
            ...(endDate && { endDate }),
          }
        : undefined;

    return this.actionLogsService.findAll(paginationQuery, filters);
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: 'Get action log by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Action log ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Action log found',
    type: ActionLogResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Action log not found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  async findOne(@Param('id', ParseUUIDPipe) id: UUID): Promise<ActionLogResponseDto> {
    return this.actionLogsService.findOne(id);
  }
}
