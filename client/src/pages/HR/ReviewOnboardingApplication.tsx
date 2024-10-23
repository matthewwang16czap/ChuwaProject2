// ReviewOnboardingApplication.tsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllEmployeeUsers,
  IUser,
} from '../../features/user/userSlice';
import {
  decideApplicationThunk,
  getApplicationThunk,
} from '../../features/application/applicationSlice';
import { RootState, AppDispatch } from '../../app/store';
import { Table, Button, Typography, Spin, Alert, Modal, Input, message } from 'antd';
import { IApplication } from '../../models/application'; // Import the IApplication interface
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

const ReviewOnboardingApplication: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();

  const { employeeUsers, employeeUsersStatus, error } = useSelector(
    (state: RootState) => state.user
  );

  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<IApplication | null>(null);
  const [feedback, setFeedback] = useState('');

  const [applicationModalVisible, setApplicationModalVisible] = useState(false);
  const [selectedApplicationDetails, setSelectedApplicationDetails] = useState<IApplication | null>(null);
  const [applicationDetailsLoading, setApplicationDetailsLoading] = useState(false);

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
        <Button
          type="link"
          onClick={() => openApplicationModal(record.employeeId.applicationId._id)}
        >
          View Application
        </Button>
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
              <Button danger onClick={() => openFeedbackModal(record.employeeId.applicationId)}>
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

      // Update application details in modal if open
      if (selectedApplicationDetails && selectedApplicationDetails._id === applicationId) {
        setSelectedApplicationDetails({
          ...selectedApplicationDetails,
          status: 'Approved',
        });
      }
    } catch (err) {
      message.error(err as string);
    }
  };

  const openFeedbackModal = (application: IApplication) => {
    setSelectedApplication(application);
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

      // Update application details in modal if open
      if (
        selectedApplicationDetails &&
        selectedApplicationDetails._id === selectedApplication._id
      ) {
        setSelectedApplicationDetails({
          ...selectedApplicationDetails,
          status: 'Rejected',
        });
      }
    } catch (err) {
      message.error(err as string);
    }
  };

  const openApplicationModal = async (applicationId: string) => {
    try {
      setApplicationModalVisible(true);
      setApplicationDetailsLoading(true);
      const response = await dispatch(getApplicationThunk(applicationId)).unwrap();
      setSelectedApplicationDetails(response.application); // Correctly extract the application
      setApplicationDetailsLoading(false);
    } catch (err) {
      message.error(err as string);
      setApplicationDetailsLoading(false);
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

      {/* Application Details Modal */}
      <Modal
        title="Application Details"
        open={applicationModalVisible}
        onCancel={() => setApplicationModalVisible(false)}
        footer={null}
        width={800}
      >
        {applicationDetailsLoading ? (
          <div className="flex justify-center items-center my-10">
            <Spin size="large" />
          </div>
        ) : selectedApplicationDetails ? (
          <div>
            {/* Display application details */}
            {/* Personal Information */}
            <Title level={4}>Personal Information</Title>
            <p>
              <strong>First Name:</strong> {selectedApplicationDetails.firstName}
            </p>
            <p>
              <strong>Middle Name:</strong> {selectedApplicationDetails.middleName || 'N/A'}
            </p>
            <p>
              <strong>Last Name:</strong> {selectedApplicationDetails.lastName}
            </p>
            <p>
              <strong>Preferred Name:</strong> {selectedApplicationDetails.preferredName || 'N/A'}
            </p>
            <p>
              <strong>Email:</strong> {selectedApplicationDetails.email}
            </p>
            <p>
              <strong>SSN:</strong> {selectedApplicationDetails.ssn || 'N/A'}
            </p>
            <p>
              <strong>Date of Birth:</strong>{' '}
              {selectedApplicationDetails.dateOfBirth
                ? dayjs(selectedApplicationDetails.dateOfBirth).format('YYYY-MM-DD')
                : 'N/A'}
            </p>
            <p>
              <strong>Gender:</strong> {selectedApplicationDetails.gender || 'N/A'}
            </p>

            {/* Address */}
            <Title level={4}>Address</Title>
            {selectedApplicationDetails.address ? (
              <>
                <p>
                  <strong>Building/Apt #:</strong> {selectedApplicationDetails.address.building}
                </p>
                <p>
                  <strong>Street:</strong> {selectedApplicationDetails.address.street}
                </p>
                <p>
                  <strong>City:</strong> {selectedApplicationDetails.address.city}
                </p>
                <p>
                  <strong>State:</strong> {selectedApplicationDetails.address.state}
                </p>
                <p>
                  <strong>Zip Code:</strong> {selectedApplicationDetails.address.zip}
                </p>
              </>
            ) : (
              <p>N/A</p>
            )}

            {/* Contact Information */}
            <Title level={4}>Contact Information</Title>
            {selectedApplicationDetails.contactInfo ? (
              <>
                <p>
                  <strong>Cell Phone:</strong> {selectedApplicationDetails.contactInfo.cellPhone}
                </p>
                <p>
                  <strong>Work Phone:</strong>{' '}
                  {selectedApplicationDetails.contactInfo.workPhone || 'N/A'}
                </p>
              </>
            ) : (
              <p>N/A</p>
            )}

            {/* Citizenship */}
            <Title level={4}>Citizenship</Title>
            <p>
              <strong>Status:</strong> {selectedApplicationDetails.citizenship || 'N/A'}
            </p>
            {selectedApplicationDetails.citizenship === 'WorkAuthorization' &&
              selectedApplicationDetails.workAuthorization && (
                <>
                  <p>
                    <strong>Visa Type:</strong> {selectedApplicationDetails.workAuthorization.visaType}
                  </p>
                  {selectedApplicationDetails.workAuthorization.visaType === 'Other' && (
                    <p>
                      <strong>Visa Title:</strong>{' '}
                      {selectedApplicationDetails.workAuthorization.visaTitle || 'N/A'}
                    </p>
                  )}
                  <p>
                    <strong>Start Date:</strong>{' '}
                    {selectedApplicationDetails.workAuthorization.startDate
                      ? dayjs(selectedApplicationDetails.workAuthorization.startDate).format('YYYY-MM-DD')
                      : 'N/A'}
                  </p>
                  <p>
                    <strong>End Date:</strong>{' '}
                    {selectedApplicationDetails.workAuthorization.endDate
                      ? dayjs(selectedApplicationDetails.workAuthorization.endDate).format('YYYY-MM-DD')
                      : 'N/A'}
                  </p>
                  {/* Work Authorization Documents */}
                  <Title level={5}>Work Authorization Documents</Title>
                  {selectedApplicationDetails.workAuthorization.documents &&
                  selectedApplicationDetails.workAuthorization.documents.length > 0 ? (
                    selectedApplicationDetails.workAuthorization.documents.map((doc, index) => (
                      <div key={index}>
                        <p>
                          <strong>Document Name:</strong> {doc.name}
                        </p>
                        <p>
                          <strong>Status:</strong> {doc.status}
                        </p>
                        {doc.feedback && (
                          <p>
                            <strong>Feedback:</strong> {doc.feedback}
                          </p>
                        )}
                        {doc.url && (
                          <p>
                            <strong>Document:</strong>{' '}
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>No documents uploaded.</p>
                  )}
                </>
              )}

            {/* References */}
            <Title level={4}>References</Title>
            {selectedApplicationDetails.references ? (
              <>
                <p>
                  <strong>Name:</strong> {selectedApplicationDetails.references.firstName}{' '}
                  {selectedApplicationDetails.references.middleName || ''}{' '}
                  {selectedApplicationDetails.references.lastName}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedApplicationDetails.references.phone}
                </p>
                <p>
                  <strong>Email:</strong> {selectedApplicationDetails.references.email}
                </p>
                <p>
                  <strong>Relationship:</strong> {selectedApplicationDetails.references.relationship}
                </p>
              </>
            ) : (
              <p>N/A</p>
            )}

            {/* Emergency Contact */}
            <Title level={4}>Emergency Contact</Title>
            {selectedApplicationDetails.emergencyContact ? (
              <>
                <p>
                  <strong>Name:</strong> {selectedApplicationDetails.emergencyContact.firstName}{' '}
                  {selectedApplicationDetails.emergencyContact.middleName || ''}{' '}
                  {selectedApplicationDetails.emergencyContact.lastName}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedApplicationDetails.emergencyContact.phone}
                </p>
                <p>
                  <strong>Email:</strong> {selectedApplicationDetails.emergencyContact.email}
                </p>
                <p>
                  <strong>Relationship:</strong> {selectedApplicationDetails.emergencyContact.relationship}
                </p>
              </>
            ) : (
              <p>N/A</p>
            )}

            {/* Documents */}
            <Title level={4}>Documents</Title>
            {selectedApplicationDetails.documents ? (
              <>
                <p>
                  <strong>Profile Picture:</strong>{' '}
                  {selectedApplicationDetails.documents.profilePictureUrl ? (
                    <a
                      href={selectedApplicationDetails.documents.profilePictureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  ) : (
                    'Not uploaded'
                  )}
                </p>
                <p>
                  <strong>Driver's License:</strong>{' '}
                  {selectedApplicationDetails.documents.driverLicenseUrl ? (
                    <a
                      href={selectedApplicationDetails.documents.driverLicenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  ) : (
                    'Not uploaded'
                  )}
                </p>
              </>
            ) : (
              <p>N/A</p>
            )}

            {/* Application Status */}
            <Title level={4}>Application Status</Title>
            <p>
              <strong>Status:</strong> {selectedApplicationDetails.status}
            </p>
            {selectedApplicationDetails.feedback && (
              <p>
                <strong>Feedback:</strong> {selectedApplicationDetails.feedback}
              </p>
            )}

            {/* Actions */}
            {selectedApplicationDetails.status === 'Pending' && (
              <div style={{ marginTop: 20 }}>
                <Button
                  type="primary"
                  onClick={() => handleApprove(selectedApplicationDetails._id)}
                  style={{ marginRight: 8 }}
                >
                  Approve
                </Button>
                <Button danger onClick={() => openFeedbackModal(selectedApplicationDetails)}>
                  Reject
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Alert
            message="Error"
            description="Failed to load application details."
            type="error"
            showIcon
          />
        )}
      </Modal>

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
