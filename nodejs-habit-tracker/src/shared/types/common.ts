export type UUID = string;

export interface BaseEntity {
  readonly id: UUID;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface SoftDeletable {
  readonly isActive: boolean;
}

export enum HabitComplexity {
  COMPLEX = 'Complex',
  SIMPLE = 'Simple',
  WITHOUT_INTERVALS = 'Without Intervals',
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterOptions {
  isActive?: boolean;
}