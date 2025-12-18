import {
  HandleChangeProps,
  ValidateProps,
  EnableProps,
  HabitBody,
} from "../../../habits-types";

const enable = ({ accumulatedErrors, setDisabled }: EnableProps): void => {
  !Object.keys(accumulatedErrors).length && setDisabled(false);
};

const validate = ({
  e,
  errors,
  setErrors,
  setDisabled,
}: ValidateProps): void => {
  let accumulatedErrors = errors;
  if (e.target.value.length === 0 || e.target.value === undefined) {
    let address = e.target.name === "icon" ? "address " : "";
    setErrors({
      ...errors,
      [e.target.name]: `${e.target.name} ${address}is empty`,
    });
    setDisabled(true);
    return;
  }
  if (e.target.name === "name" && !/^[a-zA-Z\s]+$/g.test(e.target.value)) {
    setErrors({
      ...errors,
      [e.target.name]: `${e.target.name} must have just letters and spaces`,
    });
    setDisabled(true);
    return;
  }
  console.log(e.target.name);
  delete accumulatedErrors[e.target.name];
  setErrors({ ...accumulatedErrors });

  enable({ accumulatedErrors, setDisabled });

  // chequear que el name no se repita.
};

const handleChange = ({
  e,
  setHabit,
  habit,
  errors,
  setErrors,
  setDisabled,
}: HandleChangeProps): void => {
  setHabit({
    ...habit,
    [e.target.name]: e.target.value,
  });

  validate({ e, errors, setErrors, setDisabled });
};

const checkBeforeSubmit = (
  errors: Record<string, string | undefined>,
  habit: HabitBody,
  setErrors: React.Dispatch<
    React.SetStateAction<Record<string, string | undefined>>
  >,
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>,
  File: File | null,
  form: string
): boolean => {
  if (habit.name === "") {
    setErrors({
      ...errors,
      name: "Name is empty",
    });
    setDisabled(true);
    return false;
  } else if (habit.habitType === "") {
    setErrors({
      ...errors,
      habitType: "Habit type is empty",
    });
    setDisabled(true);
    return false;
  } else if (habit.habitType === "select") {
    setErrors({
      ...errors,
      habitType: "select a habit type",
    });
    setDisabled(true);
    return false;
  } else if (habit.icon === "" && File === null && form === "CREATE") {
    setErrors({
      ...errors,
      icon: "icon is empty",
    });
    setDisabled(true);
    return false;
  }
  setDisabled(false);
  return true;
};
export { handleChange, checkBeforeSubmit };
