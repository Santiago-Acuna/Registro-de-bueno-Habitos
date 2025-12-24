import { Inject, Injectable, Logger } from '@nestjs/common';

import { ActionLog } from '../../domain/entities/action-log.entity';
import { UUID, FilterOptions } from '../../domain/shared/types/common';
import { PaginatedResponseDto } from '../../infrastructure/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../infrastructure/dto/pagination-query.dto';
import { NotFoundError, ValidationException } from '../../infrastructure/exceptions/app.exceptions';
import { ActionLogResponseDto } from '../dto/action-log-response.dto';
import { CreateActionLogDto } from '../dto/create-action-log.dto';
import { LogColumnResponseDto } from '../dto/log-columns-response.dto';
import { IActionLogsRepository } from '../interfaces/action-logs-repository.interface';

@Injectable()
export class ActionLogsService {
  private readonly logger = new Logger(ActionLogsService.name);

  constructor(
    @Inject('IActionLogsRepository')
    private readonly actionLogsRepository: IActionLogsRepository
  ) {}

  async create(dto: CreateActionLogDto): Promise<ActionLogResponseDto> {
    this.logger.log(`Creating new action log for action type: ${dto.actionTypeId}`);

    // Validate endTime >= startTime
    if (dto.endTime && dto.endTime < dto.startTime) {
      throw new ValidationException('End time must be after or equal to start time');
    }

    try {
      const actionLog = await this.actionLogsRepository.create(dto);

      this.logger.log(`Successfully created action log with id: ${actionLog.id}`);

      return this.mapToResponse(actionLog);
    } catch (error) {
      // Handle repository errors
      if (error instanceof Error && error.message.includes('ActionType not found')) {
        throw new NotFoundError('ActionType', dto.actionTypeId);
      }
      throw error;
    }
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
    filters?: FilterOptions
  ): Promise<PaginatedResponseDto<ActionLogResponseDto>> {
    const page = paginationQuery.page ?? 1;
    const limit = paginationQuery.limit ?? 10;

    this.logger.log(`Fetching action logs - page: ${page}, limit: ${limit}`);

    const paginatedResult = await this.actionLogsRepository.findAll({ page, limit }, filters);

    const responseDtos = paginatedResult.data.map(actionLog => this.mapToResponse(actionLog));

    return new PaginatedResponseDto(
      responseDtos,
      paginatedResult.total,
      paginatedResult.page,
      paginatedResult.limit
    );
  }

  async findOne(id: UUID): Promise<ActionLogResponseDto> {
    this.logger.log(`Fetching action log with id: ${id}`);

    const actionLog = await this.actionLogsRepository.findById(id);

    if (!actionLog) {
      throw new NotFoundError('ActionLog', id);
    }

    return this.mapToResponse(actionLog);
  }

  async getLogColumnsByActionTypeId(actionTypeId: UUID): Promise<LogColumnResponseDto[]> {
    this.logger.log(`Fetching log columns for action type: ${actionTypeId}`);

    try {
      const logColumns = await this.actionLogsRepository.getLogColumnsByActionTypeId(actionTypeId);
      return logColumns;
    } catch (error) {
      if (error instanceof Error && error.message.includes('ActionType not found')) {
        throw new NotFoundError(`ActionType with id ${actionTypeId} not found`);
      }
      throw error;
    }
  }

  private mapToResponse(actionLog: ActionLog): ActionLogResponseDto {
    return {
      id: actionLog.id,
      startTime: actionLog.startTime,
      endTime: actionLog.endTime,
      durationSeconds: actionLog.durationSeconds,
      actionDate: actionLog.actionDate,
      actionTypeId: actionLog.actionTypeId,
      createdAt: actionLog.createdAt,
      updatedAt: actionLog.updatedAt,
    };
  }
}
