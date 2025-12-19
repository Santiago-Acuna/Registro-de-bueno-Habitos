/**
 * Action Types Redux Slice - Type Definitions
 *
 * Defines TypeScript interfaces and types for the action types feature.
 */

export interface ActionType {
  id: string;
  name: string;
  icon: string;
  habitId: string;
  totalActionsCount: number;
  lastActionDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActionTypesState {
  actionTypes: ActionType[];
  isLoading: boolean;
  error: string | null;
}
