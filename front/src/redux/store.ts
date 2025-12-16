import { configureStore } from "@reduxjs/toolkit";
import { habitsReducer } from "./slices/habits/habits";
import { formReducer } from "./slices/form/form";
import { booksReducer } from "./slices/book/book";
import { routesReducer } from "./slices/routes/routes";

export const store = configureStore({
  reducer: {
    habit: habitsReducer,
    form: formReducer,
    book: booksReducer,
    routes: routesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
