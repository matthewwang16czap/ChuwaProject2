// ReviewOnboardingApplication.tsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllEmployeeUsers,
  IUser,
} from '../features/user/userSlice';
import {
  decideApplicationThunk,
} from '../features/application/applicationSlice';
import { RootState, AppDispatch } from '../app/store';
import { Table, Button, Typography, Spin, Alert, Modal, Input, message } from 'antd';

const { Title } = Typography;
const { TextArea } = Input;

const ReviewOnboardingApplication: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();

  const { employeeUsers, employeeUsersStatus, error } = useSelector(
    (state: RootState) => state.user
  );

  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    dispatch(getAllEmployeeUsers({}));
  }, [dispatch]);

  if (employeeUsersStatus === 'loading' || !employeeUsers) {
    return (
      <div className="flex justify-center items-center my-10">
        <Spin size="large" />
      </div>
    );
  }

  if (employeeUsersStatus === 'failed') {
    return (
      <Alert
        message="Error"
        description={error || 'Failed to load employee users.'}
        type="error"
        showIcon
      />
    );
  }

  // Filter applications by status
  const pendingApplications = employeeUsers.filter(
    (user) => user.employeeId.applicationId?.status === 'Pending'
  );
  const rejectedApplications = employeeUsers.filter(
    (user) => user.employeeId.applicationId?.status === 'Rejected'
  );
  const approvedApplications = employeeUsers.filter(
    (user) => user.employeeId.applicationId?.status === 'Approved'
  );

  // Define columns for the table
  const columns = [
    {
      title: 'Full Name',
      dataIndex: ['employeeId', 'fullName'],
      key: 'fullName',
      render: (_: any, record: IUser) =>
        `${record.employeeId.firstName} ${record.employeeId.lastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'View Application',
      key: 'viewApplication',
      render: (_: any, record: IUser) => (
        <a
          href={`/onboarding-application/${record.employeeId.applicationId._id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Application
        </a>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: IUser) => {
        if (record.employeeId.applicationId?.status === 'Pending') {
          return (
            <div>
              <Button
                type="primary"
                onClick={() => handleApprove(record.employeeId.applicationId._id)}
                style={{ marginRight: 8 }}
              >
                Approve
              </Button>
              <Button danger onClick={() => openFeedbackModal(record)}>
                Reject
              </Button>
            </div>
          );
        } else {
          return null;
        }
      },
    },
  ];

  // Handlers
  const handleApprove = async (applicationId: string) => {
    try {
      await dispatch(
        decideApplicationThunk({
          applicationId,
          status: 'Approved',
        })
      ).unwrap();
      message.success('Application approved successfully');
      dispatch(getAllEmployeeUsers({}));
    } catch (err) {
      message.error(err as string);
    }
  };

  const openFeedbackModal = (user: IUser) => {
    setSelectedApplication(user.employeeId.applicationId);
    setFeedback('');
    setFeedbackModalVisible(true);
  };

  const handleReject = async () => {
    if (!selectedApplication) return;
    try {
      await dispatch(
        decideApplicationThunk({
          applicationId: selectedApplication._id,
          status: 'Rejected',
          feedback,
        })
      ).unwrap();
      message.success('Application rejected with feedback');
      setFeedbackModalVisible(false);
      dispatch(getAllEmployeeUsers({}));
    } catch (err) {
      message.error(err as string);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Title level={2}>Onboarding Application Review</Title>

      {/* Pending Applications */}
      <div>
        <Title level={3}>Pending Applications</Title>
        <Table
          dataSource={pendingApplications}
          columns={columns}
          rowKey={(record) => record.employeeId.applicationId._id}
        />
      </div>

      {/* Rejected Applications */}
      <div>
        <Title level={3}>Rejected Applications</Title>
        <Table
          dataSource={rejectedApplications}
          columns={columns.filter((col) => col.key !== 'actions')}
          rowKey={(record) => record.employeeId.applicationId._id}
        />
      </div>

      {/* Approved Applications */}
      <div>
        <Title level={3}>Approved Applications</Title>
        <Table
          dataSource={approvedApplications}
          columns={columns.filter((col) => col.key !== 'actions')}
          rowKey={(record) => record.employeeId.applicationId._id}
        />
      </div>

      {/* Feedback Modal */}
      <Modal
        title="Provide Feedback"
        open={feedbackModalVisible}
        onOk={handleReject}
        onCancel={() => setFeedbackModalVisible(false)}
      >
        <TextArea
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Please provide feedback for rejection"
        />
      </Modal>
    </div>
  );
};

export default ReviewOnboardingApplication;
