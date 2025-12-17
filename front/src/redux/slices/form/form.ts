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
  habitInfo: { name: "", icon: "", habitType: "" },
  habitID: "",
};
const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    manageForm: (state: State, action: PayloadAction<string>) => {
      state.formState = action.payload;
    },
    getInfo: (state: State, action: PayloadAction<Habit>) => {
      const { id, name, habitType, icon } = action.payload;
      state.habitID = id;
      state.habitInfo = { name, habitType, icon };
    },
  },
});

const formReducer = formSlice.reducer;

export const { manageForm, getInfo } = formSlice.actions;

export { formReducer, type State, type formState };
