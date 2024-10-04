import express, { Request, Response } from "express";
import dotenv from 'dotenv';
import connectDB from "./db";
import userRouter from './routers/userRouter';
import registrationRouter from './routers/registrationRouter';
import errorHandler from './middlewares/errorHandler';
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/user', userRouter);
app.use('/api/registration', registrationRouter);


app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript Express!");
});

// Use the error handler middleware after all routes
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
