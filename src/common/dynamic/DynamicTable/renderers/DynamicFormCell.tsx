"use client";

import { memo } from "react";
import { FormOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import type { DynamicFormCellType } from "../types";

function DynamicFormCell({ label, apiData: _apiData }: DynamicFormCellType) {

  const handleOpen = () => {

  };

  return (
    <Tooltip title={label ?? "Open Form"}>
      <button
        onClick={handleOpen}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 30,
          height: 30,
          borderRadius: 6,
          border: "1px solid #e5e7eb",
          background: "transparent",
          color: "#6b7280",
          cursor: "pointer",
          transition: "all 0.2s",
          fontSize: 14,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f0f9ff";
          e.currentTarget.style.borderColor = "#3b82f6";
          e.currentTarget.style.color = "#3b82f6";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.borderColor = "#e5e7eb";
          e.currentTarget.style.color = "#6b7280";
        }}
      >
        <FormOutlined />
      </button>
    </Tooltip>
  );
}

export default memo(DynamicFormCell);
