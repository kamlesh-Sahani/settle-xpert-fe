import { Form, TimePicker } from "antd";
import { FieldConfig } from "@/types/formField.types";
import classNames from "classnames";
import { Control, Controller, FieldValues } from "react-hook-form";
import { isArray } from "@/common/utils/main.utils";

export interface TimeRangeFieldProps extends Partial<FieldConfig> {
  id: string;
  name?: string;
  onChange?: (val: any) => void;
  className?: string;
  control: Control<FieldValues, any, FieldValues>;
}

export default function TimeRangeField(props: TimeRangeFieldProps) {
  const { placeholder, disabled, options: _options, onChange, value: _value, className, id, name, control, ...rest } = props;

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
            <TimePicker.RangePicker
              className={classNames("w-full hover:border-primary-400 transition-all", className)}
              placeholder={(isArray(placeholder) ? placeholder : [placeholder || 'Start', placeholder || 'End']) as [string, string]}
              disabled={disabled}
              size="middle"

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
