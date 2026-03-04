import {
  createAsyncThunk,
  type ActionReducerMapBuilder,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import type { Subtype, SubtypesState } from "./subtypes.types";

export const fetchSubtypes = createAsyncThunk<
  Subtype[],
  void,
  { rejectValue: string }
>(
  "subtypes/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<Subtype[]>(
        "http://localhost:3000/api/v1/subtypes"
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to fetch subtypes"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

const asyncActions = (
  builder: ActionReducerMapBuilder<SubtypesState>
): void => {
  builder
    .addCase(fetchSubtypes.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(
      fetchSubtypes.fulfilled,
      (state, action: PayloadAction<Subtype[]>) => {
        state.isLoading = false;
        state.subtypes = action.payload;
        state.error = null;
      }
    )
    .addCase(fetchSubtypes.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Failed to fetch subtypes";
    });
};

export default asyncActions;
