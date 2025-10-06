import { Injectable } from '@nestjs/common';

import { GlobalEntityIdentifier } from '../../domain/entities/global-entity-identifier.entity';
import { Habit } from '../../domain/entities/habit.entity';
import {
  PaginatedResult,
  PaginationParams,
  FilterOptions,
  UUID,
  HabitComplexity,
} from '../../domain/shared/types/common';
import { IdentifierIcon } from '../../domain/value-objects/identifier-icon';
import { IdentifierName } from '../../domain/value-objects/identifier-name';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { NotFoundError } from '../../infrastructure/exceptions/app.exceptions';
import { IHabitsRepository, CreateHabitData } from '../interfaces/habits-repository.interface';

@Injectable()
export class HabitsRepository implements IHabitsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToPrismaHabitType(
    habitType: HabitComplexity
  ): 'simple' | 'complex' | 'withoutIntervals' {
    const mapping = {
      [HabitComplexity.SIMPLE]: 'simple' as const,
      [HabitComplexity.COMPLEX]: 'complex' as const,
      [HabitComplexity.WITHOUT_INTERVALS]: 'withoutIntervals' as const,
    };
    return mapping[habitType];
  }

  async create(data: CreateHabitData): Promise<Habit> {
    try {
      // First, create the habit without global identifier
      const createdHabit = await this.prisma.habits.create({
        data: {
          habitType: this.mapToPrismaHabitType(data.habitType),
        },
      });

      // Then create the global identifier with the habit's ID
      const globalIdentifier = await this.prisma.globalEntityIdentifiers.create({
        data: {
          name: data.name,
          icon: data.icon,
          entityType: 'habit',
          entityId: createdHabit.id,
        },
      });

      // Finally, link the habit to the global identifier
      const updatedHabit = await this.prisma.habits.update({
        where: { id: createdHabit.id },
        data: { globalIdentifierId: globalIdentifier.id },
        include: { globalEntityIdentifiers: true },
      });

      return this.mapToDomain(updatedHabit);
    } catch (error: any) {
      if (error.message) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  async findById(id: UUID): Promise<Habit | null> {
    const data = await this.prisma.habits.findUnique({
      where: { id },
      include: {
        globalEntityIdentifiers: true,
      },
    });

    return data ? this.mapToDomain(data) : null;
  }

  async findAll(
    params: PaginationParams,
    filters?: FilterOptions
  ): Promise<PaginatedResult<Habit>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
    };

    const [data, total] = await Promise.all([
      this.prisma.habits.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          globalEntityIdentifiers: true,
        },
      }),
      this.prisma.habits.count({ where }),
    ]);

    const habits = data.map(item => this.mapToDomain(item));

    return {
      data: habits,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: UUID, habitData: Partial<Habit>): Promise<Habit> {
    const updateData: any = {};

    if (habitData.habitType) {
      updateData.habitType = habitData.habitType;
    }
    if (habitData.isActive !== undefined) {
      updateData.isActive = habitData.isActive;
    }
    if (habitData.totalActionsCount !== undefined) {
      updateData.totalActionsCount = habitData.totalActionsCount;
    }
    if (habitData.lastActionDate !== undefined) {
      updateData.lastActionDate = habitData.lastActionDate;
    }

    try {
      const data = await this.prisma.habits.update({
        where: { id },
        data: updateData,
      });

      return this.mapToDomain(data);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Habit', id);
      }
      throw error;
    }
  }

  async delete(id: UUID): Promise<void> {
    try {
      // Soft delete by setting isActive to false
      await this.prisma.habits.update({
        where: { id },
        data: { isActive: false },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Habit', id);
      }
      throw error;
    }
  }

  async findByName(name: string): Promise<Habit | null> {
    const data = await this.prisma.habits.findFirst({
      where: {
        globalEntityIdentifiers: {
          name,
        },
        isActive: true,
      },
      include: {
        globalEntityIdentifiers: true,
      },
    });

    return data ? this.mapToDomain(data) : null;
  }

  private mapToDomain(data: any): Habit {
    const globalIdentifier = new GlobalEntityIdentifier(
      data.globalEntityIdentifiers.id,
      IdentifierName.create(data.globalEntityIdentifiers.name),
      IdentifierIcon.create(data.globalEntityIdentifiers.icon),
      data.globalEntityIdentifiers.entityType,
      data.globalEntityIdentifiers.entityId
    );

    return new Habit(
      data.id,
      data.habitType as HabitComplexity,
      data.createdAt,
      data.updatedAt,
      data.isActive,
      data.totalActionsCount,
      data.lastActionDate,
      globalIdentifier
    );
  }
}
