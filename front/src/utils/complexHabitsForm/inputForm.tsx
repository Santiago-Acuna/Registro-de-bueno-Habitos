import styles from "./form.module.css";
import { inputFormProps } from "../../habits-types";

const InputForm: React.FC<inputFormProps> = ({
  inputName,
  habit,
  setHabit,
  handleChange,
  setErrors,
  setDisabled,
  errors,
}) => {
  const ishabitType = inputName === "habitType" ? "habit type" : inputName;
  const firstLetter = ishabitType.charAt(0).toUpperCase();
  const inputNameCapitalLetter = firstLetter + ishabitType.slice(1);
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
      {errors[inputName] !== undefined && (
        <p className={styles.danger}>{errors[inputName]}</p>
      )}
    </div>
  );
};

export default InputForm;
