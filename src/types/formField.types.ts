export type FieldType =
  | "text"
  | "email"
  | "number"
  | "phone"
  | "url"
  | "textarea"
  | "select"
  | "country"
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
  | "divider"
  | "chart";

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

export interface FieldOption {
  key: string;
  value: string;
}

export type ChartType = "line" | "bar" | "radar" | "doughnut" | "pie" | "polarArea" | "bubble" | "scatter";

export interface ChartDatasetConfig {
  label: string;
  dataKey: string;
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  type?: "line" | "bar";
  tension?: number;
  [key: string]: any;
}

export interface ChartConfig {
  type: ChartType;
  data?: any[];
  labelsKey?: string;
  datasets: ChartDatasetConfig[];
  height?: number | string;
  width?: number | string;
  options?: any;
}

export interface UploadConfig {
  /** Primary text in the dropzone (default: "Click or drag file here") */
  title?: string;
  /** Secondary hint text (e.g. "PNG, JPG | Max 5 MB") */
  subtitle?: string;
  /** Button label (default: "Choose File") */
  buttonText?: string;
  /** Ant Button type variant */
  buttonType?: "primary" | "default" | "dashed" | "link" | "text";
  /** Custom button background colour (CSS value) */
  buttonColor?: string;
  /** Tooltip shown beside the title (ⓘ icon) */
  infoTooltip?: string;
}

export interface FieldConfig {
  id: string;
  name?: string;
  tooltip?: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  helpText?: string;
  value?: any;
  defaultValue?: any;
  options?: FieldOption[];
  validation?: ValidationRule;
  color?: string;
  fontSize?: string;
  fontWeight?: number;
  span?: number;
  offset?: number;
  disabled?: boolean;
  conditions?: {
    field: string;
    operator: "equals" | "not_equals" | "contains" | "gt" | "lt";
    value: any;
  }[];
  chartConfig?: ChartConfig;
  uploadConfig?: UploadConfig;
}
