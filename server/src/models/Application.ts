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
  address: {
    building: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  cellPhone: string;
  workPhone?: string;
  email: string; // Pre-filled, not editable
  ssn: string;
  dateOfBirth: Date;
  gender: 'Male' | 'Female' | 'Other';
  citizenship: 'Green Card' | 'Citizen' | 'Work Authorization';
  workAuthorization?: IWorkAuthorization; // Updated field
  references?: {
    firstName: string;
    lastName: string;
    middleName?: string;
    phone: string;
    email: string;
    relationship: string;
  };
  emergencyContacts: {
    firstName: string;
    lastName: string;
    middleName?: string;
    phone: string;
    email: string;
    relationship: string;
  }[];
  documents: {
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
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: { type: String },
  preferredName: { type: String },
  profilePictureUrl: { type: String },
  address: {
    building: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true }
  },
  cellPhone: { type: String, required: true },
  workPhone: { type: String },
  email: { type: String, required: true, unique: true }, // Pre-filled, not editable
  ssn: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  citizenship: { type: String, enum: ['Green Card', 'Citizen', 'Work Authorization'], required: true },
  workAuthorization: {
    visaType: { type: String, enum: ['H1-B', 'L2', 'F1(CPT/OPT)', 'H4', 'Other'], required: true },
    visaTitle: { type: String }, // Only filled if visaType is 'Other'
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    documents: [
      {
        name: { type: String, required: true, enum: ["OPT Receipt", "I-983", "I-20"] },
        url: { type: String },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
        feedback: { type: String } // Feedback if rejected
      }
    ]
  },
  references: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: { type: String },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    relationship: { type: String, required: true }
  },
  emergencyContacts: [
    {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      middleName: { type: String },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      relationship: { type: String, required: true }
    }
  ],
  documents: {
    profilePictureUrl: { type: String },
    driversLicenseUrl: { type: String },
  },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  feedback: { type: String } // Only filled if rejected
});

// Step 3: Create the model
const Application = mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;
