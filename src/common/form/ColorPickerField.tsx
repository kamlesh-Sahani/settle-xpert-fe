import { Form, ColorPicker } from "antd";
import { FieldConfig } from "@/types/formField.types";
import classNames from "classnames";
import { Control, Controller, FieldValues } from "react-hook-form";


export interface ColorPickerFieldProps extends Partial<FieldConfig> {
  id: string;
  name?: string;
  onChange?: (val: any) => void;
  className?: string;
  control: Control<FieldValues, any, FieldValues>;
}

export default function ColorPickerField(props: ColorPickerFieldProps) {
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
          field.onChange(val.toHexString()); onChange?.(val.toHexString());
        };

        return (
          <Form.Item
            validateStatus={fieldState.error ? "error" : ""}
            help={fieldState.error?.message}
            className="mb-0 "
          >
            <ColorPicker
              className={classNames("w-full hover:border-primary-400 transition-all justify-start", className)}
              disabled={disabled}
              size="middle"
              {...field}
              onChange={handleChange}
              showText
              {...rest}
            />
          </Form.Item>
        );
      }}
    />
  );
}
