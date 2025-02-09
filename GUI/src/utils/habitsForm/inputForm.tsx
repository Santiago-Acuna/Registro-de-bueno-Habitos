import styles from "./form.module.css";
import { inputFormProps } from "@renderer/habits-types";

const InputForm: React.FC<inputFormProps> = ({
  inputName,
  habit,
  setHabit,
  handleChange,
  setErrors,
  setDisabled,
  errors
}) => {
  const isHabit_type = inputName === "habit_type" ? "habit type" : inputName;
  const firstLetter = isHabit_type.charAt(0).toUpperCase();
  const inputNameCapitalLetter = firstLetter + isHabit_type.slice(1);
  return (
    <div className={styles.subContainer}>
      <label className={styles.subTitle} htmlFor={inputName}>
        {inputNameCapitalLetter}:
      </label>
      <input
        id={inputName}
        className={styles.subInput}
        type="text"
        value={habit[inputName] ?? ""}
        name={inputName}
        autoComplete="off"
        placeholder={inputNameCapitalLetter}
        onChange={(e) => {
          handleChange({ e, setHabit, habit, errors, setErrors, setDisabled });
        }}
      />
      {errors[inputName] !== undefined && <p className={styles.danger}>{errors[inputName]}</p>}
    </div>
  );
};

export default InputForm;
