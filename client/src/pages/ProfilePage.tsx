// src/pages/ProfilePage.tsx

import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { RootState } from "../app/store"; // Adjust the path as needed
import PrototypeForm, { Field } from "../forms/PrototypeForm"; // Adjust the path as needed

interface UserProfile {
  email: string;
  userId: string;
  role: string;
  // Add other fields as needed
}

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);

  const methods = useForm<UserProfile>({
    defaultValues: {
      email: user?.email || "",
      userId: user?.userId || "",
      role: user?.role || "",
      // Add other fields as needed
    },
  });

  useEffect(() => {
    methods.reset({
      email: user?.email || "",
      userId: user?.userId || "",
      role: user?.role || "",
      // Add other fields as needed
    });
  }, [user, methods]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const fields: Field<UserProfile>[] = [
    {
      name: "email",
      label: "Email",
      type: "input",
      disabled: true,
    },
    {
      name: "userId",
      label: "User ID",
      type: "input",
      disabled: true,
    },
    {
      name: "role",
      label: "Role",
      type: "input",
      disabled: true,
    },
    // Add other fields as needed
  ];

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Profile</h2>
      <PrototypeForm
        fields={fields}
        onSubmit={() => {}}
        methods={methods}
        showSubmitButton={false}
      />
    </div>
  );
};

export default ProfilePage;
