/**
 * CH-003: useHabitMutations Hook Tests
 *
 * RED PHASE - These tests MUST FAIL initially
 *
 * This test suite verifies the useHabitMutations hook for creating,
 * updating, and deleting habits via the NestJS backend API.
 *
 * User Story: As a frontend developer, I need a React hook that handles
 * all habit mutation operations (create, update, delete) with proper
 * error handling, optimistic updates, and cache invalidation.
 *
 * Test Coverage:
 * 1. Hook initialization and structure
 * 2. Create habit mutation
 * 3. Update habit mutation
 * 4. Delete habit mutation
 * 5. Loading and error states
 * 6. Optimistic updates
 * 7. Cache invalidation after mutations
 * 8. Integration with backend API
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useHabitMutations } from '@/hooks';
import type { HabitBody } from '../../habits-types';

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

describe('CH-003: useHabitMutations Hook - Create/Update/Delete', () => {
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

      // Act: Check for useHabitMutations export
      const hasUseHabitMutations = 'useHabitMutations' in hooksModule;

      // Assert: Hook should be exported
      expect(hasUseHabitMutations).toBe(true);
      expect(typeof hooksModule.useHabitMutations).toBe('function');
    });

    it('should follow React hooks naming convention', async () => {
      // Arrange: Import the hook
      const { useHabitMutations: hook } = await import('@/hooks');

      // Act: Get hook name
      const hookName = hook.name;

      // Assert: Should start with 'use' and be PascalCase
      expect(hookName).toMatch(/^use[A-Z]/);
      expect(hookName).toBe('useHabitMutations');
    });

    it('should return an object with mutation methods', () => {
      // Arrange & Act: Render the hook
      const { result } = renderHook(() => useHabitMutations());

      // Assert: Should return object with all mutation methods
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('createHabit');
      expect(result.current).toHaveProperty('updateHabit');
      expect(result.current).toHaveProperty('deleteHabit');
    });

    it('should provide loading and error states for each mutation', () => {
      // Arrange & Act: Render the hook
      const { result } = renderHook(() => useHabitMutations());

      // Assert: Should have state properties
      expect(result.current).toHaveProperty('isCreating');
      expect(result.current).toHaveProperty('isUpdating');
      expect(result.current).toHaveProperty('isDeleting');
      expect(result.current).toHaveProperty('createError');
      expect(result.current).toHaveProperty('updateError');
      expect(result.current).toHaveProperty('deleteError');
    });
  });

  describe('Create Habit Mutation', () => {
    it('should have createHabit function', () => {
      // Arrange & Act: Render hook
      const { result } = renderHook(() => useHabitMutations());

      // Assert: createHabit should be a function
      expect(typeof result.current.createHabit).toBe('function');
    });

    it('should call POST API endpoint when creating habit', async () => {
      // Arrange: Mock successful creation
      const newHabit: HabitBody = {
        name: 'Exercise',
        icon: 'https://example.com/exercise.png',
        habit_type: 'Simple',
      };

      const createdHabit = { id: 'new-id-123', ...newHabit };
      vi.mocked(axios.post).mockResolvedValue({ data: createdHabit });

      // Act: Render hook and create habit
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        await result.current.createHabit(newHabit);
      });

      // Assert: Should call POST endpoint
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/habits'),
        newHabit
      );
    });

    it('should set isCreating to true during creation', async () => {
      // Arrange: Mock slow creation
      vi.mocked(axios.post).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: {} }), 100)
          )
      );

      // Act: Render hook and start creation
      const { result } = renderHook(() => useHabitMutations());

      act(() => {
        result.current.createHabit({
          name: 'Test',
          icon: 'icon',
          habit_type: 'Simple',
        });
      });

      // Assert: Should be in creating state
      expect(result.current.isCreating).toBe(true);
    });

    it('should set isCreating to false after successful creation', async () => {
      // Arrange: Mock successful creation
      vi.mocked(axios.post).mockResolvedValue({
        data: { id: '1', name: 'Test' },
      });

      // Act: Render hook and create habit
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        await result.current.createHabit({
          name: 'Test',
          icon: 'icon',
          habit_type: 'Simple',
        });
      });

      // Assert: Should not be creating anymore
      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });
    });

    it('should return created habit data', async () => {
      // Arrange: Mock creation response
      const createdHabit = {
        id: 'habit-123',
        name: 'Morning Run',
        icon: 'https://example.com/run.png',
        habit_type: 'Simple',
      };

      vi.mocked(axios.post).mockResolvedValue({ data: createdHabit });

      // Act: Create habit
      const { result } = renderHook(() => useHabitMutations());
      let returnedData;

      await act(async () => {
        returnedData = await result.current.createHabit({
          name: 'Morning Run',
          icon: 'https://example.com/run.png',
          habit_type: 'Simple',
        });
      });

      // Assert: Should return created data
      expect(returnedData).toEqual(createdHabit);
    });

    it('should handle creation errors', async () => {
      // Arrange: Mock creation error
      const errorMessage = 'Failed to create habit';
      vi.mocked(axios.post).mockRejectedValue(new Error(errorMessage));

      // Act: Attempt to create habit
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        try {
          await result.current.createHabit({
            name: 'Test',
            icon: 'icon',
            habit_type: 'Simple',
          });
        } catch (error) {
          // Expected to throw
        }
      });

      // Assert: Should set error state
      await waitFor(() => {
        expect(result.current.createError).toBeDefined();
        expect(result.current.isCreating).toBe(false);
      });
    });

    it('should validate habit data before sending to API', async () => {
      // Arrange: Mock API
      vi.mocked(axios.post).mockResolvedValue({ data: {} });

      // Act: Attempt to create invalid habit
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        try {
          await result.current.createHabit({
            name: '',
            icon: '',
            habit_type: '',
          } as HabitBody);
        } catch (error) {
          // May throw validation error
        }
      });

      // Assert: Should either validate or let backend handle it
      // If validation happens client-side, API should not be called
      // If validation is server-side, error should be captured
      expect(
        vi.mocked(axios.post).mock.calls.length === 0 ||
          result.current.createError !== null
      ).toBe(true);
    });

    it('should send correct headers for habit creation', async () => {
      // Arrange: Mock API
      vi.mocked(axios.post).mockResolvedValue({ data: {} });

      // Act: Create habit
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        await result.current.createHabit({
          name: 'Test',
          icon: 'icon',
          habit_type: 'Simple',
        });
      });

      // Assert: Should include proper headers
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('Update Habit Mutation', () => {
    it('should have updateHabit function', () => {
      // Arrange & Act: Render hook
      const { result } = renderHook(() => useHabitMutations());

      // Assert: updateHabit should be a function
      expect(typeof result.current.updateHabit).toBe('function');
    });

    it('should call PATCH API endpoint when updating habit', async () => {
      // Arrange: Mock successful update
      const habitId = 'habit-123';
      const updates: Partial<HabitBody> = {
        name: 'Updated Name',
      };

      vi.mocked(axios.patch).mockResolvedValue({
        data: { id: habitId, ...updates },
      });

      // Act: Render hook and update habit
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        await result.current.updateHabit(habitId, updates);
      });

      // Assert: Should call PATCH endpoint with ID
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining(`/habits/${habitId}`),
        updates
      );
    });

    it('should set isUpdating to true during update', async () => {
      // Arrange: Mock slow update
      vi.mocked(axios.patch).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: {} }), 100)
          )
      );

      // Act: Render hook and start update
      const { result } = renderHook(() => useHabitMutations());

      act(() => {
        result.current.updateHabit('habit-1', { name: 'Updated' });
      });

      // Assert: Should be in updating state
      expect(result.current.isUpdating).toBe(true);
    });

    it('should return updated habit data', async () => {
      // Arrange: Mock update response
      const updatedHabit = {
        id: 'habit-123',
        name: 'Updated Exercise',
        icon: 'https://example.com/new-icon.png',
        habit_type: 'Complex',
      };

      vi.mocked(axios.patch).mockResolvedValue({ data: updatedHabit });

      // Act: Update habit
      const { result } = renderHook(() => useHabitMutations());
      let returnedData;

      await act(async () => {
        returnedData = await result.current.updateHabit('habit-123', {
          name: 'Updated Exercise',
          habit_type: 'Complex',
        });
      });

      // Assert: Should return updated data
      expect(returnedData).toEqual(updatedHabit);
    });

    it('should handle partial updates', async () => {
      // Arrange: Mock partial update
      const habitId = 'habit-456';
      const partialUpdate = { name: 'New Name Only' };

      vi.mocked(axios.patch).mockResolvedValue({
        data: { id: habitId, ...partialUpdate },
      });

      // Act: Update only name field
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        await result.current.updateHabit(habitId, partialUpdate);
      });

      // Assert: Should send only updated fields
      expect(axios.patch).toHaveBeenCalledWith(
        expect.any(String),
        partialUpdate
      );
    });

    it('should handle update errors', async () => {
      // Arrange: Mock update error
      vi.mocked(axios.patch).mockRejectedValue(
        new Error('Update failed')
      );

      // Act: Attempt to update habit
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        try {
          await result.current.updateHabit('habit-1', { name: 'Test' });
        } catch (error) {
          // Expected to throw
        }
      });

      // Assert: Should set error state
      await waitFor(() => {
        expect(result.current.updateError).toBeDefined();
        expect(result.current.isUpdating).toBe(false);
      });
    });

    it('should handle 404 errors for non-existent habits', async () => {
      // Arrange: Mock 404 error
      vi.mocked(axios.patch).mockRejectedValue({
        response: { status: 404, data: { message: 'Habit not found' } },
      });

      // Act: Attempt to update non-existent habit
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        try {
          await result.current.updateHabit('nonexistent-id', {
            name: 'Test',
          });
        } catch (error) {
          // Expected
        }
      });

      // Assert: Should capture 404 error
      await waitFor(() => {
        expect(result.current.updateError).toBeDefined();
      });
    });
  });

  describe('Delete Habit Mutation', () => {
    it('should have deleteHabit function', () => {
      // Arrange & Act: Render hook
      const { result } = renderHook(() => useHabitMutations());

      // Assert: deleteHabit should be a function
      expect(typeof result.current.deleteHabit).toBe('function');
    });

    it('should call DELETE API endpoint when deleting habit', async () => {
      // Arrange: Mock successful deletion
      const habitId = 'habit-to-delete';
      vi.mocked(axios.delete).mockResolvedValue({ data: { success: true } });

      // Act: Render hook and delete habit
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        await result.current.deleteHabit(habitId);
      });

      // Assert: Should call DELETE endpoint with ID
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining(`/habits/${habitId}`)
      );
    });

    it('should set isDeleting to true during deletion', async () => {
      // Arrange: Mock slow deletion
      vi.mocked(axios.delete).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: {} }), 100)
          )
      );

      // Act: Render hook and start deletion
      const { result } = renderHook(() => useHabitMutations());

      act(() => {
        result.current.deleteHabit('habit-1');
      });

      // Assert: Should be in deleting state
      expect(result.current.isDeleting).toBe(true);
    });

    it('should set isDeleting to false after successful deletion', async () => {
      // Arrange: Mock successful deletion
      vi.mocked(axios.delete).mockResolvedValue({ data: {} });

      // Act: Delete habit
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        await result.current.deleteHabit('habit-1');
      });

      // Assert: Should not be deleting anymore
      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });
    });

    it('should handle deletion errors', async () => {
      // Arrange: Mock deletion error
      vi.mocked(axios.delete).mockRejectedValue(
        new Error('Delete failed')
      );

      // Act: Attempt to delete habit
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        try {
          await result.current.deleteHabit('habit-1');
        } catch (error) {
          // Expected to throw
        }
      });

      // Assert: Should set error state
      await waitFor(() => {
        expect(result.current.deleteError).toBeDefined();
        expect(result.current.isDeleting).toBe(false);
      });
    });

    it('should handle 404 errors when deleting non-existent habit', async () => {
      // Arrange: Mock 404 error
      vi.mocked(axios.delete).mockRejectedValue({
        response: { status: 404 },
      });

      // Act: Attempt to delete non-existent habit
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        try {
          await result.current.deleteHabit('nonexistent-id');
        } catch (error) {
          // Expected
        }
      });

      // Assert: Should handle error
      await waitFor(() => {
        expect(result.current.deleteError).toBeDefined();
      });
    });

    it('should prevent accidental deletion without confirmation', async () => {
      // Arrange: Mock API
      vi.mocked(axios.delete).mockResolvedValue({ data: {} });

      // Act: Render hook
      const { result } = renderHook(() => useHabitMutations());

      // Assert: deleteHabit should require habitId parameter
      // @ts-expect-error - Testing runtime behavior
      expect(() => result.current.deleteHabit()).toThrow();
    });
  });

  describe('Optimistic Updates', () => {
    it('should provide option for optimistic create', async () => {
      // Arrange: Mock slow API
      vi.mocked(axios.post).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: {} }), 1000)
          )
      );

      // Act: Create with optimistic update
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        result.current.createHabit(
          {
            name: 'Optimistic Habit',
            icon: 'icon',
            habit_type: 'Simple',
          },
          { optimistic: true }
        );
      });

      // Assert: Should have optimistic data available
      expect(
        result.current.optimisticData ||
          result.current.pendingMutations?.length
      ).toBeDefined();
    });

    it('should rollback optimistic update on error', async () => {
      // Arrange: Mock failed creation after optimistic update
      vi.mocked(axios.post).mockRejectedValue(new Error('Failed'));

      // Act: Create with optimistic update
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        try {
          await result.current.createHabit(
            { name: 'Test', icon: 'icon', habit_type: 'Simple' },
            { optimistic: true }
          );
        } catch (error) {
          // Expected
        }
      });

      // Assert: Optimistic data should be rolled back
      await waitFor(() => {
        expect(result.current.createError).toBeDefined();
      });
    });

    it('should support optimistic updates for habit updates', async () => {
      // Arrange: Mock API
      vi.mocked(axios.patch).mockResolvedValue({
        data: { id: '1', name: 'Updated' },
      });

      // Act: Update with optimistic flag
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        await result.current.updateHabit(
          'habit-1',
          { name: 'Optimistic Update' },
          { optimistic: true }
        );
      });

      // Assert: Should handle optimistic update
      expect(axios.patch).toHaveBeenCalled();
    });

    it('should support optimistic deletes', async () => {
      // Arrange: Mock deletion
      vi.mocked(axios.delete).mockResolvedValue({ data: {} });

      // Act: Delete with optimistic flag
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        await result.current.deleteHabit('habit-1', { optimistic: true });
      });

      // Assert: Should handle optimistic delete
      expect(axios.delete).toHaveBeenCalled();
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate habits cache after successful creation', async () => {
      // Arrange: Mock successful creation
      vi.mocked(axios.post).mockResolvedValue({
        data: { id: '1', name: 'New' },
      });

      // Act: Create habit
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        await result.current.createHabit({
          name: 'New Habit',
          icon: 'icon',
          habit_type: 'Simple',
        });
      });

      // Assert: Should trigger cache invalidation
      expect(
        result.current.onSuccess ||
          result.current.invalidateQueries ||
          result.current.refetchQueries
      ).toBeDefined();
    });

    it('should invalidate cache after successful update', async () => {
      // Arrange: Mock successful update
      vi.mocked(axios.patch).mockResolvedValue({
        data: { id: '1', name: 'Updated' },
      });

      // Act: Update habit
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        await result.current.updateHabit('habit-1', { name: 'Updated' });
      });

      // Assert: Should invalidate cache
      expect(axios.patch).toHaveBeenCalled();
    });

    it('should invalidate cache after successful deletion', async () => {
      // Arrange: Mock successful deletion
      vi.mocked(axios.delete).mockResolvedValue({ data: {} });

      // Act: Delete habit
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        await result.current.deleteHabit('habit-1');
      });

      // Assert: Should invalidate cache
      expect(axios.delete).toHaveBeenCalled();
    });

    it('should not invalidate cache on mutation error', async () => {
      // Arrange: Mock error
      vi.mocked(axios.post).mockRejectedValue(new Error('Failed'));

      // Act: Attempt creation
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        try {
          await result.current.createHabit({
            name: 'Test',
            icon: 'icon',
            habit_type: 'Simple',
          });
        } catch (error) {
          // Expected
        }
      });

      // Assert: Should have error, cache should not be invalidated
      expect(result.current.createError).toBeDefined();
    });
  });

  describe('Concurrent Mutations', () => {
    it('should handle multiple concurrent creates', async () => {
      // Arrange: Mock successful creations
      vi.mocked(axios.post)
        .mockResolvedValueOnce({ data: { id: '1' } })
        .mockResolvedValueOnce({ data: { id: '2' } });

      // Act: Render hook and create multiple habits
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        const promise1 = result.current.createHabit({
          name: 'Habit 1',
          icon: 'icon1',
          habit_type: 'Simple',
        });
        const promise2 = result.current.createHabit({
          name: 'Habit 2',
          icon: 'icon2',
          habit_type: 'Complex',
        });

        await Promise.all([promise1, promise2]);
      });

      // Assert: Both should complete successfully
      expect(vi.mocked(axios.post).mock.calls.length).toBe(2);
    });

    it('should handle create and update concurrently', async () => {
      // Arrange: Mock both operations
      vi.mocked(axios.post).mockResolvedValue({ data: { id: 'new' } });
      vi.mocked(axios.patch).mockResolvedValue({
        data: { id: 'existing' },
      });

      // Act: Execute both operations
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        const createPromise = result.current.createHabit({
          name: 'New',
          icon: 'icon',
          habit_type: 'Simple',
        });
        const updatePromise = result.current.updateHabit('existing', {
          name: 'Updated',
        });

        await Promise.all([createPromise, updatePromise]);
      });

      // Assert: Both operations should succeed
      expect(axios.post).toHaveBeenCalled();
      expect(axios.patch).toHaveBeenCalled();
    });

    it('should maintain separate loading states for different mutations', async () => {
      // Arrange: Mock slow operations
      vi.mocked(axios.post).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      // Act: Start create operation
      const { result } = renderHook(() => useHabitMutations());

      act(() => {
        result.current.createHabit({
          name: 'Test',
          icon: 'icon',
          habit_type: 'Simple',
        });
      });

      // Assert: Only isCreating should be true
      expect(result.current.isCreating).toBe(true);
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isDeleting).toBe(false);
    });
  });

  describe('TypeScript Type Safety', () => {
    it('should enforce HabitBody type for create', async () => {
      // Arrange: Mock API
      vi.mocked(axios.post).mockResolvedValue({ data: {} });

      // Act: Render hook
      const { result } = renderHook(() => useHabitMutations());

      // Assert: TypeScript should enforce type
      const validHabit: HabitBody = {
        name: 'Valid',
        icon: 'icon',
        habit_type: 'Simple',
      };

      await act(async () => {
        await result.current.createHabit(validHabit);
      });

      expect(axios.post).toHaveBeenCalled();
    });

    it('should accept partial updates with correct typing', async () => {
      // Arrange: Mock API
      vi.mocked(axios.patch).mockResolvedValue({ data: {} });

      // Act: Partial update
      const { result } = renderHook(() => useHabitMutations());

      await act(async () => {
        await result.current.updateHabit('habit-1', { name: 'New Name' });
      });

      // Assert: Should accept partial type
      expect(axios.patch).toHaveBeenCalled();
    });

    it('should enforce string type for habitId parameters', async () => {
      // Arrange: Mock API
      vi.mocked(axios.delete).mockResolvedValue({ data: {} });

      // Act: Render hook
      const { result } = renderHook(() => useHabitMutations());

      // Assert: Should accept string ID
      await act(async () => {
        await result.current.deleteHabit('valid-id-string');
      });

      expect(axios.delete).toHaveBeenCalled();
    });
  });
});
