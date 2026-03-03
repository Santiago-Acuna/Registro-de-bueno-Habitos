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

import { LogTableStrategyRegistry } from './strategies/log-table-strategy.registry';

@Injectable()
export class ActionLogsRepository implements IActionLogsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly strategyRegistry: LogTableStrategyRegistry
  ) {}

  /**
   * Converts snake_case to camelCase
   */
  private snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  async create(data: CreateActionLogDto): Promise<ActionLog> {
    try {
      // Verify action type exists and get its log type
      const actionType = await this.prisma.actionTypes.findUnique({
        where: { id: data.actionTypeId },
        include: { logTypes: true },
      });

      if (!actionType) {
        throw new Error('ActionType not found');
      }

      // Use provided logTypeId or get it from action type
      const logTypeId = data.logTypeId ?? actionType.logTypeId;

      // Create the action log first
      const createdActionLog = await this.prisma.actionLogs.create({
        data: {
          startTime: data.startTime,
          endTime: data.endTime ?? null,
          actionTypeId: data.actionTypeId,
        },
      });

      // If logTypeInfo is provided, create specialized log entry
      if (data.logTypeInfo && logTypeId) {
        await this.createSpecializedLog(
          createdActionLog.id,
          logTypeId,
          actionType.logTypes?.name,
          data.logTypeInfo
        );
      }

      return this.mapToDomain(createdActionLog);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Creates a specialized log entry based on the log type using dynamic column mapping
   * @param actionLogId - The ID of the created action log
   * @param logTypeId - The ID of the log type
   * @param logTypeName - The name of the log type (to determine which table to use)
   * @param logTypeInfo - The data for the specialized log
   */
  private async createSpecializedLog(
    actionLogId: UUID,
    logTypeId: UUID,
    logTypeName: string | undefined,
    logTypeInfo: Record<string, unknown>
  ): Promise<void> {
    if (!logTypeName) {
      // If no log type name, fetch it
      const logType = await this.prisma.logTypes.findUnique({
        where: { id: logTypeId },
        select: { name: true },
      });
      logTypeName = logType?.name;
    }

    if (!logTypeName) {
      throw new Error('Log type name not found');
    }

    // Fetch log columns to build data dynamically
    const rawLogColumns = await this.prisma.logColumns.findMany({
      where: { logTypeId },
      select: { name: true, type: true },
    });

    // Convert snake_case column names to camelCase
    const logColumns = rawLogColumns.map(col => ({
      name: this.snakeToCamel(col.name),
      type: col.type,
    }));

    // Build data object dynamically based on log columns
    const data = this.buildLogData(actionLogId, logTypeInfo, logColumns);

    // Determine which table to use and insert
    await this.insertIntoSpecializedTable(logTypeName, data);
  }

  /**
   * Builds log data object dynamically based on log columns
   * @param actionLogId - The action log ID to associate with
   * @param logTypeInfo - The input data
   * @param logColumns - Column definitions from database
   * @returns Data object ready for insertion
   */
  private buildLogData(
    actionLogId: UUID,
    logTypeInfo: Record<string, unknown>,
    logColumns: Array<{ name: string; type: string }>
  ): Record<string, unknown> {
    const data: Record<string, unknown> = {
      actionId: actionLogId,
    };

    for (const column of logColumns) {
      const value = logTypeInfo[column.name];

      if (value === undefined || value === null) {
        data[column.name] = null;
        continue;
      }

      // Type conversion based on column type
      switch (column.type) {
        case 'text':
          data[column.name] = String(value);
          break;
        case 'number':
          data[column.name] = Number(value);
          break;
        case 'boolean':
          data[column.name] = Boolean(value);
          break;
        default:
          data[column.name] = value;
      }
    }

    return data;
  }

  /**
   * Inserts data into the appropriate specialized log table based on log type name
   * Uses the Strategy Pattern to delegate to the appropriate strategy
   * @param logTypeName - Name of the log type
   * @param data - Data to insert
   */
  private async insertIntoSpecializedTable(
    logTypeName: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const strategy = this.strategyRegistry.getStrategy(logTypeName);
    await strategy.create(data);
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
          selectSource: string | null;
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
    selectSource: string | null;
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
      name: this.snakeToCamel(data.name),
      type: data.type as 'text' | 'number' | 'boolean' | 'select_simple' | 'select_multiple',
      logTypeId: data.logTypeId,
      selectSource: data.selectSource,
      validations,
    };
  }
}
