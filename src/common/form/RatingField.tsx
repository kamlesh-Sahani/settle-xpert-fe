import { Form, Rate } from "antd";
import { FieldConfig } from "@/types/formField.types";
import classNames from "classnames";
import { Control, Controller, FieldValues } from "react-hook-form";


export interface RatingFieldProps extends Partial<FieldConfig> {
  id: string;
  name?: string;
  onChange?: (val: any) => void;
  className?: string;
  control: Control<FieldValues, any, FieldValues>;
}

export default function RatingField(props: RatingFieldProps) {
  const { placeholder: _placeholder, disabled, options, onChange, value: _value, className, id, name, control, ...rest } = props;

  const _formattedOptions = options?.map((opt) => ({
    label: (opt as any).label || (opt as any).key || opt.value,
    value: opt.value,
  }));

  return (
    <Controller
      name={(name || "") + id}
      control={control}
      render={({ field, fieldState }) => {
        const handleChange = (val: any) => {
          field.onChange(val); onChange?.(val);
        };

        return (
          <Form.Item
            validateStatus={fieldState.error ? "error" : ""}
            help={fieldState.error?.message}
            className="mb-0"
          >
            <Rate
              className={classNames("w-full hover:border-primary-400 transition-all", className)}
              disabled={disabled}
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
