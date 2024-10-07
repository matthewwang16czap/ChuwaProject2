import mongoose, { Schema, Document } from 'mongoose';
import * as EmailValidator from 'email-validator';

const phoneValidator = {
  validator: (value: string) => value === "" || /^(\+?\d{1,3}[- ]?)?\d{10}$/.test(value),
  message: (props: any) => `${props.value} is not a valid phone number!`,
};

const ssnValidator = {
  validator: (value: string) => value === "" || /\d{9}/.test(value),
  message: (props: any) => `${props.value} is not a valid ssn number!`,
};

const emailValidator = {
  validator: (value: string) => value === "" || EmailValidator.validate(value),
  message: (props: any) => `${props.value} is not a valid email address!`,
};

// Define the document interface
interface IDocument {
  name: string;
  url?: string;
  status: 'NeverSubmitted'| 'Pending' | 'Approved' | 'Rejected';
  feedback?: string;
}

interface IWorkAuthorization {
  visaType: 'H1-B' | 'L2' | 'F1(CPT/OPT)' | 'H4' | 'Other';
  visaTitle?: string;
  startDate: Date;
  endDate?: Date;
  documents?: IDocument[];
}

// Define the application interface
export interface IApplication extends Document {
  employeeId: Schema.Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  profilePictureUrl?: string;
  address?: {
    building: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  cellPhone?: string;
  workPhone?: string;
  ssn?: string;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Other';
  citizenship?: 'GreenCard' | 'Citizen' | 'WorkAuthorization';
  workAuthorization?: IWorkAuthorization;
  references?: {
    firstName: string;
    lastName: string;
    middleName?: string;
    phone: string;
    email: string;
    relationship: string;
  };
  emergencyContacts?: {
    firstName: string;
    lastName: string;
    middleName?: string;
    phone: string;
    email: string;
    relationship: string;
  }[];
  documents?: {
    profilePictureUrl?: string;
    driversLicenseUrl?: string;
  };
  status: 'NeverSubmitted' | 'Pending' | 'Approved' | 'Rejected';
  feedback?: string;
}

// Define the Application schema
const ApplicationSchema: Schema = new Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: emailValidator, // Use the external email validator
  },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  middleName: { type: String, default: '' },
  preferredName: { type: String, default: '' },
  profilePictureUrl: { type: String, default: '' },
  address: {
    building: { type: String, default: '' },
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zip: { type: String, default: '' },
  },
  cellPhone: { 
    type: String, 
    default: '', 
    validate: phoneValidator, // Use the external phone validator 
  },
  workPhone: { 
    type: String, 
    default: '', 
    validate: phoneValidator, // Use the external phone validator 
  },
  ssn: { 
    type: String, 
    default: '', 
    validate: ssnValidator, // Simple SSN validation (9 digits)
  },
  dateOfBirth: { type: Date, default: null },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
  citizenship: { 
    type: String, 
    enum: ['GreenCard', 'Citizen', 'WorkAuthorization'], 
    default: 'WorkAuthorization',
  },
  workAuthorization: {
    visaType: { 
      type: String, 
      enum: ['H1-B', 'L2', 'F1(CPT/OPT)', 'H4', 'Other'], 
      default: 'Other',
    },
    visaTitle: { type: String, default: '' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    documents: [
      {
        name: { 
          type: String, 
          default: 'OPTReceipt', 
          enum: ['OPTReceipt', 'I-983', 'I-20'],
        },
        url: { type: String, default: '' },
        status: { 
          type: String, 
          enum: ['NeverSubmitted', 'Pending', 'Approved', 'Rejected'], 
          default: 'NeverSubmitted',
        },
        feedback: { type: String, default: '' },
      },
    ],
  },
  references: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    middleName: { type: String, default: '' },
    phone: { 
      type: String, 
      default: '', 
      validate: phoneValidator, // Use the external phone validator 
    },
    email: {
      type: String,
      default: '',
      validate: emailValidator, // Use the external email validator
    },
    relationship: { type: String, default: '' },
  },
  emergencyContacts: [
    {
      firstName: { type: String, default: '' },
      lastName: { type: String, default: '' },
      middleName: { type: String, default: '' },
      phone: { 
        type: String, 
        default: '', 
        validate: phoneValidator, // Use the external phone validator 
      },
      email: {
        type: String,
        default: '',
        validate: emailValidator, // Use the external email validator
      },
      relationship: { type: String, default: '' },
    },
  ],
  documents: {
    profilePictureUrl: { type: String, default: '' },
    driversLicenseUrl: { type: String, default: '' },
  },
  status: { type: String, enum: ['NeverSubmitted', 'Pending', 'Approved', 'Rejected'], default: 'NeverSubmitted' },
  feedback: { type: String, default: '' },
});

// Create and export the Application model
const Application = mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;
