/**
 * CH-003: useHabitMutations Custom Hook
 *
 * This hook manages all habit mutation operations (create, update, delete)
 * with proper error handling, loading states, and optional optimistic updates.
 *
 * @returns Mutation functions and state for create, update, and delete operations
 */

import { useState, useCallback } from "react";
import axios from "axios";
import type { HabitBody } from "../habits-types";

interface MutationOptions {
  optimistic?: boolean;
}

interface HabitResponse {
  id: string;
  name: string;
  icon: string;
  habit_type: string;
}

interface UseHabitMutationsReturn {
  createHabit: (
    data: HabitBody,
    options?: MutationOptions
  ) => Promise<HabitResponse>;
  updateHabit: (
    id: string,
    data: Partial<HabitBody>,
    options?: MutationOptions
  ) => Promise<HabitResponse>;
  deleteHabit: (id: string, options?: MutationOptions) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  createError: Error | null;
  updateError: Error | null;
  deleteError: Error | null;
  optimisticData?: any;
  pendingMutations?: any[];
  onSuccess?: () => void;
  invalidateQueries?: () => void;
  refetchQueries?: () => void;
}

export const useHabitMutations = (): UseHabitMutationsReturn => {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [createError, setCreateError] = useState<Error | null>(null);
  const [updateError, setUpdateError] = useState<Error | null>(null);
  const [deleteError, setDeleteError] = useState<Error | null>(null);
  const [optimisticData, setOptimisticData] = useState<any>(undefined);
  const [pendingMutations, setPendingMutations] = useState<any[]>([]);

  const validateHabitData = (data: HabitBody | Partial<HabitBody>): boolean => {
    if ("name" in data && data.name === "") {
      return false;
    }
    if ("icon" in data && data.icon === "") {
      return false;
    }
    if ("habit_type" in data && data.habit_type === "") {
      return false;
    }
    return true;
  };

  const createHabit = useCallback(
    async (
      data: HabitBody,
      options: MutationOptions = {}
    ): Promise<HabitResponse> => {
      // Validate data
      if (!validateHabitData(data)) {
        const error = new Error("Invalid habit data");
        setCreateError(error);
        throw error;
      }

      setIsCreating(true);
      setCreateError(null);

      if (options.optimistic) {
        setOptimisticData(data);
        setPendingMutations((prev) => [...prev, { type: "create", data }]);
      }

      try {
        const response = await axios.post(
          "http://localhost:3000/api/v1/habits",
          data,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setIsCreating(false);

        if (options.optimistic) {
          setOptimisticData(undefined);
          setPendingMutations((prev) =>
            prev.filter((m) => m.type !== "create" || m.data !== data)
          );
        }

        return response.data;
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("Failed to create habit");
        setCreateError(err);
        setIsCreating(false);

        if (options.optimistic) {
          setOptimisticData(undefined);
          setPendingMutations((prev) =>
            prev.filter((m) => m.type !== "create" || m.data !== data)
          );
        }

        throw err;
      }
    },
    []
  );

  const updateHabit = useCallback(
    async (
      id: string,
      data: Partial<HabitBody>,
      options: MutationOptions = {}
    ): Promise<HabitResponse> => {
      if (!id) {
        throw new Error("Habit ID is required");
      }

      setIsUpdating(true);
      setUpdateError(null);

      if (options.optimistic) {
        setOptimisticData({ id, ...data });
        setPendingMutations((prev) => [...prev, { type: "update", id, data }]);
      }

      try {
        const response = await axios.patch(
          `http://localhost:3000/api/v1/habits/${id}`,
          data,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setIsUpdating(false);

        if (options.optimistic) {
          setOptimisticData(undefined);
          setPendingMutations((prev) =>
            prev.filter((m) => m.type !== "update" || m.id !== id)
          );
        }

        return response.data;
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("Failed to update habit");
        setUpdateError(err);
        setIsUpdating(false);

        if (options.optimistic) {
          setOptimisticData(undefined);
          setPendingMutations((prev) =>
            prev.filter((m) => m.type !== "update" || m.id !== id)
          );
        }

        throw err;
      }
    },
    []
  );

  const deleteHabit = useCallback(
    async (id: string, options: MutationOptions = {}): Promise<void> => {
      if (!id) {
        throw new Error("Habit ID is required");
      }

      setIsDeleting(true);
      setDeleteError(null);

      if (options.optimistic) {
        setOptimisticData({ id, deleted: true });
        setPendingMutations((prev) => [...prev, { type: "delete", id }]);
      }

      try {
        await axios.delete(`http://localhost:3000/api/v1/habits/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        setIsDeleting(false);

        if (options.optimistic) {
          setOptimisticData(undefined);
          setPendingMutations((prev) =>
            prev.filter((m) => m.type !== "delete" || m.id !== id)
          );
        }
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("Failed to delete habit");
        setDeleteError(err);
        setIsDeleting(false);

        if (options.optimistic) {
          setOptimisticData(undefined);
          setPendingMutations((prev) =>
            prev.filter((m) => m.type !== "delete" || m.id !== id)
          );
        }

        throw err;
      }
    },
    []
  );

  const onSuccess = useCallback(() => {
    // Placeholder for cache invalidation callback
    // This would be used by React Query or similar library
  }, []);

  const invalidateQueries = useCallback(() => {
    // Placeholder for query invalidation
  }, []);

  const refetchQueries = useCallback(() => {
    // Placeholder for query refetching
  }, []);

  return {
    createHabit,
    updateHabit,
    deleteHabit,
    isCreating,
    isUpdating,
    isDeleting,
    createError,
    updateError,
    deleteError,
    optimisticData,
    pendingMutations,
    onSuccess,
    invalidateQueries,
    refetchQueries,
  };
};
