// OnboardingApplicationDetails.tsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getApplicationThunk,
  decideApplicationThunk,
} from '../features/application/applicationSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { Spin, Alert, Button, Modal, Input, Typography, message } from 'antd';

const { TextArea } = Input;
const { Title } = Typography;

const OnboardingApplicationDetails: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const dispatch: AppDispatch = useDispatch();

  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedback, setFeedback] = useState('');

  const { application, status, error } = useSelector(
    (state: RootState) => state.application
  );

  useEffect(() => {
    if (applicationId) {
      dispatch(getApplicationThunk(applicationId));
    }
  }, [dispatch, applicationId]);

  if (status === 'loading' || !application) {
    return (
      <div className="flex justify-center items-center my-10">
        <Spin size="large" />
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <Alert
        message="Error"
        description={error || 'Failed to load application.'}
        type="error"
        showIcon
      />
    );
  }

  const handleApprove = async () => {
    try {
      await dispatch(
        decideApplicationThunk({
          applicationId: application._id,
          status: 'Approved',
        })
      ).unwrap();
      message.success('Application approved successfully');
      dispatch(getApplicationThunk(application._id));
    } catch (err) {
      message.error(err as string);
    }
  };

  const openFeedbackModal = () => {
    setFeedback('');
    setFeedbackModalVisible(true);
  };

  const handleReject = async () => {
    try {
      await dispatch(
        decideApplicationThunk({
          applicationId: application._id,
          status: 'Rejected',
          feedback,
        })
      ).unwrap();
      message.success('Application rejected with feedback');
      setFeedbackModalVisible(false);
      dispatch(getApplicationThunk(application._id));
    } catch (err) {
      message.error(err as string);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Title level={2}>Onboarding Application Details</Title>

      {/* Display application details */}
      {/* Replace the following with actual application fields */}
      <div>
        <p><strong>Employee Name:</strong> {application.employee.firstName} {application.employee.lastName}</p>
        <p><strong>Email:</strong> {application.employee.email}</p>
        {/* Include other application details here */}
      </div>

      {/* Actions */}
      {application.status === 'Pending' && (
        <div style={{ marginTop: 20 }}>
          <Button type="primary" onClick={handleApprove} style={{ marginRight: 8 }}>
            Approve
          </Button>
          <Button danger onClick={openFeedbackModal}>
            Reject
          </Button>
        </div>
      )}

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

export default OnboardingApplicationDetails;
