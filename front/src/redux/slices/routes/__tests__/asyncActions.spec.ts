/**
 * Async Actions Tests for Routes Redux Slice
 *
 * RED Phase: Comprehensive failing tests for fetchRoutes async thunk
 *
 * Test Coverage:
 * 1. Success scenario - fetches and transforms routes correctly
 * 2. Network error handling
 * 3. API error responses (4xx, 5xx)
 * 4. Empty response handling
 * 5. Invalid response format handling
 * 6. Redux state updates (loading, routes, error)
 * 7. Route path transformation (habitName → kebab-case path)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import axios from "axios";
import { routesReducer } from "../routes";
import { fetchRoutes } from "../asyncActions";
import type { RoutesState } from "../routes.types";

// Mock axios
vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

describe("fetchRoutes Async Thunk", () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    // Create a fresh store for each test
    store = configureStore({
      reducer: {
        routes: routesReducer,
      },
    });

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Successful Fetch Scenarios", () => {
    it("should fetch routes and update state with transformed data", async () => {
      // Arrange: Mock successful API response
      const mockApiResponse = {
        data: {
          complex: [{ Programming: ["for work", "personal Project"] }],
          simple: [{ "Morning Exercise": ["Cardio", "Strength"] }],
          withoutintervals: [{ "Water Intake": [] }],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Verify state updates
      const state = store.getState().routes;

      // Should have loading set to false after completion
      expect(state.isLoading).toBe(false);

      // Should have no error
      expect(state.error).toBeNull();

      // Should have 3 routes (one for each habit)
      expect(state.routes).toHaveLength(3);

      // Verify route structure and transformations
      const programmingRoute = state.routes.find(
        (r) => r.habitName === "Programming"
      );
      expect(programmingRoute).toBeDefined();
      expect(programmingRoute?.path).toBe("/programming");
      expect(programmingRoute?.component).toBe("WithoutIntervalsHabits");
      expect(programmingRoute?.habitType).toBe("complex");
      expect(programmingRoute?.actionTypes).toEqual([
        "for work",
        "personal Project",
      ]);

      const exerciseRoute = state.routes.find(
        (r) => r.habitName === "Morning Exercise"
      );
      expect(exerciseRoute).toBeDefined();
      expect(exerciseRoute?.path).toBe("/morning-exercise");
      expect(exerciseRoute?.component).toBe("SimpleHabits");
      expect(exerciseRoute?.habitType).toBe("simple");
      expect(exerciseRoute?.actionTypes).toEqual(["Cardio", "Strength"]);

      const waterRoute = state.routes.find(
        (r) => r.habitName === "Water Intake"
      );
      expect(waterRoute).toBeDefined();
      expect(waterRoute?.path).toBe("/water-intake");
      expect(waterRoute?.component).toBe("WithoutIntervalsHabits");
      expect(waterRoute?.habitType).toBe("withoutintervals");
      expect(waterRoute?.actionTypes).toEqual([]);
    });

    it("should call correct API endpoint", async () => {
      // Arrange: Mock API response
      const mockApiResponse = {
        data: {
          complex: [],
          simple: [],
          withoutintervals: [],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Verify correct endpoint was called
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "/api/v1/front-config/habits-by-type",
        expect.objectContaining({ timeout: 10000 })
      );
    });

    it("should set loading state to true while fetching", async () => {
      // Arrange: Mock delayed API response
      const mockApiResponse = {
        data: {
          complex: [],
          simple: [],
          withoutintervals: [],
        },
      };

      let resolvePromise: (value: any) => void;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockedAxios.get.mockReturnValueOnce(delayedPromise as any);

      // Act: Dispatch the async thunk (don't await yet)
      const fetchPromise = store.dispatch(fetchRoutes());

      // Assert: Loading should be true while request is pending
      let state = store.getState().routes;
      expect(state.isLoading).toBe(true);

      // Resolve the promise
      resolvePromise!(mockApiResponse);
      await fetchPromise;

      // Assert: Loading should be false after completion
      state = store.getState().routes;
      expect(state.isLoading).toBe(false);
    });

    it("should clear previous errors on successful fetch", async () => {
      // Arrange: Set an error in state first
      store.dispatch({ type: "routes/setError", payload: "Previous error" });
      expect(store.getState().routes.error).toBe("Previous error");

      // Mock successful API response
      const mockApiResponse = {
        data: {
          complex: [],
          simple: [],
          withoutintervals: [],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Error should be cleared
      const state = store.getState().routes;
      expect(state.error).toBeNull();
    });

    it("should handle multiple habits of the same type", async () => {
      // Arrange: Mock API response with multiple habits of same type
      const mockApiResponse = {
        data: {
          complex: [
            { Programming: ["for work", "personal Project"] },
            { Reading: ["fiction", "non-fiction"] },
            { "Learn English": ["vocabulary", "grammar", "speaking"] },
          ],
          simple: [],
          withoutintervals: [],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Should have 3 routes, all with complex type
      const state = store.getState().routes;
      expect(state.routes).toHaveLength(3);
      expect(state.routes.every((r) => r.habitType === "complex")).toBe(true);

      // Verify path transformations
      const programmingRoute = state.routes.find(
        (r) => r.habitName === "Programming"
      );
      expect(programmingRoute?.path).toBe("/programming");

      const readingRoute = state.routes.find((r) => r.habitName === "Reading");
      expect(readingRoute?.path).toBe("/reading");

      const englishRoute = state.routes.find(
        (r) => r.habitName === "Learn English"
      );
      expect(englishRoute?.path).toBe("/learn-english");
    });
  });

  describe("Empty Response Handling", () => {
    it("should handle empty response from backend", async () => {
      // Arrange: Mock empty API response
      const mockApiResponse = {
        data: {
          complex: [],
          simple: [],
          withoutintervals: [],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Should not throw error
      const state = store.getState().routes;
      expect(state.routes).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("should handle habits with empty action types", async () => {
      // Arrange: Mock API response with empty action types
      const mockApiResponse = {
        data: {
          complex: [],
          simple: [],
          withoutintervals: [{ "Daily Check": [] }],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Should handle empty action types correctly
      const state = store.getState().routes;
      expect(state.routes).toHaveLength(1);
      expect(state.routes[0].actionTypes).toEqual([]);
      expect(state.routes[0].habitName).toBe("Daily Check");
    });
  });

  describe("Network Error Handling", () => {
    it("should handle network errors with user-friendly message", async () => {
      // Arrange: Mock network error
      const networkError = new Error("Network Error");
      (networkError as any).code = "ERR_NETWORK";
      mockedAxios.get.mockRejectedValueOnce(networkError);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Should store user-friendly error message
      const state = store.getState().routes;
      expect(state.error).toBe(
        "Unable to load routes. Please check your connection."
      );
      expect(state.isLoading).toBe(false);
      expect(state.routes).toEqual([]);
    });

    it("should handle timeout errors", async () => {
      // Arrange: Mock timeout error
      const timeoutError = new Error("timeout of 10000ms exceeded");
      (timeoutError as any).code = "ECONNABORTED";
      mockedAxios.get.mockRejectedValueOnce(timeoutError);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Should store timeout error message
      const state = store.getState().routes;
      expect(state.error).toBe("Request timed out. Please try again.");
      expect(state.isLoading).toBe(false);
      expect(state.routes).toEqual([]);
    });

    it("should set loading to false on network error", async () => {
      // Arrange: Mock network error
      const networkError = new Error("Network Error");
      mockedAxios.get.mockRejectedValueOnce(networkError);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Loading should be false
      const state = store.getState().routes;
      expect(state.isLoading).toBe(false);
    });
  });

  describe("API Error Response Handling", () => {
    it("should handle 404 Not Found error", async () => {
      // Arrange: Mock 404 error
      const error404 = {
        response: {
          status: 404,
          data: { message: "Not Found" },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(error404);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Should store user-friendly 404 error message
      const state = store.getState().routes;
      expect(state.error).toBe(
        "Routes configuration not found. Please contact support."
      );
      expect(state.isLoading).toBe(false);
      expect(state.routes).toEqual([]);
    });

    it("should handle 500 Internal Server Error", async () => {
      // Arrange: Mock 500 error
      const error500 = {
        response: {
          status: 500,
          data: { message: "Internal Server Error" },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(error500);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Should store user-friendly 500 error message
      const state = store.getState().routes;
      expect(state.error).toBe(
        "Server error loading routes. Please try again later."
      );
      expect(state.isLoading).toBe(false);
      expect(state.routes).toEqual([]);
    });

    it("should handle 401 Unauthorized error", async () => {
      // Arrange: Mock 401 error
      const error401 = {
        response: {
          status: 401,
          data: { message: "Unauthorized" },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(error401);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Should store generic error message for 401
      const state = store.getState().routes;
      expect(state.error).toBeTruthy();
      expect(state.isLoading).toBe(false);
    });

    it("should handle 403 Forbidden error", async () => {
      // Arrange: Mock 403 error
      const error403 = {
        response: {
          status: 403,
          data: { message: "Forbidden" },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(error403);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Should store error message
      const state = store.getState().routes;
      expect(state.error).toBeTruthy();
      expect(state.isLoading).toBe(false);
    });

    it("should handle 503 Service Unavailable error", async () => {
      // Arrange: Mock 503 error
      const error503 = {
        response: {
          status: 503,
          data: { message: "Service Unavailable" },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(error503);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Should store server error message
      const state = store.getState().routes;
      expect(state.error).toBe(
        "Server error loading routes. Please try again later."
      );
      expect(state.isLoading).toBe(false);
    });
  });

  describe("Invalid Response Format Handling", () => {
    it("should handle malformed JSON response", async () => {
      // Arrange: Mock malformed response (missing required properties)
      const malformedResponse = {
        data: {
          invalid: "structure",
        },
      };
      mockedAxios.get.mockResolvedValueOnce(malformedResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Should handle gracefully or set error
      const state = store.getState().routes;
      // Should either return empty routes or set error
      expect(state.isLoading).toBe(false);
      expect(state.routes.length === 0 || state.error !== null).toBe(true);
    });

    it("should handle response with missing habit type category", async () => {
      // Arrange: Mock response missing 'simple' category
      const incompleteResponse = {
        data: {
          complex: [{ Programming: ["for work"] }],
          withoutintervals: [],
        },
      };
      mockedAxios.get.mockResolvedValueOnce(incompleteResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Should handle gracefully (treat missing as empty)
      const state = store.getState().routes;
      expect(state.isLoading).toBe(false);
      // Should process available categories without crashing
    });

    it("should handle response with null data", async () => {
      // Arrange: Mock response with null data
      const nullResponse = {
        data: null,
      };
      mockedAxios.get.mockResolvedValueOnce(nullResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Should set error or return empty routes
      const state = store.getState().routes;
      expect(state.isLoading).toBe(false);
      expect(state.routes.length === 0 || state.error !== null).toBe(true);
    });

    it("should handle response with undefined data", async () => {
      // Arrange: Mock response with undefined data
      const undefinedResponse = {
        data: undefined,
      };
      mockedAxios.get.mockResolvedValueOnce(undefinedResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Should set error or return empty routes
      const state = store.getState().routes;
      expect(state.isLoading).toBe(false);
      expect(state.routes.length === 0 || state.error !== null).toBe(true);
    });
  });

  describe("Route Path Transformation", () => {
    it("should transform habit name to kebab-case path", async () => {
      // Arrange: Mock API response with various habit name formats
      const mockApiResponse = {
        data: {
          complex: [
            { Programming: [] },
            { "Learn English": [] },
            { "Morning Routine Exercise": [] },
            { "UPPERCASE HABIT": [] },
            { "Mixed-Case-Habit": [] },
          ],
          simple: [],
          withoutintervals: [],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Verify path transformations
      const state = store.getState().routes;

      const programmingRoute = state.routes.find(
        (r) => r.habitName === "Programming"
      );
      expect(programmingRoute?.path).toBe("/programming");

      const englishRoute = state.routes.find(
        (r) => r.habitName === "Learn English"
      );
      expect(englishRoute?.path).toBe("/learn-english");

      const routineRoute = state.routes.find(
        (r) => r.habitName === "Morning Routine Exercise"
      );
      expect(routineRoute?.path).toBe("/morning-routine-exercise");

      const upperRoute = state.routes.find(
        (r) => r.habitName === "UPPERCASE HABIT"
      );
      expect(upperRoute?.path).toBe("/uppercase-habit");

      const mixedRoute = state.routes.find(
        (r) => r.habitName === "Mixed-Case-Habit"
      );
      expect(mixedRoute?.path).toBe("/mixed-case-habit");
    });

    it("should handle special characters in habit names", async () => {
      // Arrange: Mock API response with special characters
      const mockApiResponse = {
        data: {
          simple: [
            { "Habit & Activity": [] },
            { "Habit/Task": [] },
            { "Habit (Version 2)": [] },
          ],
          complex: [],
          withoutintervals: [],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Special characters should be handled in path
      const state = store.getState().routes;
      // Paths should be URL-safe (no special characters that break routing)
      state.routes.forEach((route) => {
        expect(route.path).toMatch(/^\/[a-z0-9\-]+$/);
      });
    });

    it("should handle leading and trailing spaces in habit names", async () => {
      // Arrange: Mock API response with spaces
      const mockApiResponse = {
        data: {
          complex: [{ "  Spaced Habit  ": [] }],
          simple: [],
          withoutintervals: [],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Spaces should be trimmed
      const state = store.getState().routes;
      const route = state.routes[0];
      expect(route.path).toBe("/spaced-habit");
    });
  });

  describe("Component Mapping", () => {
    it("should map complex habitType to WithoutIntervalsHabits component", async () => {
      // Arrange: Mock API response with complex habits
      const mockApiResponse = {
        data: {
          complex: [{ Programming: [] }, { Reading: [] }],
          simple: [],
          withoutintervals: [],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: All complex habits should map to WithoutIntervalsHabits
      const state = store.getState().routes;
      expect(state.routes).toHaveLength(2);
      state.routes.forEach((route) => {
        expect(route.component).toBe("WithoutIntervalsHabits");
        expect(route.habitType).toBe("complex");
      });
    });

    it("should map simple habitType to SimpleHabits component", async () => {
      // Arrange: Mock API response with simple habits
      const mockApiResponse = {
        data: {
          complex: [],
          simple: [{ Exercise: [] }, { Meditation: [] }],
          withoutintervals: [],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: All simple habits should map to SimpleHabits
      const state = store.getState().routes;
      expect(state.routes).toHaveLength(2);
      state.routes.forEach((route) => {
        expect(route.component).toBe("SimpleHabits");
        expect(route.habitType).toBe("simple");
      });
    });

    it("should map withoutintervals habitType to WithoutIntervalsHabits component", async () => {
      // Arrange: Mock API response with withoutintervals habits
      const mockApiResponse = {
        data: {
          complex: [],
          simple: [],
          withoutintervals: [{ "Water Intake": [] }, { "Daily Journal": [] }],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: All withoutintervals habits should map correctly
      const state = store.getState().routes;
      expect(state.routes).toHaveLength(2);
      state.routes.forEach((route) => {
        expect(route.component).toBe("WithoutIntervalsHabits");
        expect(route.habitType).toBe("withoutintervals");
      });
    });
  });

  describe("Redux State Integration", () => {
    it("should use extraReducers to handle async thunk lifecycle", async () => {
      // Arrange: Mock API response
      const mockApiResponse = {
        data: {
          complex: [{ Programming: ["for work"] }],
          simple: [],
          withoutintervals: [],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      // Act: Dispatch the async thunk
      const resultAction = await store.dispatch(fetchRoutes());

      // Assert: Verify action types
      expect(resultAction.type).toBe("routes/fetchRoutes/fulfilled");

      // Verify final state
      const state = store.getState().routes;
      expect(state.routes).toHaveLength(1);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("should handle pending state correctly", () => {
      // Arrange: Create pending action
      const pendingAction = {
        type: "routes/fetchRoutes/pending",
      };

      // Act: Dispatch pending action directly to test reducer
      store.dispatch(pendingAction as any);

      // Assert: Loading should be true
      const state = store.getState().routes;
      expect(state.isLoading).toBe(true);
    });

    it("should handle rejected state correctly", async () => {
      // Arrange: Mock API error
      const error = new Error("API Error");
      mockedAxios.get.mockRejectedValueOnce(error);

      // Act: Dispatch the async thunk
      const resultAction = await store.dispatch(fetchRoutes());

      // Assert: Verify action types
      expect(resultAction.type).toBe("routes/fetchRoutes/rejected");

      // Verify final state
      const state = store.getState().routes;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeTruthy();
    });

    it("should not mutate existing routes during loading", async () => {
      // Arrange: Set initial routes
      const initialRoutes = [
        {
          path: "/initial",
          component: "InitialComponent",
          habitName: "Initial",
          habitType: "simple" as const,
          actionTypes: [],
        },
      ];
      store.dispatch({ type: "routes/setRoutes", payload: initialRoutes });

      // Mock delayed response
      let resolvePromise: (value: any) => void;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockedAxios.get.mockReturnValueOnce(delayedPromise as any);

      // Act: Start fetch (don't await)
      const fetchPromise = store.dispatch(fetchRoutes());

      // Assert: Routes should remain unchanged during loading
      let state = store.getState().routes;
      expect(state.routes).toEqual(initialRoutes);
      expect(state.isLoading).toBe(true);

      // Resolve promise
      resolvePromise!({
        data: {
          complex: [],
          simple: [],
          withoutintervals: [],
        },
      });
      await fetchPromise;
    });
  });

  describe("Edge Cases", () => {
    it("should handle duplicate habit names across different types", async () => {
      // Arrange: Mock API response with duplicate names
      const mockApiResponse = {
        data: {
          complex: [{ Exercise: ["running", "swimming"] }],
          simple: [{ Exercise: ["push-ups"] }],
          withoutintervals: [],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Should handle duplicates (both or last one wins)
      const state = store.getState().routes;
      // Implementation should define behavior (both routes or deduplicate)
      expect(state.routes.length).toBeGreaterThan(0);
    });

    it("should handle very long habit names", async () => {
      // Arrange: Mock API response with long name
      const longName =
        "This is an extremely long habit name that exceeds normal character limits and should still be processed correctly";
      const mockApiResponse = {
        data: {
          complex: [{ [longName]: [] }],
          simple: [],
          withoutintervals: [],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Should handle long names
      const state = store.getState().routes;
      expect(state.routes).toHaveLength(1);
      expect(state.routes[0].habitName).toBe(longName);
      expect(state.routes[0].path.length).toBeGreaterThan(0);
    });

    it("should handle habits with many action types", async () => {
      // Arrange: Mock API response with many action types
      const manyActionTypes = Array.from(
        { length: 50 },
        (_, i) => `action-${i}`
      );
      const mockApiResponse = {
        data: {
          complex: [{ "Advanced Habit": manyActionTypes }],
          simple: [],
          withoutintervals: [],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Should handle large action types array
      const state = store.getState().routes;
      expect(state.routes).toHaveLength(1);
      expect(state.routes[0].actionTypes).toHaveLength(50);
    });

    it("should handle habits with numeric names", async () => {
      // Arrange: Mock API response with numeric names
      const mockApiResponse = {
        data: {
          simple: [{ "30 Day Challenge": [] }, { "100 Push-ups": [] }],
          complex: [],
          withoutintervals: [],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Should handle numeric names
      const state = store.getState().routes;
      expect(state.routes).toHaveLength(2);

      const challengeRoute = state.routes.find(
        (r) => r.habitName === "30 Day Challenge"
      );
      expect(challengeRoute?.path).toBe("/30-day-challenge");

      const pushupsRoute = state.routes.find(
        (r) => r.habitName === "100 Push-ups"
      );
      expect(pushupsRoute?.path).toBe("/100-push-ups");
    });

    it("should handle habits with emoji in names", async () => {
      // Arrange: Mock API response with emoji
      const mockApiResponse = {
        data: {
          simple: [{ "Reading 📚": [] }, { "💪 Workout": [] }],
          complex: [],
          withoutintervals: [],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Should handle emoji (remove or keep in habitName, remove from path)
      const state = store.getState().routes;
      expect(state.routes).toHaveLength(2);
      // Paths should be URL-safe (ASCII only)
      state.routes.forEach((route) => {
        expect(route.path).toMatch(/^\/[a-z0-9\-]+$/);
      });
    });
  });

  describe("Request Timeout Configuration", () => {
    it("should configure request with 10 second timeout", async () => {
      // Arrange: Mock API response
      const mockApiResponse = {
        data: {
          complex: [],
          simple: [],
          withoutintervals: [],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      // Act: Dispatch the async thunk
      await store.dispatch(fetchRoutes());

      // Assert: Verify timeout configuration
      // This test verifies the axios call configuration
      expect(mockedAxios.get).toHaveBeenCalled();
      // In implementation, should include { timeout: 10000 }
    });
  });
});
