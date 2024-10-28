// EmployeeProfilePage.tsx

import React, { useEffect, useState } from 'react';
import { Spin, Typography, Alert, Divider, Button, message } from 'antd';
import { getEmployeeUserById, sendNotification } from '../../features/user/userSlice';
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../app/store";

const { Title, Paragraph } = Typography;

const EmployeeProfilePage: React.FC<{ userId: string }> = ({ userId }) => {
  const dispatch: AppDispatch = useDispatch();

  const {
    employeeUser,
    employeeUserStatus,
    error,
  } = useSelector((state: RootState) => state.user);

  const [loadingNotification, setLoadingNotification] = useState<boolean>(false);

  useEffect(() => {
    dispatch(getEmployeeUserById({ userId }));
  }, [userId, dispatch]);

  if (employeeUserStatus === "loading") {
    return (
      <div className="flex justify-center items-center my-10">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  if (!employeeUser) {
    return (
      <Alert
        message="No Data"
        description="Employee profile not found."
        type="info"
        showIcon
      />
    );
  }

  // Helper functions
  const maskSSN = (ssn: string): string => {
    if (!ssn || ssn.length < 4) return '******';
    return `******${ssn.slice(-4)}`;
  };

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = ('' + phone).replace(/\D/g, '');
    if (cleaned.length !== 10) return phone;
    const part1 = cleaned.slice(0, 3);
    const part2 = cleaned.slice(3, 6);
    const part3 = cleaned.slice(6);
    return `(${part1}) ${part2}-${part3}`;
  };

  // Handler for sending notification
  const handleSendNotification = async () => {
    if (!employeeUser || !employeeUser.email) {
      message.error("Employee email not available");
      return;
    }

    setLoadingNotification(true);
    try {
      await dispatch(sendNotification({
        email: employeeUser.email,
        subject: "Application Submission Reminder",
        text: "Dear Employee, please remember to submit your application."
      })).unwrap();
      message.success("Notification sent successfully");
    } catch (err) {
      console.error('Error sending notification:', err);
      message.error("Failed to send notification");
    } finally {
      setLoadingNotification(false);
    }
  };

  // Check if we need to show the button
  const showSendNotificationButton = employeeUser.nextStep === 'SubmitApplication' || employeeUser.nextStep === 'ReSubmitApplication';

  // Display employee information
  return (
    <div className="p-4">
      <Title level={3}>
        {employeeUser.employeeId.preferredName
          ? `${employeeUser.employeeId.firstName} "${employeeUser.employeeId.preferredName}" ${employeeUser.employeeId.lastName}`
          : `${employeeUser.employeeId.firstName} ${employeeUser.employeeId.lastName}`}
      </Title>
      <Divider />
      <Paragraph>
        <strong>Email:</strong> {employeeUser.email || 'N/A'}
      </Paragraph>
      <Paragraph>
        <strong>Phone Number:</strong>{' '}
        {employeeUser.employeeId.contactInfo.cellPhone
          ? formatPhoneNumber(employeeUser.employeeId.contactInfo.cellPhone)
          : employeeUser.employeeId.contactInfo.workPhone
            ? formatPhoneNumber(employeeUser.employeeId.contactInfo.workPhone)
            : 'N/A'}
      </Paragraph>
      <Paragraph>
        <strong>SSN:</strong> {employeeUser.employeeId.ssn ? maskSSN(employeeUser.employeeId.ssn) : 'N/A'}
      </Paragraph>
      <Paragraph>
        <strong>Work Authorization Title:</strong>{' '}
        {employeeUser.employeeId.employment.visaType || 'N/A'}
      </Paragraph>
      {/* Add more fields as necessary */}
      {/* Address, Work Authorization Details, Reference, Emergency Contacts, Driver’s License */}
      {/* Use the same code as before to display these sections */}

      {/* Send Email Notification Button */}
      {showSendNotificationButton && (
        <div className="mt-6">
          <Button
            type="primary"
            onClick={handleSendNotification}
            loading={loadingNotification}
            block
          >
            Send Email Notification
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmployeeProfilePage;
