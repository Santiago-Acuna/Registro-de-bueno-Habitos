/**
 * Action Types Redux Slice - Async Actions
 *
 * Contains async thunks for fetching action types from the backend API.
 */

import {
  createAsyncThunk,
  type ActionReducerMapBuilder,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import type { ActionType, ActionTypesState } from "./action-types.types";

/**
 * Fetch action types by habit ID
 *
 * @param habitId - The ID of the habit to fetch action types for
 * @returns Promise<ActionType[]> - Array of action types
 */
export const fetchActionTypesByHabitId = createAsyncThunk<
  ActionType[],
  string,
  { rejectValue: string }
>(
  "actionTypes/fetchByHabitId",
  async (habitId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ data: ActionType[] }>(
        `http://localhost:3000/api/v1/action-types/habit/${habitId}`
      );

      // Transform date strings to Date objects
      const actionTypes = response.data.data.map((actionType) => ({
        ...actionType,
        lastActionDate: actionType.lastActionDate
          ? new Date(actionType.lastActionDate)
          : null,
        createdAt: new Date(actionType.createdAt),
        updatedAt: new Date(actionType.updatedAt),
      }));

      return actionTypes;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          "Failed to fetch action types";
        return rejectWithValue(message);
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

/**
 * Configure async action reducers
 *
 * @param builder - Redux Toolkit action reducer map builder
 */
const asyncActions = (
  builder: ActionReducerMapBuilder<ActionTypesState>
): void => {
  builder
    .addCase(fetchActionTypesByHabitId.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(
      fetchActionTypesByHabitId.fulfilled,
      (state, action: PayloadAction<ActionType[]>) => {
        state.isLoading = false;
        state.actionTypes = action.payload;
        state.error = null;
      }
    )
    .addCase(fetchActionTypesByHabitId.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Failed to fetch action types";
    });
};

export default asyncActions;
