"use client";

import React, { useMemo } from "react";
import useLocalesStore, {
  generateLocaleKey,
} from "@/store/locales/locales.store";
import classNames from "classnames";
import { FieldConfig } from "@/types/formField.types";
import { isString } from "@/common/utils/main.utils";

type TextFieldProps = {
  children: React.ReactNode;
  name?: string;
  className?: string;
  as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement> & Partial<FieldConfig>;

const TextField = (props: TextFieldProps) => {
  const { children, name, className, as, style = {}, fontSize, color, fontWeight, label, ...rest } = props;
  const text = isString(children) ? children : (label || "");

  const key = name || generateLocaleKey(text);

  const localeText = useLocalesStore((state) => state.locales[key]) || text;

  const Element = as || "div";

  const customStyle = useMemo(() => {
    const s: React.CSSProperties = { ...style };
    if (fontSize) {
      s.fontSize = fontSize;
    }
    if (color) {
      s.color = color;
    }
    if (fontWeight) {
      s.fontWeight = fontWeight;
    }
    return s;
  }, [style, fontSize, color, fontWeight]);
  return (
    <Element style={customStyle} className={classNames(className)} {...rest}>
      {localeText}
    </Element>
  );
};

export default TextField;
