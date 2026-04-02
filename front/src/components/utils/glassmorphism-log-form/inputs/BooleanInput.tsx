import { FC } from "react";
import styles from "../glassmorphism-log-form.module.css";

interface BooleanInputProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const BooleanInput: FC<BooleanInputProps> = ({ label, value, onChange }) => (
  <div className={styles.formGroup}>
    <label className={styles.formLabel}>
      <span className={styles.labelDot} />
      {label}
    </label>
    <label className={styles.checkboxWrapper} onClick={() => onChange(!value)}>
      <div className={styles.toggle}>
        <div className={`${styles.toggleTrack} ${value ? styles.on : ""}`}>
          <div className={`${styles.toggleThumb} ${value ? styles.on : ""}`} />
        </div>
      </div>
      <span className={styles.checkboxLabel}>{label}</span>
    </label>
  </div>
);

export default BooleanInput;
