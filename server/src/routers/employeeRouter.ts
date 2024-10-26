import express from "express";
import {
  updateEmployee,
  getAllEmployees,
  getEmployee,
} from "../controllers/employeeController";
import {
  verifyToken,
  verifyEmployee,
  verifyHR,
} from "../middlewares/tokenAuth";

const router = express.Router();

router.put("/update", verifyToken, verifyEmployee, updateEmployee);
router.get("/myprofile", verifyToken, verifyEmployee, getEmployee);
router.get("/all", verifyToken, verifyHR, getAllEmployees);
router.get("/:employeeId", verifyToken, verifyHR, getEmployee);

export default router;
