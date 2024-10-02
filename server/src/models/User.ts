import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

const saltRounds = 10; // The number of salt rounds for bcrypt

// Define an interface for the User model
interface IUser extends Document {
  username: string;
  role: "HR" | "Employee"; // Role can be either HR or Employee
  employeeId?: mongoose.Types.ObjectId; // Reference to the Employee schema
  password: string; // Hashed password
  verifyPassword(plainPassword: string): Promise<boolean>; // Password verification method
}

// Define the User schema
const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true, unique: true }, // Unique username
  role: { type: String, enum: ["HR", "Employee"], required: true }, // Enum for role
  employeeId: { type: Schema.Types.ObjectId, ref: "Employee" }, // Reference to the Employee schema
  password: { type: String, required: true }, // Store hashed password
});

// Pre-save middleware to hash the password before saving
UserSchema.pre<IUser>("save", async function (next): Promise<void> {
  // If password has not been modified, skip hashing
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword; // Replace the plain password with the hashed one
    next(); // Move to the next middleware or save the document
  } catch (error) {
    // Type-check the error and pass it to the next middleware
    if (error instanceof Error) {
      next(error); // Pass the error to the next middleware
    } else {
      next(new Error("An unexpected error occurred during password hashing."));
    }
  }
});

// Method to verify the password
UserSchema.methods.verifyPassword = async function (
  plainPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, this.password);
};

// Create and export the User model
const User = mongoose.model<IUser>("User", UserSchema);

export default User;
