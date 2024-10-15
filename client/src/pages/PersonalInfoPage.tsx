// PersonalInfoPage.tsx
import React, { useEffect, useState } from 'react';
import PrototypeForm from '../forms/PrototypeForm';
import { useForm, FormProvider } from 'react-hook-form';
import axios from 'axios';
import { Modal } from 'antd'; // For confirmation dialog

// Define the Employee interface based on your model
interface IEmployee {
  userId: string;
  applicationId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  profilePictureUrl?: string;
  ssn?: string;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Other';
  address?: {
    building: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  contactInfo?: {
    cellPhone: string;
    workPhone?: string;
  };
  employment?: {
    visaTitle: string;
    startDate: Date;
    endDate?: Date;
  };
  emergencyContact?: {
    firstName: string;
    lastName: string;
    middleName?: string;
    phone: string;
    email: string;
    relationship: string;
  };
  documents?: {
    name: string;
    url: string;
  }[];
}

const PersonalInfoPage: React.FC = () => {
  const [employeeInfo, setEmployeeInfo] = useState<IEmployee | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editSections, setEditSections] = useState<{
    [key: string]: boolean;
  }>({
    name: false,
    address: false,
    contactInfo: false,
    employment: false,
    emergencyContact: false,
  });

  const methods = useForm<IEmployee>({
    defaultValues: employeeInfo || {},
    mode: 'onChange',
  });
  const { reset, handleSubmit } = methods;

  useEffect(() => {
    // Fetch employee information from backend
    const fetchEmployeeInfo = async () => {
      try {
        const response = await axios.get('/api/employee-info');
        setEmployeeInfo(response.data);
        reset(response.data);
      } catch (error) {
        console.error('Error fetching employee info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeInfo();
  }, [reset]);

  const handleEditClick = (section: string) => {
    setEditSections((prev) => ({ ...prev, [section]: true }));
  };

  const handleCancelClick = (section: string) => {
    Modal.confirm({
      title: 'Discard Changes?',
      content: 'Are you sure you want to discard all of your changes?',
      onOk() {
        // Reset the form to previous values
        reset();
        setEditSections((prev) => ({ ...prev, [section]: false }));
      },
    });
  };

  const handleSaveClick = async (section: string) => {
    const data = methods.getValues(); // Get all form data
    try {
      // Update the backend with new data
      await axios.put(`/api/employee-info/${section}`, data);
      // Update the local state
      setEmployeeInfo((prev) => ({ ...prev, ...data }));
      // Exit edit mode
      setEditSections((prev) => ({ ...prev, [section]: false }));
    } catch (error) {
      console.error('Error updating employee info:', error);
    }
  };

  if (loading || !employeeInfo) {
    return <div>Loading...</div>;
  }

  return (
    <FormProvider {...methods}>
      <div>
        <h2>Personal Information</h2>

        {/* Name Section */}
        <Section
          title="Name"
          isEditing={editSections.name}
          onEdit={() => handleEditClick('name')}
          onCancel={() => handleCancelClick('name')}
          onSave={() => handleSubmit(() => handleSaveClick('name'))()}
        >
          <PrototypeForm
            fields={[
              {
                name: 'firstName',
                label: 'First Name',
                type: 'input',
                disabled: !editSections.name,
                validation: { required: 'First name is required' },
              },
              {
                name: 'lastName',
                label: 'Last Name',
                type: 'input',
                disabled: !editSections.name,
                validation: { required: 'Last name is required' },
              },
              {
                name: 'middleName',
                label: 'Middle Name',
                type: 'input',
                disabled: !editSections.name,
              },
              {
                name: 'preferredName',
                label: 'Preferred Name',
                type: 'input',
                disabled: !editSections.name,
              },
              {
                name: 'profilePictureUrl',
                label: 'Profile Picture',
                type: 'upload',
                disabled: !editSections.name,
              },
              {
                name: 'email',
                label: 'Email',
                type: 'input',
                disabled: true,
              },
              {
                name: 'ssn',
                label: 'SSN',
                type: 'input',
                disabled: !editSections.name,
                validation: {
                  pattern: {
                    value: /^\d{9}$/,
                    message: 'SSN must be 9 digits',
                  },
                },
              },
              {
                name: 'dateOfBirth',
                label: 'Date of Birth',
                type: 'date',
                disabled: !editSections.name,
              },
              {
                name: 'gender',
                label: 'Gender',
                type: 'radio',
                options: [
                  { label: 'Male', value: 'Male' },
                  { label: 'Female', value: 'Female' },
                  { label: 'Other', value: 'Other' },
                ],
                disabled: !editSections.name,
              },
            ]}
            onSubmit={() => {}}
            methods={methods}
          />
        </Section>

        {/* Address Section */}
        <Section
          title="Address"
          isEditing={editSections.address}
          onEdit={() => handleEditClick('address')}
          onCancel={() => handleCancelClick('address')}
          onSave={() => handleSubmit(() => handleSaveClick('address'))()}
        >
          <PrototypeForm
            fields={[
              {
                name: 'address.building',
                label: 'Building/Apt #',
                type: 'input',
                disabled: !editSections.address,
              },
              {
                name: 'address.street',
                label: 'Street Name',
                type: 'input',
                disabled: !editSections.address,
              },
              {
                name: 'address.city',
                label: 'City',
                type: 'input',
                disabled: !editSections.address,
              },
              {
                name: 'address.state',
                label: 'State',
                type: 'input',
                disabled: !editSections.address,
              },
              {
                name: 'address.zip',
                label: 'Zip Code',
                type: 'input',
                disabled: !editSections.address,
              },
            ]}
            onSubmit={() => {}}
            methods={methods}
          />
        </Section>

        {/* Contact Info Section */}
        <Section
          title="Contact Info"
          isEditing={editSections.contactInfo}
          onEdit={() => handleEditClick('contactInfo')}
          onCancel={() => handleCancelClick('contactInfo')}
          onSave={() => handleSubmit(() => handleSaveClick('contactInfo'))()}
        >
          <PrototypeForm
            fields={[
              {
                name: 'contactInfo.cellPhone',
                label: 'Cell Phone Number',
                type: 'input',
                disabled: !editSections.contactInfo,
                validation: {
                  pattern: {
                    value: /^(\+?\d{1,3}[- ]?)?\d{10}$/,
                    message: 'Invalid phone number',
                  },
                },
              },
              {
                name: 'contactInfo.workPhone',
                label: 'Work Phone Number',
                type: 'input',
                disabled: !editSections.contactInfo,
                validation: {
                  pattern: {
                    value: /^(\+?\d{1,3}[- ]?)?\d{10}$/,
                    message: 'Invalid phone number',
                  },
                },
              },
            ]}
            onSubmit={() => {}}
            methods={methods}
          />
        </Section>

        {/* Employment Section */}
        <Section
          title="Employment"
          isEditing={editSections.employment}
          onEdit={() => handleEditClick('employment')}
          onCancel={() => handleCancelClick('employment')}
          onSave={() => handleSubmit(() => handleSaveClick('employment'))()}
        >
          <PrototypeForm
            fields={[
              {
                name: 'employment.visaTitle',
                label: 'Visa Title',
                type: 'input',
                disabled: !editSections.employment,
              },
              {
                name: 'employment.startDate',
                label: 'Start Date',
                type: 'date',
                disabled: !editSections.employment,
              },
              {
                name: 'employment.endDate',
                label: 'End Date',
                type: 'date',
                disabled: !editSections.employment,
              },
            ]}
            onSubmit={() => {}}
            methods={methods}
          />
        </Section>

        {/* Emergency Contact Section */}
        <Section
          title="Emergency Contact"
          isEditing={editSections.emergencyContact}
          onEdit={() => handleEditClick('emergencyContact')}
          onCancel={() => handleCancelClick('emergencyContact')}
          onSave={() => handleSubmit(() => handleSaveClick('emergencyContact'))()}
        >
          <PrototypeForm
            fields={[
              {
                name: 'emergencyContact.firstName',
                label: 'First Name',
                type: 'input',
                disabled: !editSections.emergencyContact,
              },
              {
                name: 'emergencyContact.lastName',
                label: 'Last Name',
                type: 'input',
                disabled: !editSections.emergencyContact,
              },
              {
                name: 'emergencyContact.middleName',
                label: 'Middle Name',
                type: 'input',
                disabled: !editSections.emergencyContact,
              },
              {
                name: 'emergencyContact.phone',
                label: 'Phone',
                type: 'input',
                disabled: !editSections.emergencyContact,
                validation: {
                  pattern: {
                    value: /^(\+?\d{1,3}[- ]?)?\d{10}$/,
                    message: 'Invalid phone number',
                  },
                },
              },
              {
                name: 'emergencyContact.email',
                label: 'Email',
                type: 'input',
                disabled: !editSections.emergencyContact,
                validation: {
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  },
                },
              },
              {
                name: 'emergencyContact.relationship',
                label: 'Relationship',
                type: 'input',
                disabled: !editSections.emergencyContact,
              },
            ]}
            onSubmit={() => {}}
            methods={methods}
          />
        </Section>

        {/* Documents Section */}
        <div>
          <h3>Documents</h3>
          <ul>
            {employeeInfo.documents?.map((doc, index) => (
              <li key={index}>
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  {doc.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </FormProvider>
  );
};

interface SectionProps {
  title: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({
  title,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  children,
}) => {
  return (
    <div>
      <h3>{title}</h3>
      {!isEditing ? (
        <button onClick={onEdit}>Edit</button>
      ) : (
        <div>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onSave}>Save</button>
        </div>
      )}
      {children}
    </div>
  );
};

export default PersonalInfoPage;