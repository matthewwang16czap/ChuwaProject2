// Extend Express Request to include user
declare namespace Express {
  interface Request {
    user?: {
      userId: string;
      role: string;
      email: string;
      employeeId?: string;
      applicationId?: string;
    };
  }
}
