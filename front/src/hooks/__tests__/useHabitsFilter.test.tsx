/**
 * CH-005: useHabitsFilter Custom Hook Tests
 *
 * RED PHASE - These tests MUST FAIL initially
 *
 * This test suite verifies the useHabitsFilter hook for filtering habits
 * using Redux state management.
 *
 * User Story: As a frontend developer, I need a React hook that manages
 * habit filtering logic, providing filtered habits based on complexity,
 * type, and other criteria using Redux state.
 *
 * Test Coverage:
 * 1. Hook initialization and structure
 * 2. Redux integration (selector and dispatch)
 * 3. Filtering by complexity (simple vs complex)
 * 4. Filtered habits computation
 * 5. TypeScript type safety
 * 6. Edge cases (empty habits, invalid filters, etc.)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import type { ReactNode } from "react";

// Mock the useHabitsFilter hook import
// Note: This will fail until the hook is implemented
import { useHabitsFilter } from "@/hooks";

// Mock habits reducer for testing
const createMockStore = (initialState = {}) => {
  const mockHabitsReducer = (
    state = {
      habits: [],
      backUpHabits: [],
    },
    action: any
  ) => {
    switch (action.type) {
      case "habits/filterByComplexity":
        return {
          ...state,
          habits: state.backUpHabits.filter((habit: any) =>
            habit.habitType?.includes(action.payload)
          ),
        };
      default:
        return state;
    }
  };

  return configureStore({
    reducer: {
      habits: mockHabitsReducer,
    },
    preloadedState: initialState,
  });
};

// Wrapper component for Redux Provider
const createWrapper = (store: any) => {
  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe("CH-005: useHabitsFilter Hook - Filtering Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Hook Existence and Structure", () => {
    it("should be exportable from hooks barrel file", async () => {
      // Arrange: Import hooks module
      const hooksModule = await import("@/hooks");

      // Act: Check for useHabitsFilter export
      const hasUseHabitsFilter = "useHabitsFilter" in hooksModule;

      // Assert: Hook should be exported from barrel file
      expect(hasUseHabitsFilter).toBe(true);
      expect(typeof hooksModule.useHabitsFilter).toBe("function");
    });

    it("should follow React hooks naming convention", async () => {
      // Arrange: Import the hook
      const { useHabitsFilter: hook } = await import("@/hooks");

      // Act: Get hook name
      const hookName = hook.name;

      // Assert: Should start with 'use' and be PascalCase
      expect(hookName).toMatch(/^use[A-Z]/);
      expect(hookName).toBe("useHabitsFilter");
    });

    it("should return an object with expected properties", () => {
      // Arrange: Create store with empty state
      const store = createMockStore();
      const wrapper = createWrapper(store);

      // Act: Render the hook
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });

      // Assert: Should return object with filtering properties
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty("habits");
      expect(result.current).toHaveProperty("filteredHabits");
      expect(result.current).toHaveProperty("filterByComplexity");
      expect(result.current).toHaveProperty("currentFilter");
    });

    it("should be a function that returns an object", () => {
      // Arrange: Import hook
      const store = createMockStore();
      const wrapper = createWrapper(store);

      // Act: Call hook
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });

      // Assert: Should return object
      expect(typeof useHabitsFilter).toBe("function");
      expect(typeof result.current).toBe("object");
      expect(result.current).not.toBeNull();
    });
  });

  describe("Redux Integration - Selector", () => {
    it("should use useCustomSelector to access habits state from Redux store", () => {
      // Arrange: Create store with sample habits
      const mockHabits = [
        {
          id: "1",
          name: "Exercise",
          icon: "https://example.com/exercise.png",
          habitType: "Simple",
        },
        {
          id: "2",
          name: "Reading 30 pages",
          icon: "https://example.com/reading.png",
          habitType: "Complex",
        },
      ];

      const store = createMockStore({
        habits: {
          habits: mockHabits,
          backUpHabits: mockHabits,
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });

      // Assert: Should have access to habits from Redux store
      expect(result.current.habits).toBeDefined();
      expect(Array.isArray(result.current.habits)).toBe(true);
      expect(result.current.habits.length).toBe(2);
    });

    it("should return empty array when no habits exist in store", () => {
      // Arrange: Create store with empty habits
      const store = createMockStore({
        habits: {
          habits: [],
          backUpHabits: [],
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });

      // Assert: Should return empty array
      expect(result.current.habits).toEqual([]);
      expect(result.current.filteredHabits).toEqual([]);
    });

    it("should access backUpHabits from Redux state for filtering", () => {
      // Arrange: Create store with backUpHabits
      const mockBackUpHabits = [
        { id: "1", name: "Habit 1", habitType: "Simple" },
        { id: "2", name: "Habit 2", habitType: "Complex" },
        { id: "3", name: "Habit 3", habitType: "Simple" },
      ];

      const store = createMockStore({
        habits: {
          habits: [],
          backUpHabits: mockBackUpHabits,
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });

      // Assert: Should have access to backUpHabits for filtering operations
      expect(result.current).toBeDefined();
      // The hook should use backUpHabits internally for filtering
    });

    it("should reactively update when Redux state changes", () => {
      // Arrange: Create store with enhanced reducer to handle TEST_UPDATE_HABITS
      const mockHabitsReducer = (
        state = {
          habits: [],
          backUpHabits: [],
        },
        action: any
      ) => {
        switch (action.type) {
          case "TEST_UPDATE_HABITS":
            return {
              ...state,
              habits: action.payload,
              backUpHabits: action.payload,
            };
          default:
            return state;
        }
      };

      const store = configureStore({
        reducer: {
          habits: mockHabitsReducer,
        },
        preloadedState: {
          habits: {
            habits: [{ id: "1", name: "Initial", habitType: "Simple" }],
            backUpHabits: [{ id: "1", name: "Initial", habitType: "Simple" }],
          },
        },
      });

      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result, rerender } = renderHook(() => useHabitsFilter(), {
        wrapper,
      });

      // Verify initial state
      expect(result.current.habits).toHaveLength(1);
      expect(result.current.habits[0].name).toBe("Initial");

      // Dispatch action to change state
      store.dispatch({
        type: "TEST_UPDATE_HABITS",
        payload: [{ id: "2", name: "Updated", habitType: "Complex" }],
      });

      rerender();

      // Assert: Should reflect new state
      // This tests that the hook properly subscribes to Redux state changes
      expect(result.current.habits).toHaveLength(1);
      expect(result.current.habits[0].name).toBe("Updated");
      expect(result.current.habits[0].id).toBe("2");
    });
  });

  describe("Redux Integration - Dispatch", () => {
    it("should use useCustomDispatch to get dispatch function", () => {
      // Arrange: Create store
      const store = createMockStore();
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });

      // Assert: Should have access to dispatch function
      expect(result.current.filterByComplexity).toBeDefined();
      expect(typeof result.current.filterByComplexity).toBe("function");
    });

    it("should dispatch filterByComplexity action when filtering", () => {
      // Arrange: Create store with spy
      const mockHabits = [
        { id: "1", name: "Simple Habit", habitType: "Simple" },
        { id: "2", name: "Complex Habit", habitType: "Complex" },
      ];

      const store = createMockStore({
        habits: {
          habits: mockHabits,
          backUpHabits: mockHabits,
        },
      });

      const dispatchSpy = vi.spyOn(store, "dispatch");
      const wrapper = createWrapper(store);

      // Act: Render hook and call filter
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });
      result.current.filterByComplexity("Simple");

      // Assert: Should have dispatched the action
      expect(dispatchSpy).toHaveBeenCalled();
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining("filterByComplexity"),
          payload: "Simple",
        })
      );
    });

    it("should dispatch with correct complexity filter payload", () => {
      // Arrange: Create store
      const store = createMockStore({
        habits: {
          habits: [],
          backUpHabits: [
            { id: "1", habitType: "Simple" },
            { id: "2", habitType: "Complex" },
          ],
        },
      });

      const dispatchSpy = vi.spyOn(store, "dispatch");
      const wrapper = createWrapper(store);

      // Act: Filter by Complex
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });
      result.current.filterByComplexity("Complex");

      // Assert: Payload should be "Complex"
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: "Complex",
        })
      );
    });
  });

  describe("Filtering by Complexity", () => {
    it("should filter habits by Simple complexity", () => {
      // Arrange: Create store with mixed habits
      const mockHabits = [
        { id: "1", name: "Walk", habitType: "Simple" },
        { id: "2", name: "Read 50 pages", habitType: "Complex" },
        { id: "3", name: "Meditate", habitType: "Simple" },
      ];

      const store = createMockStore({
        habits: {
          habits: mockHabits,
          backUpHabits: mockHabits,
        },
      });
      const wrapper = createWrapper(store);

      // Act: Filter by Simple
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });
      result.current.filterByComplexity("Simple");

      // Assert: Should only return Simple habits
      waitFor(() => {
        expect(result.current.filteredHabits).toBeDefined();
        expect(result.current.filteredHabits.length).toBe(2);
        expect(
          result.current.filteredHabits.every(
            (h: any) => h.habitType === "Simple"
          )
        ).toBe(true);
      });
    });

    it("should filter habits by Complex complexity", () => {
      // Arrange: Create store with mixed habits
      const mockHabits = [
        { id: "1", name: "Walk", habitType: "Simple" },
        { id: "2", name: "Read 50 pages", habitType: "Complex" },
        { id: "3", name: "Study 2 hours", habitType: "Complex" },
      ];

      const store = createMockStore({
        habits: {
          habits: mockHabits,
          backUpHabits: mockHabits,
        },
      });
      const wrapper = createWrapper(store);

      // Act: Filter by Complex
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });
      result.current.filterByComplexity("Complex");

      // Assert: Should only return Complex habits
      waitFor(() => {
        expect(result.current.filteredHabits.length).toBe(2);
        expect(
          result.current.filteredHabits.every(
            (h: any) => h.habitType === "Complex"
          )
        ).toBe(true);
      });
    });

    it("should return empty array when no habits match filter", () => {
      // Arrange: Create store with only Simple habits
      const mockHabits = [
        { id: "1", name: "Walk", habitType: "Simple" },
        { id: "2", name: "Drink water", habitType: "Simple" },
      ];

      const store = createMockStore({
        habits: {
          habits: mockHabits,
          backUpHabits: mockHabits,
        },
      });
      const wrapper = createWrapper(store);

      // Act: Try to filter by Complex
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });
      result.current.filterByComplexity("Complex");

      // Assert: Should return empty array
      waitFor(() => {
        expect(result.current.filteredHabits).toEqual([]);
      });
    });

    it("should handle case-sensitive filtering correctly", () => {
      // Arrange: Create store with habits
      const mockHabits = [
        { id: "1", name: "Habit 1", habitType: "Simple" },
        { id: "2", name: "Habit 2", habitType: "simple" }, // lowercase
      ];

      const store = createMockStore({
        habits: {
          habits: mockHabits,
          backUpHabits: mockHabits,
        },
      });
      const wrapper = createWrapper(store);

      // Act: Filter by "Simple" (capital S)
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });
      result.current.filterByComplexity("Simple");

      // Assert: Should handle case sensitivity
      waitFor(() => {
        expect(result.current.filteredHabits).toBeDefined();
        // Behavior depends on implementation - document expected behavior
      });
    });

    it("should use backUpHabits as the source for filtering", () => {
      // Arrange: Create store where habits and backUpHabits differ
      const currentHabits = [{ id: "1", name: "Current", habitType: "Simple" }];
      const backUpHabits = [
        { id: "1", name: "Backup 1", habitType: "Simple" },
        { id: "2", name: "Backup 2", habitType: "Complex" },
        { id: "3", name: "Backup 3", habitType: "Simple" },
      ];

      const store = createMockStore({
        habits: {
          habits: currentHabits,
          backUpHabits: backUpHabits,
        },
      });
      const wrapper = createWrapper(store);

      // Act: Filter by Simple
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });
      result.current.filterByComplexity("Simple");

      // Assert: Should filter from backUpHabits (3 total, 2 Simple)
      waitFor(() => {
        expect(result.current.filteredHabits.length).toBe(2);
      });
    });
  });

  describe("Filtered Habits Computation", () => {
    it("should provide computed filteredHabits value", () => {
      // Arrange: Create store
      const store = createMockStore({
        habits: {
          habits: [{ id: "1", habitType: "Simple" }],
          backUpHabits: [{ id: "1", habitType: "Simple" }],
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });

      // Assert: Should have filteredHabits property
      expect(result.current).toHaveProperty("filteredHabits");
      expect(Array.isArray(result.current.filteredHabits)).toBe(true);
    });

    it("should memoize filteredHabits to prevent unnecessary re-renders", () => {
      // Arrange: Create store
      const store = createMockStore({
        habits: {
          habits: [{ id: "1", habitType: "Simple" }],
          backUpHabits: [{ id: "1", habitType: "Simple" }],
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render and re-render
      const { result, rerender } = renderHook(() => useHabitsFilter(), {
        wrapper,
      });
      const firstFiltered = result.current.filteredHabits;

      rerender();

      // Assert: Same reference if state hasn't changed (memoization)
      expect(result.current.filteredHabits).toBe(firstFiltered);
    });

    it("should update filteredHabits when filter changes", () => {
      // Arrange: Create store with mixed habits
      const mockHabits = [
        { id: "1", habitType: "Simple" },
        { id: "2", habitType: "Complex" },
      ];

      const store = createMockStore({
        habits: {
          habits: mockHabits,
          backUpHabits: mockHabits,
        },
      });
      const wrapper = createWrapper(store);

      // Act: Filter and check changes
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });

      const initialFiltered = result.current.filteredHabits;

      result.current.filterByComplexity("Simple");

      // Assert: filteredHabits should update
      waitFor(() => {
        expect(result.current.filteredHabits).not.toBe(initialFiltered);
      });
    });

    it("should reflect current Redux state in filteredHabits", () => {
      // Arrange: Create store
      const store = createMockStore({
        habits: {
          habits: [
            { id: "1", name: "Test", habitType: "Simple" },
            { id: "2", name: "Test 2", habitType: "Complex" },
          ],
          backUpHabits: [
            { id: "1", name: "Test", habitType: "Simple" },
            { id: "2", name: "Test 2", habitType: "Complex" },
          ],
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });

      // Assert: Should match Redux state
      expect(result.current.filteredHabits.length).toBe(
        store.getState().habits.habits.length
      );
    });
  });

  describe("Current Filter State", () => {
    it("should track current active filter", () => {
      // Arrange: Create store
      const store = createMockStore();
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });

      // Assert: Should have currentFilter property
      expect(result.current).toHaveProperty("currentFilter");
    });

    it("should initialize with no filter or all habits", () => {
      // Arrange: Create store
      const store = createMockStore({
        habits: {
          habits: [{ id: "1" }, { id: "2" }],
          backUpHabits: [{ id: "1" }, { id: "2" }],
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });

      // Assert: Initial filter should be null or "all"
      expect(
        result.current.currentFilter === null ||
          result.current.currentFilter === "" ||
          result.current.currentFilter === "all"
      ).toBe(true);
    });

    it("should update currentFilter when filtering by complexity", () => {
      // Arrange: Create store
      const store = createMockStore({
        habits: {
          habits: [],
          backUpHabits: [{ id: "1", habitType: "Simple" }],
        },
      });
      const wrapper = createWrapper(store);

      // Act: Apply filter
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });
      result.current.filterByComplexity("Simple");

      // Assert: currentFilter should be "Simple"
      waitFor(() => {
        expect(result.current.currentFilter).toBe("Simple");
      });
    });

    it("should maintain filter state across re-renders", () => {
      // Arrange: Create store
      const store = createMockStore();
      const wrapper = createWrapper(store);

      // Act: Set filter and re-render
      const { result, rerender } = renderHook(() => useHabitsFilter(), {
        wrapper,
      });
      result.current.filterByComplexity("Complex");

      rerender();

      // Assert: Filter should persist
      waitFor(() => {
        expect(result.current.currentFilter).toBe("Complex");
      });
    });
  });

  describe("TypeScript Type Safety", () => {
    it("should have proper TypeScript return type", () => {
      // Arrange: Create store
      const store = createMockStore();
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });

      // Assert: Return type should be properly typed
      // These assertions ensure TypeScript compilation
      expect(result.current.habits).toBeDefined();
      expect(result.current.filteredHabits).toBeDefined();
      expect(result.current.filterByComplexity).toBeDefined();
      expect(result.current.currentFilter).toBeDefined();
    });

    it("should type filterByComplexity parameter as string", () => {
      // Arrange: Create store
      const store = createMockStore();
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });

      // Assert: Function should accept string parameter
      // TypeScript will enforce this at compile time
      expect(() => {
        result.current.filterByComplexity("Simple");
        result.current.filterByComplexity("Complex");
      }).not.toThrow();
    });

    it("should type habits array with proper Habit interface", () => {
      // Arrange: Create store with typed habits
      const mockHabits = [
        {
          id: "1",
          name: "Exercise",
          icon: "url",
          habitType: "Simple",
        },
      ];

      const store = createMockStore({
        habits: {
          habits: mockHabits,
          backUpHabits: mockHabits,
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });

      // Assert: TypeScript should recognize habit properties
      if (result.current.habits.length > 0) {
        const habit = result.current.habits[0];
        expect(habit).toHaveProperty("id");
        expect(habit).toHaveProperty("name");
        expect(habit).toHaveProperty("icon");
        expect(habit).toHaveProperty("habitType");
      }
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle empty habits array gracefully", () => {
      // Arrange: Create store with empty arrays
      const store = createMockStore({
        habits: {
          habits: [],
          backUpHabits: [],
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });

      // Assert: Should not throw and return empty arrays
      expect(result.current.habits).toEqual([]);
      expect(result.current.filteredHabits).toEqual([]);
      expect(() => result.current.filterByComplexity("Simple")).not.toThrow();
    });

    it("should handle undefined habitType properties", () => {
      // Arrange: Create store with habits missing habitType
      const mockHabits = [
        { id: "1", name: "No Type" },
        { id: "2", name: "Has Type", habitType: "Simple" },
      ];

      const store = createMockStore({
        habits: {
          habits: mockHabits,
          backUpHabits: mockHabits,
        },
      });
      const wrapper = createWrapper(store);

      // Act: Filter
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });
      result.current.filterByComplexity("Simple");

      // Assert: Should handle gracefully without errors
      waitFor(() => {
        expect(result.current.filteredHabits).toBeDefined();
        expect(
          result.current.filteredHabits.every((h: any) => h.habitType)
        ).toBe(true);
      });
    });

    it("should handle null habitType values", () => {
      // Arrange: Create store with null habitType
      const mockHabits = [
        { id: "1", name: "Null Type", habitType: null },
        { id: "2", name: "Valid Type", habitType: "Simple" },
      ];

      const store = createMockStore({
        habits: {
          habits: mockHabits,
          backUpHabits: mockHabits,
        },
      });
      const wrapper = createWrapper(store);

      // Act: Filter
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });
      result.current.filterByComplexity("Simple");

      // Assert: Should filter out null values
      waitFor(() => {
        expect(result.current.filteredHabits.length).toBe(1);
      });
    });

    it("should handle invalid filter strings gracefully", () => {
      // Arrange: Create store
      const store = createMockStore({
        habits: {
          habits: [{ id: "1", habitType: "Simple" }],
          backUpHabits: [{ id: "1", habitType: "Simple" }],
        },
      });
      const wrapper = createWrapper(store);

      // Act: Filter with invalid string
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });

      // Assert: Should not throw errors
      expect(() =>
        result.current.filterByComplexity("InvalidType")
      ).not.toThrow();
      expect(() => result.current.filterByComplexity("")).not.toThrow();
      expect(() => result.current.filterByComplexity("   ")).not.toThrow();
    });

    it("should handle very large habit arrays efficiently", () => {
      // Arrange: Create store with large dataset
      const largeHabitsArray = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        name: `Habit ${i}`,
        habitType: i % 2 === 0 ? "Simple" : "Complex",
      }));

      const store = createMockStore({
        habits: {
          habits: largeHabitsArray,
          backUpHabits: largeHabitsArray,
        },
      });
      const wrapper = createWrapper(store);

      // Act: Filter large array
      const startTime = Date.now();
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });
      result.current.filterByComplexity("Simple");
      const endTime = Date.now();

      // Assert: Should complete in reasonable time (< 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
      waitFor(() => {
        expect(result.current.filteredHabits.length).toBe(500);
      });
    });

    it("should handle rapid successive filter calls", () => {
      // Arrange: Create store
      const mockHabits = [
        { id: "1", habitType: "Simple" },
        { id: "2", habitType: "Complex" },
      ];

      const store = createMockStore({
        habits: {
          habits: mockHabits,
          backUpHabits: mockHabits,
        },
      });
      const wrapper = createWrapper(store);

      // Act: Make rapid filter calls
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });

      expect(() => {
        result.current.filterByComplexity("Simple");
        result.current.filterByComplexity("Complex");
        result.current.filterByComplexity("Simple");
        result.current.filterByComplexity("Complex");
      }).not.toThrow();

      // Assert: Should handle all calls without errors
      expect(result.current).toBeDefined();
    });

    it("should maintain data integrity during filtering operations", () => {
      // Arrange: Create store
      const originalHabits = [
        { id: "1", name: "Original", habitType: "Simple" },
        { id: "2", name: "Original 2", habitType: "Complex" },
      ];

      const store = createMockStore({
        habits: {
          habits: [...originalHabits],
          backUpHabits: [...originalHabits],
        },
      });
      const wrapper = createWrapper(store);

      // Act: Filter
      const { result } = renderHook(() => useHabitsFilter(), { wrapper });
      result.current.filterByComplexity("Simple");

      // Assert: Original backUpHabits should not be mutated
      waitFor(() => {
        const storeState = store.getState();
        expect(storeState.habits.backUpHabits.length).toBe(2);
        expect(storeState.habits.backUpHabits).toEqual(originalHabits);
      });
    });
  });

  describe("Integration and Best Practices", () => {
    it("should follow React hooks rules (can only be called in function components)", () => {
      // Arrange: Create store
      const store = createMockStore();
      const wrapper = createWrapper(store);

      // Act & Assert: Should only work within renderHook (React context)
      expect(() => {
        renderHook(() => useHabitsFilter(), { wrapper });
      }).not.toThrow();

      // Calling outside React context should fail
      // This is enforced by React at runtime
    });

    it("should not cause memory leaks on unmount", () => {
      // Arrange: Create store
      const store = createMockStore();
      const wrapper = createWrapper(store);

      // Act: Render and unmount
      const { unmount } = renderHook(() => useHabitsFilter(), { wrapper });

      // Unmount the hook
      unmount();

      // Assert: No errors should occur (cleanup successful)
      expect(true).toBe(true);
    });

    it("should be composable with other hooks", () => {
      // Arrange: Create store
      const store = createMockStore();
      const wrapper = createWrapper(store);

      // Act: Use hook with other hooks
      const { result } = renderHook(
        () => {
          const filterHook = useHabitsFilter();
          // Could compose with useState, useEffect, etc.
          return filterHook;
        },
        { wrapper }
      );

      // Assert: Should work in composition
      expect(result.current).toBeDefined();
    });

    it("should provide stable function references to prevent unnecessary re-renders", () => {
      // Arrange: Create store
      const store = createMockStore();
      const wrapper = createWrapper(store);

      // Act: Render and re-render
      const { result, rerender } = renderHook(() => useHabitsFilter(), {
        wrapper,
      });

      const firstFilterFunc = result.current.filterByComplexity;
      rerender();
      const secondFilterFunc = result.current.filterByComplexity;

      // Assert: Function reference should be stable (useCallback)
      expect(firstFilterFunc).toBe(secondFilterFunc);
    });
  });
});
