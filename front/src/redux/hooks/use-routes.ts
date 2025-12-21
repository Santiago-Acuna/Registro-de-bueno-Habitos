/**
 * useRoutes Custom Hook
 *
 * Custom hook for managing route configuration state through Redux.
 * Encapsulates access to dynamic routes fetched from the backend.
 *
 * Usage:
 * ```typescript
 * const { routes, isLoading, error, fetchRoutes, clearError } = useRoutes();
 *
 * useEffect(() => {
 *   fetchRoutes();
 * }, [fetchRoutes]);
 * ```
 */

import { useCallback } from "react";
import { useCustomDispatch, useCustomSelector } from "./hooks";
import { fetchRoutes as fetchRoutesThunk } from "../slices/routes/async-actions";
import { clearError as clearErrorAction } from "../slices/routes/routes";
import type { RouteConfig } from "../slices/routes/routes.types";

/**
 * Return type for useRoutes hook
 */
interface UseRoutesReturn {
  routes: RouteConfig[];
  isLoading: boolean;
  error: string | null;
  fetchRoutes: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook to access routes state and actions
 *
 * @returns Object containing routes state and action functions
 */
export function useRoutes(): UseRoutesReturn {
  const dispatch = useCustomDispatch();

  // Access routes state from Redux
  const routes = useCustomSelector((state) => state.routes.routes);
  const isLoading = useCustomSelector((state) => state.routes.isLoading);
  const error = useCustomSelector((state) => state.routes.error);

  // Memoized fetchRoutes function
  const fetchRoutes = useCallback(async (): Promise<void> => {
    await dispatch(fetchRoutesThunk());
  }, [dispatch]);

  // Memoized clearError function
  const clearError = useCallback((): void => {
    dispatch(clearErrorAction());
  }, [dispatch]);

  return {
    routes,
    isLoading,
    error,
    fetchRoutes,
    clearError,
  };
}
