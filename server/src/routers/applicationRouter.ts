import express from "express";
import {
  uploadFile,
  updateApplication,
  submitApplication,
  decideApplication,
  decideDocument,
} from "../controllers/applicationController";
import {
  verifyToken,
  verifyHR,
  verifyEmployee,
} from "../middlewares/tokenAuth";

const router = express.Router();

// Route to handle file uploads
router.post("/application/documents", verifyToken, verifyEmployee, uploadFile);
router.put(
  "/application/update",
  verifyToken,
  verifyEmployee,
  updateApplication
);
router.put(
  "/application/submit",
  verifyToken,
  verifyEmployee,
  submitApplication
);
router.put(
  "/application/:applicationId/decide",
  verifyToken,
  verifyHR,
  decideApplication
);
router.put(
  "/application/:applicationId/documents/decide",
  verifyToken,
  verifyHR,
  decideDocument
);
