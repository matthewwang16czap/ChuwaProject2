// src/utils/ensureHRAccount.ts
import bcrypt from "bcrypt";
import User from "../models/User"; // Adjust the path to the User model

export interface HRAccount {
  username: string,
  email: string,
  password: string, 
  role: "HR",
};

// Function to check if HR account exists and create if it doesn't
export async function ensureHRAccountExists(HRAccount: HRAccount): Promise<void> {
  try {
    // Check if an HR account already exists
    const existingHR = await User.findOne({ role: "HR" });
    if (!existingHR) {
      console.log("No HR account found. Creating one...");
      // Create a new HR account
      const hrUser = new User(HRAccount);
      await hrUser.save();
      console.log("HR account created successfully.");
    } else {
      console.log("HR account already exists.");
    }
  } catch (err) {
    console.error("Error while ensuring HR account:", err);
  }
}
