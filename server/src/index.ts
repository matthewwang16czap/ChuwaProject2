import express, { Request, Response } from "express";
import * as dotenv from 'dotenv';
import connectDB from "./db";
import errorHandler from './middleware/errorHandler';
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

connectDB();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript Express!");
});

// Use the error handler middleware after all routes
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
