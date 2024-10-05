import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';

// Define types for the slice's state
interface RegistrationState {
  invitationStatus: 'idle' | 'loading' | 'succeeded' | 'failed' | null;
  registrationStatus: 'idle' | 'loading' | 'succeeded' | 'failed' | null;
  error: string | null;
}

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

// Initial state
const initialState: RegistrationState = {
  invitationStatus: null,
  registrationStatus: null,
  error: null,
};

// AsyncThunk to send an invitation
export const sendInvitation = createAsyncThunk<
  void,                    // Return type
  InvitationPayload,        // Argument type
  { rejectValue: string }   // Reject value type
>(
  'registration/sendInvitation',
  async (invitationData, { rejectWithValue }) => {
    try {
      await axios.post('/api/registration/sendinvitation', invitationData);
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        return rejectWithValue(err.response.data);
      }
      return rejectWithValue('Unknown error occurred');
    }
  }
);

// AsyncThunk to register a user
export const register = createAsyncThunk<
  void,                    // Return type
  RegistrationPayload,      // Argument type
  { rejectValue: string }   // Reject value type
>(
  'registration/register',
  async (registrationData, { rejectWithValue }) => {
    try {
      await axios.post('/api/registration/register', registrationData);
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        return rejectWithValue(err.response.data);
      }
      return rejectWithValue('Unknown error occurred');
    }
  }
);

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.invitationStatus = null;
      state.registrationStatus = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendInvitation.pending, (state) => {
        state.invitationStatus = 'loading';
      })
      .addCase(sendInvitation.fulfilled, (state) => {
        state.invitationStatus = 'succeeded';
      })
      .addCase(sendInvitation.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.invitationStatus = 'failed';
        state.error = action.payload ?? 'Unknown error';
      })
      .addCase(register.pending, (state) => {
        state.registrationStatus = 'loading';
      })
      .addCase(register.fulfilled, (state) => {
        state.registrationStatus = 'succeeded';
      })
      .addCase(register.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.registrationStatus = 'failed';
        state.error = action.payload ?? 'Unknown error';
      });
  },
});

export const { resetStatus } = registrationSlice.actions;
export default registrationSlice.reducer;
