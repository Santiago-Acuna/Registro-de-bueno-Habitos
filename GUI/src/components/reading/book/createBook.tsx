import Button from "@mui/material/Button";
import { FC } from "react";
import { useCustomSelector, useCustomDispatch } from "../../../redux/hooks/hooks";
import { manageForm } from "@renderer/redux/slices/book/book";
import styles from "./createBook.module.css";
import Form from "./bookForm";

const CreateHabits: FC = () => {
  const { formState: form } = useCustomSelector((state) => state.book);
  const dispatch = useCustomDispatch();
  const display = { display: form !== "" ? "none" : "flex", justifyContent: "flex-end" };
  const openCreateForm = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    dispatch(manageForm("CREATE"));
  };
  const closeCreateForm = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    dispatch(manageForm(""));
  };
  return (
    <div className={styles.create}>
      {form === "" && (
        <div className={styles.createButton} style={display}>
          <Button variant="contained" onClick={openCreateForm}>
            Create Habit
          </Button>
        </div>
      )}

      {form !== "" && (
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
          </div>

          <Form />
        </div>
      )}
    </div>
  );
};

export default CreateHabits;
