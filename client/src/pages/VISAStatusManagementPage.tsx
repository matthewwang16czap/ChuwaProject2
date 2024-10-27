// VISAStatusManagementPage.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import {
  getMyApplicationThunk,
  updateApplicationThunk,
} from '../features/application/applicationSlice';
import { fetchDocument } from '../features/document/documentSlice';
import { Spin, Alert, Button, message, Modal } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { useForm } from 'react-hook-form';
import PrototypeForm from '../forms/PrototypeForm';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

// Define the allowed documents in order
const allowedDocuments = ['OPTReceipt', 'OPTEAD', 'I-983', 'I-20'];

const VISAStatusManagementPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { application, status: appStatus, error: appError } = useSelector(
    (state: RootState) => state.application
  );
  const documentState = useSelector((state: RootState) => state.document);

  const [loading, setLoading] = useState<boolean>(true);
  const [documentBlob, setDocumentBlob] = useState<Blob | null>(null);
  const [fileType, setFileType] = useState('');
  const [numPages, setNumPages] = useState<number>(0);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // Initialize useForm instances for each document
  const optReceiptFormMethods = useForm<any>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const optEADFormMethods = useForm<any>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const i983FormMethods = useForm<any>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const i20FormMethods = useForm<any>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        await dispatch(getMyApplicationThunk()).unwrap();
      } catch (err) {
        message.error('Failed to load application data');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [dispatch]);

  // Determine if the user should see the Visa Status Management page
  const isApplicable =
    application &&
    application.citizenship === 'WorkAuthorization' &&
    application.workAuthorization?.visaType === 'F1(CPT/OPT)';

  // Function to get document status by name
  const getDocumentStatus = (docName: string) => {
    const doc = application?.workAuthorization?.documents?.find(
      (d) => d.name === docName
    );
    if (doc) {
      return {
        status: doc.status,
        feedback: doc.feedback,
        url: doc.url,
      };
    } else {
      return {
        status: 'Not Uploaded',
      };
    }
  };

  // Get statuses for all documents
  const getDocumentStatuses = () => {
    const statuses: {
      [key: string]: { status: string; feedback?: string; url?: string };
    } = {};
    allowedDocuments.forEach((docName) => {
      const docStatus = getDocumentStatus(docName);
      statuses[docName] = docStatus;
    });
    return statuses;
  };

  const documentStatuses = getDocumentStatuses();

  // Submission handlers
  const handleUploadSubmit = async (
    documentName: string,
    fileUrl: string
  ) => {
    try {
      if (!fileUrl) {
        message.error('File upload failed');
        return;
      }

      // Update the application with the new document
      const newDocument = {
        name: documentName,
        url: fileUrl,
        status: 'Pending',
        feedback: '',
      };

      const updatedDocuments = [
        ...(application?.workAuthorization?.documents?.filter(
          (d) => d.name !== documentName
        ) || []),
        newDocument,
      ];

      await dispatch(
        updateApplicationThunk({
          updateData: {
            'workAuthorization.documents': updatedDocuments,
          },
        })
      ).unwrap();

      message.success(`${documentName} uploaded successfully`);

      // Refresh application data
      await dispatch(getMyApplicationThunk()).unwrap();
    } catch (error) {
      console.error('Error uploading document:', error);
      message.error('Failed to upload document');
    }
  };

  const handleOPTReceiptSubmit = async (data: any) => {
    await handleUploadSubmit('OPTReceipt', data.file);
  };

  const handleOPTEADSubmit = async (data: any) => {
    await handleUploadSubmit('OPTEAD', data.file);
  };

  const handleI983Submit = async (data: any) => {
    await handleUploadSubmit('I-983', data.file);
  };

  const handleI20Submit = async (data: any) => {
    await handleUploadSubmit('I-20', data.file);
  };

  // Handler to view document
  const handleViewDocument = async (url: string, documentName: string) => {
    try {
      // Remove leading slash if present
      if (url.startsWith('/')) {
        url = url.substring(1);
      }
      const urlParts = url.split('/').filter(Boolean);
      const userId = urlParts[1]; // 'documents' is at index 0
      const filename = urlParts.slice(2).join('/');

      // Fetch the document Blob
      const blob = await dispatch(
        fetchDocument({ userId, filename })
      ).unwrap();

      // Set the Blob in local state
      setDocumentBlob(blob);

      // Determine file type
      const extension = filename.split('.').pop()?.toLowerCase();
      let determinedFileType = '';
      if (extension === 'pdf') {
        determinedFileType = 'application/pdf';
      } else if (
        ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension || '')
      ) {
        determinedFileType = 'image/' + extension;
      } else {
        determinedFileType = 'unknown';
      }

      setFileType(determinedFileType);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error fetching document:', error);
      message.error('Failed to fetch document');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: any) => {
    setNumPages(numPages);
  };

  // Render functions for each document
  const renderOPTReceiptSection = () => {
    const { status, feedback, url } = documentStatuses['OPTReceipt'];

    if (status === 'Pending') {
      return (
        <div style={{ marginBottom: '40px' }}>
          <h3>OPT Receipt</h3>
          <p>Waiting for HR to approve your OPT Receipt.</p>
          {url && (
            <Button
              onClick={() => handleViewDocument(url, 'OPTReceipt')}
              icon={<DownloadOutlined />}
            >
              View Document
            </Button>
          )}
        </div>
      );
    } else if (status === 'Approved') {
      return (
        <div style={{ marginBottom: '40px' }}>
          <h3>OPT Receipt</h3>
          <p>Please upload a copy of your OPT EAD.</p>
          <PrototypeForm
            fields={[
              {
                name: 'file',
                label: 'Upload OPT EAD',
                type: 'upload',
                validation: { required: 'File is required' },
                filename: 'OPTEAD.pdf',
              },
            ]}
            onSubmit={handleOPTEADSubmit}
            methods={optEADFormMethods}
            submitButtonLabel="Upload"
          />
        </div>
      );
    } else if (status === 'Rejected') {
      return (
        <div style={{ marginBottom: '40px' }}>
          <h3>OPT Receipt</h3>
          <p>Your OPT Receipt was rejected.</p>
          {feedback && <p>Feedback from HR: {feedback}</p>}
          <p>Please re-upload your OPT Receipt.</p>
          <PrototypeForm
            fields={[
              {
                name: 'file',
                label: 'Re-upload OPT Receipt',
                type: 'upload',
                validation: { required: 'File is required' },
                filename: 'OPTReceipt.pdf',
              },
            ]}
            onSubmit={handleOPTReceiptSubmit}
            methods={optReceiptFormMethods}
            submitButtonLabel="Upload"
          />
        </div>
      );
    } else if (status === 'Not Uploaded') {
      return (
        <div style={{ marginBottom: '40px' }}>
          <h3>OPT Receipt</h3>
          <p>Your OPT Receipt was not uploaded during onboarding.</p>
          <p>Please upload your OPT Receipt.</p>
          <PrototypeForm
            fields={[
              {
                name: 'file',
                label: 'Upload OPT Receipt',
                type: 'upload',
                validation: { required: 'File is required' },
                filename: 'OPTReceipt.pdf',
              },
            ]}
            onSubmit={handleOPTReceiptSubmit}
            methods={optReceiptFormMethods}
            submitButtonLabel="Upload"
          />
        </div>
      );
    }

    return null;
  };

  const renderOPTEADSection = () => {
    const { status, feedback, url } = documentStatuses['OPTEAD'];
    const prevDocStatus = documentStatuses['OPTReceipt'].status;

    // Only show if previous document is approved
    if (prevDocStatus !== 'Approved') {
      return null;
    }

    if (status === 'Pending') {
      return (
        <div style={{ marginBottom: '40px' }}>
          <h3>OPT EAD</h3>
          <p>Waiting for HR to approve your OPT EAD.</p>
          {url && (
            <Button
              onClick={() => handleViewDocument(url, 'OPTEAD')}
              icon={<DownloadOutlined />}
            >
              View Document
            </Button>
          )}
        </div>
      );
    } else if (status === 'Approved') {
      return (
        <div style={{ marginBottom: '40px' }}>
          <h3>OPT EAD</h3>
          <p>Please download and fill out the I-983 form.</p>
          <div style={{ marginBottom: '20px' }}>
            <Button
              icon={<DownloadOutlined />}
              href="/templates/I-983_Empty_Template.pdf"
              target="_blank"
              style={{ marginRight: '10px' }}
            >
              Download Empty Template
            </Button>
            <Button
              icon={<DownloadOutlined />}
              href="/templates/I-983_Sample_Template.pdf"
              target="_blank"
            >
              Download Sample Template
            </Button>
          </div>
          <PrototypeForm
            fields={[
              {
                name: 'file',
                label: 'Upload Filled I-983 Form',
                type: 'upload',
                validation: { required: 'File is required' },
                filename: 'I-983.pdf',
              },
            ]}
            onSubmit={handleI983Submit}
            methods={i983FormMethods}
            submitButtonLabel="Upload"
          />
        </div>
      );
    } else if (status === 'Rejected') {
      return (
        <div style={{ marginBottom: '40px' }}>
          <h3>OPT EAD</h3>
          <p>Your OPT EAD was rejected.</p>
          {feedback && <p>Feedback from HR: {feedback}</p>}
          <p>Please re-upload your OPT EAD.</p>
          <PrototypeForm
            fields={[
              {
                name: 'file',
                label: 'Re-upload OPT EAD',
                type: 'upload',
                validation: { required: 'File is required' },
                filename: 'OPTEAD.pdf',
              },
            ]}
            onSubmit={handleOPTEADSubmit}
            methods={optEADFormMethods}
            submitButtonLabel="Upload"
          />
        </div>
      );
    } else if (status === 'Not Uploaded') {
      return (
        <div style={{ marginBottom: '40px' }}>
          <h3>OPT EAD</h3>
          <p>Your OPT EAD was not uploaded during onboarding.</p>
          <p>Please upload your OPT EAD.</p>
          <PrototypeForm
            fields={[
              {
                name: 'file',
                label: 'Upload OPT EAD',
                type: 'upload',
                validation: { required: 'File is required' },
                filename: 'OPTEAD.pdf',
              },
            ]}
            onSubmit={handleOPTEADSubmit}
            methods={optEADFormMethods}
            submitButtonLabel="Upload"
          />
        </div>
      );
    }

    return null;
  };

  const renderI983Section = () => {
    const { status, feedback, url } = documentStatuses['I-983'];
    const prevDocStatus = documentStatuses['OPTEAD'].status;

    // Only show if previous document is approved
    if (prevDocStatus !== 'Approved') {
      return null;
    }

    if (status === 'Pending') {
      return (
        <div style={{ marginBottom: '40px' }}>
          <h3>I-983</h3>
          <p>Waiting for HR to approve and sign your I-983.</p>
          {url && (
            <Button
              onClick={() => handleViewDocument(url, 'I-983')}
              icon={<DownloadOutlined />}
            >
              View Document
            </Button>
          )}
        </div>
      );
    } else if (status === 'Approved') {
      return (
        <div style={{ marginBottom: '40px' }}>
          <h3>I-983</h3>
          <p>
            Please send the I-983 along with all necessary documents to your school and
            upload the new I-20.
          </p>
          <PrototypeForm
            fields={[
              {
                name: 'file',
                label: 'Upload New I-20',
                type: 'upload',
                validation: { required: 'File is required' },
                filename: 'I-20.pdf',
              },
            ]}
            onSubmit={handleI20Submit}
            methods={i20FormMethods}
            submitButtonLabel="Upload"
          />
        </div>
      );
    } else if (status === 'Rejected') {
      return (
        <div style={{ marginBottom: '40px' }}>
          <h3>I-983</h3>
          <p>Your I-983 was rejected.</p>
          {feedback && <p>Feedback from HR: {feedback}</p>}
          <p>Please re-upload your I-983.</p>
          <PrototypeForm
            fields={[
              {
                name: 'file',
                label: 'Re-upload I-983 Form',
                type: 'upload',
                validation: { required: 'File is required' },
                filename: 'I-983.pdf',
              },
            ]}
            onSubmit={handleI983Submit}
            methods={i983FormMethods}
            submitButtonLabel="Upload"
          />
        </div>
      );
    } else if (status === 'Not Uploaded') {
      return (
        <div style={{ marginBottom: '40px' }}>
          <h3>I-983</h3>
          <p>Your I-983 was not uploaded.</p>
          <p>Please download, fill out, and upload the I-983 form.</p>
          <div style={{ marginBottom: '20px' }}>
            <Button
              icon={<DownloadOutlined />}
              href="/templates/I-983_Empty_Template.pdf"
              target="_blank"
              style={{ marginRight: '10px' }}
            >
              Download Empty Template
            </Button>
            <Button
              icon={<DownloadOutlined />}
              href="/templates/I-983_Sample_Template.pdf"
              target="_blank"
            >
              Download Sample Template
            </Button>
          </div>
          <PrototypeForm
            fields={[
              {
                name: 'file',
                label: 'Upload I-983 Form',
                type: 'upload',
                validation: { required: 'File is required' },
                filename: 'I-983.pdf',
              },
            ]}
            onSubmit={handleI983Submit}
            methods={i983FormMethods}
            submitButtonLabel="Upload"
          />
        </div>
      );
    }

    return null;
  };

  const renderI20Section = () => {
    const { status, feedback, url } = documentStatuses['I-20'];
    const prevDocStatus = documentStatuses['I-983'].status;

    // Only show if previous document is approved
    if (prevDocStatus !== 'Approved') {
      return null;
    }

    if (status === 'Pending') {
      return (
        <div style={{ marginBottom: '40px' }}>
          <h3>I-20</h3>
          <p>Waiting for HR to approve your I-20.</p>
          {url && (
            <Button
              onClick={() => handleViewDocument(url, 'I-20')}
              icon={<DownloadOutlined />}
            >
              View Document
            </Button>
          )}
        </div>
      );
    } else if (status === 'Approved') {
      return (
        <div style={{ marginBottom: '40px' }}>
          <h3>I-20</h3>
          <p>All documents have been approved.</p>
        </div>
      );
    } else if (status === 'Rejected') {
      return (
        <div style={{ marginBottom: '40px' }}>
          <h3>I-20</h3>
          <p>Your I-20 was rejected.</p>
          {feedback && <p>Feedback from HR: {feedback}</p>}
          <p>Please re-upload your I-20.</p>
          <PrototypeForm
            fields={[
              {
                name: 'file',
                label: 'Re-upload I-20',
                type: 'upload',
                validation: { required: 'File is required' },
                filename: 'I-20.pdf',
              },
            ]}
            onSubmit={handleI20Submit}
            methods={i20FormMethods}
            submitButtonLabel="Upload"
          />
        </div>
      );
    } else if (status === 'Not Uploaded') {
      return (
        <div style={{ marginBottom: '40px' }}>
          <h3>I-20</h3>
          <p>Your I-20 was not uploaded.</p>
          <p>Please upload your I-20.</p>
          <PrototypeForm
            fields={[
              {
                name: 'file',
                label: 'Upload I-20',
                type: 'upload',
                validation: { required: 'File is required' },
                filename: 'I-20.pdf',
              },
            ]}
            onSubmit={handleI20Submit}
            methods={i20FormMethods}
            submitButtonLabel="Upload"
          />
        </div>
      );
    }

    return null;
  };

  if (loading || appStatus === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" tip="Loading application data..." />
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
        style={{ margin: '20px' }}
      />
    );
  }

  if (!isApplicable) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>VISA Status Management</h2>
        <p>This page is not applicable to you.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>VISA Status Management</h2>
      {renderOPTReceiptSection()}
      {renderOPTEADSection()}
      {renderI983Section()}
      {renderI20Section()}

      {/* Modal for Document Preview */}
      <Modal
        visible={isModalVisible}
        footer={null}
        onCancel={() => {
          setIsModalVisible(false);
          setFileType('');
          setDocumentBlob(null); // Clear the Blob from local state
        }}
        width={800}
      >
        {documentState.status === 'loading' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Spin size="large" tip="Loading document..." />
          </div>
        )}
        {documentState.status === 'failed' && (
          <Alert
            message="Error"
            description={documentState.error}
            type="error"
            showIcon
          />
        )}
        {documentState.status === 'succeeded' && documentBlob && (
          <>
            {fileType === 'application/pdf' ? (
              <Document
                file={documentBlob}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(error) =>
                  console.error('Error loading PDF:', error)
                }
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={750}
                  />
                ))}
              </Document>
            ) : fileType.startsWith('image/') ? (
              <img
                src={URL.createObjectURL(documentBlob)}
                alt={fileType}
                style={{ width: '100%' }}
              />
            ) : (
              <p>Cannot preview this file type.</p>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default VISAStatusManagementPage;
