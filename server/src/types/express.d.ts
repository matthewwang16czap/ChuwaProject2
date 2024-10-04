// Extend Express Request to include user
declare namespace Express {
  interface Request {
    user?: {
      role: string;
      email?: string;
      employeeId?: string;
      applicationId?: string;
    };
  }
}
