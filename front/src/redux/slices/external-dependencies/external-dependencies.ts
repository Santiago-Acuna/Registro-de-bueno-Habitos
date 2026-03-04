import { createSlice } from "@reduxjs/toolkit";
import asyncActions from "./async-actions";
import type { ExternalDependenciesState } from "./external-dependencies.types";

const initialState: ExternalDependenciesState = {
  externalDependencies: [],
  isLoading: false,
  error: null,
};

const externalDependenciesSlice = createSlice({
  name: "externalDependencies",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    asyncActions(builder);
  },
});

export const externalDependenciesReducer = externalDependenciesSlice.reducer;
export type { ExternalDependenciesState, ExternalDependency } from "./external-dependencies.types";
