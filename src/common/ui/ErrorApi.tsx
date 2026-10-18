"use client";

import React from "react";
import Image from "next/image";
import { FiRefreshCw } from "react-icons/fi";
import classNames from "classnames";

export interface ErrorApiProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  action?: React.ReactNode;
  fullScreen?: boolean;
  className?: string;
}

export function ErrorApi({
  title = "Oops Something went wrong.",
  message = "We're having a little trouble fetching the data. Our best dog is on it!",
  onRetry,
  action,
  fullScreen = false,
  className,
}: ErrorApiProps) {
  const containerClasses = classNames(
    "flex flex-col items-center justify-center p-8 rounded-2xl text-center",
    "bg-background transition-all duration-300",
    fullScreen ? "min-h-[60vh]" : "w-full",
    className
  );

  return (
    <div className={containerClasses}>
      <div className="relative mb-6 w-48 h-48 sm:w-64 sm:h-64 rounded-full overflow-hidden shadow-sm bg-secondary flex items-center justify-center">
        <Image
          src="/error-dog.png"
          alt="Confused Dog"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 192px, 256px"
          priority
        />
      </div>

      <h3 className="text-2xl font-bold tracking-tight text-text-primary mb-2">
        {title}
      </h3>

      <p className="text-text-secondary max-w-md mb-8 text-base whitespace-pre-line">
        {message}
      </p>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        {onRetry && (
          <button
            onClick={onRetry}
            className={classNames(
              "group relative inline-flex items-center justify-center gap-2 px-6 py-2.5",
              "text-sm font-semibold text-text-primary bg-background border border-border rounded-lg cursor-pointer",
              "transition-all duration-200 ease-out hover:bg-secondary hover:border-border active:scale-95"
            )}
          >
            <FiRefreshCw className="w-4 h-4 transition-transform duration-500 group-hover:rotate-180 text-text-secondary" />
            <span>Try again</span>
          </button>
        )}
        {action}
      </div>
    </div>
  );
}
