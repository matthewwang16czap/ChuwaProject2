// OnboardingPage.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PrototypeForm, { Field } from '../forms/PrototypeForm';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import {
  getMyApplicationThunk,
  updateApplicationThunk,
  submitApplicationThunk,
  uploadFileThunk,
} from '../features/application/applicationSlice';
import { Alert, Spin, notification, Typography, Modal } from 'antd';
import { Document, Page, pdfjs } from 'react-pdf';
import { useEffectOnce } from 'react-use'; // Optional, for cleanup

// Set the PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const { Title } = Typography;

const OnboardingPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  // State for document preview
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [numPages, setNumPages] = useState<number>(0);

  // Selectors to access Redux state
  const { application, status: appStatus, error: appError } = useSelector(
    (state: RootState) => state.application
  );
  const { user } = useSelector((state: RootState) => state.user);

  // Initialize react-hook-form with default values from application data
  const methods = useForm<any>({
    defaultValues: application || {},
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const {
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    setError,
  } = methods;

  // Watch for dynamic fields
  const citizenship = watch('citizenship');
  const visaType = watch('workAuthorization.visaType');

  useEffect(() => {
    // Fetch application data when component mounts
    dispatch(getMyApplicationThunk());
  }, [dispatch]);

  useEffect(() => {
    // Update form with fetched application data
    if (application) {
      reset(application);
      console.log('application.status:', application.status);
    }
  }, [application, reset]);

  useEffect(() => {
    // Redirect to home if application is approved
    if (application && application.status === 'Approved') {
      notification.success({
        message: 'Application Approved',
        description:
          'Your onboarding application has been approved. Welcome aboard!',
      });
      navigate('/home');
    }
  }, [application, navigate]);

  // Clean up the object URL when the component unmounts
  useEffect(() => {
    return () => {
      if (selectedDocumentUrl) {
        URL.revokeObjectURL(selectedDocumentUrl);
      }
    };
  }, [selectedDocumentUrl]);

  const handleViewDocument = async (url: string) => {
    try {
      const token = localStorage.getItem('jwtToken'); // Adjust if you store the token elsewhere
      const response = await fetch(`http://localhost:5000/${url}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }

      const blob = await response.blob();
      const fileType = blob.type;
      const objectUrl = URL.createObjectURL(blob);
      setSelectedDocumentUrl(objectUrl);
      setFileType(fileType);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error fetching document:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch document.',
      });
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: any) => {
    setNumPages(numPages);
  };

  const getFields = (): Field<any>[] => {
    const fields: Field<any>[] = [
      // Section: Personal Information
      {
        name: 'firstName',
        label: 'First Name',
        type: 'input',
        validation: { required: 'First name is required' },
      },
      {
        name: 'lastName',
        label: 'Last Name',
        type: 'input',
        validation: { required: 'Last name is required' },
      },
      {
        name: 'middleName',
        label: 'Middle Name',
        type: 'input',
      },
      {
        name: 'preferredName',
        label: 'Preferred Name',
        type: 'input',
      },
      {
        name: 'documents.profilePictureUrl',
        label: 'Profile Picture',
        type: 'upload',
        placeholder: 'Upload your profile picture',
        validation: { required: 'Profile picture is required' },
      },
      // Section: Address
      {
        name: 'address.building',
        label: 'Building/Apt #',
        type: 'input',
        validation: { required: 'Building/Apt # is required' },
      },
      {
        name: 'address.street',
        label: 'Street Name',
        type: 'input',
        validation: { required: 'Street name is required' },
      },
      {
        name: 'address.city',
        label: 'City',
        type: 'input',
        validation: { required: 'City is required' },
      },
      {
        name: 'address.state',
        label: 'State',
        type: 'input',
        validation: { required: 'State is required' },
      },
      {
        name: 'address.zip',
        label: 'Zip Code',
        type: 'input',
        validation: { required: 'Zip code is required' },
      },
      // Section: Contact Information
      {
        name: 'contactInfo.cellPhone',
        label: 'Cell Phone Number',
        type: 'input',
        validation: {
          required: 'Cell phone number is required',
          pattern: {
            value: /^(\+?\d{1,3}[- ]?)?\d{10}$/,
            message: 'Invalid phone number',
          },
        },
      },
      {
        name: 'contactInfo.workPhone',
        label: 'Work Phone Number',
        type: 'input',
        validation: {
          pattern: {
            value: /^(\+?\d{1,3}[- ]?)?\d{10}$/,
            message: 'Invalid phone number',
          },
        },
      },
      {
        name: 'email',
        label: 'Email',
        type: 'input',
        disabled: true, // Email cannot be edited
        defaultValue: user?.email,
      },
      // Section: Additional Information
      {
        name: 'ssn',
        label: 'SSN',
        type: 'input',
        validation: {
          required: 'SSN is required',
          pattern: {
            value: /^\d{9}$/,
            message: 'SSN must be 9 digits',
          },
        },
      },
      {
        name: 'dateOfBirth',
        label: 'Date of Birth',
        type: 'date',
        validation: { required: 'Date of birth is required' },
      },
      {
        name: 'gender',
        label: 'Gender',
        type: 'radio',
        options: [
          { label: 'Male', value: 'Male' },
          { label: 'Female', value: 'Female' },
          { label: 'Other', value: 'Other' },
        ],
        validation: { required: 'Gender is required' },
      },
      // Section: Citizenship
      {
        name: 'citizenship',
        label: 'Citizenship Status',
        type: 'radio',
        options: [
          { label: 'Green Card', value: 'GreenCard' },
          { label: 'Citizen', value: 'Citizen' },
          { label: 'Work Authorization', value: 'WorkAuthorization' },
        ],
        validation: { required: 'Citizenship status is required' },
      },
    ];

    // Conditional Fields for Citizenship
    if (citizenship === 'WorkAuthorization') {
      fields.push(
        {
          name: 'workAuthorization.visaType',
          label: 'What is your work authorization?',
          type: 'select',
          options: [
            { label: 'H1-B', value: 'H1-B' },
            { label: 'L2', value: 'L2' },
            { label: 'F1(CPT/OPT)', value: 'F1(CPT/OPT)' },
            { label: 'H4', value: 'H4' },
            { label: 'Other', value: 'Other' },
          ],
          validation: { required: 'Work authorization is required' },
        },
        {
          name: 'workAuthorization.startDate',
          label: 'Start Date',
          type: 'date',
          validation: { required: 'Start date is required' },
        },
        {
          name: 'workAuthorization.endDate',
          label: 'End Date',
          type: 'date',
          validation: { required: 'End date is required' },
        }
      );

      if (visaType === 'F1(CPT/OPT)') {
        fields.push({
          name: 'workAuthorization.documents',
          label: 'Upload OPT Receipt',
          type: 'upload',
          validation: { required: 'OPT Receipt is required' },
        });
      } else if (visaType === 'Other') {
        fields.push({
          name: 'workAuthorization.visaTitle',
          label: 'Specify the visa title',
          type: 'input',
          validation: { required: 'Visa title is required' },
        });
      }
    }

    // Section: Reference
    fields.push(
      {
        name: 'references.firstName',
        label: 'Reference First Name',
        type: 'input',
        validation: { required: 'Reference first name is required' },
      },
      {
        name: 'references.lastName',
        label: 'Reference Last Name',
        type: 'input',
        validation: { required: 'Reference last name is required' },
      },
      {
        name: 'references.middleName',
        label: 'Reference Middle Name',
        type: 'input',
      },
      {
        name: 'references.phone',
        label: 'Reference Phone',
        type: 'input',
        validation: {
          required: 'Reference phone is required',
          pattern: {
            value: /^(\+?\d{1,3}[- ]?)?\d{10}$/,
            message: 'Invalid phone number',
          },
        },
      },
      {
        name: 'references.email',
        label: 'Reference Email',
        type: 'input',
        validation: {
          required: 'Reference email is required',
          pattern: {
            value: /^\S+@\S+$/i,
            message: 'Invalid email address',
          },
        },
      },
      {
        name: 'references.relationship',
        label: 'Relationship',
        type: 'input',
        validation: { required: 'Relationship is required' },
      }
    );

    // Section: Emergency Contact
    fields.push(
      {
        name: 'emergencyContact.firstName',
        label: 'Emergency Contact First Name',
        type: 'input',
        validation: { required: 'Emergency contact first name is required' },
      },
      {
        name: 'emergencyContact.lastName',
        label: 'Emergency Contact Last Name',
        type: 'input',
        validation: { required: 'Emergency contact last name is required' },
      },
      {
        name: 'emergencyContact.middleName',
        label: 'Emergency Contact Middle Name',
        type: 'input',
      },
      {
        name: 'emergencyContact.phone',
        label: 'Emergency Contact Phone',
        type: 'input',
        validation: {
          required: 'Emergency contact phone is required',
          pattern: {
            value: /^(\+?\d{1,3}[- ]?)?\d{10}$/,
            message: 'Invalid phone number',
          },
        },
      },
      {
        name: 'emergencyContact.email',
        label: 'Emergency Contact Email',
        type: 'input',
        validation: {
          required: 'Emergency contact email is required',
          pattern: {
            value: /^\S+@\S+$/i,
            message: 'Invalid email address',
          },
        },
      },
      {
        name: 'emergencyContact.relationship',
        label: 'Emergency Contact Relationship',
        type: 'input',
        validation: { required: 'Emergency contact relationship is required' },
      }
    );

    // Section: Driver's License Upload
    fields.push({
      name: 'documents.driverLicenseUrl',
      label: 'Driver’s License',
      type: 'upload',
      validation: { required: 'Driver’s License is required' },
    });

    return fields;
  };

  const onSubmit = async (data: any) => {
    try {
      // Handle file uploads
      const uploadedFiles: any = {};

      // Upload Profile Picture
      if (data.documents?.profilePictureUrl instanceof File) {
        const uploadResponse = await dispatch(
          uploadFileThunk({ file: data.documents.profilePictureUrl })
        ).unwrap();
        uploadedFiles.profilePictureUrl = uploadResponse.filePath;
      }

      // Upload Driver's License
      if (data.documents?.driverLicenseUrl instanceof File) {
        const uploadResponse = await dispatch(
          uploadFileThunk({ file: data.documents.driverLicenseUrl })
        ).unwrap();
        uploadedFiles.driverLicenseUrl = uploadResponse.filePath;
      }

      // Upload Work Authorization Documents
      if (data.workAuthorization?.documents instanceof File) {
        const uploadResponse = await dispatch(
          uploadFileThunk({ file: data.workAuthorization.documents })
        ).unwrap();
        data.workAuthorization.documents = [
          {
            name: 'OPTReceipt',
            url: uploadResponse.filePath,
            status: 'Pending',
          },
        ];
      }

      // Update application data with uploaded file paths
      data.documents = {
        ...data.documents,
        ...uploadedFiles,
      };

      // Dispatch updateApplicationThunk to update the application data
      await dispatch(updateApplicationThunk({ updateData: data })).unwrap();

      // Dispatch submitApplicationThunk to submit the application
      await dispatch(submitApplicationThunk()).unwrap();

      // Notify user of successful submission
      notification.success({
        message: 'Application Submitted',
        description:
          'Your onboarding application has been submitted successfully and is pending review.',
      });
    } catch (error: any) {
      console.error('Error submitting application:', error);

      // Handle backend validation errors
      if (error && error.emptyFields && Array.isArray(error.emptyFields)) {
        error.emptyFields.forEach((fieldName: string) => {
          setError(fieldName, {
            type: 'manual',
            message: 'This field is required',
          });
        });

        notification.error({
          message: 'Submission Failed',
          description: 'Please fill out all required fields highlighted in red.',
          duration: 10,
        });
      } else {
        notification.error({
          message: 'Submission Failed',
          description:
            error.message || 'There was an error submitting your application.',
        });
      }
    }
  };

  // New onError function to handle validation errors
  const onError = (errors: any) => {
    console.error('Form validation errors:', errors);
    // Extract field names with errors
    const errorFields = Object.keys(errors).map((fieldName) => {
      return fieldName.replace('.', ' ').replace(/([A-Z])/g, ' $1').trim();
    });
    notification.error({
      message: 'Submission Failed',
      description: `Please correct the following fields: ${errorFields.join(
        ', '
      )}`,
      duration: 10,
    });
  };

  // Display loading state
  if (appStatus === 'loading' || !application) {
    return (
      <div className="flex justify-center items-center my-10">
        <Spin size="large" />
      </div>
    );
  }

  // Display error state
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

  // Conditional Rendering based on application status
  if (application) {
    if (application.status === 'Pending') {
      return (
        <div>
          <Title level={2} className="text-center my-6">
            Please wait for HR to review your application.
          </Title>
          <Title level={4} className="my-4">
            Your Submitted Application
          </Title>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(application, null, 2)}
          </pre>
          <Title level={4} className="my-4">
            Uploaded Documents
          </Title>
          <ul className="list-disc list-inside">
            {application.documents?.profilePictureUrl && (
              <li>
                Profile Picture:{' '}
                <span
                  onClick={() =>
                    handleViewDocument(application.documents.profilePictureUrl)
                  }
                  className="text-blue-500 underline cursor-pointer"
                >
                  View
                </span>
              </li>
            )}
            {application.documents?.driverLicenseUrl && (
              <li>
                Driver’s License:{' '}
                <span
                  onClick={() =>
                    handleViewDocument(application.documents.driverLicenseUrl)
                  }
                  className="text-blue-500 underline cursor-pointer"
                >
                  View
                </span>
              </li>
            )}
            {application.workAuthorization?.documents &&
              application.workAuthorization.documents.map(
                (doc: any, index: number) => (
                  <li key={index}>
                    {doc.name}:{' '}
                    <span
                      onClick={() => handleViewDocument(doc.url)}
                      className="text-blue-500 underline cursor-pointer"
                    >
                      View
                    </span>
                  </li>
                )
              )}
          </ul>

          {/* Modal for Document Preview */}
          <Modal
            visible={isModalVisible}
            footer={null}
            onCancel={() => {
              setIsModalVisible(false);
              setSelectedDocumentUrl('');
              setFileType('');
            }}
            width={800}
          >
            {fileType === 'application/pdf' && selectedDocumentUrl && (
              <Document
                file={selectedDocumentUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(error) => console.error('Error loading PDF:', error)}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={750}
                  />
                ))}
              </Document>
            )}
            {fileType.startsWith('image/') && selectedDocumentUrl && (
              <img
                src={selectedDocumentUrl}
                alt="Document Preview"
                style={{ width: '100%' }}
              />
            )}
            {!fileType.startsWith('image/') && fileType !== 'application/pdf' && (
              <p>Cannot preview this file type.</p>
            )}
          </Modal>
        </div>
      );
    } else if (application.status === 'Rejected') {
      return (
        <div>
          <Title level={2} className="text-center my-6">
            Your application was rejected.
          </Title>
          <div className="mb-6">
            <Alert
              message="Feedback"
              description={application.feedback || 'No feedback provided.'}
              type="warning"
              showIcon
            />
          </div>
          <Title level={4} className="my-4">
            Resubmit Your Application
          </Title>
          <PrototypeForm
            fields={getFields()}
            onSubmit={handleSubmit(onSubmit, onError)}
            methods={methods}
          />
        </div>
      );
    } else if (
      application.status === 'NeverSubmitted' ||
      !application.status
    ) {
      return (
        <div>
          <Title level={2} className="text-center my-6">
            Onboarding Application
          </Title>
          <PrototypeForm
            fields={getFields()}
            onSubmit={handleSubmit(onSubmit, onError)}
            methods={methods}
          />
        </div>
      );
    } else {
      // Default case for any other status
      return (
        <div>
          <Title level={2} className="text-center my-6">
            Onboarding Application
          </Title>
          <PrototypeForm
            fields={getFields()}
            onSubmit={handleSubmit(onSubmit, onError)}
            methods={methods}
          />
        </div>
      );
    }
  }

  // Default loading state if application is not yet loaded
  return (
    <div className="flex justify-center items-center my-10">
      <Spin size="large" />
    </div>
  );
};

export default OnboardingPage;
