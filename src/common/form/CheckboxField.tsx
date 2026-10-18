import { Form, Checkbox } from "antd";
import { FieldConfig } from "@/types/formField.types";
import classNames from "classnames";
import { Control, Controller, FieldValues } from "react-hook-form";


export interface CheckboxFieldProps extends Partial<FieldConfig> {
  id: string;
  name?: string;
  onChange?: (val: any) => void;
  className?: string;
  control: Control<FieldValues, any, FieldValues>;
}

export default function CheckboxField(props: CheckboxFieldProps) {
  const { placeholder: _placeholder, disabled, options, onChange, value: _value, className, id, name, control, ...rest } = props;

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

          const newValue = val?.target ? val.target.value : val;
          field.onChange(newValue);
          onChange?.(newValue);

        };

        return (
          <Form.Item
            validateStatus={fieldState.error ? "error" : ""}
            help={fieldState.error?.message}
            className="mb-0"
          >
            <Checkbox.Group
              className={classNames("w-full hover:border-primary-400 transition-all flex flex-wrap gap-2", className)}
              disabled={disabled}
              options={formattedOptions}
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
