import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = 500; 
  const message = 'Something went wrong';

  console.error(err); // Log the error for debugging

  res.status(statusCode).json({
    success: false,
    message,
    // Optionally show the stack trace in development mode
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

export default errorHandler;
