import express from "express";
import {
  uploadFile,
  getApplication,
  updateApplication,
  submitApplication,
  decideApplication,
  decideDocument,
  searchApplication,
} from "../controllers/applicationController";
import {
  verifyToken,
  verifyHR,
  verifyEmployee,
} from "../middlewares/tokenAuth";

const router = express.Router();

// Route to handle file uploads
router.post("/documents", verifyToken, verifyEmployee, uploadFile);
router.get("/myapplication", verifyToken, verifyEmployee, getApplication);
router.put("/update", verifyToken, verifyEmployee, updateApplication);
router.put("/submit", verifyToken, verifyEmployee, submitApplication);

router.get("/:applicationId", verifyToken, verifyHR, getApplication);
router.put("/:applicationId/decide", verifyToken, verifyHR, decideApplication);
router.put(
  "/:applicationId/documents/decide",
  verifyToken,
  verifyHR,
  decideDocument
);
router.post("/search", verifyToken, verifyHR, searchApplication);

export default router;
