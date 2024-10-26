import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";

import Employee from "../models/Employee";

// employee part

// Middleware to update Application schema
export const updateEmployee: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const employeeId = req?.user?.employeeId;
    if (!employeeId) {
      res.status(400).json({ message: "EmployeeId ID is required" });
      return;
    }

    // Exclude documents from req.body
    const { documents, ...updateData } = req.body;

    // Update the Employee with the remaining fields
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    res.status(200).json({ message: "Update successfully", updatedEmployee });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error });
  }
};

// HR part

export const getAllEmployees: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const allEmployees = await Employee.find();
    if (!allEmployees) {
      res.status(404).json({ message: "Employees not found" });
      return;
    }
    res.status(200).json({ message: "Get successfully", allEmployees });
  } catch (error) {
    res.status(500).json({ message: "Get failed", error });
  }
};

export const getEmployee: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const employeeId = req?.user?.employeeId || req.params.employeeId;
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }
    res.status(200).json({ message: "Get successfully", employee });
  } catch (error) {
    res.status(500).json({ message: "Get failed", error });
  }
};