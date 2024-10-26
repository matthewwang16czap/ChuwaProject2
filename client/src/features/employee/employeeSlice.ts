import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import axiosInstance from "../../api/axiosInstance";

const API_URL = "/api/employee";

// Types for employee state
export interface Employee {
  userId: string;
  applicationId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  preferredName: string;
  ssn: string;
  dateOfBirth: Date | null;
  gender: "Male" | "Female" | "Other";
  citizenship: "GreenCard" | "Citizen" | "WorkAuthorization";
  address: {
    building: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  contactInfo: {
    cellPhone: string;
    workPhone: string;
  };
  employment: {
    visaType: string;
    visaTitle: string;
    startDate: Date;
    endDate: Date | null;
  };
  emergencyContact: {
    firstName: string;
    lastName: string;
    middleName: string;
    phone: string;
    email: string;
    relationship: string;
  };
  documents: {
    profilePictureUrl: string;
    driverLicenseUrl: string;
  };
}

interface EmployeeState {
  employee: Employee | null;
  employees: Employee[] | null;
  status: "loading" | "succeeded" | "failed" | null;
  action:
    | "updateEmployee"
    | "getMyProfile"
    | "getAllEmployees"
    | "getEmployee"
    | "searchEmployeesByName"
    | null;
  message: string | null;
  error: string | null;
}

export const updateEmployee = createAsyncThunk<
  { message: string; updatedEmployee: Employee },
  Record<string, unknown>,
  { rejectValue: string }
>("employee/updateEmployee", async (updateData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put<{
      message: string;
      updatedEmployee: Employee;
    }>(`${API_URL}/update`, updateData);
    return response.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError && err.response) {
      return rejectWithValue(err.response.data);
    }
    return rejectWithValue("Unknown error");
  }
});

export const getMyProfile = createAsyncThunk<
  { message: string; employee: Employee },
  void,
  { rejectValue: string }
>("employee/getMyProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<{
      message: string;
      employee: Employee;
    }>(`${API_URL}/myprofile`);
    return response.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError && err.response) {
      return rejectWithValue(err.response.data);
    }
    return rejectWithValue("Unknown error");
  }
});

const initialState: EmployeeState = {
  employee: null,
  employees: null,
  status: null,
  action: null,
  message: null,
  error: null,
};

const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Update Employee
    builder.addCase(updateEmployee.pending, (state) => {
      state.status = "loading";
      state.action = "updateEmployee";
    });
    builder.addCase(updateEmployee.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.message = action.payload.message;
      state.employee = action.payload.updatedEmployee;
      state.error = null;
    });
    builder.addCase(updateEmployee.rejected, (state, action) => {
      state.status = "failed";
      state.error = JSON.stringify(action.payload) || "Update failed";
    });

    // Get My Profile
    builder.addCase(getMyProfile.pending, (state) => {
      state.status = "loading";
      state.action = "getMyProfile";
    });
    builder.addCase(getMyProfile.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.employee = action.payload.employee;
      state.message = action.payload.message;
      state.error = null;
    });
    builder.addCase(getMyProfile.rejected, (state, action) => {
      state.status = "failed";
      state.error = JSON.stringify(action.payload) || "Failed to fetch profile";
    });
  },
});

export default employeeSlice.reducer;
