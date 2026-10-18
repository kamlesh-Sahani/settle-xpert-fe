import { Form, TreeSelect } from "antd";
import { FieldConfig } from "@/types/formField.types";
import classNames from "classnames";
import { Control, Controller, FieldValues } from "react-hook-form";

export interface TreeSelectFieldProps extends Partial<FieldConfig> {
  id: string;
  name?: string;
  onChange?: (val: any) => void;
  className?: string;
  control: Control<FieldValues, any, FieldValues>;
}

export default function TreeSelectField(props: TreeSelectFieldProps) {
  const { placeholder, disabled, options, onChange, value: _value, className, id, name, control, ...rest } = props;

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
            <TreeSelect
              className={classNames("w-full hover:border-primary-400 transition-all", className)}
              placeholder={placeholder}
              disabled={disabled}
              size="middle"
              {...field}
              onChange={handleChange}
              treeData={options as any}
              {...rest}
            />
          </Form.Item>
        );
      }}
    />
  );
}
