import { Form, TimePicker } from "antd";
import { FieldConfig } from "@/types/formField.types";
import classNames from "classnames";
import { Control, Controller, FieldValues } from "react-hook-form";
import { isArray } from "@/common/utils";

export interface TimeRangeFieldProps extends Omit<Partial<FieldConfig>, "placeholder"> {
  id: string;
  name?: string;
  placeholder?: string | [string, string];
  onChange?: (val: any) => void;
  className?: string;
  control: Control<FieldValues, any, FieldValues>;
  format?: string;
}

export default function TimeRangeField(props: TimeRangeFieldProps) {
  const { placeholder, disabled, onChange, className, id, name, control, format = "HH:mm", ...rest } = props;

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
              placeholder={isArray(placeholder) ? placeholder : ["Start Time", "End Time"]}
              disabled={disabled}
              size="middle"
              format={format}
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
