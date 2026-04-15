import React from "react";
import { Habit } from "../../../../habits-types";
import styles from "./habits-card.module.css";
import { useCustomSelector } from "../../../../redux/hooks/hooks";
import { Link } from "react-router-dom";

interface HabitsCardProps {
  habits: Habit;
  onAddLog?: () => void;
  onShowStatistics?: () => void;
}

const HabitsCard: React.FC<HabitsCardProps> = ({ habits, onAddLog, onShowStatistics }: HabitsCardProps) => {
  const { formState: form } = useCustomSelector((state) => state.form);
  const display = { display: form !== "" ? "none" : "flex" };

  return (
    <div className={styles.card} style={display}>
      <Link to="/Reading" className={styles.link}>
        <img className={styles.image} src={habits.icon} alt="img not found" />
        <div className={styles.imageOverlay} />
        <div className={styles.targetingGrid} />
        <div className={styles.cardContent}>
          <span className={styles.title}>{habits.name}</span>
        </div>
      </Link>

      <div className={styles.cornerTL} />
      <div className={styles.cornerTR} />
      <div className={styles.cornerBL} />
      <div className={styles.cornerBR} />

      <div className={styles.actionButtons}>
        <button className={styles.actionButton} onClick={(e) => { e.stopPropagation(); e.preventDefault(); onAddLog?.(); }}>
          Add Log
        </button>
        <button className={styles.actionButton} onClick={(e) => { e.stopPropagation(); e.preventDefault(); onShowStatistics?.(); }}>
          Statistics
        </button>
      </div>
    </div>
  );
};
export default HabitsCard;
