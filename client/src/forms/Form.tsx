import React from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { Input, Button, Select, Radio, DatePicker, Upload, Form as AntdForm } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { FieldType } from './types';

const { Option } = Select;

type FormProps = {
  fields: FieldType[];
  onSubmit: SubmitHandler<any>;
};

const Form: React.FC<FormProps> = ({ fields, onSubmit }) => {
  const { control, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
      {fields.map((field) => {
        switch (field.type) {
          case 'input':
            return (
              <div key={field.name} style={{ marginBottom: '16px' }}>
                <label>{field.label}</label>
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field }) => <Input {...field} />}
                />
                {errors[field.name] && <p style={{ color: 'red' }}>{errors[field.name]?.message}</p>}
              </div>
            );
          case 'select':
            return (
              <div key={field.name} style={{ marginBottom: '16px' }}>
                <label>{field.label}</label>
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field }) => (
                    <Select {...field}>
                      {field.options?.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  )}
                />
                {errors[field.name] && <p style={{ color: 'red' }}>{errors[field.name]?.message}</p>}
              </div>
            );
          case 'radio':
            return (
              <div key={field.name} style={{ marginBottom: '16px' }}>
                <label>{field.label}</label>
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field }) => (
                    <Radio.Group {...field}>
                      {field.options?.map((option) => (
                        <Radio key={option.value} value={option.value}>
                          {option.label}
                        </Radio>
                      ))}
                    </Radio.Group>
                  )}
                />
                {errors[field.name] && <p style={{ color: 'red' }}>{errors[field.name]?.message}</p>}
              </div>
            );
          case 'date':
            return (
              <div key={field.name} style={{ marginBottom: '16px' }}>
                <label>{field.label}</label>
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field }) => <DatePicker {...field} />}
                />
                {errors[field.name] && <p style={{ color: 'red' }}>{errors[field.name]?.message}</p>}
              </div>
            );
          case 'upload':
            return (
              <div key={field.name} style={{ marginBottom: '16px' }}>
                <label>{field.label}</label>
                <Upload>
                  <Button icon={<UploadOutlined />}>{field.label}</Button>
                </Upload>
              </div>
            );
          default:
            return null;
        }
      })}

      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </form>
  );
};

export default Form;
