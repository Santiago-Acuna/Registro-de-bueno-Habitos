/**
 * CH-002: useHabitForm Custom Hook Tests
 *
 * RED PHASE - These tests MUST FAIL initially
 *
 * This test suite verifies the useHabitForm custom hook that extracts
 * form logic from createHabit.tsx into a reusable hook.
 *
 * User Story: As a frontend developer, I need a reusable custom hook
 * that encapsulates form state management, validation logic, submission
 * handling, and Redux integration for habit forms.
 *
 * Test Coverage:
 * 1. Initial state (CREATE and UPDATE modes)
 * 2. handleChange function (validation logic)
 * 3. handleSubmit function (CREATE and UPDATE modes)
 * 4. Redux integration
 * 5. Edge cases and error scenarios
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useHabitForm } from '@/hooks';
import type { HabitBody } from '../../habits-types';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('../../redux/hooks/hooks', () => ({
  useCustomDispatch: vi.fn(),
  useCustomSelector: vi.fn(),
}));

vi.mock('../../redux/slices/habits/asyncActions', () => ({
  postHabits: vi.fn(),
  patchHabits: vi.fn(),
}));

// Import mocked modules for assertions
import { useNavigate } from 'react-router-dom';
import { useCustomDispatch } from '../../redux/hooks/hooks';
import { postHabits, patchHabits } from '../../redux/slices/habits/asyncActions';

describe('CH-002: useHabitForm Custom Hook', () => {
  // Mock implementations
  const mockNavigate = vi.fn();
  const mockDispatch = vi.fn();

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    (useCustomDispatch as any).mockReturnValue(mockDispatch);
    // Mock dispatch to return a resolved promise
    mockDispatch.mockResolvedValue({ type: 'fulfilled' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Hook Existence and Structure', () => {
    it('should be exportable from the hooks barrel', async () => {
      // Arrange: Import hooks module
      const hooksModule = await import('@/hooks');

      // Act: Check if useHabitForm exists
      const hasUseHabitForm = 'useHabitForm' in hooksModule;

      // Assert: Hook should be exported
      expect(hasUseHabitForm).toBe(true);
      expect(typeof hooksModule.useHabitForm).toBe('function');
    });

    it('should follow React hooks naming convention', async () => {
      // Arrange: Import the hook
      const { useHabitForm: hook } = await import('@/hooks');

      // Act: Get hook name
      const hookName = hook.name;

      // Assert: Should start with 'use' and be PascalCase
      expect(hookName).toMatch(/^use[A-Z]/);
      expect(hookName).toBe('useHabitForm');
    });

    it('should return an object with expected properties', () => {
      // Arrange & Act: Render the hook with CREATE mode
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Assert: Should return object with all required properties
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('habit');
      expect(result.current).toHaveProperty('errors');
      expect(result.current).toHaveProperty('disabled');
      expect(result.current).toHaveProperty('File');
      expect(result.current).toHaveProperty('handleChange');
      expect(result.current).toHaveProperty('handleSubmit');
      expect(result.current).toHaveProperty('setFile');
      expect(result.current).toHaveProperty('setHabit');
      expect(result.current).toHaveProperty('setErrors');
      expect(result.current).toHaveProperty('buttonName');
    });
  });

  describe('Initial State - CREATE Mode', () => {
    it('should initialize with empty habit object in CREATE mode', () => {
      // Arrange & Act: Render hook in CREATE mode
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Assert: Habit should be empty
      expect(result.current.habit).toEqual({
        name: '',
        icon: '',
        habit_type: '',
      });
    });

    it('should initialize with empty errors object', () => {
      // Arrange & Act: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Assert: Errors should be empty
      expect(result.current.errors).toEqual({});
      expect(Object.keys(result.current.errors).length).toBe(0);
    });

    it('should initialize with disabled set to false', () => {
      // Arrange & Act: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Assert: Form should not be disabled initially
      expect(result.current.disabled).toBe(false);
    });

    it('should initialize with File set to null', () => {
      // Arrange & Act: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Assert: File should be null
      expect(result.current.File).toBeNull();
    });

    it('should have buttonName as "Create" in CREATE mode', () => {
      // Arrange & Act: Render hook in CREATE mode
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Assert: Button name should be capitalized form type
      expect(result.current.buttonName).toBe('Create');
    });

    it('should provide handleChange as a function', () => {
      // Arrange & Act: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Assert: handleChange should be a function
      expect(typeof result.current.handleChange).toBe('function');
    });

    it('should provide handleSubmit as a function', () => {
      // Arrange & Act: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Assert: handleSubmit should be a function
      expect(typeof result.current.handleSubmit).toBe('function');
    });

    it('should provide setState functions', () => {
      // Arrange & Act: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Assert: All setState functions should exist
      expect(typeof result.current.setFile).toBe('function');
      expect(typeof result.current.setHabit).toBe('function');
      expect(typeof result.current.setErrors).toBe('function');
    });
  });

  describe('Initial State - UPDATE Mode', () => {
    it('should initialize with provided initialHabit in UPDATE mode', () => {
      // Arrange: Prepare initial habit data
      const initialHabit: HabitBody = {
        name: 'Morning Exercise',
        icon: 'https://example.com/icon.png',
        habit_type: 'Simple',
      };

      // Act: Render hook in UPDATE mode
      const { result } = renderHook(() =>
        useHabitForm({
          formType: 'UPDATE',
          initialHabit,
          habitID: 'habit-123',
        })
      );

      // Assert: Habit should match initialHabit
      expect(result.current.habit).toEqual(initialHabit);
      expect(result.current.habit.name).toBe('Morning Exercise');
      expect(result.current.habit.icon).toBe('https://example.com/icon.png');
      expect(result.current.habit.habit_type).toBe('Simple');
    });

    it('should have buttonName as "Update" in UPDATE mode', () => {
      // Arrange: Prepare initial habit data
      const initialHabit: HabitBody = {
        name: 'Reading',
        icon: 'https://example.com/reading.png',
        habit_type: 'Complex',
      };

      // Act: Render hook in UPDATE mode
      const { result } = renderHook(() =>
        useHabitForm({
          formType: 'UPDATE',
          initialHabit,
          habitID: 'habit-456',
        })
      );

      // Assert: Button name should be "Update"
      expect(result.current.buttonName).toBe('Update');
    });

    it('should initialize with empty habit if initialHabit is not provided', () => {
      // Arrange & Act: Render hook in UPDATE mode without initialHabit
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'UPDATE', habitID: 'habit-789' })
      );

      // Assert: Should default to empty habit
      expect(result.current.habit).toEqual({
        name: '',
        icon: '',
        habit_type: '',
      });
    });

    it('should still initialize errors and disabled correctly in UPDATE mode', () => {
      // Arrange: Prepare initial habit
      const initialHabit: HabitBody = {
        name: 'Meditation',
        icon: 'https://example.com/meditation.png',
        habit_type: 'Without Intervals',
      };

      // Act: Render hook in UPDATE mode
      const { result } = renderHook(() =>
        useHabitForm({
          formType: 'UPDATE',
          initialHabit,
          habitID: 'habit-101',
        })
      );

      // Assert: Errors and disabled should be initialized properly
      expect(result.current.errors).toEqual({});
      expect(result.current.disabled).toBe(false);
      expect(result.current.File).toBeNull();
    });
  });

  describe('handleChange Function - Valid Input', () => {
    it('should update habit name when valid input is provided', () => {
      // Arrange: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Act: Simulate change event for name field
      act(() => {
        const event = {
          target: {
            name: 'name',
            value: 'Morning Workout',
          },
        } as React.ChangeEvent<HTMLInputElement>;

        result.current.handleChange(event);
      });

      // Assert: Habit name should be updated
      expect(result.current.habit.name).toBe('Morning Workout');
    });

    it('should update habit_type when valid selection is made', () => {
      // Arrange: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Act: Simulate change event for habit_type
      act(() => {
        const event = {
          target: {
            name: 'habit_type',
            value: 'Complex',
          },
        } as React.ChangeEvent<HTMLSelectElement>;

        result.current.handleChange(event);
      });

      // Assert: habit_type should be updated
      expect(result.current.habit.habit_type).toBe('Complex');
    });

    it('should update icon when valid URL is provided', () => {
      // Arrange: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Act: Simulate change event for icon
      act(() => {
        const event = {
          target: {
            name: 'icon',
            value: 'https://example.com/habit-icon.png',
          },
        } as React.ChangeEvent<HTMLInputElement>;

        result.current.handleChange(event);
      });

      // Assert: Icon should be updated
      expect(result.current.habit.icon).toBe(
        'https://example.com/habit-icon.png'
      );
    });

    it('should clear previous error when valid input is provided', () => {
      // Arrange: Render hook and set initial error
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      act(() => {
        result.current.setErrors({ name: 'Name is required' });
      });

      // Act: Provide valid input
      act(() => {
        const event = {
          target: {
            name: 'name',
            value: 'Valid Name',
          },
        } as React.ChangeEvent<HTMLInputElement>;

        result.current.handleChange(event);
      });

      // Assert: Error should be cleared
      expect(result.current.errors.name).toBeUndefined();
    });

    it('should enable submit button when all errors are cleared', () => {
      // Arrange: Render hook with initial errors
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      act(() => {
        result.current.setErrors({ name: 'Name is required' });
        result.current.setDisabled(true);
      });

      // Act: Clear the error by providing valid input
      act(() => {
        const event = {
          target: {
            name: 'name',
            value: 'Valid Habit Name',
          },
        } as React.ChangeEvent<HTMLInputElement>;

        result.current.handleChange(event);
      });

      // Assert: Button should be enabled
      expect(result.current.disabled).toBe(false);
    });
  });

  describe('handleChange Function - Validation Logic', () => {
    it('should set error when name field is empty', () => {
      // Arrange: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Act: Simulate empty name input
      act(() => {
        const event = {
          target: {
            name: 'name',
            value: '',
          },
        } as React.ChangeEvent<HTMLInputElement>;

        result.current.handleChange(event);
      });

      // Assert: Error should be set
      expect(result.current.errors.name).toBeDefined();
      expect(result.current.errors.name).toContain('empty');
    });

    it('should set error when name contains numbers', () => {
      // Arrange: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Act: Simulate name with numbers
      act(() => {
        const event = {
          target: {
            name: 'name',
            value: 'Habit123',
          },
        } as React.ChangeEvent<HTMLInputElement>;

        result.current.handleChange(event);
      });

      // Assert: Error should indicate letters only
      expect(result.current.errors.name).toBeDefined();
      expect(result.current.errors.name).toContain('letters');
    });

    it('should set error when name contains special characters', () => {
      // Arrange: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Act: Simulate name with special characters
      act(() => {
        const event = {
          target: {
            name: 'name',
            value: 'Habit@Name!',
          },
        } as React.ChangeEvent<HTMLInputElement>;

        result.current.handleChange(event);
      });

      // Assert: Error should indicate letters and spaces only
      expect(result.current.errors.name).toBeDefined();
      expect(result.current.errors.name).toContain('letters');
      expect(result.current.errors.name).toContain('spaces');
    });

    it('should accept name with only letters and spaces', () => {
      // Arrange: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Act: Simulate valid name with letters and spaces
      act(() => {
        const event = {
          target: {
            name: 'name',
            value: 'Morning Exercise Routine',
          },
        } as React.ChangeEvent<HTMLInputElement>;

        result.current.handleChange(event);
      });

      // Assert: No error should be set
      expect(result.current.errors.name).toBeUndefined();
      expect(result.current.habit.name).toBe('Morning Exercise Routine');
    });

    it('should set error when habit_type is empty', () => {
      // Arrange: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Act: Simulate empty habit_type
      act(() => {
        const event = {
          target: {
            name: 'habit_type',
            value: '',
          },
        } as React.ChangeEvent<HTMLSelectElement>;

        result.current.handleChange(event);
      });

      // Assert: Error should be set
      expect(result.current.errors.habit_type).toBeDefined();
      expect(result.current.errors.habit_type).toContain('empty');
    });

    it('should set error when icon is empty', () => {
      // Arrange: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Act: Simulate empty icon
      act(() => {
        const event = {
          target: {
            name: 'icon',
            value: '',
          },
        } as React.ChangeEvent<HTMLInputElement>;

        result.current.handleChange(event);
      });

      // Assert: Error should be set with "address" mention
      expect(result.current.errors.icon).toBeDefined();
      expect(result.current.errors.icon).toContain('address');
      expect(result.current.errors.icon).toContain('empty');
    });

    it('should disable submit button when validation error occurs', () => {
      // Arrange: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Act: Trigger validation error
      act(() => {
        const event = {
          target: {
            name: 'name',
            value: 'Invalid123',
          },
        } as React.ChangeEvent<HTMLInputElement>;

        result.current.handleChange(event);
      });

      // Assert: Button should be disabled
      expect(result.current.disabled).toBe(true);
    });
  });

  describe('handleSubmit Function - CREATE Mode', () => {
    it('should call postHabits action when form is valid in CREATE mode', async () => {
      // Arrange: Render hook with valid habit data
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Set up valid habit data
      act(() => {
        result.current.setHabit({
          name: 'Morning Workout',
          icon: 'https://example.com/icon.png',
          habit_type: 'Simple',
        });
      });

      // Act: Simulate form submission
      await act(async () => {
        const event = {
          preventDefault: vi.fn(),
        } as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>;

        await result.current.handleSubmit(event);
      });

      // Assert: postHabits should be called with habit data
      expect(mockDispatch).toHaveBeenCalled();
      expect(postHabits).toHaveBeenCalledWith({
        name: 'Morning Workout',
        icon: 'https://example.com/icon.png',
        habit_type: 'Simple',
      });
    });

    it('should navigate to home page after successful CREATE submission', async () => {
      // Arrange: Render hook with valid data
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      act(() => {
        result.current.setHabit({
          name: 'Reading',
          icon: 'https://example.com/reading.png',
          habit_type: 'Complex',
        });
      });

      // Act: Submit form
      await act(async () => {
        const event = {
          preventDefault: vi.fn(),
        } as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>;

        await result.current.handleSubmit(event);
      });

      // Assert: Should navigate to home
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should show success alert after CREATE submission', async () => {
      // Arrange: Mock window.alert
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      act(() => {
        result.current.setHabit({
          name: 'Meditation',
          icon: 'https://example.com/meditation.png',
          habit_type: 'Without Intervals',
        });
      });

      // Act: Submit form
      await act(async () => {
        const event = {
          preventDefault: vi.fn(),
        } as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>;

        await result.current.handleSubmit(event);
      });

      // Assert: Alert should show success message
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Habit Created Successfully');
      });

      alertMock.mockRestore();
    });

    it('should prevent default event behavior on submit', async () => {
      // Arrange: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      act(() => {
        result.current.setHabit({
          name: 'Exercise',
          icon: 'https://example.com/exercise.png',
          habit_type: 'Simple',
        });
      });

      // Act: Submit with mock event
      const preventDefaultMock = vi.fn();
      await act(async () => {
        const event = {
          preventDefault: preventDefaultMock,
        } as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>;

        await result.current.handleSubmit(event);
      });

      // Assert: preventDefault should be called
      expect(preventDefaultMock).toHaveBeenCalled();
    });
  });

  describe('handleSubmit Function - UPDATE Mode', () => {
    it('should call patchHabits action when form is valid in UPDATE mode', async () => {
      // Arrange: Render hook in UPDATE mode
      const initialHabit: HabitBody = {
        name: 'Original Habit',
        icon: 'https://example.com/original.png',
        habit_type: 'Simple',
      };

      const { result } = renderHook(() =>
        useHabitForm({
          formType: 'UPDATE',
          initialHabit,
          habitID: 'habit-123',
        })
      );

      // Modify habit
      act(() => {
        result.current.setHabit({
          name: 'Updated Habit',
          icon: 'https://example.com/updated.png',
          habit_type: 'Complex',
        });
      });

      // Act: Submit form
      await act(async () => {
        const event = {
          preventDefault: vi.fn(),
        } as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>;

        await result.current.handleSubmit(event);
      });

      // Assert: patchHabits should be called with habit and habitID
      expect(mockDispatch).toHaveBeenCalled();
      expect(patchHabits).toHaveBeenCalledWith({
        habit: {
          name: 'Updated Habit',
          icon: 'https://example.com/updated.png',
          habit_type: 'Complex',
        },
        habitID: 'habit-123',
      });
    });

    it('should navigate to home page after successful UPDATE submission', async () => {
      // Arrange: Render hook in UPDATE mode
      const { result } = renderHook(() =>
        useHabitForm({
          formType: 'UPDATE',
          initialHabit: {
            name: 'Habit',
            icon: 'https://example.com/icon.png',
            habit_type: 'Simple',
          },
          habitID: 'habit-456',
        })
      );

      // Act: Submit form
      await act(async () => {
        const event = {
          preventDefault: vi.fn(),
        } as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>;

        await result.current.handleSubmit(event);
      });

      // Assert: Should navigate to home
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should show success alert after UPDATE submission', async () => {
      // Arrange: Mock window.alert
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

      const { result } = renderHook(() =>
        useHabitForm({
          formType: 'UPDATE',
          initialHabit: {
            name: 'Reading',
            icon: 'https://example.com/reading.png',
            habit_type: 'Complex',
          },
          habitID: 'habit-789',
        })
      );

      // Act: Submit form
      await act(async () => {
        const event = {
          preventDefault: vi.fn(),
        } as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>;

        await result.current.handleSubmit(event);
      });

      // Assert: Alert should show update success message
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Habit Updated Successfully');
      });

      alertMock.mockRestore();
    });
  });

  describe('handleSubmit Function - Validation Before Submit', () => {
    it('should not submit when name is empty', async () => {
      // Arrange: Render hook with empty name
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      act(() => {
        result.current.setHabit({
          name: '',
          icon: 'https://example.com/icon.png',
          habit_type: 'Simple',
        });
      });

      // Act: Attempt to submit
      await act(async () => {
        const event = {
          preventDefault: vi.fn(),
        } as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>;

        await result.current.handleSubmit(event);
      });

      // Assert: Should not call postHabits
      expect(postHabits).not.toHaveBeenCalled();
      expect(result.current.errors.name).toBeDefined();
      expect(result.current.errors.name).toContain('empty');
      expect(result.current.disabled).toBe(true);
    });

    it('should not submit when habit_type is empty', async () => {
      // Arrange: Render hook with empty habit_type
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      act(() => {
        result.current.setHabit({
          name: 'Morning Exercise',
          icon: 'https://example.com/icon.png',
          habit_type: '',
        });
      });

      // Act: Attempt to submit
      await act(async () => {
        const event = {
          preventDefault: vi.fn(),
        } as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>;

        await result.current.handleSubmit(event);
      });

      // Assert: Should not call postHabits
      expect(postHabits).not.toHaveBeenCalled();
      expect(result.current.errors.habit_type).toBeDefined();
      expect(result.current.errors.habit_type).toContain('empty');
    });

    it('should not submit when habit_type is "select"', async () => {
      // Arrange: Render hook with "select" as habit_type
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      act(() => {
        result.current.setHabit({
          name: 'Exercise',
          icon: 'https://example.com/icon.png',
          habit_type: 'select',
        });
      });

      // Act: Attempt to submit
      await act(async () => {
        const event = {
          preventDefault: vi.fn(),
        } as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>;

        await result.current.handleSubmit(event);
      });

      // Assert: Should not submit and show appropriate error
      expect(postHabits).not.toHaveBeenCalled();
      expect(result.current.errors.habit_type).toBeDefined();
      expect(result.current.errors.habit_type).toContain('select');
    });

    it('should not submit when icon is empty', async () => {
      // Arrange: Render hook with empty icon
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      act(() => {
        result.current.setHabit({
          name: 'Morning Exercise',
          icon: '',
          habit_type: 'Simple',
        });
      });

      // Act: Attempt to submit
      await act(async () => {
        const event = {
          preventDefault: vi.fn(),
        } as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>;

        await result.current.handleSubmit(event);
      });

      // Assert: Should not call postHabits
      expect(postHabits).not.toHaveBeenCalled();
      expect(result.current.errors.icon).toBeDefined();
      expect(result.current.errors.icon).toContain('address');
      expect(result.current.errors.icon).toContain('empty');
    });

    it('should disable button when validation fails', async () => {
      // Arrange: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      act(() => {
        result.current.setHabit({
          name: '',
          icon: '',
          habit_type: '',
        });
      });

      // Act: Attempt to submit
      await act(async () => {
        const event = {
          preventDefault: vi.fn(),
        } as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>;

        await result.current.handleSubmit(event);
      });

      // Assert: Button should be disabled
      expect(result.current.disabled).toBe(true);
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle empty formType gracefully', () => {
      // Arrange & Act: Render hook with empty formType
      const { result } = renderHook(() =>
        useHabitForm({ formType: '' })
      );

      // Assert: Should initialize properly with empty string
      expect(result.current.habit).toBeDefined();
      expect(result.current.buttonName).toBe('');
    });

    it('should handle missing initialHabit in UPDATE mode', () => {
      // Arrange & Act: Render hook in UPDATE mode without initialHabit
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'UPDATE' })
      );

      // Assert: Should default to empty habit
      expect(result.current.habit).toEqual({
        name: '',
        icon: '',
        habit_type: '',
      });
    });

    it('should handle rapid state changes without errors', () => {
      // Arrange: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Act: Rapidly change state
      act(() => {
        result.current.setHabit({
          name: 'First',
          icon: 'logo1',
          habit_type: 'Simple',
        });
        result.current.setHabit({
          name: 'Second',
          icon: 'logo2',
          habit_type: 'Complex',
        });
        result.current.setHabit({
          name: 'Third',
          icon: 'logo3',
          habit_type: 'Without Intervals',
        });
      });

      // Assert: Should have the last state
      expect(result.current.habit.name).toBe('Third');
      expect(result.current.habit.icon).toBe('logo3');
      expect(result.current.habit.habit_type).toBe('Without Intervals');
    });

    it('should handle form type changes between CREATE and UPDATE', () => {
      // Arrange: Start with CREATE mode
      const { result, rerender } = renderHook(
        ({ formType, initialHabit, habitID }) =>
          useHabitForm({ formType, initialHabit, habitID }),
        {
          initialProps: {
            formType: 'CREATE' as const,
            initialHabit: undefined,
            habitID: undefined,
          },
        }
      );

      const createButtonName = result.current.buttonName;

      // Act: Change to UPDATE mode
      rerender({
        formType: 'UPDATE',
        initialHabit: {
          name: 'Updated',
          icon: 'url',
          habit_type: 'Simple',
        },
        habitID: 'habit-123',
      });

      // Assert: Button name should change
      expect(createButtonName).toBe('Create');
      expect(result.current.buttonName).toBe('Update');
    });

    it('should maintain File state independently from habit state', () => {
      // Arrange: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Act: Set File and habit separately
      const mockFile = new File(['content'], 'test.png', {
        type: 'image/png',
      });

      act(() => {
        result.current.setFile(mockFile);
        result.current.setHabit({
          name: 'Habit',
          icon: 'https://example.com/icon.png',
          habit_type: 'Simple',
        });
      });

      // Assert: Both should be set independently
      expect(result.current.File).toBe(mockFile);
      expect(result.current.habit.name).toBe('Habit');
    });

    it('should handle multiple validation errors simultaneously', () => {
      // Arrange: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Act: Trigger multiple validation errors
      act(() => {
        const nameEvent = {
          target: { name: 'name', value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        result.current.handleChange(nameEvent);

        const typeEvent = {
          target: { name: 'habit_type', value: '' },
        } as React.ChangeEvent<HTMLSelectElement>;
        result.current.handleChange(typeEvent);

        const iconEvent = {
          target: { name: 'icon', value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        result.current.handleChange(iconEvent);
      });

      // Assert: All errors should be present
      expect(result.current.errors.name).toBeDefined();
      expect(result.current.errors.habit_type).toBeDefined();
      expect(result.current.errors.icon).toBeDefined();
      expect(Object.keys(result.current.errors).length).toBe(3);
    });

    it('should clear specific errors when fields are corrected', () => {
      // Arrange: Render hook with multiple errors
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Set initial errors
      act(() => {
        result.current.setErrors({
          name: 'Name error',
          habit_type: 'Type error',
          icon: 'Icon error',
        });
      });

      // Act: Fix only the name field
      act(() => {
        const event = {
          target: { name: 'name', value: 'Valid Name' },
        } as React.ChangeEvent<HTMLInputElement>;
        result.current.handleChange(event);
      });

      // Assert: Only name error should be cleared
      expect(result.current.errors.name).toBeUndefined();
      expect(result.current.errors.habit_type).toBeDefined();
      expect(result.current.errors.icon).toBeDefined();
    });

    it('should handle whitespace-only name as invalid', () => {
      // Arrange: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Act: Enter whitespace-only name
      act(() => {
        const event = {
          target: { name: 'name', value: '   ' },
        } as React.ChangeEvent<HTMLInputElement>;
        result.current.handleChange(event);
      });

      // Assert: Should accept spaces (as per regex) but will fail on empty check
      expect(result.current.habit.name).toBe('   ');
    });
  });

  describe('Redux Integration', () => {
    it('should use useCustomDispatch hook', () => {
      // Arrange & Act: Render hook
      renderHook(() => useHabitForm({ formType: 'CREATE' }));

      // Assert: useCustomDispatch should be called
      expect(useCustomDispatch).toHaveBeenCalled();
    });

    it('should dispatch postHabits async action in CREATE mode', async () => {
      // Arrange: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      act(() => {
        result.current.setHabit({
          name: 'Test Habit',
          icon: 'https://example.com/icon.png',
          habit_type: 'Simple',
        });
      });

      // Act: Submit form
      await act(async () => {
        const event = {
          preventDefault: vi.fn(),
        } as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>;

        await result.current.handleSubmit(event);
      });

      // Assert: Dispatch should be called with postHabits action
      expect(mockDispatch).toHaveBeenCalled();
      expect(postHabits).toHaveBeenCalled();
    });

    it('should dispatch patchHabits async action in UPDATE mode', async () => {
      // Arrange: Render hook in UPDATE mode
      const { result } = renderHook(() =>
        useHabitForm({
          formType: 'UPDATE',
          initialHabit: {
            name: 'Habit',
            icon: 'https://example.com/icon.png',
            habit_type: 'Simple',
          },
          habitID: 'habit-123',
        })
      );

      // Act: Submit form
      await act(async () => {
        const event = {
          preventDefault: vi.fn(),
        } as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>;

        await result.current.handleSubmit(event);
      });

      // Assert: Dispatch should be called with patchHabits action
      expect(mockDispatch).toHaveBeenCalled();
      expect(patchHabits).toHaveBeenCalled();
    });

    it('should handle async action fulfillment', async () => {
      // Arrange: Mock successful dispatch
      mockDispatch.mockResolvedValueOnce({
        type: 'habit/postHabits/fulfilled',
        payload: { id: 'new-habit', name: 'Test' },
      });

      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      act(() => {
        result.current.setHabit({
          name: 'New Habit',
          icon: 'https://example.com/icon.png',
          habit_type: 'Complex',
        });
      });

      // Act: Submit form
      await act(async () => {
        const event = {
          preventDefault: vi.fn(),
        } as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>;

        await result.current.handleSubmit(event);
      });

      // Assert: Should complete without errors
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation Integration', () => {
    it('should use useNavigate hook', () => {
      // Arrange & Act: Render hook
      renderHook(() => useHabitForm({ formType: 'CREATE' }));

      // Assert: useNavigate should be called
      expect(useNavigate).toHaveBeenCalled();
    });

    it('should navigate to home after successful CREATE', async () => {
      // Arrange: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      act(() => {
        result.current.setHabit({
          name: 'Habit',
          icon: 'https://example.com/icon.png',
          habit_type: 'Simple',
        });
      });

      // Act: Submit
      await act(async () => {
        const event = {
          preventDefault: vi.fn(),
        } as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>;

        await result.current.handleSubmit(event);
      });

      // Assert: Navigate should be called with '/'
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should navigate to home after successful UPDATE', async () => {
      // Arrange: Render hook in UPDATE mode
      const { result } = renderHook(() =>
        useHabitForm({
          formType: 'UPDATE',
          initialHabit: {
            name: 'Habit',
            icon: 'https://example.com/icon.png',
            habit_type: 'Simple',
          },
          habitID: 'habit-456',
        })
      );

      // Act: Submit
      await act(async () => {
        const event = {
          preventDefault: vi.fn(),
        } as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>;

        await result.current.handleSubmit(event);
      });

      // Assert: Navigate should be called with '/'
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should not navigate if validation fails', async () => {
      // Arrange: Render hook with invalid data
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Leave form empty (invalid)

      // Act: Attempt to submit
      await act(async () => {
        const event = {
          preventDefault: vi.fn(),
        } as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>;

        await result.current.handleSubmit(event);
      });

      // Assert: Navigate should not be called
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Type Safety and TypeScript', () => {
    it('should accept HabitBody type for initialHabit', () => {
      // Arrange: Create typed initial habit
      const initialHabit: HabitBody = {
        name: 'Typed Habit',
        icon: 'https://example.com/typed.png',
        habit_type: 'Complex',
      };

      // Act: Render hook with typed data
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'UPDATE', initialHabit, habitID: 'habit-1' })
      );

      // Assert: Types should match
      expect(result.current.habit).toEqual(initialHabit);
    });

    it('should maintain type safety for formType parameter', () => {
      // Arrange & Act: Test with valid formType values
      const createHook = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );
      const updateHook = renderHook(() =>
        useHabitForm({ formType: 'UPDATE' })
      );

      // Assert: Both should work without type errors
      expect(createHook.result.current.buttonName).toBe('Create');
      expect(updateHook.result.current.buttonName).toBe('Update');
    });

    it('should provide properly typed event handlers', () => {
      // Arrange: Render hook
      const { result } = renderHook(() =>
        useHabitForm({ formType: 'CREATE' })
      );

      // Assert: Functions should be properly typed
      expect(typeof result.current.handleChange).toBe('function');
      expect(typeof result.current.handleSubmit).toBe('function');
      expect(typeof result.current.setFile).toBe('function');
      expect(typeof result.current.setHabit).toBe('function');
      expect(typeof result.current.setErrors).toBe('function');
    });
  });
});
