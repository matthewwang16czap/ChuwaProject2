// VISAStatusManagementPage.tsx

import React, { useEffect, useState } from "react";
// Redux hooks for state management
import { useDispatch, useSelector } from "react-redux";
// Import types for RootState and AppDispatch
import { RootState, AppDispatch } from "../app/store";
// Import the thunk to fetch the user's application and the IDocument interface
import { getMyApplicationThunk, IDocument } from "../features/application/applicationSlice";
// Ant Design components for UI elements
import { Alert, message, Spin } from "antd";
// React Hook Form for form handling
import { useForm } from "react-hook-form";
// Custom form component and Field type
import PrototypeForm, { Field } from "../forms/PrototypeForm";

// Interface for individual document information
interface DocumentInfo {
  url: string | null;
  status: "NeverSubmitted" | "Pending" | "Approved" | "Rejected";
  feedback: string;
}

// Interface for the collection of documents, keyed by document name
interface Documents {
  [name: string]: DocumentInfo;
}

// Function to convert an array of IDocument into a Documents object
function convertToDocuments(docArray: IDocument[]): Documents {
  return docArray.reduce((acc, doc) => {
    const { name, url, status, feedback } = doc;
    acc[name] = { url, status, feedback };
    return acc;
  }, {} as Documents);
}

// Main component for VISA Status Management
const VISAStatusManagementPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();

  // Extract application data and status from Redux store
  const { application, status: appStatus, error: appError } = useSelector(
    (state: RootState) => state.application
  );

  // Local state for loading indicator and documents
  const [loading, setLoading] = useState<boolean>(true);
  const [documents, setDocuments] = useState<Documents>({});

  // Initialize form methods with React Hook Form
  const methods = useForm<Documents>({
    defaultValues: documents,
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const { reset } = methods;

  // Fetch application data on component mount
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        // Dispatch the thunk to fetch the application data
        const result = await dispatch(getMyApplicationThunk()).unwrap();
        // Check if documents are available
        if (result.application.workAuthorization.documents) {
          // Convert documents array to Documents object
          const docs = convertToDocuments(result.application.workAuthorization.documents);
          setDocuments(docs);
          reset(docs); // Update form with fetched data
        }
      } catch {
        // Show error message if fetching data fails
        message.error("Failed to load application data");
      } finally {
        // Set loading to false regardless of success or failure
        setLoading(false);
      }
    };

    fetchApplication();
  }, [dispatch, reset]);

  // Check if the page is applicable to the user
  const isApplicable =
    application &&
    application.citizenship === "WorkAuthorization" &&
    application.workAuthorization?.visaType === "F1(CPT/OPT)";

  // Render loading spinner if data is still loading
  if (loading || appStatus === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Loading application data..." />
      </div>
    );
  }

  // Render error message if there's an error fetching data
  if (appError) {
    return (
      <Alert
        message="Error"
        description={appError}
        type="error"
        showIcon
        className="m-5"
      />
    );
  }

  // Render message if the page is not applicable to the user
  if (!isApplicable) {
    return (
      <div className="p-5">
        <h2 className="text-2xl font-semibold mb-4">VISA Status Management</h2>
        <p>This page is not applicable to you.</p>
      </div>
    );
  }

  // Check if any document has a status of "Pending"
  const hasPendingDocuments = Object.values(documents).some(
    (doc) => doc.status === "Pending"
  );

  // Generate form fields based on the documents
  const fields: Field<Documents>[] = Object.keys(documents).map((docName) => ({
    name: `${docName}.url`,
    label: docName,
    type: "upload",
    validation: {},
    filename: `${docName}.pdf`,
    // Disable the field unless the status is NeverSubmitted or Rejected
    disabled: !["NeverSubmitted", "Rejected"].includes(documents[docName].status),
  }));

  // Main content rendering
  return (
    <div className="p-5">
      <h2 className="text-2xl font-semibold mb-4">VISA Status Management</h2>

      {hasPendingDocuments ? (
        // Display message if any document is pending approval
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-yellow-700">
            The uploaded document requires approval.
          </p>
        </div>
      ) : (
        // Render the form with the generated fields
        <PrototypeForm fields={fields} onSubmit={() => {}} methods={methods} />
      )}
    </div>
  );
};

export default VISAStatusManagementPage;
