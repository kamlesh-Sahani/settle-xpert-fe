"use client";
import { memo } from "react";
import { Tooltip } from "antd";
import type { TextCellType } from "../types";

function TextCell({ title, isEllipses, isBold, color, fontSize }: TextCellType) {
  const style: React.CSSProperties = {
    fontWeight: isBold ? 600 : 500,
    color: color === "primary" ? "var(--primary)" : color === "secondary" ? "var(--secondary)" : color,
    fontSize: fontSize ?? "inherit",
    lineHeight: 1.4,
    whiteSpace: isEllipses ? "nowrap" : "normal",
    overflow: isEllipses ? "hidden" : undefined,
    textOverflow: isEllipses ? "ellipsis" : undefined,
    maxWidth: isEllipses ? 200 : undefined,
    display: "block",
  };

  const content = <span style={style} >{title}</span>;

  if (isEllipses && title?.length > 25) {
    return <Tooltip title={title}>{content}</Tooltip>;
  }
  return content;
}

export default memo(TextCell);
