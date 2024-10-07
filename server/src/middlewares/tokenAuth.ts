import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Get token from header (either 'x-auth-token' or 'Authorization' header)
  const token =
    req.header("x-auth-token") ||
    req.headers?.authorization?.match(/^Bearer (.+)/)?.[1];

  // Check if token exists
  if (!token) {
    res.status(401).json({ message: "No token, authorization denied" });
    return;
  }

  try {
    // Verify the token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    // Add user information from the token to the request
    req.user = decoded.user;

    // Proceed to the next middleware
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
    return;
  }
};

// Verify HR account
export const verifyHR = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req?.user?.role === "HR") {
    next();
  } else {
    res.status(401).json({ message: "Permission Denied" });
  }
};

// Verify employee operates on oneself's account
export const verifyEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // verify role and potential operation on different account
  if (
    req?.user?.role === "Employee" &&
    ((req?.params?.userId && req.user.userId === req.params.userId) ||
      !req?.params?.userId)
  ) {
    next();
  } else {
    res.status(401).json({ message: "Permission Denied" });
  }
};
