import React from "react";
import { Input } from "antd";

interface RichTextEditorProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  [key: string]: any;
}

export default function RichTextEditor({ value, onChange, placeholder, ...rest }: RichTextEditorProps) {
  return (
    <Input.TextArea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      autoSize={{ minRows: 4, maxRows: 10 }}
      {...rest}
    />
  );
}
