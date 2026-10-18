import { Form, Cascader } from "antd";
import { FieldConfig } from "@/types/formField.types";
import classNames from "classnames";
import { Control, Controller, FieldValues } from "react-hook-form";

export interface CascaderFieldProps extends Partial<FieldConfig> {
  id: string;
  name?: string;
  onChange?: (val: any) => void;
  className?: string;
  control: Control<FieldValues, any, FieldValues>;
}

export default function CascaderField(props: CascaderFieldProps) {
  const { placeholder, disabled, options, onChange, value: _value, className, id, name, control, ...rest } = props;

  return (
    <Controller
      name={(name || "") + id}
      control={control}
      render={({ field, fieldState }) => {
        const handleChange = (val: any) => {
          field.onChange(val);
          onChange?.(val);
        };

        return (
          <Form.Item
            validateStatus={fieldState.error ? "error" : ""}
            help={fieldState.error?.message}
            className="mb-0"
          >
            <Cascader
              className={classNames("w-full hover:border-primary-400 transition-all", className)}
              placeholder={placeholder}
              disabled={disabled}
              size="middle"
              options={options as any}
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
