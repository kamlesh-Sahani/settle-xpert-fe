import { Form, Input } from "antd";
import { FieldConfig } from "@/types/formField.types";
import classNames from "classnames";
import { Control, Controller, FieldValues } from "react-hook-form";


export interface TextAreaFieldProps extends Partial<FieldConfig> {
  id: string;
  name?: string;
  onChange?: (val: any) => void;
  className?: string;
  control: Control<FieldValues, any, FieldValues>;
  rows?: number;
}

export default function TextAreaField(props: TextAreaFieldProps) {
  const { placeholder, disabled, options, onChange, value: _value, className, id, name, control, ...rest } = props;

  const _formattedOptions = options?.map((opt) => ({
    label: (opt as any).label || (opt as any).key || opt.value,
    value: opt.value,
  }));

  return (
    <Controller
      name={name || id}
      control={control}
      render={({ field, fieldState }) => {
        const handleChange = (val: any) => {
          
          const newValue = val?.target ? val.target.value : val;
          field.onChange(newValue);
          onChange?.(newValue);
          
        };

        return (
          <Form.Item
            validateStatus={fieldState.error ? "error" : ""}
            help={fieldState.error?.message}
            className="mb-0"
          >
            <Input.TextArea
              className={classNames("w-full hover:primary-blue-400 transition-all", className)}
              placeholder={placeholder}
              disabled={disabled}
              size="middle"
              {...field}
              onChange={handleChange}
              rows={4}
              {...rest}
            />
          </Form.Item>
        );
      }}
    />
  );
}
