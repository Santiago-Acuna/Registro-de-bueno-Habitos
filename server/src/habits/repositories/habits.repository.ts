import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from '../../infrastructure/database/prisma.service';
import { IHabitsRepository } from '../interfaces/habits-repository.interface';
import { Habit } from '../../domain/entities/habit.entity';
import { HabitName } from '../../domain/value-objects/habit-name';
import { 
  PaginatedResult, 
  PaginationParams, 
  FilterOptions, 
  UUID, 
  HabitComplexity 
} from '../../domain/shared/types/common';
import { NotFoundError } from '../../infrastructure/exceptions/app.exceptions';

@Injectable()
export class HabitsRepository implements IHabitsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(habit: Habit): Promise<Habit> {
    const data = await this.prisma.habit.create({
      data: {
        id: uuidv4(),
        name: habit.name.getValue(),
        habitType: habit.habitType as any, // Prisma enum mapping
        logo: habit.logo,
        isActive: habit.isActive,
        totalActionsCount: habit.totalActionsCount,
        lastActionDate: habit.lastActionDate,
      },
    });

    return this.mapToDomain(data);
  }

  async findById(id: UUID): Promise<Habit | null> {
    const data = await this.prisma.habit.findUnique({
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
      this.prisma.habit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.habit.count({ where }),
    ]);

    const habits = data.map((item) => this.mapToDomain(item));

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
      const data = await this.prisma.habit.update({
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
      await this.prisma.habit.update({
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
    const data = await this.prisma.habit.findFirst({
      where: { 
        name,
        isActive: true,
      },
    });

    return data ? this.mapToDomain(data) : null;
  }

  async incrementActionCount(id: UUID): Promise<Habit> {
    try {
      const data = await this.prisma.habit.update({
        where: { id },
        data: {
          totalActionsCount: { increment: 1 },
          lastActionDate: new Date(),
        },
      });

      return this.mapToDomain(data);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Habit', id);
      }
      throw error;
    }
  }

  private mapToDomain(data: any): Habit {
    const habitName = HabitName.create(data.name);
    
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