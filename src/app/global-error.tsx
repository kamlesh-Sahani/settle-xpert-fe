"use client";

import { useEffect } from "react";
import { ErrorApi } from "@/common/ui/ErrorApi";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-text-primary min-h-screen flex items-center justify-center p-4">
        <ErrorApi
          fullScreen
          title="Critical Application Error"
          message={error?.message || "An unexpected system error occurred. Please try again."}
          onRetry={reset}
          action={
            <button
              type="button"
              onClick={() => window.location.href = "/"}
              className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-all duration-200 cursor-pointer"
            >
              Go to Home
            </button>
          }
        />
      </body>
    </html>
  );
}
