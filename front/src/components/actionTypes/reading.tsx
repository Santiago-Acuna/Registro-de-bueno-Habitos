import { FC } from "react";
import logs from "../../assets/logs2.png";
import styles from "./reading.module.css";
import { Link } from "react-router-dom";

const ActionTypes: FC = () => {
  return (
    <div className={styles.readingContainer}>
      {/* <div></div> boton de back*/}
      <div></div>
// cambiar el fondo de complex y guardarlo para los de sin intervalo
https://codepen.io/t_afif/pen/OJvBbxm // nuevo fondo de complex
      <div className={styles.optionCard}>
        lista de types
      </div>
    </div>
  );
};
export default ActionTypes;
