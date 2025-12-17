import { useState, type FC, useEffect } from "react";
import InputForm from "./inputForm";
import styles from "./form.module.css";
import { handleChange, checkBeforeSubmit } from "./formUtils";
import { HabitBody } from "../../habits-types";
import SelectComplexityInput from "./selectComplexityInput";
import { useNavigate } from "react-router-dom";
import {
  postHabits,
  patchHabits,
} from "../../redux/slices/habits/asyncActions";
import { useCustomDispatch, useCustomSelector } from "../../redux/hooks/hooks";
import DragDropFiles from "../uploadImage/dragUploadImage";

const HabitForm: FC = () => {
  const [habit, setHabit] = useState<HabitBody>({
    name: "",
    icon: "",
    habitType: "",
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [disabled, setDisabled] = useState<boolean>(false);
  const [File, setFile] = useState<File | null>(null);
  const {
    formState: form,
    habitInfo: habitInfo,
    habitID: habitID,
  } = useCustomSelector((state) => state.form);

  const navigate = useNavigate();
  const dispatch = useCustomDispatch();
  const buttonName = form.charAt(0).toUpperCase() + form.substring(1);

  useEffect(() => {
    form === "UPDATE" && setHabit(habitInfo);
  }, []);

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> => {
    e.preventDefault();
    console.log("handle submit");
    let check = checkBeforeSubmit(
      errors,
      habit,
      setErrors,
      setDisabled,
      File,
      form
    );
    console.log(check);

    if (check && form === "CREATE") {
      console.log("pre submit");
      await dispatch(postHabits({ habit, File: File! }));
      console.log("submitted");

      alert("Habit Created Successfully");
      navigate("/");
    } else if (
      checkBeforeSubmit(errors, habit, setErrors, setDisabled, File, form) &&
      form === "UPDATE"
    ) {
      console.log("pre update");
      await dispatch(patchHabits({ habit, habitID }));
      console.log("updated");
      alert("Habit Updated Successfully");
      navigate("/");
    }
  };

  return (
    <form className={styles.formContainer}>
      <InputForm
        inputName="name"
        habit={habit}
        setHabit={setHabit}
        handleChange={handleChange}
        setErrors={setErrors}
        errors={errors}
        setDisabled={setDisabled}
      />
      <SelectComplexityInput
        inputName="habitType"
        habit={habit}
        setHabit={setHabit}
        handleChange={handleChange}
        setErrors={setErrors}
        errors={errors}
        setDisabled={setDisabled}
      />
      <div className={styles.subContainer}>
        <p className={styles.subTitle}>Icon:</p>
        <DragDropFiles
          File={File}
          setFile={setFile}
          habit={habit}
          setHabit={setHabit}
          errors={errors}
          setErrors={setErrors}
          handleChange={handleChange}
          setDisabled={setDisabled}
        />
      </div>
      <button
        className={styles.submitButton}
        type="submit"
        disabled={disabled}
        onClick={(e) => {
          handleSubmit(e);
        }}
      >
        {buttonName}
      </button>
    </form>
  );
};

export default HabitForm;
