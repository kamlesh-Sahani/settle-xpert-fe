import { Form, Select } from "antd";
import { FieldConfig } from "@/types/formField.types";
import classNames from "classnames";
import { Control, Controller, FieldValues } from "react-hook-form";
import { COUNTRIES } from "headless-countries";
import { useMemo } from "react";

export interface CountryPropsType extends Partial<FieldConfig> {
  id: string;
  name?: string;
  onChange?: ({ value, option }: { value: string, option: any }) => void;
  className?: string;
  showSearch?: boolean;
  control: Control<FieldValues, any, FieldValues>;
}

export default function CountryField(props: CountryPropsType) {
  const { placeholder, disabled, onChange, showSearch = true, className, id, name, control, ...rest } = props;

  const countryOptions = useMemo(() => {
    return COUNTRIES.map((c: any) => ({
      label: (
        <div className="flex items-center gap-2">
          <span>{c.flag}</span>
          <span>{c.name}</span>
        </div>
      ),
      value: c.code,
      searchValue: c.name, // To make searching by text work properly
    }));
  }, []);

  return (
    <Controller
      name={name || id} // Using name || id to match generateZodSchema logic
      control={control}
      render={({ field, fieldState }) => {
        const handleChange = (value: string, option: any) => {
          field.onChange(value);
          onChange?.({ value, option });
        };

        return (
          <Form.Item
            validateStatus={fieldState.error ? "error" : ""}
            help={fieldState.error?.message}
            className="mb-0"
          >
            <Select
              className={classNames("w-full", className)}
              placeholder={placeholder || "Select Country"}
              disabled={disabled}
              options={countryOptions}
              size="middle"
              showSearch={showSearch}
              optionFilterProp="searchValue"
              {...field}
              value={field.value || undefined}
              onChange={handleChange}
              {...rest}
            />
          </Form.Item>
        );
      }}
    />
  );
}
