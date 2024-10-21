import { configureStore } from "@reduxjs/toolkit";
import registrationReducer from "../features/registration/registrationSlice";
import userReducer from "../features/user/userSlice";
import applicationReducer from "../features/application/applicationSlice";
import employeeReducer from "../features/employee/employeeSlice";
import documentReducer from "../features/document/documentSlice";

export const store = configureStore({
  reducer: {
    registration: registrationReducer,
    user: userReducer,
    application: applicationReducer,
    employee: employeeReducer,
    document: documentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["document/fetchDocument/fulfilled"], // Ignore serializability checks for these actions
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
