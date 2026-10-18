import { Form } from "antd";
import { FieldConfig } from "@/types/formField.types";
import { Control, Controller, FieldValues } from "react-hook-form";

export interface HiddenFieldProps extends Partial<FieldConfig> {
  id: string;
  name?: string;
  onChange?: (val: any) => void;
  className?: string;
  control: Control<FieldValues, any, FieldValues>;
}

export default function HiddenField(props: HiddenFieldProps) {
  const { placeholder: _placeholder, disabled: _disabled, options: _options, onChange, value: _value, className: _className, id, name, control } = props;

  return (
    <Controller
      name={(name || "") + id}
      control={control}
      render={({ field, fieldState }) => {
        const _handleChange = (val: any) => {
          field.onChange(val);
          onChange?.(val);
        };

        return (
          <Form.Item
            validateStatus={fieldState.error ? "error" : ""}
            help={fieldState.error?.message}
            className="mb-0"
          >
            <input type="hidden" {...field} />
          </Form.Item>
        );
      }}
    />
  );
}
