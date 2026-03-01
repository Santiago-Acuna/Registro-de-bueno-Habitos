import { useState, useRef, useEffect, FC } from "react";
import styles from "./terminator-form.module.css";
import { useCustomDispatch, useCustomSelector } from "@/redux/hooks/hooks";
import { fetchProgrammingLanguages } from "@/redux/slices/programming-languages";
import { fetchExternalDependencies } from "@/redux/slices/external-dependencies";
import { fetchLogColumnsByActionTypeId } from "@/redux/slices/log-columns";
import type { ProgrammingLanguage } from "@/redux/slices/programming-languages";
import type { ExternalDependency } from "@/redux/slices/external-dependencies";

interface TerminatorFormProps {
  actionTypeName: string;
  actionTypeId:string
  onClose: () => void;
}

const TerminatorForm: FC<TerminatorFormProps> = ({ actionTypeName, actionTypeId, onClose }) => {
  const dispatch = useCustomDispatch();

  const { programmingLanguages, isLoading: loadingLanguages } = useCustomSelector(
    (state) => state.programmingLanguages
  );
  const { externalDependencies, isLoading: loadingDeps } = useCustomSelector(
    (state) => state.externalDependencies
  );

  const [unitName, setUnitName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage | null>(null);
  const [selectedDependency, setSelectedDependency] = useState<ExternalDependency | null>(null);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isDependencyDropdownOpen, setIsDependencyDropdownOpen] = useState(false);
  const [threatLevel, setThreatLevel] = useState(50);
  const [combatMode, setCombatMode] = useState(false);

  const languageSelectRef = useRef<HTMLDivElement>(null);
  const dependencySelectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchProgrammingLanguages());
    dispatch(fetchExternalDependencies());
    dispatch(fetchLogColumnsByActionTypeId(actionTypeId));
  }, [dispatch, actionTypeId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageSelectRef.current && !languageSelectRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
      if (dependencySelectRef.current && !dependencySelectRef.current.contains(event.target as Node)) {
        setIsDependencyDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleIncrement = () => {
    setThreatLevel((prev) => Math.min(100, prev + 1));
  };

  const handleDecrement = () => {
    setThreatLevel((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = () => {
    if (!unitName.trim()) {
      alert("ERROR: UNIT DESIGNATION REQUIRED");
      return;
    }

    if (!selectedLanguage) {
      alert("ERROR: PROGRAMMING LANGUAGE REQUIRED");
      return;
    }

    if (!selectedDependency) {
      alert("ERROR: EXTERNAL DEPENDENCY REQUIRED");
      return;
    }

    const combatStatus = combatMode ? "ENABLED" : "DISABLED";

    alert(`CONFIGURATION COMPLETE

UNIT: ${unitName}
LANGUAGE: ${selectedLanguage.name}
DEPENDENCY: ${selectedDependency.name}
THREAT LEVEL: ${threatLevel}
COMBAT MODE: ${combatStatus}

SYSTEM STATUS: OPERATIONAL
SKYNET PROTOCOL: ACTIVE`);

    setUnitName("");
    setSelectedLanguage(null);
    setSelectedDependency(null);
    setThreatLevel(50);
    setCombatMode(false);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.bgPattern} />

      <div className={styles.formContainer}>
        <div className={styles.scanBeam} />
        <div className={`${styles.corner} ${styles.cornerTl}`} />
        <div className={`${styles.corner} ${styles.cornerTr}`} />
        <div className={`${styles.corner} ${styles.cornerBl}`} />
        <div className={`${styles.corner} ${styles.cornerBr}`} />

        <div className={styles.header}>
          <div className={styles.systemAlert}>
            &#9650; CONFIGURATION MODE ACTIVE
          </div>
          <h1 className={styles.formTitle}>SYSTEM CONFIG</h1>
          <div className={styles.subtitle}>
            Advanced Parameters &mdash; {actionTypeName}
          </div>
        </div>

        <div className={styles.formBody}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Unit Designation</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="ENTER DESIGNATION..."
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Programming Language</label>
            <div className={styles.selectWrapper} ref={languageSelectRef}>
              <div
                className={`${styles.selectDisplay} ${isLanguageDropdownOpen ? styles.active : ""}`}
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              >
                <div className={styles.selectIconBox}>
                  {selectedLanguage
                    ? <img src={selectedLanguage.icon} alt={selectedLanguage.name} className={styles.selectIconImg} />
                    : <span className={styles.selectIconText}>&#9670;</span>}
                </div>
                <span className={styles.selectText}>
                  {loadingLanguages
                    ? "LOADING..."
                    : selectedLanguage
                    ? selectedLanguage.name
                    : "SELECT LANGUAGE..."}
                </span>
                <div
                  className={`${styles.selectArrow} ${isLanguageDropdownOpen ? styles.selectArrowOpen : ""}`}
                />
              </div>
              <div
                className={`${styles.selectDropdown} ${isLanguageDropdownOpen ? styles.open : ""}`}
              >
                {programmingLanguages.map((lang) => (
                  <div
                    key={lang.id}
                    className={styles.selectOption}
                    onClick={() => {
                      setSelectedLanguage(lang);
                      setIsLanguageDropdownOpen(false);
                    }}
                  >
                    <div className={styles.selectOptionIconBox}>
                      <img src={lang.icon} alt={lang.name} className={styles.selectOptionImg} />
                    </div>
                    <span className={styles.selectOptionText}>{lang.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>External Dependency</label>
            <div className={styles.selectWrapper} ref={dependencySelectRef}>
              <div
                className={`${styles.selectDisplay} ${isDependencyDropdownOpen ? styles.active : ""}`}
                onClick={() => setIsDependencyDropdownOpen(!isDependencyDropdownOpen)}
              >
                <div className={styles.selectIconBox}>
                  {selectedDependency
                    ? <img src={selectedDependency.icon} alt={selectedDependency.name} className={styles.selectIconImg} />
                    : <span className={styles.selectIconText}>&#9670;</span>}
                </div>
                <span className={styles.selectText}>
                  {loadingDeps
                    ? "LOADING..."
                    : selectedDependency
                    ? selectedDependency.name
                    : "SELECT DEPENDENCY..."}
                </span>
                <div
                  className={`${styles.selectArrow} ${isDependencyDropdownOpen ? styles.selectArrowOpen : ""}`}
                />
              </div>
              <div
                className={`${styles.selectDropdown} ${ isLanguageDropdownOpen ? styles.hide : isDependencyDropdownOpen ? styles.open : ""}`}
              >
                {externalDependencies.map((dep) => (
                  <div
                    key={dep.id}
                    className={styles.selectOption}
                    onClick={() => {
                      setSelectedDependency(dep);
                      setIsDependencyDropdownOpen(false);
                    }}
                  >
                    <div className={styles.selectOptionIconBox}>
                      <img src={dep.icon} alt={dep.name} className={styles.selectOptionImg} />
                    </div>
                    <span className={styles.selectOptionText}>{dep.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Threat Level</label>
            <div className={styles.numberRow}>
              <div className={styles.numberInputWrapper}>
                <input
                  type="number"
                  className={styles.formInput}
                  placeholder="0-100"
                  min="0"
                  max="100"
                  value={threatLevel}
                  onChange={(e) =>
                    setThreatLevel(
                      Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                    )
                  }
                />
              </div>
              <div className={styles.numberButtons}>
                <button className={styles.numberBtn} onClick={handleIncrement}>
                  &#9650;
                </button>
                <button className={styles.numberBtn} onClick={handleDecrement}>
                  &#9660;
                </button>
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Combat Mode</label>
            <label className={styles.checkboxWrapper} onClick={() => setCombatMode(!combatMode)}>
              <div
                className={`${styles.checkboxCustom} ${combatMode ? styles.checked : ""}`}
              />
              <span className={styles.checkboxLabel}>
                Enable Lethal Force
              </span>
            </label>
          </div>

          <div className={styles.submitContainer}>
            <button className={styles.cancelButton} onClick={onClose}>
              Abort
            </button>
            <button className={styles.submitButton} onClick={handleSubmit}>
              Initialize
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminatorForm;
