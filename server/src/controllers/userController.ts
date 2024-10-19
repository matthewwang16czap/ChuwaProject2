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

interface IDocument {
  name: string;
  url: string | null;
  status: string;
  feedback: string;
  _id: string;
}

interface IWorkAuthorization {
  visaType: string;
  visaTitle: string;
  startDate: Date | null;
  endDate: Date | null;
  documents: IDocument[];
}

interface IApplication {
  _id: string;
  workAuthorization: IWorkAuthorization;
  status: string;
}

interface IEmployment {
  visaType: string;
  visaTitle: string;
  startDate: Date | null;
  endDate: Date | null;
}

interface IEmployee {
  _id: string;
  applicationId: IApplication;
  firstName: string;
  lastName: string;
  preferredName?: string;
  ssn: string;
  dateOfBirth: Date;
  gender: string;
  employment: IEmployment;
}

interface IUserWithNextStep {
  _id: string;
  username: string;
  email: string;
  role: string;
  employeeId?: IEmployee;
  nextStep?: string;
}

enum DocumentType {
  OPTReceipt = "OPTReceipt",
  OPTEAD = "OPTEAD",
  I983 = "I-983",
  I20 = "I-20",
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
    const payload: IPayload = {
      user: {
        userId: user._id?.toString(),
        role: user.role,
        email: user.email,
      },
    };

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
    const users = await User.find(
      { role: { $ne: "HR" } },
      "_id username role email"
    )
      .populate({
        path: "employeeId", // Populate employeeId from Employee schema
        select:
          "_id firstName lastName preferredName ssn dateOfBirth gender employment",
        populate: {
          path: "applicationId", // Populate applicationId from Application schema
          select: "workAuthorization status",
          model: "Application",
        },
      })
      .lean<IUserWithNextStep[]>();

    users.forEach((user) => {
      if (user.employeeId?.applicationId.status === "NeverSubmitted") {
        user.nextStep = "SubmitApplication";
      } else if (user.employeeId?.applicationId.status === "Pending") {
        user.nextStep = "WaitReviewApplication";
      } else if (user.employeeId?.applicationId.status === "Rejected") {
        user.nextStep = "ReSubmitApplication";
      } else {
        const documents =
          user.employeeId?.applicationId.workAuthorization.documents;
        if (documents) {
          for (const document of documents) {
            if (document.status === "NeverSubmitted") {
              switch (document.name) {
                case DocumentType.OPTReceipt:
                  user.nextStep = "SubmitOPTReceipt";
                  break;
                case DocumentType.OPTEAD:
                  user.nextStep = "SubmitOPTEAD";
                  break;
                case DocumentType.I983:
                  user.nextStep = "SubmitI983";
                  break;
                case DocumentType.I20:
                  user.nextStep = "SubmitI20";
                  break;
              }
              break;
            }
          }
        }
      }
    });

    // Send the response with all users and their related data
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee users.", error });
  }
};
