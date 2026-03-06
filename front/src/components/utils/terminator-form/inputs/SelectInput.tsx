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
  value: SelectOption | SelectOption[] | null;
  onChange: (option: SelectOption | SelectOption[] | null) => void;
  isLoading?: boolean;
  multiple?: boolean;
  isOpenSelect: boolean;
  setIsOpenSelect: (value: boolean) => void;
}

const SelectInput: FC<SelectInputProps> = ({
  label,
  options,
  value,
  onChange,
  isLoading = false,
  multiple = false,
  isOpenSelect,
  setIsOpenSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dynamicStyle = isOpenSelect && isOpen ? { zIndex: 100 } : {};

  const selectedArray: SelectOption[] = multiple ? (value as SelectOption[]) ?? [] : [];
  const isSelected = (option: SelectOption) => selectedArray.some((s) => s.id === option.id);

  const handleOpenChange = () => {
    setIsOpen(!isOpen);
    setIsOpenSelect(true);
  };

  const handleOptionClick = (option: SelectOption) => {
    if (multiple) {
      const next = isSelected(option)
        ? selectedArray.filter((s) => s.id !== option.id)
        : [...selectedArray, option];
      onChange(next);
    } else {
      onChange(option);
      setIsOpen(false);
      setIsOpenSelect(false);
    }
  };

  const displayText = (): string => {
    if (isLoading) return "LOADING...";
    if (multiple) {
      if (selectedArray.length === 0) return `SELECT ${label.toUpperCase()}...`;
      if (selectedArray.length === 1) return selectedArray[0].name;
      return `${selectedArray.length} SELECTED`;
    }
    const single = value as SelectOption | null;
    return single ? single.name : `SELECT ${label.toUpperCase()}...`;
  };

  const displayIcon = (): string | undefined => {
    if (multiple) return selectedArray.length > 0 ? selectedArray[0].icon : undefined;
    return (value as SelectOption | null)?.icon;
  };

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

  const icon = displayIcon();

  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel}>{label}</label>
      <div className={styles.selectWrapper} ref={wrapperRef}>
        <div
          className={`${styles.selectDisplay} ${isOpen ? styles.active : ""}`}
          onClick={handleOpenChange}
        >
          {(!multiple || selectedArray.length === 0) && (
            <div className={styles.selectIconBox}>
              {icon ? (
                <img src={icon} alt="" className={styles.selectIconImg} />
              ) : (
                <span className={styles.selectIconText}>&#9670;</span>
              )}
            </div>
          )}
          {multiple && selectedArray.length > 0 ? (
            <div className={styles.selectedChips}>
              {selectedArray.map((option) => (
                <span key={option.id} className={styles.selectedChip}>
                  {option.icon && <img src={option.icon} alt="" className={styles.selectedChipIcon} />}
                  {option.name}
                  <button
                    type="button"
                    className={styles.selectedChipRemove}
                    onClick={(e) => { e.stopPropagation(); handleOptionClick(option); }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className={styles.selectText}>{displayText()}</span>
          )}
          <div className={`${styles.selectArrow} ${isOpen ? styles.selectArrowOpen : ""}`} />
        </div>

        <div style={dynamicStyle} className={`${styles.selectDropdown} ${isOpen ? styles.open : ""}`}>
          {options.map((option) => {
            const selected = multiple && isSelected(option);
            return (
              <div
                key={option.id}
                className={`${styles.selectOption} ${selected ? styles.selectOptionSelected : ""}`}
                onClick={() => handleOptionClick(option)}
              >
                <div className={styles.selectOptionIconBox}>
                  {option.icon ? (
                    <img src={option.icon} alt={option.name} className={styles.selectOptionImg} />
                  ) : (
                    <span className={styles.selectIconText}>&#9670;</span>
                  )}
                </div>
                <span className={styles.selectOptionText}>{option.name}</span>
                {multiple && (
                  <span className={styles.selectOptionCheck}>{selected ? "✓" : ""}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SelectInput;
