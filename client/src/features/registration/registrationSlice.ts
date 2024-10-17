import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import axiosInstance from "../../api/axiosInstance";

const API_URL = "/api/registration";

// Updated payload interfaces
interface InvitationPayload {
  email: string;
}

interface RegistrationPayload {
  email: string;
  username: string;
  password: string;
  token: string;
}

interface RegistrationHistoryPayload {
  registrationId?: string;
  email?: string;
}
interface RegistrationHistoryDocument {
  token: string;
  createdAt: string;
  expireAt: string;
}

interface RegistrationHistoryResponse {
  message: string;
  registrationHistory: RegistrationHistoryDocument[];
}

// Define types for the slice's state
interface RegistrationState {
  invitationStatus: "loading" | "succeeded" | "failed" | null;
  registrationStatus: "loading" | "succeeded" | "failed" | null;
  registrationHistoryStatus: "loading" | "succeeded" | "failed" | null;
  registrationHistory: RegistrationHistoryDocument[] | null;
  error: string | null;
}

// Initial state
const initialState: RegistrationState = {
  invitationStatus: null,
  registrationStatus: null,
  registrationHistoryStatus: null,
  registrationHistory: null,
  error: null,
};

// AsyncThunk to send an invitation
export const sendInvitation = createAsyncThunk<
  void,
  InvitationPayload,
  { rejectValue: string }
>(
  "registration/sendInvitation",
  async (invitationData, { rejectWithValue }) => {
    try {
      await axiosInstance.post(`${API_URL}/sendinvitation`, invitationData);
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        const errorData = err.response.data;
        const errorMessage =
          errorData.message || errorData.error || "Error sending invitation.";
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue("Unknown error occurred");
    }
  }
);

// AsyncThunk to register a user
export const register = createAsyncThunk<
  void,
  RegistrationPayload,
  { rejectValue: string }
>('registration/register', async (registrationData, { rejectWithValue }) => {
  try {
    await axiosInstance.post(`${API_URL}/register`, registrationData);
  } catch (err: unknown) {
    if (err instanceof AxiosError && err.response) {
      const errorData = err.response.data;
      const errorMessage = errorData.message || errorData.error || 'Error during registration.';
      return rejectWithValue(errorMessage);
    }
    return rejectWithValue('Unknown error occurred');
  }
});

export const getRegistrationHistory = createAsyncThunk<
  RegistrationHistoryResponse, // Return type
  RegistrationHistoryPayload, // Argument type
  { rejectValue: string } // Reject value type
>(
  "registration/getRegistrationHistory",
  async (RegistrationHistoryData, { rejectWithValue }) => {
    try {
      let response = null;

      if (RegistrationHistoryData.email) {
        response = await axiosInstance.post<RegistrationHistoryResponse>(
          `${API_URL}/`,
          RegistrationHistoryData
        );
      } else {
        response = await axiosInstance.get<RegistrationHistoryResponse>(
          `${API_URL}/${RegistrationHistoryData.registrationId}`
        );
      }

      return response.data; // Return the data from the response
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue("Unknown error occurred");
    }
  }
);

const registrationSlice = createSlice({
  name: "registration",
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.invitationStatus = null;
      state.registrationStatus = null;
      state.registrationHistoryStatus = null;
      state.registrationHistory = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendInvitation.pending, (state) => {
        state.invitationStatus = "loading";
      })
      .addCase(sendInvitation.fulfilled, (state) => {
        state.invitationStatus = "succeeded";
      })
      .addCase(
        sendInvitation.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.invitationStatus = "failed";
          state.error = action.payload as string ?? "Unknown error";
        }
      )
      .addCase(register.pending, (state) => {
        state.registrationStatus = "loading";
      })
      .addCase(register.fulfilled, (state) => {
        state.registrationStatus = "succeeded";
      })
      .addCase(
        register.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.registrationStatus = "failed";
          state.error = action.payload as string ?? "Unknown error";
        }
      )
      .addCase(getRegistrationHistory.pending, (state) => {
        state.registrationHistoryStatus = "loading";
      })
      .addCase(
        getRegistrationHistory.fulfilled,
        (state, action) => {
          state.registrationHistoryStatus = "succeeded";
          state.registrationHistory = action.payload.registrationHistory;
        }
      )
      .addCase(
        getRegistrationHistory.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.registrationHistoryStatus = "failed";
          state.error = action.payload as string ?? "Unknown error";
        }
      );
  },
});

export const { resetStatus } = registrationSlice.actions;
export default registrationSlice.reducer;
