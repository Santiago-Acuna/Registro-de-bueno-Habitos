import { useEffect } from "react";
import styles from "./complex-habits.module.css";
import { useCustomDispatch, useCustomSelector } from "../../../redux/hooks/hooks";
import { fetchHabits } from "../../../redux/slices/habits/async-actions";
import HabitsCard from "./habits-card/habits-card";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import CreateActionTypes from "../create-action-types/create-action-types";
import { TerminatorButton } from "@/components/utils";
import { manageForm } from "@/redux/slices/form/form";

const ComplexHabits: React.FC = () => {
  const dispatch = useCustomDispatch();
  const { habits: allHabits } = useCustomSelector((state) => state.habit);
  const { formState: form } = useCustomSelector((state) => state.form);

  const complexHabits =
    allHabits.length && allHabits.filter((h) => h.habitType === "Complex");

  const openCreateForm = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    dispatch(manageForm("CREATE"));
  };

  useEffect(() => {
    dispatch(fetchHabits());
  }, [dispatch]);

  return (
    <div className={styles.container}>
      {form === "" && (
        <div className={styles.header}>
          <div className={styles.systemStatus}>◆ SYSTEM ONLINE ◆</div>
          <h1 className={styles.title}>COMPLEX HABITS</h1>
          <div className={styles.timestamp}>HABIT TRACKING PROTOCOL ACTIVE</div>

          <div className={styles.buttonContainer}>
            <Link to="/" className={styles.backButton}>
              <Button variant="contained" className={styles.navButton}>
                Back
              </Button>
            </Link>
            <TerminatorButton text="Create Action" onClick={openCreateForm} />
          </div>
        </div>
      )}

      {form !== "" && <CreateActionTypes />}

      {allHabits.length === 0 && (
        <div className={styles.noHabitsContainer}>
          <p className={styles.noHabits}>NO HABITS DETECTED</p>
        </div>
      )}

      {allHabits.length > 0 && complexHabits && (
        <div className={styles.cardsGrid}>
          {complexHabits?.map((h) => (
            <HabitsCard habits={h} key={h.id} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplexHabits;
