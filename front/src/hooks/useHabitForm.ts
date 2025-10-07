/**
 * CH-002: useHabitForm Custom Hook
 *
 * This hook encapsulates form state management, validation logic, submission
 * handling, and Redux integration for habit forms.
 *
 * @param formType - 'CREATE' or 'UPDATE' mode
 * @param initialHabit - Optional initial habit data for UPDATE mode
 * @param habitID - Optional habit ID for UPDATE mode
 * @returns Form state and handlers
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomDispatch } from "../redux/hooks/hooks";
import { postHabits, patchHabits } from "../redux/slices/habits/asyncActions";
import { checkBeforeSubmit } from "../utils/habitsForm/formUtils";
import type { HabitBody } from "../habits-types";

interface UseHabitFormParams {
  formType: string;
  initialHabit?: HabitBody;
  habitID?: string;
}

interface UseHabitFormReturn {
  habit: HabitBody;
  errors: Record<string, string | undefined>;
  disabled: boolean;
  File: File | null;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSubmit: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => Promise<void>;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  setHabit: React.Dispatch<React.SetStateAction<HabitBody>>;
  setErrors: React.Dispatch<
    React.SetStateAction<Record<string, string | undefined>>
  >;
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  buttonName: string;
}

export const useHabitForm = ({
  formType,
  initialHabit,
  habitID,
}: UseHabitFormParams): UseHabitFormReturn => {
  const emptyHabit: HabitBody = {
    name: "",
    icon: "",
    habit_type: "",
  };

  const [habit, setHabit] = useState<HabitBody>(initialHabit || emptyHabit);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [disabled, setDisabled] = useState<boolean>(false);
  const [File, setFile] = useState<File | null>(null);

  const dispatch = useCustomDispatch();
  const navigate = useNavigate();

  const buttonName =
    formType.charAt(0).toUpperCase() + formType.slice(1).toLowerCase();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    // Update habit state
    setHabit((prevHabit) => ({
      ...prevHabit,
      [e.target.name]: e.target.value,
    }));

    // Validate and update errors using functional setState to avoid stale closures
    setErrors((prevErrors) => {
      let updatedErrors = { ...prevErrors };

      if (e.target.value.length === 0 || e.target.value === undefined) {
        const address = e.target.name === "icon" ? "address " : "";
        updatedErrors[e.target.name] = `${e.target.name} ${address}is empty`;
        setDisabled(true);
        return updatedErrors;
      }

      if (e.target.name === "name" && !/^[a-zA-Z\s]+$/g.test(e.target.value)) {
        updatedErrors[e.target.name] =
          `${e.target.name} must have just letters and spaces`;
        setDisabled(true);
        return updatedErrors;
      }

      // Clear error for this field if validation passes
      delete updatedErrors[e.target.name];

      // Enable button if no errors remain
      if (Object.keys(updatedErrors).length === 0) {
        setDisabled(false);
      }

      return updatedErrors;
    });
  };

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> => {
    e.preventDefault();

    const isValid = checkBeforeSubmit(errors, habit, setErrors, setDisabled);

    if (!isValid) {
      return;
    }

    if (formType === "CREATE") {
      await dispatch(postHabits(habit));
      window.alert("Habit Created Successfully");
      navigate("/");
    } else if (formType === "UPDATE") {
      await dispatch(patchHabits({ habit, habitID: habitID || "" }));
      window.alert("Habit Updated Successfully");
      navigate("/");
    }
  };

  return {
    habit,
    errors,
    disabled,
    File,
    handleChange,
    handleSubmit,
    setFile,
    setHabit,
    setErrors,
    setDisabled,
    buttonName,
  };
};
