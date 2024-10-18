import express from "express";
import {
  updateEmployee,
  getAllEmployees,
  getEmployee,
  searchEmployeesByName,
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
router.post("/searchbyname", verifyToken, verifyHR, searchEmployeesByName);
router.get("/:employeeId", verifyToken, verifyHR, getEmployee);

export default router;
