/**
 * Routes Redux Slice Tests
 *
 * RED Phase: Comprehensive failing tests for routes slice
 *
 * Test Coverage:
 * - Initial state validation
 * - setRoutes action behavior
 * - setLoading action behavior
 * - setError action behavior
 * - clearError action behavior
 * - Edge cases and validation
 * - State selectors
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { routesReducer, setRoutes, setLoading, setError, clearError } from '../routes';
import type { RouteConfig, RoutesState } from '../routes.types';
import type { RootState } from '../../../store';

describe('Routes Redux Slice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    // Create a fresh store for each test
    store = configureStore({
      reducer: {
        routes: routesReducer,
      },
    });
  });

  describe('Initial State', () => {
    it('should have an empty routes array as initial state', () => {
      const state = store.getState().routes;
      expect(state.routes).toEqual([]);
      expect(Array.isArray(state.routes)).toBe(true);
      expect(state.routes.length).toBe(0);
    });

    it('should have isLoading set to false initially', () => {
      const state = store.getState().routes;
      expect(state.isLoading).toBe(false);
      expect(typeof state.isLoading).toBe('boolean');
    });

    it('should have error set to null initially', () => {
      const state = store.getState().routes;
      expect(state.error).toBeNull();
    });

    it('should match the complete initial state structure', () => {
      const state = store.getState().routes;
      const expectedInitialState: RoutesState = {
        routes: [],
        isLoading: false,
        error: null,
      };
      expect(state).toEqual(expectedInitialState);
    });
  });

  describe('setRoutes Action', () => {
    const mockRoutes: RouteConfig[] = [
      {
        path: '/habits/reading',
        component: 'ReadingHabit',
        habitName: 'Reading',
        habitType: 'complex',
        actionTypes: ['START', 'PAUSE', 'COMPLETE'],
      },
      {
        path: '/habits/exercise',
        component: 'ExerciseHabit',
        habitName: 'Exercise',
        habitType: 'simple',
        actionTypes: ['COMPLETE'],
      },
    ];

    it('should store routes in state when setRoutes is dispatched', () => {
      store.dispatch(setRoutes(mockRoutes));

      const state = store.getState().routes;
      expect(state.routes).toEqual(mockRoutes);
      expect(state.routes.length).toBe(2);
    });

    it('should clear loading state when setRoutes is dispatched', () => {
      // First set loading to true
      store.dispatch(setLoading(true));
      expect(store.getState().routes.isLoading).toBe(true);

      // Then dispatch setRoutes
      store.dispatch(setRoutes(mockRoutes));

      const state = store.getState().routes;
      expect(state.isLoading).toBe(false);
    });

    it('should clear any previous errors when setRoutes is dispatched', () => {
      // First set an error
      store.dispatch(setError('Failed to fetch routes'));
      expect(store.getState().routes.error).toBe('Failed to fetch routes');

      // Then dispatch setRoutes
      store.dispatch(setRoutes(mockRoutes));

      const state = store.getState().routes;
      expect(state.error).toBeNull();
    });

    it('should handle empty routes array', () => {
      store.dispatch(setRoutes([]));

      const state = store.getState().routes;
      expect(state.routes).toEqual([]);
      expect(state.routes.length).toBe(0);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should preserve route structure and properties', () => {
      const singleRoute: RouteConfig[] = [
        {
          path: '/habits/meditation',
          component: 'MeditationHabit',
          habitName: 'Meditation',
          habitType: 'withoutintervals',
          actionTypes: ['LOG'],
        },
      ];

      store.dispatch(setRoutes(singleRoute));

      const state = store.getState().routes;
      expect(state.routes[0]).toHaveProperty('path', '/habits/meditation');
      expect(state.routes[0]).toHaveProperty('component', 'MeditationHabit');
      expect(state.routes[0]).toHaveProperty('habitName', 'Meditation');
      expect(state.routes[0]).toHaveProperty('habitType', 'withoutintervals');
      expect(state.routes[0]).toHaveProperty('actionTypes');
      expect(state.routes[0].actionTypes).toEqual(['LOG']);
    });

    it('should replace existing routes with new routes', () => {
      // First set some routes
      store.dispatch(setRoutes(mockRoutes));
      expect(store.getState().routes.routes.length).toBe(2);

      // Then replace with different routes
      const newRoutes: RouteConfig[] = [
        {
          path: '/habits/writing',
          component: 'WritingHabit',
          habitName: 'Writing',
          habitType: 'complex',
          actionTypes: ['START', 'COMPLETE'],
        },
      ];

      store.dispatch(setRoutes(newRoutes));

      const state = store.getState().routes;
      expect(state.routes.length).toBe(1);
      expect(state.routes[0].habitName).toBe('Writing');
    });
  });

  describe('setLoading Action', () => {
    it('should set loading state to true', () => {
      store.dispatch(setLoading(true));

      const state = store.getState().routes;
      expect(state.isLoading).toBe(true);
    });

    it('should set loading state to false', () => {
      // First set to true
      store.dispatch(setLoading(true));
      expect(store.getState().routes.isLoading).toBe(true);

      // Then set to false
      store.dispatch(setLoading(false));

      const state = store.getState().routes;
      expect(state.isLoading).toBe(false);
    });

    it('should not affect routes array when setting loading', () => {
      const mockRoutes: RouteConfig[] = [
        {
          path: '/habits/coding',
          component: 'CodingHabit',
          habitName: 'Coding',
          habitType: 'complex',
          actionTypes: ['START', 'COMPLETE'],
        },
      ];

      store.dispatch(setRoutes(mockRoutes));
      store.dispatch(setLoading(true));

      const state = store.getState().routes;
      expect(state.routes).toEqual(mockRoutes);
      expect(state.isLoading).toBe(true);
    });

    it('should not affect error state when setting loading', () => {
      store.dispatch(setError('Some error'));
      store.dispatch(setLoading(true));

      const state = store.getState().routes;
      expect(state.error).toBe('Some error');
      expect(state.isLoading).toBe(true);
    });
  });

  describe('setError Action', () => {
    it('should store error message in state', () => {
      const errorMessage = 'Failed to fetch routes from API';
      store.dispatch(setError(errorMessage));

      const state = store.getState().routes;
      expect(state.error).toBe(errorMessage);
    });

    it('should set loading to false when error occurs', () => {
      // First set loading to true
      store.dispatch(setLoading(true));
      expect(store.getState().routes.isLoading).toBe(true);

      // Then dispatch error
      store.dispatch(setError('Network error'));

      const state = store.getState().routes;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network error');
    });

    it('should handle different error messages', () => {
      const errors = [
        'Network timeout',
        '404 Not Found',
        'Unauthorized access',
        'Server error occurred',
      ];

      errors.forEach((errorMsg) => {
        store.dispatch(setError(errorMsg));
        expect(store.getState().routes.error).toBe(errorMsg);
      });
    });

    it('should replace previous error with new error', () => {
      store.dispatch(setError('First error'));
      expect(store.getState().routes.error).toBe('First error');

      store.dispatch(setError('Second error'));

      const state = store.getState().routes;
      expect(state.error).toBe('Second error');
    });

    it('should not affect routes array when error is set', () => {
      const mockRoutes: RouteConfig[] = [
        {
          path: '/habits/running',
          component: 'RunningHabit',
          habitName: 'Running',
          habitType: 'simple',
          actionTypes: ['COMPLETE'],
        },
      ];

      store.dispatch(setRoutes(mockRoutes));
      store.dispatch(setError('Some error occurred'));

      const state = store.getState().routes;
      expect(state.routes).toEqual(mockRoutes);
      expect(state.error).toBe('Some error occurred');
    });
  });

  describe('clearError Action', () => {
    it('should set error to null', () => {
      // First set an error
      store.dispatch(setError('Some error message'));
      expect(store.getState().routes.error).toBe('Some error message');

      // Then clear it
      store.dispatch(clearError());

      const state = store.getState().routes;
      expect(state.error).toBeNull();
    });

    it('should not affect loading state when clearing error', () => {
      store.dispatch(setLoading(true));
      store.dispatch(setError('Error message'));
      store.dispatch(clearError());

      const state = store.getState().routes;
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(true);
    });

    it('should not affect routes array when clearing error', () => {
      const mockRoutes: RouteConfig[] = [
        {
          path: '/habits/yoga',
          component: 'YogaHabit',
          habitName: 'Yoga',
          habitType: 'withoutintervals',
          actionTypes: ['LOG'],
        },
      ];

      store.dispatch(setRoutes(mockRoutes));
      store.dispatch(setError('Error'));
      store.dispatch(clearError());

      const state = store.getState().routes;
      expect(state.routes).toEqual(mockRoutes);
      expect(state.error).toBeNull();
    });

    it('should work when no error exists', () => {
      // Clear error when there is none
      store.dispatch(clearError());

      const state = store.getState().routes;
      expect(state.error).toBeNull();
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle routes with all habitType values', () => {
      const routesWithAllTypes: RouteConfig[] = [
        {
          path: '/habits/complex-habit',
          component: 'ComplexComponent',
          habitName: 'Complex Habit',
          habitType: 'complex',
          actionTypes: ['START', 'PAUSE', 'COMPLETE'],
        },
        {
          path: '/habits/simple-habit',
          component: 'SimpleComponent',
          habitName: 'Simple Habit',
          habitType: 'simple',
          actionTypes: ['COMPLETE'],
        },
        {
          path: '/habits/interval-habit',
          component: 'IntervalComponent',
          habitName: 'Interval Habit',
          habitType: 'withoutintervals',
          actionTypes: ['LOG'],
        },
      ];

      store.dispatch(setRoutes(routesWithAllTypes));

      const state = store.getState().routes;
      expect(state.routes.length).toBe(3);
      expect(state.routes[0].habitType).toBe('complex');
      expect(state.routes[1].habitType).toBe('simple');
      expect(state.routes[2].habitType).toBe('withoutintervals');
    });

    it('should handle routes with empty actionTypes array', () => {
      const routeWithNoActions: RouteConfig[] = [
        {
          path: '/habits/passive',
          component: 'PassiveHabit',
          habitName: 'Passive',
          habitType: 'simple',
          actionTypes: [],
        },
      ];

      store.dispatch(setRoutes(routeWithNoActions));

      const state = store.getState().routes;
      expect(state.routes[0].actionTypes).toEqual([]);
      expect(state.routes[0].actionTypes.length).toBe(0);
    });

    it('should handle routes with multiple actionTypes', () => {
      const routeWithManyActions: RouteConfig[] = [
        {
          path: '/habits/advanced',
          component: 'AdvancedHabit',
          habitName: 'Advanced',
          habitType: 'complex',
          actionTypes: ['START', 'PAUSE', 'RESUME', 'COMPLETE', 'CANCEL'],
        },
      ];

      store.dispatch(setRoutes(routeWithManyActions));

      const state = store.getState().routes;
      expect(state.routes[0].actionTypes.length).toBe(5);
      expect(state.routes[0].actionTypes).toContain('START');
      expect(state.routes[0].actionTypes).toContain('CANCEL');
    });

    it('should handle routes with special characters in path', () => {
      const routeWithSpecialPath: RouteConfig[] = [
        {
          path: '/habits/special-habit_123',
          component: 'SpecialHabit',
          habitName: 'Special Habit',
          habitType: 'simple',
          actionTypes: ['COMPLETE'],
        },
      ];

      store.dispatch(setRoutes(routeWithSpecialPath));

      const state = store.getState().routes;
      expect(state.routes[0].path).toBe('/habits/special-habit_123');
    });

    it('should handle routes with long habitName strings', () => {
      const routeWithLongName: RouteConfig[] = [
        {
          path: '/habits/long',
          component: 'LongNameHabit',
          habitName: 'This is a very long habit name that could potentially cause issues if not handled properly',
          habitType: 'complex',
          actionTypes: ['START', 'COMPLETE'],
        },
      ];

      store.dispatch(setRoutes(routeWithLongName));

      const state = store.getState().routes;
      expect(state.routes[0].habitName.length).toBeGreaterThan(50);
      expect(state.routes[0].habitName).toBe(
        'This is a very long habit name that could potentially cause issues if not handled properly'
      );
    });

    it('should handle large number of routes', () => {
      const manyRoutes: RouteConfig[] = Array.from({ length: 100 }, (_, i) => ({
        path: `/habits/habit-${i}`,
        component: `Habit${i}Component`,
        habitName: `Habit ${i}`,
        habitType: (i % 3 === 0 ? 'complex' : i % 3 === 1 ? 'simple' : 'withoutintervals') as
          | 'complex'
          | 'simple'
          | 'withoutintervals',
        actionTypes: ['COMPLETE'],
      }));

      store.dispatch(setRoutes(manyRoutes));

      const state = store.getState().routes;
      expect(state.routes.length).toBe(100);
      expect(state.routes[0].habitName).toBe('Habit 0');
      expect(state.routes[99].habitName).toBe('Habit 99');
    });
  });

  describe('State Selectors', () => {
    it('should select routes from state', () => {
      const mockRoutes: RouteConfig[] = [
        {
          path: '/habits/select-test',
          component: 'SelectTestHabit',
          habitName: 'Select Test',
          habitType: 'simple',
          actionTypes: ['COMPLETE'],
        },
      ];

      store.dispatch(setRoutes(mockRoutes));

      const state = store.getState() as RootState & { routes: RoutesState };
      const routes = state.routes.routes;

      expect(routes).toEqual(mockRoutes);
    });

    it('should select loading state from state', () => {
      store.dispatch(setLoading(true));

      const state = store.getState() as RootState & { routes: RoutesState };
      const isLoading = state.routes.isLoading;

      expect(isLoading).toBe(true);
    });

    it('should select error state from state', () => {
      const errorMessage = 'Test error';
      store.dispatch(setError(errorMessage));

      const state = store.getState() as RootState & { routes: RoutesState };
      const error = state.routes.error;

      expect(error).toBe(errorMessage);
    });

    it('should select complete routes state', () => {
      const mockRoutes: RouteConfig[] = [
        {
          path: '/habits/complete',
          component: 'CompleteHabit',
          habitName: 'Complete',
          habitType: 'complex',
          actionTypes: ['START', 'COMPLETE'],
        },
      ];

      store.dispatch(setRoutes(mockRoutes));
      store.dispatch(setLoading(false));
      store.dispatch(setError(null));

      const state = store.getState() as RootState & { routes: RoutesState };
      const routesState = state.routes;

      expect(routesState).toEqual({
        routes: mockRoutes,
        isLoading: false,
        error: null,
      });
    });
  });

  describe('State Immutability', () => {
    it('should not mutate state when updating routes', () => {
      const initialRoutes: RouteConfig[] = [
        {
          path: '/habits/immutable-1',
          component: 'Immutable1',
          habitName: 'Immutable 1',
          habitType: 'simple',
          actionTypes: ['COMPLETE'],
        },
      ];

      store.dispatch(setRoutes(initialRoutes));
      const firstState = store.getState().routes;

      const newRoutes: RouteConfig[] = [
        {
          path: '/habits/immutable-2',
          component: 'Immutable2',
          habitName: 'Immutable 2',
          habitType: 'complex',
          actionTypes: ['START', 'COMPLETE'],
        },
      ];

      store.dispatch(setRoutes(newRoutes));
      const secondState = store.getState().routes;

      expect(firstState).not.toBe(secondState);
      expect(firstState.routes).not.toBe(secondState.routes);
    });

    it('should create new state object on each action', () => {
      const state1 = store.getState().routes;

      store.dispatch(setLoading(true));
      const state2 = store.getState().routes;

      store.dispatch(setError('error'));
      const state3 = store.getState().routes;

      expect(state1).not.toBe(state2);
      expect(state2).not.toBe(state3);
      expect(state1).not.toBe(state3);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle complete loading → success flow', () => {
      // Start loading
      store.dispatch(setLoading(true));
      expect(store.getState().routes.isLoading).toBe(true);
      expect(store.getState().routes.error).toBeNull();

      // Routes loaded successfully
      const mockRoutes: RouteConfig[] = [
        {
          path: '/habits/success',
          component: 'SuccessHabit',
          habitName: 'Success',
          habitType: 'simple',
          actionTypes: ['COMPLETE'],
        },
      ];

      store.dispatch(setRoutes(mockRoutes));

      const state = store.getState().routes;
      expect(state.routes).toEqual(mockRoutes);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle complete loading → error flow', () => {
      // Start loading
      store.dispatch(setLoading(true));
      expect(store.getState().routes.isLoading).toBe(true);

      // Error occurs
      store.dispatch(setError('Failed to fetch'));

      const state = store.getState().routes;
      expect(state.routes).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to fetch');
    });

    it('should handle error → retry → success flow', () => {
      // Initial error
      store.dispatch(setError('First attempt failed'));
      expect(store.getState().routes.error).toBe('First attempt failed');

      // Retry: clear error and start loading
      store.dispatch(clearError());
      store.dispatch(setLoading(true));
      expect(store.getState().routes.error).toBeNull();
      expect(store.getState().routes.isLoading).toBe(true);

      // Success
      const mockRoutes: RouteConfig[] = [
        {
          path: '/habits/retry',
          component: 'RetryHabit',
          habitName: 'Retry',
          habitType: 'complex',
          actionTypes: ['START', 'COMPLETE'],
        },
      ];

      store.dispatch(setRoutes(mockRoutes));

      const state = store.getState().routes;
      expect(state.routes).toEqual(mockRoutes);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle multiple error occurrences', () => {
      store.dispatch(setError('Error 1'));
      expect(store.getState().routes.error).toBe('Error 1');

      store.dispatch(clearError());
      expect(store.getState().routes.error).toBeNull();

      store.dispatch(setError('Error 2'));
      expect(store.getState().routes.error).toBe('Error 2');

      store.dispatch(clearError());
      expect(store.getState().routes.error).toBeNull();
    });

    it('should handle routes update after initial load', () => {
      // Initial load
      const initialRoutes: RouteConfig[] = [
        {
          path: '/habits/initial',
          component: 'InitialHabit',
          habitName: 'Initial',
          habitType: 'simple',
          actionTypes: ['COMPLETE'],
        },
      ];

      store.dispatch(setRoutes(initialRoutes));
      expect(store.getState().routes.routes.length).toBe(1);

      // Update with more routes
      const updatedRoutes: RouteConfig[] = [
        ...initialRoutes,
        {
          path: '/habits/updated',
          component: 'UpdatedHabit',
          habitName: 'Updated',
          habitType: 'complex',
          actionTypes: ['START', 'COMPLETE'],
        },
      ];

      store.dispatch(setRoutes(updatedRoutes));

      const state = store.getState().routes;
      expect(state.routes.length).toBe(2);
      expect(state.routes[1].habitName).toBe('Updated');
    });
  });
});
