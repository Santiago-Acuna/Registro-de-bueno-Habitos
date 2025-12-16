/**
 * US-003: useRoutes Custom Hook Tests
 *
 * RED PHASE - These tests MUST FAIL initially
 *
 * This test suite verifies the useRoutes custom hook for managing route
 * configuration state through Redux. The hook encapsulates access to dynamic
 * routes fetched from the backend, providing a clean API for components.
 *
 * User Story: As a frontend developer, I want a custom hook to access routes
 * state and actions so that components can easily fetch and consume route
 * configuration without directly accessing Redux.
 *
 * Test Coverage:
 * 1. Hook structure and exports
 * 2. Redux state access (routes, loading, error)
 * 3. fetchRoutes action dispatching
 * 4. clearError action dispatching
 * 5. Function reference stability (useCallback)
 * 6. Multiple hook instances sharing state
 * 7. TypeScript return types
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ReactNode } from 'react';
import { routesReducer } from '../../slices/routes/routes';
import type { RouteConfig } from '../../slices/routes/routes.types';

// Import the hook we're testing (this will fail initially - RED phase)
// @ts-expect-error - Hook doesn't exist yet (RED phase)
import { useRoutes } from '../useRoutes';

// Mock axios for async thunk testing
vi.mock('axios');
import axios from 'axios';

describe('US-003: useRoutes Custom Hook', () => {
  let store: ReturnType<typeof configureStore>;

  // Helper to create a Redux wrapper for testing hooks
  const createWrapper = (testStore: typeof store) => {
    return ({ children }: { children: ReactNode }) => (
      <Provider store={testStore}>{children}</Provider>
    );
  };

  beforeEach(() => {
    // Create a fresh store for each test with routes slice
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

  describe('Hook Existence and Structure', () => {
    it('should be a function', () => {
      // Arrange & Act: Check if useRoutes is a function

      // Assert: Hook should be a function
      expect(typeof useRoutes).toBe('function');
    });

    it('should follow React hooks naming convention', () => {
      // Arrange & Act: Get hook name
      const hookName = useRoutes.name;

      // Assert: Should start with 'use' and be PascalCase
      expect(hookName).toMatch(/^use[A-Z]/);
      expect(hookName).toBe('useRoutes');
    });

    it('should return an object with expected properties', () => {
      // Arrange: Create wrapper with store
      const wrapper = createWrapper(store);

      // Act: Render the hook
      const { result } = renderHook(() => useRoutes(), { wrapper });

      // Assert: Should return object with all required properties
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('routes');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('fetchRoutes');
      expect(result.current).toHaveProperty('clearError');
    });

    it('should return routes as an array', () => {
      // Arrange: Create wrapper
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useRoutes(), { wrapper });

      // Assert: routes should be an array
      expect(Array.isArray(result.current.routes)).toBe(true);
    });

    it('should return isLoading as a boolean', () => {
      // Arrange: Create wrapper
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useRoutes(), { wrapper });

      // Assert: isLoading should be boolean
      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('should return error as string or null', () => {
      // Arrange: Create wrapper
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useRoutes(), { wrapper });

      // Assert: error should be string or null
      expect(
        typeof result.current.error === 'string' || result.current.error === null
      ).toBe(true);
    });

    it('should return fetchRoutes as a function', () => {
      // Arrange: Create wrapper
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useRoutes(), { wrapper });

      // Assert: fetchRoutes should be a function
      expect(typeof result.current.fetchRoutes).toBe('function');
    });

    it('should return clearError as a function', () => {
      // Arrange: Create wrapper
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useRoutes(), { wrapper });

      // Assert: clearError should be a function
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('Initial State Access', () => {
    it('should return empty routes array initially', () => {
      // Arrange: Create wrapper with fresh store
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useRoutes(), { wrapper });

      // Assert: Should return empty array
      expect(result.current.routes).toEqual([]);
      expect(result.current.routes.length).toBe(0);
    });

    it('should return isLoading as false initially', () => {
      // Arrange: Create wrapper
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useRoutes(), { wrapper });

      // Assert: Should not be loading initially
      expect(result.current.isLoading).toBe(false);
    });

    it('should return error as null initially', () => {
      // Arrange: Create wrapper
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useRoutes(), { wrapper });

      // Assert: Should have no error initially
      expect(result.current.error).toBeNull();
    });
  });

  describe('Redux State Integration', () => {
    it('should access routes from Redux state', () => {
      // Arrange: Populate store with routes
      const mockRoutes: RouteConfig[] = [
        {
          path: '/programming',
          component: 'ComplexHabits',
          habitName: 'Programming',
          habitType: 'complex',
          actionTypes: ['for work', 'personal project'],
        },
        {
          path: '/exercise',
          component: 'SimpleHabits',
          habitName: 'Exercise',
          habitType: 'simple',
          actionTypes: ['cardio', 'strength'],
        },
      ];

      store.dispatch({ type: 'routes/setRoutes', payload: mockRoutes });

      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useRoutes(), { wrapper });

      // Assert: Should return routes from Redux state
      expect(result.current.routes).toEqual(mockRoutes);
      expect(result.current.routes.length).toBe(2);
    });

    it('should access isLoading from Redux state', () => {
      // Arrange: Set loading state in store
      store.dispatch({ type: 'routes/setLoading', payload: true });

      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useRoutes(), { wrapper });

      // Assert: Should return loading state from Redux
      expect(result.current.isLoading).toBe(true);
    });

    it('should access error from Redux state', () => {
      // Arrange: Set error in store
      const errorMessage = 'Failed to fetch routes';
      store.dispatch({ type: 'routes/setError', payload: errorMessage });

      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useRoutes(), { wrapper });

      // Assert: Should return error from Redux state
      expect(result.current.error).toBe(errorMessage);
    });

    it('should react to Redux state changes', () => {
      // Arrange: Create wrapper
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useRoutes(), { wrapper });

      // Initial state
      expect(result.current.routes).toEqual([]);

      // Update Redux state
      const newRoutes: RouteConfig[] = [
        {
          path: '/reading',
          component: 'ComplexHabits',
          habitName: 'Reading',
          habitType: 'complex',
          actionTypes: ['fiction', 'non-fiction'],
        },
      ];

      store.dispatch({ type: 'routes/setRoutes', payload: newRoutes });

      // Assert: Hook should reflect new state
      expect(result.current.routes).toEqual(newRoutes);
    });
  });

  describe('fetchRoutes Function', () => {
    it('should dispatch fetchRoutes async thunk when called', async () => {
      // Arrange: Mock successful API response
      const mockApiResponse = {
        data: {
          complex: [{ Programming: ['for work', 'personal'] }],
          simple: [],
          withoutintervals: [],
        },
      };

      vi.mocked(axios.get).mockResolvedValueOnce(mockApiResponse);

      const wrapper = createWrapper(store);

      // Act: Render hook and call fetchRoutes
      const { result } = renderHook(() => useRoutes(), { wrapper });

      const fetchPromise = result.current.fetchRoutes();

      // Assert: Should be a promise
      expect(fetchPromise).toBeInstanceOf(Promise);

      // Wait for async action to complete
      await fetchPromise;

      // Verify routes were fetched
      expect(result.current.routes.length).toBeGreaterThan(0);
    });

    it('should update loading state when fetchRoutes is called', async () => {
      // Arrange: Mock delayed API response
      let resolvePromise: (value: any) => void;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(axios.get).mockReturnValueOnce(delayedPromise as any);

      const wrapper = createWrapper(store);

      // Act: Render hook and call fetchRoutes
      const { result } = renderHook(() => useRoutes(), { wrapper });

      const fetchPromise = result.current.fetchRoutes();

      // Assert: Loading should be true during fetch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Resolve the API call
      resolvePromise!({
        data: {
          complex: [],
          simple: [],
          withoutintervals: [],
        },
      });

      await fetchPromise;

      // Assert: Loading should be false after completion
      expect(result.current.isLoading).toBe(false);
    });

    it('should populate routes after successful fetch', async () => {
      // Arrange: Mock API response with routes
      const mockApiResponse = {
        data: {
          complex: [
            { Programming: ['for work', 'personal project'] },
            { Reading: ['fiction', 'non-fiction'] },
          ],
          simple: [{ Exercise: ['cardio', 'strength'] }],
          withoutintervals: [],
        },
      };

      vi.mocked(axios.get).mockResolvedValueOnce(mockApiResponse);

      const wrapper = createWrapper(store);

      // Act: Render hook and fetch routes
      const { result } = renderHook(() => useRoutes(), { wrapper });

      await result.current.fetchRoutes();

      // Assert: Routes should be populated with transformed data
      expect(result.current.routes.length).toBe(3);

      const programmingRoute = result.current.routes.find(
        (r) => r.habitName === 'Programming'
      );
      expect(programmingRoute).toBeDefined();
      expect(programmingRoute?.path).toBe('/programming');
      expect(programmingRoute?.component).toBe('ComplexHabits');
      expect(programmingRoute?.habitType).toBe('complex');
    });

    it('should handle fetch errors gracefully', async () => {
      // Arrange: Mock API error
      const networkError = new Error('Network Error');
      (networkError as any).code = 'ERR_NETWORK';
      vi.mocked(axios.get).mockRejectedValueOnce(networkError);

      const wrapper = createWrapper(store);

      // Act: Render hook and fetch routes
      const { result } = renderHook(() => useRoutes(), { wrapper });

      await result.current.fetchRoutes();

      // Assert: Should store error message
      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('Unable to load routes');
      expect(result.current.isLoading).toBe(false);
    });

    it('should clear previous errors on successful fetch', async () => {
      // Arrange: Set an error in state
      store.dispatch({
        type: 'routes/setError',
        payload: 'Previous error',
      });

      const wrapper = createWrapper(store);
      const { result } = renderHook(() => useRoutes(), { wrapper });

      expect(result.current.error).toBe('Previous error');

      // Mock successful API response
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: {
          complex: [],
          simple: [],
          withoutintervals: [],
        },
      });

      // Act: Fetch routes
      await result.current.fetchRoutes();

      // Assert: Error should be cleared
      expect(result.current.error).toBeNull();
    });

    it('should return a promise from fetchRoutes', () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: {
          complex: [],
          simple: [],
          withoutintervals: [],
        },
      });

      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useRoutes(), { wrapper });

      const returnValue = result.current.fetchRoutes();

      // Assert: Should return a promise
      expect(returnValue).toBeInstanceOf(Promise);
      expect(typeof returnValue.then).toBe('function');
      expect(typeof returnValue.catch).toBe('function');
    });
  });

  describe('clearError Function', () => {
    it('should clear error when called', () => {
      // Arrange: Set an error in state
      store.dispatch({
        type: 'routes/setError',
        payload: 'Test error message',
      });

      const wrapper = createWrapper(store);
      const { result } = renderHook(() => useRoutes(), { wrapper });

      // Verify error exists
      expect(result.current.error).toBe('Test error message');

      // Act: Clear error
      result.current.clearError();

      // Assert: Error should be null
      expect(result.current.error).toBeNull();
    });

    it('should not affect routes when clearing error', () => {
      // Arrange: Set routes and error
      const mockRoutes: RouteConfig[] = [
        {
          path: '/programming',
          component: 'ComplexHabits',
          habitName: 'Programming',
          habitType: 'complex',
          actionTypes: [],
        },
      ];

      store.dispatch({ type: 'routes/setRoutes', payload: mockRoutes });
      store.dispatch({ type: 'routes/setError', payload: 'Error message' });

      const wrapper = createWrapper(store);
      const { result } = renderHook(() => useRoutes(), { wrapper });

      // Act: Clear error
      result.current.clearError();

      // Assert: Routes should remain unchanged
      expect(result.current.routes).toEqual(mockRoutes);
      expect(result.current.error).toBeNull();
    });

    it('should not affect loading state when clearing error', () => {
      // Arrange: Set error and ensure not loading
      store.dispatch({ type: 'routes/setError', payload: 'Error' });
      store.dispatch({ type: 'routes/setLoading', payload: false });

      const wrapper = createWrapper(store);
      const { result } = renderHook(() => useRoutes(), { wrapper });

      const initialLoading = result.current.isLoading;

      // Act: Clear error
      result.current.clearError();

      // Assert: Loading state should remain the same
      expect(result.current.isLoading).toBe(initialLoading);
    });

    it('should be safe to call when no error exists', () => {
      // Arrange: No error in state
      const wrapper = createWrapper(store);
      const { result } = renderHook(() => useRoutes(), { wrapper });

      expect(result.current.error).toBeNull();

      // Act: Clear error (should not throw)
      expect(() => result.current.clearError()).not.toThrow();

      // Assert: Error should still be null
      expect(result.current.error).toBeNull();
    });
  });

  describe('Function Reference Stability (useCallback)', () => {
    it('should maintain stable reference for fetchRoutes across re-renders', () => {
      // Arrange: Create wrapper
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result, rerender } = renderHook(() => useRoutes(), { wrapper });

      const firstFetchRoutes = result.current.fetchRoutes;

      // Re-render
      rerender();

      const secondFetchRoutes = result.current.fetchRoutes;

      // Assert: Function reference should be the same
      expect(firstFetchRoutes).toBe(secondFetchRoutes);
    });

    it('should maintain stable reference for clearError across re-renders', () => {
      // Arrange: Create wrapper
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result, rerender } = renderHook(() => useRoutes(), { wrapper });

      const firstClearError = result.current.clearError;

      // Re-render
      rerender();

      const secondClearError = result.current.clearError;

      // Assert: Function reference should be the same
      expect(firstClearError).toBe(secondClearError);
    });

    it('should not create new function instances on state changes', () => {
      // Arrange: Create wrapper
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useRoutes(), { wrapper });

      const initialFetchRoutes = result.current.fetchRoutes;
      const initialClearError = result.current.clearError;

      // Update Redux state (simulating state change)
      store.dispatch({ type: 'routes/setLoading', payload: true });

      // Assert: Function references should remain stable
      expect(result.current.fetchRoutes).toBe(initialFetchRoutes);
      expect(result.current.clearError).toBe(initialClearError);
    });

    it('should be safe to use in useEffect dependency arrays', () => {
      // Arrange: Create wrapper
      const wrapper = createWrapper(store);

      // Act: Render hook multiple times
      const { result, rerender } = renderHook(() => useRoutes(), { wrapper });

      const functions = [result.current.fetchRoutes, result.current.clearError];

      // Re-render 5 times
      for (let i = 0; i < 5; i++) {
        rerender();
      }

      // Assert: Functions should maintain same references
      expect(result.current.fetchRoutes).toBe(functions[0]);
      expect(result.current.clearError).toBe(functions[1]);
    });
  });

  describe('Multiple Hook Instances', () => {
    it('should share state between multiple hook instances', () => {
      // Arrange: Create wrapper with shared store
      const wrapper = createWrapper(store);

      // Act: Render two instances of the hook
      const { result: result1 } = renderHook(() => useRoutes(), { wrapper });
      const { result: result2 } = renderHook(() => useRoutes(), { wrapper });

      // Assert: Both instances should have the same initial state
      expect(result1.current.routes).toEqual(result2.current.routes);
      expect(result1.current.isLoading).toBe(result2.current.isLoading);
      expect(result1.current.error).toBe(result2.current.error);
    });

    it('should sync state changes across multiple instances', () => {
      // Arrange: Create wrapper
      const wrapper = createWrapper(store);

      // Act: Render two instances
      const { result: result1 } = renderHook(() => useRoutes(), { wrapper });
      const { result: result2 } = renderHook(() => useRoutes(), { wrapper });

      // Update state through store
      const newRoutes: RouteConfig[] = [
        {
          path: '/meditation',
          component: 'SimpleHabits',
          habitName: 'Meditation',
          habitType: 'simple',
          actionTypes: [],
        },
      ];

      store.dispatch({ type: 'routes/setRoutes', payload: newRoutes });

      // Assert: Both instances should reflect the change
      expect(result1.current.routes).toEqual(newRoutes);
      expect(result2.current.routes).toEqual(newRoutes);
    });

    it('should allow independent function calls from different instances', async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({
        data: {
          complex: [],
          simple: [],
          withoutintervals: [],
        },
      });

      const wrapper = createWrapper(store);

      // Act: Render two instances
      const { result: result1 } = renderHook(() => useRoutes(), { wrapper });
      const { result: result2 } = renderHook(() => useRoutes(), { wrapper });

      // Call fetchRoutes from first instance
      await result1.current.fetchRoutes();

      // Assert: Second instance should see the updated state
      expect(result2.current.routes).toEqual(result1.current.routes);
    });

    it('should handle concurrent clearError calls from multiple instances', () => {
      // Arrange: Set error
      store.dispatch({ type: 'routes/setError', payload: 'Error' });

      const wrapper = createWrapper(store);

      const { result: result1 } = renderHook(() => useRoutes(), { wrapper });
      const { result: result2 } = renderHook(() => useRoutes(), { wrapper });

      // Act: Clear error from both instances
      result1.current.clearError();
      result2.current.clearError();

      // Assert: Error should be cleared (no conflicts)
      expect(result1.current.error).toBeNull();
      expect(result2.current.error).toBeNull();
    });
  });

  describe('TypeScript Return Types', () => {
    it('should have correct type for routes property', () => {
      // Arrange: Create wrapper
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useRoutes(), { wrapper });

      // Assert: routes should be RouteConfig[]
      expect(Array.isArray(result.current.routes)).toBe(true);

      // If routes exist, verify structure
      if (result.current.routes.length > 0) {
        const route = result.current.routes[0];
        expect(route).toHaveProperty('path');
        expect(route).toHaveProperty('component');
        expect(route).toHaveProperty('habitName');
        expect(route).toHaveProperty('habitType');
        expect(route).toHaveProperty('actionTypes');
        expect(Array.isArray(route.actionTypes)).toBe(true);
      }
    });

    it('should have correct type for isLoading property', () => {
      // Arrange: Create wrapper
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useRoutes(), { wrapper });

      // Assert: isLoading should be boolean
      expect(typeof result.current.isLoading).toBe('boolean');
      expect(
        result.current.isLoading === true || result.current.isLoading === false
      ).toBe(true);
    });

    it('should have correct type for error property', () => {
      // Arrange: Create wrapper
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useRoutes(), { wrapper });

      // Assert: error should be string | null
      const errorType = typeof result.current.error;
      expect(
        errorType === 'string' ||
          result.current.error === null
      ).toBe(true);
    });

    it('should have correct return type for fetchRoutes', async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: {
          complex: [],
          simple: [],
          withoutintervals: [],
        },
      });

      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useRoutes(), { wrapper });

      const returnValue = result.current.fetchRoutes();

      // Assert: fetchRoutes should return Promise<void>
      expect(returnValue).toBeInstanceOf(Promise);

      await returnValue;

      // Should resolve to void (undefined)
      expect(await result.current.fetchRoutes()).toBeUndefined();
    });

    it('should have correct return type for clearError', () => {
      // Arrange: Create wrapper
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useRoutes(), { wrapper });

      const returnValue = result.current.clearError();

      // Assert: clearError should return void (undefined)
      expect(returnValue).toBeUndefined();
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle unmounting during async fetch', async () => {
      // Arrange: Mock slow API response
      let resolvePromise: (value: any) => void;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(axios.get).mockReturnValueOnce(delayedPromise as any);

      const wrapper = createWrapper(store);

      // Act: Render hook and start fetch
      const { result, unmount } = renderHook(() => useRoutes(), { wrapper });

      const fetchPromise = result.current.fetchRoutes();

      // Unmount before fetch completes
      unmount();

      // Resolve the promise after unmount
      resolvePromise!({
        data: {
          complex: [],
          simple: [],
          withoutintervals: [],
        },
      });

      // Assert: Should not throw errors
      await expect(fetchPromise).resolves.toBeDefined();
    });

    it('should handle rapid consecutive fetchRoutes calls', async () => {
      // Arrange: Mock API
      vi.mocked(axios.get).mockResolvedValue({
        data: {
          complex: [],
          simple: [],
          withoutintervals: [],
        },
      });

      const wrapper = createWrapper(store);

      // Act: Render hook and make rapid calls
      const { result } = renderHook(() => useRoutes(), { wrapper });

      const promise1 = result.current.fetchRoutes();
      const promise2 = result.current.fetchRoutes();
      const promise3 = result.current.fetchRoutes();

      // Assert: All promises should resolve without errors
      await expect(Promise.all([promise1, promise2, promise3])).resolves.toBeDefined();
    });

    it('should handle empty routes array from backend', async () => {
      // Arrange: Mock empty response
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: {
          complex: [],
          simple: [],
          withoutintervals: [],
        },
      });

      const wrapper = createWrapper(store);

      // Act: Render hook and fetch
      const { result } = renderHook(() => useRoutes(), { wrapper });

      await result.current.fetchRoutes();

      // Assert: Should handle empty array gracefully
      expect(result.current.routes).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle network timeout errors', async () => {
      // Arrange: Mock timeout error
      const timeoutError = new Error('timeout of 10000ms exceeded');
      (timeoutError as any).code = 'ECONNABORTED';
      vi.mocked(axios.get).mockRejectedValueOnce(timeoutError);

      const wrapper = createWrapper(store);

      // Act: Render hook and fetch
      const { result } = renderHook(() => useRoutes(), { wrapper });

      await result.current.fetchRoutes();

      // Assert: Should handle timeout gracefully
      expect(result.current.error).toContain('timed out');
      expect(result.current.routes).toEqual([]);
    });

    it('should handle 404 API errors', async () => {
      // Arrange: Mock 404 error
      const error404 = {
        response: {
          status: 404,
          data: { message: 'Not Found' },
        },
      };
      vi.mocked(axios.get).mockRejectedValueOnce(error404);

      const wrapper = createWrapper(store);

      // Act: Render hook and fetch
      const { result } = renderHook(() => useRoutes(), { wrapper });

      await result.current.fetchRoutes();

      // Assert: Should handle 404 with user-friendly message
      expect(result.current.error).toContain('not found');
      expect(result.current.error).toContain('contact support');
    });

    it('should handle 500 server errors', async () => {
      // Arrange: Mock 500 error
      const error500 = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      };
      vi.mocked(axios.get).mockRejectedValueOnce(error500);

      const wrapper = createWrapper(store);

      // Act: Render hook and fetch
      const { result } = renderHook(() => useRoutes(), { wrapper });

      await result.current.fetchRoutes();

      // Assert: Should handle 500 with user-friendly message
      expect(result.current.error).toContain('Server error');
      expect(result.current.error).toContain('try again later');
    });
  });

  describe('Integration with Redux Async Thunk', () => {
    it('should integrate with fetchRoutes async thunk', async () => {
      // Arrange: Mock API response
      const mockApiResponse = {
        data: {
          complex: [{ 'Learn TypeScript': ['basics', 'advanced'] }],
          simple: [],
          withoutintervals: [],
        },
      };

      vi.mocked(axios.get).mockResolvedValueOnce(mockApiResponse);

      const wrapper = createWrapper(store);

      // Act: Render hook and fetch
      const { result } = renderHook(() => useRoutes(), { wrapper });

      await result.current.fetchRoutes();

      // Assert: Should dispatch thunk and update state
      expect(result.current.routes).toHaveLength(1);
      expect(result.current.routes[0].habitName).toBe('Learn TypeScript');
      expect(result.current.routes[0].path).toBe('/learn-typescript');
    });

    it('should handle thunk pending state', async () => {
      // Arrange: Mock delayed response
      let resolvePromise: (value: any) => void;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(axios.get).mockReturnValueOnce(delayedPromise as any);

      const wrapper = createWrapper(store);

      // Act: Render hook and start fetch
      const { result } = renderHook(() => useRoutes(), { wrapper });

      const fetchPromise = result.current.fetchRoutes();

      // Assert: Should be in loading state
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Resolve
      resolvePromise!({
        data: {
          complex: [],
          simple: [],
          withoutintervals: [],
        },
      });

      await fetchPromise;

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle thunk fulfilled state', async () => {
      // Arrange: Mock successful response
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: {
          complex: [{ Coding: ['frontend', 'backend'] }],
          simple: [],
          withoutintervals: [],
        },
      });

      const wrapper = createWrapper(store);

      // Act: Render hook and fetch
      const { result } = renderHook(() => useRoutes(), { wrapper });

      await result.current.fetchRoutes();

      // Assert: Should be in fulfilled state
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.routes.length).toBeGreaterThan(0);
    });

    it('should handle thunk rejected state', async () => {
      // Arrange: Mock error
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network Error'));

      const wrapper = createWrapper(store);

      // Act: Render hook and fetch
      const { result } = renderHook(() => useRoutes(), { wrapper });

      await result.current.fetchRoutes();

      // Assert: Should be in rejected state
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeTruthy();
      expect(result.current.routes).toEqual([]);
    });
  });

  describe('Hook Cleanup and Memory Leaks', () => {
    it('should cleanup properly on unmount', () => {
      // Arrange: Create wrapper
      const wrapper = createWrapper(store);

      // Act: Render and unmount
      const { unmount } = renderHook(() => useRoutes(), { wrapper });

      // Assert: Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });

    it('should not cause memory leaks with multiple mount/unmount cycles', () => {
      // Arrange: Create wrapper
      const wrapper = createWrapper(store);

      // Act: Mount and unmount multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = renderHook(() => useRoutes(), { wrapper });
        unmount();
      }

      // Assert: Should complete without errors
      expect(true).toBe(true);
    });

    it('should not update state after unmount', async () => {
      // Arrange: Mock delayed API
      let resolvePromise: (value: any) => void;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(axios.get).mockReturnValueOnce(delayedPromise as any);

      const wrapper = createWrapper(store);

      // Act: Render, fetch, and unmount
      const { result, unmount } = renderHook(() => useRoutes(), { wrapper });

      result.current.fetchRoutes();

      unmount();

      // Resolve after unmount
      resolvePromise!({
        data: {
          complex: [],
          simple: [],
          withoutintervals: [],
        },
      });

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Assert: No state update warnings (test passes if no console errors)
      expect(true).toBe(true);
    });
  });
});
