import { Form, Input } from "antd";
import { FieldConfig } from "@/types/formField.types";
import classNames from "classnames";
import { Control, Controller, FieldValues } from "react-hook-form";


export interface PasswordFieldProps extends Partial<FieldConfig> {
  id: string;
  name?: string;
  autoComplete?: string;
  onChange?: (val: any) => void;
  className?: string;
  control: Control<FieldValues, any, FieldValues>;
}

export default function PasswordField(props: PasswordFieldProps) {
  const { placeholder, disabled, options, onChange, value: _value, className, id, name, control, autoComplete, ...rest } = props;

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
            <Input.Password
              className={classNames("w-full hover:border-primary-400 transition-all", className)}
              placeholder={placeholder}
              disabled={disabled}
              size="middle"
              autoComplete={autoComplete || "new-password"}
              {...field}
              onChange={handleChange}
              {...rest}
            />
          </Form.Item>
        );
      }}
    />
  );
}
