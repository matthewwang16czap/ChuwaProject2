// src/pages/SendInvitationPage.tsx

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { sendInvitation, resetStatus } from '../features/registration/registrationSlice'; // Adjust the path as needed
import { RootState } from '../app/store'; // Adjust the path as needed
import PrototypeForm from '../forms/PrototypeForm'; // Adjust the path as needed

const SendInvitationPage: React.FC = () => {
  const dispatch = useDispatch();
  const { invitationStatus, error } = useSelector((state: RootState) => state.registration);

  const methods = useForm();

  const loading = invitationStatus === 'loading';

  const onSubmit = (data: any) => {
    dispatch(resetStatus()); // Reset any previous status or error
    dispatch(sendInvitation({ email: data.email }));
  };

  useEffect(() => {
    if (invitationStatus === 'succeeded') {
      methods.reset(); // Clear the form fields
    }
  }, [invitationStatus, methods]);

  const fields = [
    {
      name: 'email',
      label: 'Email Address',
      type: 'input',
      inputType: 'email',
      validation: {
        required: 'Email is required',
        pattern: {
          value: /^\S+@\S+\.\S+$/,
          message: 'Invalid email address',
        },
      },
    },
  ];

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Send Invitation</h2>
      {invitationStatus === 'succeeded' && (
        <div className="mb-4 text-green-600 text-center">
          Invitation sent successfully!
        </div>
      )}
      {invitationStatus === 'failed' && error && (
        <div className="mb-4 text-red-600 text-center">
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      )}
      <PrototypeForm
        fields={fields}
        onSubmit={onSubmit}
        methods={methods}
        submitButtonLabel={loading ? 'Sending...' : 'Send Invitation'}
      />
    </div>
  );
};

export default SendInvitationPage;
