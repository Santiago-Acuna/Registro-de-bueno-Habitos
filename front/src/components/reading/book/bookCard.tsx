import { FC } from "react";
import { useCustomDispatch, useCustomSelector } from "../../../redux/hooks/hooks";
import { getInfo, manageForm } from "../../..//redux/slices/book/book";
import { BookType } from "../reading types";
import styles from "./booksCard.module.css";

interface BookCardProps {
  book: BookType;
}

const BookCard: FC<BookCardProps> = ({ book }) => {
  const dispatch = useCustomDispatch();
  const { formState: form } = useCustomSelector((state) => state.book);
  const display = { display: form !== "" ? "none" : "flex" };
  const openUpdateForm = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    e.preventDefault();
    dispatch(getInfo(book));
    dispatch(manageForm("UPDATE"));
  };

  return (
    <div style={display}>
      <div className={styles.cardAboutItems}>
        <div className={styles.flipCard}>
          <div className={styles.flipCardInner}>
            <div className={styles.flipCardfront}>
            <p>{book.name}</p>
              <img src={book.image} className={styles.flipImage} alt="book_image" />
              {book.current_page && <p>%</p>}
            </div>
            <div className={styles.flipCardback}>
              <div className={styles.cardbackSection}>

              <p className={styles.namep}>Total pages: {book.total_pages ? book.total_pages : "no info" }</p>
              </div>
              <div className={styles.cardbackSection}>
              <p className={styles.namep}>Current page: {book.current_page ? book.current_page : "no info" }</p>
              </div>
              <div className={styles.cardbackSection}>
                <div> Grid
                                                   con voz   sin voz
                average_of_characters_per_minute
                number_of_breaths_per_minute
                </div>

              </div>


              <a className={styles.buttonA} href="">
                <button className={styles.portfolioBtn}>Add log</button>
              </a>
              <a className={styles.buttonA} href="">
                <button className={styles.portfolioBtn}>Update book</button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div>

        flipped
        <p>total pages</p>
        <p>average_of_characters_per_minute modificar con o sin voz</p>
      </div>
      <button className={styles.button24} role="button" onClick={openUpdateForm}>
        Update
      </button>
    </div>
  );
};

export default BookCard;
