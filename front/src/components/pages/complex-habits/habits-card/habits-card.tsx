import React from "react";
import { Habit } from "../../../../habits-types";
import styles from "./habits-card.module.css";
import { useCustomSelector } from "../../../../redux/hooks/hooks";
import { Link } from "react-router-dom";

interface HabitsCardProps {
  habits: Habit;
}

const HabitsCard: React.FC<HabitsCardProps> = ({ habits }: HabitsCardProps) => {
  const { formState: form } = useCustomSelector((state) => state.form);
  const display = { display: form !== "" ? "none" : "block" };

  // Generate card ID from habit name
  const cardId = `H-${String(habits.id).padStart(3, '0')}`;

  return (
    <div className={styles.card} style={display}>
      <div className={styles.cardId}>{cardId}</div>

      <div className={styles.cardStatus}>
        <div className={styles.statusDot}></div>
        <div className={styles.statusDot}></div>
        <div className={styles.statusDot}></div>
      </div>

      <div className={styles.targetingOverlay}>
        <div className={styles.crosshairH}></div>
        <div className={styles.crosshairV}></div>
        <div className={styles.targetingCorner}></div>
        <div className={styles.targetingCorner}></div>
        <div className={styles.targetingCorner}></div>
        <div className={styles.targetingCorner}></div>
      </div>

      <div className={styles.scanLine}></div>

      <Link to={`/complex/${habits.id}`} className={styles.link}>
        <img
          src={habits.icon}
          alt={habits.name}
          className={styles.cardImage}
        />

        <div className={styles.cardContent}>
          <h2 className={styles.cardTitle}>{habits.name}</h2>
          <div className={styles.cardData}>
            <div className={styles.dataLine}>
              <span className={styles.dataLabel}>TYPE:</span>
              <span className={styles.dataValue}>{habits.habitType?.toUpperCase()}</span>
            </div>
            <div className={styles.dataLine}>
              <span className={styles.dataLabel}>STATUS:</span>
              <span className={styles.dataValue}>ACTIVE</span>
            </div>
          </div>
        </div>

        <div className={styles.threatLevel}>PRIORITY: HIGH</div>
        <div className={styles.assemblyIndicator}></div>
      </Link>
    </div>
  );
};

export default HabitsCard;
