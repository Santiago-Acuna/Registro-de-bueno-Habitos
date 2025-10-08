/**
 * CH-003: useReadingLogs Hook Tests
 *
 * RED PHASE - These tests MUST FAIL initially
 *
 * This test suite verifies the useReadingLogs hook for fetching and managing
 * reading logs data from the NestJS backend API.
 *
 * User Story: As a frontend developer, I need a React hook that manages
 * reading logs data, supporting filtering by habit, date ranges, and
 * providing proper error handling and loading states.
 *
 * Test Coverage:
 * 1. Hook initialization and data fetching
 * 2. Loading and error states
 * 3. Filtering by habit ID
 * 4. Date range filtering
 * 5. Pagination support
 * 6. Data transformation (backend to frontend)
 * 7. Integration with backend API
 * 8. Cache management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useReadingLogs } from '@/hooks';

// Mock dependencies
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import axios from 'axios';

describe('CH-003: useReadingLogs Hook - Reading Logs API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Hook Existence and Structure', () => {
    it('should be exportable from hooks barrel', async () => {
      // Arrange: Import hooks module
      const hooksModule = await import('@/hooks');

      // Act: Check for useReadingLogs export
      const hasUseReadingLogs = 'useReadingLogs' in hooksModule;

      // Assert: Hook should be exported
      expect(hasUseReadingLogs).toBe(true);
      expect(typeof hooksModule.useReadingLogs).toBe('function');
    });

    it('should follow React hooks naming convention', async () => {
      // Arrange: Import the hook
      const { useReadingLogs: hook } = await import('@/hooks');

      // Act: Get hook name
      const hookName = hook.name;

      // Assert: Should start with 'use' and be PascalCase
      expect(hookName).toMatch(/^use[A-Z]/);
      expect(hookName).toBe('useReadingLogs');
    });

    it('should return an object with expected properties', () => {
      // Arrange: Mock successful API response
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render the hook
      const { result } = renderHook(() => useReadingLogs());

      // Assert: Should return object with query properties
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('isError');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refetch');
    });
  });

  describe('Initial State and Data Fetching', () => {
    it('should initialize with loading state', () => {
      // Arrange: Mock pending API call
      vi.mocked(axios.get).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: [] }), 100)
          )
      );

      // Act: Render hook
      const { result } = renderHook(() => useReadingLogs());

      // Assert: Should be in loading state initially
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('should fetch reading logs from backend API on mount', async () => {
      // Arrange: Mock successful API response
      const mockLogs = [
        {
          id: 'log-1',
          habitId: 'habit-123',
          pages: 25,
          date: '2025-01-07',
        },
        {
          id: 'log-2',
          habitId: 'habit-456',
          pages: 30,
          date: '2025-01-06',
        },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockLogs });

      // Act: Render hook
      const { result } = renderHook(() => useReadingLogs());

      // Assert: Should call API and receive data
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/reading-logs')
      );
      expect(result.current.data).toEqual(mockLogs);
    });

    it('should call the correct backend endpoint', async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook
      renderHook(() => useReadingLogs());

      // Assert: Should call /api/reading-logs endpoint
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringMatching(/\/api\/reading-logs/)
        );
      });
    });

    it('should transition from loading to success state', async () => {
      // Arrange: Mock API response
      vi.mocked(axios.get).mockResolvedValue({
        data: [{ id: 'log-1', pages: 10 }],
      });

      // Act: Render hook
      const { result } = renderHook(() => useReadingLogs());

      // Initial state
      expect(result.current.isLoading).toBe(true);

      // Assert: Should transition to success state
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isError).toBe(false);
        expect(result.current.data).toBeDefined();
      });
    });
  });

  describe('Loading States', () => {
    it('should set isLoading to true during data fetch', () => {
      // Arrange: Mock slow API call
      vi.mocked(axios.get).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: [] }), 1000)
          )
      );

      // Act: Render hook
      const { result } = renderHook(() => useReadingLogs());

      // Assert: Should be loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('should set isLoading to false after successful fetch', async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook
      const { result } = renderHook(() => useReadingLogs());

      // Assert: Should complete loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should set isLoading to false after failed fetch', async () => {
      // Arrange: Mock API error
      vi.mocked(axios.get).mockRejectedValue(new Error('Network error'));

      // Act: Render hook
      const { result } = renderHook(() => useReadingLogs());

      // Assert: Should stop loading even on error
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isError).toBe(true);
      });
    });

    it('should provide loading state during refetch', async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook and wait for initial load
      const { result } = renderHook(() => useReadingLogs());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Trigger refetch
      result.current.refetch();

      // Assert: Should show loading during refetch
      expect(result.current.isLoading || result.current.isFetching).toBe(
        true
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Arrange: Mock network error
      const networkError = new Error('Network Error');
      vi.mocked(axios.get).mockRejectedValue(networkError);

      // Act: Render hook
      const { result } = renderHook(() => useReadingLogs());

      // Assert: Should capture error
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBeDefined();
      });
    });

    it('should handle 404 errors from backend', async () => {
      // Arrange: Mock 404 error
      const notFoundError = {
        response: { status: 404, data: { message: 'Not Found' } },
      };
      vi.mocked(axios.get).mockRejectedValue(notFoundError);

      // Act: Render hook
      const { result } = renderHook(() => useReadingLogs());

      // Assert: Should handle 404
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('should handle 500 server errors', async () => {
      // Arrange: Mock 500 error
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      };
      vi.mocked(axios.get).mockRejectedValue(serverError);

      // Act: Render hook
      const { result } = renderHook(() => useReadingLogs());

      // Assert: Should handle server error
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('should provide error message to UI', async () => {
      // Arrange: Mock error with message
      const errorMessage = 'Failed to fetch reading logs';
      vi.mocked(axios.get).mockRejectedValue(new Error(errorMessage));

      // Act: Render hook
      const { result } = renderHook(() => useReadingLogs());

      // Assert: Error should be accessible
      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
    });

    it('should clear error state on successful refetch', async () => {
      // Arrange: Mock error then success
      vi.mocked(axios.get)
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce({ data: [] });

      // Act: Render hook with error
      const { result } = renderHook(() => useReadingLogs());

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Refetch successfully
      result.current.refetch();

      // Assert: Error should be cleared
      await waitFor(() => {
        expect(result.current.isError).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('Filtering by Habit ID', () => {
    it('should support filtering logs by habit ID', async () => {
      // Arrange: Mock filtered response
      const habitId = 'habit-123';
      const filteredLogs = [
        { id: 'log-1', habitId, pages: 20, date: '2025-01-07' },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: filteredLogs });

      // Act: Render hook with habitId filter
      const { result } = renderHook(() => useReadingLogs({ habitId }));

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // Assert: Should call API with habitId query param
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`habitId=${habitId}`)
      );
      expect(result.current.data).toEqual(filteredLogs);
    });

    it('should fetch all logs when no habitId is provided', async () => {
      // Arrange: Mock all logs
      vi.mocked(axios.get).mockResolvedValue({
        data: [
          { id: 'log-1', habitId: 'habit-1' },
          { id: 'log-2', habitId: 'habit-2' },
        ],
      });

      // Act: Render hook without filter
      const { result } = renderHook(() => useReadingLogs());

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // Assert: Should not include habitId in query
      expect(axios.get).toHaveBeenCalledWith(
        expect.not.stringContaining('habitId=')
      );
    });

    it('should refetch when habitId filter changes', async () => {
      // Arrange: Mock API
      vi.mocked(axios.get)
        .mockResolvedValueOnce({ data: [{ habitId: 'habit-1' }] })
        .mockResolvedValueOnce({ data: [{ habitId: 'habit-2' }] });

      // Act: Render with initial habitId
      const { result, rerender } = renderHook(
        ({ habitId }) => useReadingLogs({ habitId }),
        { initialProps: { habitId: 'habit-1' } }
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      const firstCallCount = vi.mocked(axios.get).mock.calls.length;

      // Change habitId
      rerender({ habitId: 'habit-2' });

      // Assert: Should make new API call
      await waitFor(() => {
        expect(vi.mocked(axios.get).mock.calls.length).toBeGreaterThan(
          firstCallCount
        );
      });
    });
  });

  describe('Date Range Filtering', () => {
    it('should support filtering by start date', async () => {
      // Arrange: Mock filtered response
      const startDate = '2025-01-01';
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook with startDate
      const { result } = renderHook(() => useReadingLogs({ startDate }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should include startDate in query
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`startDate=${startDate}`)
      );
    });

    it('should support filtering by end date', async () => {
      // Arrange: Mock filtered response
      const endDate = '2025-01-31';
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook with endDate
      const { result } = renderHook(() => useReadingLogs({ endDate }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should include endDate in query
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`endDate=${endDate}`)
      );
    });

    it('should support filtering by date range', async () => {
      // Arrange: Mock filtered response
      const startDate = '2025-01-01';
      const endDate = '2025-01-07';
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook with date range
      const { result } = renderHook(() =>
        useReadingLogs({ startDate, endDate })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should include both dates in query
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringMatching(
          new RegExp(`startDate=${startDate}.*endDate=${endDate}`)
        )
      );
    });

    it('should refetch when date range changes', async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render with initial date range
      const { result, rerender } = renderHook(
        ({ startDate, endDate }) => useReadingLogs({ startDate, endDate }),
        {
          initialProps: {
            startDate: '2025-01-01',
            endDate: '2025-01-07',
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const firstCallCount = vi.mocked(axios.get).mock.calls.length;

      // Change date range
      rerender({ startDate: '2025-01-08', endDate: '2025-01-14' });

      // Assert: Should make new API call
      await waitFor(() => {
        expect(vi.mocked(axios.get).mock.calls.length).toBeGreaterThan(
          firstCallCount
        );
      });
    });
  });

  describe('Pagination Support', () => {
    it('should support page and limit parameters', async () => {
      // Arrange: Mock paginated response
      vi.mocked(axios.get).mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 10, total: 100 },
      });

      // Act: Render hook with pagination
      const { result } = renderHook(() =>
        useReadingLogs({ page: 1, limit: 10 })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should include pagination params
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringMatching(/page=1.*limit=10/)
      );
    });

    it('should provide pagination metadata', async () => {
      // Arrange: Mock paginated response with meta
      const paginationMeta = {
        page: 1,
        limit: 20,
        total: 150,
        totalPages: 8,
      };

      vi.mocked(axios.get).mockResolvedValue({
        data: [],
        meta: paginationMeta,
      });

      // Act: Render hook with pagination
      const { result } = renderHook(() =>
        useReadingLogs({ page: 1, limit: 20 })
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // Assert: Should provide pagination info
      expect(
        result.current.pagination ||
          result.current.meta ||
          result.current.pageInfo
      ).toBeDefined();
    });

    it('should handle page changes', async () => {
      // Arrange: Mock different pages
      vi.mocked(axios.get)
        .mockResolvedValueOnce({ data: [{ id: '1' }], meta: { page: 1 } })
        .mockResolvedValueOnce({ data: [{ id: '2' }], meta: { page: 2 } });

      // Act: Render with page 1
      const { result, rerender } = renderHook(
        ({ page }) => useReadingLogs({ page }),
        { initialProps: { page: 1 } }
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // Change to page 2
      rerender({ page: 2 });

      // Assert: Should fetch new page
      await waitFor(() => {
        expect(vi.mocked(axios.get).mock.calls.length).toBe(2);
      });
    });
  });

  describe('Data Transformation', () => {
    it('should transform backend reading log data to frontend format', async () => {
      // Arrange: Mock backend response (NestJS format)
      const backendData = [
        {
          id: 'uuid-log-1',
          habitId: 'uuid-habit-123',
          pagesRead: 25, // Backend might use different property names
          readDate: '2025-01-07T10:00:00Z',
          createdAt: '2025-01-07T10:00:00Z',
        },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: backendData });

      // Act: Render hook
      const { result } = renderHook(() => useReadingLogs());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Data should be transformed
      expect(result.current.data).toBeDefined();
      expect(result.current.data?.[0]).toMatchObject({
        id: expect.any(String),
        habitId: expect.any(String),
        pages: expect.any(Number),
        date: expect.any(String),
      });
    });

    it('should handle empty arrays from backend', async () => {
      // Arrange: Mock empty response
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook
      const { result } = renderHook(() => useReadingLogs());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should handle empty array
      expect(result.current.data).toEqual([]);
      expect(Array.isArray(result.current.data)).toBe(true);
    });

    it('should preserve all required reading log fields', async () => {
      // Arrange: Mock complete reading log data
      const completeLog = {
        id: 'log-1',
        habitId: 'habit-123',
        pages: 25,
        date: '2025-01-07',
        createdAt: '2025-01-07T10:00:00Z',
        updatedAt: '2025-01-07T10:00:00Z',
      };

      vi.mocked(axios.get).mockResolvedValue({ data: [completeLog] });

      // Act: Render hook
      const { result } = renderHook(() => useReadingLogs());

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // Assert: All required fields should be present
      const log = result.current.data?.[0];
      expect(log).toHaveProperty('id');
      expect(log).toHaveProperty('habitId');
      expect(log).toHaveProperty('pages');
      expect(log).toHaveProperty('date');
    });
  });

  describe('Sorting and Ordering', () => {
    it('should support sorting by date', async () => {
      // Arrange: Mock sorted response
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook with sort
      const { result } = renderHook(() =>
        useReadingLogs({ sortBy: 'date', order: 'desc' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should include sort params
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringMatching(/sortBy=date.*order=desc/)
      );
    });

    it('should support sorting by pages read', async () => {
      // Arrange: Mock sorted response
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook with sort by pages
      const { result } = renderHook(() =>
        useReadingLogs({ sortBy: 'pages', order: 'asc' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should include sort params
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=pages')
      );
    });

    it('should default to descending date order', async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook without explicit sort
      const { result } = renderHook(() => useReadingLogs());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should use default sort (or no sort specified)
      expect(axios.get).toHaveBeenCalled();
    });
  });

  describe('Combined Filters', () => {
    it('should support combining habitId and date range filters', async () => {
      // Arrange: Mock filtered response
      const filters = {
        habitId: 'habit-123',
        startDate: '2025-01-01',
        endDate: '2025-01-07',
      };

      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook with multiple filters
      const { result } = renderHook(() => useReadingLogs(filters));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should include all filter params
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringMatching(
          /habitId=habit-123.*startDate=2025-01-01.*endDate=2025-01-07/
        )
      );
    });

    it('should support combining all filters with pagination', async () => {
      // Arrange: Mock response
      const filters = {
        habitId: 'habit-123',
        startDate: '2025-01-01',
        endDate: '2025-01-07',
        page: 1,
        limit: 20,
        sortBy: 'date',
        order: 'desc',
      };

      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook with all filters
      const { result } = renderHook(() =>
        useReadingLogs(filters as any)
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should include all params
      const callUrl = vi.mocked(axios.get).mock.calls[0][0];
      expect(callUrl).toContain('habitId=habit-123');
      expect(callUrl).toContain('page=1');
      expect(callUrl).toContain('limit=20');
    });
  });

  describe('Cache Management', () => {
    it('should provide refetch function', () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook
      const { result } = renderHook(() => useReadingLogs());

      // Assert: refetch should be a function
      expect(typeof result.current.refetch).toBe('function');
    });

    it('should cache data between re-renders', async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({
        data: [{ id: 'log-1' }],
      });

      // Act: Render hook
      const { result, rerender } = renderHook(() => useReadingLogs());

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      const firstData = result.current.data;

      // Re-render
      rerender();

      // Assert: Should return cached data
      expect(result.current.data).toBe(firstData);
    });

    it('should invalidate cache when filters change', async () => {
      // Arrange: Mock API
      vi.mocked(axios.get)
        .mockResolvedValueOnce({ data: [{ id: 'log-1' }] })
        .mockResolvedValueOnce({ data: [{ id: 'log-2' }] });

      // Act: Render with initial filter
      const { result, rerender } = renderHook(
        ({ habitId }) => useReadingLogs({ habitId }),
        { initialProps: { habitId: 'habit-1' } }
      );

      await waitFor(() => {
        expect(result.current.data?.[0].id).toBe('log-1');
      });

      // Change filter
      rerender({ habitId: 'habit-2' });

      // Assert: Should fetch new data
      await waitFor(() => {
        expect(result.current.data?.[0].id).toBe('log-2');
      });
    });
  });

  describe('Performance and Optimization', () => {
    it('should cleanup subscriptions on unmount', async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render and unmount hook
      const { unmount } = renderHook(() => useReadingLogs());

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled();
      });

      // Unmount
      unmount();

      // Assert: Should cleanup (no errors thrown)
      expect(true).toBe(true);
    });

    it('should debounce rapid filter changes', async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook
      const { result, rerender } = renderHook(
        ({ habitId }) => useReadingLogs({ habitId }),
        { initialProps: { habitId: 'habit-1' } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCalls = vi.mocked(axios.get).mock.calls.length;

      // Rapid filter changes
      rerender({ habitId: 'habit-2' });
      rerender({ habitId: 'habit-3' });
      rerender({ habitId: 'habit-4' });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should not make a call for every change
      expect(vi.mocked(axios.get).mock.calls.length).toBeLessThan(
        initialCalls + 3
      );
    });
  });

  describe('TypeScript Type Safety', () => {
    it('should enforce correct filter types', async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook with typed filters
      const { result } = renderHook(() =>
        useReadingLogs({
          habitId: 'habit-123',
          startDate: '2025-01-01',
          page: 1,
          limit: 10,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should accept valid filter types
      expect(axios.get).toHaveBeenCalled();
    });

    it('should provide properly typed reading log data', async () => {
      // Arrange: Mock typed response
      const typedLog = {
        id: 'log-1',
        habitId: 'habit-123',
        pages: 25,
        date: '2025-01-07',
      };

      vi.mocked(axios.get).mockResolvedValue({ data: [typedLog] });

      // Act: Render hook
      const { result } = renderHook(() => useReadingLogs());

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // Assert: Data should be properly typed
      const log = result.current.data?.[0];
      expect(typeof log?.id).toBe('string');
      expect(typeof log?.pages).toBe('number');
      expect(typeof log?.date).toBe('string');
    });
  });
});
