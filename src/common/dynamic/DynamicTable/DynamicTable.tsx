"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { ConfigProvider, Table, Spin } from "antd";
import api from "@/common/utils/api";
import { useFetch } from "@/hooks/useFetch";
import { buildColumns } from "./utils/buildColumns";
import { buildTablePayload, parseAntdFilters } from "./utils/tableUtils";
import TableSkeleton from "./components/TableSkeleton";
import EmptyState from "./components/EmptyState";
import ScrollbarHeightControl, { getScrollbarHeight } from "./components/ScrollbarHeightControl";
import { ErrorApi } from "@/common/ui/ErrorApi";
import { TABLE_THEME, PAGE_SIZE_OPTIONS, INITIAL_TABLE_PAYLOAD, } from "./utils/constants";
import type { DynamicTableProps, TableResponseType, TablePayloadType } from "./types";
import classNames from "classnames";
import { isArray, isNotEmpty, isNotEmptyArray, isNotEmptyObject } from "@/common/utils/main.utils";
import { useGridFilters } from "@/hooks/useGridFilters";

export default function DynamicTable({
  apiData,
  onActionClick,
  className,
  filterKey,
  paginationType = "offset",
  bordered = true,
  refreshTrigger,
  ...tableProps
}: DynamicTableProps) {
  // ─── Pagination, sort, search state ───────────────────────────────────────
  const [payload, setPayload] = useState<TablePayloadType>(INITIAL_TABLE_PAYLOAD);
  const [isFirstCall, setIsFirstCall] = useState(true);
  const [filters, setFilters] = useGridFilters(filterKey);

  // ─── Dynamic scroll height via ResizeObserver ─────────────────────────────
  const [scrollY, setScrollY] = useState<number>(400);
  const observerRef = useRef<ResizeObserver | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);

  const activeFiltersObj = useMemo(() => {

    if (filters?.isFilterActive === false || !isNotEmptyObject(filters?.columnFilters)) return {};

    const obj: Record<string, any> = {};
    Object.entries(filters.columnFilters).forEach(([k, f]: [string, any]) => {
      if (isNotEmpty(f?.value)) {
        obj[k] = f;
      }
    });
    return obj;
  }, [filters?.isFilterActive, filters?.columnFilters]);


  // ─── Reset page to 1 when search query changes ────────────────────────────
  const prevSearchRef = useRef<string | undefined>(filters?.tableSearch);

  const effectivePayload = useMemo(() => {
    // When the employee inputs a new search query, start from page 1
    if (prevSearchRef.current !== filters?.tableSearch) {
      return { ...payload, page: 1, cursor: "" };
    }
    return payload;
  }, [payload, filters?.tableSearch]);

  useEffect(() => {
    if (prevSearchRef.current !== filters?.tableSearch) {
      prevSearchRef.current = filters?.tableSearch;
      setPayload((prev) => {
        if (prev.page === 1 && !prev.cursor) return prev;
        return { ...prev, page: 1, cursor: "" };
      });
    }
  }, [filters?.tableSearch]);

  const { postBody } = useMemo(() => {
    return buildTablePayload({
      apiData,
      payload: effectivePayload,
      tableSearch: filters?.tableSearch,
      activeFiltersObj,
      paginationType,
    });
  }, [apiData, effectivePayload, filters?.tableSearch, activeFiltersObj, paginationType]);

  // ─── Data fetching ────────────────────────────────────────────────────────
  const response = useFetch<TableResponseType>({
    client: api.post,
    url: apiData?.apiUrl,
    body: postBody,
    onSuccess: (data: any) => {
      if (!isNotEmptyObject(data?.data)) return;
      const { features, extraData, totalRows: count, filters: backendFilters } = data.data;
      if (data?.success && isFirstCall) {
        setIsFirstCall(false);
      }
      setFilters({ features, extraData, tableCount: count, backendFilters, columns: data.data.columns, apiUrl: apiData?.apiUrl, apiType: "post", paginationType, postBody });
    }
  });

  const [accumulatedRows, setAccumulatedRows] = useState<any[]>([]);

  useEffect(() => {
    const rawRows = response?.data?.data?.rows || [];
    const processedRows = rawRows.map((row: any, index: number) => ({
      ...row,
      _rowKey: row._rowKey || `row-${payload.page}-${payload.cursor}-${index}`,
    }));

    if (paginationType === "cursor") {
      if (!payload.cursor) {
        setAccumulatedRows(processedRows); // Initial load or reset
      } else {
        setAccumulatedRows((prev) => {
          return [...prev, ...processedRows];
        });
      }
    } else {
      setAccumulatedRows(processedRows); // Offset pagination always replaces
    }
  }, [response?.data?.data?.rows, paginationType, payload.cursor, payload.page]);

  const rows = accumulatedRows;

  // ─── Sync Loading State to Global Filters ─────────────────────────────────
  useEffect(() => {
    setFilters({
      tableLoading: response.loading,
      refresh: () => {
        setIsFirstCall(true);
        response?.refetch();
        setPayload(INITIAL_TABLE_PAYLOAD);
      }
    });
  }, [response.loading]);

  // ─── External Refresh Trigger ─────────────────────────────────────────────
  const isFirstMountRef = useRef(true);
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    if (refreshTrigger !== undefined) {
      response?.refetch();
    }
  }, [refreshTrigger]);

  // ─── Memoized columns ────────────────────────────────────────────────────
  const columns = useMemo(() => {
    const rawColumns = response.data?.data?.columns || [];
    let processed = buildColumns(rawColumns, onActionClick, filters?.columnFilters);

    if (isNotEmptyArray(filters?.hiddenColumns)) {
      processed = processed.filter(c => !filters.hiddenColumns.includes(String(c.key) || String(c.dataIndex)));
    }

    // Apply column order if available
    if (isArray(filters?.columnOrder)) {
      const orderMap = new Map(filters.columnOrder.map((id: any, index: number) => [id, index]));
      processed = [...processed].sort((a, b) => {
        const idA = String(a.key || a.dataIndex);
        const idB = String(b.key || b.dataIndex);
        const indexA = orderMap.has(idA) ? orderMap.get(idA) : 9999;
        const indexB = orderMap.has(idB) ? orderMap.get(idB) : 9999;
        return (indexA as number) - (indexB as number);
      });
    }

    return processed;
  }, [response.data?.data?.columns, filters?.hiddenColumns, filters?.columnOrder, filters?.columnFilters, onActionClick]);




  // ─── Total count ──────────────────────────────────────────────────────────
  const total = response.data?.data?.totalRows ?? 0;

  // ─── Table change handler (pagination + sorting + filtering) ──────────────
  const handleTableChange = useCallback(
    (
      pagination: { current?: number; pageSize?: number },
      _filters: any,
      sorter: any
    ) => {
      const singleSorter = isArray(sorter) ? sorter[0] : sorter;

      setPayload((prev) => ({
        ...prev,
        page: pagination.current ?? prev.page,
        limit: pagination.pageSize ?? prev.limit,
        cursor: "", // ALWAYS reset cursor when table pagination or sort changes
        sortBy: singleSorter?.field?.toString() ?? "",
        order: singleSorter?.order === "ascend"
          ? "asc"
          : singleSorter?.order === "descend"
            ? "desc"
            : "",
      }));

      // Map Ant Design _filters to our global columnFilters state
      if (_filters) {
        const { newColumnFilters, hasChanges } = parseAntdFilters(
          _filters,
          filters?.columnFilters,
          response.data?.data?.columns || []
        );

        if (hasChanges) {
          setFilters({ columnFilters: newColumnFilters });
        }
      }
    },
    [filters?.columnFilters, response.data?.data?.columns, setFilters]
  );


  const tableWrapperRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    tableRef.current = node;

    if (node) {
      observerRef.current = new ResizeObserver((entries) => {
        const height = entries[0]?.contentRect?.height ?? 400;
        // Reserve: table header ~55px, pagination ~56px, border/padding ~10px
        const available = Math.max(height - 100, 200);
        setScrollY(available);
      });
      observerRef.current.observe(node);
    }
  }, []);

  // ─── Infinite Scroll Handler ──────────────────────────────────────────────
  const nextCursor = response.data?.data?.nextCursor;

  const handleScroll = useCallback((e: Event) => {
    if (paginationType !== "cursor") return;
    const target = e.target as HTMLElement;
    // Check if we are near the bottom
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
      if (!response.loading && nextCursor && nextCursor !== payload.cursor) {
        setPayload((prev) => ({ ...prev, cursor: nextCursor }));
      }
    }
  }, [paginationType, response.loading, nextCursor, payload.cursor]);

  useEffect(() => {
    if (paginationType !== "cursor" || !tableRef.current) return;

    // The scrollable container for Ant Design virtual table
    const scrollContainer = tableRef.current.querySelector('.ant-table-body, .ant-table-tbody-virtual-holder');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [paginationType, handleScroll, rows.length]);

  // ─── Virtual scrollbar: always visible + configurable height ──────────────
  const [scrollbarHeight, setScrollbarHeight] = useState(getScrollbarHeight);
  const [showScrollbarControl, setShowScrollbarControl] = useState(false);

  const applyScrollbarStyles = useCallback(() => {
    if (!tableRef.current || rows.length === 0) return;

    // Check if content actually overflows horizontally
    const scrollDiv = tableRef.current.querySelector<HTMLElement>('.ant-table-tbody-virtual-holder-inner');
    const xScrollThumb = tableRef.current.querySelector<HTMLElement>(
      '.ant-table-tbody-virtual-scrollbar-horizontal .ant-table-tbody-virtual-scrollbar-thumb'
    );

    const hasOverflow = scrollDiv ? (scrollDiv.scrollWidth - scrollDiv.clientWidth) >= 5 : false;

    if (xScrollThumb && scrollDiv) {
      xScrollThumb.style.display = hasOverflow ? 'block' : 'none';
      setShowScrollbarControl(hasOverflow);
    }

    // Force the virtual horizontal scrollbar to be visible and apply height ONLY if overflowing
    const hScrollBar = tableRef.current.querySelector<HTMLElement>(
      '.ant-table-tbody-virtual-scrollbar-horizontal'
    );
    if (hScrollBar) {
      if (hasOverflow) {
        hScrollBar.style.setProperty('display', 'block', 'important');
        hScrollBar.style.setProperty('height', `${scrollbarHeight}px`, 'important');
        hScrollBar.style.setProperty('visibility', 'visible', 'important');
        hScrollBar.style.setProperty('opacity', '1', 'important');
      } else {
        hScrollBar.style.setProperty('display', 'none', 'important');
        hScrollBar.style.setProperty('height', '0px', 'important');
        hScrollBar.style.setProperty('visibility', 'hidden', 'important');
        hScrollBar.style.setProperty('opacity', '0', 'important');
      }
    }
  }, [rows, scrollbarHeight]);

  useEffect(() => {
    applyScrollbarStyles();
  }, [rows, columns, response.data, response.loading, scrollbarHeight, applyScrollbarStyles]);

  const handleScrollbarHeightChange = useCallback((height: number) => {
    setScrollbarHeight(height);
  }, []);

  const xScroll = useMemo(() => {
    const calculatedWidth = columns.reduce((acc, col) => acc + (Number(col.width) || 150), 0);
    return Math.max(calculatedWidth, 800); // Minimum 800 to prevent squishing
  }, [columns]);

  // ─── Initial loading state (no data yet) ──────────────────────────────────
  if (response.loading && isFirstCall) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <TableSkeleton rows={payload.limit} columns={columns.length || 4} />
      </div>
    );
  }
  if (response.error && !isNotEmptyArray(response.data?.data?.columns)) {
    return (
      <div className="py-12 w-full flex justify-center">
        <ErrorApi message={response.error} onRetry={response.refetch} />
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className={classNames("h-full w-full min-h-2 flex flex-col dynamic-table-container", className)}
      ref={tableWrapperRef}
      style={{ "--table-scroll-y": `${scrollY}px` } as React.CSSProperties}
    >
      <ConfigProvider
        theme={{ components: { Table: TABLE_THEME } }}
      >
        <Table<any>
          {...tableProps}
          virtual
          bordered={bordered}
          columns={columns}
          dataSource={rows}
          rowKey="_rowKey"
          loading={paginationType === "cursor" ? (response.loading && rows.length === 0) : response.loading}
          onChange={handleTableChange}
          scroll={{ x: xScroll, y: scrollY }}
          size="small"
          pagination={
            paginationType === "cursor"
              ? false
              : (total > 0
                ? {
                  current: payload.page,
                  pageSize: payload.limit,
                  total,
                  showSizeChanger: true,
                  pageSizeOptions: PAGE_SIZE_OPTIONS as unknown as string[],
                  className: "px-6 py-3 border-t border-border m-0",
                  showTotal: (totalCount, range) => (
                    <div className="flex items-center gap-2">
                      {showScrollbarControl && (
                        <ScrollbarHeightControl onApply={handleScrollbarHeightChange} currentHeight={scrollbarHeight} />
                      )}
                      <span className="text-text-secondary font-medium text-sm">
                        Showing {range[0]} to {range[1]} of {totalCount} entries
                      </span>
                    </div>
                  ),
                }
                : false)
          }
          footer={
            paginationType === "cursor"
              ? () => (
                <div className="flex items-center justify-between px-2 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    {showScrollbarControl && (
                      <ScrollbarHeightControl onApply={handleScrollbarHeightChange} currentHeight={scrollbarHeight} />
                    )}
                  </div>
                  <div>
                    {rows.length > 0 && (
                      <div className="flex items-center gap-2">
                        {response.loading && <Spin size="small" />}
                        <span>
                          {nextCursor
                            ? `Showing ${rows.length} of Many results`
                            : `Showing all ${rows.length} of ${rows.length} results`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
              : undefined
          }
          locale={{ emptyText: <EmptyState msg={response.error || response.data?.message || "No Data Found"} /> }}
        />
      </ConfigProvider>
    </div>
  );
}