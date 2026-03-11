import { createSlice } from "@reduxjs/toolkit";
import asyncActions from "./async-actions";
import type { ActionLogsState } from "./action-logs.types";

const initialState: ActionLogsState = {
  isLoading: false,
  error: null,
};

const actionLogsSlice = createSlice({
  name: "actionLogs",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    asyncActions(builder);
  },
});

export const { clearError } = actionLogsSlice.actions;
export const actionLogsReducer = actionLogsSlice.reducer;
export type { ActionLogsState } from "./action-logs.types";
