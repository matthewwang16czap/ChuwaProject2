import mongoose, { Schema, Document } from 'mongoose';

interface IEmployee extends Document {
  applicationId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  profilePictureUrl?: string;
  email: string;
  ssn: string;
  dateOfBirth: Date;
  gender: 'Male' | 'Female' | 'Other';
  address: {
    building: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  contactInfo: {
    cellPhone: string;
    workPhone?: string;
  };
  employment: {
    visaTitle: string;
    startDate: Date;
    endDate?: Date;
  };
  emergencyContact: {
    firstName: string;
    lastName: string;
    middleName?: string;
    phone: string;
    email: string;
    relationship: string;
  };
  documents: {
    name: string;
    url: string;
  }[];
}

const EmployeeSchema: Schema = new Schema({
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Application', 
    required: true, 
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: { type: String },
  preferredName: { type: String },
  profilePictureUrl: { type: String }, // URL for the profile picture
  email: { type: String, required: true, unique: true },
  ssn: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  address: {
    building: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true }
  },
  contactInfo: {
    cellPhone: { type: String, required: true },
    workPhone: { type: String }
  },
  employment: {
    visaTitle: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date }
  },
  emergencyContact: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: { type: String },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    relationship: { type: String, required: true }
  },
  documents: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true } // URL where the document is stored
    }
  ]
});

const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;
