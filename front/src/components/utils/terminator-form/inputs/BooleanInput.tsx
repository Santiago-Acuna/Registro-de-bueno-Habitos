import { FC } from "react";
import styles from "../terminator-form.module.css";

interface BooleanInputProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const BooleanInput: FC<BooleanInputProps> = ({ label, value, onChange }) => (
  <div className={styles.formGroup}>
    <label className={styles.formLabel}>{label}</label>
    <label className={styles.checkboxWrapper} onClick={() => onChange(!value)}>
      <div className={`${styles.checkboxCustom} ${value ? styles.checked : ""}`} />
      <span className={styles.checkboxLabel}>{label}</span>
    </label>
  </div>
);

export default BooleanInput;
