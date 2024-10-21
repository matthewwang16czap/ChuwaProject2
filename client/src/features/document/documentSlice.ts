// documentsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { AxiosError } from "axios";

// Define the state interface
interface DocumentState {
  document: Blob | null;
  status: "loading" | "succeeded" | "failed" | null;
  error: string | null;
}

// Initial state
const initialState: DocumentState = {
  document: null,
  status: null,
  error: null,
};

// Async thunk to fetch the document data
export const fetchDocument = createAsyncThunk<
  Blob,
  { userId: string; filename: string },
  { rejectValue: string }
>(
  "document/fetchDocument",
  async ({ userId, filename }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/documents/${userId}/${filename}`,
        {
          responseType: "blob", // Expect binary data (Blob)
        }
      );

      return response.data;
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue("Error fetching employee users.");
    }
  }
);

const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocument.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchDocument.fulfilled,
        (state, action: PayloadAction<Blob>) => {
          state.status = "succeeded";
          state.document = action.payload;
        }
      )
      .addCase(
        fetchDocument.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.status = "failed";
          state.error = (action.payload as string) ?? "Unknown error";
        }
      );
  },
});

export default documentSlice.reducer;
