import { Form, Input, Select, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { COUNTRIES } from "headless-countries";
import { useMemo, useState } from "react";
import style from "./fields.module.css";
import classNames from "classnames";
import { Control, Controller, FieldValues } from "react-hook-form";
import { FieldConfig } from "@/types/formField.types";

export interface PhoneFieldProps extends Partial<FieldConfig> {
  id: string;
  name?: string;
  onChange?: (val: any) => void;
  className?: string;
  control: Control<FieldValues, any, FieldValues>;
}

const PhoneField = (props: PhoneFieldProps) => {
  const { placeholder, disabled, onChange, value: _value, className, id, name, control, ...rest } = props;
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [searchValue, setSearchValue] = useState("");

  const options = useMemo(() => {
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        c.dial.includes(searchValue)
    ).map((country) => ({
      value: country.code,
      label: (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">{country.flag}</span>
            <span>{country.name}</span>
          </div>
          <span className="text-text-secondary font-medium">
            {country.dial}
          </span>
        </div>
      ),
      searchLabel: `${country.name} ${country.dial}`,
    }));
  }, [searchValue]);

  const selectedCountryData = COUNTRIES.find(
    (c) => c.code === selectedCountry
  );

  return (
    <Controller
      name={name || id}
      control={control}
      render={({ field, fieldState }) => {
        const currentDialCode = selectedCountryData?.dial || "";
        
        // Extract just the local number to display in the input box
        let displayValue = (field.value as string) || "";
        if (currentDialCode && displayValue.startsWith(currentDialCode)) {
          displayValue = displayValue.substring(currentDialCode.length);
        }

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          let rawValue = e.target.value;

          // Keep only digits and '+' signs
          rawValue = rawValue.replace(/[^\d+]/g, "");

          // Strip the dial code as many times as they pasted it (e.g. +91+91)
          while (currentDialCode && rawValue.startsWith(currentDialCode)) {
            rawValue = rawValue.substring(currentDialCode.length);
          }

          // Remove any remaining non-digit characters
          const numericValue = rawValue.replace(/\D/g, "");

          // Save the full combined number to form state
          const fullValue = numericValue ? `${currentDialCode}${numericValue}` : "";
          field.onChange(fullValue);
          onChange?.(fullValue);
        };

        const handleCountryChange = (countryCode: string) => {
          setSelectedCountry(countryCode);
          const newCountryData = COUNTRIES.find((c) => c.code === countryCode);
          const newDial = newCountryData?.dial || "";
          
          // Re-combine the existing local number with the newly selected dial code
          const fullValue = displayValue ? `${newDial}${displayValue}` : "";
          field.onChange(fullValue);
          onChange?.(fullValue);
        };

        const handleOpenChange = (open: boolean) => {
          if (!open) {
            setSearchValue("");
          }
        };

        return (
          <Form.Item
            validateStatus={fieldState.error ? "error" : ""}
            help={fieldState.error?.message}
            className="mb-0"
          >
            <Space.Compact className="w-full">
              <Select
                value={selectedCountry}
                onChange={handleCountryChange}
                options={options}
                style={{ width: 64 }}
                popupMatchSelectWidth={false}
                showSearch={false}
                disabled={disabled}
                styles={{ popup: { root: { width: 280 } } }}
                onOpenChange={handleOpenChange}
                className={classNames("bg-secondary py-0 outline-0 focus-0", style["phone-field"])}
                labelRender={() => (
                  <div className="flex items-center justify-center">
                    <span className="text text-[15px] h-[20px]">{selectedCountryData?.flag}</span>
                  </div>
                )}
                popupRender={(menu) => (
                  <>
                    <div className="p-2 pb-1">
                      <Input
                        placeholder="Search countries..."
                        prefix={<SearchOutlined className="text-text-secondary" />}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {menu}
                  </>
                )}
              />
              <Input
                prefix={<span className="text-text-primary font-medium mr-1">{selectedCountryData?.dial}</span>}
                placeholder={placeholder || "Enter Phone number"}
                disabled={disabled}
                maxLength={selectedCountryData?.digits}
                {...field}
                value={displayValue}
                onChange={handleChange}
                className={classNames("w-full transition-all", className)}
                {...rest}
              />
            </Space.Compact>
          </Form.Item>
        );
      }}
    />
  );
};

export default PhoneField;