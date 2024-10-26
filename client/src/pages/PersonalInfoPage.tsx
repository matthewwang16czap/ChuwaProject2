// PersonalInfoPage.tsx
import React, { useEffect, useState } from 'react';
import PrototypeForm from '../forms/PrototypeForm';
import { useForm, FormProvider } from 'react-hook-form';
import { Modal, Button } from 'antd'; // For confirmation dialog
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from "../app/store"; 
import {
  getMyProfile,
  updateEmployee,
  Employee
} from '../features/employee/employeeSlice'; // Adjust the path as needed
import axiosInstance from '../api/axiosInstance';

const PersonalInfoPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { employee } = useSelector((state: RootState) => state.employee);
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
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [documentBlob, setDocumentBlob] = useState<Blob | null>(null);

  const methods = useForm<Employee>({
    defaultValues: employee || {},
    mode: 'onChange',
  });
  const { reset, handleSubmit } = methods;

  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      try {
        dispatch(getMyProfile());
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
    if (employee) {
      reset(employee);
    }
    
  }, [employee, reset]);

  const handleEditClick = (section: string) => {
    setEditSections((prev) => ({ ...prev, [section]: true }));
  };

  const handleCancelClick = (section: string) => {
    Modal.confirm({
      title: 'Discard Changes?',
      content: 'Are you sure you want to discard all of your changes?',
      onOk() {
        // Reset the form to previous values
        if (employee) {
          reset(employee);
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
            profilePictureUrl: data.documents.profilePictureUrl,
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

      await dispatch(updateEmployee(updateData));

      // Exit edit mode
      setEditSections((prev) => ({ ...prev, [section]: false }));
    } catch (error) {
      console.error('Error updating employee info:', error);
    }
  };

  // Fetch document based on userId and filename
  const fetchDocument = async (fileUrl: string) => {
    try {
      const response = await axiosInstance.get(`/${fileUrl}`, {
        responseType: 'blob', // Expect binary data (Blob)
      });
      setDocumentBlob(response.data);
      // Create a URL for the blob and set it for download or preview
      // const url = URL.createObjectURL(response.data);
      // window.open(url); // Open the document in a new tab
    } catch (error) {
      console.error('Error fetching document:', error);
    }
  };

  const handleDocumentSelect = (event: React.MouseEvent<HTMLElement, MouseEvent>, file: string, fileUrl: string) => {
    event.preventDefault(); 
    setSelectedDocument(file);
    fetchDocument(fileUrl); 
  };

  if (loading || !employee) {
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

        {/* Document Section */}
        <div>
          <h3>Documents</h3>
          {employee.documents && Object.entries(employee.documents).map(([key, val]) => (
            <div key={key}>
              <Button onClick={(e) => handleDocumentSelect(e, key, val)}>
                {key}
              </Button>
            </div>
          ))}
        </div>

        {selectedDocument && (
          <div>
            <h4>Selected Document: {selectedDocument}</h4>
            {documentBlob && (
              <iframe
                src={URL.createObjectURL(documentBlob)}
                width="100%"
                height="500px"
                title="Document Preview"
              />
            )}
          </div>
        )}
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
        <Button onClick={onEdit}>Edit</Button>
      ) : (
        <div>
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={onSave}>Save</Button>
        </div>
      )}
      {children}
    </div>
  );
};

export default PersonalInfoPage;
