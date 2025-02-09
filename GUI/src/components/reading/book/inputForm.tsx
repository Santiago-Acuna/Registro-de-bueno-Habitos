import styles from "./form.module.css";
import { BookBody } from "../reading types";

interface inputFormProps{
  inputName: string;
  book: BookBody;
  setBook:React.Dispatch<React.SetStateAction<BookBody>>;
  handleChange: ({e, book, setBook, errors, setDisabled, setErrors}) => void;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>;
  errors: Record<string, string | undefined>;
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const InputForm: React.FC<inputFormProps> = ({
  inputName,
  book,
  setBook,
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
        value={book[inputName] ?? ""}
        name={inputName}
        autoComplete="off"
        placeholder={inputNameCapitalLetter}
        onChange={(e) => {
          handleChange({ e, book,
            setBook, errors, setErrors, setDisabled });
        }}
      />
      {errors[inputName] !== undefined && <p className={styles.danger}>{errors[inputName]}</p>}
    </div>
  );
};

export default InputForm;
