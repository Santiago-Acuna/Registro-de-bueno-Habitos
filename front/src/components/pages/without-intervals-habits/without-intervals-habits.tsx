import { useEffect } from "react";
import styles from "./without-intervals-habits.module.css";
import { useCustomDispatch, useCustomSelector } from "../../../redux/hooks/hooks";
import { fetchHabits } from "../../../redux/slices/habits/async-actions";
import HabitsCard from "./habits-card/habits-card";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import SpaceBackground from "./space-background/space-background";
import { GlassmorphismButton } from "@/components/utils";


const WithoutIntervalsHabits: React.FC = () => {
  const dispatch = useCustomDispatch();
  const { habits: allHabits } = useCustomSelector((state) => state.habit);

  const withoutIntervalsHabits = allHabits.filter(
    (h) => h.habitType === "Without Intervals"
  );


  useEffect(() => {
    dispatch(fetchHabits());
  }, [dispatch]);
  return (
    <SpaceBackground className={styles.container} >

      <div className={styles.buttonContainer}>
        <Link to="/" className={styles.backButton}>
          <Button variant="contained">Back</Button>
        </Link>
        <GlassmorphismButton text="Create Habit" onClick={() => {}} />
      </div>
      {withoutIntervalsHabits.length === 0 && (
        <div>
          <p className={styles.noHabits}>There are no habits</p>
        </div>
      )}
      {withoutIntervalsHabits.length > 0 && (
        <div className={styles.cardsContainers}>
          {withoutIntervalsHabits.map((h) => (
            <HabitsCard habits={h} key={h.id} />
          ))}
        </div>
      )}


    </SpaceBackground>
  );
};

export default WithoutIntervalsHabits;
