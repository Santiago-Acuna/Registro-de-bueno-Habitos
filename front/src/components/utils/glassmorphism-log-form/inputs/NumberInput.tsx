import { FC } from "react";
import styles from "../glassmorphism-log-form.module.css";

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const NumberInput: FC<NumberInputProps> = ({ label, value, onChange }) => (
  <div className={styles.formGroup}>
    <label className={styles.formLabel}>
      <span className={styles.labelDot} />
      {label}
    </label>
    <div className={styles.numberRow}>
      <div className={styles.numberInputWrapper}>
        <input
          type="number"
          className={styles.formInput}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
      </div>
      <div className={styles.numberButtons}>
        <button className={styles.numberBtn} onClick={() => onChange(value + 1)}>
          &#9650;
        </button>
        <button className={styles.numberBtn} onClick={() => onChange(value - 1)}>
          &#9660;
        </button>
      </div>
    </div>
  </div>
);

export default NumberInput;
