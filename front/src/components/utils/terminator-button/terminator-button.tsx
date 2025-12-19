import { useState } from "react";
import styles from "./terminator-button.module.css";

interface TerminatorButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
  disabled?: boolean;
  text: string;
}

const TerminatorButton: React.FC<TerminatorButtonProps> = ({
  onClick,
  disabled = false,
  text
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={styles.container}>
    <button
      className={styles.terminatorBtn}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.btnScanLine}></div>
      <div className={styles.btnGrid}></div>

      <div className={styles.btnCorners}>
        <div className={`${styles.btnCorner} ${styles.cornerTl}`}></div>
        <div className={`${styles.btnCorner} ${styles.cornerTr}`}></div>
        <div className={`${styles.btnCorner} ${styles.cornerBl}`}></div>
        <div className={`${styles.btnCorner} ${styles.cornerBr}`}></div>
      </div>

      <div className={styles.btnStatusDots}>
        <div className={styles.statusDot}></div>
        <div className={styles.statusDot}></div>
        <div className={styles.statusDot}></div>
      </div>

      

      <div className={styles.btnCode}>{text}</div>
    </button>
    </div>
  );
};

export default TerminatorButton;
