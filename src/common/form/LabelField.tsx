"use client";

import React from "react";
import classNames from "classnames";
import TextField from "./TextField";
import { Tooltip } from "antd";
import InfoIcon from "@/assets/icons/InfoIcon";
import { isString } from "@/common/utils/main.utils";

export interface LabelFieldProps {
  children: React.ReactNode;
  required?: boolean;
  helperText?: string;
  tooltip?: string;
  className?: string;
  labelClassName?: string;
  htmlFor?: string;
}

const LabelField: React.FC<LabelFieldProps> = ({
  children,
  required,
  helperText,
  tooltip,
  className,
  labelClassName,
  htmlFor,
}) => {
  const tooltipText = helperText || tooltip;

  return (
    <div className={classNames("flex items-center gap-1.5 mb-1", className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1 cursor-pointer m-0"
      >
        {isString(children) ? (
          <TextField
            className={classNames(
              "font-semibold text-text-primary text-sm leading-snug",
              labelClassName
            )}
          >
            {children}
          </TextField>
        ) : (
          <span
            className={classNames(
              "font-semibold text-text-primary text-sm leading-snug",
              labelClassName
            )}
          >
            {children}
          </span>
        )}
        {required && <span className="text-danger font-bold">*</span>}
      </label>

      {tooltipText && (
        <Tooltip title={tooltipText} placement="top">
          <InfoIcon className="text-text-secondary hover:text-primary transition-colors text-[13px] cursor-pointer shrink-0" />
        </Tooltip>
      )}
    </div>
  );
};

export default LabelField;
