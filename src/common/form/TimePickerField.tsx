import React from "react";
import { Form, TimePicker } from "antd";
import { FieldConfig } from "@/types/formField.types";
import classNames from "classnames";
import { Control, Controller, FieldValues } from "react-hook-form";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export interface TimePickerFieldProps extends Partial<FieldConfig> {
  id: string;
  name?: string;
  onChange?: (val: any) => void;
  className?: string;
  control: Control<FieldValues, any, FieldValues>;
  format?: string;
}

export default function TimePickerField(props: TimePickerFieldProps) {
  const { placeholder, disabled, onChange, value: _value, className, id, name, control, format = "HH:mm", ...rest } = props;

  return (
    <Controller
      name={(name || "") + id}
      control={control}
      render={({ field, fieldState }) => {
        const handleChange = (_time: any, timeString: any) => {
          const val = timeString || null;
          field.onChange(val);
          onChange?.(val);

        };

        const timeValue = field.value
          ? dayjs.isDayjs(field.value)
            ? field.value
            : dayjs(field.value, format)
          : null;


        return (
          <Form.Item
            validateStatus={fieldState.error ? "error" : ""}
            help={fieldState.error?.message}
            className="mb-0"
          >
            <TimePicker
              className={classNames("w-full hover:border-primary-400 transition-all", className)}
              placeholder={placeholder}
              disabled={disabled}
              size="middle"
              format={format}
              {...field}
              value={timeValue && timeValue.isValid() ? timeValue : null}
              onChange={handleChange}
              {...rest}
            />
          </Form.Item>
        );
      }}
    />
  );
}
