import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import asyncActions from "./asyncActions";
import { Habit } from "@renderer/habits-types";

interface State {
  habits: Habit[]|[],
  backUpHabits: Habit[]|[]
}
const initialState : State = {
  habits: [],
  backUpHabits:[]

};
const habitsSlice = createSlice({
  name: "habits",
  initialState,
  reducers: {
    filterByComplexity: (state: State, action: PayloadAction<string>) => {
      const allHabits2 = state.backUpHabits;
      const complexityFiltered =allHabits2.filter((e) => e.habit_type?.includes(action.payload));
      state.habits = complexityFiltered;
    },
  },
  extraReducers: (builder) => {
    asyncActions(builder);
  }
});


const habitsReducer = habitsSlice.reducer

export const {
filterByComplexity} = habitsSlice.actions

export {habitsReducer, type State, type Habit}
