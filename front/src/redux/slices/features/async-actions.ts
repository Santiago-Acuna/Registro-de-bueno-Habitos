import {
  createAsyncThunk,
  type ActionReducerMapBuilder,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import type { Feature, FeaturesState, FetchFeaturesParams } from "./features.types";

export const fetchFeatures = createAsyncThunk<
  Feature[],
  FetchFeaturesParams | undefined,
  { rejectValue: string }
>(
  "features/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      if (params?.ready !== undefined) {
        queryParams.append("ready", String(params.ready));
      }

      if (params?.completed_at !== undefined) {
        queryParams.append("completedAt", params.completed_at);
      }

      const query = queryParams.toString();
      const url = `http://localhost:3000/api/v1/features${query ? `?${query}` : ""}`;

      const response = await axios.get<
        { id: string; name: string; description: string; ready: boolean; completedAt: Date | null }[]
      >(url);

      return response.data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        ready: item.ready,
        completed_at: item.completedAt,
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to fetch features"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

const asyncActions = (builder: ActionReducerMapBuilder<FeaturesState>): void => {
  builder
    .addCase(fetchFeatures.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(
      fetchFeatures.fulfilled,
      (state, action: PayloadAction<Feature[]>) => {
        state.isLoading = false;
        state.features = action.payload;
        state.error = null;
      }
    )
    .addCase(fetchFeatures.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Failed to fetch features";
    });
};

export default asyncActions;
