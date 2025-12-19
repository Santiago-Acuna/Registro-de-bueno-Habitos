import { FC, useState, useEffect } from "react";
import ActionTypesDisplay, { ActionType } from "./action-types-display";

/**
 * Action Types Page Component
 *
 * This is a container component that handles data fetching and state management
 * for the action types display.
 *
 * TODO: Integrate with backend API to fetch real action types data
 * TODO: Add Redux integration for state management
 * TODO: Add error handling and loading states
 */
const ActionTypes: FC = () => {
  const [actionTypes, setActionTypes] = useState<ActionType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // TODO: Replace with actual API call
    // Example: fetchActionTypes()

    // For now, using sample data for demonstration
    const sampleActionTypes: ActionType[] = [
      // {
      //   id: "550e8400-e29b-41d4-a716-446655440001",
      //   name: "Morning Push-ups",
      //   icon: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop",
      //   habitId: "550e8400-e29b-41d4-a716-446655440000",
      //   totalActionsCount: 15,
      //   lastActionDate: new Date("2025-01-15"),
      //   createdAt: new Date("2025-01-01"),
      //   updatedAt: new Date("2025-01-15"),
      // },
    ];

    setActionTypes(sampleActionTypes);
  }, []);

  const handleActionTypeClick = (actionType: ActionType) => {
    console.log("Action Type clicked:", actionType);
    // TODO: Navigate to action type details page or show modal
  };

  if (isLoading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#000",
        color: "#ff0000",
        fontFamily: "Courier New, monospace"
      }}>
        LOADING ACTION TYPES...
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
