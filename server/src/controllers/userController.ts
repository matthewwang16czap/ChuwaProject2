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
    const { name, nextStep } = req.body;

    // Fetch all users who are employees (excluding HR)
    let users = await User.find(
      { role: { $ne: "HR" } }, // Exclude HR users
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
      .lean<IUserWithNextStep[]>(); // Ensure we get plain JavaScript objects for easier manipulation

    // If a name is provided, filter users by firstName, lastName, or preferredName (case-insensitive)
    if (name) {
      const nameLowerCase = name.toLowerCase();
      users = users.filter((user) => {
        const { firstName, lastName, preferredName } = user.employeeId || {};
        return (
          firstName?.toLowerCase().includes(nameLowerCase) ||
          lastName?.toLowerCase().includes(nameLowerCase) ||
          preferredName?.toLowerCase().includes(nameLowerCase)
        );
      });
    }

    // Process each user's application status and determine the next step
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
        let allDocumentsCompleted = true;

        if (documents) {
          for (const document of documents) {
            switch (document.status) {
              case "NeverSubmitted":
                allDocumentsCompleted = false;
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

              case "Pending":
                allDocumentsCompleted = false;
                switch (document.name) {
                  case DocumentType.OPTReceipt:
                    user.nextStep = "WaitReviewOPTReceipt";
                    break;
                  case DocumentType.OPTEAD:
                    user.nextStep = "WaitReviewOPTEAD";
                    break;
                  case DocumentType.I983:
                    user.nextStep = "WaitReviewI983";
                    break;
                  case DocumentType.I20:
                    user.nextStep = "WaitReviewI20";
                    break;
                }
                break;

              case "Rejected":
                allDocumentsCompleted = false;
                switch (document.name) {
                  case DocumentType.OPTReceipt:
                    user.nextStep = "ReSubmitOPTReceipt";
                    break;
                  case DocumentType.OPTEAD:
                    user.nextStep = "ReSubmitOPTEAD";
                    break;
                  case DocumentType.I983:
                    user.nextStep = "ReSubmitI983";
                    break;
                  case DocumentType.I20:
                    user.nextStep = "ReSubmitI20";
                    break;
                }
                break;
            }

            if (!allDocumentsCompleted) break; // Exit if any document is not completed
          }
        }

        if (allDocumentsCompleted) {
          user.nextStep = "Finished"; // If all documents are completed, mark as finished
        }
      }
    });

    // If nextStep is provided, filter users based on the calculated next step
    if (nextStep) {
      users = users.filter((user) => user.nextStep === nextStep);
    }

    // Return the filtered users along with their next step
    res.status(200).json({ message: "Search employees successfully", users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee users.", error });
  }
};
