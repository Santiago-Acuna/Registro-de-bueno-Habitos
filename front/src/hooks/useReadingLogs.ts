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

    setIsFetching(true);

    try {
      const queryString = buildQueryString(options);
      const url = `http://localhost:3000/api/v1/reading-logs${queryString}`;
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!isMountedRef.current) return;

      // Handle response structure
      let transformedData = response.data;
      let paginationMeta = undefined;

      // Extract data and pagination meta
      if (response.data.data) {
        transformedData = response.data.data;
      }

      if (response.data.meta) {
        paginationMeta = response.data.meta;
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
      setIsFetching(false);
      setIsError(false);
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;

      const errorObj =
        err instanceof Error ? err : new Error("Failed to fetch reading logs");
      setError(errorObj);
      setIsError(true);
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [options, buildQueryString]);

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

  return {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    pagination,
    meta: pagination,
    pageInfo: pagination,
  };
};
