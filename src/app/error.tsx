"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ErrorApi } from "@/common/ui/ErrorApi";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error caught by boundary:", error);
  }, [error]);

  return (
    <ErrorApi
      fullScreen
      title="Oops! Something went wrong."
      message={error?.message || "An unexpected error occurred while loading this view."}
      onRetry={reset}
      action={
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-all duration-200 cursor-pointer"
        >
          Go to Home
        </Link>
      }
    />
  );
}
