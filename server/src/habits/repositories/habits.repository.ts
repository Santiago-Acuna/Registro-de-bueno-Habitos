import { Injectable } from '@nestjs/common';

import { Habit } from '../../domain/entities/habit.entity';
import {
  PaginatedResult,
  PaginationParams,
  FilterOptions,
  UUID,
  HabitComplexity,
} from '../../domain/shared/types/common';
import { IdentifierName } from '../../domain/value-objects/identifier-name';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { NotFoundError } from '../../infrastructure/exceptions/app.exceptions';
import { IHabitsRepository, CreateHabitData } from '../interfaces/habits-repository.interface';

@Injectable()
export class HabitsRepository implements IHabitsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateHabitData): Promise<Habit> {
    try {
      const createdHabit = await this.prisma.habits.create({
        data: {
          name: data.name,
          habitType: data.habitType as any, // Prisma enum mapping
          logo: data.logo,
          // Database provides defaults for:
          // - id (auto-generated)
          // - isActive (default: true)
          // - totalActionsCount (default: 0)
          // - lastActionDate (default: null)
          // - createdAt (auto-generated)
          // - updatedAt (auto-generated)
        },
      });

      return this.mapToDomain(createdHabit);
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

    if (habitData.name) {
      updateData.name = habitData.name.getValue();
    }
    if (habitData.logo) {
      updateData.logo = habitData.logo;
    }
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
        name,
        isActive: true,
      },
    });

    return data ? this.mapToDomain(data) : null;
  }


  private mapToDomain(data: any): Habit {
    const habitName = IdentifierName.create(data.name);

    return new Habit(
      data.id,
      habitName,
      data.habitType as HabitComplexity,
      data.logo,
      data.createdAt,
      data.updatedAt,
      data.isActive,
      data.totalActionsCount,
      data.lastActionDate
    );
  }
}
