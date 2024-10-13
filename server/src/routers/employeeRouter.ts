import express from "express";
import {
  updateEmployee,
  getAllEmployees,
  getEmployee,
  searchEmployees,
} from "../controllers/employeeController";
import {
  verifyToken,
  verifyEmployee,
  verifyHR,
} from "../middlewares/tokenAuth";

const router = express.Router();

router.put("/update", verifyToken, verifyEmployee, updateEmployee);
router.get("/all", verifyToken, verifyHR, getAllEmployees);
router.get("/search", verifyToken, verifyHR, searchEmployees);
router.get("/:employeeId", verifyToken, verifyHR, getEmployee);

export default router;
