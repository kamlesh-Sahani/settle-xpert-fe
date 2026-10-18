import React from "react";
import { Input, Select, Radio, DatePicker, InputNumber, ConfigProvider } from "antd";
import type { TableColumnType } from "./DynamicTable/types";
import dayjs from "dayjs";
import { isArray, isNotEmpty } from "@/common/utils/main.utils";

export interface FilterValue {
  operator: string;
  value: any;
}

export interface FilterControlProps {
  field: TableColumnType;
  current: FilterValue;
  onChange: (value: FilterValue) => void;
  onClear?: () => void;
  onApply?: () => void;
  onReset?: () => void;
  variant?: "drawer" | "dropdown";
}

export default function FilterControl({
  field,
  current,
  onChange,
  onClear,
  onApply,
  onReset,
  variant = "dropdown",
}: FilterControlProps) {
  const getDefaultOperator = () => {
    switch (field.type) {
      case "SELECT":
        return "equal";
      case "NUMBER":
        return "equal";
      case "DATE":
        return "equal";
      case "DATE_RANGE":
        return "between";
      case "TEXT":
      default:
        return "contains";
    }
  };

  const normalizeOperator = (op?: string): string => {
    if (!op) return "";
    const lower = op.toLowerCase().replace(/-/g, "_");
    if (lower === "starts_with" || lower === "start_with") return "start_with";
    if (lower === "greater_than" || lower === "gt" || lower === "after") return "greater_than";
    if (lower === "less_than" || lower === "lt" || lower === "before") return "less_than";
    if (lower === "not_equal" || lower === "ne") return "not_equal";
    if (lower === "equal" || lower === "eq") return "equal";
    if (lower === "contains") return "contains";
    if (lower === "between") return "between";
    return lower;
  };

  const activeOperator = normalizeOperator(current.operator) || getDefaultOperator();

  const handleOperatorChange = (op: string) => {
    // If switching between date range and single date, adjust value structure if needed
    if (field.type === "DATE" || field.type === "DATE_RANGE") {
      if (op === "between" && !isArray(current.value)) {
        const val = current.value ? [current.value, current.value] : null;
        onChange({ ...current, operator: op, value: val });
        return;
      } else if (op !== "between" && isArray(current.value)) {
        const val = current.value[0] || null;
        onChange({ ...current, operator: op, value: val });
        return;
      }
    }
    onChange({ ...current, operator: op });
  };

  const handleValueChange = (val: any) => {
    onChange({ ...current, operator: activeOperator, value: val });
  };

  const handleApply = () => {
    if (onApply) {
      onApply();
    }
  };

  const handleReset = () => {
    const defaultOp = getDefaultOperator();
    onChange({ operator: defaultOp, value: "" });
    if (onReset) {
      onReset();
    } else if (onClear) {
      onClear();
    }
  };

  const getOperators = () => {
    switch (field.type) {
      case "SELECT":
        return [
          { label: "Equal", value: "equal" },
          { label: "Not equal", value: "not_equal" },
        ];
      case "NUMBER":
        return [
          { label: "Equal", value: "equal" },
          { label: "Greater than", value: "greater_than" },
          { label: "Less than", value: "less_than" },
          { label: "Not equal", value: "not_equal" },
        ];
      case "DATE":
      case "DATE_RANGE":
        return [
          { label: "Equal", value: "equal" },
          { label: "Greater than", value: "after" },
          { label: "Less than", value: "before" },
          { label: "Date Range", value: "between" },
        ];
      case "TEXT":
      default:
        return [
          { label: "Contains", value: "contains" },
          { label: "Starts with", value: "start_with" },
        ];
    }
  };

  const renderInput = () => {
    switch (field.type) {
      case "SELECT": {
        const selectVal = isArray(current.value)
          ? current.value
          : current.value !== undefined && current.value !== null && current.value !== ""
            ? [current.value]
            : [];

        return (
          <Select
            mode="multiple"
            placeholder="Select options"
            value={selectVal}
            onChange={handleValueChange}
            className="w-full min-h-[34px] text-[13px]"
            allowClear
            options={field.options?.map((opt) => ({ label: opt.value, value: opt.key })) || []}
          />
        );
      }
      case "NUMBER": {
        const rawNum = isArray(current.value) ? current.value[0] : current.value;
        const numVal = rawNum !== undefined && rawNum !== null && rawNum !== "" ? Number(rawNum) : null;

        return (
          <InputNumber
            placeholder="Enter number"
            value={numVal}
            onChange={handleValueChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onApply) {
                e.stopPropagation();
                handleApply();
              }
            }}
            className="w-full h-[34px] text-[13px] rounded-md border-gray-300 dark:border-zinc-700 flex items-center"
          />
        );
      }
      case "DATE":
      case "DATE_RANGE": {
        if (activeOperator === "between") {
          const rangeVal =
            isArray(current.value) && current.value.length === 2 && current.value[0] && current.value[1]
              ? [dayjs(current.value[0]), dayjs(current.value[1])]
              : null;

          return (
            <DatePicker.RangePicker
              value={rangeVal as any}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  handleValueChange([dates[0].toISOString(), dates[1].toISOString()]);
                } else {
                  handleValueChange(null);
                }
              }}
              className="w-full h-[34px] text-[13px] rounded-md border-gray-300 dark:border-zinc-700"
            />
          );
        }

        const rawDate = isArray(current.value) ? current.value[0] : current.value;
        const dateVal = rawDate && typeof rawDate === "string" ? dayjs(rawDate) : null;

        return (
          <DatePicker
            placeholder="Select a date"
            value={dateVal}
            onChange={(date) => handleValueChange(date ? date.toISOString() : null)}
            className="w-full h-[34px] text-[13px] rounded-md border-gray-300 dark:border-zinc-700"
          />
        );
      }
      case "TEXT":
      default: {
        const textVal = isArray(current.value)
          ? (current.value[0] !== undefined && current.value[0] !== null ? String(current.value[0]) : "")
          : (current.value !== undefined && current.value !== null ? String(current.value) : "");

        return (
          <Input
            placeholder="Search"
            value={textVal}
            onChange={(e) => handleValueChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
                if (onApply) {
                  handleApply();
                }
              }
            }}
            className="w-full h-[34px] text-[13px] rounded-md border-gray-300 dark:border-zinc-700"
            allowClear
          />
        );
      }
    }
  };

  const options = getOperators();

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#e62e4d",
          colorText: "#1f2937",
          fontSize: 13,
          borderRadius: 6,
        },
        components: {
          Radio: {
            colorPrimary: "#e62e4d",
            colorBorder: "#9ca3af",
          },
          Input: {
            activeBorderColor: "#e62e4d",
            hoverBorderColor: "#e62e4d",
            colorBorder: "#d1d5db",
          },
          DatePicker: {
            activeBorderColor: "#e62e4d",
            hoverBorderColor: "#e62e4d",
            colorBorder: "#d1d5db",
          },
          InputNumber: {
            activeBorderColor: "#e62e4d",
            hoverBorderColor: "#e62e4d",
            colorBorder: "#d1d5db",
          },
          Select: {
            colorPrimary: "#e62e4d",
            colorBorder: "#d1d5db",
          },
        },
      }}
    >
      <div className="flex flex-col w-full">
        {/* Header with Apply and Reset buttons */}
        {variant === "dropdown" && (
          <>
            <div className="flex items-center gap-2.5 pb-2.5">
              <button
                type="button"
                onClick={handleApply}
                className="bg-[#e62e4d] hover:bg-[#cc243f] active:bg-[#b01f36] text-white font-medium text-[13px] px-3.5 py-1 rounded-[4px] transition-colors leading-tight cursor-pointer"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="text-[#e62e4d] hover:text-[#cc243f] font-medium text-[13px] px-1 py-1 transition-colors leading-tight cursor-pointer"
              >
                Reset
              </button>
            </div>
            <div className="border-b border-gray-200/80 dark:border-zinc-800 -mx-3 mb-2.5" />
          </>
        )}

        {/* Radio options list */}
        <Radio.Group
          value={activeOperator}
          onChange={(e) => handleOperatorChange(e.target.value)}
          className={
            variant === "drawer"
              ? "grid grid-cols-[auto_auto] gap-x-5 gap-y-2 py-0.5 w-fit"
              : "flex flex-col gap-1.5 py-0.5"
          }
        >
          {options.map((opt) => (
            <Radio
              key={opt.value}
              value={opt.value}
              className="text-[#1f2937] dark:text-zinc-200 text-[13px] font-normal !m-0 whitespace-nowrap"
            >
              {opt.label}
            </Radio>
          ))}
        </Radio.Group>

        {/* Input field */}
        <div className="mt-2.5">
          {renderInput()}
        </div>
      </div>
    </ConfigProvider>
  );
}
