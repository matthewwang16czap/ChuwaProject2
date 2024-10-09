import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode to decode JWT tokens

const API_URL = "/api/user";

// Define the JWT payload interface
interface IPayload {
  role: string;
  employeeId?: string;
  applicationId?: string;
}

// Define state types
interface UserState {
  isAuthenticated: boolean;
  role: string | null;
  employeeId: string | null;
  applicationId: string | null;
  loginStatus: "idle" | "loading" | "succeeded" | "failed";
  passwordChangeStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Define payload interfaces
interface LoginPayload {
  username: string;
  password: string;
}

interface PasswordChangePayload {
  username: string;
  oldPassword: string;
  newPassword: string;
}

// Initial state
const initialState: UserState = {
  isAuthenticated: false,
  role: null,
  employeeId: null,
  applicationId: null,
  loginStatus: "idle",
  passwordChangeStatus: "idle",
  error: null,
};

// Utility function to decode JWT and extract user info
const decodeToken = (): IPayload | null => {
  const token = localStorage.getItem("jwtToken");
  if (token) {
    try {
      return jwtDecode<IPayload>(token);
    } catch (error) {
      console.error("Failed to decode token", error);
      return null;
    }
  }
  return null;
};

// AsyncThunk to handle user login
export const login = createAsyncThunk<
  void, // No return data needed since we decode directly from localStorage
  LoginPayload, // Argument type
  { rejectValue: string } // Rejection error type
>("user/login", async (loginData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/login`, loginData);
    const token = response.data.token;

    // Store the token in localStorage
    localStorage.setItem("jwtToken", token);
  } catch (err: unknown) {
    if (err instanceof AxiosError && err.response) {
      return rejectWithValue(err.response.data.message);
    }
    return rejectWithValue("Unknown error occurred during login.");
  }
});

// AsyncThunk to handle password change
export const changeUserPassword = createAsyncThunk<
  void, // Return type
  PasswordChangePayload, // Argument type
  { rejectValue: string } // Rejection error type
>("user/changePassword", async (passwordData, { rejectWithValue }) => {
  try {
    await axios.post(`${API_URL}/changepassword`, passwordData);
  } catch (err: unknown) {
    if (err instanceof AxiosError && err.response) {
      return rejectWithValue(err.response.data.message);
    }
    return rejectWithValue("Unknown error occurred during password change.");
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.role = null;
      state.employeeId = null;
      state.applicationId = null;

      // Remove the token from localStorage
      localStorage.removeItem("jwtToken");
    },
    checkAuth: (state) => {
      const decodedToken = decodeToken();
      if (decodedToken) {
        state.isAuthenticated = true;
        state.role = decodedToken.role;
        state.employeeId = decodedToken.employeeId || null;
        state.applicationId = decodedToken.applicationId || null;
      } else {
        state.isAuthenticated = false;
        state.role = null;
        state.employeeId = null;
        state.applicationId = null;
      }
    },
  },
  extraReducers: (builder) => {
    // Handle login actions
    builder
      .addCase(login.pending, (state) => {
        state.loginStatus = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state) => {
        // Upon successful login, check auth to decode and set user state
        const decodedToken = decodeToken();
        if (decodedToken) {
          state.isAuthenticated = true;
          state.role = decodedToken.role;
          state.employeeId = decodedToken.employeeId || null;
          state.applicationId = decodedToken.applicationId || null;
        }
        state.loginStatus = "succeeded";
      })
      .addCase(
        login.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loginStatus = "failed";
          state.error = action.payload ?? "Unknown error";
        }
      );

    // Handle password change actions
    builder
      .addCase(changeUserPassword.pending, (state) => {
        state.passwordChangeStatus = "loading";
        state.error = null;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.passwordChangeStatus = "succeeded";
      })
      .addCase(
        changeUserPassword.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.passwordChangeStatus = "failed";
          state.error = action.payload ?? "Unknown error";
        }
      );
  },
});

// Action exports
export const { logout, checkAuth } = userSlice.actions;

// Reducer export
export default userSlice.reducer;
