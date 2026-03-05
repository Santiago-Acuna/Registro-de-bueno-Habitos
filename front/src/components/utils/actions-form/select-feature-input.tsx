import React from "react";
import { useFeatures } from "../../../hooks";
import styles from "./form.module.css";

interface SelectFeatureInputProps {
  value: string;
  onChange: (value: string) => void;
}

const SelectFeatureInput: React.FC<SelectFeatureInputProps> = ({ value, onChange }) => {
  const { data: features, isLoading, isError } = useFeatures({ ready: false });

  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel}>Target Feature</label>
      <select
        className={styles.formInput}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
      >
        {isLoading && <option value="">Loading...</option>}
        {!isLoading && (isError || features.length === 0) && (
          <option value="">No features available</option>
        )}
        {!isLoading && !isError && features.length > 0 && (
          <>
            <option value="">Select a feature</option>
            {features.map((feature) => (
              <option key={feature.id} value={feature.id}>
                {feature.name}
              </option>
            ))}
          </>
        )}
      </select>
    </div>
  );
};

export default SelectFeatureInput;
