import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { HRAccount, ensureHRAccountExists } from "../utils/ensureHRAccount";

dotenv.config();

// Sample username and password for the HR account
const sampleHRAccount: HRAccount = {
  username: "hradmin",
  email: "hradmin@sample.com",
  password: "HRadmin123", 
  role: "HR",
};

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string, {});
    console.log("Connected to MongoDB");
    await ensureHRAccountExists(sampleHRAccount);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error("An unknown error occurred");
    }
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;