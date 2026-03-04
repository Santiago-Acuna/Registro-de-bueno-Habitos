import {
  createAsyncThunk,
  type ActionReducerMapBuilder,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import type { LogColumn, LogColumnsState } from "./log-columns.types";

export const fetchLogColumnsByActionTypeId = createAsyncThunk<
  LogColumn[],
  string,
  { rejectValue: string }
>(
  "logColumns/fetchByActionTypeId",
  async (actionTypeId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<LogColumn[]>(
        `http://localhost:3000/api/v1/action-logs/action-types/${actionTypeId}/log-columns`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to fetch log columns"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

const asyncActions = (
  builder: ActionReducerMapBuilder<LogColumnsState>
): void => {
  builder
    .addCase(fetchLogColumnsByActionTypeId.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(
      fetchLogColumnsByActionTypeId.fulfilled,
      (state, action: PayloadAction<LogColumn[]>) => {
        state.isLoading = false;
        state.logColumns = action.payload;
        state.error = null;
      }
    )
    .addCase(fetchLogColumnsByActionTypeId.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Failed to fetch log columns";
    });
};

export default asyncActions;
