/**
 * CH-005: useHabitsFilter Custom Hook
 *
 * This hook manages habit filtering logic using Redux state management.
 * It provides filtered habits based on complexity and other criteria.
 *
 * @returns Object with habits data, filtering functions, and current filter state
 */

import { useCallback, useMemo, useState } from "react";
import { useCustomSelector } from "@/redux/hooks/hooks";
import { useCustomDispatch } from "@/redux/hooks/hooks";
import { filterByComplexity as filterByComplexityAction } from "@/redux/slices/habits/habits";
import type { Habit } from "@/redux/slices/habits/habits";

interface UseHabitsFilterReturn {
  habits: Habit[];
  filteredHabits: Habit[];
  filterByComplexity: (complexity: string) => void;
  currentFilter: string | null;
}

export const useHabitsFilter = (): UseHabitsFilterReturn => {
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);

  const dispatch = useCustomDispatch();

  const habits = useCustomSelector((state) => state.habits.habits);

  const filteredHabits = useMemo(() => {
    return habits;
  }, [habits]);

  const filterByComplexity = useCallback(
    (complexity: string) => {
      dispatch(filterByComplexityAction(complexity));
      setCurrentFilter(complexity);
    },
    [dispatch]
  );

  return {
    habits,
    filteredHabits,
    filterByComplexity,
    currentFilter,
  };
};
