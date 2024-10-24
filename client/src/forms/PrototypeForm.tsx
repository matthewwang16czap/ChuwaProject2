import { Controller, UseFormReturn, FieldValues, Path } from "react-hook-form";
import { Form, Input, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { UploadFile, UploadFileStatus } from "antd/lib/upload/interface";
import { useDispatch } from 'react-redux'; // Import useDispatch
import { AppDispatch } from '../app/store';
import { uploadFileThunk } from '../features/application/applicationSlice'; // Adjust import as needed
import { get } from 'lodash';

// Define the Field interface
export interface Field<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type: "input" | "select" | "radio" | "date" | "upload";
  inputType?: string;
  options?: { label: string; value: string }[];
  validation?: Record<string, unknown>;
  disabled?: boolean;
}

// Define the PrototypeFormProps interface
interface PrototypeFormProps<T extends FieldValues> {
  fields: Field<T>[];
  onSubmit: (data: T) => void;
  onError?: (errors: unknown) => void; // Add onError prop
  methods: UseFormReturn<T>;
  submitButtonLabel?: string;
  showSubmitButton?: boolean;
}

// Define the PrototypeForm component
const PrototypeForm = <T extends FieldValues>({
  fields,
  onSubmit,
  onError,
  methods,
  submitButtonLabel = "Submit",
  showSubmitButton = true,
}: PrototypeFormProps<T>): JSX.Element => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  const dispatch = useDispatch<AppDispatch>(); // Initialize dispatch

  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit(onSubmit, onError)} // Use handleSubmit with onError
      style={{ width: "100%" }}
    >
      {fields.map((field) => {
        const error = get(errors, field.name); // Use get to access nested errors
        switch (field.type) {
          case "input":
            return (
              <Form.Item
                key={field.name}
                label={field.label}
                validateStatus={error ? "error" : ""}
                help={error?.message?.toString()}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      type={field.inputType || "text"}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      disabled={field.disabled}
                      placeholder={field.label}
                    />
                  )}
                />
              </Form.Item>
            );
          // ... other field types ...
          case "upload":
            return (
              <Form.Item
                key={field.name}
                label={field.label}
                validateStatus={error ? 'error' : ''}
                help={error?.message?.toString()}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: { onChange, value } }) => {
                    const fileList: UploadFile[] = value
                      ? [
                          {
                            uid: '-1',
                            name: value.name || 'Uploaded File',
                            status: 'done' as UploadFileStatus,
                            url: value.url || '',
                          },
                        ]
                      : [];
                    return (
                      <Upload
                        fileList={fileList}
                        disabled={field.disabled}
                        beforeUpload={(file) => {
                          onChange(file); // Update form state
                          dispatch(uploadFileThunk({ file })); // Dispatch the thunk
                          return false; // Prevent default upload behavior
                        }}
                        onRemove={() => onChange(null)}
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
      {showSubmitButton && (
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
