import { configureStore } from "@reduxjs/toolkit";
import { habitsReducer } from "./slices/habits/habits";
import { formReducer } from "./slices/form/form";
import { booksReducer } from "./slices/book/book";

export const store = configureStore({
  reducer: {
    habit: habitsReducer,
    form : formReducer,
    book :booksReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
