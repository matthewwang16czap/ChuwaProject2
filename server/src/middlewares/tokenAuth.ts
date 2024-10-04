import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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

export const verifyHR = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req?.user?.role) {
    res.status(401).json({ message: "No token, authorization denied" });
    return;
  }
  if (req.user.role === "HR") {
    next();
  }
  else {
    res.status(401).json({ message: "Permission Denied" });
  }
};
