// OnboardingPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PrototypeForm from '../forms/PrototypeForm';
import { useForm } from 'react-hook-form';
import axios from 'axios';

interface IDocument {
  name: string;
  url?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  feedback?: string;
}

interface IWorkAuthorization {
  visaType: 'H1-B' | 'L2' | 'F1(CPT/OPT)' | 'H4' | 'Other';
  visaTitle?: string;
  startDate: Date;
  endDate?: Date;
  documents?: IDocument[];
}

interface IApplication {
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  profilePictureUrl?: string;
  address?: {
    building: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  cellPhone?: string;
  workPhone?: string;
  ssn?: string;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Other';
  citizenship?: 'Green Card' | 'Citizen' | 'Work Authorization';
  workAuthorization?: IWorkAuthorization;
  references?: {
    firstName: string;
    lastName: string;
    middleName?: string;
    phone: string;
    email: string;
    relationship: string;
  };
  emergencyContacts?: {
    firstName: string;
    lastName: string;
    middleName?: string;
    phone: string;
    email: string;
    relationship: string;
  }[];
  documents?: {
    profilePictureUrl?: string;
    driversLicenseUrl?: string;
  };
  status: 'Pending' | 'Approved' | 'Rejected';
  feedback?: string;
}

const OnboardingPage: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [applicationData, setApplicationData] = useState<IApplication | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const navigate = useNavigate();

  const methods = useForm<IApplication>({
    defaultValues: applicationData || {},
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
    // Fetch application status and data
    const fetchApplicationData = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await axios.get('/api/onboarding/application');
        const { status, data, feedback } = response.data;
        setStatus(status);
        setApplicationData(data || {});
        setFeedback(feedback || '');
        reset(data || {});
      } catch (error) {
        console.error('Error fetching application data:', error);
      }
    };

    fetchApplicationData();
  }, [reset]);

  useEffect(() => {
    // Redirect to home page if approved
    if (status === 'Approved') {
      navigate('/home');
    }
  }, [status, navigate]);

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

  const onSubmit = async (data: IApplication) => {
    try {
      // Convert file uploads to appropriate format if needed
      const formData = new FormData();
      for (const key in data) {
        if (key === 'documents' && data.documents?.profilePictureUrl instanceof FileList) {
          formData.append('profilePicture', data.documents.profilePictureUrl[0]);
        } else if (key === 'workAuthorization' && data.workAuthorization?.documents) {
          // Handle work authorization documents
          data.workAuthorization.documents.forEach((doc, index) => {
            if (doc.url instanceof FileList) {
              formData.append(`workAuthorization.documents[${index}].url`, doc.url[0]);
            } else {
              formData.append(`workAuthorization.documents[${index}].url`, doc.url || '');
            }
          });
        } else {
          formData.append(key, JSON.stringify(data[key]));
        }
      }

      // Replace with your actual API endpoint
      const response = await axios.post('/api/onboarding/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(formData);
      console.log('Submission successful:', response.data);
      setStatus('Pending');
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

  if (status === 'Pending') {
    return (
      <div>
        <h2>Please wait for HR to review your application.</h2>
        <h3>Your Submitted Application</h3>
        <pre>{JSON.stringify(applicationData, null, 2)}</pre>
        <h3>Uploaded Documents</h3>
        <ul>
          {applicationData?.workAuthorization?.documents?.map((doc, index) => (
            <li key={index}>
              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                {doc.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (status === 'Rejected' || status === 'Never submitted' || status === '') {
    return (
      <div>
        <h2>Onboarding Application</h2>
        {status === 'Rejected' && (
          <div>
            <h3>Your application was rejected.</h3>
            <p>Feedback: {feedback}</p>
          </div>
        )}
        <PrototypeForm fields={getFields()} onSubmit={onSubmit} methods={methods} />
      </div>
    );
  }

  return <div>Loading...</div>;
};

export default OnboardingPage;
