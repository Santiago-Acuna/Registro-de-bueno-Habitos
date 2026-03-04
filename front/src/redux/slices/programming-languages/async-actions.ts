import {
  createAsyncThunk,
  type ActionReducerMapBuilder,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import type { ProgrammingLanguage, ProgrammingLanguagesState } from "./programming-languages.types";

export const fetchProgrammingLanguages = createAsyncThunk<
  ProgrammingLanguage[],
  void,
  { rejectValue: string }
>(
  "programmingLanguages/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<ProgrammingLanguage[]>(
        "http://localhost:3000/api/v1/programming-languages"
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to fetch programming languages"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

const asyncActions = (
  builder: ActionReducerMapBuilder<ProgrammingLanguagesState>
): void => {
  builder
    .addCase(fetchProgrammingLanguages.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(
      fetchProgrammingLanguages.fulfilled,
      (state, action: PayloadAction<ProgrammingLanguage[]>) => {
        state.isLoading = false;
        state.programmingLanguages = action.payload;
        state.error = null;
      }
    )
    .addCase(fetchProgrammingLanguages.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Failed to fetch programming languages";
    });
};

export default asyncActions;
