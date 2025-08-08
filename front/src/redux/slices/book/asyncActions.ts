import { type State } from "./book";
import { BookType, BookBody } from "../../../components/reading/reading types";
import {
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk
} from "@reduxjs/toolkit";
import axios from "axios";


const fetchBooks = createAsyncThunk("book/fetchAllbooks", async () => {
  let bookData: BookType[] = [];
  const fetch = async (): Promise<void> => {
    const maxRetries = 10;
    let retryCount = 0;

    const fetchData = async (): Promise<boolean> => {
      const response = await axios.get("http://localhost:5000/books/");
      const bookDataIsThere: BookType[] = response.data;
      console.log(bookDataIsThere)

      if (bookDataIsThere.length !== 0) {
        bookData = bookDataIsThere;
        return true;
      }
      return false;
    };

    const delay = async (ms: number): Promise<void> => {
      await new Promise((resolve) => setTimeout(resolve, ms));
    };

    while (retryCount < maxRetries) {
      const dataReceived = await fetchData();
      console.log("not recived")
      if (dataReceived) {
        break; // Exit the loop if data is received
      }

      await delay(5000); // Introduce a delay between iterations
      retryCount++;
    }
  };

  await fetch();
  return bookData;
});

const postBooks = createAsyncThunk(
  "book/postbooks",

  async (book: BookBody) => {
    console.log("post dispached");
    try {
      const response = await axios.post("http://localhost:5000/books/", book);
      console.log(response.data);
      return response.data;
    } catch (e) {
      console.log(e);
    }
  }
);

const patchBooks = createAsyncThunk(
  "book/patchbooks",

  async (payload: { book: BookBody; bookID: string }) => {
    const { book, bookID } = payload;
    try {
      const response = await axios.patch(`http://localhost:5000/books/${bookID}`, book);
      console.log(response.data);
      return response.data;
    } catch (e) {
      console.log(e);
    }
  }
);

const asyncActions = (builder: ActionReducerMapBuilder<State>): void => {
  builder
    .addCase(fetchBooks.fulfilled, (state, action: PayloadAction<BookType[] | []>) => {
      if (action.payload !== undefined && action.payload !== null) {
        state.books = action.payload;
      }
    })
    .addCase(postBooks.fulfilled, () => {})
    .addCase(patchBooks.fulfilled, () => {});
};

export { fetchBooks, postBooks, patchBooks };

export default asyncActions;
