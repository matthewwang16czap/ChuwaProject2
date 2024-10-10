// axiosMock.ts
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Initial fake application data
let applicationData = null;
let applicationStatus = 'Never submitted';
let applicationFeedback = null;

// Initial fake employee data matching the IEmployee interface
let employeeData = {
  userId: '12345',
  applicationId: '67890',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  middleName: 'A',
  preferredName: 'Johnny',
  profilePictureUrl: '',
  ssn: '123456789',
  dateOfBirth: '1990-01-01',
  gender: 'Male',
  address: {
    building: '123',
    street: 'Main St',
    city: 'Anytown',
    state: 'CA',
    zip: '12345',
  },
  contactInfo: {
    cellPhone: '1234567890',
    workPhone: '0987654321',
  },
  employment: {
    visaTitle: 'H1-B',
    startDate: '2021-01-01',
    endDate: '2023-01-01',
  },
  emergencyContact: {
    firstName: 'Jane',
    lastName: 'Doe',
    middleName: 'B',
    phone: '1122334455',
    email: 'jane.doe@example.com',
    relationship: 'Spouse',
  },
  documents: [
    {
      name: 'Driver\'s License',
      url: 'https://example.com/driver-license.pdf',
    },
    {
      name: 'Work Authorization',
      url: 'https://example.com/work-authorization.pdf',
    },
  ],
};

const mock = new MockAdapter(axios, { delayResponse: 500 });

// Mock GET /api/onboarding/application
mock.onGet('/api/onboarding/application').reply(200, {
  status: applicationStatus,
  data: applicationData,
  feedback: applicationFeedback,
});

// Mock POST /api/onboarding/submit
mock.onPost('/api/onboarding/submit').reply(config => {
  // Simulate application submission
  // Parse the submitted data
  applicationData = config.data; // In a real application, you would parse and store the data appropriately
  applicationStatus = 'Pending';
  applicationFeedback = null;
  return [200, { message: 'Application submitted successfully.' }];
});

// Mock GET /api/employee-info
mock.onGet('/api/employee-info').reply(200, employeeData);

// Mock PUT /api/employee-info/:section
mock.onPut(new RegExp('/api/employee-info/.*')).reply(config => {
  const url = config.url || '';
  const section = url.split('/').pop();

  // Parse the request data
  const updatedData = JSON.parse(config.data);

  // Update the corresponding section in employeeData
  switch (section) {
    case 'name':
      employeeData = { ...employeeData, ...updatedData };
      break;
    case 'address':
      employeeData.address = { ...employeeData.address, ...updatedData.address };
      break;
    case 'contactInfo':
      employeeData.contactInfo = { ...employeeData.contactInfo, ...updatedData.contactInfo };
      break;
    case 'employment':
      employeeData.employment = { ...employeeData.employment, ...updatedData.employment };
      break;
    case 'emergencyContact':
      employeeData.emergencyContact = { ...employeeData.emergencyContact, ...updatedData.emergencyContact };
      break;
    default:
      // Return 400 Bad Request if section is not recognized
      return [400, { message: 'Invalid section' }];
  }

  // Return success response
  return [200, { message: 'Update successful' }];
});

// You can mock other endpoints here as needed

export default mock;
