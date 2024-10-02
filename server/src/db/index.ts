import mongoose from "mongoose";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config();

// Resolve path for .env file
const envPath: string = path.resolve(__dirname, '../../', '.env');

// Read .env file
const envConfig: string = fs.readFileSync(envPath, 'utf8');

// Split .env file content into lines and filter out empty lines
const lines: string[] = envConfig.split('\n');
const filteredLines: string[] = lines.filter(line => line.trim() !== '');

// Extract MONGO_URI from the first line of the filtered lines
const MONGO_URI: string = filteredLines[0].split('=')[1];

// Function to connect to MongoDB
const connectDB = async (): Promise<void> => {
  try {
    // Connect to MongoDB using the environment variable for the MongoDB URI
    await mongoose.connect(MONGO_URI as string, {});
    console.log("Connected to MongoDB");
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error("An unknown error occurred");
    }
    // Exit the process with failure code
    process.exit(1);
  }
};

export default connectDB;
