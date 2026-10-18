"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import api from "@/common/utils/api";
import { useFetch } from "@/hooks/useFetch";
import LoadingSpinner from "@/common/basic/LoadingSpinner";
import { useGridFilters } from "@/hooks/useGridFilters";
import { isNotEmptyArray, isNotEmptyObject } from "@/common/utils/main.utils";
import CardSkeleton from "./CardSkeleton";
import CardItem from "./components/CardItem";
import EmptyState from "../DynamicTable/components/EmptyState";
import { ErrorApi } from "@/common/ui/ErrorApi";
import type { DynamicCardProps, CardDataItem, CardResponseType } from "./types";
import classNames from "classnames";

const DEFAULT_PAGE_SIZE = 20;

export default function DynamicCard({
  apiData,
  refreshTrigger = 0,
  filterKey,
  className,
  gridClassName,
  pageSize = DEFAULT_PAGE_SIZE,
}: DynamicCardProps) {
  // ─── Pagination state ───────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [accumulatedRows, setAccumulatedRows] = useState<CardDataItem[]>([]);
  const [totalRows, setTotalRows] = useState(0);

  // ─── Grid filters (search synced with DynamicHeader) ────────────────────────
  const [filters, setFilters] = useGridFilters(filterKey);
  const [localSearch, setLocalSearch] = useState(filters?.tableSearch || "");

  // ─── Refs ───────────────────────────────────────────────────────────────────
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevRefreshRef = useRef(refreshTrigger);

  // ─── Build fetch options ────────────────────────────────────────────────────
  const apiDataParamsKey = JSON.stringify(apiData?.params);
  const activeFiltersStr = JSON.stringify(
    filters?.isFilterActive !== false && filters?.columnFilters
      ? Object.fromEntries(
          Object.entries(filters.columnFilters).filter(
            ([_, f]: any) => f?.value !== undefined && f?.value !== ""
          )
        )
      : {}
  );

  const fetchOptions = useMemo(
    () => {
      const queryParams: Record<string, string> = {
        page: String(page),
        limit: String(pageSize),
        search: localSearch,
      };
      if (activeFiltersStr !== "{}") {
        queryParams.filters = activeFiltersStr;
      }
      return {
        params: {
          ...(apiData?.params ?? {}),
          ...queryParams,
        },
      };
    },
    [apiDataParamsKey, page, pageSize, localSearch, activeFiltersStr]
  );

  // ─── Data fetching ─────────────────────────────────────────────────────────
  const response = useFetch<CardResponseType>({
    client: api[apiData?.apiType ?? "get"],
    url: apiData?.apiUrl,
    options: fetchOptions,
    onSuccess: (data: any) => {
      if (!isNotEmptyObject(data?.data)) return;
      const { rows, totalRows: total, filters: backendFilters } = data.data;

      // Set total count
      if (total !== undefined) {
        setTotalRows(total);
      }

      // Append or replace rows
      if (isNotEmptyArray(rows)) {
        setAccumulatedRows((prev) => (page === 1 ? rows : [...prev, ...rows]) as any);
      } else if (page === 1) {
        setAccumulatedRows([]);
      }

      // Sync to global filter store
      if (data?.success) {
        setFilters({ tableCount: total, backendFilters });
      }
    },
  });

  // ─── Sync loading state to global filters ──────────────────────────────────
  useEffect(() => {
    setFilters({ tableLoading: response.loading });
  }, [response.loading]);

  // ─── Reset on search change ────────────────────────────────────────────────
  useEffect(() => {
    const currentSearch = filters?.tableSearch || "";
    if (currentSearch !== localSearch) {
      setLocalSearch(currentSearch);
      setPage(1);
      setAccumulatedRows([]);
    }
  }, [filters?.tableSearch, localSearch]);

  // ─── Reset on filter change ────────────────────────────────────────────────
  const prevFiltersRef = useRef(activeFiltersStr);
  useEffect(() => {
    if (prevFiltersRef.current !== activeFiltersStr) {
      prevFiltersRef.current = activeFiltersStr;
      setPage(1);
      setAccumulatedRows([]);
    }
  }, [activeFiltersStr]);

  // ─── Refresh on trigger ────────────────────────────────────────────────────
  useEffect(() => {
    if (refreshTrigger > 0 && refreshTrigger !== prevRefreshRef.current) {
      prevRefreshRef.current = refreshTrigger;
      setAccumulatedRows([]);
      if (page === 1) {
        response.refetch();
      } else {
        setPage(1);
      }
    }
  }, [refreshTrigger, page]);

  // ─── Computed state ────────────────────────────────────────────────────────
  const hasMore = accumulatedRows.length < totalRows;
  const isLoadingMore = response.loading && page > 1;

  // ─── Infinite scroll via IntersectionObserver ──────────────────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasMore && !response.loading) {
          setPage((prev) => prev + 1);
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, response.loading]);

  // ─── Initial loading state (no data yet) ───────────────────────────────────
  if (response.loading && !isNotEmptyArray(accumulatedRows)) {
    return (
      <div className="h-full w-full overflow-hidden">
        <CardSkeleton count={pageSize > 12 ? 12 : pageSize} gridClassName={gridClassName} />
      </div>
    );
  }

  // ─── Error state (no data at all) ──────────────────────────────────────────
  if (response.error && !isNotEmptyArray(accumulatedRows)) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8">
        <ErrorApi message={response.error} onRetry={response.refetch} />
      </div>
    );
  }

  // ─── Empty state ───────────────────────────────────────────────────────────
  if (!response.loading && !isNotEmptyArray(accumulatedRows)) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8">
        <EmptyState msg={response.error || response.data?.message || "No Data Found"} />
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className={classNames("h-full w-full flex flex-col min-h-0", className)}
    >
      {/* ─── Scrollable Container ────────────────────────── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
      >
        {/* ─── Card Grid ──────────────────────────────────── */}
        <div
          className={classNames(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
            gridClassName
          )}
        >
          {accumulatedRows.map((item, index) => {
            let filteredItem = item;
            if (isNotEmptyArray(filters?.hiddenColumns) || isNotEmptyArray(filters?.columnOrder)) {
              let processedInfo = item.info ? [...item.info] : [];
              if (isNotEmptyArray(filters?.hiddenColumns)) {
                processedInfo = processedInfo.filter((i) => !filters.hiddenColumns.includes(i.key));
              }
              if (isNotEmptyArray(filters?.columnOrder)) {
                const orderMap = new Map(filters.columnOrder.map((id: any, idx: number) => [id, idx]));
                processedInfo.sort((a, b) => {
                  const indexA = orderMap.has(a.key) ? orderMap.get(a.key) : 9999;
                  const indexB = orderMap.has(b.key) ? orderMap.get(b.key) : 9999;
                  return (indexA as number) - (indexB as number);
                });
              }
              filteredItem = { ...item, info: processedInfo };
            }
            return <CardItem key={`card-${index}`} data={filteredItem} />;
          })}
        </div>

        {/* ─── Load More Indicator ─────────────────────────── */}
        {isLoadingMore && (
          <div className="flex items-center justify-center gap-2 py-6 w-full shrink-0">
            <LoadingSpinner indicator={<LoadingOutlined spin style={{ fontSize: 24 }} />} />
            <span className="text-sm text-text-secondary">Loading more...</span>
          </div>
        )}

        {/* ─── Scroll Sentinel (triggers next page) ─────────── */}
        {hasMore && <div ref={sentinelRef} className="h-5 w-full shrink-0" />}

        {/* ─── End of Results ──────────────────────────────── */}
        {!hasMore && isNotEmptyArray(accumulatedRows) && (
          <div className="flex justify-center py-8 text-xs text-slate-400 dark:text-zinc-500 w-full shrink-0">
            <span>
              Showing all {accumulatedRows.length} {totalRows ? `of ${totalRows}` : ""} results
            </span>
          </div>
        )}
      </div>
    </div>
  );
}