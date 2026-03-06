import { FC, useState, useRef, useEffect, DragEvent, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import styles from "./form.module.css";
import { manageForm } from "../../../redux/slices/form/form";
import { useCustomDispatch, useCustomSelector } from "../../../redux/hooks/hooks";
import { createActionType } from "../../../redux/slices/action-types";
import SelectFeatureInput from "./select-feature-input";

const ActionTypesForm: FC = () => {
  const { habit: habitId } = useParams<{ habit: string }>();
  const [unitName, setUnitName] = useState("");
  const [featureId, setFeatureId] = useState("");
  const [previewSrc, setPreviewSrc] = useState("");
  const [hasFile, setHasFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const dispatch = useCustomDispatch();
  const { isLoading } = useCustomSelector((state) => state.actionTypes);

  useEffect(() => {
    if (containerRef.current) {
      console.log("Container height:", containerRef.current.offsetHeight);
    }
    if (formContainerRef.current) {
      console.log("Form container height:", formContainerRef.current.offsetHeight);
    }
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewSrc(event.target?.result as string);
        setHasFile(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setPreviewSrc("");
    setHasFile(false);
    setSelectedFile(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewSrc(event.target?.result as string);
        setHasFile(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const name = unitName.trim();

    if (!name) {
      alert("ERROR: UNIT DESIGNATION REQUIRED");
      return;
    }

    if (!selectedFile) {
      alert("ERROR: UNIT IMAGE REQUIRED");
      return;
    }

    if (!habitId) {
      alert("ERROR: HABIT ID NOT FOUND");
      return;
    }

    try {
      const result = await dispatch(
        createActionType({
          name,
          habitId,
          icon: selectedFile,
        })
      ).unwrap();

      alert(`UNIT CREATED SUCCESSFULLY
DESIGNATION: ${result.name}
STATUS: OPERATIONAL
SKYNET PROTOCOL: ACTIVE`);

      // Reset form
      setUnitName("");
      setFeatureId("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setPreviewSrc("");
      setHasFile(false);
      setSelectedFile(null);

      // Close form
      dispatch(manageForm(""));
    } catch (error) {
      alert(`ERROR: FAILED TO CREATE UNIT
${error}`);
    }
  };

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (window.confirm("TERMINATE SESSION?\nALL UNSAVED DATA WILL BE LOST")) {
      // Reset form
      setUnitName("");
      setFeatureId("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setPreviewSrc("");
      setHasFile(false);
      setSelectedFile(null);
      alert("SESSION TERMINATED\nSKYNET PROTOCOL: STANDBY");
      e.preventDefault();
      dispatch(manageForm(""));
    }
  };

  return (

      <div className={styles.container} ref={containerRef}>
        <div className={styles.formContainer} ref={formContainerRef}>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            title="Close"
            type="button"
          >
            <div className={styles.closeButtonCorners}>
              <div className={styles.closeCorner}></div>
              <div className={styles.closeCorner}></div>
              <div className={styles.closeCorner}></div>
              <div className={styles.closeCorner}></div>
            </div>
          </button>

          <div className={styles.targetingLine}></div>
          <div className={styles.formCorners}>
            <div className={styles.corner}></div>
            <div className={styles.corner}></div>
            <div className={styles.corner}></div>
            <div className={styles.corner}></div>
          </div>

          <div className={styles.formHeader}>
            <div className={styles.systemStatus}>◆ INITIALIZATION PROTOCOL ◆</div>
            <h1 className={styles.formTitle}>UNIT REGISTRATION</h1>
            <div className={styles.timestamp}>SKYNET MANUFACTURING DIVISION</div>
          </div>

          <div className={styles.formBody}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Unit Designation</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="ENTER UNIT NAME..."
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
              />
            </div>

            <SelectFeatureInput value={featureId} onChange={setFeatureId} />

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Unit Image Upload</label>
              <input
                type="file"
                className={styles.fileInput}
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
              />

              <div
                className={`${styles.uploadArea} ${hasFile ? styles.hasFile : ""}`}
                onClick={handleUploadClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{ display: hasFile ? "none" : "flex" }}
              >
                <div className={styles.uploadIcon}>⬆</div>
                <div className={styles.uploadText}>Click to Upload Image</div>
                <div className={styles.uploadSubtext}>
                  Accepted Formats: JPG, PNG, GIF
                </div>
              </div>

              <div
                className={`${styles.previewContainer} ${hasFile ? styles.active : ""}`}
              >
                <img
                  src={previewSrc}
                  alt="Preview"
                  className={styles.previewImage}
                />
                <div className={styles.previewOverlay}></div>
                <button className={styles.removeImage} onClick={handleRemoveImage}>
                  Remove
                </button>
              </div>
            </div>

            <div className={styles.submitContainer}>
              <button
                className={styles.submitButton}
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "CREATING..." : "Create Unit"}
              </button>
            </div>
          </div>
        </div>
      </div>

  );
};

export default ActionTypesForm;
