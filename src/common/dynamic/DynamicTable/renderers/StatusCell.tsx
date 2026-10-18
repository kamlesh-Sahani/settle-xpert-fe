"use client";

import { memo } from "react";
import type { StatusCellType } from "../types";

function StatusCell({ title, bgColor, textColor, borderColor }: StatusCellType) {
  return (
    <div
      style={{
        alignItems: "center",
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 500,
        backgroundColor: bgColor,
        border: borderColor ? `1px solid ${borderColor}` : "none",
        whiteSpace: "nowrap",
      }}
      className="flex gap-2 items-center rounded-[5px] max-w-fit min-w-[108px] h-[30px] px-3"
    >
      <div className="w-[8px] h-[8px] rounded-full" style={{ backgroundColor: borderColor }}></div>
      <span style={{ color: textColor }} className="font-semibold text-[13px]">{title}</span>
    </div>

  );
}

export default memo(StatusCell);
