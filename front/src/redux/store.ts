import { configureStore } from "@reduxjs/toolkit";
import { habitsReducer } from "./slices/habits/habits";
import { formReducer } from "./slices/form/form";
import { booksReducer } from "./slices/book/book";
import { routesReducer } from "./slices/routes/routes";
import { actionTypesReducer } from "./slices/action-types";
import { programmingLanguagesReducer } from "./slices/programming-languages";
import { externalDependenciesReducer } from "./slices/external-dependencies";
import { logColumnsReducer } from "./slices/log-columns";

export const store = configureStore({
  reducer: {
    habit: habitsReducer,
    form: formReducer,
    book: booksReducer,
    routes: routesReducer,
    actionTypes: actionTypesReducer,
    programmingLanguages: programmingLanguagesReducer,
    externalDependencies: externalDependenciesReducer,
    logColumns: logColumnsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
