import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { BookBody, BookType } from "../../../components/reading/reading types";
import asyncActions from "./asyncActions";
enum formType {
  CREATE = "CREATE",
  UPDATE = "UPDATE"
}

type formState = formType | string;

interface State {
  formState: formState;
  bookInfo: BookBody;
  bookID: string;
  books:BookType[]
}
const initialState: State = {
  formState: "",
  bookInfo: {
    name: "",
    image: "",
    total_pages: 0,
    average_of_characters_per_minute: 0,
    current_page: 0
  },
  bookID: "",
  books:[]
};
const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    manageForm: (state: State, action: PayloadAction<string>) => {
      state.formState = action.payload;
    },
    getInfo: (state: State, action: PayloadAction<BookType>) => {
      const { id, name, image, total_pages, average_of_characters_per_minute, current_page} = action.payload;
      state.bookID = id;
      state.bookInfo = { name, image, total_pages, average_of_characters_per_minute, current_page };
    },
  },
  extraReducers: (builder) => {
    asyncActions(builder);
  }
});

const booksReducer = booksSlice.reducer;

export const { manageForm, getInfo} = booksSlice.actions;

export { booksReducer, type State };
