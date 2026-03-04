import { createSlice } from "@reduxjs/toolkit";
import asyncActions from "./async-actions";
import type { ProgrammingLanguagesState } from "./programming-languages.types";

const initialState: ProgrammingLanguagesState = {
  programmingLanguages: [],
  isLoading: false,
  error: null,
};

const programmingLanguagesSlice = createSlice({
  name: "programmingLanguages",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    asyncActions(builder);
  },
});

export const programmingLanguagesReducer = programmingLanguagesSlice.reducer;
export type { ProgrammingLanguagesState, ProgrammingLanguage } from "./programming-languages.types";
