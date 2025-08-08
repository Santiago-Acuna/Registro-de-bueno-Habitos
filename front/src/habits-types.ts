enum HabitType {
  complex = "Complex",
  simple = "Simple",
  without_intervals = "Without Intervals",
}

interface HabitBody {
  name: string;
  habit_type: HabitType | string;
  logo: string;
}

interface Habit {
  id: string;
  name: string;
  habit_type: HabitType;
  logo: string;
}

interface CreateHabitsProps {
  setCreateHabits: (pageNumber: boolean) => void;
}

interface HandleChangeProps {
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;
  setHabit: React.Dispatch<React.SetStateAction<HabitBody>>;
  habit: HabitBody;
  errors: Record<string, string | undefined>;
  setErrors: React.Dispatch<
    React.SetStateAction<Record<string, string | undefined>>
  >;
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}
interface HabitErrors {
  name: string;
  habit_type: string;
  logo: string;
}

interface ValidateProps {
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;
  errors: Record<string, string | undefined>;
  setErrors: React.Dispatch<
    React.SetStateAction<Record<string, string | undefined>>
  >;
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}

interface EnableProps {
  accumulatedErrors: Record<string, string | undefined>;
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}

interface HandleSubmitProps {
  e: React.MouseEvent<HTMLButtonElement, MouseEvent>;
  habit: HabitBody;
  errors: Record<string, string | undefined>;
  setErrors: React.Dispatch<
    React.SetStateAction<Record<string, string | undefined>>
  >;
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}
interface inputFormProps {
  inputName: keyof HabitBody;
  habit: HabitBody;
  setHabit: React.Dispatch<React.SetStateAction<HabitBody>>;
  handleChange: ({
    e,
    setHabit,
    habit,
    errors,
    setDisabled,
    setErrors,
  }: HandleChangeProps) => void;
  setErrors: React.Dispatch<
    React.SetStateAction<Record<string, string | undefined>>
  >;
  errors: Record<string, string | undefined>;
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}
enum formType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
}

export type {
  Habit,
  HabitBody,
  CreateHabitsProps,
  HabitType,
  HandleChangeProps,
  HabitErrors,
  ValidateProps,
  EnableProps,
  HandleSubmitProps,
  inputFormProps,
  formType,
};
