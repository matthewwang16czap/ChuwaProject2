// VISAStatusReviewPage.tsx

import React, { useEffect, useState } from "react";
import {
  Tabs,
  Table,
  Button,
  Modal,
  message,
  Tooltip,
  Spin,
  Alert,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../app/store";
import {
  getAllEmployeeUsers,
  EmployeeUser,
} from "../../features/user/userSlice";
import {
  decideDocumentThunk,
  IDocument,
} from "../../features/application/applicationSlice";
import axiosInstance from "../../api/axiosInstance";
import moment from "moment";

// Define the allowed documents in order
const allowedDocuments = ["OPTReceipt", "OPTEAD", "I-983", "I-20"];

// Refactored DocumentViewer Component
const DocumentViewer: React.FC<{ fileUrl: string }> = ({ fileUrl }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "succeeded" | "failed">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!fileUrl) {
        setError("No document URL provided.");
        setStatus("failed");
        return;
      }

      try {
        const response = await axiosInstance.get(`/${fileUrl}`, {
          responseType: "blob",
        });
        const url = URL.createObjectURL(response.data);
        setBlobUrl(url);
        setStatus("succeeded");

        // Cleanup the blob URL when the component unmounts or fileUrl changes
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error("Error fetching document:", err);
        setError("Failed to load document.");
        setStatus("failed");
      }
    };

    fetchDocument();
  }, [fileUrl]);

  if (status === "loading") return <Spin tip="Loading document..." />;
  if (status === "failed")
    return <Alert message="Error" description={error} type="error" showIcon />;
  if (!blobUrl) return <div>No document found.</div>;

  return (
    <iframe
      src={blobUrl}
      width="100%"
      height="600px"
      title="Document Preview"
      style={{ border: "none" }}
    ></iframe>
  );
};

const VISAStatusReviewPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const {
    employeeUsers,
  } = useSelector((state: RootState) => state.user);

  const [loading, setLoading] = useState<boolean>(true);

  // State for Document Preview Modal
  const [isPreviewModalVisible, setIsPreviewModalVisible] =
    useState<boolean>(false);
  const [previewFileUrl, setPreviewFileUrl] = useState<string>("");

  // State for Document Approval Modal
  const [isApprovalModalVisible, setIsApprovalModalVisible] =
    useState<boolean>(false);
  const [currentApp, setCurrentApp] = useState<EmployeeUser | null>(null);
  const [currentDoc, setCurrentDoc] = useState<IDocument | null>(null);
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all employee users
        const allEmployees: EmployeeUser[] = await dispatch(
          getAllEmployeeUsers({})
        ).unwrap();
        if (!allEmployees || allEmployees.length === 0) {
          message.info("No employees found.");
          setLoading(false);
          return;
        }
      } catch (err: unknown) {
        // Handle specific errors
        if (typeof err === "string") {
          message.error(`Error: ${err}`);
        } else if (err instanceof Error) {
          message.error(`Error: ${err.message}`);
        } else {
          message.error("Failed to fetch employee users.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // Removed allEmployees from dependencies to prevent infinite loops
  }, [dispatch]);

  // Function to determine next step
  const getNextStep = (
    documents: IDocument[] | undefined,
    docName: string
  ): string => {
    if (!documents) return "No documents submitted.";
    const doc = documents.find((d) => d.name === docName);
    if (!doc || doc.status === "NeverSubmitted") {
      return `Waiting for employee to submit ${docName}.`;
    }
    if (doc.status === "Rejected") {
      return `Waiting for employee to resubmit ${docName}. Feedback: ${
        doc.feedback || "No feedback provided."
      }`;
    }
    if (doc.status === "Pending") {
      return `Waiting for HR to approve ${docName}.`;
    }
    if (doc.status === "Approved") {
      // Determine next document
      const currentIndex = allowedDocuments.indexOf(docName);
      if (currentIndex === allowedDocuments.length - 1) {
        return "All documents have been approved.";
      }
      const nextDoc = allowedDocuments[currentIndex + 1];
      return `Please proceed to the next step: ${nextDoc}.`;
    }

    return "";
  };

  // Function to get current pending document
  const getCurrentPendingDocument = (
    documents: IDocument[] | undefined
  ): IDocument | null => {
    if (!documents) return null;
    for (const docName of allowedDocuments) {
      const doc = documents.find((d) => d.name === docName);
      if (!doc || doc.status === "NeverSubmitted") {
        return (
          doc || {
            name: docName,
            url: null,
            status: "NeverSubmitted",
            feedback: "",
          }
        );
      }
      if (doc.status === "Rejected") {
        return doc;
      }
      if (doc.status === "Pending") {
        return doc;
      }
    }
    return null;
  };

  // Handler to open Document Preview Modal
  const handleDocumentPreview = (fileUrl: string) => {
    setPreviewFileUrl(fileUrl);
    setIsPreviewModalVisible(true);
  };

  // Handler to close Document Preview Modal
  const closePreviewModal = () => {
    setIsPreviewModalVisible(false);
    setPreviewFileUrl("");
  };

  // Handler to open Document Approval Modal
  const handleApproveRejectDocument = (app: EmployeeUser, doc: IDocument) => {
    setCurrentApp(app);
    setCurrentDoc(doc);
    setFeedback("");
    setIsApprovalModalVisible(true);
  };

  // Handler to close Document Approval Modal
  const closeApprovalModal = () => {
    setIsApprovalModalVisible(false);
    setCurrentApp(null);
    setCurrentDoc(null);
    setFeedback("");
  };

  // Handler for approving a document
  const approveDocument = async () => {
    if (!currentApp || !currentDoc) return;

    try {
      await dispatch(
        decideDocumentThunk({
          applicationId: currentApp.employeeId.applicationId._id,
          documentName: currentDoc.name,
          status: "Approved",
          feedback: "",
        })
      ).unwrap();
      message.success(`Document "${currentDoc.name}" approved successfully.`);
      closeApprovalModal();
      await dispatch(getAllEmployeeUsers({})).unwrap();
    } catch (err: unknown) {
      if (typeof err === "string") {
        message.error(`Error: ${err}`);
      } else if (err instanceof Error) {
        message.error(`Error: ${err.message}`);
      } else {
        message.error("Failed to approve document.");
      }
    }
  };

  // Handler for rejecting a document
  const rejectDocument = async () => {
    if (!currentApp || !currentDoc) return;
    if (feedback.trim() === "") {
      message.error("Feedback is required when rejecting a document.");
      return;
    }
    try {
      await dispatch(
        decideDocumentThunk({
          applicationId: currentApp.employeeId.applicationId._id,
          documentName: currentDoc.name,
          status: "Rejected",
          feedback: feedback.trim(),
        })
      ).unwrap();
      message.success(`Document "${currentDoc.name}" rejected successfully.`);
      closeApprovalModal();
      await dispatch(getAllEmployeeUsers({})).unwrap();
    } catch (err: unknown) {
      if (typeof err === "string") {
        message.error(`Error: ${err}`);
      } else if (err instanceof Error) {
        message.error(`Error: ${err.message}`);
      } else {
        message.error("Failed to approve document.");
      }
    }
  };

  // Table Columns for "In Progress" Tab
  const inProgressColumns = [
    {
      title: "Name",
      key: "name",
      render: (_: unknown, employeeUser: EmployeeUser) => {
        const firstName = employeeUser.employeeId.firstName || "";
        const lastName = employeeUser.employeeId.lastName || "";
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName || "N/A";
      },
    },
    {
      title: "Work Authorization",
      key: "workAuthorization",
      render: (_: unknown, employeeUser: EmployeeUser) => {
        const employment = employeeUser.employeeId.employment;
        const visaTitle = employment.visaTitle || employment.visaType || "N/A";
        const startDate = employment.startDate
          ? moment(employment.startDate).format("MM/DD/YYYY")
          : "N/A";
        const endDate = employment.endDate
          ? moment(employment.endDate).format("MM/DD/YYYY")
          : "N/A";
        const daysRemaining = employment.endDate
          ? Math.ceil(
              (new Date(employment.endDate).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : "N/A";

        return (
          <>
            <p>Title: {visaTitle}</p>
            <p>
              Start Date: {startDate} - End Date: {endDate}
            </p>
            <p>Days Remaining: {daysRemaining}</p>
          </>
        );
      },
    },
    {
      title: "Next Steps",
      key: "nextSteps",
      render: (_: unknown, employeeUser: EmployeeUser) => {
        const workAuthorization =
          employeeUser.employeeId.applicationId.workAuthorization;
        const nextDoc = getCurrentPendingDocument(workAuthorization.documents);
        if (!nextDoc) {
          return "All documents have been approved.";
        }

        return getNextStep(workAuthorization?.documents, nextDoc.name);
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, employeeUser: EmployeeUser) => {
        const workAuthorization =
          employeeUser.employeeId.applicationId.workAuthorization;
        const pendingDoc = getCurrentPendingDocument(
          workAuthorization.documents
        );

        if (!pendingDoc) return <span>No pending actions.</span>;

        if (
          pendingDoc.status === "Pending" ||
          pendingDoc.status === "Rejected" ||
          pendingDoc.status === "NeverSubmitted"
        ) {
          return (
            <Button
              type="primary"
              onClick={() =>
                handleApproveRejectDocument(employeeUser, pendingDoc)
              }
            >
              Review Document
            </Button>
          );
        }

        return null;
      },
    },
  ];

  // Table Columns for "All" Tab
  const allColumns = [
    {
      title: "Name",
      key: "name",
      render: (_: unknown, employeeUser: EmployeeUser) => {
        const firstName = employeeUser.employeeId.firstName || "";
        const lastName = employeeUser.employeeId.lastName || "";
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName || "N/A";
      },
    },
    {
      title: "Work Authorization",
      key: "workAuthorization",
      render: (_: unknown, employeeUser: EmployeeUser) => {
        const employment = employeeUser.employeeId.employment;
        const visaTitle = employment.visaTitle || employment.visaType || "N/A";
        const startDate = employment.startDate
          ? moment(employment.startDate).format("MM/DD/YYYY")
          : "N/A";
        const endDate = employment.endDate
          ? moment(employment.endDate).format("MM/DD/YYYY")
          : "N/A";
        const daysRemaining = employment.endDate
          ? Math.ceil(
              (new Date(employment.endDate).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : "N/A";

        return (
          <>
            <p>Title: {visaTitle}</p>
            <p>
              Start Date: {startDate} - End Date: {endDate}
            </p>
            <p>Days Remaining: {daysRemaining}</p>
          </>
        );
      },
    },
    {
      title: "Documents",
      key: "documents",
      render: (_: unknown, employeeUser: EmployeeUser) => {
        const workAuthorization =
          employeeUser.employeeId.applicationId.workAuthorization;
        if (!workAuthorization || !workAuthorization.documents)
          return "No documents uploaded.";

        const approvedDocs = workAuthorization.documents.filter(
          (doc) => doc.status === "Approved"
        );

        if (approvedDocs.length === 0) return "No approved documents.";

        return (
          <div>
            {approvedDocs.map((doc: IDocument, index: number) => (
              <div
                key={`${doc.name}-${employeeUser.employeeId._id}-${index}`}
                style={{ marginBottom: "8px" }}
              >
                <strong>{doc.name}</strong>{" "}
                <Tooltip title="View Document">
                  <Button
                    icon={<DownloadOutlined />}
                    size="small"
                    onClick={() => {
                      if (doc.url) {
                        handleDocumentPreview(doc.url);
                      } else {
                        message.error("No URL available for this document.");
                      }
                    }}
                  >
                    View
                  </Button>
                </Tooltip>
              </div>
            ))}
          </div>
        );
      },
    },
  ];

  // Define the items for Tabs using the new Ant Design API
  const tabsItems = [
    {
      key: "inProgress",
      label: "In Progress",
      children: (
        <Table
          columns={inProgressColumns}
          dataSource={employeeUsers.filter(
            (employeeUser) =>
              employeeUser.employeeId.applicationId.status !== "Approved" ||
              !employeeUser.employeeId.applicationId.workAuthorization.documents.every(
                (document) => document.status === "Approved"
              )
          )}
          rowKey={(record) =>
            record.employeeId.applicationId._id || record.employeeId._id
          }
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: "all",
      label: "All",
      children: (
        <>
          <Table
            columns={allColumns}
            dataSource={employeeUsers}
            rowKey={(record) =>
              record.employeeId.applicationId._id || record.employeeId._id
            }
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>VISA Status Review</h2>
      <Tabs defaultActiveKey="inProgress" type="card" items={tabsItems} />

      {/* Approval Modal */}
      <Modal
        open={isApprovalModalVisible} // Updated from 'visible' to 'open'
        title={
          currentDoc && currentApp
            ? `Review ${currentDoc.name} for ${
                currentApp.employeeId.firstName || ""
              } ${currentApp.employeeId.lastName || ""}`
            : "Review Document"
        }
        onCancel={closeApprovalModal}
        footer={null}
        width={800}
      >
        {/* Document Preview within Approval Modal */}
        {currentDoc && currentApp && (
          <>
            {currentDoc.url ? (
              <DocumentViewer fileUrl={currentDoc.url} />
            ) : (
              <Alert
                message="Error"
                description="No URL available for this document."
                type="error"
                showIcon
              />
            )}

            {/* Feedback for Rejection */}
            {currentDoc.status === "Rejected" && (
              <Alert
                message="Feedback from HR"
                description={currentDoc.feedback || "No feedback provided."}
                type="info"
                showIcon
                style={{ marginTop: "20px" }}
              />
            )}

            {/* Approval Actions */}
            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <Button
                type="primary"
                onClick={approveDocument}
                style={{ marginRight: "10px" }}
              >
                Approve
              </Button>
              <Button color="danger" onClick={rejectDocument}>
                Reject
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Document Preview Modal */}
      <Modal
        open={isPreviewModalVisible} // Updated from 'visible' to 'open'
        title="Document Preview"
        onCancel={closePreviewModal}
        footer={null}
        width={800}
      >
        {previewFileUrl ? (
          <DocumentViewer fileUrl={previewFileUrl} />
        ) : (
          <div>No document to preview.</div>
        )}
      </Modal>
    </div>
  );
};

export default VISAStatusReviewPage;
