import { Injectable } from '@nestjs/common';

import { ActionLog } from '../../domain/entities/action-log.entity';
import {
  FilterOptions,
  PaginatedResult,
  PaginationParams,
  UUID,
} from '../../domain/shared/types/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateActionLogDto } from '../dto/create-action-log.dto';
import {
  LogColumnResponseDto,
  LogColumnValidationResponseDto,
} from '../dto/log-columns-response.dto';
import { IActionLogsRepository } from '../interfaces/action-logs-repository.interface';

@Injectable()
export class ActionLogsRepository implements IActionLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateActionLogDto): Promise<ActionLog> {
    try {
      const actionType = await this.prisma.actionTypes.findUnique({
        where: { id: data.actionTypeId },
      });

      if (!actionType) {
        throw new Error('ActionType not found');
      }

      const createdActionLog = await this.prisma.actionLogs.create({
        data: {
          startTime: data.startTime,
          endTime: data.endTime ?? null,
          actionTypeId: data.actionTypeId,
        },
      });

      return this.mapToDomain(createdActionLog);
    } catch (error) {
      throw error;
    }
  }

  async findById(id: UUID): Promise<ActionLog | null> {
    const actionLog = await this.prisma.actionLogs.findUnique({
      where: { id },
    });

    return actionLog ? this.mapToDomain(actionLog) : null;
  }

  async findAll(
    pagination: PaginationParams,
    filters?: FilterOptions
  ): Promise<PaginatedResult<ActionLog>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const [data, total] = await Promise.all([
      this.prisma.actionLogs.findMany({
        ...(where && { where }),
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      where ? this.prisma.actionLogs.count({ where }) : this.prisma.actionLogs.count(),
    ]);

    const actionLogs = data.map(item => this.mapToDomain(item));

    return {
      data: actionLogs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByActionTypeId(actionTypeId: UUID): Promise<ActionLog[]> {
    const data = await this.prisma.actionLogs.findMany({
      where: { actionTypeId },
      orderBy: { createdAt: 'desc' },
    });

    return data.map(item => this.mapToDomain(item));
  }

  async getLogColumnsByActionTypeId(actionTypeId: UUID): Promise<LogColumnResponseDto[]> {
    try {
      const actionType = await this.prisma.actionTypes.findUnique({
        where: { id: actionTypeId },
        include: {
          logTypes: true,
        },
      });

      if (!actionType) {
        throw new Error('ActionType not found');
      }

      if (!actionType.logTypeId) {
        return [];
      }

      const logColumns = await this.prisma.logColumns.findMany({
        where: {
          logTypeId: actionType.logTypeId,
        },
        include: {
          logColumnValidations: {
            include: {
              validationFunctions: true,
            },
          },
        },
      });

      return logColumns.map(
        (column: {
          id: string;
          name: string;
          type: string;
          logTypeId: string;
          logColumnValidations: Array<{
            id: string;
            validationFunctionId: string;
            validationFunctions: {
              id: string;
              name: string;
              function: string;
              isForFront: boolean;
            };
          }>;
        }) => this.mapToLogColumnResponseDto(column)
      );
    } catch (error) {
      throw error;
    }
  }

  private buildWhereClause(filters?: FilterOptions): Record<string, unknown> | undefined {
    const where: Record<string, unknown> = {};

    if (filters?.actionTypeId) {
      where['actionTypeId'] = filters.actionTypeId;
    }

    if (filters?.startDate ?? filters?.endDate) {
      where['actionDate'] = {};
      if (filters.startDate) {
        (where['actionDate'] as Record<string, unknown>)['gte'] = filters.startDate;
      }
      if (filters.endDate) {
        (where['actionDate'] as Record<string, unknown>)['lte'] = filters.endDate;
      }
    }

    return Object.keys(where).length > 0 ? where : undefined;
  }

  private mapToDomain(data: {
    id: string;
    startTime: Date;
    endTime: Date | null;
    durationSeconds: number | null;
    actionDate: Date;
    actionTypeId: string;
    createdAt: Date;
    updatedAt: Date;
  }): ActionLog {
    return new ActionLog(
      data.id,
      data.startTime,
      data.endTime,
      data.durationSeconds,
      data.actionDate,
      data.actionTypeId,
      data.createdAt,
      data.updatedAt
    );
  }

  private mapToLogColumnResponseDto(data: {
    id: string;
    name: string;
    type: string;
    logTypeId: string;
    logColumnValidations: Array<{
      id: string;
      validationFunctionId: string;
      validationFunctions: {
        id: string;
        name: string;
        function: string;
        isForFront: boolean;
      };
    }>;
  }): LogColumnResponseDto {
    const validations: LogColumnValidationResponseDto[] = data.logColumnValidations.map(
      validation => ({
        id: validation.id,
        validationFunctionId: validation.validationFunctionId,
        functionName: validation.validationFunctions.name,
        functionCode: validation.validationFunctions.function,
        isForFront: validation.validationFunctions.isForFront,
      })
    );

    return {
      id: data.id,
      name: data.name,
      type: data.type as 'text' | 'number' | 'boolean',
      logTypeId: data.logTypeId,
      validations,
    };
  }
}
