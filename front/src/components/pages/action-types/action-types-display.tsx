import { FC, useState } from "react";
import styles from "./action-types-display.module.css";
import CreateActionTypes from "../create-action-types/create-action-types";
import { TerminatorButton, TerminatorForm } from "@/components/utils";
import { manageForm } from "@/redux/slices/form/form";
import { useCustomDispatch, useCustomSelector } from "../../../redux/hooks/hooks";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import type { ActionType } from "@/redux/slices/action-types";
import { fetchActionLogsByActionType } from "@/redux/slices/action-logs";
import TerminatorStatsChart from "@/components/utils/terminator-stats-chart/terminator-stats-chart";

interface ActionTypesDisplayProps {
  actionTypes: ActionType[];
  onActionTypeClick?: (actionType: ActionType) => void;
}

const ActionTypesDisplay: FC<ActionTypesDisplayProps> = ({
  actionTypes,
  onActionTypeClick,
}) => {
  const dispatch = useCustomDispatch();
  const [addLogTarget, setAddLogTarget] = useState<ActionType | null>(null);
  const [statsTarget, setStatsTarget] = useState<ActionType | null>(null);
  const logsByActionType = useCustomSelector((state) => state.actionLogs.logsByActionType);

  const openStatistics = (e: React.MouseEvent, actionType: ActionType) => {
    e.stopPropagation();
    dispatch(fetchActionLogsByActionType(actionType.id));
    setStatsTarget(actionType);
  };

  const getThreatLevel = (totalActions: number): number => {
    if (totalActions === 0) return 0;
    if (totalActions <= 5) return 1;
    if (totalActions <= 10) return 2;
    if (totalActions <= 20) return 3;
    if (totalActions <= 50) return 4;
    return 5;
  };

  const getActionCode = (index: number): string => {
    const codes = ["RECON", "INTEL", "INFIL", "COMBAT", "COGNI", "DEFNS"];
    const codeType = codes[index % codes.length];
    const codeNumber = String(index + 1).padStart(3, "0");
    return `ACT-${codeType}-${codeNumber}`;
  };

  const getActionCategory = (index: number): string => {
    const categories = [
      "Reconnaissance",
      "Intelligence",
      "Infiltration",
      "Engagement",
      "Cognitive",
      "Protection",
    ];
    return categories[index % categories.length];
  };
  const { formState: form } = useCustomSelector((state) => state.form);

  const openCreateForm = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    dispatch(manageForm("CREATE"));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.systemAlert}>▲ THREAT DETECTION ACTIVE</div>
        <h1 className={styles.title}>ACTION TYPES</h1>
        <div className={styles.subtitle}>Skynet Tactical Division</div>
      </div>
      <div className={styles.buttonContainer}>
        <Link to="/complex" className={styles.backButton}>
          <Button variant="contained" className={styles.navButton}>
            Back
          </Button>
        </Link>
        {form === "" ? <TerminatorButton text="Create Action" onClick={openCreateForm} />
          : <CreateActionTypes />}
      </div>

      {actionTypes.length === 0 && form === "" && (
        <div className={styles.noActionTypesContainer}>
          <p className={styles.noActionTypes}>NO ACTION TYPES DETECTED</p>
          <p className={styles.noActionTypesSubtext}>
            Create your first action type to begin tracking
          </p>
        </div>
      )}

      {actionTypes.length > 0 && (
        <div className={styles.cardsGrid}>
          {actionTypes.map((actionType, index) => {
          const threatLevel = getThreatLevel(actionType.totalActionsCount);

          return (
            <div
              key={actionType.id}
              className={styles.card}
              onClick={() => onActionTypeClick?.(actionType)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardCode}>{getActionCode(index)}</div>
              </div>

              <div className={styles.cardImageWrapper}>
                <img
                  src={actionType.icon}
                  alt={actionType.name}
                  className={styles.cardImage}
                />
                <div className={styles.redOverlay}></div>
                <div className={styles.scanlines}></div>
                <div className={styles.targetingGrid}></div>
                <div className={styles.crosshair}></div>
                <div className={styles.diagonalScan}></div>

                <div className={styles.actionButtons}>
                  <button
                    className={styles.actionButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      setAddLogTarget(actionType);
                    }}
                  >
                    <span className={styles.buttonText}>Add log</span>
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={(e) => openStatistics(e, actionType)}
                  >
                    <span className={styles.buttonText}>Statistics</span>
                  </button>
                </div>
              </div>

              <div className={styles.cornerMarkers}>
                <div className={`${styles.cornerMarker} ${styles.tl}`}></div>
                <div className={`${styles.cornerMarker} ${styles.tr}`}></div>
                <div className={`${styles.cornerMarker} ${styles.bl}`}></div>
                <div className={`${styles.cornerMarker} ${styles.br}`}></div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.actionCategory}>
                  {getActionCategory(index)}
                </div>
                <h2 className={styles.cardTitle}>{actionType.name}</h2>
                <div className={styles.actionStats}>
                  <span className={styles.statsLabel}>Actions:</span>
                  <span className={styles.statsValue}>
                    {actionType.totalActionsCount}
                  </span>
                </div>
                <div className={styles.threatLevel}>
                  <span className={styles.threatLabel}>Threat:</span>
                  <div className={styles.threatBars}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`${styles.threatBar} ${level <= threatLevel ? styles.active : ""
                          }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {addLogTarget && (
        <TerminatorForm
          actionTypeName={addLogTarget.name}
          actionTypeId={addLogTarget.id}
          onClose={() => setAddLogTarget(null)}
        />
      )}

      {statsTarget && (
        <TerminatorStatsChart
          actionLogs={logsByActionType[statsTarget.id] ?? []}
          actionTypeName={statsTarget.name}
          onClose={() => setStatsTarget(null)}
        />
      )}
    </div>
  );
};

export default ActionTypesDisplay;
