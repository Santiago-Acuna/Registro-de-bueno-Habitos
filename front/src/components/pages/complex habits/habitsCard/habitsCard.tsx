import React from "react";
import { Habit } from "../../../../habits-types";
import styles from "./habitsCard.module.css";
import { useCustomSelector } from "../../../../redux/hooks/hooks";
import { Link } from "react-router-dom";

interface HabitsCardProps {
  habits: Habit;
}

const HabitsCard: React.FC<HabitsCardProps> = ({ habits }: HabitsCardProps) => {
  const { formState: form } = useCustomSelector((state) => state.form);
  const display = { display: form !== "" ? "none" : "flex" };

  return (
    <div className={styles.card} style={display}>
      <Link to="/Reading" className={styles.link}>
        <span className={styles.title}>{habits.name}</span>
        <img className={styles.image} src={habits.icon} alt="img not found" />
      </Link>
    </div>
  );
};
export default HabitsCard;
