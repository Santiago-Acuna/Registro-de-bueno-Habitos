import styles from "./form.module.css";
import { BookBody } from "../reading types";

interface HandleChangeParams {
  e: React.ChangeEvent<HTMLInputElement>;
  book: BookBody;
  setBook: React.Dispatch<React.SetStateAction<BookBody>>;
  errors: Record<string, string | undefined>;
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>;
}

interface inputFormProps{
  inputName: keyof BookBody;
  book: BookBody;
  setBook:React.Dispatch<React.SetStateAction<BookBody>>;
  handleChange: (params: HandleChangeParams) => void;
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
  const displayName = String(inputName).replace(/_/g, ' ');
  const firstLetter = displayName.charAt(0).toUpperCase();
  const inputNameCapitalLetter = firstLetter + displayName.slice(1);
  return (
    <div className={styles.subContainer}>
      <label className={styles.subTitle} htmlFor={String(inputName)}>
        {inputNameCapitalLetter}:
      </label>
      <input
        id={String(inputName)}
        className={styles.subInput}
        type="text"
        value={book[inputName] ?? ""}
        name={String(inputName)}
        autoComplete="off"
        placeholder={inputNameCapitalLetter}
        onChange={(e) => {
          handleChange({ e, book,
            setBook, errors, setErrors, setDisabled });
        }}
      />
      {errors[String(inputName)] !== undefined && <p className={styles.danger}>{errors[String(inputName)]}</p>}
    </div>
  );
};

export default InputForm;
