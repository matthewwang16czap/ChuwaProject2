// VISAStatusReviewPage.tsx

import React, { useEffect, useState, useCallback } from 'react';
import {
  Tabs,
  Table,
  Button,
  Modal,
  Input,
  message,
  Tooltip,
  Spin,
  Alert,
} from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { getAllEmployeeUsers } from '../../features/user/userSlice';
import {
  getApplicationThunk,
  decideDocumentThunk,
} from '../../features/application/applicationSlice';
import axiosInstance from '../../api/axiosInstance';
import moment from 'moment';

const { Search } = Input;

// Define the allowed documents in order
const allowedDocuments = ["OPTReceipt", "OPTEAD", "I-983", "I-20"];

// Refactored DocumentViewer Component
const DocumentViewer: React.FC<{ fileUrl: string }> = ({ fileUrl }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'failed'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!fileUrl) {
        setError('No document URL provided.');
        setStatus('failed');
        return;
      }

      try {
        const response = await axiosInstance.get(`/${fileUrl}`, {
          responseType: 'blob',
        });
        const url = URL.createObjectURL(response.data);
        setBlobUrl(url);
        setStatus('succeeded');

        // Cleanup the blob URL when the component unmounts or fileUrl changes
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load document.');
        setStatus('failed');
      }
    };

    fetchDocument();
  }, [fileUrl]);

  if (status === 'loading') return <Spin tip="Loading document..." />;
  if (status === 'failed') return <Alert message="Error" description={error} type="error" showIcon />;
  if (!blobUrl) return <div>No document found.</div>;

  return (
    <iframe
      src={blobUrl}
      width="100%"
      height="600px"
      title="Document Preview"
      style={{ border: 'none' }}
    ></iframe>
  );
};

const VISAStatusReviewPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { allEmployees, status: empStatus, error: empError } = useSelector(
    (state: RootState) => state.employee
  );
  const [allApplications, setAllApplications] = useState<any[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // State for Document Preview Modal
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState<boolean>(false);
  const [previewFileUrl, setPreviewFileUrl] = useState<string>('');

  // State for Document Approval Modal
  const [isApprovalModalVisible, setIsApprovalModalVisible] = useState<boolean>(false);
  const [currentApp, setCurrentApp] = useState<any>(null);
  const [currentDoc, setCurrentDoc] = useState<any>(null);
  const [feedback, setFeedback] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all employees
        const result = await dispatch(getAllEmployeesThunk()).unwrap();

        const { allEmployees } = result;

        if (!allEmployees || allEmployees.length === 0) {
          message.info('No employees found.');
          setLoading(false);
          return;
        }
        console.log('Fetched Employees:', allEmployees);

        // After fetching employees, fetch their applications
        const fetchApplicationsPromises = allEmployees.map(async (employee: any) => {
          try {
            const appResult = await dispatch(getApplicationThunk(employee.applicationId)).unwrap();
            return appResult; // Assuming getApplicationThunk returns an Application object
          } catch (error: any) {
            console.error(`Failed to fetch application for employeeId: ${employee.employeeId}`, error);
            return null; // Or handle as needed
          }
        });

        const fetchedApplications = await Promise.all(fetchApplicationsPromises);

        // Filter out any null responses due to failed fetches and extract application data
        const validApplications = fetchedApplications
          .filter((appObj): appObj is { application: any } => appObj !== null)
          .map((appObj) => appObj.application);

        setAllApplications(validApplications);
        setFilteredApplications(validApplications); // Initialize with all applications
        console.log('Fetched Applications:', validApplications);

        // Inform if some applications failed to fetch
        if (validApplications.length < allEmployees.length) {
          message.warning('Some applications could not be fetched.');
        }
      } catch (err: any) {
        // Handle specific errors
        if (typeof err === 'string') {
          message.error(`Error: ${err}`);
        } else if (err.message) {
          message.error(`Error: ${err.message}`);
        } else {
          message.error('Failed to fetch employees or applications.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Removed allEmployees from dependencies to prevent infinite loops
  }, [dispatch]);

  // Function to determine next step
  const getNextStep = (documents: any[] | undefined, docName: string): string => {
    if (!documents) return 'No documents submitted.';
    const doc = documents.find((d) => d.name === docName);
    if (!doc || doc.status === 'NeverSubmitted') {
      return `Waiting for employee to submit ${docName}.`;
    }
    if (doc.status === 'Rejected') {
      return `Waiting for employee to resubmit ${docName}. Feedback: ${doc.feedback || 'No feedback provided.'}`;
    }
    if (doc.status === 'Pending') {
      return `Waiting for HR to approve ${docName}.`;
    }
    if (doc.status === 'Approved') {
      // Determine next document
      const currentIndex = allowedDocuments.indexOf(docName);
      if (currentIndex === allowedDocuments.length - 1) {
        return 'All documents have been approved.';
      }
      const nextDoc = allowedDocuments[currentIndex + 1];
      return `Please proceed to the next step: ${nextDoc}.`;
    }

    return '';
  };

  // Function to get current pending document
  const getCurrentPendingDocument = (documents: any[] | undefined): any | null => {
    if (!documents) return null;
    for (const docName of allowedDocuments) {
      const doc = documents.find((d) => d.name === docName);
      if (!doc || doc.status === 'NeverSubmitted') {
        return doc || { name: docName, url: null, status: 'NeverSubmitted' };
      }
      if (doc.status === 'Rejected') {
        return doc;
      }
      if (doc.status === 'Pending') {
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
    setPreviewFileUrl('');
  };

  // Handler to open Document Approval Modal
  const handleApproveRejectDocument = (app: any, doc: any) => {
    setCurrentApp(app);
    setCurrentDoc(doc);
    setFeedback('');
    setIsApprovalModalVisible(true);
  };

  // Handler to close Document Approval Modal
  const closeApprovalModal = () => {
    setIsApprovalModalVisible(false);
    setCurrentApp(null);
    setCurrentDoc(null);
    setFeedback('');
  };

  // Handler for approving a document
  const approveDocument = async () => {
    if (!currentApp || !currentDoc) return;

    try {
      const updatedApp = await dispatch(
        decideDocumentThunk({
          applicationId: currentApp._id,
          documentName: currentDoc.name,
          status: 'Approved',
        })
      ).unwrap();
      message.success(`Document "${currentDoc.name}" approved successfully.`);
      closeApprovalModal();

      // Update the specific application in the local state
      setAllApplications((prevApps) =>
        prevApps.map((app) =>
          app.employeeId === updatedApp.employeeId ? updatedApp : app
        )
      );
      setFilteredApplications((prevApps) =>
        prevApps.map((app) =>
          app.employeeId === updatedApp.employeeId ? updatedApp : app
        )
      );
    } catch (err: any) {
      if (typeof err === 'string') {
        message.error(`Error: ${err}`);
      } else if (err.message) {
        message.error(`Error: ${err.message}`);
      } else {
        message.error('Failed to approve document.');
      }
    }
  };

  // Handler for rejecting a document
  const rejectDocument = async () => {
    if (!currentApp || !currentDoc) return;
    if (feedback.trim() === '') {
      message.error('Feedback is required when rejecting a document.');
      return;
    }

    try {
      const updatedApp = await dispatch(
        decideDocumentThunk({
          applicationId: currentApp._id,
          documentName: currentDoc.name,
          status: 'Rejected',
          feedback: feedback.trim(),
        })
      ).unwrap();
      message.success(`Document "${currentDoc.name}" rejected successfully.`);
      closeApprovalModal();

      // Update the specific application in the local state
      setAllApplications((prevApps) =>
        prevApps.map((app) =>
          app.employeeId === updatedApp.employeeId ? updatedApp : app
        )
      );
      setFilteredApplications((prevApps) =>
        prevApps.map((app) =>
          app.employeeId === updatedApp.employeeId ? updatedApp : app
        )
      );
    } catch (err: any) {
      if (typeof err === 'string') {
        message.error(`Error: ${err}`);
      } else if (err.message) {
        message.error(`Error: ${err.message}`);
      } else {
        message.error('Failed to reject document.');
      }
    }
  };

  // Handler for uploading I-983 form (Assuming PrototypeForm handles the upload)
  const handleI983Upload = async (data: any) => {
    if (!currentApp || !selectedI983Document) return;

    // Implement the upload logic here using the uploadFileThunk or a similar thunk
    // Since the upload functionality is handled by PrototypeForm and its internal logic,
    // we'll assume that upon successful upload, the document URL is updated.

    // For demonstration, we'll simulate with a success message.
    message.success('I-983 form uploaded successfully.');
    setSelectedI983Document(null);
    // Refresh data by updating the specific application if necessary
  };

  // Table Columns for "In Progress" Tab
  const inProgressColumns = [
    {
      title: 'Name',
      key: 'name',
      render: (_: any, app: any) => {
        const firstName = app.firstName || '';
        const middleName = app.middleName || '';
        const lastName = app.lastName || '';
        const fullName = `${firstName} ${middleName} ${lastName}`.trim();
        return fullName || 'N/A';
      },
    },
    {
      title: 'Work Authorization',
      key: 'workAuthorization',
      render: (_: any, app: any) => {
        const wa = app.workAuthorization;
        if (!wa) return 'N/A';

        const visaTitle = wa.visaTitle || wa.visaType || 'N/A';
        const startDate = wa.startDate
          ? moment(wa.startDate).format('MM/DD/YYYY')
          : 'N/A';
        const endDate = wa.endDate
          ? moment(wa.endDate).format('MM/DD/YYYY')
          : 'N/A';
        const daysRemaining = wa.endDate
          ? Math.ceil(
              (new Date(wa.endDate).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 'N/A';

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
      title: 'Next Steps',
      key: 'nextSteps',
      render: (_: any, app: any) => {
        const wa = app.workAuthorization;
        const nextDoc = getCurrentPendingDocument(wa?.documents);
        if (!nextDoc) {
          return 'All documents have been approved.';
        }

        return getNextStep(wa?.documents, nextDoc.name);
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, app: any) => {
        const wa = app.workAuthorization;
        const pendingDoc = getCurrentPendingDocument(wa?.documents);

        if (!pendingDoc) return <span>No pending actions.</span>;

        if (
          pendingDoc.status === 'Pending' ||
          pendingDoc.status === 'Rejected' ||
          pendingDoc.status === 'NeverSubmitted'
        ) {
          return (
            <Button
              type="primary"
              onClick={() => handleApproveRejectDocument(app, pendingDoc)}
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
      title: 'Name',
      key: 'name',
      render: (_: any, app: any) => {
        const firstName = app.firstName || '';
        const middleName = app.middleName || '';
        const lastName = app.lastName || '';
        const fullName = `${firstName} ${middleName} ${lastName}`.trim();
        return fullName || 'N/A';
      },
    },
    {
      title: 'Work Authorization',
      key: 'workAuthorization',
      render: (_: any, app: any) => {
        const wa = app.workAuthorization;
        if (!wa) return 'N/A';

        const visaTitle = wa.visaTitle || wa.visaType || 'N/A';
        const startDate = wa.startDate
          ? moment(wa.startDate).format('MM/DD/YYYY')
          : 'N/A';
        const endDate = wa.endDate
          ? moment(wa.endDate).format('MM/DD/YYYY')
          : 'N/A';
        const daysRemaining = wa.endDate
          ? Math.ceil(
              (new Date(wa.endDate).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 'N/A';

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
      title: 'Documents',
      key: 'documents',
      render: (_: any, app: any) => {
        const wa = app.workAuthorization;
        if (!wa || !wa.documents) return 'No documents uploaded.';

        const approvedDocs = wa.documents.filter((doc: any) => doc.status === 'Approved');

        if (approvedDocs.length === 0) return 'No approved documents.';

        return (
          <div>
            {approvedDocs.map((doc: any, index: number) => (
              <div key={`${doc.name}-${app.employeeId}-${index}`} style={{ marginBottom: '8px' }}>
                <strong>{doc.name}</strong>{' '}
                <Tooltip title="View Document">
                  <Button
                    icon={<DownloadOutlined />}
                    size="small"
                    onClick={() => {
                      if (doc.url) {
                        handleDocumentPreview(doc.url);
                      } else {
                        message.error('No URL available for this document.');
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

  // Search Handler for "All" Tab
  const handleSearch = useCallback(
    (value: string) => {
      if (value.trim() === '') {
        // If search is cleared, reset to all applications
        setFilteredApplications(allApplications);
        return;
      }

      const filtered = allApplications.filter((app) => {
        const fullName = `${app.firstName || ''} ${app.middleName || ''} ${app.lastName || ''}`.toLowerCase();
        return fullName.includes(value.toLowerCase());
      });
      setFilteredApplications(filtered);
    },
    [allApplications]
  );

  // Define the items for Tabs using the new Ant Design API
  const tabsItems = [
    {
      key: 'inProgress',
      label: 'In Progress',
      children: (
        <Table
          columns={inProgressColumns}
          dataSource={filteredApplications}
          rowKey={(record) => record.applicationId || record.employeeId}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'all',
      label: 'All',
      children: (
        <>
          <div style={{ marginBottom: '20px' }}>
            <Search
              placeholder="Search by first name, last name, or preferred name"
              allowClear
              enterButton="Search"
              size="large"
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: '400px' }}
            />
          </div>
          <Table
            columns={allColumns}
            dataSource={filteredApplications}
            rowKey={(record) => record.applicationId || record.employeeId}
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>VISA Status Review</h2>
      <Tabs defaultActiveKey="inProgress" type="card" items={tabsItems} />

      {/* Approval Modal */}
      <Modal
        open={isApprovalModalVisible} // Updated from 'visible' to 'open'
        title={
          currentDoc
            ? `Review ${currentDoc.name} for ${currentApp?.firstName || ''} ${currentApp?.lastName || ''}`
            : 'Review Document'
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
            {currentDoc.status === 'Rejected' && (
              <Alert
                message="Feedback from HR"
                description={currentDoc.feedback || 'No feedback provided.'}
                type="info"
                showIcon
                style={{ marginTop: '20px' }}
              />
            )}

            {/* Approval Actions */}
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <Button
                type="primary"
                onClick={approveDocument}
                style={{ marginRight: '10px' }}
              >
                Approve
              </Button>
              <Button type="danger" onClick={rejectDocument}>
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
