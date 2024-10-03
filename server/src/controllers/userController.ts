import { Request, Response } from 'express';
import User from '../models/User'; 
import Employee from '../models/Employee'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface IPayload {
  user: {
    role: string;
    employeeId?: string | null | undefined;
    applicationId?: string | null | undefined;
  };
}

// Controller for user login
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username." });
    }

    // Verify the password
    const isMatch = await user.verifyPassword(password); // Assuming user.verifyPassword is implemented
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password." });
    }

    // Create JWT payload
    const payload: IPayload = { user: { role: user.role } };

    // Get employeeId and applicationId if the user is not an HR
    if (user.role !== "HR") {
      const employee = await Employee.findById(user.employeeId, "applicationId");
      payload.user.employeeId = user.employeeId?.toString(); // Ensure employeeId is a string
      payload.user.applicationId = employee?.applicationId?.toString();;
    }

    // Generate JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: '3h',
    });

    // Send the response
    res.status(200).json({ message: "Login successful.", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in.", error });
  }
};

// Controller for changing password
export const changePassword = async (req: Request, res: Response) => {
  const { username, oldPassword, newPassword } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // Verify the old password
    const isMatch = await user.verifyPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }

    // Hash the new password and save
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error changing password.", error });
  }
};
