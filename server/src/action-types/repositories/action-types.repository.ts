import { Injectable } from '@nestjs/common';

import { ActionType } from '../../domain/entities/action-type.entity';
import { GlobalEntityIdentifier } from '../../domain/entities/global-entity-identifier.entity';
import { PaginatedResult, PaginationParams, UUID } from '../../domain/shared/types/common';
import { IdentifierIcon } from '../../domain/value-objects/identifier-icon';
import { IdentifierName } from '../../domain/value-objects/identifier-name';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ConflictError, NotFoundError } from '../../infrastructure/exceptions/app.exceptions';
import {
  ActionTypeFilterOptions,
  ActionTypeStats,
  CreateActionTypeData,
  IActionTypesRepository,
  UpdateActionTypeData,
} from '../interfaces/action-types-repository.interface';

@Injectable()
export class ActionTypesRepository implements IActionTypesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateActionTypeData): Promise<ActionType> {
    try {
      // Validate required habitId
      if (!data.habitId || data.habitId.trim() === '') {
        throw new Error('habitId is required and must be a valid UUID');
      }

      // Step 1: Create a log type for this action type
      const logType = await this.prisma.logTypes.create({
        data: {
          name: `${data.name}_log_type`,
        },
      });

      // Step 2: Create action type with habitId and logTypeId
      const createdActionType = await this.prisma.actionTypes.create({
        data: {
          habitId: data.habitId,
          logTypeId: logType.id,
        },
      });

      // Step 3: Create global identifier with name, icon, entityType, entityId
      const globalIdentifier = await this.prisma.globalEntityIdentifiers.create({
        data: {
          name: data.name,
          icon: data.icon,
          entityType: 'action_type',
          entityId: createdActionType.id,
        },
      });

      // Step 4: Update action type to link globalIdentifierId
      const updatedActionType = await this.prisma.actionTypes.update({
        where: { id: createdActionType.id },
        data: { globalIdentifierId: globalIdentifier.id },
        include: { globalEntityIdentifiers: true },
      });

      return this.mapToDomain(updatedActionType as never);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        throw new ConflictError(
          `ActionType with name '${data.name}' already exists for this habit`
        );
      }
      throw error;
    }
  }

  async findById(id: UUID): Promise<ActionType | null> {
    const data = await this.prisma.actionTypes.findUnique({
      where: { id },
      include: { globalEntityIdentifiers: true },
    });

    return data ? this.mapToDomain(data as never) : null;
  }

  async findAll(
    params: PaginationParams,
    filters?: ActionTypeFilterOptions
  ): Promise<PaginatedResult<ActionType>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters) as never;

    const [data, total] = await Promise.all([
      this.prisma.actionTypes.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { globalEntityIdentifiers: true },
      }),
      this.prisma.actionTypes.count({ where }),
    ]);

    const actionTypes = data.map(item => this.mapToDomain(item as never));

    return {
      data: actionTypes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByHabitId(
    habitId: UUID,
    params: PaginationParams,
    filters?: ActionTypeFilterOptions
  ): Promise<PaginatedResult<ActionType>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause({ ...filters, habitId }) as never;

    const [data, total] = await Promise.all([
      this.prisma.actionTypes.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { globalEntityIdentifiers: true },
      }),
      this.prisma.actionTypes.count({ where }),
    ]);

    const actionTypes = data.map(item => this.mapToDomain(item as never));

    return {
      data: actionTypes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByNameAndHabitId(name: string, habitId: UUID): Promise<ActionType | null> {
    const data = await this.prisma.actionTypes.findFirst({
      where: {
        globalEntityIdentifiers: {
          name,
        },
        habitId,
      },
      include: { globalEntityIdentifiers: true },
    });

    return data ? this.mapToDomain(data as never) : null;
  }

  async update(id: UUID, data: UpdateActionTypeData): Promise<ActionType> {
    try {
      const updatedActionType = await this.prisma.actionTypes.update({
        where: { id },
        data: data as never,
        include: { globalEntityIdentifiers: true },
      });

      return this.mapToDomain(updatedActionType as never);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'P2025') {
          throw new NotFoundError(`ActionType with id ${id} not found`);
        }
        if (error.code === 'P2002') {
          throw new ConflictError(`ActionType with this name already exists for this habit`);
        }
      }
      throw error;
    }
  }

  async delete(id: UUID): Promise<void> {
    try {
      await this.prisma.actionTypes.delete({
        where: { id },
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        throw new NotFoundError(`ActionType with id ${id} not found`);
      }
      throw error;
    }
  }

  async findMostActive(limit: number): Promise<ActionType[]> {
    const data = await this.prisma.actionTypes.findMany({
      take: limit,
      orderBy: { totalActionsCount: 'desc' },
      where: { totalActionsCount: { gt: 0 } },
      include: { globalEntityIdentifiers: true },
    });

    return data.map(item => this.mapToDomain(item as never));
  }

  async findRecentlyActive(days: number, limit: number): Promise<ActionType[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const data = await this.prisma.actionTypes.findMany({
      take: limit,
      orderBy: { lastActionDate: 'desc' },
      where: {
        lastActionDate: {
          gte: cutoffDate,
        },
      },
      include: { globalEntityIdentifiers: true },
    });

    return data.map(item => this.mapToDomain(item as never));
  }

  async count(filters?: ActionTypeFilterOptions): Promise<number> {
    const where = this.buildWhereClause(filters) as never;
    return this.prisma.actionTypes.count({ where });
  }

  async countByHabitId(habitId: UUID, filters?: ActionTypeFilterOptions): Promise<number> {
    const where = this.buildWhereClause({ ...filters, habitId }) as never;
    return this.prisma.actionTypes.count({ where });
  }

  async existsByNameAndHabitId(name: string, habitId: UUID): Promise<boolean> {
    const data = await this.prisma.actionTypes.findFirst({
      where: {
        globalEntityIdentifiers: {
          name,
        },
        habitId,
      },
    });

    return data !== null;
  }

  async bulkUpdateActionCounts(
    updates: Array<{ id: UUID; incrementBy: number; actionDate: Date }>
  ): Promise<ActionType[]> {
    const operations = updates.map(update =>
      this.prisma.actionTypes.update({
        where: { id: update.id },
        data: {
          totalActionsCount: { increment: update.incrementBy },
          lastActionDate: update.actionDate,
        },
        include: { globalEntityIdentifiers: true },
      })
    );

    const results = await this.prisma.$transaction(operations);
    return results.map(item => this.mapToDomain(item as never));
  }

  async findInactive(days: number, params: PaginationParams): Promise<PaginatedResult<ActionType>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const where = {
      OR: [{ lastActionDate: null }, { lastActionDate: { lt: cutoffDate } }],
    };

    const [data, total] = await Promise.all([
      this.prisma.actionTypes.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { globalEntityIdentifiers: true },
      }),
      this.prisma.actionTypes.count({ where }),
    ]);

    const actionTypes = data.map(item => this.mapToDomain(item as never));

    return {
      data: actionTypes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStatsByHabitId(habitId: UUID): Promise<ActionTypeStats> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [stats, activeCount, recentCount, mostActive, leastActive] = await Promise.all([
      this.prisma.actionTypes.aggregate({
        where: { habitId },
        _count: { id: true },
        _sum: { totalActionsCount: true },
        _avg: { totalActionsCount: true },
        _max: { totalActionsCount: true },
        _min: { totalActionsCount: true },
      }),
      this.prisma.actionTypes.count({
        where: { habitId, totalActionsCount: { gt: 0 } },
      }),
      this.prisma.actionTypes.count({
        where: { habitId, lastActionDate: { gte: sevenDaysAgo } },
      }),
      this.prisma.actionTypes.findFirst({
        where: { habitId },
        orderBy: { totalActionsCount: 'desc' },
        include: { globalEntityIdentifiers: true },
      }),
      this.prisma.actionTypes.findFirst({
        where: { habitId },
        orderBy: { totalActionsCount: 'asc' },
        include: { globalEntityIdentifiers: true },
      }),
    ]);

    const result: ActionTypeStats = {
      totalActionTypes: stats._count.id,
      activeActionTypes: activeCount,
      totalActions: stats._sum.totalActionsCount ?? 0,
      averageActionsPerType: stats._avg.totalActionsCount ?? 0,
      recentlyActiveCount: recentCount,
    };

    if (mostActive && mostActive.globalEntityIdentifiers) {
      result.mostActiveActionType = {
        id: mostActive.id,
        name: mostActive.globalEntityIdentifiers.name,
        totalActionsCount: mostActive.totalActionsCount,
      };
    }

    if (leastActive && leastActive.globalEntityIdentifiers) {
      result.leastActiveActionType = {
        id: leastActive.id,
        name: leastActive.globalEntityIdentifiers.name,
        totalActionsCount: leastActive.totalActionsCount,
      };
    }

    return result;
  }

  private buildWhereClause(filters?: ActionTypeFilterOptions): Record<string, never> | undefined {
    const where: Record<string, never> = {} as never;

    if (filters?.habitId) {
      where['habitId'] = filters.habitId as never;
    }

    if (filters?.hasActions) {
      where['totalActionsCount'] = { gt: 0 } as never;
    }

    if (filters?.recentActivityDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - filters.recentActivityDays);
      where['lastActionDate'] = { gte: cutoffDate } as never;
    }

    return Object.keys(where).length > 0 ? where : undefined;
  }

  private mapToDomain(data: {
    id: string;
    habitId: string;
    createdAt: Date;
    updatedAt: Date;
    totalActionsCount: number;
    lastActionDate: Date | null;
    globalEntityIdentifiers: {
      id: string;
      name: string;
      icon: string | null;
      entityType: string;
      entityId: string;
    };
  }): ActionType {
    const globalIdentifier = new GlobalEntityIdentifier(
      data.globalEntityIdentifiers.id,
      IdentifierName.create(data.globalEntityIdentifiers.name),
      data.globalEntityIdentifiers.icon ? IdentifierIcon.create(data.globalEntityIdentifiers.icon) : null,
      data.globalEntityIdentifiers.entityType,
      data.globalEntityIdentifiers.entityId
    );

    return new ActionType(
      data.id,
      data.habitId,
      data.createdAt,
      data.updatedAt,
      data.totalActionsCount,
      data.lastActionDate,
      globalIdentifier
    );
  }
}
