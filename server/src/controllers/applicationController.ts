import fs from "fs";
import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import multer from "multer";
import path from "path";

import Application, { IApplication } from "../models/Application";
import Employee from "../models/Employee";

// Employee Section

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(file);
    const userId = req?.user?.userId || "default";
    const dir = `${__dirname}/../documents/${userId}`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const allowedFileNames = [
      "OPTReceipt",
      "I-983",
      "I-20",
      "ProfilePicture",
      "DriverLicense",
    ];
    const originalName = path.parse(file.originalname).name;
    if (allowedFileNames.includes(originalName)) {
      cb(null, file.originalname);
    } else {
      cb(new Error("Invalid file name"), file.originalname);
    }
  },
});

// middleware to upload documents
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

export const uploadFile: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  upload.single("file")(req, res, async (err: unknown) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        res.status(400).json({ message: err.message });
      } else if (err instanceof Error) {
        // An unknown error occurred when uploading.
        res.status(400).json({
          message: err.message,
          error: err,
        });
      } else {
        // Handle cases where err might be a string or another unknown type
        return res
          .status(400)
          .json({ message: "Unexpected error", error: err });
      }
    } else {
      if (!req.file) {
        // No file provided
        res.status(400).json({ message: "No file uploaded" });
        return;
      }
      try {
        const userId = req?.user?.userId || "default";
        const filePath = `documents/${userId}/${
          req?.file?.originalname || "default"
        }`;
        const applicationId = req?.user?.applicationId;
        const fileName = path.parse(req?.file?.originalname || "default").name;

        // Find the application to check workAuthorization document status
        const application = await Application.findById(applicationId);
        if (!application) {
          res.status(404).json({ message: "Application not found" });
          return;
        }

        // Determine the field to update based on the file name
        let updateField: object = {};
        switch (fileName) {
          case "ProfilePicture":
            updateField = { "documents.profilePictureUrl": filePath };
            // Update the Application document with the file URL
            await Application.findByIdAndUpdate(applicationId, {
              $set: updateField,
            });
            // Update the Employee document as well
            await Employee.findByIdAndUpdate(req?.user?.employeeId, {
              $set: updateField,
            });
            break;
            break;
          case "DriverLicense":
            updateField = { "documents.driverLicenseUrl": filePath };
            // Update the Application document with the file URL
            await Application.findByIdAndUpdate(applicationId, {
              $set: updateField,
            });
            // Update the Employee document as well
            await Employee.findByIdAndUpdate(req?.user?.employeeId, {
              $set: updateField,
            });
            break;
          default:
            // Check if the workAuthorization document for the given fileName exists
            const document = application?.workAuthorization?.documents?.find(
              (doc) => doc.name === fileName
            );
            if (!document) {
              res
                .status(400)
                .json({ message: `Document ${fileName} section not found` });
              return;
            }
            if (document.status !== "NeverSubmitted") {
              res.status(400).json({
                message: `Document ${fileName} is not in "NeverSubmitted" status`,
              });
              return;
            }
            updateField = {
              "workAuthorization.documents.$[elem].url": filePath,
              "workAuthorization.documents.$[elem].status": "Pending",
            };
            // Update the Application document with the file URL
            await Application.findByIdAndUpdate(
              applicationId,
              {
                $set: updateField,
              },
              {
                arrayFilters: [{ "elem.name": fileName }],
              }
            );
        }
        res.status(201).json({ message: "Upload successfully", filePath });
      } catch (error) {
        res.status(500).json({ message: "Database error", error });
      }
    }
  });
};

// Middleware to get Application schema
export const getApplication: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const applicationId = req?.user?.applicationId || req.params.applicationId;
    if (!applicationId) {
      res.status(400).json({ message: "ApplicationId ID is required" });
      return;
    }
    const application = await Application.findById(applicationId);
    res
      .status(200)
      .json({ message: "Get successfully", application });
  } catch (error) {
    res.status(500).json({ message: "Get failed", error });
  }
};

// Middleware to update Application schema
export const updateApplication: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const applicationId = req?.user?.applicationId;
    if (!applicationId) {
      res.status(400).json({ message: "ApplicationId ID is required" });
      return;
    }

    // Exclude documents in workAuthorization and documents field from req.body
    const {
      workAuthorization,
      documents,
      email,
      status,
      feedback,
      ...updateData
    } = req.body;

    // Update the application with the remaining fields
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedApplication) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "Update successfully", updatedApplication });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error });
  }
};

export const submitApplication: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const applicationId = req?.user?.applicationId;
    if (!applicationId) {
      res.status(400).json({ message: "Application ID is required" });
      return;
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    const fieldsToExclude: Array<keyof IApplication> = [
      "middleName",
      "preferredName",
      "documents",
      "workAuthorization",
      "references",
      "emergencyContact",
      "feedback",
    ];
    const applicationObject = application.toObject();
    const emptyFields: string[] = [];

    function isEmptyField(value: unknown): boolean {
      return (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "")
      );
    }

    // Use Object.entries to iterate over the applicationObject
    Object.entries(applicationObject).forEach(([key, value]) => {
      if (fieldsToExclude.includes(key as keyof IApplication)) return;

      // If value is an object, check its entries
      if (typeof value === "object" && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (isEmptyField(subValue)) {
            emptyFields.push(`${key}.${subKey}`);
          }
        });
      } else if (isEmptyField(value)) {
        // For primitive fields
        emptyFields.push(key);
      }
    });

    // If there are empty fields, return them in the response
    if (emptyFields.length > 0) {
      res
        .status(400)
        .json({ message: "Some fields are required", emptyFields });
      return;
    }

    // Update the application status to "Pending"
    application.status = "Pending";
    await application.save();
    res.status(200).json({ message: "Submit successfully", application });
  } catch (error) {
    res.status(500).json({ message: "Submit failed", error });
  }
};

// HR section

export const decideApplication: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { applicationId } = req.params;
    const { status, feedback } = req.body;

    // Validate input
    if (!applicationId || !["Approved", "Rejected"].includes(status)) {
      res.status(400).json({ message: "Invalid application ID or status" });
      return;
    }

    if (status === "Rejected" && (!feedback || feedback.trim() === "")) {
      res
        .status(400)
        .json({ message: "Feedback is required for rejected applications" });
      return;
    }

    // Find the application by ID
    const application = await Application.findById(applicationId);
    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    // Update the application with status and feedback (if rejected)
    application.status = status;
    if (status === "Rejected") {
      application.feedback = feedback;
    } else {
      application.feedback = ""; // Clear feedback if the application is approved
      // if F1, need to submit some documents after approving this
      if (application?.workAuthorization?.visaType === "F1(CPT/OPT)") {
        application.workAuthorization.documents = [];
        application.workAuthorization.documents.push({
          name: "OPTReceipt",
          status: "NeverSubmitted",
          url: null,
        });
      }
      // update Employee document
      const employee = await Employee.findById(application.employeeId);
      if (!employee) {
        res.status(404).json({ message: "Employee not found" });
        return;
      }
      // Fill employee fields from the application
      employee.email = application.email;
      employee.firstName = application.firstName;
      employee.lastName = application.lastName;
      employee.middleName = application.middleName || "";
      employee.preferredName = application.preferredName || "";
      employee.ssn = application.ssn || "";
      employee.dateOfBirth = application.dateOfBirth || null;
      employee.gender = application.gender || "Other";
      // Fill employee address
      employee.citizenship = application.citizenship || "WorkAuthorization";
      employee.address = {
        building: application.address?.building || "",
        street: application.address?.street || "",
        city: application.address?.city || "",
        state: application.address?.state || "",
        zip: application.address?.zip || "",
      };
      // Fill employee contact info
      employee.contactInfo = {
        cellPhone: application.contactInfo?.cellPhone || "",
        workPhone: application.contactInfo?.workPhone || "",
      };
      // Fill employment information from workAuthorization
      if (application.workAuthorization) {
        employee.employment = {
          visaType: application.workAuthorization.visaType || "Other",
          visaTitle: application.workAuthorization.visaTitle || "",
          startDate: application.workAuthorization.startDate || null,
          endDate: application.workAuthorization.endDate || null,
        };
      }
      // Fill emergency contact details
      if (application.emergencyContact) {
        employee.emergencyContact = {
          firstName: application.emergencyContact.firstName || "",
          lastName: application.emergencyContact.lastName || "",
          middleName: application.emergencyContact.middleName || "",
          phone: application.emergencyContact.phone || "",
          email: application.emergencyContact.email || "",
          relationship: application.emergencyContact.relationship || "",
        };
      }
      // Fill documents if available
      employee.documents = {
        profilePictureUrl: application.documents?.profilePictureUrl || "",
        driverLicenseUrl: application.documents?.driverLicenseUrl || "",
      };
      await employee.save();
    }
    await application.save();

    res.status(200).json({
      message: `Application has been ${status.toLowerCase()}`,
      application,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to process application", error });
  }
};

export const decideDocument: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { applicationId } = req.params;
    const { documentName, status, feedback } = req.body;

    // Allowed document names
    const allowedDocuments = ["OPTReceipt", "I-983", "I-20"];

    // Validate input
    if (
      !applicationId ||
      !allowedDocuments.includes(documentName) ||
      !["Approved", "Rejected"].includes(status)
    ) {
      res
        .status(400)
        .json({ message: "Invalid application ID, document name, or status" });
      return;
    }

    if (status === "Rejected" && (!feedback || feedback.trim() === "")) {
      res
        .status(400)
        .json({ message: "Feedback is required for rejected documents" });
      return;
    }

    // Find the application by ID
    const application = await Application.findById(applicationId);
    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    // Find the first document in workAuthorization.documents that is Pending and matches the documentName
    const pendingDocument = application?.workAuthorization?.documents?.find(
      (doc) => doc.name === documentName && doc.status === "Pending"
    );

    if (!pendingDocument) {
      res
        .status(404)
        .json({ message: "Pending document not found or already processed" });
      return;
    }

    // Update the document's status and feedback
    pendingDocument.status = status;
    if (status === "Rejected") {
      pendingDocument.feedback = feedback;
    } else {
      pendingDocument.feedback = ""; // Clear feedback if the document is approved

      // Push new document based on the current document being processed
      if (documentName === "OPTReceipt") {
        application?.workAuthorization?.documents?.push({
          name: "I-983",
          status: "NeverSubmitted",
          url: null,
        });
      } else if (documentName === "I-983") {
        application?.workAuthorization?.documents?.push({
          name: "I-20",
          status: "NeverSubmitted",
          url: null,
        });
      }
    }

    // Save the updated application
    await application.save();

    res.status(200).json({
      message: `Document ${documentName} has been ${status.toLowerCase()}`,
      application,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to process document decision", error });
  }
};

export const searchApplication: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { documents } = req.body;

  if (!Array.isArray(documents) || documents.length === 0) {
    res.status(400).json({
      message: "An array of documents with name and status is required.",
    });
    return;
  }

  try {
    const query = documents.map((doc) => ({
      "workAuthorization.documents": {
        $elemMatch: {
          name: doc.name,
          status: doc.status,
        },
      },
    }));

    const applications = await Application.find({
      $and: query,
    });

    if (applications.length === 0) {
      res.status(404).json({ message: "No applications found" });
      return;
    }
    res
      .status(200)
      .json({ message: "Search application successfully", applications });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching for applications", error });
  }
};
