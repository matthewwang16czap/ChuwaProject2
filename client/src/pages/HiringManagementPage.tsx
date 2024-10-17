// src/pages/HiringManagementPage.tsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, SubmitHandler } from 'react-hook-form';
import {
  sendInvitation,
  getRegistrationHistory,
  resetStatus,
} from '../features/registration/registrationSlice'; // Adjust the path as needed
import { RootState, AppDispatch } from '../app/store'; // Adjust the path as needed
import PrototypeForm, { Field } from '../forms/PrototypeForm'; // Adjust the path as needed
import { Table, Typography, Alert, Spin } from 'antd';

const { Title } = Typography;

// Define the form inputs
interface InvitationFormInputs {
  email: string;
}

interface RegistrationHistoryRecord {
  key: string;
  email: string;
  fullName: string;
  registrationLink: string;
  status: 'Submitted' | 'Not Submitted';
  createdAt: string;
  expireAt: string;
}

const HiringManagementPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const {
    invitationStatus,
    registrationHistoryStatus,
    registrationHistory,
    error,
  } = useSelector((state: RootState) => state.registration);

  // Initialize useForm and get methods
  const methods = useForm<InvitationFormInputs>();
  const { handleSubmit, reset, control, formState: { errors } } = methods;

  // Local state to manage registration history records
  const [historyRecords, setHistoryRecords] = useState<RegistrationHistoryRecord[]>([]);

  // Fetch all registration history on component mount
  useEffect(() => {
    fetchAllRegistrationHistory();
  }, []);

  // Fetch all registration history function
  const fetchAllRegistrationHistory = async () => {
    try {
      // Dispatch the thunk with fetchAll: true
      const resultAction = await dispatch(getRegistrationHistory({ fetchAll: true }));

      if (getRegistrationHistory.fulfilled.match(resultAction)) {
        const fetchedHistory = resultAction.payload.registrationHistory;

        // Transform fetchedHistory to RegistrationHistoryRecord[]
        const records: RegistrationHistoryRecord[] = fetchedHistory.map((record) => ({
          key: record.token, // Using token as unique key
          email: record.email || 'N/A',
          fullName: record.fullName || 'N/A',
          registrationLink: generateRegistrationLink(record.token),
          status: record.status || 'Not Submitted',
          createdAt: record.createdAt,
          expireAt: record.expireAt,
        }));
        setHistoryRecords(records);
      } else {
        // Handle rejected state
        console.error('Failed to fetch registration history:', resultAction.payload);
      }
    } catch (err) {
      console.error('Failed to fetch registration history:', err);
    }
  };

  // Generate registration link based on token
  const generateRegistrationLink = (token: string): string => {
    return `${window.location.origin}/register?token=${token}`;
  };

  // Handle form submission
  const onSubmit: SubmitHandler<InvitationFormInputs> = (data) => {
    dispatch(resetStatus()); // Reset any previous status or error
    dispatch(sendInvitation({ email: data.email }));
  };

  // Effect to handle invitation status changes
  useEffect(() => {
    if (invitationStatus === 'succeeded') {
      // Reset the form
      reset();
      // Refresh the registration history
      fetchAllRegistrationHistory();
    }
  }, [invitationStatus, reset]);

  // Define fields for the PrototypeForm
  const fields: Field<InvitationFormInputs>[] = [
    {
      name: 'email',
      label: 'Employee Email',
      type: 'input',
      inputType: 'email',
      validation: {
        required: 'Email is required',
        pattern: {
          value: /^\S+@\S+\.\S+$/,
          message: 'Invalid email address',
        },
      },
    },
  ];

  // Define columns for the history table
  const columns = [
    {
      title: 'Email Address',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Registration Link',
      dataIndex: 'registrationLink',
      key: 'registrationLink',
      render: (link: string) => (
        <a href={link} target="_blank" rel="noopener noreferrer">
          View Link
        </a>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span
          style={{
            color: status === 'Submitted' ? 'green' : 'red',
            fontWeight: 'bold',
          }}
        >
          {status}
        </span>
      ),
    },
    {
      title: 'Sent At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Token Expires At',
      dataIndex: 'expireAt',
      key: 'expireAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 border rounded shadow">
      <Title level={2} className="text-center mb-6">
        Hiring Management
      </Title>

      {/* Invitation Form */}
      <div className="mb-8">
        <Title level={4} className="mb-4">
          Generate Registration Token and Send Email
        </Title>
        {invitationStatus === 'succeeded' && (
          <Alert
            message="Invitation Sent"
            description="The invitation has been sent successfully."
            type="success"
            showIcon
            className="mb-4"
          />
        )}
        {invitationStatus === 'failed' && error && (
          <Alert
            message="Error"
            description={typeof error === 'string' ? error : JSON.stringify(error)}
            type="error"
            showIcon
            className="mb-4"
          />
        )}
        <PrototypeForm
          fields={fields}
          onSubmit={onSubmit}
          methods={methods} // Pass the methods prop correctly
          submitButtonLabel={
            invitationStatus === 'loading' ? 'Sending...' : 'Generate Token and Send Email'
          }
          showSubmitButton
        />
      </div>

      {/* Registration History */}
      <div>
        <Title level={4} className="mb-4">
          Registration Token History
        </Title>
        {registrationHistoryStatus === 'loading' ? (
          <div className="flex justify-center items-center my-10">
            <Spin size="large" />
          </div>
        ) : registrationHistoryStatus === 'failed' && error ? (
          <Alert
            message="Error"
            description={typeof error === 'string' ? error : JSON.stringify(error)}
            type="error"
            showIcon
            className="mb-4"
          />
        ) : (
          <Table
            dataSource={historyRecords}
            columns={columns}
            rowKey="key"
            pagination={{ pageSize: 10 }}
            bordered
          />
        )}
        {registrationHistoryStatus === 'succeeded' && historyRecords.length === 0 && (
          <Alert
            message="No Records Found"
            description="No registration tokens have been sent yet."
            type="info"
            showIcon
            className="mt-4"
          />
        )}
      </div>
    </div>
  );
};

export default HiringManagementPage;
