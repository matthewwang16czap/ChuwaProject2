import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import axiosInstance from "../../api/axiosInstance";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode to decode JWT tokens
const API_URL = "/api/user";

// Define the JWT payload interface
interface IPayload {
  user: {
    userId: string | null | undefined;
    role: string;
    email: string;
    employeeId?: string | null | undefined;
    applicationId?: string | null | undefined;
  };
}

// Define state types
interface UserState {
  user: IPayload["user"] | null;
  loginStatus: "loading" | "succeeded" | "failed" | null;
  passwordChangeStatus: "loading" | "succeeded" | "failed" | null;
  employeeUsers: IUser[];
  employeeUsersStatus: "loading" | "succeeded" | "failed" | null;
  error: string | null;
}

// Define payload interfaces
interface LoginPayload {
  username: string;
  password: string;
}

interface PasswordChangePayload {
  oldPassword: string;
  newPassword: string;
}

// Define the user response type
interface IUser {
  _id: string;
  username: string;
  role: string;
  email: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    preferredName?: string;
    ssn?: string;
    dateOfBirth?: string;
    gender?: string;
    employment?: string;
    applicationId?: {
      workAuthorization?: {
        documents: {
          name: string;
          status: string;
        }[];
      };
      status: string;
    };
  };
  nextStep?: string;
}

// Initial state
const initialState: UserState = {
  user: null,
  loginStatus: null,
  passwordChangeStatus: null,
  employeeUsers: [],
  employeeUsersStatus: null,
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
    const response = await axiosInstance.post(`${API_URL}/login`, loginData);
    const token = response.data.token;
    // Store the token in localStorage
    localStorage.setItem("jwtToken", token);
    console.log(token);
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
    await axiosInstance.post(`${API_URL}/changepassword`, passwordData);
  } catch (err: unknown) {
    if (err instanceof AxiosError && err.response) {
      return rejectWithValue(err.response.data.message);
    }
    return rejectWithValue("Unknown error occurred during password change.");
  }
});

// Define the AsyncThunk for fetching all employee users
export const getAllEmployeeUsers = createAsyncThunk<
  IUser[], // Return type
  {
    name?: string;
    nextStep?: string;
  }, // Payload type (search parameters)
  { rejectValue: string } // Rejection error type
>("user/getAllEmployeeUsers", async (searchParams, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      `${API_URL}/allemployees`,
      searchParams
    );
    return response.data.users;
  } catch (err: unknown) {
    if (err instanceof AxiosError && err.response) {
      return rejectWithValue(err.response.data.message);
    }
    return rejectWithValue("Error fetching employee users.");
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.loginStatus = null;
      // Remove the token from localStorage
      localStorage.removeItem("jwtToken");
    },
    checkAuth: (state) => {
      const decodedToken = decodeToken();
      if (decodedToken) {
        state.user = decodedToken.user;
      } else {
        state.user = null;
      }
    },
    clearStatus: (state) => {
      state.loginStatus = null;
      state.passwordChangeStatus = null;
      state.employeeUsersStatus = null;
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
          state.user = decodedToken.user;
          state.loginStatus = "succeeded";
        } else {
          state.user = null;
          state.loginStatus = "failed";
          state.error = "Unknown error";
        }
      })
      .addCase(
        login.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loginStatus = "failed";
          state.error = (action.payload as string) ?? "Unknown error";
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
          state.error = (action.payload as string) ?? "Unknown error";
        }
      );

    // Handle getAllEmployeeUsers actions
    builder
      .addCase(getAllEmployeeUsers.pending, (state) => {
        state.employeeUsersStatus = "loading";
        state.error = null;
      })
      .addCase(
        getAllEmployeeUsers.fulfilled,
        (state, action: PayloadAction<IUser[]>) => {
          state.employeeUsersStatus = "succeeded";
          state.employeeUsers = action.payload;
        }
      )
      .addCase(
        getAllEmployeeUsers.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.employeeUsersStatus = "failed";
          state.error = action.payload ?? "Unknown error";
        }
      );
  },
});

// Action exports
export const { logout, checkAuth, clearStatus } = userSlice.actions;

// Reducer export
export default userSlice.reducer;
