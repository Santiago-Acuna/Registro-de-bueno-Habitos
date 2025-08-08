import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { formType, HabitBody, Habit } from "../../../habits-types";

type formState = formType | string;

interface State {
  formState: formState;
  habitInfo: HabitBody;
  habitID: string;
}
const initialState: State = {
  formState: "",
  habitInfo: { name: "", logo: "", habit_type: "" },
  habitID: ""
};
const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    manageForm: (state: State, action: PayloadAction<string>) => {
      state.formState = action.payload;
    },
    getInfo: (state: State, action: PayloadAction<Habit>) => {
      const { id, name, habit_type, logo } = action.payload;
      state.habitID = id;
      state.habitInfo = { name, habit_type, logo };
    },
  }
});

const formReducer = formSlice.reducer;

export const { manageForm, getInfo } = formSlice.actions;

export { formReducer, type State, type formState };
