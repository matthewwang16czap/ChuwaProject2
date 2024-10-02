import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for registration history
interface IRegistrationHistory {
  token: string;
  createdAt: Date;
  expireAt: Date; // Expiration date/time for the registration token
}

// Define the interface for the Registration model
interface IRegistration extends Document {
  email: string;
  registrationHistory: IRegistrationHistory[]; // An array of registration history
  userId: mongoose.Types.ObjectId; // Reference to the User schema
}

// Define the schema for the Registration model
const RegistrationSchema: Schema<IRegistration> = new Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Email should be unique
  },
  registrationHistory: [
    {
      token: { type: String, required: true }, // The registration token
      createdAt: { type: Date, default: Date.now }, // Token creation time
      expireAt: {
        type: Date,
        default: function () {
          // Set the expireAt field to 3 hours after createdAt
          return new Date(Date.now() + 3 * 60 * 60 * 1000); // Add 3 hours
        },
      },
    },
  ],
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', 
    required: true, 
  },
});

// Create and export the Registration model
const Registration = mongoose.model<IRegistration>('Registration', RegistrationSchema);

export default Registration;
