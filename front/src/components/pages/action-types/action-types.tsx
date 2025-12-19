import { FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import ActionTypesDisplay from "./action-types-display";
import { useCustomDispatch, useCustomSelector } from "../../../redux/hooks/hooks";
import { fetchActionTypesByHabitId } from "../../../redux/slices/action-types";

/**
 * Action Types Page Component
 *
 * This is a container component that handles data fetching and state management
 * for the action types display using Redux.
 */
const ActionTypes: FC = () => {
  const { habit: habitId } = useParams<{ habit: string }>();
  const dispatch = useCustomDispatch();
  const { actionTypes, isLoading, error } = useCustomSelector(
    (state) => state.actionTypes
  );

  useEffect(() => {
    if (habitId) {
      dispatch(fetchActionTypesByHabitId(habitId));
    }
  }, [habitId, dispatch]);

  const handleActionTypeClick = (actionType: any) => {
    console.log("Action Type clicked:", actionType);
    // TODO: Navigate to action type details page or show modal
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#000",
          color: "#ff0000",
          fontFamily: "Courier New, monospace",
        }}
      >
        LOADING ACTION TYPES...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#000",
          color: "#ff0000",
          fontFamily: "Courier New, monospace",
        }}
      >
        ERROR: {error}
      </div>
    );
  }

  return (
    <ActionTypesDisplay
      actionTypes={actionTypes}
      onActionTypeClick={handleActionTypeClick}
    />
  );
};

export default ActionTypes;
