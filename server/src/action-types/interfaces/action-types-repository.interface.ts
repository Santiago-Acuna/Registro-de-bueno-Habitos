import { ActionType } from '../../domain/entities/action-type.entity';
import {
  PaginatedResult,
  PaginationParams,
  FilterOptions,
  UUID,
} from '../../domain/shared/types/common';

export interface CreateActionTypeData {
  name: string;
  icon?: string;
  habitId: UUID;
}

export interface UpdateActionTypeData {
  name?: string;
  icon?: string;
}

export interface ActionTypeFilterOptions extends FilterOptions {
  habitId?: UUID;
  hasActions?: boolean;
  recentActivityDays?: number; // Filter by recent activity within X days
}

export interface IActionTypesRepository {
  /**
   * Create a new action type
   * @param data - Action type creation data
   * @returns Promise<ActionType> - Created action type entity
   * @throws ConflictError if name already exists for the habit
   */
  create(data: CreateActionTypeData): Promise<ActionType>;

  /**
   * Find action type by ID
   * @param id - Action type UUID
   * @returns Promise<ActionType | null> - Action type entity or null if not found
   */
  findById(id: UUID): Promise<ActionType | null>;

  /**
   * Find all action types with pagination and filtering
   * @param params - Pagination parameters
   * @param filters - Optional filtering criteria
   * @returns Promise<PaginatedResult<ActionType>> - Paginated action types
   */
  findAll(
    params: PaginationParams,
    filters?: ActionTypeFilterOptions
  ): Promise<PaginatedResult<ActionType>>;

  /**
   * Find action types by habit ID with pagination
   * @param habitId - Habit UUID
   * @param params - Pagination parameters
   * @param filters - Optional filtering criteria
   * @returns Promise<PaginatedResult<ActionType>> - Paginated action types for the habit
   */
  findByHabitId(
    habitId: UUID,
    params: PaginationParams,
    filters?: ActionTypeFilterOptions
  ): Promise<PaginatedResult<ActionType>>;

  /**
   * Find action type by name within a specific habit
   * @param name - Action type name
   * @param habitId - Habit UUID
   * @returns Promise<ActionType | null> - Action type entity or null if not found
   */
  findByNameAndHabitId(name: string, habitId: UUID): Promise<ActionType | null>;

  /**
   * Update an existing action type
   * @param id - Action type UUID
   * @param data - Partial action type data to update
   * @returns Promise<ActionType> - Updated action type entity
   * @throws NotFoundError if action type doesn't exist
   */
  update(id: UUID, data: UpdateActionTypeData): Promise<ActionType>;

  /**
   * Delete an action type
   * @param id - Action type UUID
   * @returns Promise<void>
   * @throws NotFoundError if action type doesn't exist
   */
  delete(id: UUID): Promise<void>;

  /**
   * Find most active action types across all habits
   * @param limit - Number of action types to return
   * @returns Promise<ActionType[]> - Most active action types sorted by totalActionsCount
   */
  findMostActive(limit: number): Promise<ActionType[]>;

  /**
   * Find recently active action types within specified days
   * @param days - Number of days to look back
   * @param limit - Number of action types to return
   * @returns Promise<ActionType[]> - Recently active action types
   */
  findRecentlyActive(days: number, limit: number): Promise<ActionType[]>;

  /**
   * Count total action types
   * @param filters - Optional filtering criteria
   * @returns Promise<number> - Total count of action types
   */
  count(filters?: ActionTypeFilterOptions): Promise<number>;

  /**
   * Count action types by habit ID
   * @param habitId - Habit UUID
   * @param filters - Optional filtering criteria
   * @returns Promise<number> - Count of action types for the habit
   */
  countByHabitId(habitId: UUID, filters?: ActionTypeFilterOptions): Promise<number>;

  /**
   * Check if action type exists by name and habit ID
   * @param name - Action type name
   * @param habitId - Habit UUID
   * @returns Promise<boolean> - True if exists, false otherwise
   */
  existsByNameAndHabitId(name: string, habitId: UUID): Promise<boolean>;

  /**
   * Bulk update action counts (for batch operations)
   * @param updates - Array of { id: UUID, incrementBy: number, actionDate: Date }
   * @returns Promise<ActionType[]> - Array of updated action types
   */
  bulkUpdateActionCounts(
    updates: Array<{ id: UUID; incrementBy: number; actionDate: Date }>
  ): Promise<ActionType[]>;

  /**
   * Find action types that haven't been used for specified days
   * @param days - Number of days to consider as inactive
   * @param params - Pagination parameters
   * @returns Promise<PaginatedResult<ActionType>> - Inactive action types
   */
  findInactive(days: number, params: PaginationParams): Promise<PaginatedResult<ActionType>>;

  /**
   * Get action type statistics for a habit
   * @param habitId - Habit UUID
   * @returns Promise<ActionTypeStats> - Statistics for action types in the habit
   */
  getStatsByHabitId(habitId: UUID): Promise<ActionTypeStats>;
}

export interface ActionTypeStats {
  totalActionTypes: number;
  activeActionTypes: number; // With at least one action
  totalActions: number; // Sum of all action counts
  averageActionsPerType: number;
  mostActiveActionType?: {
    id: UUID;
    name: string;
    totalActionsCount: number;
  };
  leastActiveActionType?: {
    id: UUID;
    name: string;
    totalActionsCount: number;
  };
  recentlyActiveCount: number; // Active within last 7 days
}
