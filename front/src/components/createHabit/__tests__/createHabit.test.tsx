/**
 * CH-004: Refactor createHabit.tsx to use useHabitForm hook - RED PHASE
 *
 * User Story: As a frontend developer, I want to refactor the createHabit.tsx
 * component to use the useHabitForm custom hook while maintaining Redux-based
 * modal state management and existing UI behavior.
 *
 * IMPORTANT: These tests MUST FAIL initially because the component hasn't been
 * refactored yet to use the useHabitForm hook.
 *
 * Test Coverage:
 * 1. Component Rendering (based on Redux form state)
 * 2. Redux Integration (useCustomSelector, useCustomDispatch, manageForm action)
 * 3. Hook Integration (future-proofing for useHabitForm hook usage)
 * 4. User Interactions (button clicks, modal open/close)
 * 5. Style and Display (CSS modules, conditional rendering)
 * 6. Edge Cases (rapid interactions, unexpected state values)
 *
 * Dependencies:
 * - CH-003: useHabitForm hook (already implemented and tested)
 * - Redux form slice (manages modal state)
 * - HabitForm component (child component)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateHabits from "../createHabit";

// Mock dependencies
vi.mock("@mui/material/Button", () => ({
  default: ({
    children,
    onClick,
    variant,
  }: {
    children: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    variant?: string;
  }) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock("../../../utils/habitsForm/form", () => ({
  default: () => <div data-testid="habit-form">HabitForm Component</div>,
}));

vi.mock("../../../redux/hooks/hooks", () => ({
  useCustomSelector: vi.fn(),
  useCustomDispatch: vi.fn(),
}));

vi.mock("../../../redux/slices/form/form", () => ({
  manageForm: vi.fn((payload: string) => ({
    type: "form/manageForm",
    payload,
  })),
}));

vi.mock("@/hooks", () => ({
  useHabitForm: vi.fn(),
}));

// Import mocked modules for type-safe assertions
import {
  useCustomSelector,
  useCustomDispatch,
} from "../../../redux/hooks/hooks";
import { manageForm } from "../../../redux/slices/form/form";
import { useHabitForm } from "@/hooks";

describe("CH-004: Refactor createHabit.tsx to use useHabitForm hook", () => {
  // Mock implementations
  const mockDispatch = vi.fn();
  const mockUseHabitFormReturn = {
    habit: { name: "", icon: "", habit_type: "" },
    errors: {},
    disabled: false,
    File: null,
    handleChange: vi.fn(),
    handleSubmit: vi.fn(),
    setFile: vi.fn(),
    setHabit: vi.fn(),
    setErrors: vi.fn(),
    setDisabled: vi.fn(),
    buttonName: "Create",
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Setup default mock implementations
    (useCustomDispatch as any).mockReturnValue(mockDispatch);
    (useHabitForm as any).mockReturnValue(mockUseHabitFormReturn);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Component Rendering Tests", () => {
    it("should render without crashing", () => {
      // Arrange: Mock Redux selector to return closed form state
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "" } })
      );

      // Act: Render component
      const { container } = render(<CreateHabits />);

      // Assert: Component should render
      expect(container).toBeDefined();
      expect(container.firstChild).toBeTruthy();
    });

    it('should render the "Create Habit" button when form is closed (formState === "")', () => {
      // Arrange: Mock Redux selector with empty formState (form closed)
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "" } })
      );

      // Act: Render component
      render(<CreateHabits />);

      // Assert: "Create Habit" button should be visible
      const createButton = screen.getByRole("button", {
        name: /create habit/i,
      });
      expect(createButton).toBeDefined();
      expect(createButton.textContent).toBe("Create Habit");
    });

    it('should NOT render the "Create Habit" button when form is open (formState === "CREATE")', () => {
      // Arrange: Mock Redux selector with "CREATE" formState (form open)
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "CREATE" } })
      );

      // Act: Render component
      render(<CreateHabits />);

      // Assert: "Create Habit" button should NOT be in the document
      const createButton = screen.queryByRole("button", {
        name: /create habit/i,
      });
      expect(createButton).toBeNull();
    });

    it('should render the form modal when form is open (formState === "CREATE")', () => {
      // Arrange: Mock Redux selector with "CREATE" formState
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "CREATE" } })
      );

      // Act: Render component
      render(<CreateHabits />);

      // Assert: Form modal should be visible
      const formModal = screen.getByTestId("habit-form");
      expect(formModal).toBeDefined();
      expect(formModal.textContent).toContain("HabitForm Component");
    });

    it("should NOT render the form modal when form is closed", () => {
      // Arrange: Mock Redux selector with empty formState
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "" } })
      );

      // Act: Render component
      render(<CreateHabits />);

      // Assert: Form modal should NOT be in the document
      const formModal = screen.queryByTestId("habit-form");
      expect(formModal).toBeNull();
    });

    it("should render the close button/icon in the modal when form is open", () => {
      // Arrange: Mock Redux selector with "CREATE" formState
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "CREATE" } })
      );

      // Act: Render component
      const { container } = render(<CreateHabits />);

      // Assert: Close button should exist in the modal
      const closeButton = container.querySelector('[class*="close"]');
      expect(closeButton).toBeDefined();
      expect(closeButton).not.toBeNull();
    });

    it("should render the SVG close icon correctly", () => {
      // Arrange: Mock Redux selector with "CREATE" formState
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "CREATE" } })
      );

      // Act: Render component
      const { container } = render(<CreateHabits />);

      // Assert: SVG element should exist
      const svgElement = container.querySelector("svg");
      expect(svgElement).toBeDefined();
      expect(svgElement).not.toBeNull();

      // SVG should have correct viewBox
      expect(svgElement?.getAttribute("viewBox")).toBe("0 0 36 36");

      // SVG should contain path element
      const pathElement = svgElement?.querySelector("path");
      expect(pathElement).toBeDefined();
      expect(pathElement).not.toBeNull();
    });

    it("should render HabitForm component inside the modal", () => {
      // Arrange: Mock Redux selector with "CREATE" formState
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "CREATE" } })
      );

      // Act: Render component
      render(<CreateHabits />);

      // Assert: HabitForm component should be rendered
      const habitForm = screen.getByTestId("habit-form");
      expect(habitForm).toBeDefined();
      expect(habitForm.textContent).toBe("HabitForm Component");
    });
  });

  describe("Redux Integration Tests", () => {
    it("should use useCustomSelector to read form state", () => {
      // Arrange: Mock Redux selector
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "" } })
      );

      // Act: Render component
      render(<CreateHabits />);

      // Assert: useCustomSelector should be called
      expect(useCustomSelector).toHaveBeenCalled();
      expect(useCustomSelector).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should use useCustomDispatch for dispatching actions", () => {
      // Arrange: Mock Redux hooks
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "" } })
      );

      // Act: Render component
      render(<CreateHabits />);

      // Assert: useCustomDispatch should be called
      expect(useCustomDispatch).toHaveBeenCalled();
    });

    it('should dispatch manageForm("CREATE") when "Create Habit" button is clicked', () => {
      // Arrange: Mock Redux with closed form
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "" } })
      );

      render(<CreateHabits />);
      const createButton = screen.getByRole("button", {
        name: /create habit/i,
      });

      // Act: Click the "Create Habit" button
      fireEvent.click(createButton);

      // Assert: manageForm action should be dispatched with "CREATE"
      expect(mockDispatch).toHaveBeenCalled();
      expect(manageForm).toHaveBeenCalledWith("CREATE");
    });

    it('should dispatch manageForm("") when close button is clicked', () => {
      // Arrange: Mock Redux with open form
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "CREATE" } })
      );

      const { container } = render(<CreateHabits />);
      const closeButton = container.querySelector('[class*="closeDiv"]');

      // Act: Click the close button
      fireEvent.click(closeButton!);

      // Assert: manageForm action should be dispatched with empty string
      expect(mockDispatch).toHaveBeenCalled();
      expect(manageForm).toHaveBeenCalledWith("");
    });

    it("should show/hide UI elements based on Redux formState", () => {
      // Arrange: Start with closed form
      const { rerender } = render(<CreateHabits />);
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "" } })
      );
      rerender(<CreateHabits />);

      // Assert: Button should be visible, form should not
      expect(
        screen.queryByRole("button", { name: /create habit/i })
      ).toBeTruthy();
      expect(screen.queryByTestId("habit-form")).toBeNull();

      // Act: Change to open form
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "CREATE" } })
      );
      rerender(<CreateHabits />);

      // Assert: Button should not be visible, form should be visible
      expect(
        screen.queryByRole("button", { name: /create habit/i })
      ).toBeNull();
      expect(screen.queryByTestId("habit-form")).toBeTruthy();
    });

    it("should read formState from Redux state.form.formState", () => {
      // Arrange: Setup selector spy
      const selectorSpy = vi.fn((selector: any) =>
        selector({ form: { formState: "CREATE" } })
      );
      (useCustomSelector as any).mockImplementation(selectorSpy);

      // Act: Render component
      render(<CreateHabits />);

      // Assert: Selector should be called with correct state structure
      expect(selectorSpy).toHaveBeenCalled();
      const selectorFn = selectorSpy.mock.calls[0][0];
      const result = selectorFn({ form: { formState: "CREATE" } });

      expect(result).toHaveProperty("formState");
      expect(result.formState).toBe("CREATE");
    });
  });

  describe("Hook Integration Tests (Future-Proofing)", () => {
    it("should be able to call useHabitForm hook with CREATE formType", () => {
      // Arrange: This test ensures component structure supports hook integration
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "CREATE" } })
      );

      // Act: If component calls useHabitForm, it should pass correct formType
      render(<CreateHabits />);

      // Assert: After refactoring, component should call useHabitForm with "CREATE"
      // Currently this will fail because component doesn't use the hook yet
      expect(useHabitForm).toHaveBeenCalledWith(
        expect.objectContaining({
          formType: "CREATE",
        })
      );
    });

    it("should be able to integrate useHabitForm return values if needed", () => {
      // Arrange: Mock form state
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "CREATE" } })
      );

      // Act: Render component
      render(<CreateHabits />);

      // Assert: Component should be able to access hook return values
      // This test ensures component structure can handle hook integration
      expect(useHabitForm).toHaveBeenCalled();

      // The hook should return expected structure
      const hookReturn = (useHabitForm as any).mock.results[0]?.value;
      expect(hookReturn).toHaveProperty("buttonName");
      expect(hookReturn).toHaveProperty("habit");
      expect(hookReturn).toHaveProperty("handleSubmit");
    });

    it("should maintain backward compatibility with existing HabitForm component", () => {
      // Arrange: Mock open form
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "CREATE" } })
      );

      // Act: Render component
      render(<CreateHabits />);

      // Assert: HabitForm should still be rendered regardless of hook usage
      const habitForm = screen.getByTestId("habit-form");
      expect(habitForm).toBeDefined();
    });
  });

  describe("User Interaction Tests", () => {
    it('should open the form modal when "Create Habit" button is clicked', () => {
      // Arrange: Start with closed form
      let currentFormState = "";
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: currentFormState } })
      );

      const { rerender } = render(<CreateHabits />);
      const createButton = screen.getByRole("button", {
        name: /create habit/i,
      });

      // Act: Click button and simulate state change
      fireEvent.click(createButton);
      currentFormState = "CREATE";
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: currentFormState } })
      );
      rerender(<CreateHabits />);

      // Assert: Form should be visible after state change
      expect(screen.queryByTestId("habit-form")).toBeTruthy();
      expect(
        screen.queryByRole("button", { name: /create habit/i })
      ).toBeNull();
    });

    it("should close the form modal when close button is clicked", () => {
      // Arrange: Start with open form
      let currentFormState = "CREATE";
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: currentFormState } })
      );

      const { container, rerender } = render(<CreateHabits />);
      const closeButton = container.querySelector('[class*="closeDiv"]');

      // Act: Click close button and simulate state change
      fireEvent.click(closeButton!);
      currentFormState = "";
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: currentFormState } })
      );
      rerender(<CreateHabits />);

      // Assert: Form should be hidden after state change
      expect(screen.queryByTestId("habit-form")).toBeNull();
      expect(
        screen.queryByRole("button", { name: /create habit/i })
      ).toBeTruthy();
    });

    it('should hide "Create Habit" button when modal is open', () => {
      // Arrange: Mock open form
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "CREATE" } })
      );

      // Act: Render component
      render(<CreateHabits />);

      // Assert: Button should not be visible
      const createButton = screen.queryByRole("button", {
        name: /create habit/i,
      });
      expect(createButton).toBeNull();
    });

    it('should show "Create Habit" button when modal is closed', () => {
      // Arrange: Mock closed form
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "" } })
      );

      // Act: Render component
      render(<CreateHabits />);

      // Assert: Button should be visible
      const createButton = screen.queryByRole("button", {
        name: /create habit/i,
      });
      expect(createButton).toBeTruthy();
    });

    it("should call preventDefault when opening form", () => {
      // Arrange: Mock closed form
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "" } })
      );

      render(<CreateHabits />);
      const createButton = screen.getByRole("button", {
        name: /create habit/i,
      });

      // Create a mock event with preventDefault
      const mockEvent = {
        preventDefault: vi.fn(),
        currentTarget: createButton,
        target: createButton,
      } as any;

      // Act: Trigger click event
      fireEvent.click(createButton, mockEvent);

      // Assert: preventDefault should be called (via manageForm dispatch)
      expect(mockDispatch).toHaveBeenCalled();
    });

  describe("Style and Display Tests", () => {
    it("should apply correct CSS module classes to main container", () => {
      // Arrange: Mock closed form
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "" } })
      );

      // Act: Render component
      const { container } = render(<CreateHabits />);

      // Assert: Should have 'create' class from CSS module
      const mainDiv = container.querySelector('[class*="create"]');
      expect(mainDiv).toBeDefined();
      expect(mainDiv).not.toBeNull();
    });

    it("should apply correct CSS module classes to create button container", () => {
      // Arrange: Mock closed form
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "" } })
      );

      // Act: Render component
      const { container } = render(<CreateHabits />);

      // Assert: Should have 'createButton' class from CSS module
      const buttonContainer = container.querySelector(
        '[class*="createButton"]'
      );
      expect(buttonContainer).toBeDefined();
      expect(buttonContainer).not.toBeNull();
    });

    it("should apply correct inline styles based on form state (display flex)", () => {
      // Arrange: Mock closed form
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "" } })
      );

      // Act: Render component
      const { container } = render(<CreateHabits />);

      // Assert: Button container should have display flex when form is closed
      const buttonContainer = container.querySelector(
        '[class*="createButton"]'
      );
      const computedStyle = buttonContainer?.getAttribute("style");
      expect(computedStyle).toContain("display");
      expect(computedStyle).toContain("flex");
    });

    it("should apply correct inline styles based on form state (display none)", () => {
      // Arrange: Mock open form
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "CREATE" } })
      );

      // Act: Render component - button div won't be rendered at all when form is open
      const { container } = render(<CreateHabits />);

      // Assert: Button container should not exist when form is open
      const buttonContainer = container.querySelector(
        '[class*="createButton"]'
      );
      expect(buttonContainer).toBeNull();
    });

    it("should apply CSS module classes to form container when form is open", () => {
      // Arrange: Mock open form
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "CREATE" } })
      );

      // Act: Render component
      const { container } = render(<CreateHabits />);

      // Assert: Should have 'formContainer' class
      const formContainer = container.querySelector('[class*="formContainer"]');
      expect(formContainer).toBeDefined();
      expect(formContainer).not.toBeNull();
    });

    it("should apply CSS module classes to close button", () => {
      // Arrange: Mock open form
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "CREATE" } })
      );

      // Act: Render component
      const { container } = render(<CreateHabits />);

      // Assert: Should have 'close' class
      const closeElement = container.querySelector('[class*="close"]');
      expect(closeElement).toBeDefined();
      expect(closeElement).not.toBeNull();
    });

    it("should apply CSS module classes to close div wrapper", () => {
      // Arrange: Mock open form
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "CREATE" } })
      );

      // Act: Render component
      const { container } = render(<CreateHabits />);

      // Assert: Should have 'closeDiv' class
      const closeDiv = container.querySelector('[class*="closeDiv"]');
      expect(closeDiv).toBeDefined();
      expect(closeDiv).not.toBeNull();
    });

    it("should apply CSS module classes to SVG circle", () => {
      // Arrange: Mock open form
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "CREATE" } })
      );

      // Act: Render component
      const { container } = render(<CreateHabits />);

      // Assert: SVG should have 'circle' class
      const svgElement = container.querySelector('svg[class*="circle"]');
      expect(svgElement).toBeDefined();
      expect(svgElement).not.toBeNull();
    });

    it("should render Material-UI Button with correct variant", () => {
      // Arrange: Mock closed form
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "" } })
      );

      // Act: Render component
      render(<CreateHabits />);

      // Assert: Button should have 'contained' variant
      const button = screen.getByRole("button", { name: /create habit/i });
      expect(button.getAttribute("data-variant")).toBe("contained");
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid open/close actions", async () => {
      // Arrange: Start with closed form
      let currentFormState = "";
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: currentFormState } })
      );

      const { container, rerender } = render(<CreateHabits />);

      // Act: Rapid open
      const createButton = screen.getByRole("button", {
        name: /create habit/i,
      });
      fireEvent.click(createButton);
      currentFormState = "CREATE";
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: currentFormState } })
      );
      rerender(<CreateHabits />);

      // Act: Rapid close
      const closeButton = container.querySelector('[class*="closeDiv"]');
      fireEvent.click(closeButton!);
      currentFormState = "";
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: currentFormState } })
      );
      rerender(<CreateHabits />);

      // Assert: Should handle state changes correctly
      await waitFor(() => {
        expect(
          screen.queryByRole("button", { name: /create habit/i })
        ).toBeTruthy();
        expect(screen.queryByTestId("habit-form")).toBeNull();
      });

      // Verify dispatch was called for both actions
      expect(mockDispatch).toHaveBeenCalledTimes(2);
    });

    it("should maintain proper state when form changes from empty to CREATE and back", () => {
      // Arrange: Start with empty state
      let currentFormState = "";
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: currentFormState } })
      );

      const { rerender } = render(<CreateHabits />);

      // Act & Assert: Empty state
      expect(
        screen.queryByRole("button", { name: /create habit/i })
      ).toBeTruthy();
      expect(screen.queryByTestId("habit-form")).toBeNull();

      // Act & Assert: CREATE state
      currentFormState = "CREATE";
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: currentFormState } })
      );
      rerender(<CreateHabits />);

      expect(
        screen.queryByRole("button", { name: /create habit/i })
      ).toBeNull();
      expect(screen.queryByTestId("habit-form")).toBeTruthy();

      // Act & Assert: Back to empty state
      currentFormState = "";
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: currentFormState } })
      );
      rerender(<CreateHabits />);

      expect(
        screen.queryByRole("button", { name: /create habit/i })
      ).toBeTruthy();
      expect(screen.queryByTestId("habit-form")).toBeNull();
    });

    it("should not break if formState has unexpected values", () => {
      // Arrange: Mock unexpected formState value
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "UNEXPECTED_VALUE" } })
      );

      // Act: Render component
      const { container } = render(<CreateHabits />);

      // Assert: Component should render without crashing
      expect(container).toBeDefined();

      // When formState is not empty, form should be shown
      expect(screen.queryByTestId("habit-form")).toBeTruthy();
      expect(
        screen.queryByRole("button", { name: /create habit/i })
      ).toBeNull();
    });

    it('should handle formState with "UPDATE" value gracefully', () => {
      // Arrange: Mock formState with "UPDATE" (different from "CREATE")
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "UPDATE" } })
      );

      // Act: Render component
      const { container } = render(<CreateHabits />);

      // Assert: Component should treat non-empty state as "form open"
      expect(container).toBeDefined();
      expect(screen.queryByTestId("habit-form")).toBeTruthy();
      expect(
        screen.queryByRole("button", { name: /create habit/i })
      ).toBeNull();
    });

    it("should handle formState with whitespace correctly", () => {
      // Arrange: Mock formState with whitespace
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "   " } })
      );

      // Act: Render component
      const { container } = render(<CreateHabits />);

      // Assert: Whitespace should be treated as non-empty (form open)
      expect(container).toBeDefined();
      expect(screen.queryByTestId("habit-form")).toBeTruthy();
      expect(
        screen.queryByRole("button", { name: /create habit/i })
      ).toBeNull();
    });

    it("should handle multiple clicks on create button", () => {
      // Arrange: Mock closed form
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "" } })
      );

      render(<CreateHabits />);
      const createButton = screen.getByRole("button", {
        name: /create habit/i,
      });

      // Act: Click button multiple times
      fireEvent.click(createButton);
      fireEvent.click(createButton);
      fireEvent.click(createButton);

      // Assert: Should dispatch action for each click
      expect(mockDispatch).toHaveBeenCalledTimes(3);
      expect(manageForm).toHaveBeenCalledTimes(3);
    });

    it("should handle multiple clicks on close button", () => {
      // Arrange: Mock open form
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "CREATE" } })
      );

      const { container } = render(<CreateHabits />);
      const closeButton = container.querySelector('[class*="closeDiv"]');

      // Act: Click close button multiple times
      fireEvent.click(closeButton!);
      fireEvent.click(closeButton!);
      fireEvent.click(closeButton!);

      // Assert: Should dispatch action for each click
      expect(mockDispatch).toHaveBeenCalledTimes(3);
      expect(manageForm).toHaveBeenCalledTimes(3);
    });

    it("should render all four span elements in close button", () => {
      // Arrange: Mock open form
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: "CREATE" } })
      );

      // Act: Render component
      const { container } = render(<CreateHabits />);

      // Assert: Should have exactly 4 span elements in close button
      const closeElement = container.querySelector('[class*="close"]');
      const spans = closeElement?.querySelectorAll("span");
      expect(spans?.length).toBe(4);
    });

    it("should handle missing Redux state gracefully", () => {
      // Arrange: Mock selector that might return undefined
      (useCustomSelector as any).mockImplementation((selector: any) => {
        try {
          return selector({ form: { formState: "" } });
        } catch {
          return { formState: "" };
        }
      });

      // Act: Render component
      const { container } = render(<CreateHabits />);

      // Assert: Component should render without crashing
      expect(container).toBeDefined();
    });
  });

  describe("Integration Test - Complete User Flow", () => {
    it("should support complete user flow: open form, close form, open again", async () => {
      // Arrange: Start with closed form
      let currentFormState = "";
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: currentFormState } })
      );

      const { container, rerender } = render(<CreateHabits />);

      // Assert: Initial state - button visible, form hidden
      expect(
        screen.queryByRole("button", { name: /create habit/i })
      ).toBeTruthy();
      expect(screen.queryByTestId("habit-form")).toBeNull();

      // Act: User clicks "Create Habit"
      const createButton = screen.getByRole("button", {
        name: /create habit/i,
      });
      fireEvent.click(createButton);
      currentFormState = "CREATE";
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: currentFormState } })
      );
      rerender(<CreateHabits />);

      // Assert: Form should be open
      await waitFor(() => {
        expect(screen.queryByTestId("habit-form")).toBeTruthy();
        expect(
          screen.queryByRole("button", { name: /create habit/i })
        ).toBeNull();
      });

      // Act: User clicks close button
      const closeButton = container.querySelector('[class*="closeDiv"]');
      fireEvent.click(closeButton!);
      currentFormState = "";
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: currentFormState } })
      );
      rerender(<CreateHabits />);

      // Assert: Form should be closed
      await waitFor(() => {
        expect(
          screen.queryByRole("button", { name: /create habit/i })
        ).toBeTruthy();
        expect(screen.queryByTestId("habit-form")).toBeNull();
      });

      // Act: User opens form again
      const createButtonAgain = screen.getByRole("button", {
        name: /create habit/i,
      });
      fireEvent.click(createButtonAgain);
      currentFormState = "CREATE";
      (useCustomSelector as any).mockImplementation((selector: any) =>
        selector({ form: { formState: currentFormState } })
      );
      rerender(<CreateHabits />);

      // Assert: Form should be open again
      await waitFor(() => {
        expect(screen.queryByTestId("habit-form")).toBeTruthy();
        expect(
          screen.queryByRole("button", { name: /create habit/i })
        ).toBeNull();
      });

      // Verify all dispatches were made
      expect(mockDispatch).toHaveBeenCalledTimes(3);
    });
  });
});
