import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Typography, Alert, Divider } from 'antd';
import axiosInstance from '../api/axiosInstance'; 
import axios from 'axios';
const { Title, Paragraph } = Typography;

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  email?: string;
  ssn?: string;
  cellPhone?: string;
  workPhone?: string;
  citizenship?: string;
  workAuthorization?: {
    visaType?: string;
    visaTitle?: string;
    startDate?: string;
    endDate?: string;
    documents?: Array<{
      name?: string;
      url?: string;
    }>;
  };
  address?: {
    building?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  reference?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    relationship?: string;
  };
  emergencyContacts?: Array<{
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    relationship?: string;
  }>;
  documents?: {
    driversLicenseUrl?: string;
  };
  [key: string]: unknown;
}

const EmployeeProfilePage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<{ message: string; employee: Employee }>(`/api/employee/${employeeId}`);
        setEmployee(response.data.employee);
        setLoading(false);
      } catch (err: unknown) {
        setLoading(false);
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to load employee profile.');
        } else {
          setError('An unexpected error occurred.');
        }
      }
    };

    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  if (loading) {
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
        <strong>Phone Number:</strong>{' '}
        {employee.cellPhone
          ? formatPhoneNumber(employee.cellPhone)
          : employee.workPhone
          ? formatPhoneNumber(employee.workPhone)
          : 'N/A'}
      </Paragraph>
      <Paragraph>
        <strong>SSN:</strong> {employee.ssn ? maskSSN(employee.ssn) : 'N/A'}
      </Paragraph>
      <Paragraph>
        <strong>Work Authorization Title:</strong>{' '}
        {employee.workAuthorization?.visaType || employee.citizenship || 'N/A'}
      </Paragraph>
      {/* Add more fields as necessary */}
      {/* Address, Work Authorization Details, Reference, Emergency Contacts, Driver’s License */}
      {/* Use the same code as before to display these sections */}
    </div>
  );
};

export default EmployeeProfilePage;
