import React from "react";
import { Form } from "antd";
import { FieldConfig } from "@/types/formField.types";
import { Control, Controller, FieldValues } from "react-hook-form";
import AutocompleteSelect from "./AutocompleteSelect";

export interface AutocompleteFieldProps extends Partial<FieldConfig> {
  id: string;
  name?: string;
  onChange?: (val: any) => void;
  className?: string;
  control: Control<FieldValues, any, FieldValues>;
}

export default function AutocompleteField(props: AutocompleteFieldProps) {
  const { placeholder, disabled, onChange, options, className: _className, id, name, control, ...rest } = props;

  const formattedOptions = options?.map((opt) => ({
    label: (opt as any).label || (opt as any).key || opt.value,
    value: opt.value,
  }));

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
            <AutocompleteSelect
              name={(name || "") + id}
              placeholder={placeholder}
              options={formattedOptions as any}
              value={field.value}
              onChange={handleChange}
              disabled={disabled}
              apiUrl={""} // Must be provided by config ideally
              {...rest}
            />
          </Form.Item>
        );
      }}
    />
  );
}
