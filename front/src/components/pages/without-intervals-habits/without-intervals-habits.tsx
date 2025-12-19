import { useEffect } from "react";
import styles from "./without-intervals-habits.module.css";
import { useCustomDispatch, useCustomSelector } from "../../../redux/hooks/hooks";
import { fetchHabits } from "../../../redux/slices/habits/async-actions";
import HabitsCard from "./habits-card/habits-card";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import SpaceBackground from "./space-background/space-background";
import CreateActionTypes from "../create-action-types/create-action-types";
import { TerminatorButton } from "@/components/utils";
import { manageForm } from "@/redux/slices/form/form";

const WithoutIntervalsHabits: React.FC = () => {
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
    <SpaceBackground className={styles.container} >
      {form === "" && 
      <div className={styles.buttonContainer}>
        <div>
      <Link to="/" className={styles.backButton}>
        <Button variant="contained">Back</Button>
      </Link>
      </div>

          <TerminatorButton text="Create Action" onClick={openCreateForm} />

      </div>}

      {form !== "" && <CreateActionTypes />}
      {allHabits.length === 0 && (
        <div>
          <p className={styles.noHabits}>There are no habits</p>
        </div>
      )}
      {allHabits.length > 0 && complexHabits && (
        <div className={styles.cardsContainers}>
          {complexHabits?.map((h) => (
            <HabitsCard habits={h} key={h.id} />
          ))}
        </div>
      )}


    </SpaceBackground>
  );
};

export default WithoutIntervalsHabits;
