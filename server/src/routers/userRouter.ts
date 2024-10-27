import express from "express";
import {
  login,
  changePassword,
  getAllEmployeeUsers,
  getEmployeeUserById,
  sendNotification,
} from "../controllers/userController";
import { verifyToken, verifyHR } from "../middlewares/tokenAuth";

const router = express.Router();

router.post("/login", login);
router.post("/changepassword", verifyToken, changePassword);
router.post("/allemployees", verifyToken, verifyHR, getAllEmployeeUsers);
router.post("/sendnotification", verifyToken, verifyHR, sendNotification);
router.get("/:userId", verifyToken, verifyHR, getEmployeeUserById);

export default router;
