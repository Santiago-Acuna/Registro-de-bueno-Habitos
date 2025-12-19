/**
 * CH-003: useReadingLogs Custom Hook
 *
 * This hook manages server state for reading logs data.
 * It supports filtering by habit ID, date ranges, pagination, and sorting.
 *
 * @param options - Optional query parameters for filtering, pagination, and sorting
 * @returns Query state with data, loading, error states, and refetch function
 */

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

interface ReadingLog {
  id: string;
  habitId: string;
  pages: number;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

interface UseReadingLogsOptions {
  habitId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

interface UseReadingLogsReturn {
  data: ReadingLog[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  pagination?: PaginationMeta;
  meta?: PaginationMeta;
  pageInfo?: PaginationMeta;
}

export const useReadingLogs = (
  options: UseReadingLogsOptions = {}
): UseReadingLogsReturn => {
  const [data, setData] = useState<ReadingLog[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>(
    undefined
  );
  const [refetchTrigger, setRefetchTrigger] = useState<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const lastOptionsRef = useRef<string>("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  const buildQueryString = useCallback(
    (opts: UseReadingLogsOptions): string => {
      const params = new URLSearchParams();

      if (opts.habitId) {
        params.append("habitId", opts.habitId);
      }

      if (opts.startDate) {
        params.append("startDate", opts.startDate);
      }

      if (opts.endDate) {
        params.append("endDate", opts.endDate);
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
    },
    []
  );

  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return;

    if (!isFetchingRef.current) {
      isFetchingRef.current = true;
      setIsFetching(true);
    }

    if (data === undefined) {
      setIsLoading(true);
    }

    try {
      const queryString = buildQueryString(options);
      const url = `http://localhost:3000/api/reading-logs${queryString}`;
      const response = await axios.get(url);

      if (!isMountedRef.current) return;

      // Handle response structure
      let transformedData = response.data;
      let paginationMeta = undefined;

      // Extract pagination meta (could be at root or nested)
      if (response.meta) {
        paginationMeta = response.meta;
      } else if (response.data.meta) {
        paginationMeta = response.data.meta;
      }

      // Extract data (could be at root or nested)
      if (response.data.data) {
        transformedData = response.data.data;
      }

      // Transform backend data to frontend format
      if (Array.isArray(transformedData)) {
        transformedData = transformedData.map((log: any) => ({
          id: log.id,
          habitId: log.habitId,
          pages: log.pages || log.pagesRead,
          date: log.date || log.readDate,
          createdAt: log.createdAt,
          updatedAt: log.updatedAt,
        }));
      } else if (transformedData === null || transformedData === undefined) {
        transformedData = [];
      }

      setData(transformedData);
      setPagination(paginationMeta);
      setIsLoading(false);
      isFetchingRef.current = false;
      setIsFetching(false);
      setIsError(false);
      setError(null);

      // Reset refetch trigger after successful fetch
      if (refetchTrigger > 0) {
        setRefetchTrigger(0);
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      const errorObj =
        err instanceof Error ? err : new Error("Failed to fetch reading logs");
      setError(errorObj);
      setIsError(true);
      setIsLoading(false);
      isFetchingRef.current = false;
      setIsFetching(false);

      // Reset refetch trigger after error
      if (refetchTrigger > 0) {
        setRefetchTrigger(0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, buildQueryString, refetchTrigger, setRefetchTrigger]);

  useEffect(() => {
    const currentOptions = JSON.stringify(options);

    // Only fetch if options changed or it's initial mount or refetch triggered
    if (currentOptions !== lastOptionsRef.current || refetchTrigger > 0) {
      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Check if this is a rapid filter change (not initial mount or refetch)
      const isRapidChange =
        lastOptionsRef.current !== "" && refetchTrigger === 0;

      if (isRapidChange) {
        // Debounce rapid filter changes
        debounceTimerRef.current = setTimeout(() => {
          lastOptionsRef.current = currentOptions;
          fetchData();
        }, 300);
      } else {
        // No debounce for initial mount or manual refetch
        lastOptionsRef.current = currentOptions;
        fetchData();
      }
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchData, options, refetchTrigger]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(() => {
    isFetchingRef.current = true;
    setIsFetching(true);
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  const result = {
    data,
    isLoading,
    get isFetching() {
      return isFetchingRef.current || isFetching;
    },
    isError,
    error,
    refetch,
    pagination,
    meta: pagination,
    pageInfo: pagination,
  };

  return result;
};
