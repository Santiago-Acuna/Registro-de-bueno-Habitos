import { useState, useEffect, FC } from "react";
import styles from "./terminator-form.module.css";
import { useCustomDispatch, useCustomSelector } from "@/redux/hooks/hooks";
import { fetchLogColumnsByActionTypeId } from "@/redux/slices/log-columns";
import type { LogColumn } from "@/redux/slices/log-columns";
import { useSelectSources } from "@/hooks/use-select-sources";
import type { SelectSource } from "@/hooks/use-select-sources";
import TextInput from "./inputs/TextInput";
import NumberInput from "./inputs/NumberInput";
import BooleanInput from "./inputs/BooleanInput";
import SelectInput from "./inputs/SelectInput";
import type { SelectOption } from "./inputs/SelectInput";

interface TerminatorFormProps {
  actionTypeName: string;
  actionTypeId: string;
  onClose: () => void;
}

const getDefaultValue = (type: 'text' | 'number' | 'boolean'): string | number | boolean => {
  if (type === "number") return 0;
  if (type === "boolean") return false;
  return "";
};

const TerminatorForm: FC<TerminatorFormProps> = ({ actionTypeName, actionTypeId, onClose }) => {
  const dispatch = useCustomDispatch();

  const { logColumns, isLoading } = useCustomSelector((state) => state.logColumns);
  const { optionsBySource, isLoadingBySource } = useSelectSources(logColumns);

  const [formValues, setFormValues] = useState<Record<string, string | number | boolean>>({});
  const [selectValues, setSelectValues] = useState<Record<string, SelectOption | null>>({});

  useEffect(() => {
    dispatch(fetchLogColumnsByActionTypeId(actionTypeId));
  }, [dispatch, actionTypeId]);

  useEffect(() => {
    const initialFormValues: Record<string, string | number | boolean> = {};
    const initialSelectValues: Record<string, SelectOption | null> = {};

    logColumns.forEach((col) => {
      if (col.type === "select_simple" || col.type === "select_multiple") {
        initialSelectValues[col.id] = null;
      } else {
        initialFormValues[col.id] = getDefaultValue(col.type);
      }
    });

    setFormValues(initialFormValues);
    setSelectValues(initialSelectValues);
  }, [logColumns]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleChange = (columnId: string, value: string | number | boolean) => {
    setFormValues((prev) => ({ ...prev, [columnId]: value }));
  };

  const handleSelectChange = (columnId: string, option: SelectOption | null) => {
    setSelectValues((prev) => ({ ...prev, [columnId]: option }));
  };

  const handleSubmit = () => {
    const emptyTextColumn = logColumns.find(
      (col) => col.type === "text" && !(formValues[col.id] as string).trim()
    );
    if (emptyTextColumn) {
      alert(`ERROR: ${emptyTextColumn.name.toUpperCase()} IS REQUIRED`);
      return;
    }

    const emptySelectColumn = logColumns.find(
      (col) =>
        (col.type === "select_simple" || col.type === "select_multiple") &&
        selectValues[col.id] === null
    );
    if (emptySelectColumn) {
      alert(`ERROR: ${emptySelectColumn.name.toUpperCase()} IS REQUIRED`);
      return;
    }

    const summary = logColumns
      .map((col) => {
        if (col.type === "select_simple" || col.type === "select_multiple") {
          return `${col.name.toUpperCase()}: ${selectValues[col.id]?.name ?? "—"}`;
        }
        return `${col.name.toUpperCase()}: ${formValues[col.id]}`;
      })
      .join("\n");

    alert(`CONFIGURATION COMPLETE\n\n${summary}\n\nSYSTEM STATUS: OPERATIONAL\nSKYNET PROTOCOL: ACTIVE`);

    onClose();
  };

  const renderInput = (column: LogColumn) => {
    switch (column.type) {
      case "text":
        return (
          <TextInput
            key={column.id}
            label={column.name}
            value={(formValues[column.id] as string) ?? ""}
            onChange={(val) => handleChange(column.id, val)}
          />
        );
      case "number":
        return (
          <NumberInput
            key={column.id}
            label={column.name}
            value={(formValues[column.id] as number) ?? 0}
            onChange={(val) => handleChange(column.id, val)}
          />
        );
      case "boolean":
        return (
          <BooleanInput
            key={column.id}
            label={column.name}
            value={(formValues[column.id] as boolean) ?? false}
            onChange={(val) => handleChange(column.id, val)}
          />
        );
      case "select_simple":
      case "select_multiple": {
        const source = column.selectSource as SelectSource | undefined;
        return (
          <SelectInput
            key={column.id}
            label={column.name}
            options={source ? (optionsBySource[source] ?? []) : []}
            value={selectValues[column.id] ?? null}
            onChange={(option) => handleSelectChange(column.id, option)}
            isLoading={source ? isLoadingBySource[source] : false}
          />
        );
      }
    }
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
          {isLoading ? (
            <div className={styles.loadingMessage}>LOADING PARAMETERS...</div>
          ) : (
            logColumns.map((column) => renderInput(column))
          )}

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
