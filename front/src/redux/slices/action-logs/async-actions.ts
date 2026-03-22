import {
  createAsyncThunk,
  type ActionReducerMapBuilder,
} from "@reduxjs/toolkit";
import axios from "axios";
import type { ActionLog, ActionLogsState, CreateActionLogPayload } from "./action-logs.types";

export const createActionLog = createAsyncThunk<
  void,
  CreateActionLogPayload,
  { rejectValue: string }
>(
  "actionLogs/create",
  async (payload: CreateActionLogPayload, { rejectWithValue }) => {
    try {
      await axios.post("http://localhost:3000/api/v1/action-logs", payload);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to create action log";
        return rejectWithValue(message);
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

export const fetchActionLogsByActionType = createAsyncThunk<
  { actionTypeId: string; logs: ActionLog[] },
  string,
  { rejectValue: string }
>(
  "actionLogs/fetchByActionType",
  async (actionTypeId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ data: ActionLog[] }>(
        `http://localhost:3000/api/v1/action-logs`,
        { params: { actionTypeId } }
      );
      return { actionTypeId, logs: response.data.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to fetch action logs";
        return rejectWithValue(message);
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

const asyncActions = (
  builder: ActionReducerMapBuilder<ActionLogsState>
): void => {
  builder
    .addCase(createActionLog.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(createActionLog.fulfilled, (state) => {
      state.isLoading = false;
      state.error = null;
    })
    .addCase(createActionLog.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Failed to create action log";
    })
    .addCase(fetchActionLogsByActionType.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchActionLogsByActionType.fulfilled, (state, action) => {
      state.isLoading = false;
      state.logsByActionType[action.payload.actionTypeId] = action.payload.logs;
    })
    .addCase(fetchActionLogsByActionType.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Failed to fetch action logs";
    });
};

export default asyncActions;
