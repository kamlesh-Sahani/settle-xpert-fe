import React, { useMemo, useCallback } from "react";
import { Form, Select, SelectProps } from "antd";
import { PlusOutlined, LinkOutlined } from "@ant-design/icons";
import { FieldConfig } from "@/types/formField.types";
import classNames from "classnames";
import { Control, Controller, FieldValues } from "react-hook-form";
import {
  isFunction,
  isNotEmptyArray,
  isNotEmptyObject,
  isNotEmptyString,
} from "@/common/utils/main.utils";

export interface SelectCreateAction {
  label: React.ReactNode | string;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  icon?: React.ReactNode;
  className?: string;
}

export type SelectPropsType = Omit<SelectProps<any>, "onChange" | "options" | "placeholder"> &
  Partial<FieldConfig> & {
    id: string;
    name?: string;
    onChange?: ({ value, option }: { value: string; option: any }) => void;
    className?: string;
    formItemClassName?: string;
    formItemStyle?: React.CSSProperties;
    showSearch?: boolean;
    control: Control<FieldValues, any, FieldValues>;
    options?: any[];
    suffix?: React.ReactNode;
    prefix?: React.ReactNode;
    create?: SelectCreateAction;
    hideKeys?: (string | number)[];
  };

const DEFAULT_FIELD_NAMES = { label: "value", value: "key" } as const;

function SelectFieldComponent(props: SelectPropsType) {
  const {
    placeholder,
    disabled,
    options,
    onChange,
    value: _value,
    showSearch = false,
    className,
    popupClassName,
    dropdownClassName,
    classNames: customClassNames,
    formItemClassName,
    formItemStyle,
    id,
    name,
    control,
    create,
    popupRender: customPopupRender,
    dropdownRender: customDropdownRender,
    optionRender: customOptionRender,
    fieldNames: customFieldNames,
    hideKeys,
    ...rest
  } = props;

  const resolvedFieldNames = customFieldNames || DEFAULT_FIELD_NAMES;
  const hideSet = useMemo(() => (isNotEmptyArray(hideKeys) ? new Set(hideKeys) : null), [hideKeys]);

  // 2. Option renderer with robust link detection and polished UI badge button
  const resolvedOptionRender = useCallback(
    (option: any, info: { index: number }) => {
      const content = customOptionRender
        ? customOptionRender(option, info)
        : (option.data?.value ?? option.data?.label ?? option.label ?? option.value);

      const link = option?.data?.link;
      if (isNotEmptyString(link)) {
        return (
          <div className="flex items-center justify-between w-full min-w-0 py-0.5 gap-2">
            <span className="truncate flex-1 min-w-0 text-sm">
              {content}
            </span>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className="inline-flex items-center justify-center text-primary hover:text-primary-hover transition-colors shrink-0 cursor-pointer p-0.5"
              title="Open link in new tab"
              aria-label="Open link"
            >
              <LinkOutlined className="text-sm" />
            </a>
          </div>
        );
      }

      return content;
    },
    [customOptionRender]
  );

  // 4. Zero-overhead popupRender: if no create button and no custom renderer, pass undefined so Antd skips wrapper elements
  const hasCreate = isNotEmptyObject(create);
  const resolvedPopupRender = useMemo(() => {
    if (!hasCreate && !customPopupRender && !customDropdownRender) return undefined;

    return (originNode: React.ReactNode) => {
      const customRender = customPopupRender || customDropdownRender;
      const renderedMenu = customRender ? (customRender as any)(originNode) : originNode;

      if (hasCreate && create) {
        return (
          <div>
            {renderedMenu}
            <div className="border-t border-border/80 my-1" />
            <div
              role="button"
              tabIndex={0}
              className={classNames(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:text-primary-hover hover:bg-primary/5 transition-colors cursor-pointer select-none",
                create.className
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => create.onClick?.(e)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  create.onClick?.(e as any);
                }
              }}
            >
              {create.icon || <PlusOutlined className="text-xs text-primary" />}
              <span>{create.label}</span>
            </div>
          </div>
        );
      }

      return renderedMenu;
    };
  }, [hasCreate, create, customPopupRender, customDropdownRender]);

  const mergedClassNames = useMemo(() => {
    const combinedPopupClass = classNames(
      "custom-select-dropdown",
      popupClassName,
      dropdownClassName
    );

    if (isFunction(customClassNames)) {
      return (info: any) => {
        const res = (customClassNames as any)(info);
        return {
          ...res,
          popup: {
            ...res?.popup,
            root: classNames(combinedPopupClass, res?.popup?.root),
          },
        };
      };
    }
    return {
      ...(customClassNames as any),
      popup: {
        ...(customClassNames as any)?.popup,
        root: classNames(combinedPopupClass, (customClassNames as any)?.popup?.root),
      },
    };
  }, [customClassNames, popupClassName, dropdownClassName]);

  return (
    <Controller
      name={name || id}
      control={control}
      render={({ field, fieldState }) => {
        const valKey = resolvedFieldNames.value || "key";
        const currentVal = field.value ?? _value;
        const displayOptions =
          hideSet && isNotEmptyArray(options)
            ? options.filter((opt: any) => {
              const val = opt?.[valKey];
              return val === currentVal || !hideSet.has(val);
            })
            : options;

        const handleChange = (value: string, option: any) => {
          field.onChange(value);
          onChange?.({ value, option });
        };

        return (
          <Form.Item
            validateStatus={fieldState.error ? "error" : ""}
            help={fieldState.error?.message}
            className={classNames("mb-0", formItemClassName)}
            style={formItemStyle}
          >
            <Select
              className={classNames("w-full", className)}
              classNames={mergedClassNames}
              placeholder={placeholder}
              disabled={disabled}
              options={displayOptions}
              size="middle"
              showSearch={showSearch}
              fieldNames={resolvedFieldNames}
              popupRender={resolvedPopupRender}
              optionRender={resolvedOptionRender}
              {...field}
              value={field.value === "" || field.value == null ? undefined : field.value}
              onChange={handleChange}
              {...rest}
            />
          </Form.Item>
        );
      }}
    />
  );
}

const SelectField = React.memo(SelectFieldComponent);
export default SelectField;
