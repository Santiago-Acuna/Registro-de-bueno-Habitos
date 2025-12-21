/**
 * Async Actions for Routes Redux Slice
 *
 * This file contains the fetchRoutes async thunk implementation.
 * Fetches dynamic route configuration from backend and transforms it for the frontend.
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import type { RouteConfig } from "./routes.types";

/**
 * Backend API Response Structure
 */
interface HabitsByTypeResponse {
  complex: Record<string, string[]>[];
  simple: Record<string, string[]>[];
  withoutintervals: Record<string, string[]>[];
}

/**
 * Transform habit name to kebab-case path
 * Removes special characters, emoji, and converts to URL-safe format
 */
const toKebabCase = (habitName: string): string => {
  return habitName
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars and emoji
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Remove consecutive hyphens
};

/**
 * Map habitType to component name
 */
const getComponentName = (
  habitType: "complex" | "simple" | "withoutintervals"
): string => {
  const componentMap: Record<string, string> = {
    complex: "ComplexHabits",
    simple: "SimpleHabits",
    withoutintervals: "WithoutIntervalsHabits",
  };
  return componentMap[habitType];
};

/**
 * Transform backend response to RouteConfig array
 */
const transformResponse = (data: HabitsByTypeResponse): RouteConfig[] => {
  const routes: RouteConfig[] = [];

  // Process each habit type
  const habitTypes: Array<keyof HabitsByTypeResponse> = [
    "complex",
    "simple",
    "withoutintervals",
  ];

  habitTypes.forEach((habitType) => {
    const habits = data[habitType] || [];

    habits.forEach((habitObj) => {
      // Extract habit name and action types from object
      const habitName = Object.keys(habitObj)[0];
      const actionTypes = habitObj[habitName];

      if (habitName) {
        routes.push({
          path: `/${habitType}/${toKebabCase(habitName)}`,
          component: getComponentName(habitType),
          habitName,
          habitType,
          actionTypes,
        });
      }
    });
  });

  return routes;
};

/**
 * Handle errors and return user-friendly messages
 */
const handleError = (error: unknown): string => {
  // Check if it's an error object
  const err = error as any;

  // Timeout error - check code and message
  if (
    err.code === "ECONNABORTED" ||
    (err.message && err.message.includes("timeout"))
  ) {
    return "Request timed out. Please try again.";
  }

  // Network error - check code
  if (err.code === "ERR_NETWORK") {
    return "Unable to load routes. Please check your connection.";
  }

  // API errors - check for response object
  if (err.response) {
    const status = err.response.status;

    if (status === 404) {
      return "Routes configuration not found. Please contact support.";
    }

    if (status >= 500) {
      return "Server error loading routes. Please try again later.";
    }

    // Other API errors (401, 403, etc.)
    return "Failed to load routes. Please try again.";
  }

  // Check if isAxiosError is explicitly set
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    if (!axiosError.response) {
      return "Unable to load routes. Please check your connection.";
    }
  }

  // Generic error
  return "An unexpected error occurred. Please try again.";
};

/**
 * Fetch routes from backend API
 */
export const fetchRoutes = createAsyncThunk<
  RouteConfig[],
  void,
  { rejectValue: string }
>("routes/fetchRoutes", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<HabitsByTypeResponse>(
      "http://localhost:3000/api/v1/front-config/habits-by-type",
      {
        timeout: 10000, // 10 second timeout
      }
    );

    // Validate response data
    if (!response.data || typeof response.data !== "object") {
      return rejectWithValue("Invalid response format from server.");
    }

    // Transform and return routes
    return transformResponse(response.data);
  } catch (error: unknown) {
    const errorMessage = handleError(error);
    return rejectWithValue(errorMessage);
  }
});
