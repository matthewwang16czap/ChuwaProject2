// PrototypeForm.tsx
import React from 'react';
import { useFormContext, FormProvider } from 'react-hook-form';

interface Field {
  name: string;
  label: string;
  type: string;
  options?: { label: string; value: string }[];
  validation?: any;
  disabled?: boolean;
}

interface PrototypeFormProps {
  fields: Field[];
  onSubmit?: (data: any) => void;
  methods?: any;
  submitButtonLabel?: string;
}

const PrototypeForm: React.FC<PrototypeFormProps> = ({
  fields,
  onSubmit,
  methods,
  submitButtonLabel = 'Submit',
}) => {
  const formMethods = methods || useFormContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = formMethods;

  const getNestedError = (errorObj: any, fieldName: string) => {
    if (!fieldName || typeof fieldName !== 'string') {
      return undefined;
    }
    return fieldName
      .split('.')
      .reduce((obj, key) => (obj ? obj[key] : undefined), errorObj);
  };

  const content = (
    <form onSubmit={onSubmit ? handleSubmit(onSubmit) : undefined}>
      {fields.map((field) => {
        const error = getNestedError(errors, field.name);
        switch (field.type) {
          case 'input':
            return (
              <div key={field.name}>
                <label>{field.label}</label>
                <input
                  {...register(field.name, field.validation)}
                  disabled={field.disabled}
                />
                {error && <p>{error.message}</p>}
              </div>
            );
          case 'select':
            return (
              <div key={field.name}>
                <label>{field.label}</label>
                <select
                  {...register(field.name, field.validation)}
                  disabled={field.disabled}
                >
                  <option value="">Select...</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {error && <p>{error.message}</p>}
              </div>
            );
          case 'radio':
            return (
              <div key={field.name}>
                <label>{field.label}</label>
                {field.options?.map((option) => (
                  <label key={option.value}>
                    <input
                      type="radio"
                      value={option.value}
                      {...register(field.name, field.validation)}
                      disabled={field.disabled}
                    />
                    {option.label}
                  </label>
                ))}
                {error && <p>{error.message}</p>}
              </div>
            );
          case 'date':
            return (
              <div key={field.name}>
                <label>{field.label}</label>
                <input
                  type="date"
                  {...register(field.name, field.validation)}
                  disabled={field.disabled}
                />
                {error && <p>{error.message}</p>}
              </div>
            );
          case 'upload':
            return (
              <div key={field.name}>
                <label>{field.label}</label>
                <input
                  type="file"
                  {...register(field.name, field.validation)}
                  disabled={field.disabled}
                />
                {error && <p>{error.message}</p>}
              </div>
            );
          default:
            return null;
        }
      })}
      {onSubmit && <button type="submit">{submitButtonLabel}</button>}
    </form>
  );

  // If methods are provided, wrap the form with FormProvider
  if (methods) {
    return <FormProvider {...methods}>{content}</FormProvider>;
  }

  return content;
};

export default PrototypeForm;
