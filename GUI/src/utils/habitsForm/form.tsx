import { useState, type FC, useEffect } from "react";
import InputForm from "./inputForm";
import styles from "./form.module.css";
import { handleChange, checkBeforeSubmit } from "./formUtils";
import { HabitBody } from "@renderer/habits-types";
import SelectComplexityInput from "./selectComplexityInput";
import { useNavigate } from "react-router-dom";
import { postHabits, patchHabits } from "../../redux/slices/habits/asyncActions";
import { useCustomDispatch, useCustomSelector } from "../../redux/hooks/hooks";
import DragDropFiles from "../uploadImage/dragUploadImage";

const HabitForm: FC = () => {
  // work: para quien ?: string, lenguage: string; descripcion: string:
  const [habit, setHabit] = useState<HabitBody>({
    name: "",
    logo: "",
    habit_type: ""
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [disabled, setDisabled] = useState<boolean>(false);
  const [File, setFile] = useState<File | null>(null);
  const {
    formState: form,
    habitInfo: habitInfo,
    habitID: habitID
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
    console.log("handle submit")
    let check = checkBeforeSubmit(errors, habit, setErrors, setDisabled)
    console.log(check)

    if (check && form === "CREATE") {
      console.log("pre submit");
      await dispatch(postHabits(habit));
      console.log("submitted");

      alert("Habit Created Successfully");
      navigate("/");
    } else if (checkBeforeSubmit(errors, habit, setErrors, setDisabled) && form === "UPDATE") {
      console.log("pre update");
      await dispatch(patchHabits( {habit, habitID} ));
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
        inputName="habit_type"
        habit={habit}
        setHabit={setHabit}
        handleChange={handleChange}
        setErrors={setErrors}
        errors={errors}
        setDisabled={setDisabled}
      />
      <div className={styles.subContainer}>
        <p className={styles.subTitle}>Logo:</p>
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
