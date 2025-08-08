import React from "react";
import { inputFormProps } from "../../habits-types";
import styles from "./form.module.css";

const SelectComplexityInput: React.FC<inputFormProps> = ({
  inputName,
  habit,
  setHabit,
  handleChange,
  setErrors,
  setDisabled,
  errors
}) => {
  enum HabitType {
    complex = "Complex",
    simple = "Simple",
    without_intervals = "Without Intervals"
  }
  const options = Object.values(HabitType);

  return (
    <div className={styles.subContainer}>
      <label className={styles.subTitle} htmlFor={"habit_type"}>
      Complexity:
      </label>
      <select
        className={styles.select}
        onChange={(e) => handleChange({ e, setHabit, habit, errors, setErrors, setDisabled })}
        name={inputName}
        value={habit.habit_type}
      >
        <option value="select">Select</option>
        {options.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>
      {errors[inputName] !== undefined && <p className={styles.danger}>{errors[inputName]}</p>}
    </div>
  );
};

export default SelectComplexityInput;
