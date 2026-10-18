import React from "react";
import { Form } from "antd";
import { FieldConfig } from "@/types/formField.types";
import { Control, Controller, FieldValues } from "react-hook-form";
import RichTextEditor from "./RichTextEditor";

export interface RichTextFieldProps extends Partial<FieldConfig> {
  id: string;
  name?: string;
  onChange?: (val: any) => void;
  className?: string;
  control: Control<FieldValues, any, FieldValues>;
}

export default function RichTextField(props: RichTextFieldProps) {
  const { placeholder, onChange, className: _className, id, name, control, ...rest } = props;

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
            <RichTextEditor
              placeholder={placeholder}
              value={field.value}
              onChange={handleChange}
              {...rest}
            />
          </Form.Item>
        );
      }}
    />
  );
}
