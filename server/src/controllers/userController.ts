import { Request, Response, RequestHandler, NextFunction } from "express";
import User from "../models/User";
import Employee from "../models/Employee";
import Application from "../models/Application";
import jwt from "jsonwebtoken";

interface IPayload {
  user: {
    userId: string | null | undefined;
    role: string;
    email: string;
    employeeId?: string | null | undefined;
    applicationId?: string | null | undefined;
  };
}

// Controller for user login
export const login: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { username, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      res.status(400).json({ message: "Invalid username." });
      return;
    }

    // Verify the password
    const isMatch = await user.verifyPassword(password); 
    if (!isMatch) {
      res.status(400).json({ message: "Invalid password." });
      return;
    }

    // Create JWT payload
    const payload: IPayload = { user: { userId: user._id?.toString(), role: user.role, email: user.email } };

    // Get employeeId and applicationId if the user is not an HR
    if (user.role !== "HR") {
      const employee = await Employee.findById(
        user.employeeId,
        "applicationId"
      );
      payload.user.employeeId = user.employeeId?.toString(); 
      payload.user.applicationId = employee?.applicationId?.toString();
    }

    // Generate JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "3h",
    });

    // Send the response
    res.status(200).json({ message: "Login successful.", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in.", error });
  }
};

// Controller for changing password
export const changePassword: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { oldPassword, newPassword } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email: req?.user?.email });
    if (!user) {
      res.status(400).json({ message: "User not found." });
      return;
    }

    // Verify the old password
    const isMatch = await user.verifyPassword(oldPassword);
    if (!isMatch) {
      res.status(400).json({ message: "Old password is incorrect." });
      return;
    }

    // Hash the new password and save
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error changing password.", error });
  }
};

// HR to get all employee users
export const getAllEmployeeUsers: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Fetch all users who are not HR (employees) and populate employeeId and applicationId
    const users = await User.find({ role: { $ne: "HR" } })
      .populate({
        path: 'employeeId', // Populate employeeId from Employee schema
        populate: {
          path: 'applicationId', // Populate applicationId from Application schema
          model: 'Application'
        },
      })
      .lean();

    // Send the response with all users and their related data
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee users.", error });
  }
};