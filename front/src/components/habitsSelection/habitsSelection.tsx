import styles from "./habitsSelection.module.css";
import complex from "../../assets/complexIcon.png";
import simple from "../../assets/simplicityIcon.png";
import eternety from "../../assets/eternety.png";
import React from "react";
import { Link } from "react-router-dom";

import { useCustomSelector } from "../../redux/hooks/hooks";

const HabitsSelection: React.FC = () => {
  const { formState: form } = useCustomSelector((state) => state.form);

  const display = { display: form !== "" ? "none" : "flex" };
  return (
    <div className={styles["container"]} style={display}>
      <Link to="/Complex" className={styles.link} >
      <div className={`${styles["habitOptionCard"]}`}>

          <img src={complex} className={styles["habitImg"]} alt="complex img" />
          <button className={`${styles["habitBtn"]} ${styles["button-85"]}`}>
            Complex Habit
            </button>

      </div>
      </Link>
      <Link to="/Complex" className={styles.link} >
      <div className={`${styles["habitOptionCard"]}`}>
        <img src={simple} className={`${styles["habitImg"]}`} alt="simple img" />
        <button className={`${styles["habitBtn"]} ${styles["button-85"]}`} role="button">
          Simple Habit
        </button>
      </div>
      </Link>
      <Link to="/Complex" className={styles.link} >
      <div className={`${styles["habitOptionCard"]}`}>
        <img src={eternety} className={`${styles["habitImg"]}`} alt="simple img" />
        <button className={`${styles["habitBtn"]} ${styles["button-85"]}`} role="button">
          Habits Without Intervals
        </button>
      </div>
      </Link>
    </div>
  );
};

export default HabitsSelection;
