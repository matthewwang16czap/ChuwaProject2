import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string, {});
    console.log("Connected to MongoDB");
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