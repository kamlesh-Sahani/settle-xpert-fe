"use client";

import { memo } from "react";
import { Skeleton } from "antd";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="bg-background border border-border overflow-hidden">
      {/* Header skeleton */}
      <div
        className="bg-secondary border-b border-border"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 16,
          padding: "14px 20px",
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton.Input
            key={`header-${i}`}
            active
            size="small"
            style={{ width: "70%", height: 14, borderRadius: 4 }}
          />
        ))}
      </div>

      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={`row-${rowIdx}`}
          className="border-b border-border last:border-b-0"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: 16,
            padding: "16px 20px",
            alignItems: "center",
          }}
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div
              key={`cell-${rowIdx}-${colIdx}`}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              {/* First column gets a circle (avatar placeholder) */}
              {colIdx === 0 && (
                <Skeleton.Avatar active size={32} shape="circle" />
              )}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <Skeleton.Input
                  active
                  size="small"
                  style={{
                    width: colIdx === 0 ? "80%" : `${60 + Math.random() * 30}%`,
                    height: 12,
                    borderRadius: 4,
                  }}
                />
                {colIdx === 0 && (
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: "50%", height: 10, borderRadius: 4 }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default memo(TableSkeleton);
