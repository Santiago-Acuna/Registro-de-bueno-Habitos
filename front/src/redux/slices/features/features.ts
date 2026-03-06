import { createSlice } from "@reduxjs/toolkit";
import asyncActions from "./async-actions";
import type { FeaturesState } from "./features.types";

const initialState: FeaturesState = {
  features: [],
  isLoading: false,
  error: null,
};

const featuresSlice = createSlice({
  name: "features",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    asyncActions(builder);
  },
});

export const featuresReducer = featuresSlice.reducer;
export type { FeaturesState, Feature } from "./features.types";
