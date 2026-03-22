import { FC } from "react";
import ActionTypesForm from "@/components/utils/actions-form/form";
import { useCustomSelector, } from "../../../redux/hooks/hooks";

import { useHabitForm } from "@/hooks";
import styles from "./create-action-types.module.css";

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
