"use client";

import React, { memo } from "react";
import type { CustomCellType } from "../types";

export interface CustomCellProps extends CustomCellType {
  record?: any;
}

function CustomCell({ render, component, record }: CustomCellProps) {
  if (typeof render === "function") {
    return <>{render(record)}</>;
  }
  if (render) {
    return <>{render}</>;
  }
  if (component) {
    return <>{component}</>;
  }
  return null;
}

export default memo(CustomCell);
