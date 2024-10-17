import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import PrototypeForm, { Field } from "../forms/PrototypeForm";
import { useDispatch, useSelector } from "react-redux";
import { changeUserPassword, clearStatus } from "../features/user/userSlice"; // Adjust the path as needed
import { RootState, AppDispatch } from "../app/store"; // Adjust the path as needed
import { useNavigate } from "react-router-dom";
import { Button } from "antd";

// Define the interface for form inputs
interface ChangePasswordFormInputs {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const ChangePassword: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const { passwordChangeStatus, error } = useSelector(
    (state: RootState) => state.user
  );

  const methods = useForm<ChangePasswordFormInputs>();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const onSubmit: SubmitHandler<ChangePasswordFormInputs> = (data) => {
    if (data.newPassword !== data.confirmNewPassword) {
      methods.setError("confirmNewPassword", {
        type: "manual",
        message: "Passwords do not match.",
      });
      return;
    }

    setNewPassword(data.newPassword);

    dispatch(
      changeUserPassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      })
    );
  };

  useEffect(() => {
    if (passwordChangeStatus === "succeeded") {
      dispatch(clearStatus());
      setShowConfirmation(true);
      methods.reset();
    }
  }, [passwordChangeStatus, methods, dispatch]);

  // Define form fields
  const fields: Field<ChangePasswordFormInputs>[] = [
    {
      name: "oldPassword",
      label: "Old Password",
      type: "input",
      inputType: "password",
      validation: {
        required: "Old password is required",
        pattern: {
          value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          message:
            "Password must be at least 8 characters long, contain at least one letter, one number, and one special character.",
        },
      },
    },
    {
      name: "newPassword",
      label: "New Password",
      type: "input",
      inputType: "password",
      validation: {
        required: "New password is required",
        pattern: {
          value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          message:
            "Password must be at least 8 characters long, contain at least one letter, one number, and one special character.",
        },
      },
    },
    {
      name: "confirmNewPassword",
      label: "Confirm New Password",
      type: "input",
      inputType: "password",
      validation: { required: "Please confirm your new password" },
    },
  ];

  if (showConfirmation) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-4">
          Password Changed Successfully
        </h2>
        <p className="mb-4">Your new password is:</p>
        <p className="mb-4 font-mono text-lg">{newPassword}</p>
        <Button type="primary" onClick={() => navigate("/")}>
          Go to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Change Password</h2>
      {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
      <PrototypeForm
        fields={fields}
        onSubmit={onSubmit}
        methods={methods}
        submitButtonLabel={
          passwordChangeStatus === "loading"
            ? "Changing Password..."
            : "Change Password"
        }
      />
    </div>
  );
};

export default ChangePassword;
