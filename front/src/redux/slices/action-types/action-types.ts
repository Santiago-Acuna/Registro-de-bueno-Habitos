/**
 * Action Types Redux Slice
 *
 * Manages state for action types including fetching, loading, and error states.
 */

import { createSlice } from "@reduxjs/toolkit";
import asyncActions from "./async-actions";
import type { ActionTypesState } from "./action-types.types";

/**
 * Initial state for action types slice
 */
const initialState: ActionTypesState = {
  actionTypes: [],
  isLoading: false,
  error: null,
};

/**
 * Action Types slice
 */
const actionTypesSlice = createSlice({
  name: "actionTypes",
  initialState,
  reducers: {
    /**
     * Clear action types from state
     */
    clearActionTypes: (state) => {
      state.actionTypes = [];
      state.error = null;
    },
    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    asyncActions(builder);
  },
});

export const { clearActionTypes, clearError } = actionTypesSlice.actions;
export const actionTypesReducer = actionTypesSlice.reducer;
export type { ActionTypesState, ActionType } from "./action-types.types";
