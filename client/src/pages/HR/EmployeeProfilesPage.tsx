// EmployeeProfilesPage.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { EmployeeUser, getAllEmployeeUsers } from '../../features/user/userSlice';
import { RootState, AppDispatch } from '../../app/store';
import { debounce } from 'lodash';
import { Input, Table, Typography, Alert, Spin, Modal } from 'antd';
import EmployeeProfilePage from './EmployeeProfilePage'; // Updated to accept props

const { Title } = Typography;
const { Search } = Input;

const EmployeeProfilesPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();

  // Selectors to access employee data and state
  const { employeeUsers, employeeUsersStatus, error } = useSelector(
    (state: RootState) => state.user
  );

  // Local state for search query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // State for Modal
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all employees on component mount
    dispatch(getAllEmployeeUsers({}));
  }, [dispatch]);

  // Debounced search function to reduce API calls
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim() === '') {
        // If search query is empty, fetch all employees
        dispatch(getAllEmployeeUsers({}));
      } else {
        // Otherwise, perform search
        dispatch(
          getAllEmployeeUsers({
            name: query
          })
        );
      }
    }, 300),
    [dispatch]
  ); // 300ms debounce

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
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
          className="text-blue-500 hover:underline cursor-pointer"
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
      render: (ssn: string) => maskSSN(ssn),
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
    <div className="container mx-auto p-6">
      <Title level={2}>Employee Profiles</Title>

      {/* Search Bar */}
      <div className="mb-6">
        <Search
          placeholder="Search by First Name, Last Name, or Preferred Name"
          value={searchQuery}
          onChange={handleSearchChange}
          enterButton
          allowClear
        />
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
      >
        {selectedUserId && (
          <EmployeeProfilePage userId={selectedUserId} />
        )}
      </Modal>
    </div>
  );
};

export default EmployeeProfilesPage;
