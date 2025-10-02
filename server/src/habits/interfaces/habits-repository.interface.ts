import { Habit } from '../../domain/entities/habit.entity';
import {
  PaginatedResult,
  PaginationParams,
  FilterOptions,
  UUID,
  HabitComplexity,
} from '../../domain/shared/types/common';

export interface CreateHabitData {
  name: string;
  habitType: HabitComplexity;
  icon: string;
}

export interface IHabitsRepository {
  create(data: CreateHabitData): Promise<Habit>;
  findById(id: UUID): Promise<Habit | null>;
  findAll(params: PaginationParams, filters?: FilterOptions): Promise<PaginatedResult<Habit>>;
  update(id: UUID, habit: Partial<Habit>): Promise<Habit>;
  delete(id: UUID): Promise<void>;
  findByName(name: string): Promise<Habit | null>;
}
