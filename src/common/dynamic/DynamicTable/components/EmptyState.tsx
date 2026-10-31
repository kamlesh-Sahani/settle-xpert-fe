"use client";

import { memo } from "react";
import { InboxOutlined } from "@ant-design/icons";

function EmptyState({ msg = "No Data Found", onRetry }: { msg: string; onRetry?: () => void }) {
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
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 px-4 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors cursor-pointer"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export default memo(EmptyState);
