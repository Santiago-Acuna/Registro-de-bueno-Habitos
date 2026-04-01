import { FC } from "react";
import styles from "../glassmorphism-log-form.module.css";

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const TextInput: FC<TextInputProps> = ({ label, value, onChange }) => (
  <div className={styles.formGroup}>
    <label className={styles.formLabel}>
      <span className={styles.labelDot} />
      {label}
    </label>
    <input
      type="text"
      className={styles.formInput}
      placeholder={`Enter ${label.toLowerCase()}…`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default TextInput;
