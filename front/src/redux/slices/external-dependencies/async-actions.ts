import {
  createAsyncThunk,
  type ActionReducerMapBuilder,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import type { ExternalDependency, ExternalDependenciesState } from "./external-dependencies.types";

export const fetchExternalDependencies = createAsyncThunk<
  ExternalDependency[],
  void,
  { rejectValue: string }
>(
  "externalDependencies/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<ExternalDependency[]>(
        "http://localhost:3000/api/v1/external-dependencies"
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to fetch external dependencies"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

const asyncActions = (
  builder: ActionReducerMapBuilder<ExternalDependenciesState>
): void => {
  builder
    .addCase(fetchExternalDependencies.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(
      fetchExternalDependencies.fulfilled,
      (state, action: PayloadAction<ExternalDependency[]>) => {
        state.isLoading = false;
        state.externalDependencies = action.payload;
        state.error = null;
      }
    )
    .addCase(fetchExternalDependencies.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Failed to fetch external dependencies";
    });
};

export default asyncActions;
