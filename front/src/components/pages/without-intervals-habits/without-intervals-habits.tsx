import { useEffect } from "react";
import styles from "./without-intervals-habits.module.css";
import { useCustomDispatch, useCustomSelector } from "../../../redux/hooks/hooks";
import { fetchHabits } from "../../../redux/slices/habits/async-actions";
import HabitsCard from "./habits-card/habits-card";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import SpaceBackground from "./space-background/space-background";


const WithoutIntervalsHabits: React.FC = () => {
  const dispatch = useCustomDispatch();
  const { habits: allHabits } = useCustomSelector((state) => state.habit);

  const complexHabits =
    allHabits.length && allHabits.filter((h) => h.habitType === "Complex");


  useEffect(() => {
    dispatch(fetchHabits());
  }, [dispatch]);
  return (
    <SpaceBackground className={styles.container} >
  
      <div className={styles.buttonContainer}>
        <div>
      <Link to="/" className={styles.backButton}>
        <Button variant="contained">Back</Button>
      </Link>
      </div>
      </div>
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
