import { Form, InputNumber, Space } from "antd";
import { FieldConfig } from "@/types/formField.types";
import classNames from "classnames";
import { Control, Controller, FieldValues } from "react-hook-form";

export interface NumberFieldProps extends Partial<FieldConfig> {
  id: string;
  name?: string;
  onChange?: (val: any) => void;
  className?: string;
  control: Control<FieldValues, any, FieldValues>;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number | string;
}

export default function NumberField(props: NumberFieldProps) {
  const {
    placeholder,
    disabled,
    options,
    onChange,
    value: _value,
    className,
    id,
    name,
    control,
    addonBefore,
    addonAfter,
    ...rest
  } = props;

  const _formattedOptions = options?.map((opt) => ({
    label: (opt as any).label || (opt as any).key || opt.value,
    value: opt.value,
  }));

  const hasAddon = Boolean(addonBefore || addonAfter);

  return (
    <Controller
      name={name || id}
      control={control}
      render={({ field, fieldState }) => {
        const handleChange = (val: number | null) => {
          // InputNumber fires null when cleared — coerce to 0
          const newValue = val ?? 0;
          field.onChange(newValue);
          onChange?.(newValue);
        };

        const inputNumberElement = (
          <InputNumber
            className={classNames(
              "w-full hover:border-primary-400 transition-all",
              hasAddon && "!flex-1 !w-full",
              className
            )}
            placeholder={placeholder}
            disabled={disabled}
            size="middle"
            {...field}
            onChange={handleChange}
            {...rest}
          />
        );

        return (
          <Form.Item
            validateStatus={fieldState.error ? "error" : ""}
            help={fieldState.error?.message}
            className="mb-0"
          >
            {hasAddon ? (
              <Space.Compact block className="w-full">
                {addonBefore && <Space.Addon>{addonBefore}</Space.Addon>}
                {inputNumberElement}
                {addonAfter && <Space.Addon>{addonAfter}</Space.Addon>}
              </Space.Compact>
            ) : (
              inputNumberElement
            )}
          </Form.Item>
        );
      }}
    />
  );
}
