"use client";

import { memo } from "react";
import { InboxOutlined } from "@ant-design/icons";

function EmptyState({ msg = "No Data Found" }: { msg: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 20px",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          color: "#9ca3af",
        }}
      >
        <InboxOutlined />
      </div>
      <p
        style={{
          fontSize: 15,
          fontWeight: 500,
          color: "#6b7280",
          margin: 0,
        }}
      >
        {msg}
      </p>
    </div>
  );
}

export default memo(EmptyState);
