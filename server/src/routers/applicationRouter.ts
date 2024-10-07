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
router.post("/documents", verifyToken, verifyEmployee, uploadFile);
router.put(
  "/update",
  verifyToken,
  verifyEmployee,
  updateApplication
);
router.put(
  "/submit",
  verifyToken,
  verifyEmployee,
  submitApplication
);
router.put(
  "/:applicationId/decide",
  verifyToken,
  verifyHR,
  decideApplication
);
router.put(
  "/:applicationId/documents/decide",
  verifyToken,
  verifyHR,
  decideDocument
);

export default router;