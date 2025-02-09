import React from "react";
import { Habit } from "@renderer/habits-types";
import styles from "./habitsCard.module.css";
import { useCustomDispatch,  useCustomSelector } from "../../redux/hooks/hooks";
import { manageForm, getInfo } from "../../redux/slices/form/form";
import { Link } from "react-router-dom";

interface HabitsCardProps {
  habits: Habit;
}

const HabitsCard: React.FC<HabitsCardProps> = ({ habits }: HabitsCardProps) => {
  const dispatch = useCustomDispatch();
  const { formState: form } = useCustomSelector((state) => state.form);
  const display = { display: form !== "" ? "none" : "flex" };
  const openUpdateForm = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    e.preventDefault();
    dispatch(getInfo(habits));
    dispatch(manageForm("UPDATE"));
  };
  return (
    <div className={styles.mainContainer} style={display}>
      <Link to="/Reading" className={styles.link}>
      <h3 className={styles.title}>{habits.name}</h3>
      <img className={styles.image} src={habits.logo} alt="img not found" />
      </Link>

      <button  className={styles.button24} role="button" onClick={openUpdateForm}> Update </button>
    </div>
  );
};
export default HabitsCard;
