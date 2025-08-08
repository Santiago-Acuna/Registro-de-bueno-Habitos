import { type State, type Habit } from "./habits";
import {
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk
} from "@reduxjs/toolkit";
import axios from "axios";
import { HabitBody } from "../../../habits-types";

const fetchHabits = createAsyncThunk("habit/fetchAllHabits", async () => {
  let habitData: Habit[] = [];
  const fetch = async (): Promise<void> => {
    const maxRetries = 10;
    let retryCount = 0;

    const fetchData = async (): Promise<boolean> => {
      const response = await axios.get("http://localhost:5000/habits/");
      const habitDataIsThere: Habit[] = response.data;

      if (habitDataIsThere.length !== 0) {
        habitData = habitDataIsThere;
        return true;
      }
      return false;
    };

    const delay = async (ms: number): Promise<void> => {
      await new Promise((resolve) => setTimeout(resolve, ms));
    };

    while (retryCount < maxRetries) {
      const dataReceived = await fetchData();

      if (dataReceived) {
        break; // Exit the loop if data is received
      }

      await delay(5000); // Introduce a delay between iterations
      retryCount++;
    }
  };

  await fetch();
  return habitData;
});

const postHabits = createAsyncThunk(
  "habit/postHabits",

  async (habit: HabitBody) => {
    console.log("post dispached");
    try {
      const response = await axios.post("http://localhost:5000/habits/", habit);
      console.log(response.data);
      return response.data;
    } catch (e) {
      console.log(e);
    }
  }
);

const patchHabits = createAsyncThunk(
  "habit/patchHabits",

  async (payload: { habit: HabitBody; habitID: string }) => {
    const { habit, habitID } = payload;
    try {
      const response = await axios.patch(`http://localhost:5000/habits/${habitID}`, habit);
      console.log(response.data);
      return response.data;
    } catch (e) {
      console.log(e);
    }
  }
);

const asyncActions = (builder: ActionReducerMapBuilder<State>): void => {
  builder
    .addCase(fetchHabits.fulfilled, (state, action: PayloadAction<Habit[] | []>) => {
      if (action.payload !== undefined && action.payload !== null) {
        state.habits = action.payload;
        state.backUpHabits = action.payload;
      }
    })
    .addCase(postHabits.fulfilled, () => {})
    .addCase(patchHabits.fulfilled, () => {});
};

export { fetchHabits, postHabits, patchHabits };

export default asyncActions;
