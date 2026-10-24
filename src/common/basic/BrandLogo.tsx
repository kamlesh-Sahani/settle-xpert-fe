"use client";

import React from "react";
import classNames from "classnames";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  collapsed?: boolean;
}

export const BrandIcon = ({
  className = "h-8 w-auto",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <svg
    viewBox="0 0 36 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={classNames("inline-block shrink-0", className)}
    style={style}
    aria-hidden="true"
  >
    {/* Head of the triumphant figure */}
    <circle cx="18" cy="6" r="4.5" className="fill-text-primary" />
    {/* Celebrating human figure forming the X */}
    <path
      d="M 3 19.5 C 8 20.5 12 18.5 15.5 15.5 C 19 12 22 7 24.5 2 C 24.5 2 23.5 10 20 16 C 24 19 29.5 22 35 23.5 C 30 24 24.5 22.5 19.5 19 C 17.5 22.5 14 30.5 9.5 38.5 C 11.5 32 14.5 25 15.5 19 C 11.5 19.5 7 19 3 19.5 Z"
      fill="#15803d"
    />
  </svg>
);

export default function BrandLogo({
  className,
  size = "md",
  collapsed = false,
}: BrandLogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  if (collapsed) {
    return (
      <div className={classNames("flex items-center justify-center", className)}>
        <BrandIcon className="h-7 w-7" />
      </div>
    );
  }

  return (
    <div
      className={classNames(
        "inline-flex items-center select-none font-bold tracking-tight leading-none font-sans",
        sizeClasses[size],
        className
      )}
    >
      <span className="text-[#15803d]">Settle</span>
      <BrandIcon
        className="h-[1.18em] w-auto mx-[-0.04em] shrink-0"
        style={{ verticalAlign: "-0.16em" } as React.CSSProperties}
      />
      <span className="text-text-primary">pert</span>
    </div>
  );
}
