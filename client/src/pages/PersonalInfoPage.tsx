// PersonalInfoPage.tsx
import React, { useEffect, useState } from 'react';
import PrototypeForm from '../forms/PrototypeForm';
import { useForm, FormProvider } from 'react-hook-form';
import { Modal } from 'antd'; // For confirmation dialog
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store'; // Adjust the path as needed
import {
  getMyProfileThunk,
  updateEmployeeThunk,
} from '../features/employee/employeeSlice'; // Adjust the path as needed

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
  const dispatch = useDispatch();
  const employeeState = useSelector((state: RootState) => state.employee);
  const employeeInfo = employeeState.employee as IEmployee | null;
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
    // Fetch employee information using getMyProfileThunk
    const fetchEmployeeInfo = async () => {
      try {
        await dispatch(getMyProfileThunk());
      } catch (error) {
        console.error('Error fetching employee info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeInfo();
    
  }, [dispatch]);

  useEffect(() => {
    // Reset form when employeeInfo changes
    if (employeeInfo) {
      reset(employeeInfo);
    }
    
  }, [employeeInfo, reset]);

  const handleEditClick = (section: string) => {
    setEditSections((prev) => ({ ...prev, [section]: true }));
  };

  const handleCancelClick = (section: string) => {
    Modal.confirm({
      title: 'Discard Changes?',
      content: 'Are you sure you want to discard all of your changes?',
      onOk() {
        // Reset the form to previous values
        if (employeeInfo) {
          reset(employeeInfo);
        }
        setEditSections((prev) => ({ ...prev, [section]: false }));
      },
    });
  };

  const handleSaveClick = async (section: string) => {
    const data = methods.getValues(); // Get all form data
    try {
      // Prepare the update data for the specific section
      let updateData: Record<string, unknown> = {};
      switch (section) {
        case 'name':
          updateData = {
            firstName: data.firstName,
            lastName: data.lastName,
            middleName: data.middleName,
            preferredName: data.preferredName,
            profilePictureUrl: data.profilePictureUrl,
            ssn: data.ssn,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
          };
          break;
        case 'address':
          updateData = {
            address: data.address,
          };
          break;
        case 'contactInfo':
          updateData = {
            contactInfo: data.contactInfo,
          };
          break;
        case 'employment':
          updateData = {
            employment: data.employment,
          };
          break;
        case 'emergencyContact':
          updateData = {
            emergencyContact: data.emergencyContact,
          };
          break;
        default:
          break;
      }

      // Dispatch the updateEmployeeThunk with the updated data
      await dispatch(updateEmployeeThunk(updateData));

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
          onSave={handleSubmit(() => handleSaveClick('name'))}
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
                inputType: 'password', // Hide SSN input
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
            showSubmitButton={false}
          />
          {/* Display Profile Picture */}
          {employeeInfo.profilePictureUrl && (
            <div>
              <h4>Profile Picture</h4>
              <img
                src={employeeInfo.profilePictureUrl}
                alt="Profile"
                style={{ width: '150px', height: '150px', borderRadius: '50%' }}
              />
            </div>
          )}
        </Section>

        {/* Address Section */}
        <Section
          title="Address"
          isEditing={editSections.address}
          onEdit={() => handleEditClick('address')}
          onCancel={() => handleCancelClick('address')}
          onSave={handleSubmit(() => handleSaveClick('address'))}
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
            showSubmitButton={false}
          />
        </Section>

        {/* Contact Info Section */}
        <Section
          title="Contact Info"
          isEditing={editSections.contactInfo}
          onEdit={() => handleEditClick('contactInfo')}
          onCancel={() => handleCancelClick('contactInfo')}
          onSave={handleSubmit(() => handleSaveClick('contactInfo'))}
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
            showSubmitButton={false}
          />
        </Section>

        {/* Employment Section */}
        <Section
          title="Employment"
          isEditing={editSections.employment}
          onEdit={() => handleEditClick('employment')}
          onCancel={() => handleCancelClick('employment')}
          onSave={handleSubmit(() => handleSaveClick('employment'))}
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
            showSubmitButton={false}
          />
        </Section>

        {/* Emergency Contact Section */}
        <Section
          title="Emergency Contact"
          isEditing={editSections.emergencyContact}
          onEdit={() => handleEditClick('emergencyContact')}
          onCancel={() => handleCancelClick('emergencyContact')}
          onSave={handleSubmit(() => handleSaveClick('emergencyContact'))}
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
            showSubmitButton={false}
          />
        </Section>

        {/* Documents Section */}
        <div style={{ marginBottom: '20px' }}>
          <h3>Documents</h3>
          <ul>
          {Array.isArray(employeeInfo.documents) &&
          employeeInfo.documents?.map((doc, index) => (
              <li key={index}>
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  {doc.name}
                </a>
                <button
                  style={{ marginLeft: '10px' }}
                  onClick={() => window.open(doc.url, '_blank')}
                >
                  Preview
                </button>
                <a href={doc.url} download style={{ marginLeft: '10px' }}>
                  Download
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
    <div style={{ marginBottom: '20px' }}>
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
