import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RouteConfig, RoutesState } from "./routes.types";
import { fetchRoutes } from "./async-actions";

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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoutes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchRoutes.fulfilled,
        (state, action: PayloadAction<RouteConfig[]>) => {
          state.routes = action.payload;
          state.isLoading = false;
          state.error = null;
        }
      )
      .addCase(fetchRoutes.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || action.error.message || "Failed to fetch routes";
        state.routes = [];
      });
  },
});

export const routesReducer = routesSlice.reducer;

export const { setRoutes, setLoading, setError, clearError } =
  routesSlice.actions;
