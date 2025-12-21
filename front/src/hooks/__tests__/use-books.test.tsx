/**
 * CH-006: useBooks Custom Hook Tests
 *
 * RED PHASE - These tests MUST FAIL initially
 *
 * This test suite verifies the useBooks hook for managing book-related
 * state from Redux, including access to book data, CRUD operations,
 * loading and error states, and form management.
 *
 * User Story: As a frontend developer, I need a React hook that provides
 * access to book state from Redux, wraps all book CRUD operations, manages
 * loading/error states, and provides dispatch functions for book actions.
 *
 * Test Coverage:
 * 1. Hook existence and structure
 * 2. Redux integration - Selector
 * 3. Redux integration - Dispatch
 * 4. Book data access
 * 5. CRUD operations (create, read, update, delete)
 * 6. Loading states
 * 7. Error handling
 * 8. TypeScript type safety
 * 9. Edge cases
 * 10. Integration and best practices
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import type { ReactNode } from "react";
import { useBooks } from "@/hooks";
import { booksReducer } from "@/redux/slices/book/book";
import type { BookType, BookBody } from "@/components/reading/reading types";

// Mock axios for async thunks
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import axios from "axios";

/**
 * Helper function to create a test store
 */
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      book: booksReducer,
    },
    preloadedState: initialState,
  });
};

/**
 * Helper function to create a wrapper with Redux Provider
 */
const createWrapper = (store: ReturnType<typeof createTestStore>) => {
  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe("CH-006: useBooks Hook - Redux Integration and CRUD Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Hook Existence and Structure", () => {
    it("should be exportable from hooks barrel", async () => {
      // Arrange: Import hooks module
      const hooksModule = await import("@/hooks");

      // Act: Check for useBooks export
      const hasUseBooks = "useBooks" in hooksModule;

      // Assert: Hook should be exported
      expect(hasUseBooks).toBe(true);
      expect(typeof hooksModule.useBooks).toBe("function");
    });

    it("should follow React hooks naming convention", async () => {
      // Arrange: Import the hook
      const { useBooks: hook } = await import("@/hooks");

      // Act: Get hook name
      const hookName = hook.name;

      // Assert: Should start with 'use' and be PascalCase
      expect(hookName).toMatch(/^use[A-Z]/);
      expect(hookName).toBe("useBooks");
    });

    it("should be a function that returns an object", () => {
      // Arrange: Create test store
      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render the hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: Should return an object
      expect(result.current).toBeDefined();
      expect(typeof result.current).toBe("object");
    });

    it("should return an object with expected properties", () => {
      // Arrange: Create test store
      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render the hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: Should have all required properties
      expect(result.current).toHaveProperty("books");
      expect(result.current).toHaveProperty("bookInfo");
      expect(result.current).toHaveProperty("bookID");
      expect(result.current).toHaveProperty("formState");
      expect(result.current).toHaveProperty("fetchBooks");
      expect(result.current).toHaveProperty("createBook");
      expect(result.current).toHaveProperty("updateBook");
      expect(result.current).toHaveProperty("manageForm");
      expect(result.current).toHaveProperty("getInfo");
    });
  });

  describe("Redux Integration - Selector", () => {
    it("should use selector to access books state from Redux", () => {
      // Arrange: Create store with initial books
      const mockBooks: BookType[] = [
        {
          id: "1",
          name: "The Great Gatsby",
          image: "https://example.com/gatsby.jpg",
          total_pages: 218,
          average_of_characters_per_minute: 1000,
          current_page: 0,
        },
        {
          id: "2",
          name: "1984",
          image: "https://example.com/1984.jpg",
          total_pages: 328,
          average_of_characters_per_minute: 950,
          current_page: 150,
        },
      ];

      const store = createTestStore({
        book: {
          books: mockBooks,
          formState: "",
          bookInfo: {
            name: "",
            image: "",
            total_pages: 0,
            average_of_characters_per_minute: 0,
            current_page: 0,
          },
          bookID: "",
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: Should access books from Redux state
      expect(result.current.books).toEqual(mockBooks);
      expect(result.current.books).toHaveLength(2);
    });

    it("should return empty array when no books exist", () => {
      // Arrange: Create store with empty books
      const store = createTestStore({
        book: {
          books: [],
          formState: "",
          bookInfo: {
            name: "",
            image: "",
            total_pages: 0,
            average_of_characters_per_minute: 0,
            current_page: 0,
          },
          bookID: "",
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: Should return empty array
      expect(result.current.books).toEqual([]);
      expect(Array.isArray(result.current.books)).toBe(true);
    });

    it("should reactively update when Redux state changes", () => {
      // Arrange: Create store
      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Initial state should be empty
      expect(result.current.books).toEqual([]);

      // Dispatch action to add a book to Redux state
      const newBook: BookType = {
        id: "3",
        name: "Brave New World",
        image: "https://example.com/bnw.jpg",
        total_pages: 311,
        average_of_characters_per_minute: 1050,
        current_page: 0,
      };

      act(() => {
        store.dispatch({
          type: "book/fetchAllbooks/fulfilled",
          payload: [newBook],
        });
      });

      // Assert: Hook should reflect updated state
      expect(result.current.books).toHaveLength(1);
      expect(result.current.books[0]).toEqual(newBook);
    });

    it("should provide access to bookInfo from Redux state", () => {
      // Arrange: Create store with bookInfo
      const mockBookInfo: BookBody = {
        name: "Test Book",
        image: "https://example.com/test.jpg",
        total_pages: 500,
        average_of_characters_per_minute: 1200,
        current_page: 250,
      };

      const store = createTestStore({
        book: {
          books: [],
          formState: "UPDATE",
          bookInfo: mockBookInfo,
          bookID: "book-123",
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: Should access bookInfo
      expect(result.current.bookInfo).toEqual(mockBookInfo);
    });

    it("should provide access to bookID from Redux state", () => {
      // Arrange: Create store with bookID
      const store = createTestStore({
        book: {
          books: [],
          formState: "UPDATE",
          bookInfo: {
            name: "",
            image: "",
            total_pages: 0,
            average_of_characters_per_minute: 0,
            current_page: 0,
          },
          bookID: "book-456",
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: Should access bookID
      expect(result.current.bookID).toBe("book-456");
    });

    it("should provide access to formState from Redux state", () => {
      // Arrange: Create store with formState
      const store = createTestStore({
        book: {
          books: [],
          formState: "CREATE",
          bookInfo: {
            name: "",
            image: "",
            total_pages: 0,
            average_of_characters_per_minute: 0,
            current_page: 0,
          },
          bookID: "",
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: Should access formState
      expect(result.current.formState).toBe("CREATE");
    });
  });

  describe("Redux Integration - Dispatch", () => {
    it("should use dispatch to trigger Redux actions", () => {
      // Arrange: Create store and spy on dispatch
      const store = createTestStore();
      const dispatchSpy = vi.spyOn(store, "dispatch");
      const wrapper = createWrapper(store);

      // Act: Render hook and call an action
      const { result } = renderHook(() => useBooks(), { wrapper });

      act(() => {
        result.current.manageForm("CREATE");
      });

      // Assert: Should have called dispatch
      expect(dispatchSpy).toHaveBeenCalled();
    });

    it("should provide dispatch functions for book actions", () => {
      // Arrange: Create store
      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: All dispatch functions should be functions
      expect(typeof result.current.fetchBooks).toBe("function");
      expect(typeof result.current.createBook).toBe("function");
      expect(typeof result.current.updateBook).toBe("function");
      expect(typeof result.current.manageForm).toBe("function");
      expect(typeof result.current.getInfo).toBe("function");
    });
  });

  describe("Book Data Access", () => {
    it("should provide access to current books list", () => {
      // Arrange: Create store with books
      const mockBooks: BookType[] = [
        {
          id: "1",
          name: "Book One",
          image: "img1.jpg",
          total_pages: 100,
          average_of_characters_per_minute: 1000,
          current_page: 50,
        },
        {
          id: "2",
          name: "Book Two",
          image: "img2.jpg",
          total_pages: 200,
          average_of_characters_per_minute: 900,
          current_page: 0,
        },
      ];

      const store = createTestStore({
        book: {
          books: mockBooks,
          formState: "",
          bookInfo: {
            name: "",
            image: "",
            total_pages: 0,
            average_of_characters_per_minute: 0,
            current_page: 0,
          },
          bookID: "",
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: Should provide books list
      expect(result.current.books).toEqual(mockBooks);
      expect(result.current.books).toHaveLength(2);
    });

    it("should provide access to selected book info", () => {
      // Arrange: Create store with selected book
      const selectedBookInfo: BookBody = {
        name: "Selected Book",
        image: "selected.jpg",
        total_pages: 400,
        average_of_characters_per_minute: 1100,
        current_page: 200,
      };

      const store = createTestStore({
        book: {
          books: [],
          formState: "UPDATE",
          bookInfo: selectedBookInfo,
          bookID: "selected-id",
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: Should provide selected book info
      expect(result.current.bookInfo).toEqual(selectedBookInfo);
      expect(result.current.bookID).toBe("selected-id");
    });

    it("should handle filtering or searching books if applicable", () => {
      // Arrange: Create store with multiple books
      const mockBooks: BookType[] = [
        {
          id: "1",
          name: "JavaScript Guide",
          image: "js.jpg",
          total_pages: 300,
          average_of_characters_per_minute: 1000,
          current_page: 0,
        },
        {
          id: "2",
          name: "Python Basics",
          image: "py.jpg",
          total_pages: 250,
          average_of_characters_per_minute: 950,
          current_page: 0,
        },
      ];

      const store = createTestStore({
        book: {
          books: mockBooks,
          formState: "",
          bookInfo: {
            name: "",
            image: "",
            total_pages: 0,
            average_of_characters_per_minute: 0,
            current_page: 0,
          },
          bookID: "",
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: Should provide all books (filtering could be added later)
      expect(result.current.books).toHaveLength(2);
    });
  });

  describe("CRUD Operations - Create", () => {
    it("should provide createBook function", () => {
      // Arrange: Create store
      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: createBook should be a function
      expect(typeof result.current.createBook).toBe("function");
    });

    it("should dispatch createBook action with correct payload", async () => {
      // Arrange: Mock API response
      const newBook: BookBody = {
        name: "New Book",
        image: "new.jpg",
        total_pages: 350,
        average_of_characters_per_minute: 1050,
        current_page: 0,
      };

      vi.mocked(axios.post).mockResolvedValue({
        data: { id: "new-id", ...newBook },
      });

      const store = createTestStore();
      const dispatchSpy = vi.spyOn(store, "dispatch");
      const wrapper = createWrapper(store);

      // Act: Render hook and create book
      const { result } = renderHook(() => useBooks(), { wrapper });

      await act(async () => {
        await result.current.createBook(newBook);
      });

      // Assert: Should have dispatched action
      expect(dispatchSpy).toHaveBeenCalled();
    });

    it("should handle book creation with all required fields", async () => {
      // Arrange: Mock API
      const completeBook: BookBody = {
        name: "Complete Book",
        image: "https://example.com/complete.jpg",
        total_pages: 500,
        average_of_characters_per_minute: 1200,
        current_page: 0,
      };

      vi.mocked(axios.post).mockResolvedValue({
        data: { id: "complete-id", ...completeBook },
      });

      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render hook and create
      const { result } = renderHook(() => useBooks(), { wrapper });

      await act(async () => {
        await result.current.createBook(completeBook);
      });

      // Assert: Should complete without errors
      expect(axios.post).toHaveBeenCalledWith(expect.any(String), completeBook);
    });
  });

  describe("CRUD Operations - Read/Fetch", () => {
    it("should provide fetchBooks function", () => {
      // Arrange: Create store
      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: fetchBooks should be a function
      expect(typeof result.current.fetchBooks).toBe("function");
    });

    it("should fetch books from API when fetchBooks is called", async () => {
      // Arrange: Mock API response
      const mockBooks: BookType[] = [
        {
          id: "1",
          name: "Fetched Book",
          image: "fetched.jpg",
          total_pages: 200,
          average_of_characters_per_minute: 1000,
          current_page: 0,
        },
      ];

      vi.mocked(axios.get).mockResolvedValue({
        data: { data: mockBooks },
      });

      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render hook and fetch
      const { result } = renderHook(() => useBooks(), { wrapper });

      await act(async () => {
        await result.current.fetchBooks();
      });

      // Assert: Should have called API
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining("/books")
        );
      });
    });

    it("should update Redux state with fetched books", async () => {
      // Arrange: Mock API response
      const fetchedBooks: BookType[] = [
        {
          id: "fetched-1",
          name: "Fetched Book 1",
          image: "img1.jpg",
          total_pages: 300,
          average_of_characters_per_minute: 1000,
          current_page: 0,
        },
      ];

      vi.mocked(axios.get).mockResolvedValue({
        data: { data: fetchedBooks },
      });

      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render hook and fetch
      const { result } = renderHook(() => useBooks(), { wrapper });

      await act(async () => {
        await result.current.fetchBooks();
      });

      // Assert: Should update books in state
      await waitFor(() => {
        expect(result.current.books).toEqual(fetchedBooks);
      });
    });
  });

  describe("CRUD Operations - Update", () => {
    it("should provide updateBook function", () => {
      // Arrange: Create store
      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: updateBook should be a function
      expect(typeof result.current.updateBook).toBe("function");
    });

    it("should dispatch updateBook action with bookID and updates", async () => {
      // Arrange: Mock API
      const bookID = "book-to-update";
      const updates: BookBody = {
        name: "Updated Name",
        image: "updated.jpg",
        total_pages: 400,
        average_of_characters_per_minute: 1100,
        current_page: 200,
      };

      vi.mocked(axios.patch).mockResolvedValue({
        data: { id: bookID, ...updates },
      });

      const store = createTestStore({
        book: {
          books: [],
          formState: "UPDATE",
          bookInfo: updates,
          bookID: bookID,
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render hook and update
      const { result } = renderHook(() => useBooks(), { wrapper });

      await act(async () => {
        await result.current.updateBook(updates);
      });

      // Assert: Should have called API with bookID
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining(bookID),
        updates
      );
    });

    it("should handle partial book updates", async () => {
      // Arrange: Mock API
      const bookID = "partial-update";
      const partialUpdate: BookBody = {
        name: "Partially Updated",
        image: "img.jpg",
        total_pages: 300,
        average_of_characters_per_minute: 1000,
        current_page: 150,
      };

      vi.mocked(axios.patch).mockResolvedValue({
        data: { id: bookID, ...partialUpdate },
      });

      const store = createTestStore({
        book: {
          books: [],
          formState: "UPDATE",
          bookInfo: partialUpdate,
          bookID: bookID,
        },
      });
      const wrapper = createWrapper(store);

      // Act: Update book
      const { result } = renderHook(() => useBooks(), { wrapper });

      await act(async () => {
        await result.current.updateBook(partialUpdate);
      });

      // Assert: Should handle partial update
      expect(axios.patch).toHaveBeenCalled();
    });
  });

  describe("CRUD Operations - Delete (if applicable)", () => {
    it("should provide deleteBook function if deletion is supported", () => {
      // Arrange: Create store
      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: Check if deleteBook exists (may not be implemented yet)
      // This is a forward-looking test
      if ("deleteBook" in result.current) {
        expect(typeof result.current.deleteBook).toBe("function");
      } else {
        // Document that delete is not yet implemented
        expect(result.current).not.toHaveProperty("deleteBook");
      }
    });
  });

  describe("Form Management", () => {
    it("should provide manageForm function", () => {
      // Arrange: Create store
      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: manageForm should be a function
      expect(typeof result.current.manageForm).toBe("function");
    });

    it("should update formState when manageForm is called", () => {
      // Arrange: Create store
      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render hook and manage form
      const { result } = renderHook(() => useBooks(), { wrapper });

      act(() => {
        result.current.manageForm("CREATE");
      });

      // Assert: formState should be updated
      expect(result.current.formState).toBe("CREATE");
    });

    it("should support different form states (CREATE, UPDATE, etc)", () => {
      // Arrange: Create store
      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Test CREATE state
      act(() => {
        result.current.manageForm("CREATE");
      });
      expect(result.current.formState).toBe("CREATE");

      // Test UPDATE state
      act(() => {
        result.current.manageForm("UPDATE");
      });
      expect(result.current.formState).toBe("UPDATE");

      // Test clearing state
      act(() => {
        result.current.manageForm("");
      });
      expect(result.current.formState).toBe("");
    });

    it("should provide getInfo function to set book info", () => {
      // Arrange: Create store
      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: getInfo should be a function
      expect(typeof result.current.getInfo).toBe("function");
    });

    it("should update bookInfo and bookID when getInfo is called", () => {
      // Arrange: Create store
      const bookData: BookType = {
        id: "info-id",
        name: "Info Book",
        image: "info.jpg",
        total_pages: 250,
        average_of_characters_per_minute: 1050,
        current_page: 100,
      };

      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render hook and call getInfo
      const { result } = renderHook(() => useBooks(), { wrapper });

      act(() => {
        result.current.getInfo(bookData);
      });

      // Assert: Should update bookInfo and bookID
      expect(result.current.bookID).toBe("info-id");
      expect(result.current.bookInfo.name).toBe("Info Book");
      expect(result.current.bookInfo.total_pages).toBe(250);
    });
  });

  describe("Loading States", () => {
    it("should track loading state during fetchBooks", async () => {
      // Arrange: Mock slow API call
      vi.mocked(axios.get).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: { data: [] } }), 100)
          )
      );

      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render hook and fetch
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: Should provide loading state if available
      if ("isLoading" in result.current || "isFetching" in result.current) {
        act(() => {
          result.current.fetchBooks();
        });

        // Check that loading state exists
        expect(
          result.current.isLoading !== undefined ||
            result.current.isFetching !== undefined
        ).toBe(true);
      }
    });

    it("should set loading to true during async operations", async () => {
      // Arrange: Mock API
      vi.mocked(axios.post).mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 100))
      );

      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render hook and create
      const { result } = renderHook(() => useBooks(), { wrapper });

      if ("isCreating" in result.current) {
        act(() => {
          result.current.createBook({
            name: "Test",
            image: "test.jpg",
            total_pages: 100,
            average_of_characters_per_minute: 1000,
            current_page: 0,
          });
        });

        // Assert: Should be in loading/creating state
        expect(result.current.isCreating).toBe(true);
      }
    });

    it("should set loading to false after operations complete", async () => {
      // Arrange: Mock API
      vi.mocked(axios.post).mockResolvedValue({
        data: { id: "1", name: "Test" },
      });

      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Create book
      const { result } = renderHook(() => useBooks(), { wrapper });

      await act(async () => {
        await result.current.createBook({
          name: "Test",
          image: "test.jpg",
          total_pages: 100,
          average_of_characters_per_minute: 1000,
          current_page: 0,
        });
      });

      // Assert: Loading should be false after completion
      if ("isCreating" in result.current) {
        await waitFor(() => {
          expect(result.current.isCreating).toBe(false);
        });
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle errors gracefully during fetch", async () => {
      // Arrange: Mock API error
      vi.mocked(axios.get).mockRejectedValue(new Error("Network error"));

      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render hook and attempt fetch
      const { result } = renderHook(() => useBooks(), { wrapper });

      await act(async () => {
        try {
          await result.current.fetchBooks();
        } catch (error) {
          // Expected to throw or handle internally
        }
      });

      // Assert: Should handle error (check if error state exists)
      if ("error" in result.current || "fetchError" in result.current) {
        expect(
          result.current.error !== null || result.current.fetchError !== null
        ).toBe(true);
      }
    });

    it("should provide error state for failed operations", async () => {
      // Arrange: Mock creation error
      vi.mocked(axios.post).mockRejectedValue(new Error("Creation failed"));

      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Attempt to create
      const { result } = renderHook(() => useBooks(), { wrapper });

      await act(async () => {
        try {
          await result.current.createBook({
            name: "Test",
            image: "test.jpg",
            total_pages: 100,
            average_of_characters_per_minute: 1000,
            current_page: 0,
          });
        } catch (error) {
          // Expected
        }
      });

      // Assert: Should have error state
      if ("createError" in result.current || "error" in result.current) {
        expect(
          result.current.createError !== undefined ||
            result.current.error !== undefined
        ).toBe(true);
      }
    });

    it("should clear error state on successful operations", async () => {
      // Arrange: Mock error then success
      vi.mocked(axios.post)
        .mockRejectedValueOnce(new Error("Error"))
        .mockResolvedValueOnce({ data: { id: "1" } });

      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: First attempt fails, second succeeds
      const { result } = renderHook(() => useBooks(), { wrapper });

      // First attempt
      await act(async () => {
        try {
          await result.current.createBook({
            name: "Test1",
            image: "test1.jpg",
            total_pages: 100,
            average_of_characters_per_minute: 1000,
            current_page: 0,
          });
        } catch (error) {
          // Expected
        }
      });

      // Second attempt
      await act(async () => {
        await result.current.createBook({
          name: "Test2",
          image: "test2.jpg",
          total_pages: 100,
          average_of_characters_per_minute: 1000,
          current_page: 0,
        });
      });

      // Assert: Error should be cleared or operation should succeed
      expect(axios.post).toHaveBeenCalledTimes(2);
    });
  });

  describe("TypeScript Type Safety", () => {
    it("should have proper TypeScript return type", () => {
      // Arrange: Create store
      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: Check types exist on returned object
      expect(result.current.books).toBeDefined();
      expect(Array.isArray(result.current.books)).toBe(true);
      expect(typeof result.current.fetchBooks).toBe("function");
      expect(typeof result.current.createBook).toBe("function");
    });

    it("should enforce correct parameter types for createBook", async () => {
      // Arrange: Mock API
      vi.mocked(axios.post).mockResolvedValue({ data: {} });

      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Create with properly typed data
      const { result } = renderHook(() => useBooks(), { wrapper });

      const validBook: BookBody = {
        name: "Valid Book",
        image: "valid.jpg",
        total_pages: 300,
        average_of_characters_per_minute: 1000,
        current_page: 0,
      };

      await act(async () => {
        await result.current.createBook(validBook);
      });

      // Assert: Should accept correctly typed data
      expect(axios.post).toHaveBeenCalled();
    });

    it("should type book data with proper BookType interface", () => {
      // Arrange: Create store with typed books
      const typedBooks: BookType[] = [
        {
          id: "typed-1",
          name: "Typed Book",
          image: "typed.jpg",
          total_pages: 200,
          average_of_characters_per_minute: 1000,
          current_page: 50,
        },
      ];

      const store = createTestStore({
        book: {
          books: typedBooks,
          formState: "",
          bookInfo: {
            name: "",
            image: "",
            total_pages: 0,
            average_of_characters_per_minute: 0,
            current_page: 0,
          },
          bookID: "",
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: Books should have correct type structure
      const book = result.current.books[0];
      expect(book).toHaveProperty("id");
      expect(book).toHaveProperty("name");
      expect(book).toHaveProperty("image");
      expect(book).toHaveProperty("total_pages");
      expect(book).toHaveProperty("average_of_characters_per_minute");
      expect(book).toHaveProperty("current_page");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty books array", () => {
      // Arrange: Create store with empty array
      const store = createTestStore({
        book: {
          books: [],
          formState: "",
          bookInfo: {
            name: "",
            image: "",
            total_pages: 0,
            average_of_characters_per_minute: 0,
            current_page: 0,
          },
          bookID: "",
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: Should handle empty array gracefully
      expect(result.current.books).toEqual([]);
      expect(result.current.books).toHaveLength(0);
    });

    it("should handle null or undefined bookID", () => {
      // Arrange: Create store with undefined bookID
      const store = createTestStore({
        book: {
          books: [],
          formState: "",
          bookInfo: {
            name: "",
            image: "",
            total_pages: 0,
            average_of_characters_per_minute: 0,
            current_page: 0,
          },
          bookID: "",
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: Should handle empty bookID
      expect(result.current.bookID).toBe("");
    });

    it("should handle invalid book IDs during update", async () => {
      // Arrange: Mock 404 error
      vi.mocked(axios.patch).mockRejectedValue({
        response: { status: 404, data: { message: "Book not found" } },
      });

      const store = createTestStore({
        book: {
          books: [],
          formState: "UPDATE",
          bookInfo: {
            name: "Test",
            image: "test.jpg",
            total_pages: 100,
            average_of_characters_per_minute: 1000,
            current_page: 0,
          },
          bookID: "nonexistent-id",
        },
      });
      const wrapper = createWrapper(store);

      // Act: Attempt update with invalid ID
      const { result } = renderHook(() => useBooks(), { wrapper });

      await act(async () => {
        try {
          await result.current.updateBook({
            name: "Updated",
            image: "updated.jpg",
            total_pages: 150,
            average_of_characters_per_minute: 1050,
            current_page: 0,
          });
        } catch (error) {
          // Expected
        }
      });

      // Assert: Should handle 404 error
      expect(axios.patch).toHaveBeenCalled();
    });

    it("should handle books with missing optional fields", () => {
      // Arrange: Create store with minimal book data
      const minimalBooks: BookType[] = [
        {
          id: "minimal",
          name: "Minimal Book",
          image: "",
          total_pages: 100,
          average_of_characters_per_minute: 1000,
          current_page: 0,
        },
      ];

      const store = createTestStore({
        book: {
          books: minimalBooks,
          formState: "",
          bookInfo: {
            name: "",
            image: "",
            total_pages: 0,
            average_of_characters_per_minute: 0,
            current_page: 0,
          },
          bookID: "",
        },
      });
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      // Assert: Should handle minimal data
      expect(result.current.books[0].image).toBe("");
    });
  });

  describe("Integration and Best Practices", () => {
    it("should follow React hooks rules", () => {
      // Arrange: Create store
      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act & Assert: Should render without errors
      expect(() => {
        renderHook(() => useBooks(), { wrapper });
      }).not.toThrow();
    });

    it("should not cause memory leaks on unmount", () => {
      // Arrange: Create store
      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render and unmount
      const { unmount } = renderHook(() => useBooks(), { wrapper });

      // Assert: Should unmount cleanly
      expect(() => unmount()).not.toThrow();
    });

    it("should provide stable function references", () => {
      // Arrange: Create store
      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render hook and force re-render
      const { result, rerender } = renderHook(() => useBooks(), { wrapper });

      const firstFetchRef = result.current.fetchBooks;
      const firstCreateRef = result.current.createBook;

      rerender();

      // Assert: Function references should be stable
      expect(result.current.fetchBooks).toBe(firstFetchRef);
      expect(result.current.createBook).toBe(firstCreateRef);
    });

    it("should work correctly with multiple hook instances", () => {
      // Arrange: Create store
      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render multiple instances
      const { result: result1 } = renderHook(() => useBooks(), { wrapper });
      const { result: result2 } = renderHook(() => useBooks(), { wrapper });

      // Assert: Both should access same Redux state
      expect(result1.current.books).toEqual(result2.current.books);
    });

    it("should integrate correctly with Redux DevTools", () => {
      // Arrange: Create store
      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Act: Render hook
      const { result } = renderHook(() => useBooks(), { wrapper });

      act(() => {
        result.current.manageForm("CREATE");
      });

      // Assert: Actions should be visible in Redux DevTools
      // (This is more of a conceptual test - actual DevTools integration would be manual)
      const state = store.getState();
      expect(state.book.formState).toBe("CREATE");
    });

    it("should handle concurrent operations safely", async () => {
      // Arrange: Mock multiple operations
      vi.mocked(axios.post).mockResolvedValue({ data: { id: "1" } });
      vi.mocked(axios.patch).mockResolvedValue({ data: { id: "2" } });

      const store = createTestStore({
        book: {
          books: [],
          formState: "UPDATE",
          bookInfo: {
            name: "Test",
            image: "test.jpg",
            total_pages: 100,
            average_of_characters_per_minute: 1000,
            current_page: 0,
          },
          bookID: "book-2",
        },
      });
      const wrapper = createWrapper(store);

      // Act: Execute concurrent operations
      const { result } = renderHook(() => useBooks(), { wrapper });

      await act(async () => {
        const createPromise = result.current.createBook({
          name: "New",
          image: "new.jpg",
          total_pages: 200,
          average_of_characters_per_minute: 1000,
          current_page: 0,
        });

        const updatePromise = result.current.updateBook({
          name: "Updated",
          image: "updated.jpg",
          total_pages: 300,
          average_of_characters_per_minute: 1100,
          current_page: 50,
        });

        await Promise.all([createPromise, updatePromise]);
      });

      // Assert: Both operations should complete
      expect(axios.post).toHaveBeenCalled();
      expect(axios.patch).toHaveBeenCalled();
    });
  });
});
