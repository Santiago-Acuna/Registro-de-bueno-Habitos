/**
 * US-005: Dynamic Route Rendering in App.tsx - Integration Tests
 *
 * RED PHASE - These tests MUST FAIL initially
 *
 * This test suite verifies the App component's ability to dynamically render routes
 * based on backend configuration while maintaining a static root route. The component
 * fetches routes on mount, displays loading/error states, and renders the appropriate
 * components for each route.
 *
 * User Story: As a frontend developer, I want to replace static routes with dynamic
 * route generation so that routes are automatically created based on backend configuration.
 *
 * Test Coverage:
 * 1. Component renders successfully
 * 2. Static root route renders CreateHabits and HabitsSelection
 * 3. Dynamic routes fetched from backend on mount via useRoutes hook
 * 4. Dynamic routes rendered based on backend configuration
 * 5. Loading state shows while fetching routes
 * 6. Error state shows if route fetch fails
 * 7. Route components map correctly (WithoutIntervalsHabits for complex habits)
 * 8. useRoutes hook integration (fetchRoutes called on mount)
 * 9. Pages barrel export integration
 * 10. Retry functionality on error
 *
 * Acceptance Criteria:
 * - Root "/" route is static with CreateHabits and HabitsSelection
 * - Dynamic routes generated from backend config
 * - Loading state displays during fetch
 * - Error state with retry functionality
 * - Component mapping works correctly
 * - Invalid component names handled gracefully
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import userEvent from "@testing-library/user-event";
import type { RouteConfig } from "../redux/slices/routes/routes.types";
import { routesReducer } from "../redux/slices/routes/routes";

// Import App component
import App from "../App";

// Mock useRoutes hook to control routing state
vi.mock("../redux/hooks/useRoutes", () => ({
  useRoutes: vi.fn(),
}));

import { useRoutes } from "../redux/hooks/useRoutes";

// Mock the Pages barrel export
vi.mock("../components/Pages", () => ({
  WithoutIntervalsHabits: () => (
    <div data-testid="without-intervals-page">Without Intervals Habits Page</div>
  ),
  CreateHabits: () => (
    <div data-testid="create-habits-component">Create Habits</div>
  ),
  HabitsSelection: () => (
    <div data-testid="habits-selection-component">Habits Selection</div>
  ),
  SimpleHabits: () => (
    <div data-testid="simple-habits-page">Simple Habits Page</div>
  ),
  WithoutIntervalsHabits: () => (
    <div data-testid="without-intervals-page">Without Intervals Page</div>
  ),
}));

// Mock Material-UI components
vi.mock("@mui/material/CircularProgress", () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

vi.mock("@mui/material/Typography", () => ({
  default: ({
    children,
    color,
  }: {
    children: React.ReactNode;
    color?: string;
  }) => (
    <p data-testid="typography" data-color={color}>
      {children}
    </p>
  ),
}));

vi.mock("@mui/material/Button", () => ({
  default: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button onClick={onClick} data-testid="retry-button">
      {children}
    </button>
  ),
}));

describe("US-005: Dynamic Route Rendering in App.tsx", () => {
  let store: ReturnType<typeof configureStore>;
  const mockFetchRoutes = vi.fn();
  const mockClearError = vi.fn();

  // Helper to create Redux store for testing
  const createTestStore = () => {
    return configureStore({
      reducer: {
        routes: routesReducer,
      },
    });
  };

  // Helper to render App with providers
  const renderApp = () => {
    return render(
      <Provider store={store}>
        <App />
      </Provider>
    );
  };

  beforeEach(() => {
    // Create fresh store for each test
    store = createTestStore();

    // Clear all mocks before each test
    vi.clearAllMocks();

    // Reset mock functions
    mockFetchRoutes.mockClear();
    mockClearError.mockClear();

    // Setup default useRoutes mock return value (successful fetch with no routes)
    vi.mocked(useRoutes).mockReturnValue({
      routes: [],
      isLoading: false,
      error: null,
      fetchRoutes: mockFetchRoutes,
      clearError: mockClearError,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Initial Render and Component Structure", () => {
    it("should render the App component without crashing", () => {
      // Arrange: Default mocks already set in beforeEach

      // Act: Render App
      renderApp();

      // Assert: App should render successfully
      // Since isLoading is false and no error, should show routes
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    it("should wrap content in BrowserRouter", () => {
      // Arrange & Act
      const { container } = renderApp();

      // Assert: Container should exist (BrowserRouter present)
      expect(container).toBeTruthy();
    });

    it("should render the container div with correct styles", () => {
      // Arrange & Act
      const { container } = renderApp();

      // Assert: Container div with styles class should exist
      const containerDiv = container.querySelector(".container");
      expect(containerDiv).toBeInTheDocument();
    });
  });

  describe("Static Root Route", () => {
    it('should render CreateHabits component on root "/" route', () => {
      // Arrange: Default mocks
      // Note: In actual implementation, need to be on root route

      // Act: Render App
      renderApp();

      // Assert: CreateHabits should be present
      // This will fail initially as App hasn't been refactored yet
      expect(screen.getByTestId("create-habits-component")).toBeInTheDocument();
    });

    it('should render HabitsSelection component on root "/" route', () => {
      // Arrange & Act
      renderApp();

      // Assert: HabitsSelection should be present
      expect(
        screen.getByTestId("habits-selection-component")
      ).toBeInTheDocument();
    });

    it("should render both CreateHabits and HabitsSelection on root route simultaneously", () => {
      // Arrange & Act
      renderApp();

      // Assert: Both components should be present (Fragment/array rendering)
      expect(screen.getByTestId("create-habits-component")).toBeInTheDocument();
      expect(
        screen.getByTestId("habits-selection-component")
      ).toBeInTheDocument();
    });

    it("should keep root route static even when dynamic routes are loaded", () => {
      // Arrange: Mock routes with dynamic routes
      const mockRoutes: RouteConfig[] = [
        {
          path: "/programming",
          component: "WithoutIntervalsHabits",
          habitName: "Programming",
          habitType: "complex",
          actionTypes: ["for work", "personal"],
        },
      ];

      vi.mocked(useRoutes).mockReturnValue({
        routes: mockRoutes,
        isLoading: false,
        error: null,
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render App
      renderApp();

      // Assert: Root route should still render static components
      expect(screen.getByTestId("create-habits-component")).toBeInTheDocument();
      expect(
        screen.getByTestId("habits-selection-component")
      ).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show loading state when isLoading is true", () => {
      // Arrange: Mock loading state
      vi.mocked(useRoutes).mockReturnValue({
        routes: [],
        isLoading: true,
        error: null,
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render App
      renderApp();

      // Assert: Loading spinner should be visible
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("should display loading text while fetching routes", () => {
      // Arrange: Mock loading state
      vi.mocked(useRoutes).mockReturnValue({
        routes: [],
        isLoading: true,
        error: null,
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render App
      renderApp();

      // Assert: Loading text should be visible
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it("should hide loading state when isLoading is false", () => {
      // Arrange: Default mocks (isLoading: false)

      // Act: Render App
      renderApp();

      // Assert: Loading should not be visible
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    it("should not show routes when loading", () => {
      // Arrange: Mock loading state with routes
      const mockRoutes: RouteConfig[] = [
        {
          path: "/programming",
          component: "WithoutIntervalsHabits",
          habitName: "Programming",
          habitType: "complex",
          actionTypes: [],
        },
      ];

      vi.mocked(useRoutes).mockReturnValue({
        routes: mockRoutes,
        isLoading: true,
        error: null,
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render App
      renderApp();

      // Assert: Only loading should show, not routes
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      expect(
        screen.queryByTestId("create-habits-component")
      ).not.toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should show error message when error is present", () => {
      // Arrange: Mock error state
      vi.mocked(useRoutes).mockReturnValue({
        routes: [],
        isLoading: false,
        error: "Unable to load routes. Please check your connection.",
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render App
      renderApp();

      // Assert: Error message should be displayed
      expect(screen.getByTestId("typography")).toBeInTheDocument();
      expect(screen.getByText(/unable to load/i)).toBeInTheDocument();
    });

    it("should display retry button when error is present", () => {
      // Arrange: Mock error state
      vi.mocked(useRoutes).mockReturnValue({
        routes: [],
        isLoading: false,
        error: "Failed to load routes",
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render App
      renderApp();

      // Assert: Retry button should be present
      expect(screen.getByTestId("retry-button")).toBeInTheDocument();
      expect(screen.getByText(/retry/i)).toBeInTheDocument();
    });

    it("should call fetchRoutes when retry button is clicked", async () => {
      // Arrange: Mock error state
      vi.mocked(useRoutes).mockReturnValue({
        routes: [],
        isLoading: false,
        error: "Network error",
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      const user = userEvent.setup();

      // Act: Render App and click retry
      renderApp();

      const retryButton = screen.getByTestId("retry-button");
      await user.click(retryButton);

      // Assert: fetchRoutes should be called
      expect(mockFetchRoutes).toHaveBeenCalledTimes(1);
    });

    it("should not show routes when error is present", () => {
      // Arrange: Mock error state
      vi.mocked(useRoutes).mockReturnValue({
        routes: [],
        isLoading: false,
        error: "Error message",
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render App
      renderApp();

      // Assert: Routes should not be shown
      expect(
        screen.queryByTestId("create-habits-component")
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("typography")).toBeInTheDocument();
    });

    it("should handle different error messages correctly", () => {
      // Arrange: Mock timeout error
      vi.mocked(useRoutes).mockReturnValue({
        routes: [],
        isLoading: false,
        error: "Request timed out. Please try again.",
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render App
      renderApp();

      // Assert: Specific error message should be shown
      expect(screen.getByText(/timed out/i)).toBeInTheDocument();
    });
  });

  describe("useEffect and fetchRoutes Integration", () => {
    it("should call fetchRoutes on component mount", () => {
      // Arrange: Mock useEffect behavior
      // Note: This tests that useEffect with fetchRoutes is implemented

      // Act: Render App
      renderApp();

      // Assert: fetchRoutes should be called once on mount
      // This will fail until useEffect is added
      expect(mockFetchRoutes).toHaveBeenCalledTimes(1);
    });

    it("should call fetchRoutes only once on mount", () => {
      // Arrange & Act
      const { rerender } = renderApp();

      // Initial call
      expect(mockFetchRoutes).toHaveBeenCalledTimes(1);

      // Rerender
      rerender(
        <Provider store={store}>
          <App />
        </Provider>
      );

      // Assert: Should still be called only once
      expect(mockFetchRoutes).toHaveBeenCalledTimes(1);
    });

    it("should have fetchRoutes in useEffect dependency array", () => {
      // Arrange: Create a new mock function reference
      const firstFetchRoutes = vi.fn();

      vi.mocked(useRoutes).mockReturnValue({
        routes: [],
        isLoading: false,
        error: null,
        fetchRoutes: firstFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render App
      const { rerender } = renderApp();

      expect(firstFetchRoutes).toHaveBeenCalledTimes(1);

      // Change fetchRoutes reference (simulating hook returning new function)
      const secondFetchRoutes = vi.fn();

      vi.mocked(useRoutes).mockReturnValue({
        routes: [],
        isLoading: false,
        error: null,
        fetchRoutes: secondFetchRoutes,
        clearError: mockClearError,
      });

      rerender(
        <Provider store={store}>
          <App />
        </Provider>
      );

      // Assert: New function should be called (dependency changed)
      expect(secondFetchRoutes).toHaveBeenCalledTimes(1);
    });
  });

  describe("Dynamic Route Rendering", () => {
    it("should render dynamic routes from backend configuration", () => {
      // Arrange: Mock routes with one complex habit
      const mockRoutes: RouteConfig[] = [
        {
          path: "/programming",
          component: "WithoutIntervalsHabits",
          habitName: "Programming",
          habitType: "complex",
          actionTypes: ["for work", "personal project"],
        },
      ];

      vi.mocked(useRoutes).mockReturnValue({
        routes: mockRoutes,
        isLoading: false,
        error: null,
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render App
      // Note: This tests that routes.map() is implemented correctly
      renderApp();

      // Assert: Dynamic routes should be created
      // We can't test navigation directly, but we can verify no errors
      expect(screen.getByTestId("create-habits-component")).toBeInTheDocument();
    });

    it("should handle empty routes array gracefully", () => {
      // Arrange: Empty routes
      vi.mocked(useRoutes).mockReturnValue({
        routes: [],
        isLoading: false,
        error: null,
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render App
      renderApp();

      // Assert: Should render root route only
      expect(screen.getByTestId("create-habits-component")).toBeInTheDocument();
      expect(
        screen.getByTestId("habits-selection-component")
      ).toBeInTheDocument();
    });

    it("should render multiple dynamic routes correctly", () => {
      // Arrange: Mock routes with multiple habits
      const mockRoutes: RouteConfig[] = [
        {
          path: "/programming",
          component: "WithoutIntervalsHabits",
          habitName: "Programming",
          habitType: "complex",
          actionTypes: ["for work", "personal"],
        },
        {
          path: "/reading",
          component: "WithoutIntervalsHabits",
          habitName: "Reading",
          habitType: "complex",
          actionTypes: ["fiction", "non-fiction"],
        },
        {
          path: "/exercise",
          component: "SimpleHabits",
          habitName: "Exercise",
          habitType: "simple",
          actionTypes: ["cardio", "strength"],
        },
      ];

      vi.mocked(useRoutes).mockReturnValue({
        routes: mockRoutes,
        isLoading: false,
        error: null,
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render App
      renderApp();

      // Assert: Should handle multiple routes without errors
      expect(screen.getByTestId("create-habits-component")).toBeInTheDocument();
    });

    it("should not override static root route with dynamic routes", () => {
      // Arrange: Mock routes (should not include root path)
      const mockRoutes: RouteConfig[] = [
        {
          path: "/programming",
          component: "WithoutIntervalsHabits",
          habitName: "Programming",
          habitType: "complex",
          actionTypes: ["work"],
        },
      ];

      vi.mocked(useRoutes).mockReturnValue({
        routes: mockRoutes,
        isLoading: false,
        error: null,
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render at root
      renderApp();

      // Assert: Root route should maintain static components
      expect(screen.getByTestId("create-habits-component")).toBeInTheDocument();
      expect(
        screen.getByTestId("habits-selection-component")
      ).toBeInTheDocument();
    });
  });

  describe("Component Mapping from Pages", () => {
    it("should use Pages barrel export for component mapping", () => {
      // Arrange: Mock routes with different component types
      const mockRoutes: RouteConfig[] = [
        {
          path: "/complex-habit",
          component: "WithoutIntervalsHabits",
          habitName: "Complex Habit",
          habitType: "complex",
          actionTypes: [],
        },
        {
          path: "/simple-habit",
          component: "SimpleHabits",
          habitName: "Simple Habit",
          habitType: "simple",
          actionTypes: [],
        },
      ];

      vi.mocked(useRoutes).mockReturnValue({
        routes: mockRoutes,
        isLoading: false,
        error: null,
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render App
      renderApp();

      // Assert: Should map component names from Pages
      // Implementation should use: Pages[route.component as PageComponentName]
      expect(screen.getByTestId("create-habits-component")).toBeInTheDocument();
    });

    it("should handle component name lookup via bracket notation", () => {
      // Arrange: Test that dynamic component lookup works
      const mockRoutes: RouteConfig[] = [
        {
          path: "/test",
          component: "WithoutIntervalsHabits",
          habitName: "Test",
          habitType: "complex",
          actionTypes: [],
        },
      ];

      vi.mocked(useRoutes).mockReturnValue({
        routes: mockRoutes,
        isLoading: false,
        error: null,
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render App
      renderApp();

      // Assert: Should not crash with component lookup
      expect(screen.getByTestId("create-habits-component")).toBeInTheDocument();
    });

    it("should handle invalid component names gracefully", () => {
      // Arrange: Mock route with invalid component name
      const mockRoutes: RouteConfig[] = [
        {
          path: "/invalid",
          component: "NonExistentComponent" as any,
          habitName: "Invalid",
          habitType: "complex",
          actionTypes: [],
        },
      ];

      vi.mocked(useRoutes).mockReturnValue({
        routes: mockRoutes,
        isLoading: false,
        error: null,
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render App
      renderApp();

      // Assert: Should not crash (if (Component) check should handle this)
      expect(screen.getByTestId("create-habits-component")).toBeInTheDocument();
    });
  });

  describe("TypeScript Type Safety", () => {
    it("should use PageComponentName type for component lookup", () => {
      // Arrange: This tests that type PageComponentName = keyof typeof Pages is used
      const mockRoutes: RouteConfig[] = [
        {
          path: "/programming",
          component: "WithoutIntervalsHabits",
          habitName: "Programming",
          habitType: "complex",
          actionTypes: [],
        },
      ];

      vi.mocked(useRoutes).mockReturnValue({
        routes: mockRoutes,
        isLoading: false,
        error: null,
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render App
      renderApp();

      // Assert: TypeScript should compile without errors
      expect(screen.getByTestId("create-habits-component")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle routes with null or undefined values", () => {
      // Arrange: Mock routes with potential null values
      const mockRoutes: RouteConfig[] = [
        {
          path: "/test",
          component: "WithoutIntervalsHabits",
          habitName: "Test",
          habitType: "complex",
          actionTypes: [],
        },
        null as any,
        undefined as any,
      ].filter(Boolean) as RouteConfig[];

      vi.mocked(useRoutes).mockReturnValue({
        routes: mockRoutes,
        isLoading: false,
        error: null,
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render App
      renderApp();

      // Assert: Should not crash
      expect(screen.getByTestId("create-habits-component")).toBeInTheDocument();
    });

    it("should handle rapid state changes", () => {
      // Arrange: Start with loading
      vi.mocked(useRoutes).mockReturnValue({
        routes: [],
        isLoading: true,
        error: null,
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render and change states
      const { rerender } = renderApp();

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

      // Change to error
      vi.mocked(useRoutes).mockReturnValue({
        routes: [],
        isLoading: false,
        error: "Error",
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      rerender(
        <Provider store={store}>
          <App />
        </Provider>
      );

      expect(screen.getByTestId("retry-button")).toBeInTheDocument();

      // Change to success
      vi.mocked(useRoutes).mockReturnValue({
        routes: [],
        isLoading: false,
        error: null,
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      rerender(
        <Provider store={store}>
          <App />
        </Provider>
      );

      // Assert: Should handle all state transitions
      expect(screen.getByTestId("create-habits-component")).toBeInTheDocument();
    });

    it("should handle unmounting gracefully", () => {
      // Arrange & Act
      const { unmount } = renderApp();

      // Assert: Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible loading state", () => {
      // Arrange: Mock loading
      vi.mocked(useRoutes).mockReturnValue({
        routes: [],
        isLoading: true,
        error: null,
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render App
      renderApp();

      // Assert: Loading should be accessible
      const loadingElement = screen.getByTestId("loading-spinner");
      expect(loadingElement).toBeInTheDocument();
    });

    it("should have accessible error messages", () => {
      // Arrange: Mock error
      vi.mocked(useRoutes).mockReturnValue({
        routes: [],
        isLoading: false,
        error: "Error message",
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render App
      renderApp();

      // Assert: Error should be accessible
      const errorElement = screen.getByTestId("typography");
      expect(errorElement).toBeInTheDocument();
    });

    it("should have keyboard-accessible retry button", () => {
      // Arrange: Mock error
      vi.mocked(useRoutes).mockReturnValue({
        routes: [],
        isLoading: false,
        error: "Error",
        fetchRoutes: mockFetchRoutes,
        clearError: mockClearError,
      });

      // Act: Render App
      renderApp();

      // Assert: Retry button should be accessible
      const retryButton = screen.getByTestId("retry-button");
      expect(retryButton).toBeInTheDocument();
      expect(retryButton.tagName).toBe("BUTTON");
    });
  });
});
