import { useRef, useState } from "react";
import styles from "./uploadImage.module.css";
import UploadImage from "./uploadImage";
import { BookBody } from "../../reading types";
import { HandleChangeProps } from "../formUtils";

interface DragDropFilesProps {
  File: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  book: BookBody;
  setBook: React.Dispatch<React.SetStateAction<BookBody>>;
  errors: Record<string, string | undefined>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>;
  handleChange: ({ e, book, setBook, errors, setDisabled, setErrors }:HandleChangeProps) => void;
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const DragDropFiles: React.FC<DragDropFilesProps> = ({
  File,
  setFile,
  book,
  setBook,
  errors,
  setErrors,
  handleChange,
  setDisabled
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isImageValid, setIsImageValid] = useState<boolean | null>(null);

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
        try {
          let result = await UploadImage(droppedFile);
          console.log(result);
          result !== undefined &&
          setBook({
              ...book,
              image: result
            });
        } catch (e) {
          console.log(e);
        }
      }
    }
  };

  const cancelUrlImage = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    setBook({
      ...book,
      image: ""
    });
  };
  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const imageUrl = e.target.value;
    console.log(typeof e.target.value);

    handleChange({ e, book, setBook, errors, setErrors, setDisabled });

    if (e.target.value === "") {
      console.log("si");
      setIsImageValid(null);
      setBook({
        ...book,
        image: imageUrl
      });
      return undefined;
    }

    // Create a new Image object
    const img = new Image();

    // Set up event handlers for successful load and error
    img.onload = () => {
      setIsImageValid(true);
    };

    img.onerror = () => {
      setIsImageValid(false);
    };

    // Set the image source to the provided URL
    img.src = imageUrl;

    // Update the input state
    setBook({
      ...book,
      image: imageUrl
    });
  };

  if (book.image !== "" && isImageValid === true) {
    return (
      <div className={styles.urlImgDiv}>
        <img className={styles.urlImg} src={book.image} alt="invalid img" />
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
      <p>Or</p>
      <p>Use an Url</p>
      <input
        className={styles.urlImgInput}
        type="text"
        value={book.image}
        name={"image"}
        autoComplete="off"
        onChange={(e) => {
          handleUrlInputChange(e);
        }}
      />
      {isImageValid === false && <p className={styles.danger}>Image url is not valid</p>}
      {errors.logo !== undefined && <p className={styles.danger}>{errors.logo}</p>}
    </div>
  );
};

export default DragDropFiles;
