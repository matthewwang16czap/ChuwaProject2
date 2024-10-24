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
  middleName?: string;
  preferredName?: string;
  ssn: string;
  dateOfBirth: Date | null;
  gender: "Male" | "Female" | "Other";
  citizenship?: "GreenCard" | "Citizen" | "WorkAuthorization";
  address?: {
    building: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  contactInfo?: {
    cellPhone: string;
    workPhone?: string;
  };
  employment?: {
    visaType: string;
    visaTitle: string;
    startDate: Date;
    endDate?: Date | null;
  };
  emergencyContact?: {
    firstName: string;
    lastName: string;
    middleName?: string;
    phone: string;
    email: string;
    relationship: string;
  };
  documents?: {
    profilePictureUrl?: string;
    driverLicenseUrl?: string;
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

export const updateEmployeeThunk = createAsyncThunk<
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
      return rejectWithValue(err.response.data.message);
    }
    return rejectWithValue("Unknown error");
  }
});

export const getMyProfileThunk = createAsyncThunk<
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
      return rejectWithValue(err.response.data.message);
    }
    return rejectWithValue("Unknown error");
  }
});

export const getAllEmployeesThunk = createAsyncThunk<
  { message: string; allEmployees: Employee[] },
  void,
  { rejectValue: string }
>("employee/getAllEmployees", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<{
      message: string;
      allEmployees: Employee[];
    }>(`${API_URL}/all`);
    return response.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError && err.response) {
      return rejectWithValue(err.response.data.message);
    }
    return rejectWithValue("Unknown error");
  }
});

export const getEmployeeThunk = createAsyncThunk<
  { message: string; employee: Employee },
  string, // employeeId
  { rejectValue: string }
>("employee/getEmployee", async (employeeId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<{
      message: string;
      employee: Employee;
    }>(`${API_URL}/${employeeId}`);
    return response.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError && err.response) {
      return rejectWithValue(err.response.data.message);
    }
    return rejectWithValue("Unknown error");
  }
});

export const searchEmployeesByNameThunk = createAsyncThunk<
  { message: string; employees: Employee[] },
  Partial<{ firstName: string; lastName: string; preferredName: string }>,
  { rejectValue: string }
>("employee/searchEmployeesByName", async (searchParams, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post<{
      message: string;
      employees: Employee[];
    }>(`${API_URL}/searchbyname`, searchParams);
    return response.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError && err.response) {
      return rejectWithValue(err.response.data.message);
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
    builder.addCase(updateEmployeeThunk.pending, (state) => {
      state.status = "loading";
      state.action = "updateEmployee";
    });
    builder.addCase(updateEmployeeThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.message = action.payload.message;
      state.employee = action.payload.updatedEmployee;
      state.error = null;
    });
    builder.addCase(updateEmployeeThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Update failed";
    });

    // Get My Profile
    builder.addCase(getMyProfileThunk.pending, (state) => {
      state.status = "loading";
      state.action = "getMyProfile";
    });   
    builder.addCase(getMyProfileThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.employee = action.payload.employee;
      state.message = action.payload.message;
      state.error = null;
    });  
    builder.addCase(getMyProfileThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Failed to fetch profile";
    });

    // Get All Employees
    builder.addCase(getAllEmployeesThunk.pending, (state) => {
      state.status = "loading";
      state.action = "getAllEmployees";
    });
    builder.addCase(getAllEmployeesThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.employees = action.payload.allEmployees;
      state.message = action.payload.message;
      state.error = null;
    });
    builder.addCase(getAllEmployeesThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Failed to fetch employees";
    });

    // Get Employee by ID
    builder.addCase(getEmployeeThunk.pending, (state) => {
      state.status = "loading";
      state.action = "getEmployee";
    });
    builder.addCase(getEmployeeThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.employee = action.payload.employee;
      state.message = action.payload.message;
      state.error = null;
    });
    builder.addCase(getEmployeeThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Failed to fetch employee";
    });

    // Search Employees
    builder.addCase(searchEmployeesByNameThunk.pending, (state) => {
      state.status = "loading";
      state.action = "searchEmployeesByName";
    });
    builder.addCase(searchEmployeesByNameThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.employees = action.payload.employees;
      state.message = action.payload.message;
      state.error = null;
    });
    builder.addCase(searchEmployeesByNameThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Failed to search employees";
    });
  },
});

export default employeeSlice.reducer;
