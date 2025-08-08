import { FC, useEffect, MouseEvent } from "react";
import {
  useCustomDispatch,
  useCustomSelector,
} from "../../../redux/hooks/hooks";
import { fetchBooks } from "../../../redux/slices/book/asyncActions";
import { manageForm } from "../../../redux/slices/book/book";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import styles from "./books.module.css";
import BookCard from "./bookCard";
import Form from "./bookForm";

const Books: FC = () => {
  const dispatch = useCustomDispatch();
  const { books: books, formState } = useCustomSelector((state) => state.book);

  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  const openForm = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    dispatch(manageForm("CREATE"));
  };
  const closeCreateForm = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    dispatch(manageForm(""));
  };

  return (
    <div>
      {formState === "" && (
        <Link to="/Reading" className={styles.backButton}>
          <Button variant="contained">Back</Button>
        </Link>
      )}
      {formState === "" && <button onClick={openForm}>Add Book</button>}
      {books.length === 0 && formState === "" && (
        <div>
          <p className={styles.noHabits}>there are no books</p>
        </div>
      )}
      {formState !== "" && (
         <div className={styles.formContainer}>
         <div className={styles.closeDiv} onClick={closeCreateForm}>
           <div className={styles.close}>
             <span></span>
             <span></span>
             <span></span>
             <span></span>
             <svg viewBox="0 0 36 36" className={styles.circle}>
               <path
                 stroke-dasharray="100, 100"
                 d="M18 2.0845
         a 15.9155 15.9155 0 0 1 0 31.831
         a 15.9155 15.9155 0 0 1 0 -31.831"
               />
             </svg>
           </div>
           </div><Form />
           </div>)}
      {books.length > 0 && (
        <div className={styles.cardsContainers}>
          {books?.map((b) => <BookCard book={b} key={b.id} />)}
        </div>
      )}
    </div>
  );
};

export default Books;
