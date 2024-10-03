import mongoose, { Schema, Document } from 'mongoose';

// Step 1: Define an interface for the Application
interface IDocument {
  employeeId: mongoose.Types.ObjectId;
  name: string;
  url?: string; // URL of the document
  status: 'Pending' | 'Approved' | 'Rejected'; // Document status
  feedback?: string; // Feedback if the document is rejected
}

interface IWorkAuthorization {
  visaType: 'H1-B' | 'L2' | 'F1(CPT/OPT)' | 'H4' | 'Other';
  visaTitle?: string; // Only filled if visaType is 'Other'
  startDate: Date;
  endDate?: Date;
  documents?: IDocument[]; // Array of documents required if F1
}

interface IApplication extends Document {
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
  email: string; // Pre-filled, not editable
  ssn?: string;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Other';
  citizenship?: 'Green Card' | 'Citizen' | 'Work Authorization';
  workAuthorization?: IWorkAuthorization; // Updated field
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
  status: 'Pending' | 'Approved' | 'Rejected';
  feedback?: string; // HR feedback if the application is rejected
}

// Step 2: Define the Application schema
const ApplicationSchema: Schema = new Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee', // Reference to the Employee schema
    required: true, // Employee ID must be provided
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
    zip: { type: String, default: '' }
  },
  cellPhone: { type: String, default: '' },
  workPhone: { type: String, default: '' },
  email: { type: String, required: true, unique: true }, // Pre-filled, not editable
  ssn: { type: String, default: '' },
  dateOfBirth: { type: Date, default: null },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
  citizenship: { type: String, enum: ['Green Card', 'Citizen', 'Work Authorization'], default: 'Work Authorization' },
  workAuthorization: {
    visaType: { type: String, enum: ['H1-B', 'L2', 'F1(CPT/OPT)', 'H4', 'Other'], default: 'Other' },
    visaTitle: { type: String, default: '' }, // Only filled if visaType is 'Other'
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    documents: [
      {
        name: { type: String, default: 'OPT Receipt', enum: ["OPT Receipt", "I-983", "I-20"] },
        url: { type: String, default: '' },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
        feedback: { type: String, default: '' } // Feedback if rejected
      }
    ]
  },
  references: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    middleName: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    relationship: { type: String, default: '' }
  },
  emergencyContacts: [
    {
      firstName: { type: String, default: '' },
      lastName: { type: String, default: '' },
      middleName: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      relationship: { type: String, default: '' }
    }
  ],
  documents: {
    profilePictureUrl: { type: String, default: '' },
    driversLicenseUrl: { type: String, default: '' },
  },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  feedback: { type: String, default: '' } // Only filled if rejected
});

// Step 3: Create the model
const Application = mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;
