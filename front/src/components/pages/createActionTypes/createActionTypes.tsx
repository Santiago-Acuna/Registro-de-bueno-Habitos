import { TerminatorButton } from "@/components/Utils";
import { FC } from "react";
import ActionTypesForm from "@/components/Utils/actionsForm/form";
import { useCustomSelector, useCustomDispatch } from "../../../redux/hooks/hooks";
import { manageForm } from "../../../redux/slices/form/form";
import { useHabitForm } from "@/hooks";
import styles from "./createActionTypes.module.css";

interface CreateActionTypesProps{
    style?: React.CSSProperties | undefined
}

const CreateActionTypes: FC<CreateActionTypesProps> = ({ style }) => {
    const { formState: form } = useCustomSelector((state) => state.form);
    const dispatch = useCustomDispatch();

    // Use the useHabitForm hook for CREATE mode
    useHabitForm({ formType: "CREATE" });

    const display = {
        display: form !== "" ? "none" : "flex",
        justifyContent: "flex-end",
    };
    const openCreateForm = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();
        dispatch(manageForm("CREATE"));
    };
    const closeCreateForm = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        dispatch(manageForm(""));
    };
    return (
        <div className={styles.create} style={style}>
            {form === "" && (
                <div className={styles.createButton} style={display}>
                    <TerminatorButton text="Create Action" onClick={openCreateForm}

                    />
                </div>
            )}

            {form !== "" && <ActionTypesForm />}
        </div>
    );
};

export default CreateActionTypes;
