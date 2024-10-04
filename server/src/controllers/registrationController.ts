import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User"; // Assuming your User model path
import Employee from "../models/Employee";
import Application from "../models/Application";
import Registration from "../models/Registration"; // Assuming a Registration schema

// Middleware to create a new registration with email and token
export const createRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    // Check if the registration exists for the provided email
    let registration = await Registration.findOne({ email });
    if (registration) {
      res.status(400).json({
        message: "Registration already created",
      });
      return;
    }

    registration = new Registration({
      email,
    });

    registration.save();

    res.status(201).json({
      message: "Registration created successfully",
      registration,
    });
  } catch (error) {
    res.status(500).json({ message: "Create registration failed", error });
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, username, password, token } = req.body;

  try {
    // Decode token and verify it matches the email
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded?.user?.email !== email) {
      res.status(400).json({ message: "Email does not match the token." });
      return;
    }

    // Create a new user with username and password
    const newUser = new User({ username, password, role: "Employee" });
    await newUser.save();

    // Create a new Employee based on the email and userId
    const newEmployee = new Employee({ userId: newUser._id, email });
    await newEmployee.save();

    // Update user's employeeId
    newUser.employeeId = newEmployee._id as mongoose.Types.ObjectId;
    await newUser.save();

    // Create a new Application with email and employeeId
    const newApplication = new Application({
      employeeId: newEmployee._id,
      email,
    });
    await newApplication.save();

    // Update Employee's applicationId
    newEmployee.applicationId = newApplication._id as mongoose.Types.ObjectId;
    await newEmployee.save();

    // Add userId to Registration schema based on email
    await Registration.findOneAndUpdate({ email }, { userId: newUser._id });

    res.status(201).json({ message: "Register successful!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Register failed.", error });
  }
};
