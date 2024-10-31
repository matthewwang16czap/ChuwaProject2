// EmployeeProfilesPage.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { EmployeeUser, getAllEmployeeUsers } from '../../features/user/userSlice';
import { RootState, AppDispatch } from '../../app/store';
import { debounce } from 'lodash';
import { Input, Table, Typography, Alert, Spin, Modal, Select } from 'antd';
import EmployeeProfilePage from './EmployeeProfilePage'; // Updated to accept props
import { SearchOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const EmployeeProfilesPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { employeeUsers, employeeUsersStatus, error } = useSelector(
    (state: RootState) => state.user
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [nextStepPrimary, setNextStepPrimary] = useState<string | undefined>(undefined);
  const [nextStepSecondary, setNextStepSecondary] = useState<string | undefined>(undefined);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all employees on component mount
    dispatch(getAllEmployeeUsers({}));
  }, [dispatch]);

  // Debounced search function to reduce API calls
  const debouncedSearch = useCallback(
    debounce((query: string, primary: string | undefined, secondary: string | undefined) => {
      const combinedNextStep = [primary, secondary].filter(Boolean).join('');
      dispatch(
        getAllEmployeeUsers({
          name: query,
          nextStep: combinedNextStep || undefined,
        })
      );
    }, 300),
    [dispatch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query, nextStepPrimary, nextStepSecondary);
  };

  const handlePrimaryChange = (value: string) => {
    setNextStepPrimary(value);
    debouncedSearch(searchQuery, value, nextStepSecondary);
  };

  const handleSecondaryChange = (value: string) => {
    setNextStepSecondary(value);
    debouncedSearch(searchQuery, nextStepPrimary, value);
  };

  // Handle clicking on employee name
  const handleNameClick = (userId: string) => {
    setSelectedUserId(userId);
    setIsModalVisible(true);
  };

  // Handle closing the modal
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedUserId(null);
  };

  // Prepare data for the table
  const tableData = employeeUsers
    ? [...employeeUsers].sort((a, b) =>
        a.employeeId.lastName.localeCompare(b.employeeId.lastName, undefined, { sensitivity: 'base' })
      )
    : [];

  // Define table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'name',
      render: (_: unknown, record: EmployeeUser) => (
        <a
          onClick={() => handleNameClick(record._id)}
          className="text-blue-600 hover:underline cursor-pointer"
        >
          {`${record.employeeId.firstName} ${record.employeeId.lastName}`.trim()}
        </a>
      ),
      sorter: (a: EmployeeUser, b: EmployeeUser) =>
        a.employeeId.lastName.localeCompare(b.employeeId.lastName, undefined, { sensitivity: 'base' }),
    },
    {
      title: 'SSN',
      dataIndex: 'ssn',
      key: 'ssn',
      render: (_: unknown, record: EmployeeUser) => maskSSN(record.employeeId.ssn),
    },
    {
      title: 'Work Authorization Title',
      dataIndex: 'workAuthorizationTitle',
      key: 'workAuthorizationTitle',
      render: (_: unknown, record: EmployeeUser) => {
        const title =
          record.employeeId.employment.visaType ||
          record.employeeId.citizenship ||
          'N/A';
        return title;
      },
    },
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (_: unknown, record: EmployeeUser) =>
        formatPhoneNumber(record.employeeId.contactInfo.cellPhone || record.employeeId.contactInfo.workPhone || ''),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (_: unknown, record: EmployeeUser) => (
        <a href={`mailto:${record.employeeId.email}`} className="text-blue-600 hover:underline">
          {record.employeeId.email}
        </a>
      ),
    },
    {
      title: 'Next Step',
      dataIndex: 'nextStep',
      key: 'nextStep',
    },
  ];

  // Helper function to mask SSN
  const maskSSN = (ssn: string): string => {
    if (!ssn || ssn.length < 4) return '******';
    return `******${ssn.slice(-4)}`;
  };

  // Helper function to format phone numbers
  const formatPhoneNumber = (phone: string): string => {
    const cleaned = ('' + phone).replace(/\D/g, '');
    if (cleaned.length !== 10) return phone;
    const part1 = cleaned.slice(0, 3);
    const part2 = cleaned.slice(3, 6);
    const part3 = cleaned.slice(6);
    return `(${part1}) ${part2}-${part3}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-md rounded-md">
      <Title level={2} className="text-center mb-6">Employee Profiles</Title>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        {/* Search Bar */}
        <Search
          placeholder="Search by First Name, Last Name, or Preferred Name"
          value={searchQuery}
          onChange={handleSearchChange}
          enterButton={<SearchOutlined />}
          allowClear
          className="w-full md:w-1/2"
        />

        {/* Next Step Primary Filter */}
        <Select
          placeholder="Filter by Primary Next Step"
          onChange={handlePrimaryChange}
          allowClear
          className="w-full md:w-1/4"
        >
          {['Submit', 'WaitReview', 'Resubmit'].map(step => (
            <Option key={step} value={step}>
              {step}
            </Option>
          ))}
        </Select>

        {/* Next Step Secondary Filter */}
        <Select
          placeholder="Filter by Secondary Next Step"
          onChange={handleSecondaryChange}
          allowClear
          className="w-full md:w-1/4"
        >
          {['OPTReceipt', 'OPTEAD', 'I983', 'I20'].map(step => (
            <Option key={step} value={step}>
              {step}
            </Option>
          ))}
        </Select>
      </div>

      {/* Summary Statistics */}
      {employeeUsers && (
        <div className="mb-4">
          <Title level={4}>
            Total Employees: <span className="text-blue-600">{employeeUsers.length}</span>
          </Title>
        </div>
      )}

      {/* Loading Indicator */}
      {employeeUsersStatus === 'loading' && (
        <div className="flex justify-center items-center my-10">
          <Spin size="large" />
        </div>
      )}

      {/* Error Alert */}
      {employeeUsersStatus === 'failed' && error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      {/* No Records Found */}
      {employeeUsersStatus === 'succeeded' && employeeUsers && employeeUsers.length === 0 && (
        <Alert
          message="No Records Found"
          description="No employees match your search criteria."
          type="info"
          showIcon
          className="mb-4"
        />
      )}

      {/* Employee Table */}
      {employeeUsersStatus === 'succeeded' && employeeUsers && employeeUsers.length > 0 && (
        <Table
          dataSource={tableData}
          columns={columns}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          className="shadow rounded"
          bordered
        />
      )}

      {/* Employee Profile Modal */}
      <Modal
        title="Employee Profile"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        destroyOnClose
        styles={{ padding: '20px' }}
      >
        {selectedUserId && (
          <EmployeeProfilePage userId={selectedUserId} />
        )}
      </Modal>
    </div>
  );
};

export default EmployeeProfilesPage;
