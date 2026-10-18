"use client";

import React, { useCallback, useMemo } from "react";
import { Empty } from "antd";
import { useApiOptions, OptionType } from "@/hooks/useApiOptions";
import SelectField, { SelectPropsType } from "@/common/form/SelectField";
import { ExclamationCircleOutlined } from "@ant-design/icons";

export interface SelectApiFieldProps extends Omit<SelectPropsType, "options"> {
  apiUrl?: string; // The endpoint to fetch data from
  apiMethod?: (params: any, config?: any) => Promise<any>; // Alternative to apiUrl: a direct api method
  method?: "GET" | "POST";
  searchParam?: string; // e.g. "search" or "q"
  labelPath?: string; // Path in the response object to use as label (defaults to "value")
  valuePath?: string; // Path in the response object to use as value (defaults to "key")
  limit?: number; // How many items to fetch per page (defaults to 50)
  debounceMs?: number; // Search debounce delay in ms (defaults to 400ms)
  extraParams?: Record<string, any>; // Additional parameters to send
  onFormatData?: (data: any[]) => any[]; // Custom formatting before processing options
  initialValue?: OptionType[] | OptionType | null; // Pre-populated key-value pairs before API opens
  refreshTrigger?: number;
}

export default function SelectApiField({
  apiUrl,
  apiMethod,
  method = "GET",
  searchParam = "search",
  labelPath,
  valuePath,
  limit = 50,
  debounceMs = 400,
  extraParams = {},
  onFormatData,
  initialValue,
  refreshTrigger,
  ...props
}: SelectApiFieldProps) {
  const {
    options,
    loading,
    loadingMore,
    hasMore: _hasMore,
    error,
    loadingMoreError,
    search,
    openDropdown,
    closeDropdown,
    handleSearch,
    loadMore,
    retryFetch,
    retryLoadMore,
  } = useApiOptions({
    apiUrl,
    apiMethod,
    method,
    searchParam,
    labelPath,
    valuePath,
    limit,
    debounceMs,
    extraParams,
    onFormatData,
    initialValue,
    refreshTrigger,
  });

  // Handler for infinite scrolling inside the Select dropdown
  const onPopupScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      // Trigger next page when within 60px of the bottom
      if (scrollHeight - scrollTop - clientHeight < 60) {
        loadMore();
      }
    },
    [loadMore]
  );

  // Only call API when dropdown opens, every time it opens
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        openDropdown();
      } else {
        closeDropdown();
      }
      props.onOpenChange?.(open);
    },
    [openDropdown, closeDropdown, props]
  );

  // Merge loading and error rows directly into the options array
  // This guarantees the spinner renders INSIDE the virtual list and never overflows outside the dropdown
  const displayOptions = useMemo(() => {
    if (loadingMore) {
      return [
        ...options,
        {
          key: "__loading_more__",
          value: (
            <div
              key="__loading_more__"
              className="flex items-center justify-center py-2 gap-2 text-xs select-none w-full cursor-default opacity-100"
            >
              <svg
                className="animate-spin text-primary w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path
                  className="opacity-90"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="font-medium text-slate-500">Loading more options...</span>
            </div>
          ) as any,
          disabled: true,
        },
      ];
    }
    if (loadingMoreError) {
      return [
        ...options,
        {
          key: "__loading_more_error__",
          value: (
            <div
              key="__loading_more_error__"
              className="flex items-center justify-center py-1.5 gap-2 text-xs text-red-500 select-none w-full cursor-default opacity-100"
            >
              <span>Failed to load more.</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  retryLoadMore();
                }}
                className="text-primary font-semibold underline hover:opacity-80 cursor-pointer ml-1"
              >
                Retry
              </span>
            </div>
          ) as any,
          disabled: true,
        },
      ];
    }
    return options;
  }, [options, loadingMore, loadingMoreError, retryLoadMore]);

  // Dynamic notFoundContent based on state
  let notFoundContent: React.ReactNode = null;
  if (loading && options.length === 0) {
    notFoundContent = (
      <div className="py-8 flex flex-col items-center justify-center gap-2.5 text-slate-400 select-none">
        <svg
          className="animate-spin text-primary w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-xs font-medium text-slate-500">Loading options...</span>
      </div>
    );
  } else if (error && options.length === 0) {
    notFoundContent = (
      <div className="py-6 flex flex-col items-center justify-center text-red-500 px-4 text-center gap-1.5 select-none">
        <ExclamationCircleOutlined className="text-xl text-red-400" />
        <span className="text-sm font-medium">Failed to load options</span>
        <span className="text-xs text-slate-400 max-w-[220px] truncate">{error}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            retryFetch();
          }}
          className="mt-2 px-3 py-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  } else {
    notFoundContent = (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={search ? "No matches found" : "No data available"}
        className="my-4"
      />
    );
  }

  return (
    <SelectField
      showSearch
      filterOption={false}
      onSearch={handleSearch}
      onPopupScroll={onPopupScroll}
      onOpenChange={handleOpenChange}
      notFoundContent={notFoundContent}
      options={displayOptions}
      fieldNames={{
        label: "value",
        value: "key",
      }}
      {...props}
    />
  );
}
