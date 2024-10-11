import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User";
import Employee from "../models/Employee";
import Application from "../models/Application";
import Registration from "../models/Registration";
import nodemailer from "nodemailer";
import * as EmailValidator from "email-validator";
import dotenv from "dotenv";

dotenv.config();

export const sendInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).send({ message: "email is required" });
    return;
  }
  if (!EmailValidator.validate(email)) {
    res.status(400).send({ message: "email is invalid" });
    return;
  }
  const token: string = jwt.sign(
    { user: { email } },
    process.env.JWT_SECRET as string,
    { expiresIn: "3h" }
  );
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "registration email",
    text: `Please use the following link to complete your registration: ${process.env.FRONTEND_URL}/register?token=${token}`,
  };
  try {
    await transporter.sendMail(mailOptions);
    // Add to registration history
    let registration = await Registration.findOne({ email });
    if (!registration) {
      registration = new Registration({
        email,
      });
    }
    registration.registrationHistory.push({ token });
    registration.save();
    res.status(200).send({ message: "invitation is sent", registration });
  } catch (error) {
    res.status(500).send({ message: "error sending mail", error });
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, username, password, token } = req.body;

  try {
    // Decode token and verify it matches the email
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    if (decoded?.user?.email !== email) {
      res.status(400).json({ message: "Email does not match the token." });
      return;
    }
    // Create a new user with username and password
    const newUser = new User({ username, email, password, role: "Employee" });
    // Create a new Employee based on the email and userId
    const newEmployee = new Employee({ userId: newUser._id, email });
    // Update user's employeeId
    newUser.employeeId = newEmployee._id as mongoose.Types.ObjectId;
    // Create a new Application with email and employeeId
    const newApplication = new Application({
      employeeId: newEmployee._id,
      email,
    });
    // Update Employee's applicationId
    newEmployee.applicationId = newApplication._id as mongoose.Types.ObjectId;
    // Save final documents
    await newUser.save();
    await newEmployee.save();
    await newApplication.save();
    // Add userId to Registration schema based on email
    await Registration.findOneAndUpdate({ email }, { userId: newUser._id });
    // Return success
    res.status(201).json({ message: "Register successful!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Register failed.", error });
  }
};

export const getRegistrationHistoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { registrationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(registrationId)) {
    res.status(400).json({ message: "Invalid ID format" });
    return;
  }

  try {
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      res.status(404).json({ message: "Registration history not found" });
      return;
    }

    res.status(200).json({
      message: "Registration fetched",
      registrationHistory: registration.registrationHistory,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving registration history", error });
  }
};

export const getRegistrationHistoryByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: "No email provided" });
    return;
  }

  try {
    const registration = await Registration.findOne({email});
    if (!registration) {
      res.status(404).json({ message: "Registration history not found" });
      return;
    }

    res.status(200).json({
      message: "Registration fetched",
      registrationHistory: registration.registrationHistory,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving registration history", error });
  }
};