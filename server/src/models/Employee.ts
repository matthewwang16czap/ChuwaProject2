import mongoose, { Schema, Document } from 'mongoose';

// Define the Employee interface
interface IEmployee extends Document {
  userId: mongoose.Types.ObjectId;
  applicationId?: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  profilePictureUrl?: string;
  email: string;
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

// Define the Employee schema
const EmployeeSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', 
    required: true, 
  },
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Application', 
    default: null, 
  },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  middleName: { type: String, default: '' },
  preferredName: { type: String, default: '' },
  profilePictureUrl: { type: String, default: '' }, // URL for the profile picture
  email: { type: String, required: true, unique: true },
  ssn: { type: String, default: '' },
  dateOfBirth: { type: Date, default: null },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
  address: {
    building: { type: String, default: '' },
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zip: { type: String, default: '' }
  },
  contactInfo: {
    cellPhone: { type: String, default: '' },
    workPhone: { type: String, default: '' }
  },
  employment: {
    visaTitle: { type: String, default: '' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null }
  },
  emergencyContact: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    middleName: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    relationship: { type: String, default: '' }
  },
  documents: [
    {
      name: { type: String, default: '' },
      url: { type: String, default: '' }
    }
  ]
});

// Create and export the Employee model
const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;
