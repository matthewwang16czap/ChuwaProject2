// LoginPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import PrototypeForm, { Field } from '../forms/PrototypeForm';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/user/userSlice';
import { RootState, AppDispatch } from '../app/store';

interface LoginFormInputs {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const { loginStatus, error } = useSelector((state: RootState) => state.user);

  const methods = useForm<LoginFormInputs>();
  const onSubmit: SubmitHandler<LoginFormInputs> = (data) => {
    dispatch(login(data));
  };

  // Redirect to Personal Information page after successful login
  useEffect(() => {
    if (loginStatus === 'succeeded') {
      navigate('/personal-info');
    }
  }, [loginStatus, navigate]);

  const fields: Field<LoginFormInputs>[] = [
    {
      name: 'username',
      label: 'Username',
      type: 'input',
      validation: { required: 'Username is required' },
    },
    {
      name: 'password',
      label: 'Password',
      type: 'input',
      inputType: 'password',
      validation: { required: 'Password is required' },
    },
  ];

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      {error && (
        <div className="mb-4 text-red-600 text-center">
          {error}
        </div>
      )}
      <PrototypeForm
        fields={fields}
        onSubmit={onSubmit}
        methods={methods}
        submitButtonLabel={loginStatus === 'loading' ? 'Logging in...' : 'Login'}
      />
    </div>
  );
};

export default LoginPage;
