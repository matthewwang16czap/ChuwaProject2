import express, { Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./db";
import userRouter from "./routers/userRouter";
import registrationRouter from "./routers/registrationRouter";
import applicationRouter from "./routers/applicationRouter";
import employeeRouter from "./routers/employeeRouter";
import errorHandler from "./middlewares/errorHandler";
import cors from "cors";
import { verifyToken, verifyEmployeeOrHR } from "./middlewares/tokenAuth";

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

connectDB();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // If you need to send cookies or authentication headers
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// // Apply general HR access to /documents directory
// app.use(
//   "/documents",
//   verifyToken,
//   verifyHR,
//   express.static(`${__dirname}/documents`)
// );

app.use(
  "/documents",
  express
    .Router()
    .get("/:userId/:document", verifyToken, verifyEmployeeOrHR, (req, res) => {
      // sendFile argument should be an absolute path (Like yours):
      res.sendFile(
        `${__dirname}/documents/${req.params.userId}/${req.params.document}`
      );
    })
);

app.use("/api/user", userRouter);
app.use("/api/registration", registrationRouter);
app.use("/api/application", applicationRouter);
app.use("/api/employee", employeeRouter);

// Use the error handler middleware after all routes
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
