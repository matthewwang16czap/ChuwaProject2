import React, { useState } from 'react';
import Form from '../forms/Form';
import { FieldType } from '../forms/types';
import { message } from 'antd';

const Page: React.FC = () => {
  const [residentStatus, setResidentStatus] = useState<string | null>(null);
  const [workAuthType, setWorkAuthType] = useState<string | null>(null);

  const handleResidentStatusChange = (value: string) => {
    setResidentStatus(value);
  };

  const handleWorkAuthTypeChange = (value: string) => {
    setWorkAuthType(value);
  };

  const fields: FieldType[] = [
    { name: 'firstName', label: 'First Name', type: 'input', required: true, validation: { required: 'First name is required' } },
    { name: 'lastName', label: 'Last Name', type: 'input', required: true, validation: { required: 'Last name is required' } },
    { name: 'middleName', label: 'Middle Name', type: 'input' },
    { name: 'preferredName', label: 'Preferred Name', type: 'input' },
    { name: 'profilePicture', label: 'Profile Picture', type: 'upload' },

    // Address Fields
    { name: 'address.building', label: 'Building/Apt #', type: 'input', required: true, validation: { required: 'Building/Apt # is required' } },
    { name: 'address.street', label: 'Street Name', type: 'input', required: true, validation: { required: 'Street name is required' } },
    { name: 'address.city', label: 'City', type: 'input', required: true, validation: { required: 'City is required' } },
    { name: 'address.state', label: 'State', type: 'input', required: true, validation: { required: 'State is required' } },
    { name: 'address.zip', label: 'Zip Code', type: 'input', required: true, validation: { required: 'Zip is required' } },

    // Phones
    { name: 'cellPhone', label: 'Cell Phone', type: 'input' },
    { name: 'workPhone', label: 'Work Phone', type: 'input' },

    // SSN, DOB, Gender
    { name: 'ssn', label: 'SSN', type: 'input', required: true },
    { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
    { name: 'gender', label: 'Gender', type: 'select', required: true, options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'none', label: 'I do not wish to answer' }
    ]},

    // Resident Status
    { name: 'residentStatus', label: 'Are you a Permanent Resident or Citizen?', type: 'radio', required: true, options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ]},

    // Conditional Fields based on Resident Status
    ...(residentStatus === 'yes' ? [
      { name: 'usStatus', label: 'Select your status', type: 'select', required: true, options: [
        { value: 'Green Card', label: 'Green Card' },
        { value: 'Citizen', label: 'Citizen' }
      ]}
    ] : []),

    ...(residentStatus === 'no' ? [
      { name: 'workAuthorization', label: 'Work Authorization', type: 'select', required: true, options: [
        { value: 'H1-B', label: 'H1-B' },
        { value: 'L2', label: 'L2' },
        { value: 'F1', label: 'F1 (CPT/OPT)' },
        { value: 'H4', label: 'H4' },
        { value: 'Other', label: 'Other' }
      ]},
      ...(workAuthType === 'F1' ? [
        { name: 'optReceipt', label: 'OPT Receipt', type: 'upload', required: true }
      ] : []),
      ...(workAuthType === 'Other' ? [
        { name: 'otherVisaTitle', label: 'Specify Visa Title', type: 'input', required: true }
      ] : []),
      { name: 'startDate', label: 'Start Date', type: 'date', required: true },
      { name: 'endDate', label: 'End Date', type: 'date', required: true }
    ] : []),

    // Reference Information
    { name: 'reference.firstName', label: 'Reference First Name', type: 'input', required: true },
    { name: 'reference.lastName', label: 'Reference Last Name', type: 'input', required: true },
    { name: 'reference.phone', label: 'Reference Phone', type: 'input', required: true },
    { name: 'reference.email', label: 'Reference Email', type: 'input', required: true },
    { name: 'reference.relationship', label: 'Reference Relationship', type: 'input', required: true }
  ];

  const initialData = {
    email: 'user@example.com', // Pre-filled based on registration email
  };

  const onSubmit = (data: any) => {
    console.log('Form Data: ', data);
    message.success('Form submitted successfully!');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Employee Information Form</h1>
      <Form fields={fields} onSubmit={onSubmit} />
    </div>
  );
};

export default Page;
