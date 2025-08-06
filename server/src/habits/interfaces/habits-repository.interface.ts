import { Habit } from '../../domain/entities/habit.entity';
import { PaginatedResult, PaginationParams, FilterOptions, UUID } from '../../domain/shared/types/common';

export interface IHabitsRepository {
  create(habit: Habit): Promise<Habit>;
  findById(id: UUID): Promise<Habit | null>;
  findAll(params: PaginationParams, filters?: FilterOptions): Promise<PaginatedResult<Habit>>;
  update(id: UUID, habit: Partial<Habit>): Promise<Habit>;
  delete(id: UUID): Promise<void>;
  findByName(name: string): Promise<Habit | null>;
  incrementActionCount(id: UUID): Promise<Habit>;
}