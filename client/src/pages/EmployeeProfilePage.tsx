// EmployeeProfilePage.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEmployeeThunk, Employee } from '../features/employee/employeeSlice';
import { RootState, AppDispatch } from '../app/store';
import { Spin, Typography, Alert, Divider } from 'antd';

const { Title, Paragraph } = Typography;

interface EmployeeProfilePageProps {
  employeeId: string;
}

const EmployeeProfilePage: React.FC<EmployeeProfilePageProps> = ({ employeeId }) => {
  const dispatch: AppDispatch = useDispatch();

  // Selectors to access employee data and state
  const { employee, status, error } = useSelector(
    (state: RootState) => state.employee
  );

  useEffect(() => {
    if (employeeId) {
      dispatch(getEmployeeThunk(employeeId));
    }
  }, [dispatch, employeeId]);

  if (status === 'loading') {
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
        description={error || 'Failed to load employee profile.'}
        type="error"
        showIcon
      />
    );
  }

  if (!employee) {
    return (
      <Alert
        message="No Data"
        description="Employee profile not found."
        type="info"
        showIcon
      />
    );
  }

  // Assuming employee object contains all necessary fields
  return (
    <div className="p-4">
      <Title level={3}>
        {employee.preferredName
          ? `${employee.firstName} "${employee.preferredName}" ${employee.lastName}`
          : `${employee.firstName} ${employee.lastName}`}
      </Title>
      <Divider />
      <Paragraph>
        <strong>Email:</strong> {employee.email || 'N/A'}
      </Paragraph>
      <Paragraph>
        <strong>Phone Number:</strong> {employee.phoneNumber ? formatPhoneNumber(employee.phoneNumber) : 'N/A'}
      </Paragraph>
      <Paragraph>
        <strong>SSN:</strong> {employee.ssn ? maskSSN(employee.ssn) : 'N/A'}
      </Paragraph>
      <Paragraph>
        <strong>Work Authorization Title:</strong> {employee.workAuthorizationTitle || 'N/A'}
      </Paragraph>
      {/* Add more fields as necessary */}
      {/* Example: Address */}
      {employee.address && (
        <>
          <Divider />
          <Title level={4}>Address</Title>
          <Paragraph>
            <strong>Building/Apt #:</strong> {employee.address.building || 'N/A'}
          </Paragraph>
          <Paragraph>
            <strong>Street Name:</strong> {employee.address.street || 'N/A'}
          </Paragraph>
          <Paragraph>
            <strong>City:</strong> {employee.address.city || 'N/A'}
          </Paragraph>
          <Paragraph>
            <strong>State:</strong> {employee.address.state || 'N/A'}
          </Paragraph>
          <Paragraph>
            <strong>Zip Code:</strong> {employee.address.zip || 'N/A'}
          </Paragraph>
        </>
      )}
      {/* Example: Work Authorization Details */}
      {employee.citizenship === 'Work Authorization' && employee.workAuthorization && (
        <>
          <Divider />
          <Title level={4}>Work Authorization</Title>
          <Paragraph>
            <strong>Visa Type:</strong> {employee.workAuthorization.visaType || 'N/A'}
          </Paragraph>
          {employee.workAuthorization.visaTitle && (
            <Paragraph>
              <strong>Visa Title:</strong> {employee.workAuthorization.visaTitle}
            </Paragraph>
          )}
          <Paragraph>
            <strong>Start Date:</strong> {formatDate(employee.workAuthorization.startDate)}
          </Paragraph>
          {employee.workAuthorization.endDate && (
            <Paragraph>
              <strong>End Date:</strong> {formatDate(employee.workAuthorization.endDate)}
            </Paragraph>
          )}
          {/* Display uploaded documents */}
          {employee.workAuthorization.documents && employee.workAuthorization.documents.length > 0 && (
            <>
              <Paragraph>
                <strong>Uploaded Documents:</strong>
              </Paragraph>
              <ul>
                {employee.workAuthorization.documents.map((doc: any, index: number) => (
                  <li key={index} className="mb-2">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {doc.name}
                    </a>
                    <a href={doc.url} download className="ml-2 text-green-500 hover:underline">
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
      {/* Example: Reference */}
      {employee.reference && (
        <>
          <Divider />
          <Title level={4}>Reference</Title>
          <Paragraph>
            <strong>Name:</strong> {employee.reference.firstName} {employee.reference.lastName}
          </Paragraph>
          <Paragraph>
            <strong>Phone:</strong> {employee.reference.phone}
          </Paragraph>
          <Paragraph>
            <strong>Email:</strong> {employee.reference.email}
          </Paragraph>
          <Paragraph>
            <strong>Relationship:</strong> {employee.reference.relationship}
          </Paragraph>
        </>
      )}
      {/* Example: Emergency Contacts */}
      {employee.emergencyContacts && employee.emergencyContacts.length > 0 && (
        <>
          <Divider />
          <Title level={4}>Emergency Contact(s)</Title>
          {employee.emergencyContacts.map((contact: any, index: number) => (
            <div key={index} className="mb-4">
              <Paragraph>
                <strong>Name:</strong> {contact.firstName} {contact.lastName}
              </Paragraph>
              <Paragraph>
                <strong>Phone:</strong> {contact.phone}
              </Paragraph>
              <Paragraph>
                <strong>Email:</strong> {contact.email}
              </Paragraph>
              <Paragraph>
                <strong>Relationship:</strong> {contact.relationship}
              </Paragraph>
            </div>
          ))}
        </>
      )}
      {/* Example: Driver’s License */}
      {employee.documents?.driversLicenseUrl && (
        <>
          <Divider />
          <Title level={4}>Driver’s License</Title>
          <Paragraph>
            <a href={employee.documents.driversLicenseUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              View Driver’s License
            </a>
            <a href={employee.documents.driversLicenseUrl} download className="ml-2 text-green-500 hover:underline">
              Download
            </a>
          </Paragraph>
        </>
      )}
    </div>
  );
};

export default EmployeeProfilePage;

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

const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
};
