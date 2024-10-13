// PrototypeForm.tsx

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import {
  Form,
  Input,
  Select,
  Radio,
  DatePicker,
  Upload,
  Button,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs'; // or import moment from 'moment';

interface Field {
  name: string;
  label: string;
  type: string;
  inputType?: string;
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
    control,
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

  return (
    <Form
      layout="vertical"
      onFinish={onSubmit ? handleSubmit(onSubmit) : undefined}
      style={{ width: '100%' }}
    >
      {fields.map((field) => {
        const error = getNestedError(errors, field.name);

        switch (field.type) {
          case 'input':
            return (
              <Form.Item
                key={field.name}
                label={field.label}
                validateStatus={error ? 'error' : ''}
                help={error ? error.message : null}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: { onChange, onBlur, value } }) => {
                    if (field.inputType === 'password') {
                      return (
                        <Input.Password
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          disabled={field.disabled}
                          placeholder={field.label}
                        />
                      );
                    } else {
                      return (
                        <Input
                          type={field.inputType || 'text'}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          disabled={field.disabled}
                          placeholder={field.label}
                        />
                      );
                    }
                  }}
                />
              </Form.Item>
            );

          case 'select':
            return (
              <Form.Item
                key={field.name}
                label={field.label}
                validateStatus={error ? 'error' : ''}
                help={error ? error.message : null}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Select
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      disabled={field.disabled}
                      placeholder={field.label}
                      options={field.options}
                      allowClear
                    />
                  )}
                />
              </Form.Item>
            );

          case 'radio':
            return (
              <Form.Item
                key={field.name}
                label={field.label}
                validateStatus={error ? 'error' : ''}
                help={error ? error.message : null}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Radio.Group
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      disabled={field.disabled}
                      options={field.options}
                    />
                  )}
                />
              </Form.Item>
            );

          case 'date':
            return (
              <Form.Item
                key={field.name}
                label={field.label}
                validateStatus={error ? 'error' : ''}
                help={error ? error.message : null}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: { onChange, onBlur, value } }) => {
                    const dateValue = value ? dayjs(value) : null;
                    return (
                      <DatePicker
                        onChange={(date, dateString) => {
                          onChange(dateString);
                        }}
                        onBlur={onBlur}
                        value={dateValue}
                        disabled={field.disabled}
                        format="YYYY-MM-DD"
                        style={{ width: '100%' }}
                      />
                    );
                  }}
                />
              </Form.Item>
            );

          case 'upload':
            return (
              <Form.Item
                key={field.name}
                label={field.label}
                validateStatus={error ? 'error' : ''}
                help={error ? error.message : null}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: { onChange, value } }) => {
                    const fileList = value
                      ? [
                          {
                            uid: '-1',
                            name: value.name || 'Uploaded File',
                            status: 'done',
                            url: value.url || '',
                          },
                        ]
                      : [];
                    return (
                      <Upload
                        fileList={fileList}
                        disabled={field.disabled}
                        beforeUpload={(file) => {
                          onChange(file);
                          return false;
                        }}
                        onRemove={() => {
                          onChange(null);
                        }}
                      >
                        <Button icon={<UploadOutlined />}>Click to Upload</Button>
                      </Upload>
                    );
                  }}
                />
              </Form.Item>
            );

          default:
            return null;
        }
      })}
      {onSubmit && (
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {submitButtonLabel}
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};

export default PrototypeForm;
