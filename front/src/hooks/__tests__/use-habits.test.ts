/**
 * CH-003: useHabits Hook Tests (API Communication)
 *
 * RED PHASE - These tests MUST FAIL initially
 *
 * This test suite verifies the useHabits hook for fetching and managing
 * habits data from the NestJS backend API.
 *
 * User Story: As a frontend developer, I need a React hook that manages
 * server state for habits data, providing loading states, error handling,
 * and automatic data synchronization with the backend.
 *
 * Test Coverage:
 * 1. Hook initialization and data fetching
 * 2. Loading states during API calls
 * 3. Error handling for API failures
 * 4. Data transformation (backend to frontend)
 * 5. Caching and refetching strategies
 * 6. Integration with React Query or similar library
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useHabits } from "@/hooks";

// Mock dependencies
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import axios from "axios";

describe("CH-003: useHabits Hook - API Communication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Hook Existence and Structure", () => {
    it("should be exportable from hooks barrel", async () => {
      // Arrange: Import hooks module
      const hooksModule = await import("@/hooks");

      // Act: Check for useHabits export
      const hasUseHabits = "useHabits" in hooksModule;

      // Assert: Hook should be exported
      expect(hasUseHabits).toBe(true);
      expect(typeof hooksModule.useHabits).toBe("function");
    });

    it("should follow React hooks naming convention", async () => {
      // Arrange: Import the hook
      const { useHabits: hook } = await import("@/hooks");

      // Act: Get hook name
      const hookName = hook.name;

      // Assert: Should start with 'use' and be PascalCase
      expect(hookName).toMatch(/^use[A-Z]/);
      expect(hookName).toBe("useHabits");
    });

    it("should return an object with expected properties", () => {
      // Arrange: Mock successful API response
      vi.mocked(axios.get).mockResolvedValue({
        data: [],
      });

      // Act: Render the hook
      const { result } = renderHook(() => useHabits());

      // Assert: Should return object with query properties
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty("data");
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("isError");
      expect(result.current).toHaveProperty("error");
      expect(result.current).toHaveProperty("refetch");
    });
  });

  describe("Initial State and Data Fetching", () => {
    it("should initialize with loading state", () => {
      // Arrange: Mock pending API call
      vi.mocked(axios.get).mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve({ data: [] }), 100))
      );

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

      // Assert: Should be in loading state initially
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it("should fetch habits data from backend API on mount", async () => {
      // Arrange: Mock successful API response
      const mockHabits = [
        {
          id: "1",
          name: "Exercise",
          icon: "https://example.com/exercise.png",
          habit_type: "Simple",
        },
        {
          id: "2",
          name: "Reading",
          icon: "https://example.com/reading.png",
          habit_type: "Complex",
        },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: mockHabits });

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

      // Assert: Should call API and receive data
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("/habits")
      );
      expect(result.current.data).toEqual(mockHabits);
    });

    it("should call the correct backend endpoint", async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook
      renderHook(() => useHabits());

      // Assert: Should call /api/habits endpoint
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringMatching(/\/api\/habits$/)
        );
      });
    });

    it("should transition from loading to success state", async () => {
      // Arrange: Mock API response
      vi.mocked(axios.get).mockResolvedValue({
        data: [{ id: "1", name: "Test" }],
      });

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

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

  describe("Loading States", () => {
    it("should set isLoading to true during data fetch", () => {
      // Arrange: Mock slow API call
      vi.mocked(axios.get).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: [] }), 1000)
          )
      );

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

      // Assert: Should be loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it("should set isLoading to false after successful fetch", async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

      // Assert: Should complete loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should set isLoading to false after failed fetch", async () => {
      // Arrange: Mock API error
      vi.mocked(axios.get).mockRejectedValue(new Error("Network error"));

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

      // Assert: Should stop loading even on error
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isError).toBe(true);
      });
    });

    it("should provide loading state during refetch", async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook and wait for initial load
      const { result } = renderHook(() => useHabits());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Trigger refetch
      result.current.refetch();

      // Assert: Should show loading during refetch
      expect(result.current.isLoading || result.current.isFetching).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      // Arrange: Mock network error
      const networkError = new Error("Network Error");
      vi.mocked(axios.get).mockRejectedValue(networkError);

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

      // Assert: Should capture error
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBeDefined();
      });
    });

    it("should handle 404 errors from backend", async () => {
      // Arrange: Mock 404 error
      const notFoundError = {
        response: { status: 404, data: { message: "Not Found" } },
      };
      vi.mocked(axios.get).mockRejectedValue(notFoundError);

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

      // Assert: Should handle 404
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBeDefined();
      });
    });

    it("should handle 500 server errors", async () => {
      // Arrange: Mock 500 error
      const serverError = {
        response: {
          status: 500,
          data: { message: "Internal Server Error" },
        },
      };
      vi.mocked(axios.get).mockRejectedValue(serverError);

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

      // Assert: Should handle server error
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it("should handle timeout errors", async () => {
      // Arrange: Mock timeout
      const timeoutError = new Error("timeout of 5000ms exceeded");
      vi.mocked(axios.get).mockRejectedValue(timeoutError);

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

      // Assert: Should handle timeout
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBeDefined();
      });
    });

    it("should provide error message to UI", async () => {
      // Arrange: Mock error with message
      const errorMessage = "Failed to fetch habits";
      vi.mocked(axios.get).mockRejectedValue(new Error(errorMessage));

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

      // Assert: Error should be accessible
      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.error?.message).toContain("fetch");
      });
    });

    it("should clear error state on successful refetch", async () => {
      // Arrange: Mock error then success
      vi.mocked(axios.get)
        .mockRejectedValueOnce(new Error("Error"))
        .mockResolvedValueOnce({ data: [] });

      // Act: Render hook with error
      const { result } = renderHook(() => useHabits());

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

  describe("Data Transformation (Backend to Frontend)", () => {
    it("should transform backend habit data to frontend format", async () => {
      // Arrange: Mock backend response (NestJS format)
      const backendData = [
        {
          id: "uuid-123",
          name: "Exercise",
          iconUrl: "https://example.com/exercise.png",
          habitType: "SIMPLE", // Backend uses different casing
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        },
      ];

      vi.mocked(axios.get).mockResolvedValue({ data: backendData });

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Data should be transformed to frontend format
      expect(result.current.data).toBeDefined();
      expect(result.current.data?.[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        icon: expect.any(String),
        habit_type: expect.any(String),
      });
    });

    it("should handle empty arrays from backend", async () => {
      // Arrange: Mock empty response
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should handle empty array
      expect(result.current.data).toEqual([]);
      expect(Array.isArray(result.current.data)).toBe(true);
    });

    it("should handle null or undefined from backend", async () => {
      // Arrange: Mock null response
      vi.mocked(axios.get).mockResolvedValue({ data: null });

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should normalize null to empty array or handle gracefully
      expect(
        result.current.data === null ||
          result.current.data === undefined ||
          Array.isArray(result.current.data)
      ).toBe(true);
    });

    it("should preserve all required habit fields", async () => {
      // Arrange: Mock complete habit data
      const completeHabit = {
        id: "1",
        name: "Exercise",
        icon: "https://example.com/icon.png",
        habit_type: "Simple",
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
      };

      vi.mocked(axios.get).mockResolvedValue({ data: [completeHabit] });

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // Assert: All fields should be present
      const habit = result.current.data?.[0];
      expect(habit).toHaveProperty("id");
      expect(habit).toHaveProperty("name");
      expect(habit).toHaveProperty("icon");
      expect(habit).toHaveProperty("habit_type");
    });
  });

  describe("Caching and Refetching", () => {
    it("should provide refetch function", () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

      // Assert: refetch should be a function
      expect(typeof result.current.refetch).toBe("function");
    });

    it("should refetch data when refetch is called", async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCallCount = vi.mocked(axios.get).mock.calls.length;

      // Trigger refetch
      result.current.refetch();

      // Assert: Should make another API call
      await waitFor(() => {
        expect(vi.mocked(axios.get).mock.calls.length).toBeGreaterThan(
          initialCallCount
        );
      });
    });

    it("should cache data between re-renders", async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({
        data: [{ id: "1", name: "Test" }],
      });

      // Act: Render hook
      const { result, rerender } = renderHook(() => useHabits());

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      const firstData = result.current.data;

      // Re-render
      rerender();

      // Assert: Should return cached data
      expect(result.current.data).toBe(firstData);
    });

    it("should support stale-while-revalidate pattern", async () => {
      // Arrange: Mock API with changing data
      const oldData = [{ id: "1", name: "Old" }];
      const newData = [{ id: "1", name: "New" }];

      vi.mocked(axios.get)
        .mockResolvedValueOnce({ data: oldData })
        .mockResolvedValueOnce({ data: newData });

      // Act: Initial render
      const { result } = renderHook(() => useHabits());

      await waitFor(() => {
        expect(result.current.data).toEqual(oldData);
      });

      // Trigger refetch
      result.current.refetch();

      // Assert: Should eventually get new data
      await waitFor(() => {
        expect(result.current.data).toEqual(newData);
      });
    });
  });

  describe("Query Parameters and Filtering", () => {
    it("should support filtering habits by type", async () => {
      // Arrange: Mock filtered response
      vi.mocked(axios.get).mockResolvedValue({
        data: [{ id: "1", habit_type: "Simple" }],
      });

      // Act: Render hook with filter
      const { result } = renderHook(() => useHabits({ habitType: "Simple" }));

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // Assert: Should call API with query params
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("habitType=Simple")
      );
    });

    it("should support pagination parameters", async () => {
      // Arrange: Mock paginated response
      vi.mocked(axios.get).mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 10, total: 100 },
      });

      // Act: Render hook with pagination
      const { result } = renderHook(() => useHabits({ page: 1, limit: 10 }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should include pagination in request
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringMatching(/page=1.*limit=10/)
      );
    });

    it("should support sorting options", async () => {
      // Arrange: Mock sorted response
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook with sort
      const { result } = renderHook(() =>
        useHabits({ sortBy: "name", order: "asc" })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should include sort params
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringMatching(/sortBy=name/)
      );
    });
  });

  describe("Integration with React Query or State Management", () => {
    it("should use React Query for server state management", () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

      // Assert: Should have React Query-like interface
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("isError");
      expect(result.current).toHaveProperty("data");
      expect(result.current).toHaveProperty("refetch");
    });

    it("should provide query key for cache management", async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

      // Assert: Should expose query key or identifier
      expect(result.current.queryKey || result.current.cacheKey).toBeDefined();
    });

    it("should support optimistic updates through cache", async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should provide method for cache updates
      expect(
        typeof result.current.updateCache === "function" ||
          typeof result.current.setQueryData === "function"
      ).toBe(true);
    });
  });

  describe("Performance and Optimization", () => {
    it("should not refetch on window focus by default", async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const callCount = vi.mocked(axios.get).mock.calls.length;

      // Simulate window focus
      window.dispatchEvent(new Event("focus"));

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Assert: Should not have made additional calls
      expect(vi.mocked(axios.get).mock.calls.length).toBe(callCount);
    });

    it("should debounce rapid refetch calls", async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render hook
      const { result } = renderHook(() => useHabits());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCalls = vi.mocked(axios.get).mock.calls.length;

      // Trigger multiple rapid refetches
      result.current.refetch();
      result.current.refetch();
      result.current.refetch();

      await waitFor(() => {
        // Assert: Should not make 3 separate calls
        expect(vi.mocked(axios.get).mock.calls.length).toBeLessThan(
          initialCalls + 3
        );
      });
    });

    it("should cleanup subscriptions on unmount", async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      // Act: Render and unmount hook
      const { unmount } = renderHook(() => useHabits());

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled();
      });

      // Unmount
      unmount();

      // Assert: Should cleanup (no errors thrown)
      expect(true).toBe(true);
    });
  });
});
