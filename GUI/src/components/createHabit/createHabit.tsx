import Button from "@mui/material/Button";
import { FC } from "react";
import HabitForm from "../../utils/habitsForm/form";
import { useCustomSelector, useCustomDispatch } from "../../redux/hooks/hooks";
import { manageForm } from "../../redux/slices/form/form";
import styles from "./createHabit.module.css";

const CreateHabits: FC = () => {
  const { formState: form } = useCustomSelector((state) => state.form);
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
      {form === "" &&
      (<div className={styles.createButton} style={display}>
        <Button variant="contained" onClick={openCreateForm}>
          Create Habit
        </Button>
      </div>)}

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

          <HabitForm />

        </div>
      )}
    </div>
  );
};

export default CreateHabits;
