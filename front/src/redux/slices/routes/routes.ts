import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RouteConfig, RoutesState } from "./routes.types";

const initialState: RoutesState = {
  routes: [],
  isLoading: false,
  error: null,
};

const routesSlice = createSlice({
  name: "routes",
  initialState,
  reducers: {
    setRoutes: (state, action: PayloadAction<RouteConfig[]>) => {
      state.routes = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
      state.isLoading = true;
    },
  },
});

export const routesReducer = routesSlice.reducer;

export const { setRoutes, setLoading, setError, clearError } =
  routesSlice.actions;
