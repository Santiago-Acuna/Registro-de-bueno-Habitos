import React, { useEffect } from "react";
import styles from "./complex-habits.module.css";
// import imag from "../../assets/lecture-icon.png"
import { useCustomDispatch, useCustomSelector } from "../../redux/hooks/hooks";
import { fetchHabits } from "../../redux/slices/habits/asyncActions";
import HabitsCard from "./habitsCard/habitsCard";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import SpaceBackground from "./spaceBackground/spaceBackground";

const ComplexHabits: React.FC = () => {
  const dispatch = useCustomDispatch();
  const { habits: allHabits } = useCustomSelector((state) => state.habit);
  const { formState: form } = useCustomSelector((state) => state.form);
  const complexHabits =
    allHabits.length && allHabits.filter((h) => h.habitType === "complex");

  useEffect(() => {
    dispatch(fetchHabits());
  }, [dispatch]);
  return (
    <SpaceBackground className={styles.container}>
      {form === "" && (
        <Link to="/" className={styles.backButton}>
          <Button variant="contained">Back</Button>
        </Link>
      )}
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

export default ComplexHabits;
