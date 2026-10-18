// types/form.types.ts

export type FieldType =
  | "text"
  | "email"
  | "number"
  | "phone"
  | "url"
  | "textarea"
  | "select"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "toggle"
  | "date"
  | "time"
  | "datetime"
  | "file"
  | "image"
  | "rating"
  | "slider"
  | "color"
  | "heading"
  | "paragraph"
  | "divider";

export type FieldCategory = "basic" | "advanced" | "layout" | "media";

export interface FieldOption {
  label: string;
  value: string;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customMessage?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
}

export interface FieldConfig {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string | number | boolean;
  options?: FieldOption[];
  validation: ValidationRule;
  width?: "full" | "half" | "third";
  hidden?: boolean;
  disabled?: boolean;
  // Conditional logic
  conditions?: {
    field: string;
    operator: "equals" | "not_equals" | "contains" | "gt" | "lt";
    value: string;
  }[];
}

export interface FormSchema {
  fields: Record<string, FieldConfig>;
  order: string[];
  selectedFieldId: string | null;
}

// Library field definition (what's shown in the sidebar)
export interface LibraryField {
  type: FieldType;
  label: string;
  category: FieldCategory;
  description: string;
}
