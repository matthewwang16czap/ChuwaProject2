import { Controller, UseFormReturn, FieldValues, Path } from "react-hook-form";
import { Form, Input, Select, Radio, DatePicker, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { UploadFile, UploadFileStatus } from "antd/lib/upload/interface"; // Import UploadFile and UploadFileStatus
import dayjs from "dayjs";

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
  methods: UseFormReturn<T>;
  submitButtonLabel?: string;
}

// Define the PrototypeForm component
const PrototypeForm = <T extends FieldValues>({
  fields,
  onSubmit,
  methods,
  submitButtonLabel = "Submit",
}: PrototypeFormProps<T>): JSX.Element => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit(onSubmit)}
      style={{ width: "100%" }}
    >
      {fields.map((field) => {
        const error = errors ? errors[field.name] : null;
        switch (field.type) {
          case "input":
            return (
              <Form.Item
                key={field.name}
                label={field.label}
                validateStatus={error ? "error" : ""}
                help={
                  typeof error?.message === "string" ? error.message : undefined
                }
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
          case "select":
            return (
              <Form.Item
                key={field.name}
                label={field.label}
                validateStatus={error ? "error" : ""}
                help={
                  typeof error?.message === "string" ? error.message : undefined
                }
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
          case "radio":
            return (
              <Form.Item
                key={field.name}
                label={field.label}
                validateStatus={error ? "error" : ""}
                help={
                  typeof error?.message === "string" ? error.message : undefined
                }
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
          case "date":
            return (
              <Form.Item
                key={field.name}
                label={field.label}
                validateStatus={error ? "error" : ""}
                help={
                  typeof error?.message === "string" ? error.message : undefined
                }
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: { onChange, onBlur, value } }) => {
                    const dateValue = value ? dayjs(value) : null;
                    return (
                      <DatePicker
                        onChange={(date, dateString) => onChange(dateString)}
                        onBlur={onBlur}
                        value={dateValue}
                        disabled={field.disabled}
                        format="YYYY-MM-DD"
                        style={{ width: "100%" }}
                      />
                    );
                  }}
                />
              </Form.Item>
            );
          case "upload":
            return (
              <Form.Item
                key={field.name}
                label={field.label}
                validateStatus={error ? "error" : ""}
                help={
                  typeof error?.message === "string" ? error.message : undefined
                }
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: { onChange, value } }) => {
                    const fileList: UploadFile[] = value
                      ? [
                          {
                            uid: "-1",
                            name: value.name || "Uploaded File",
                            status: "done" as UploadFileStatus, // Cast status to UploadFileStatus
                            url: value.url || "",
                          },
                        ]
                      : [];
                    return (
                      <Upload
                        fileList={fileList}
                        disabled={field.disabled}
                        beforeUpload={(file) => {
                          onChange(file); // Assign the uploaded file to the form field
                          return false; // Prevent the actual upload
                        }}
                        onRemove={() => onChange(null)} // Remove the file from the form
                      >
                        <Button icon={<UploadOutlined />}>
                          Click to Upload
                        </Button>
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
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {submitButtonLabel}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PrototypeForm;
