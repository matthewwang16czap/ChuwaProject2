// OnboardingPage.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PrototypeForm from '../forms/PrototypeForm';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store'; // Adjust the path as needed
import {
  getMyApplicationThunk,
  updateApplicationThunk,
  submitApplicationThunk,
  uploadFileThunk,
} from '../features/application/applicationSlice'; // Adjust the path as needed
import { Alert, Spin, notification, Typography } from 'antd';
import moment from 'moment'; // Ensure moment is installed: npm install moment

const { Title } = Typography;

const OnboardingPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  // Selectors to access Redux state
  const { application, status: appStatus, error: appError, message } = useSelector(
    (state: RootState) => state.application
  );

  // Local state for feedback (optional, based on your logic)
  const [feedback, setFeedback] = useState<string>('');

  // Initialize react-hook-form with default values from application data
  const methods = useForm<any>({
    defaultValues: application || {},
  });

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = methods;

  const citizenship = watch('citizenship');
  const visaType = watch('workAuthorization.visaType');

  useEffect(() => {
    // Fetch application data from Redux store
    dispatch(getMyApplicationThunk());
    console.log("Dispatched getMyApplicationThunk");
  }, [dispatch]);

  useEffect(() => {
    // Update form with fetched application data
    if (application) {
      console.log("Application data received:", application);
      reset(application);
      setFeedback(application.feedback || '');
    } else {
      console.log("No application data available");
    }
  }, [application, reset]);

  useEffect(() => {
    // Navigate to home if application is approved
    if (application && application.status === 'Approved') {
      console.log("Application approved, navigating to home");
      notification.success({
        message: 'Application Approved',
        description: 'Your onboarding application has been approved. Welcome aboard!',
      });
      navigate('/home');
    }
  }, [application, navigate]);

  useEffect(() => {
    // Display success message upon successful submission
    if (message) {
      console.log("Submission message:", message);
      notification.success({
        message: 'Application Submitted',
        description: message,
      });
    }
  }, [message]);

  const getFields = () => {
    const fields = [
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
        validation: { required: 'Profile picture is required' },
      },
      {
        name: 'address.building',
        label: 'Building/Apt #',
        type: 'input',
      },
      {
        name: 'address.street',
        label: 'Street Name',
        type: 'input',
      },
      {
        name: 'address.city',
        label: 'City',
        type: 'input',
      },
      {
        name: 'address.state',
        label: 'State',
        type: 'input',
      },
      {
        name: 'address.zip',
        label: 'Zip Code',
        type: 'input',
      },
      {
        name: 'cellPhone',
        label: 'Cell Phone Number',
        type: 'input',
        validation: {
          pattern: {
            value: /^(\+?\d{1,3}[- ]?)?\d{10}$/,
            message: 'Invalid phone number',
          },
        },
      },
      {
        name: 'workPhone',
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
        disabled: false,
        validation: {
          required: 'Email is required',
          pattern: {
            value: /^\S+@\S+$/i,
            message: 'Invalid email address',
          },
        },
      },
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
      {
        name: 'citizenship',
        label: 'Citizenship Status',
        type: 'radio',
        options: [
          { label: 'Green Card', value: 'Green Card' },
          { label: 'Citizen', value: 'Citizen' },
          { label: 'Work Authorization', value: 'Work Authorization' },
        ],
        validation: { required: 'Citizenship status is required' },
      },
    ];

    if (citizenship === 'Work Authorization') {
      fields.push({
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
      });

      if (visaType === 'F1(CPT/OPT)') {
        fields.push({
          name: 'workAuthorization.documents[0].url',
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

      fields.push(
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
    }

    return fields;
  };

  const onSubmit = async (data: any) => {
    try {
      // Handle file uploads before submitting the form
      // Assuming profilePictureUrl and workAuthorization.documents are files
      if (
        data.documents &&
        data.documents.profilePictureUrl &&
        data.documents.profilePictureUrl instanceof File
      ) {
        console.log("Uploading profile picture:", data.documents.profilePictureUrl);
        const uploadResponse = await dispatch(
          uploadFileThunk({ file: data.documents.profilePictureUrl })
        ).unwrap();
        data.documents.profilePictureUrl = uploadResponse.filePath;
      }

      if (
        data.workAuthorization &&
        data.workAuthorization.documents &&
        data.workAuthorization.documents[0].url &&
        data.workAuthorization.documents[0].url instanceof File
      ) {
        console.log("Uploading work authorization document:", data.workAuthorization.documents[0].url);
        const uploadResponse = await dispatch(
          uploadFileThunk({ file: data.workAuthorization.documents[0].url })
        ).unwrap();
        data.workAuthorization.documents[0].url = uploadResponse.filePath;
      }

      // Dispatch updateApplicationThunk to update the application data
      await dispatch(updateApplicationThunk({ updateData: data })).unwrap();
      console.log("Application updated successfully.");

      // Dispatch submitApplicationThunk to submit the application
      await dispatch(submitApplicationThunk()).unwrap();
      console.log("Application submitted successfully.");

      // Notify user of successful submission
      notification.success({
        message: 'Application Submitted',
        description: 'Your onboarding application has been submitted successfully and is pending review.',
      });
    } catch (error: any) {
      console.error('Error submitting application:', error);
      notification.error({
        message: 'Submission Failed',
        description: error || 'There was an error submitting your application.',
      });
    }
  };

  // Display loading state
  if (appStatus === 'loading') {
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
          <Title level={2} className="text-center my-6">Please wait for HR to review your application.</Title>
          <Title level={4} className="my-4">Your Submitted Application</Title>
          <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(application, null, 2)}</pre>
          <Title level={4} className="my-4">Uploaded Documents</Title>
          <ul className="list-disc list-inside">
            {application.workAuthorization?.documents?.map((doc: any, index: number) => (
              <li key={index}>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                  {doc.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (application.status === 'Rejected') {
      return (
        <div>
          <Title level={2} className="text-center my-6">Your application was rejected.</Title>
          <div className="mb-6">
            <Alert
              message="Feedback"
              description={application.feedback || 'No feedback provided.'}
              type="warning"
              showIcon
            />
          </div>
          <Title level={4} className="my-4">Resubmit Your Application</Title>
          <PrototypeForm fields={getFields()} onSubmit={onSubmit} methods={methods} />
        </div>
      );
    }

    if (application.status === 'Never submitted' || !application.status) {
      return (
        <div>
          <Title level={2} className="text-center my-6">Onboarding Application</Title>
          <PrototypeForm fields={getFields()} onSubmit={onSubmit} methods={methods} />
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
