import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  sendInvitation,
  getRegistrations,
  resetStatus,
  Registration,
} from "../../features/registration/registrationSlice";
import { RootState, AppDispatch } from "../../app/store";
import PrototypeForm, { Field } from "../../forms/PrototypeForm";
import { Table, Typography, Alert, Spin, Tooltip } from "antd";

const { Title } = Typography;

// Define the form inputs
interface InvitationFormInputs {
  email: string;
}

const HiringManagementPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const {
    invitationStatus,
    registrationsStatus,
    registrations,
    error,
  } = useSelector((state: RootState) => state.registration);

  // Initialize useForm and get methods
  const methods = useForm<InvitationFormInputs>();
  const { reset } = methods;

  // Fetch all registrations on component mount
  useEffect(() => {
    dispatch(getRegistrations());
  }, [dispatch]); // Empty array to run only on mount

  // Handle form submission
  const onSubmit: SubmitHandler<InvitationFormInputs> = (data) => {
    // Reset any previous status or error before sending a new invitation
    dispatch(resetStatus());
    dispatch(sendInvitation({ email: data.email }));
  };

  // Effect to handle invitation status changes
  useEffect(() => {
    if (invitationStatus === "succeeded") {
      reset(); // Reset form fields
      dispatch(getRegistrations()); // Refresh registration history
    }
  }, [invitationStatus, reset, dispatch]);

  // Define fields for the PrototypeForm
  const fields: Field<InvitationFormInputs>[] = [
    {
      name: "email",
      label: "Employee Email",
      type: "input",
      inputType: "email",
      validation: {
        required: "Email is required",
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: "Invalid email address",
        },
      },
    },
  ];

  // Define columns for the history table
  const columns = [
    {
      title: "Email Address",
      key: "email",
      render: (record: Registration) => (
        <Tooltip title={record.email}>
          <span style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block' }}>
            {record.email}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "User ID",
      key: "userId",
      render: (record: Registration) => (
        <Tooltip title={record.userId}>
          <span style={{ maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block' }}>
            {record.userId ?? "Not Registered"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Token",
      key: "token",
      render: (record: Registration) =>
        record.registrationHistory.length > 0 ? (
          <Tooltip title={record.registrationHistory.slice(-1)[0].token}>
            <span style={{ maxWidth: '50px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block' }}>
              {record.registrationHistory.slice(-1)[0].token}
            </span>
          </Tooltip>
        ) : (
          "No token available"
        ),
    },
    {
      title: "Sent At",
      key: "createdAt",
      render: (record: Registration) =>
        record.registrationHistory.length > 0
          ? new Date(record.registrationHistory.slice(-1)[0].createdAt).toLocaleString()
          : "N/A",
    },
    {
      title: "Token Expires At",
      key: "expireAt",
      render: (record: Registration) =>
        record.registrationHistory.length > 0
          ? new Date(record.registrationHistory.slice(-1)[0].expireAt).toLocaleString()
          : "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Registration) => (
        <a href={`/registration/${record.userId}`} target="_blank" rel="noopener noreferrer">
          View Details
        </a>
      ),
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
        {invitationStatus === "succeeded" && (
          <Alert
            message="Invitation Sent"
            description="The invitation has been sent successfully."
            type="success"
            showIcon
            className="mb-4"
          />
        )}
        {invitationStatus === "failed" && error && (
          <Alert
            message="Error"
            description={
              typeof error === "string"
                ? error
                : "Something went wrong. Please try again."
            }
            type="error"
            showIcon
            className="mb-4"
          />
        )}
        <PrototypeForm
          fields={fields}
          onSubmit={onSubmit}
          methods={methods}
          submitButtonLabel={
            invitationStatus === "loading"
              ? "Sending..."
              : "Generate Token and Send Email"
          }
          showSubmitButton
        />
      </div>

      {/* Registration History */}
      <div>
        <Title level={4} className="mb-4">
          Registration Token History
        </Title>
        {registrationsStatus === "loading" ? (
          <div className="flex justify-center items-center my-10">
            <Spin size="large" />
          </div>
        ) : registrationsStatus === "failed" && error ? (
          <Alert
            message="Error"
            description={
              typeof error === "string"
                ? error
                : "Failed to load registration history."
            }
            type="error"
            showIcon
            className="mb-4"
          />
        ) : (
          <Table
            dataSource={registrations || []}
            columns={columns}
            rowKey="email" // Ensure a unique identifier is used for rowKey
            pagination={{ pageSize: 10 }}
            bordered
          />
        )}
        {registrationsStatus === "succeeded" &&
          (!registrations || registrations.length === 0) && (
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
