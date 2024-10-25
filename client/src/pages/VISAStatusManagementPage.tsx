// VISAStatusManagementPage.tsx

import React, { useEffect, useState } from 'react';
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
import { useForm, UseFormReturn } from 'react-hook-form';
import PrototypeForm, { Field } from '../forms/PrototypeForm';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

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

  const documentsInOrder = ['OPTReceipt', 'OPTEAD', 'I-983', 'I-20'];

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

  const getDocumentStatuses = () => {
    const statuses: {
      [key: string]: { status: string; feedback?: string; url?: string };
    } = {};
    documentsInOrder.forEach((docName) => {
      const docStatus = getDocumentStatus(docName);
      statuses[docName] = docStatus;
    });
    return statuses;
  };

  const documentStatuses = getDocumentStatuses();

  // Submission handlers
  const handleUploadSubmit = async (documentName: string, fileUrl: string) => {
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
      const blob = await dispatch(fetchDocument({ userId, filename })).unwrap();

      // Set the Blob in local state
      setDocumentBlob(blob);

      // Determine file type
      const extension = filename.split('.').pop()?.toLowerCase();
      let fileType = '';
      if (extension === 'pdf') {
        fileType = 'application/pdf';
      } else if (
        ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension || '')
      ) {
        fileType = 'image/' + extension;
      } else {
        fileType = 'unknown';
      }

      setFileType(fileType);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error fetching document:', error);
      message.error('Failed to fetch document');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: any) => {
    setNumPages(numPages);
  };

  const renderOPTReceiptSection = () => {
    const { status, feedback, url } = documentStatuses['OPTReceipt'];

    if (status === 'Pending') {
      return (
        <div>
          <h3>OPTReceipt</h3>
          <p>Waiting for HR to approve your OPTReceipt.</p>
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
      return null; // Proceed to next document
    } else if (status === 'Rejected' || status === 'Not Uploaded') {
      return (
        <div>
          <h3>OPTReceipt</h3>
          {status === 'Rejected' && (
            <>
              <p>Your OPTReceipt was rejected.</p>
              {feedback && <p>Feedback from HR: {feedback}</p>}
            </>
          )}
          {status === 'Not Uploaded' && (
            <p>Your OPTReceipt was not uploaded during onboarding.</p>
          )}
          <p>Please upload your OPTReceipt.</p>
          <PrototypeForm
            fields={[
              {
                name: 'file',
                label: `Upload OPTReceipt`,
                type: 'upload',
                validation: { required: 'File is required' },
                filename: `OPTReceipt.pdf`,
              },
            ]}
            onSubmit={handleOPTReceiptSubmit}
            methods={optReceiptFormMethods}
            submitButtonLabel="Upload"
          />
        </div>
      );
    }
  };

  // Similar render functions for other documents...
  const renderOPTEADSection = () => {
    const { status, feedback, url } = documentStatuses['OPTEAD'];
    const previousDocStatus = documentStatuses['OPTReceipt'].status;

    if (previousDocStatus !== 'Approved') {
      return null;
    }

    if (status === 'Pending') {
      return (
        <div>
          <h3>OPTEAD</h3>
          <p>Waiting for HR to approve your OPTEAD.</p>
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
      return null; // Proceed to next document
    } else if (status === 'Rejected' || status === 'Not Uploaded') {
      return (
        <div>
          <h3>OPTEAD</h3>
          {status === 'Rejected' && (
            <>
              <p>Your OPTEAD was rejected.</p>
              {feedback && <p>Feedback from HR: {feedback}</p>}
            </>
          )}
          {status === 'Not Uploaded' && <p>Please upload your OPTEAD.</p>}
          <PrototypeForm
            fields={[
              {
                name: 'file',
                label: `Upload OPTEAD`,
                type: 'upload',
                validation: { required: 'File is required' },
                filename: `OPTEAD.pdf`,
              },
            ]}
            onSubmit={handleOPTEADSubmit}
            methods={optEADFormMethods}
            submitButtonLabel="Upload"
          />
        </div>
      );
    }
  };

  const renderI983Section = () => {
    const { status, feedback, url } = documentStatuses['I-983'];
    const previousDocStatus = documentStatuses['OPTEAD'].status;

    if (previousDocStatus !== 'Approved') {
      return null;
    }

    if (status === 'Pending') {
      return (
        <div>
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
        <div>
          <h3>I-983</h3>
          <p>Your I-983 has been approved.</p>
          <p>
            Please send the I-983 along with all necessary documents to your school
            and upload the new I-20.
          </p>
        </div>
      );
    } else if (status === 'Rejected' || status === 'Not Uploaded') {
      return (
        <div>
          <h3>I-983</h3>
          {status === 'Rejected' && (
            <>
              <p>Your I-983 was rejected.</p>
              {feedback && <p>Feedback from HR: {feedback}</p>}
            </>
          )}
          {status === 'Not Uploaded' && (
            <>
              <p>Please download and fill out the I-983 form.</p>
              <Button
                icon={<DownloadOutlined />}
                href="/templates/I-983_Empty_Template.pdf"
                target="_blank"
              >
                Download Empty Template
              </Button>
              <Button
                icon={<DownloadOutlined />}
                href="/templates/I-983_Sample_Template.pdf"
                target="_blank"
                style={{ marginLeft: 10 }}
              >
                Download Sample Template
              </Button>
            </>
          )}
          <p>After filling out the form, please upload it below.</p>
          <PrototypeForm
            fields={[
              {
                name: 'file',
                label: `Upload I-983`,
                type: 'upload',
                validation: { required: 'File is required' },
                filename: `I-983.pdf`,
              },
            ]}
            onSubmit={handleI983Submit}
            methods={i983FormMethods}
            submitButtonLabel="Upload"
          />
        </div>
      );
    }
  };

  const renderI20Section = () => {
    const { status, feedback, url } = documentStatuses['I-20'];
    const previousDocStatus = documentStatuses['I-983'].status;

    if (previousDocStatus !== 'Approved') {
      return null;
    }

    if (status === 'Pending') {
      return (
        <div>
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
        <div>
          <h3>I-20</h3>
          <p>All documents have been approved.</p>
        </div>
      );
    } else if (status === 'Rejected' || status === 'Not Uploaded') {
      return (
        <div>
          <h3>I-20</h3>
          {status === 'Rejected' && (
            <>
              <p>Your I-20 was rejected.</p>
              {feedback && <p>Feedback from HR: {feedback}</p>}
            </>
          )}
          <p>Please upload your new I-20.</p>
          <PrototypeForm
            fields={[
              {
                name: 'file',
                label: `Upload I-20`,
                type: 'upload',
                validation: { required: 'File is required' },
                filename: `I-20.pdf`,
              },
            ]}
            onSubmit={handleI20Submit}
            methods={i20FormMethods}
            submitButtonLabel="Upload"
          />
        </div>
      );
    }
  };

  if (loading || appStatus === 'loading') {
    return (
      <div className="flex justify-center items-center my-10">
        <Spin size="large" />
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
        className="mb-6"
      />
    );
  }

  if (
    !application ||
    application.citizenship !== 'WorkAuthorization' ||
    application.workAuthorization?.visaType !== 'F1(CPT/OPT)'
  ) {
    return (
      <div>
        <h2>VISA Status Management</h2>
        <p>This page is not applicable to you.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>VISA Status Management</h2>
      {renderOPTReceiptSection()}
      {renderOPTEADSection()}
      {renderI983Section()}
      {renderI20Section()}

      {/* Modal for Document Preview */}
      <Modal
        open={isModalVisible}
        footer={null}
        onCancel={() => {
          setIsModalVisible(false);
          setFileType('');
          setDocumentBlob(null); // Clear the Blob from local state
        }}
        width={800}
      >
        {documentState.status === 'loading' && (
          <div className="flex justify-center items-center">
            <Spin size="large" />
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
                alt={documentBlob.type}
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
