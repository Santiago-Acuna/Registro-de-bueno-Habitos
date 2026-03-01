import { createSlice } from "@reduxjs/toolkit";
import asyncActions from "./async-actions";
import type { LogColumnsState } from "./log-columns.types";

const initialState: LogColumnsState = {
  logColumns: [],
  isLoading: false,
  error: null,
};

const logColumnsSlice = createSlice({
  name: "logColumns",
  initialState,
  reducers: {
    clearLogColumns: (state) => {
      state.logColumns = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    asyncActions(builder);
  },
});

export const { clearLogColumns } = logColumnsSlice.actions;
export const logColumnsReducer = logColumnsSlice.reducer;
export type { LogColumnsState, LogColumn, LogColumnValidation } from "./log-columns.types";
