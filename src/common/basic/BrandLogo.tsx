"use client";

import React from "react";
import classNames from "classnames";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  collapsed?: boolean;
}

export const BrandIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = "h-7 w-auto",
  style,
  ...props
}) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={classNames("shrink-0", className)}
    style={style}
    aria-hidden="true"
    {...props}
  >
    {/* Top flowing ribbon of S */}
    <path
      d="M 26.5 4.5 C 19.5 3.5 10 3.8 6.5 7.8 C 4 10.8 4 14.8 5.5 17.8 C 7 20.2 9.5 21.6 11 21.6 L 14.6 16.8 C 14.6 13.6 18 8.2 26.5 4.5 Z"
      fill="currentColor"
    />
    {/* Bottom flowing ribbon of S (180 deg rotation) */}
    <path
      d="M 26.5 4.5 C 19.5 3.5 10 3.8 6.5 7.8 C 4 10.8 4 14.8 5.5 17.8 C 7 20.2 9.5 21.6 11 21.6 L 14.6 16.8 C 14.6 13.6 18 8.2 26.5 4.5 Z"
      transform="rotate(180 16 16)"
      fill="currentColor"
    />
  </svg>
);

export const Logo = BrandIcon;

export default function BrandLogo({
  className,
  size = "md",
  collapsed = false,
}: BrandLogoProps) {
  const sizeClasses = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const iconSizes = {
    sm: "h-5 w-auto",
    md: "h-6 w-auto",
    lg: "h-8 w-auto",
    xl: "h-9 w-auto",
  };

  if (collapsed) {
    return (
      <div className={classNames("flex items-center justify-center", className)}>
        <BrandIcon className="h-7 w-auto text-primary" />
      </div>
    );
  }

  return (
    <div
      className={classNames(
        "inline-flex items-center gap-2 select-none font-bold tracking-tight leading-none font-sans",
        sizeClasses[size],
        className
      )}
    >
      <BrandIcon className={classNames("text-primary", iconSizes[size])} />
      <span className="text-text-primary">SettleXpert</span>
    </div>
  );
}
