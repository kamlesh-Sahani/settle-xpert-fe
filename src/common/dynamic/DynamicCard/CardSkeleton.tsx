"use client";

import { memo } from "react";
import { Skeleton } from "antd";

interface CardSkeletonProps {
  count?: number;
  gridClassName?: string;
}

function CardSkeleton({ count = 6, gridClassName }: CardSkeletonProps) {
  return (
    <div className={gridClassName || "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4"}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={`skeleton-card-${idx}`}
          className="bg-background rounded-lg shadow-sm border border-border p-4 flex flex-col gap-3"
        >
          {/* Title skeleton */}
          <Skeleton.Input active size="small" style={{ width: "80%", height: 16, borderRadius: 4, marginBottom: 8 }} />
          
          {/* Key-value skeleton rows */}
          {Array.from({ length: 4 }).map((_, rowIdx) => (
            <div key={`sk-row-${idx}-${rowIdx}`} className="flex justify-between items-center gap-4">
              <Skeleton.Input active size="small" style={{ width: "30%", height: 12, borderRadius: 4 }} />
              <Skeleton.Input active size="small" style={{ width: "50%", height: 12, borderRadius: 4 }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default memo(CardSkeleton);
