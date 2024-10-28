import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../app/store";
import { getMyApplicationThunk, IDocument } from "../features/application/applicationSlice";
import { Alert, message } from "antd";
import { useForm } from "react-hook-form";
import PrototypeForm, { Field } from "../forms/PrototypeForm";

interface DocumentInfo {
  url: string | null;
  status: "NeverSubmitted" | "Pending" | "Approved" | "Rejected";
  feedback: string;
}

interface Documents {
  [name: string]: DocumentInfo;
}

function convertToDocuments(docArray: IDocument[]): Documents {
  return docArray.reduce((acc, doc) => {
    const { name, url, status, feedback } = doc;
    acc[name] = { url, status, feedback };
    return acc;
  }, {} as Documents);
}

const VISAStatusManagementPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { application, status: appStatus, error: appError } = useSelector((state: RootState) => state.application);
  const [loading, setLoading] = useState<boolean>(true);
  const [documents, setDocuments] = useState<Documents>({});
  const methods = useForm<Documents>({
    defaultValues: documents,
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const { reset } = methods;

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const result = await dispatch(getMyApplicationThunk()).unwrap();
        console.log(result.application.workAuthorization.documents);
        if (result.application.workAuthorization.documents) {
          const docs = convertToDocuments(result.application.workAuthorization.documents);
          setDocuments(docs);
          reset(docs); // Update form with fetched data
        }
        console.log(documents);
      } catch {
        message.error("Failed to load application data");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [dispatch, reset]);

  const isApplicable =
    application &&
    application.citizenship === "WorkAuthorization" &&
    application.workAuthorization?.visaType === "F1(CPT/OPT)";

  if (loading || appStatus === "loading") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <p>Loading application data...</p>
      </div>
    );
  }

  if (appError) {
    return (
      <Alert
        message="Error"
        description={appError}
        type="error"
        showIcon
        style={{ margin: "20px" }}
      />
    );
  }

  if (!isApplicable) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>VISA Status Management</h2>
        <p>This page is not applicable to you.</p>
      </div>
    );
  }

  const fields: Field<Documents>[] = Object.keys(documents).map((docName) => ({
    name: `${docName}.url`,
    label: docName,
    type: "upload",
    validation: {},
    filename: `${docName}.pdf`,
    disabled: !["NeverSubmitted", "Rejected"].includes(documents[docName].status),
  }));

  return (
    <div style={{ padding: "20px" }}>
      <h2>VISA Status Management</h2>
      <PrototypeForm fields={fields} onSubmit={() => {}} methods={methods} />
    </div>
  );
};

export default VISAStatusManagementPage;
