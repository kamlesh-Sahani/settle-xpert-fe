"use client";

import { memo } from "react";
import { Skeleton } from "antd";

interface FormSkeletonProps {
  fieldsCount?: number;
  columns?: number;
  showSubmitButton?: boolean;
}

function FormSkeleton({
  fieldsCount = 4,
  columns = 1,
  showSubmitButton = true,
}: FormSkeletonProps) {
  return (
    <div className="w-full flex flex-col gap-6" role="status" aria-busy="true">
      <span className="sr-only">Loading form content...</span>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 24,
        }}
      >
        {Array.from({ length: fieldsCount }).map((_, idx) => (
          <div key={`form-field-skel-${idx}`} className="flex flex-col gap-2">
            {/* Label skeleton */}
            <Skeleton.Input
              active
              size="small"
              style={{
                width: `${25 + ((idx * 17) % 35)}%`,
                height: 14,
                borderRadius: 4,
              }}
            />
            {/* Input skeleton */}
            <Skeleton.Input
              active
              size="large"
              block
              style={{
                width: "100%",
                height: 40,
                borderRadius: 6,
              }}
            />
          </div>
        ))}
      </div>

      {showSubmitButton && (
        <div className="flex justify-end mt-4">
          <Skeleton.Button
            active
            size="large"
            style={{ width: 120, height: 40, borderRadius: 6 }}
          />
        </div>
      )}
    </div>
  );
}

export default memo(FormSkeleton);
