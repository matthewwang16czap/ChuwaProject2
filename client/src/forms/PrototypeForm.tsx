import { Controller, UseFormReturn, FieldValues, Path } from "react-hook-form";
import { Form, Input, Upload, Button, Radio, Select, DatePicker } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { UploadFile, UploadFileStatus } from "antd/lib/upload/interface";
import { useDispatch } from "react-redux"; // Import useDispatch
import { AppDispatch } from "../app/store";
import { uploadFileThunk } from "../features/application/applicationSlice"; // Adjust import as needed
import { get } from "lodash";
import axiosInstance from "../api/axiosInstance";
import moment from "moment";


// Define the Field interface
export interface Field<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type: "input" | "select" | "radio" | "date" | "upload";
  inputType?: string;
  options?: { label: string; value: string }[];
  validation?: Record<string, unknown>;
  disabled?: boolean;
  filename?: string;
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
        const isRequired = field.validation?.required ? true : false; // Check if the field is required

        switch (field.type) {
          case "input":
            return (
              <Form.Item
                key={field.name}
                label={
                  <>
                    {field.label}{" "}
                    {isRequired && <span style={{ color: "red" }}>*</span>}
                  </>
                }
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
          // Other cases...
          case "date":
            return (
              <Form.Item
                key={field.name}
                label={
                  <>
                    {field.label}{" "}
                    {isRequired && <span style={{ color: "red" }}>*</span>}
                  </>
                }
                validateStatus={error ? "error" : ""}
                help={error?.message?.toString()}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <DatePicker
                      onChange={(date, dateString) => onChange(dateString)}
                      onBlur={onBlur}
                      value={value ? moment(value) : null}
                      disabled={field.disabled}
                      placeholder={field.label}
                    />
                  )}
                />
              </Form.Item>
            );

          case "radio":
            return (
              <Form.Item
                key={field.name}
                label={
                  <>
                    {field.label}{" "}
                    {isRequired && <span style={{ color: "red" }}>*</span>}
                  </>
                }
                validateStatus={error ? "error" : ""}
                help={error?.message?.toString()}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: { onChange, value } }) => (
                    <Radio.Group
                      onChange={onChange}
                      value={value}
                      disabled={field.disabled}
                    >
                      {field.options?.map((option) => (
                        <Radio key={option.value} value={option.value}>
                          {option.label}
                        </Radio>
                      ))}
                    </Radio.Group>
                  )}
                />
              </Form.Item>
            );

          case "select":
            return (
              <Form.Item
                key={field.name}
                label={
                  <>
                    {field.label}{" "}
                    {isRequired && <span style={{ color: "red" }}>*</span>}
                  </>
                }
                validateStatus={error ? "error" : ""}
                help={error?.message?.toString()}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      onChange={onChange}
                      value={value}
                      disabled={field.disabled}
                      placeholder={field.label}
                    >
                      {field.options?.map((option) => (
                        <Select.Option key={option.value} value={option.value}>
                          {option.label}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                />
              </Form.Item>
            );
          case "upload":
            return (
              <Form.Item
                key={field.name}
                label={
                  <>
                    {field.label}{" "}
                    {isRequired && <span style={{ color: "red" }}>*</span>}
                  </>
                }
                validateStatus={error ? "error" : ""}
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
                            uid: "-1",
                            name: "Uploaded File", // You can adjust this to display any name you want
                            status: "done" as UploadFileStatus,
                            url: value, // Assuming `value` is the URL returned from the backend
                          },
                        ]
                      : [];

                    const handleBeforeUpload = (file: File) => {
                      const newFile = new File(
                        [file],
                        field.filename || file.name,
                        {
                          type: file.type,
                        }
                      );

                      // This assumes your backend returns only the URL; you can handle the dispatch separately
                      dispatch(uploadFileThunk({ file: newFile }))
                        .unwrap()
                        .then((response) => {
                          // Assume the response contains the URL from the backend
                          const fileUrl = response.filePath;
                          onChange(fileUrl); // Update form state with the URL
                        });

                      return false; // Prevent default upload behavior
                    };

                    const handleFileClick = async (fileUrl: string) => {
                      try {
                        const response = await axiosInstance.get(
                          `/${fileUrl}`,
                          {
                            responseType: "blob", // or display pdf directly depending on the type
                          }
                        );

                        // Handle file response (e.g., download the file or open it)
                        const blob = new Blob([response.data], {
                          type: response.headers["content-type"],
                        });
                        const downloadUrl = URL.createObjectURL(blob);
                        window.open(downloadUrl); // Opens the file in a new tab

                        // Optionally, handle the file to be downloaded directly:
                        // const link = document.createElement('a');
                        // link.href = downloadUrl;
                        // link.download = file.name;
                        // link.click();
                      } catch (error) {
                        console.error("Error downloading the file:", error);
                      }
                    };

                    return (
                      <>
                        <Upload
                          fileList={fileList}
                          disabled={field.disabled}
                          beforeUpload={handleBeforeUpload}
                          onRemove={() => onChange(null)} // Clear the state when the file is removed
                          onPreview={(file) => handleFileClick(file.url || "")}
                        >
                          <Button icon={<UploadOutlined />}>
                            Click to Upload
                          </Button>
                        </Upload>
                      </>
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
