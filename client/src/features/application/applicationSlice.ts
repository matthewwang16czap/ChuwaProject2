import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import axiosInstance from "../../api/axiosInstance";

const API_URL = "/api/application";

interface UploadFilePayload {
  file: File;
}

interface UploadFileResponse {
  message: string;
  filePath: string;
}

interface UpdateApplicationPayload {
  updateData: Record<string, unknown>; // Fields to be updated
}

interface UpdateApplicationResponse {
  message: string;
  updatedApplication: Record<string, unknown>;
}

interface SubmitApplicationResponse {
  message: string;
  application: Record<string, unknown>;
}

interface DecideApplicationPayload {
  applicationId: string;
  status: "Approved" | "Rejected";
  feedback?: string; // Required if status is "Rejected"
}

interface DecideApplicationResponse {
  message: string;
  application: Record<string, unknown>;
}

interface DecideDocumentPayload {
  applicationId: string;
  documentName: string;
  status: "Approved" | "Rejected";
  feedback?: string; // Required if status is "Rejected"
}

interface DecideDocumentResponse {
  message: string;
  application: Record<string, unknown>;
}

interface ApplicationState {
  message: string | null;
  application: Record<string, unknown> | null;
  status: "loading" | "succeeded" | "failed" | null;
  action:
    | "uploadFile"
    | "getMyApplication"
    | "updateApplication"
    | "submitApplication"
    | "decideApplication"
    | "decideDocument"
    | "getApplication"
    | "searchApplication"
    | null;
  error: string | null;
}

const initialState: ApplicationState = {
  message: null,
  application: null,
  status: null,
  action: null,
  error: null,
};

// Employee Thunks
export const uploadFileThunk = createAsyncThunk<
  UploadFileResponse,
  UploadFilePayload
>("application/uploadFile", async (payload, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("file", payload.file);
    const response = await axiosInstance.post<UploadFileResponse>(
      `${API_URL}/documents`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError && err.response) {
      return rejectWithValue(err.response.data.message);
    }
    return rejectWithValue("Unknown error");
  }
});

export const getMyApplicationThunk = createAsyncThunk(
  "application/getMyApplication",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/myapplication`);
      return response.data;
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue("Unknown error");
    }
  }
);

export const updateApplicationThunk = createAsyncThunk<
  UpdateApplicationResponse,
  UpdateApplicationPayload
>("application/updateApplication", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put<UpdateApplicationResponse>(
      `${API_URL}/update`,
      payload.updateData
    );
    return response.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError && err.response) {
      return rejectWithValue(err.response.data.message);
    }
    return rejectWithValue("Unknown error");
  }
});

export const submitApplicationThunk =
  createAsyncThunk<SubmitApplicationResponse>(
    "application/submitApplication",
    async (payload, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.put<SubmitApplicationResponse>(
          `${API_URL}/submit`
        );
        return response.data;
      } catch (err: unknown) {
        if (err instanceof AxiosError && err.response) {
          return rejectWithValue(err.response.data.message);
        }
        return rejectWithValue("Unknown error");
      }
    }
  );

// HR Thunks
export const decideApplicationThunk = createAsyncThunk<
  DecideApplicationResponse,
  DecideApplicationPayload
>("application/decideApplication", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put<DecideApplicationResponse>(
      `${API_URL}/${payload.applicationId}/decide`,
      {
        status: payload.status,
        feedback: payload.feedback,
      }
    );
    return response.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError && err.response) {
      return rejectWithValue(err.response.data.message);
    }
    return rejectWithValue("Unknown error");
  }
});

export const decideDocumentThunk = createAsyncThunk<
  DecideDocumentResponse,
  DecideDocumentPayload
>("application/decideDocument", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put<DecideDocumentResponse>(
      `${API_URL}/${payload.applicationId}/documents/decide`,
      {
        documentName: payload.documentName,
        status: payload.status,
        feedback: payload.feedback,
      }
    );
    return response.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError && err.response) {
      return rejectWithValue(err.response.data.message);
    }
    return rejectWithValue("Unknown error");
  }
});

export const getApplicationThunk = createAsyncThunk(
  "application/getApplication",
  async (applicationId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/${applicationId}`);
      return response.data;
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue("Unknown error");
    }
  }
);

export const searchApplicationThunk = createAsyncThunk(
  "application/searchApplication",
  async (documents: string[], { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/search`, { documents });
      return response.data;
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue("Unknown error");
    }
  }
);

// Update the slice
const applicationSlice = createSlice({
  name: "application",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Upload File
      .addCase(uploadFileThunk.pending, (state) => {
        state.status = "loading";
        state.action = "uploadFile";
      })
      .addCase(uploadFileThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(uploadFileThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Unknown error";
      })

      // Get My Application
      .addCase(getMyApplicationThunk.pending, (state) => {
        state.status = "loading";
        state.action = "getApplication";
      })
      .addCase(getMyApplicationThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.application = action.payload.application;
        state.error = null;
      })
      .addCase(getMyApplicationThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Unknown error";
      })

      // Update Application
      .addCase(updateApplicationThunk.pending, (state) => {
        state.status = "loading";
        state.action = "updateApplication";
      })
      .addCase(updateApplicationThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.message = action.payload.message;
        state.application = action.payload.updatedApplication;
        state.error = null;
      })
      .addCase(updateApplicationThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Unknown error";
      })

      // Submit Application
      .addCase(submitApplicationThunk.pending, (state) => {
        state.status = "loading";
        state.action = "submitApplication";
      })
      .addCase(submitApplicationThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.message = action.payload.message;
        state.application = action.payload.application;
        state.error = null;
      })
      .addCase(submitApplicationThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Unknown error";
      })

      // Decide Application
      .addCase(decideApplicationThunk.pending, (state) => {
        state.status = "loading";
        state.action = "decideApplication";
      })
      .addCase(decideApplicationThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.message = action.payload.message;
        state.application = action.payload.application;
        state.error = null;
      })
      .addCase(decideApplicationThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Unknown error";
      })

      // Decide Document
      .addCase(decideDocumentThunk.pending, (state) => {
        state.status = "loading";
        state.action = "decideDocument";
      })
      .addCase(decideDocumentThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.message = action.payload.message;
        state.application = action.payload.application;
        state.error = null;
      })
      .addCase(decideDocumentThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Unknown error";
      })

      // Get Application
      .addCase(getApplicationThunk.pending, (state) => {
        state.status = "loading";
        state.action = "getApplication";
      })
      .addCase(getApplicationThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.application = action.payload.application;
        state.error = null;
      })
      .addCase(getApplicationThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Unknown error";
      })

      // Search Application
      .addCase(searchApplicationThunk.pending, (state) => {
        state.status = "loading";
        state.action = "searchApplication";
      })
      .addCase(searchApplicationThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.application = action.payload.application;
        state.error = null;
      })
      .addCase(searchApplicationThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Unknown error";
      });
  },
});

export default applicationSlice.reducer;
