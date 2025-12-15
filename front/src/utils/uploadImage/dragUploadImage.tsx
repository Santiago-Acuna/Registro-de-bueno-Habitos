import { useRef} from "react";
import styles from "./uploadImage.module.css";
import { type HabitBody, HandleChangeProps } from "../../habits-types";

interface DragDropFilesProps {
  File: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  habit: HabitBody;
  setHabit: React.Dispatch<React.SetStateAction<HabitBody>>;
  errors: Record<string, string | undefined>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>;
  handleChange: ({ e, setHabit, habit, errors, setDisabled, setErrors }: HandleChangeProps) => void;
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const DragDropFiles: React.FC<DragDropFilesProps> = ({
  File,
  setFile,
  habit,
  setHabit,
  errors,
  setDisabled
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement | HTMLParagraphElement>): void => {
    event.preventDefault();
    console.log("drag over")
  };

  const handleDrop = async (

    event: React.DragEvent<HTMLDivElement | HTMLParagraphElement>
  ): Promise<void> => {
    event.preventDefault();
    console.log("dropped")
    const droppedFiles = event.dataTransfer.files;

    if (droppedFiles.length > 0) {
      // Assuming you want to handle only the first dropped file
      const droppedFile = droppedFiles[0];

      // Update state or perform further actions with the dropped file
      setFile(droppedFile);
      if (droppedFile !== null) {
        setDisabled(false)
      }
    }
  };

  const cancelUrlImage = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    setHabit({
      ...habit,
      icon: ""
    });
  };

  if (habit.icon !== "" ) {
    return (
      <div className={styles.urlImgDiv}>
        <img className={styles.urlImg} src={habit.icon} alt="invalid img" />
        <button
          className={styles.cancelBtn}
          onClick={(e) => {
            cancelUrlImage(e);
          }}
        >
          cancel
        </button>
      </div>
    );
  }

  if (File?.name !== null && File?.name !== undefined)
    return (
      <div className={styles.urlImgDiv}>
        <img className={styles.urlImg} src={URL.createObjectURL(File)} alt="a ver si esta" />
        <p className={styles.urlImgP}>{`${File.name}`}</p>
        <div className="actions">
          <button
            onClick={() => {
              setFile(null);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  return (
    <div className={styles.imageContainer}>
      <div className={styles.dropzone} onDragOver={handleDragOver} onDrop={handleDrop}>
        <p onDragOver={handleDragOver} onDrop={handleDrop}>
          Drag and Drop Files to Upload
        </p>
        <p onDragOver={handleDragOver} onDrop={handleDrop}>
          Or
        </p>
        <input
          type="file"
          hidden
          onChange={(event) => {
            console.log("input");
            console.log(event);
            event.target.files !== null && setFile(event.target.files[0]);
          }}
          accept="image/png, image/jpeg"
          ref={inputRef}
        />
      </div>
      <button
        className={styles.btnSelectImg}
        onClick={(e) => {
          e.preventDefault();
          inputRef.current?.click();
        }}
      >
        Select Files
      </button>
      {/* {isImageValid === false && <p className={styles.danger}>Image url is not valid</p>} */}
      {errors.icon !== undefined && <p className={styles.danger}>{errors.icon}</p>}
    </div>
  );
};

export default DragDropFiles;
