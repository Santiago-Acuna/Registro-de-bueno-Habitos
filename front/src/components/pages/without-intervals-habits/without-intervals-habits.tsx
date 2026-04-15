import { useEffect, useState } from "react";
import styles from "./without-intervals-habits.module.css";
import { useCustomDispatch, useCustomSelector } from "../../../redux/hooks/hooks";
import { fetchHabits } from "../../../redux/slices/habits/async-actions";
import HabitsCard from "./habits-card/habits-card";
import { Link } from "react-router-dom";
import SpaceBackground from "./space-background/space-background";
import { GlassmorphismButton, GlassmorphismForm, GlassmorphismLogForm, GlassmorphismChart } from "@/components/utils";
import type { Habit } from "../../../habits-types";


const WithoutIntervalsHabits: React.FC = () => {
  const dispatch = useCustomDispatch();
  const { habits: allHabits } = useCustomSelector((state) => state.habit);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [addLogTarget, setAddLogTarget] = useState<Habit | null>(null);
  const [statisticsTarget, setStatisticsTarget] = useState<Habit | null>(null);

  const withoutIntervalsHabits = allHabits.filter(
    (h) => h.habitType === "Without Intervals"
  );


  useEffect(() => {
    dispatch(fetchHabits());
  }, [dispatch]);
  return (
    <SpaceBackground className={styles.container} >

      <div className={styles.buttonContainer}>
        <Link to="/" className={styles.backBtn}>
          <i className={styles.backArrow}>←</i>
          Back
        </Link>
        <GlassmorphismButton text="Create Habit" onClick={() => setIsFormOpen(true)} />
      </div>

      <div className={styles.header}>
        <div className={styles.headerGlow} />
        <h1 className={styles.title}>WITHOUT INTERVALS</h1>
        <div className={styles.subtitle}>Track every action, free from time constraints</div>
        <div className={styles.divider} />
      </div>
      {withoutIntervalsHabits.length === 0 && (
        <div>
          <p className={styles.noHabits}>There are no habits</p>
        </div>
      )}
      {withoutIntervalsHabits.length > 0 && (
        <div className={styles.cardsContainers}>
          {withoutIntervalsHabits.map((h) => (
            <HabitsCard habits={h} key={h.id} onAddLog={() => setAddLogTarget(h)} onShowStatistics={() => setStatisticsTarget(h)} />
          ))}
        </div>
      )}


      {statisticsTarget && (
        <GlassmorphismChart
          actionTypeName={statisticsTarget.name}
          onClose={() => setStatisticsTarget(null)}
        />
      )}
      {isFormOpen && <GlassmorphismForm onClose={() => setIsFormOpen(false)} />}
      {addLogTarget && (
        <GlassmorphismLogForm
          actionTypeName={addLogTarget.name}
          habitId={addLogTarget.id}
          onClose={() => setAddLogTarget(null)}
        />
      )}
    </SpaceBackground>
  );
};

export default WithoutIntervalsHabits;
