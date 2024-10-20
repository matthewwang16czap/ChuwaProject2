import mongoose, { Schema, Document } from "mongoose";
import * as EmailValidator from "email-validator";

const phoneValidator = {
  validator: (value: string) =>
    value === "" || /^(\+?\d{1,3}[- ]?)?\d{10}$/.test(value),
  message: (props: any) => `${props.value} is not a valid phone number!`,
};

const ssnValidator = {
  validator: (value: any) =>
    value === "" || /^\d{3}-?\d{2}-?\d{4}$/.test(value),
  message: (props: any) => `${props.value} is not a valid ssn number!`,
};

const emailValidator = {
  validator: (value: string) => value === "" || EmailValidator.validate(value),
  message: (props: any) => `${props.value} is not a valid email address!`,
};

// Define the document interface
interface IDocument {
  name: string;
  url: string | null;
  status: "NeverSubmitted" | "Pending" | "Approved" | "Rejected";
  feedback?: string;
}

interface IWorkAuthorization {
  visaType: "H1-B" | "L2" | "F1(CPT/OPT)" | "H4" | "Other";
  visaTitle?: string;
  startDate: Date;
  endDate?: Date;
  documents?: IDocument[];
}

export interface IApplication extends Document {
  employeeId: Schema.Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
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
  ssn?: string;
  dateOfBirth?: Date;
  gender?: "Male" | "Female" | "Other";
  citizenship?: "GreenCard" | "Citizen" | "WorkAuthorization";
  workAuthorization?: IWorkAuthorization;
  references?: {
    firstName: string;
    lastName: string;
    middleName?: string;
    phone: string;
    email: string;
    relationship: string;
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
  status: "NeverSubmitted" | "Pending" | "Approved" | "Rejected";
  feedback?: string;
}

const ApplicationSchema: Schema = new Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
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
  address: {
    type: {
      building: { type: String, default: "" },
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zip: { type: String, default: "" },
    },
    set: function (value: any) {
      if (
        typeof value !== "object" ||
        !value.building ||
        !value.street ||
        !value.city ||
        !value.state ||
        !value.zip
      ) {
        throw new Error("Invalid address format.");
      }
      return value;
    },
  },
  contactInfo: {
    type: {
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
    set: function (value: any) {
      // Ensure contactInfo is an object and contains at least cellPhone and workPhone
      if (typeof value !== "object" || !value.cellPhone || !value.workPhone) {
        throw new Error("Invalid contactInfo format.");
      }
      return value;
    },
  },
  ssn: {
    type: String,
    default: "",
    validate: ssnValidator,
  },
  dateOfBirth: { type: Date, default: null },
  gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
  citizenship: {
    type: String,
    enum: ["GreenCard", "Citizen", "WorkAuthorization"],
    default: "WorkAuthorization",
  },
  workAuthorization: {
    visaType: {
      type: String,
      enum: ["H1-B", "L2", "F1(CPT/OPT)", "H4", "Other"],
      default: "Other",
    },
    visaTitle: { type: String, default: "" },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    documents: [
      {
        name: {
          type: String,
          default: "OPTReceipt",
          enum: ["OPTReceipt", "OPTEAD", "I-983", "I-20"],
        },
        url: { type: String, default: "" },
        status: {
          type: String,
          enum: ["NeverSubmitted", "Pending", "Approved", "Rejected"],
          default: "NeverSubmitted",
        },
        feedback: { type: String, default: "" },
      },
    ],
  },
  references: {
    type: {
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
    set: function (value: any) {
      // Ensure contactInfo is an object and contains at least cellPhone and workPhone
      if (
        typeof value !== "object" ||
        !value.firstName ||
        !value.lastName ||
        !value.phone ||
        !value.email ||
        !value.relationship
      ) {
        throw new Error("Invalid references format.");
      }
      return value;
    },
  },
  emergencyContact: {
    type: {
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
    set: function (value: any) {
      // Ensure contactInfo is an object and contains at least cellPhone and workPhone
      if (
        typeof value !== "object" ||
        value.firstName == null ||
        value.lastName == null ||
        value.phone == null ||
        value.email == null ||
        value.relationship == null
      ) {
        throw new Error("Invalid emergencyContact format.");
      }
      return value;
    },
  },
  documents: {
    profilePictureUrl: { type: String, default: "" },
    driverLicenseUrl: { type: String, default: "" },
  },
  status: {
    type: String,
    enum: ["NeverSubmitted", "Pending", "Approved", "Rejected"],
    default: "NeverSubmitted",
  },
  feedback: { type: String, default: "" },
});

// Create and export the Application model
const Application = mongoose.model<IApplication>(
  "Application",
  ApplicationSchema
);

export default Application;
