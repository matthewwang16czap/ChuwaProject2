import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Form as AntForm, Input, Button, Select, Radio, DatePicker, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { FieldType } from './types';

const { Option } = Select;

type FormProps = {
  fields: FieldType[];
  onSubmit: SubmitHandler<any>;
};

const Form: React.FC<FormProps> = ({ fields, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <AntForm onFinish={handleSubmit(onSubmit)} layout="vertical">
      {fields.map((field) => {
        switch (field.type) {
          case 'input':
            return (
              <AntForm.Item
                key={field.name}
                label={field.label}
                validateStatus={errors[field.name] ? 'error' : ''}
                help={errors[field.name]?.message}
                required={field.required}
              >
                <Input {...register(field.name, field.validation)} />
              </AntForm.Item>
            );
          case 'select':
            return (
              <AntForm.Item
                key={field.name}
                label={field.label}
                validateStatus={errors[field.name] ? 'error' : ''}
                help={errors[field.name]?.message}
                required={field.required}
              >
                <Select {...register(field.name, field.validation)}>
                  {field.options?.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </AntForm.Item>
            );
          case 'radio':
            return (
              <AntForm.Item
                key={field.name}
                label={field.label}
                validateStatus={errors[field.name] ? 'error' : ''}
                help={errors[field.name]?.message}
                required={field.required}
              >
                <Radio.Group {...register(field.name, field.validation)}>
                  {field.options?.map(option => (
                    <Radio key={option.value} value={option.value}>
                      {option.label}
                    </Radio>
                  ))}
                </Radio.Group>
              </AntForm.Item>
            );
          case 'date':
            return (
              <AntForm.Item
                key={field.name}
                label={field.label}
                validateStatus={errors[field.name] ? 'error' : ''}
                help={errors[field.name]?.message}
                required={field.required}
              >
                <DatePicker {...register(field.name, field.validation)} />
              </AntForm.Item>
            );
          case 'upload':
            return (
              <AntForm.Item key={field.name} label={field.label} required={field.required}>
                <Upload>
                  <Button icon={<UploadOutlined />}>{field.label}</Button>
                </Upload>
              </AntForm.Item>
            );
          default:
            return null;
        }
      })}

      <AntForm.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </AntForm.Item>
    </AntForm>
  );
};

export default Form;
