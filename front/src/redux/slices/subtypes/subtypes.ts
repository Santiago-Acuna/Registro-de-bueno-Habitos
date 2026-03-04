import { createSlice } from "@reduxjs/toolkit";
import asyncActions from "./async-actions";
import type { SubtypesState } from "./subtypes.types";

const initialState: SubtypesState = {
  subtypes: [],
  isLoading: false,
  error: null,
};

const subtypesSlice = createSlice({
  name: "subtypes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    asyncActions(builder);
  },
});

export const subtypesReducer = subtypesSlice.reducer;
export type { SubtypesState, Subtype } from "./subtypes.types";
