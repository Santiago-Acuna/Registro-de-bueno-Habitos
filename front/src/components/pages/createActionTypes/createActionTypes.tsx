import { TerminatorButton } from "@/components/Utils";
import { FC } from "react";
import ActionTypesForm from "@/components/Utils/actionsForm/form";
import { useCustomSelector, useCustomDispatch } from "../../../redux/hooks/hooks";
import { manageForm } from "../../../redux/slices/form/form";
import { useHabitForm } from "@/hooks";
import styles from "./createActionTypes.module.css";

const CreateActionTypes: FC = () => {
    const { formState: form } = useCustomSelector((state) => state.form);

    // Use the useHabitForm hook for CREATE mode
    useHabitForm({ formType: "CREATE" });



    return (
        <div className={styles.create} >

            {form !== "" && <ActionTypesForm />}
        </div>
    );
};

export default CreateActionTypes;
