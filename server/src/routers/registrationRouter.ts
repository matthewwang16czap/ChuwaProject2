
import express from "express";
import {
  sendInvitation,
  register,
  getRegistrationHistoryById,
  getRegistrationHistoryByEmail,
} from "../controllers/registrationController";
import { verifyToken, verifyHR } from "../middlewares/tokenAuth";


const router = express.Router();

router.post("/sendinvitation", verifyToken, verifyHR, sendInvitation);
router.post("/register", register);
router.get(
  "/:registrationId",
  verifyToken,
  verifyHR,
  getRegistrationHistoryById
);
router.post("/", verifyToken, verifyHR, getRegistrationHistoryByEmail);

export default router;
