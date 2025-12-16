/**
 * Type definitions for Routes Redux Slice
 *
 * Defines the structure for dynamic route configuration
 * fetched from the backend front-config API.
 */

/**
 * Route Configuration Object
 * Represents a single dynamic route in the application
 */
export interface RouteConfig {
  path: string;
  component: string;
  habitName: string;
  habitType: 'complex' | 'simple' | 'withoutintervals';
  actionTypes: string[];
}

/**
 * Routes State Interface
 * Manages the state for route configuration in Redux
 */
export interface RoutesState {
  routes: RouteConfig[];
  isLoading: boolean;
  error: string | null;
}
