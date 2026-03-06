import { useState, useRef, useEffect, FC } from "react";
import styles from "../terminator-form.module.css";

export interface SelectOption {
  id: number | string;
  name: string;
  icon?: string;
}

interface SelectInputProps {
  label: string;
  options: SelectOption[];
  value: SelectOption | null;
  onChange: (option: SelectOption | null) => void;
  isLoading?: boolean;
  isOpenSelect: boolean;
  setIsOpenSelect: (value:boolean)=> void
}

const SelectInput: FC<SelectInputProps> = ({
  label,
  options,
  value,
  onChange,
  isLoading = false,
  isOpenSelect,
  setIsOpenSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dynamicStyle = isOpenSelect && isOpen ? { zIndex: 100,}:{};
  const handleOpenChange=() =>{
    setIsOpen(!isOpen)
    setIsOpenSelect(true)
    console.log("open")

  }
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsOpenSelect(true);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel}>{label}</label>
      <div className={styles.selectWrapper} ref={wrapperRef}>
        <div
          className={`${styles.selectDisplay} ${isOpen ? styles.active : ""}`}
          onClick={() => handleOpenChange()}
        >
          <div className={styles.selectIconBox}>
            {value?.icon ? (
              <img src={value.icon} alt={value.name} className={styles.selectIconImg} />
            ) : (
              <span className={styles.selectIconText}>&#9670;</span>
            )}
          </div>
          <span className={styles.selectText}>
            {isLoading
              ? "LOADING..."
              : value
              ? value.name
              : `SELECT ${label.toUpperCase()}...`}
          </span>
          <div className={`${styles.selectArrow} ${isOpen ? styles.selectArrowOpen : ""}`} />
        </div>

        <div style={dynamicStyle} className={`${styles.selectDropdown} ${isOpen ? styles.open : ""}`}>
          {options.map((option) => (
            <div
              key={option.id}
              className={styles.selectOption}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
                setIsOpenSelect(false)
              }}
            >
              <div className={styles.selectOptionIconBox}>
                {option.icon ? (
                  <img src={option.icon} alt={option.name} className={styles.selectOptionImg} />
                ) : (
                  <span className={styles.selectIconText}>&#9670;</span>
                )}
              </div>
              <span className={styles.selectOptionText}>{option.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectInput;
