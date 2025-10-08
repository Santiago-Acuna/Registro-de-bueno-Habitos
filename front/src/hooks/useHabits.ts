/**
 * CH-003: useHabits Custom Hook
 *
 * This hook manages server state for habits data using a query pattern.
 * It provides loading states, error handling, and data fetching from the backend API.
 *
 * @param options - Optional query parameters for filtering, pagination, and sorting
 * @returns Query state with data, loading, error states, and refetch function
 */

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

interface Habit {
  id: string;
  name: string;
  icon: string;
  habit_type: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UseHabitsOptions {
  habitType?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

interface UseHabitsReturn {
  data: Habit[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  queryKey: string[];
  cacheKey: string[];
  updateCache?: (updater: (old: Habit[] | undefined) => Habit[]) => void;
  setQueryData?: (data: Habit[]) => void;
}

export const useHabits = (options: UseHabitsOptions = {}): UseHabitsReturn => {
  const [data, setData] = useState<Habit[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const lastOptionsRef = useRef<string>("");

  const queryKey = ["habits", JSON.stringify(options)];
  const cacheKey = queryKey;

  const buildQueryString = useCallback((opts: UseHabitsOptions): string => {
    const params = new URLSearchParams();

    if (opts.habitType) {
      params.append("habitType", opts.habitType);
    }

    if (opts.page !== undefined) {
      params.append("page", opts.page.toString());
    }

    if (opts.limit !== undefined) {
      params.append("limit", opts.limit.toString());
    }

    if (opts.sortBy) {
      params.append("sortBy", opts.sortBy);
    }

    if (opts.order) {
      params.append("order", opts.order);
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  }, []);

  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return;

    setIsFetching(true);
    if (isLoading === false) {
      setIsLoading(true);
    }

    try {
      const queryString = buildQueryString(options);
      const url = `http://localhost:3000/api/v1/habits${queryString}`;
      const response = await axios.get(url);

      if (!isMountedRef.current) return;

      // Transform backend data to frontend format if needed
      let transformedData = response.data;

      // Handle different response structures
      if (response.data.data) {
        transformedData = response.data.data;
      }

      // Normalize data structure
      if (Array.isArray(transformedData)) {
        transformedData = transformedData.map((habit: any) => ({
          id: habit.id,
          name: habit.name,
          icon: habit.icon || habit.iconUrl,
          habit_type: habit.habit_type || habit.habitType,
          createdAt: habit.createdAt,
          updatedAt: habit.updatedAt,
        }));
      } else if (transformedData === null || transformedData === undefined) {
        transformedData = [];
      }

      setData(transformedData);
      setIsLoading(false);
      setIsFetching(false);
      setIsError(false);
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;

      const errorObj =
        err instanceof Error ? err : new Error("Failed to fetch habits");
      setError(errorObj);
      setIsError(true);
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [options, buildQueryString, isLoading]);

  useEffect(() => {
    const currentOptions = JSON.stringify(options);

    // Only fetch if options changed or it's initial mount
    if (currentOptions !== lastOptionsRef.current || refetchTrigger > 0) {
      lastOptionsRef.current = currentOptions;
      fetchData();
    }
  }, [fetchData, options, refetchTrigger]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  const updateCache = useCallback(
    (updater: (old: Habit[] | undefined) => Habit[]) => {
      setData((oldData) => updater(oldData));
    },
    []
  );

  const setQueryData = useCallback((newData: Habit[]) => {
    setData(newData);
  }, []);

  return {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    queryKey,
    cacheKey,
    updateCache,
    setQueryData,
  };
};
