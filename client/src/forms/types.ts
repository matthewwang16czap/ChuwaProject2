// types.ts

export type FieldOption = {
  value: string | number;
  label: string;
};

export type FieldType = {
  name: string;
  label: string;
  type: 'input' | 'select' | 'radio' | 'date' | 'upload';
  required?: boolean;
  options?: FieldOption[]; // Used for select and radio types
  validation?: {
    required?: string;
    pattern?: {
      value: RegExp;
      message: string;
    };
    minLength?: {
      value: number;
      message: string;
    };
    maxLength?: {
      value: number;
      message: string;
    };
  };
};
