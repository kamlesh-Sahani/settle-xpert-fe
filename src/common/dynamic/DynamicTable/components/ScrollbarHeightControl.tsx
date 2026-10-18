"use client";

import { useState } from "react";
import { Popover, Slider, Button, Tooltip } from "antd";

const STORAGE_KEY = "dynamic-table-scrollbar-height";
const DEFAULT_HEIGHT = 8;
const MIN_HEIGHT = 6;
const MAX_HEIGHT = 20;

/** Read persisted scrollbar height from localStorage */
export function getScrollbarHeight(): number {
  if (typeof window === "undefined") return DEFAULT_HEIGHT;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const val = Number(stored);
    if (!isNaN(val) && val >= MIN_HEIGHT && val <= MAX_HEIGHT) return val;
  }
  return DEFAULT_HEIGHT;
}

/** Persist scrollbar height to localStorage */
function saveScrollbarHeight(height: number) {
  localStorage.setItem(STORAGE_KEY, String(height));
}

/** Inline SVG icon that visually represents a horizontal scrollbar */
function ScrollbarIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Track */}
      <rect x="2" y="16" width="20" height="4" rx="2" fill="currentColor" opacity="0.15" />
      {/* Thumb */}
      <rect x="6" y="16.5" width="8" height="3" rx="1.5" fill="currentColor" opacity="0.7" />
      {/* Left arrow */}
      <path d="M5 10L2 13L5 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      {/* Right arrow */}
      <path d="M19 10L22 13L19 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      {/* Table lines */}
      <rect x="4" y="4" width="16" height="1.5" rx="0.75" fill="currentColor" opacity="0.2" />
      <rect x="4" y="7.5" width="16" height="1.5" rx="0.75" fill="currentColor" opacity="0.2" />
      <rect x="4" y="11" width="16" height="1.5" rx="0.75" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

interface ScrollbarHeightControlProps {
  onApply: (height: number) => void;
  currentHeight: number;
}

export default function ScrollbarHeightControl({ onApply, currentHeight }: ScrollbarHeightControlProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentHeight);

  const handleApply = () => {
    saveScrollbarHeight(value);
    onApply(value);
    setOpen(false);
  };

  const handleReset = () => {
    setValue(DEFAULT_HEIGHT);
    saveScrollbarHeight(DEFAULT_HEIGHT);
    onApply(DEFAULT_HEIGHT);
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) setValue(currentHeight);
    setOpen(newOpen);
  };

  const content = (
    <div style={{ width: 220 }}>
      <div className="flex items-center gap-2 mb-3">
        <ScrollbarIcon size={20} />
        <span className="text-sm font-semibold text-text-primary">
          Scrollbar Height
        </span>
      </div>

      {/* Live preview bar */}
      <div
        className="rounded-md mb-3 flex items-center justify-center"
        style={{
          background: "var(--background-secondary, #f3f4f6)",
          height: 30,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="rounded-full transition-all"
          style={{
            background: "var(--primary-600, var(--primary))",
            width: "60%",
            height: value,
            opacity: 0.7,
          }}
        />
      </div>

      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-text-secondary">Thin</span>
        <span className="text-xs font-medium text-text-primary">{value}px</span>
        <span className="text-xs text-text-secondary">Thick</span>
      </div>

      <Slider
        min={MIN_HEIGHT}
        max={MAX_HEIGHT}
        value={value}
        onChange={setValue}
        tooltip={{ formatter: (val) => `${val}px` }}
      />

      <div className="flex gap-2 mt-3">
        <Button type="primary" size="small" onClick={handleApply} block>
          Apply
        </Button>
        <Button size="small" onClick={handleReset} block>
          Reset
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      placement="topRight"
      content={content}
      open={open}
      onOpenChange={handleOpenChange}
      trigger="click"
    >
      <Tooltip
        title="Adjust horizontal scrollbar thickness"
        placement="right"
      >
        <button
          type="button"
          className="flex items-center gap-1.5 text-primary transition-colors cursor-pointer rounded-md px-1.5 py-0.5 bg-primary-50"
          style={{ background: "transparent", border: "none" }}
        >
          <ScrollbarIcon size={16} />
          <span className="text-xs font-medium hidden sm:inline">Scroll Size</span>
        </button>
      </Tooltip>
    </Popover>
  );
}
