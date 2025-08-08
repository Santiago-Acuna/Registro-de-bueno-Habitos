import { FC, useState, useEffect } from "react";
import { BookBody } from "../reading types";
import InputForm from "./inputForm";
import { handleChange, checkBeforeSubmit } from "./formUtils";
import DragDropFiles from "./uploadImage/dragUploadImage";
import styles from "./form.module.css";
import { useCustomDispatch, useCustomSelector } from "../../../redux/hooks/hooks";
import { useNavigate } from "react-router-dom";
import { postBooks, patchBooks } from "../../../redux/slices/book/asyncActions";

const Form: FC = () => {
  const [book, setBook] = useState<BookBody>({
    name: "",
    image: "",
    total_pages: 0,
    average_of_characters_per_minute: 0,
    current_page: 0 //poner default value 0
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [disabled, setDisabled] = useState<boolean>(false);
  const [File, setFile] = useState<File | null>(null);

  const { formState: form, bookInfo, bookID } = useCustomSelector((state) => state.book);
  const buttonName = form.charAt(0).toUpperCase() + form.substring(1);

  useEffect(() => {
    form === "UPDATE" && setBook(bookInfo);
  }, []);

  const navigate = useNavigate();
  const dispatch = useCustomDispatch();

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> => {
    e.preventDefault();
    console.log("handle submit");
    let check = checkBeforeSubmit(errors, book, setErrors, setDisabled);
    console.log(check);

    if (check && form === "CREATE") {
      console.log("pre submit");
      await dispatch(postBooks(book));
      console.log("submitted");

      alert("Habit Created Successfully");
      navigate("/");
    } else if (checkBeforeSubmit(errors, book, setErrors, setDisabled) && form === "UPDATE") {
      console.log("pre update");
      await dispatch(patchBooks({ book, bookID }));
      console.log("updated");
      alert("Book Updated Successfully");
      navigate("/");
    }
  };

  return (
    <form>
      <InputForm
        inputName="name"
        book={book}
        setBook={setBook}
        handleChange={handleChange}
        setErrors={setErrors}
        errors={errors}
        setDisabled={setDisabled}
      />

      <div className={styles.subContainer}>
        <p className={styles.subTitle}>Logo:</p>
        <DragDropFiles
          File={File}
          setFile={setFile}
          book={book}
          setBook={setBook}
          errors={errors}
          setErrors={setErrors}
          handleChange={handleChange}
          setDisabled={setDisabled}
        />
      </div>

      <InputForm
        inputName="total_pages"
        book={book}
        setBook={setBook}
        handleChange={handleChange}
        setErrors={setErrors}
        errors={errors}
        setDisabled={setDisabled}
      />

      <InputForm
        inputName="average_of_characters_per_minute"
        book={book}
        setBook={setBook}
        handleChange={handleChange}
        setErrors={setErrors}
        errors={errors}
        setDisabled={setDisabled}
      />

      <InputForm
        inputName="current_page"
        book={book}
        setBook={setBook}
        handleChange={handleChange}
        setErrors={setErrors}
        errors={errors}
        setDisabled={setDisabled}
      />
      <button
        className={styles.submitButton}
        type="submit"
        disabled={disabled}
        onClick={(e) => {
          handleSubmit(e);
        }}
      >
        {buttonName}
      </button>
    </form>
  );
};

export default Form;
