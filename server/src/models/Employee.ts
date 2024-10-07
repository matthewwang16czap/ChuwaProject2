import mongoose, { Schema, Document } from "mongoose";
import * as EmailValidator from "email-validator";

const phoneValidator = {
  validator: (value: string) =>
    value === "" || /^(\+?\d{1,3}[- ]?)?\d{10}$/.test(value),
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

// Define the Employee interface
interface IEmployee extends Document {
  userId: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  profilePictureUrl?: string;
  ssn: string;
  dateOfBirth: Date | null;
  gender: "Male" | "Female" | "Other";
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
    endDate?: Date | null;
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
    profilePictureUrl?: string;
    driverLicenseUrl?: string;
  };
}

// Define the Employee schema with external email validator
const EmployeeSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: "Application",
    default: null,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: emailValidator, // Use the external email validator
  },
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  middleName: { type: String, default: "" },
  preferredName: { type: String, default: "" },
  profilePictureUrl: { type: String, default: "" }, // URL for the profile picture
  ssn: {
    type: String,
    default: "",
    validate: ssnValidator, // Simple SSN validation (9 digits)
  },
  dateOfBirth: { type: Date, default: null },
  gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
  address: {
    building: { type: String, default: "" },
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zip: { type: String, default: "" },
  },
  contactInfo: {
    cellPhone: {
      type: String,
      default: "",
      validate: phoneValidator, // Add phone number validation
    },
    workPhone: {
      type: String,
      default: "",
      validate: phoneValidator, // Add phone number validation
    },
  },
  employment: {
    visaTitle: { type: String, default: "" },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
  },
  emergencyContact: {
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    middleName: { type: String, default: "" },
    phone: {
      type: String,
      default: "",
      validate: phoneValidator, // Use the external phone validator
    },
    email: {
      type: String,
      default: "",
      validate: emailValidator, // Use the external email validator
    },
    relationship: { type: String, default: "" },
  },
  documents: {
    profilePictureUrl: { type: String, default: "" },
    driverLicenseUrl: { type: String, default: "" },
  },
});

// Create and export the Employee model
const Employee = mongoose.model<IEmployee>("Employee", EmployeeSchema);

export default Employee;
