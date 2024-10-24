import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import {
  register,
  resetStatus,
} from "../features/registration/registrationSlice"; // Adjust path as needed
import { RootState, AppDispatch } from "../app/store"; // Adjust path as needed
import PrototypeForm, { Field } from "../forms/PrototypeForm";

interface JwtPayload {
  user: {
    email: string;
  };
}

interface RegisterFormInputs {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { registerStatus, error } = useSelector(
    (state: RootState) => state.registration
  );

  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const methods = useForm<RegisterFormInputs>({
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Extract token from URL and decode email
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get("token");

    if (tokenParam) {
      setToken(tokenParam);
      try {
        const decoded = jwtDecode<JwtPayload>(tokenParam);
        const userEmail = decoded?.user?.email;
        if (userEmail) {
          setEmail(userEmail);
          methods.setValue("email", userEmail);
        } else {
          methods.setError("email", {
            type: "manual",
            message: "Invalid token: email not found.",
          });
        }
      } catch {
        methods.setError("email", {
          type: "manual",
          message: "Invalid token.",
        });
      }
    } else {
      methods.setError("email", {
        type: "manual",
        message: "Invalid or missing token.",
      });
    }
  }, [location.search, methods]);

  // Redirect to login page after successful registration
  useEffect(() => {
    if (registerStatus === "succeeded") {
      setTimeout(() => {
        navigate("/login");
        dispatch(resetStatus()); // Clear status after redirection
      }, 3000);
    }
  }, [registerStatus, navigate, dispatch]);

  const onSubmit: SubmitHandler<RegisterFormInputs> = (data) => {
    if (data.password !== data.confirmPassword) {
      methods.setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match.",
      });
      return;
    }

    if (token && email) {
      dispatch(
        register({
          email,
          username: data.username,
          password: data.password,
          token,
        })
      );
    }
  };

  // Form Fields Definition
  const fields: Field<RegisterFormInputs>[] = [
    {
      name: "email",
      label: "Email Address",
      type: "input",
      disabled: true,
      validation: { required: "Email is required" },
    },
    {
      name: "username",
      label: "Username",
      type: "input",
      validation: {
        required: "Username is required",
        pattern: {
          value: /^[a-zA-Z0-9]{4,}$/,
          message:
            "Username must be at least 4 characters long and contain only letters and numbers.",
        },
      },
    },
    {
      name: "password",
      label: "Password",
      type: "input",
      inputType: "password",
      validation: {
        required: "Password is required",
        pattern: {
          value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          message:
            "Password must be at least 8 characters long, contain at least one letter, one number, and one special character.",
        },
      },
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "input",
      inputType: "password",
      validation: {
        required: "Confirm your password",
        pattern: {
          value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          message:
            "Password must be at least 8 characters long, contain at least one letter, one number, and one special character.",
        },
      },
    },
  ];

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Employee Registration
      </h2>
      {email && <p className="text-center mb-4">Hello, {email}</p>}
      {registerStatus === "succeeded" && (
        <div className="mb-4 text-green-600 text-center">
          Registration successful! Redirecting to login page...
        </div>
      )}
      {registerStatus === "failed" && error && (
        <div className="mb-4 text-red-600 text-center">
          {typeof error === "string" ? error : JSON.stringify(error)}
        </div>
      )}
      {token && email ? (
        <PrototypeForm
          fields={fields}
          onSubmit={onSubmit}
          methods={methods}
          submitButtonLabel={
            registerStatus === "loading" ? "Registering..." : "Register"
          }
        />
      ) : (
        <div className="text-center text-red-600">
          Invalid or missing token.
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
