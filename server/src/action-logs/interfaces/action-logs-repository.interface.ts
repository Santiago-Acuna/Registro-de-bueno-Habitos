import { ActionLog } from '../../domain/entities/action-log.entity';
import {
  UUID,
  PaginatedResult,
  PaginationParams,
  FilterOptions,
} from '../../domain/shared/types/common';
import { CreateActionLogDto } from '../dto/create-action-log.dto';

export interface IActionLogsRepository {
  create(data: CreateActionLogDto): Promise<ActionLog>;
  findById(id: UUID): Promise<ActionLog | null>;
  findAll(
    pagination: PaginationParams,
    filters?: FilterOptions
  ): Promise<PaginatedResult<ActionLog>>;
  findByActionTypeId(actionTypeId: UUID): Promise<ActionLog[]>;
}
