"use client";

import { memo } from "react";
import type { CardDataItem } from "../types";

interface CardItemProps {
  data: CardDataItem;
}

function CardItem({ data }: CardItemProps) {
  const { title, info } = data;

  return (
    <div className="bg-background rounded p-3 flex flex-col gap-2 min-w-0 cursor-pointer border border-border ">
      {title && (
        <div
          className="text-[14px] font-semibold text-primary-800 dark:text-zinc-100 leading-snug tracking-tight line-clamp-2"
          title={title}
        >
          {title}
        </div>
      )}

      {/* ─── Key-Value Fields ────────────────────────────── */}
      {info?.length > 0 && (
        <div className="flex flex-col gap-2 pt-1 min-w-0">
          {info.map((item) => (
            <div key={item.key} className="grid grid-cols-[100px_1fr] gap-x-2 text-[13px] leading-relaxed min-w-0 text-primary-300">
              <span className="text-text-primary font-normal truncate text-[12px]" title={item.key}>
                {item.key} -
              </span>
              <span className="text-text-secondary font-normal truncate min-w-0 text-[12px]" title={item.value}>
                {item.value || "NA"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(CardItem);
