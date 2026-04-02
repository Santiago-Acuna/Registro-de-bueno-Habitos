import { useState, useEffect, FC } from "react";
import styles from "./glassmorphism-log-form.module.css";
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
import { createActionLog } from "@/redux/slices/action-logs";

interface GlassmorphismLogFormProps {
  actionTypeName: string;
  actionTypeId: string;
  onClose: () => void;
}

const getDefaultValue = (type: "text" | "number" | "boolean"): string | number | boolean => {
  if (type === "number") return 0;
  if (type === "boolean") return false;
  return "";
};

const toSentenceCase = (str: string): string => {
  const spaced = str.replace(/([A-Z])/g, " $1").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const GlassmorphismLogForm: FC<GlassmorphismLogFormProps> = ({ actionTypeName, actionTypeId, onClose }) => {
  const dispatch = useCustomDispatch();

  const { logColumns, isLoading } = useCustomSelector((state) => state.logColumns);
  const { optionsBySource, isLoadingBySource } = useSelectSources(logColumns);

  const [formValues, setFormValues] = useState<Record<string, string | number | boolean>>({});
  const [selectValues, setSelectValues] = useState<Record<string, SelectOption | SelectOption[] | null>>({});
  const [isOpenSelect, setIsOpenSelect] = useState(false);

  useEffect(() => {
    dispatch(fetchLogColumnsByActionTypeId(actionTypeId));
  }, [dispatch, actionTypeId]);

  useEffect(() => {
    const initialFormValues: Record<string, string | number | boolean> = {};
    const initialSelectValues: Record<string, SelectOption | null> = {};

    logColumns.forEach((col) => {
      if (col.type === "select_multiple") {
        initialSelectValues[col.id] = [];
      } else if (col.type === "select_simple") {
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

  const handleSelectChange = (columnId: string, option: SelectOption | SelectOption[] | null) => {
    setSelectValues((prev) => ({ ...prev, [columnId]: option }));
  };

  const handleSubmit = async () => {
    for (const col of logColumns) {
      const frontValidations = col.validations.filter((v) => v.isForFront);
      const value =
        col.type === "select_simple" || col.type === "select_multiple"
          ? selectValues[col.id]
          : formValues[col.id];

      for (const validation of frontValidations) {
        try {
          // eslint-disable-next-line no-new-func
          const validate = new Function("value", `return (${validation.functionCode})(value)`);
          const isValid = validate(value);
          if (!isValid) {
            alert(`${col.name.toUpperCase()} — ${validation.functionName}`);
            return;
          }
        } catch {
          alert(`Failed to run validation for ${col.name.toUpperCase()}`);
          return;
        }
      }
    }

    const emptyTextColumn = logColumns.find(
      (col) => col.type === "text" && !(formValues[col.id] as string).trim()
    );
    if (emptyTextColumn) {
      alert(`${emptyTextColumn.name.toUpperCase()} is required`);
      return;
    }

    const emptySelectColumn = logColumns.find((col) => {
      if (col.type === "select_simple") return selectValues[col.id] === null;
      if (col.type === "select_multiple") return (selectValues[col.id] as SelectOption[]).length === 0;
      return false;
    });
    if (emptySelectColumn) {
      alert(`${emptySelectColumn.name.toUpperCase()} is required`);
      return;
    }

    const logTypeInfo = logColumns.reduce<Record<string, unknown>>((acc, col) => {
      if (col.type === "select_multiple") {
        acc[col.name] = (selectValues[col.id] as SelectOption[]).map((o) => o.id);
      } else if (col.type === "select_simple") {
        acc[col.name] = (selectValues[col.id] as SelectOption | null)?.id ?? null;
      } else {
        acc[col.name] = formValues[col.id];
      }
      return acc;
    }, {});

    const startTime = new Date();

    try {
      await dispatch(createActionLog({ startTime, actionTypeId, logTypeInfo })).unwrap();
      onClose();
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  const renderInput = (column: LogColumn) => {
    switch (column.type) {
      case "text":
        return (
          <TextInput
            key={column.id}
            label={toSentenceCase(column.name)}
            value={(formValues[column.id] as string) ?? ""}
            onChange={(val) => handleChange(column.id, val)}
          />
        );
      case "number":
        return (
          <NumberInput
            key={column.id}
            label={toSentenceCase(column.name)}
            value={(formValues[column.id] as number) ?? 0}
            onChange={(val) => handleChange(column.id, val)}
          />
        );
      case "boolean":
        return (
          <BooleanInput
            key={column.id}
            label={toSentenceCase(column.name)}
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
            label={toSentenceCase(column.name)}
            options={source ? (optionsBySource[source] ?? []) : []}
            value={selectValues[column.id] ?? (column.type === "select_multiple" ? [] : null)}
            onChange={(option) => handleSelectChange(column.id, option)}
            isLoading={source ? isLoadingBySource[source] : false}
            multiple={column.type === "select_multiple"}
            isOpenSelect={isOpenSelect}
            setIsOpenSelect={setIsOpenSelect}
          />
        );
      }
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} />
      <div className={`${styles.orb} ${styles.orbPurple}`} />
      <div className={`${styles.orb} ${styles.orbCyan}`} />
      <div className={`${styles.orb} ${styles.orbPink}`} />

      <div className={styles.formContainer}>
        <div className={styles.scanBeam} />
        <div className={`${styles.corner} ${styles.cornerTl}`} />
        <div className={`${styles.corner} ${styles.cornerTr}`} />
        <div className={`${styles.corner} ${styles.cornerBl}`} />
        <div className={`${styles.corner} ${styles.cornerBr}`} />

        <div className={styles.header}>
          <div className={styles.badge}>◆ Add Log</div>
          <h1 className={styles.formTitle}>Record Entry</h1>
          <div className={styles.divider} />
          <p className={styles.subtitle}>{actionTypeName}</p>
        </div>

        <div className={styles.formBody}>
          {isLoading ? (
            <div className={styles.loadingMessage}>Loading fields…</div>
          ) : (
            logColumns.map((column) => renderInput(column))
          )}

          <div className={styles.submitContainer}>
            <button className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button className={styles.submitButton} onClick={handleSubmit}>
              <span className={styles.submitLabel}>Save Log</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlassmorphismLogForm;
