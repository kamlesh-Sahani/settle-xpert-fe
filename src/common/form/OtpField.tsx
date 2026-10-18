import { Form, Input } from "antd";
import classNames from "classnames";
import { Control, Controller, FieldValues } from "react-hook-form";
import style from "./fields.module.css";

export interface OtpFieldProps {
  id: string;
  name?: string;
  onChange?: (val: string) => void;
  className?: string;
  control: Control<FieldValues, any, FieldValues>;
  length?: number;
  disabled?: boolean;
  size?: "small" | "middle" | "large";
}

export default function OtpField(props: OtpFieldProps) {
  const { disabled, onChange, className, id, name, control, length = 6, size = "large", ...rest } = props;

  return (
    <Controller
      name={name || id}
      control={control}
      render={({ field, fieldState }) => {
        const handleChange = (text: string) => {
          field.onChange(text);
          onChange?.(text);
        };

        return (
          <Form.Item
            validateStatus={fieldState.error ? "error" : ""}
            help={fieldState.error?.message}
            className="mb-0 flex flex-col items-center justify-center w-full"
          >
            <div className="flex justify-center w-full py-1">
              <Input.OTP
                length={length}
                size={size}
                disabled={disabled}
                status={fieldState.error ? "error" : undefined}
                className={classNames(style["otp-field"], className)}
                {...field}
                value={field.value || ""}
                onChange={handleChange}
                formatter={(str) => str.toUpperCase()}
                {...rest}
              />
            </div>
          </Form.Item>
        );
      }}
    />
  );
}
