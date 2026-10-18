import React from "react";
import { Form, TimePicker } from "antd";
import { FieldConfig } from "@/types/formField.types";
import classNames from "classnames";
import { Control, Controller, FieldValues } from "react-hook-form";
import dayjs from "dayjs";

export interface TimePickerFieldProps extends Partial<FieldConfig> {
  id: string;
  name?: string;
  onChange?: (val: any) => void;
  className?: string;
  control: Control<FieldValues, any, FieldValues>;
}

export default function TimePickerField(props: TimePickerFieldProps) {
  const { placeholder, disabled, onChange, value: _value, className, id, name, control, ...rest } = props;

  return (
    <Controller
      name={(name || "") + id}
      control={control}
      render={({ field, fieldState }) => {
        const handleChange = (time: any, _timeString: any) => {
          const iso = time ? time.toISOString() : null;
          field.onChange(iso);
          onChange?.(iso);
        };

        const timeValue = field.value ? dayjs(field.value) : null;

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
              format="HH:mm"
              {...field}
              value={timeValue}
              onChange={handleChange}
              {...rest}
            />
          </Form.Item>
        );
      }}
    />
  );
}
