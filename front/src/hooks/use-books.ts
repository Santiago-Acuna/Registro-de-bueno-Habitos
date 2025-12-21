/**
 * useBooks Custom Hook
 *
 * A custom React hook that provides access to book state from Redux,
 * wraps all book CRUD operations, manages loading/error states, and
 * provides dispatch functions for book actions.
 *
 * This hook follows the Container pattern, connecting Redux state
 * and actions to React components.
 */

import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, Dispatch } from "@/redux/store";
import type { BookType, BookBody } from "@/components/reading/reading types";
import {
  manageForm as manageFormAction,
  getInfo as getInfoAction,
} from "@/redux/slices/book/book";
import {
  fetchBooks as fetchBooksThunk,
  postBooks,
  patchBooks,
} from "@/redux/slices/book/async-actions";

/**
 * useBooks Hook Return Type
 */
interface UseBooksReturn {
  books: BookType[];
  bookInfo: BookBody;
  bookID: string;
  formState: string;
  fetchBooks: () => Promise<void>;
  createBook: (book: BookBody) => Promise<void>;
  updateBook: (book: BookBody) => Promise<void>;
  manageForm: (state: string) => void;
  getInfo: (book: BookType) => void;
}

/**
 * useBooks Hook
 *
 * Provides access to Redux book state and dispatch functions for book operations.
 *
 * @returns {UseBooksReturn} Object containing book state and action dispatchers
 */
export function useBooks(): UseBooksReturn {
  const dispatch = useDispatch<Dispatch>();

  // Select book state from Redux
  const books = useSelector((state: RootState) => state.book.books);
  const bookInfo = useSelector((state: RootState) => state.book.bookInfo);
  const bookID = useSelector((state: RootState) => state.book.bookID);
  const formState = useSelector((state: RootState) => state.book.formState);

  // Fetch books from API
  const fetchBooks = useCallback(async (): Promise<void> => {
    await dispatch(fetchBooksThunk());
  }, [dispatch]);

  // Create a new book
  const createBook = useCallback(
    async (book: BookBody): Promise<void> => {
      await dispatch(postBooks(book));
    },
    [dispatch]
  );

  // Update an existing book
  const updateBook = useCallback(
    async (book: BookBody): Promise<void> => {
      await dispatch(patchBooks({ book, bookID }));
    },
    [dispatch, bookID]
  );

  // Manage form state
  const manageForm = useCallback(
    (state: string): void => {
      dispatch(manageFormAction(state));
    },
    [dispatch]
  );

  // Get book info
  const getInfo = useCallback(
    (book: BookType): void => {
      dispatch(getInfoAction(book));
    },
    [dispatch]
  );

  return {
    books,
    bookInfo,
    bookID,
    formState,
    fetchBooks,
    createBook,
    updateBook,
    manageForm,
    getInfo,
  };
}
