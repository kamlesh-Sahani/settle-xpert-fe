"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { ConfigProvider, Table } from "antd";
import { buildColumns } from "./utils/buildColumns";
import TableSkeleton from "./components/TableSkeleton";
import EmptyState from "./components/EmptyState";
import ScrollbarHeightControl, { getScrollbarHeight } from "./components/ScrollbarHeightControl";
import { ErrorApi } from "@/common/ui/ErrorApi";
import { TABLE_THEME, PAGE_SIZE_OPTIONS, INITIAL_TABLE_PAYLOAD } from "./utils/constants";
import type { StaticTableProps, TableCellType, TablePayloadType } from "./types";
import classNames from "classnames";
import { isArray, isNotEmptyArray, isNotEmpty } from "@/common/utils/main.utils";
import { useGridFilters } from "@/hooks/useGridFilters";

export default function StaticTable({
  staticData,
  refreshTrigger: _refreshTrigger,
  onActionClick,
  className,
  filterKey,
  loading = false,
  error,
  onRetry,
  bordered = true,
  ...tableProps
}: StaticTableProps) {
  // ─── Pagination, sort, search state ───────────────────────────────────────
  const [params, setParams] = useState<TablePayloadType>({ ...INITIAL_TABLE_PAYLOAD });

  // Use filterKey if provided, else use local state
  const [filters, setFilters] = useGridFilters(filterKey || "local-static-table");

  // ─── Search debounce ──────────────────────────────────────────────────────
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeFiltersStr = JSON.stringify(
    filters?.isFilterActive !== false && filters?.columnFilters
      ? Object.fromEntries(
        Object.entries(filters.columnFilters).filter(
          ([_, f]: any) => f?.value !== undefined && f?.value !== ""
        )
      )
      : {}
  );

  // ─── Reset page on filter or search change ────────────────────────────────
  const prevFiltersRef = useRef(activeFiltersStr);
  const prevSearchRef = useRef(filters?.tableSearch);

  useEffect(() => {
    if (prevFiltersRef.current !== activeFiltersStr || prevSearchRef.current !== filters?.tableSearch) {
      prevFiltersRef.current = activeFiltersStr;
      prevSearchRef.current = filters?.tableSearch;
      setParams((prev) => ({ ...prev, page: 1 }));
    }
  }, [activeFiltersStr, filters?.tableSearch]);

  // Sync features and columns to global filters just like dynamic table
  useEffect(() => {
    if (staticData) {
      setFilters({
        features: staticData.features,
        extraData: staticData.extraData,
        tableCount: staticData.totalRows,
        columns: staticData.columns,
        tableLoading: loading
      });
    }
  }, [staticData, loading, setFilters]);

  // ─── Memoized columns ────────────────────────────────────────────────────
  const columns = useMemo(() => {
    const rawColumns = staticData?.columns || [];
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
  }, [staticData?.columns, filters?.hiddenColumns, filters?.columnOrder, filters?.columnFilters, onActionClick]);

  // ─── Local Filtering, Sorting and Pagination ────────────────────────────────
  const processedRows = useMemo(() => {
    let rawRows = staticData?.rows ?? [];

    // 1. Search (global text search across all TEXT cells)
    const searchTerm = filters?.tableSearch?.toLowerCase();
    if (searchTerm) {
      rawRows = rawRows.filter(row => {
        return Object.values(row).some(cells => {
          return cells.some(cell => {
            if (cell.type === "TEXT" && cell.title?.toLowerCase().includes(searchTerm)) return true;
            if (cell.type === "LINK" && cell.title?.toLowerCase().includes(searchTerm)) return true;
            if (cell.type === "STATUS" && cell.title?.toLowerCase().includes(searchTerm)) return true;
            return false;
          });
        });
      });
    }

    // 3. Sorting
    if (params.sortBy && params.order) {
      rawRows = [...rawRows].sort((a, b) => {
        const cellA = a[params.sortBy]?.[0];
        const cellB = b[params.sortBy]?.[0];

        let valA = "";
        let valB = "";

        if (cellA?.type === "TEXT" || cellA?.type === "LINK" || cellA?.type === "STATUS") {
          valA = cellA.title || "";
        }
        if (cellB?.type === "TEXT" || cellB?.type === "LINK" || cellB?.type === "STATUS") {
          valB = cellB.title || "";
        }

        if (valA < valB) return params.order === "asc" ? -1 : 1;
        if (valA > valB) return params.order === "asc" ? 1 : -1;
        return 0;
      });
    }

    // 4. Pagination
    if (staticData?.isPaginated) {
      // If the data is already paginated by the parent, just use it
      return rawRows;
    } else {
      // Client side pagination
      const start = (params.page - 1) * params.limit;
      const end = start + params.limit;
      return rawRows.slice(start, end);
    }
  }, [staticData?.rows, staticData?.isPaginated, params.page, params.limit, params.sortBy, params.order, filters?.tableSearch]);

  // ─── Memoized rows with stable keys ───────────────────────────────────────
  const rows = useMemo(() => {
    return processedRows.map((row: Record<string, TableCellType[]>, index: number) => ({
      ...row,
      _rowKey: `row-${params.page}-${index}`,
    }));
  }, [processedRows, params.page]);

  // ─── Total count ──────────────────────────────────────────────────────────
  const total = staticData?.isPaginated ? staticData.totalRows : (filters?.tableSearch ? processedRows.length : staticData?.totalRows ?? 0);

  // ─── Table change handler (pagination + sorting + filtering) ──────────────
  const handleTableChange = useCallback(
    (
      pagination: { current?: number; pageSize?: number },
      _filters: any,
      sorter: any
    ) => {
      const singleSorter = isArray(sorter) ? sorter[0] : sorter;

      setParams((prev) => ({
        ...prev,
        page: pagination.current ?? prev.page,
        limit: pagination.pageSize ?? prev.limit,
        sortBy: singleSorter?.field?.toString() ?? "",
        order: singleSorter?.order === "ascend"
          ? "asc"
          : singleSorter?.order === "descend"
            ? "desc"
            : "",
      }));

      // Map Ant Design _filters to our global columnFilters state
      if (_filters) {
        const newColumnFilters = { ...(filters?.columnFilters || {}) };
        let hasChanges = false;

        Object.keys(_filters).forEach((key) => {
          const val = _filters[key];

          if (isNotEmptyArray(val)) {
            try {
              const columnConfig = staticData?.columns?.find((c: any) => c.id === key);
              const isSelect = columnConfig?.type === "SELECT" || isNotEmptyArray(columnConfig?.options);
              const defaultOperator = isSelect ? "equal" : "contains";
              const parsed = JSON.parse(String(val[0]));
              if (isNotEmpty(parsed.value)) {
                newColumnFilters[key] = {
                  operator: parsed.operator || defaultOperator,
                  value: parsed.value,
                };
                hasChanges = true;
              } else if (newColumnFilters[key]) {
                delete newColumnFilters[key];
                hasChanges = true;
              }
            } catch (e) {
              console.error("Failed to parse column filter", e);
            }
          } else if (newColumnFilters[key]) {
            delete newColumnFilters[key];
            hasChanges = true;
          }
        });

        if (hasChanges) {
          setFilters({ columnFilters: newColumnFilters });
        }
      }
    },
    [filters?.columnFilters, staticData?.columns, setFilters]
  );

  // ─── Cleanup debounce timer ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  // ─── Dynamic scroll height via ResizeObserver ─────────────────────────────
  const [scrollY, setScrollY] = useState<number>(400);
  const observerRef = useRef<ResizeObserver | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);

  const tableWrapperRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    tableRef.current = node;

    if (node) {
      observerRef.current = new ResizeObserver((entries) => {
        const height = entries[0]?.contentRect?.height ?? 400;
        const available = Math.max(height - 100, 200);
        setScrollY(available);
      });
      observerRef.current.observe(node);
    }
  }, []);

  // ─── Virtual scrollbar: always visible + configurable height ──────────────
  const [scrollbarHeight, setScrollbarHeight] = useState(getScrollbarHeight);
  const [showScrollbarControl, setShowScrollbarControl] = useState(false);

  const applyScrollbarStyles = useCallback(() => {
    if (!tableRef.current || rows.length === 0) return;

    const scrollDiv = tableRef.current.querySelector<HTMLElement>('.ant-table-tbody-virtual-holder-inner');
    const xScrollThumb = tableRef.current.querySelector<HTMLElement>(
      '.ant-table-tbody-virtual-scrollbar-horizontal .ant-table-tbody-virtual-scrollbar-thumb'
    );

    if (xScrollThumb && scrollDiv) {
      const hasOverflow = (scrollDiv.scrollWidth - scrollDiv.clientWidth) >= 5;
      xScrollThumb.style.display = hasOverflow ? 'block' : 'none';
      setShowScrollbarControl(hasOverflow);
    }

    const hScrollBar = tableRef.current.querySelector<HTMLElement>(
      '.ant-table-tbody-virtual-scrollbar-horizontal'
    );
    if (hScrollBar) {
      hScrollBar.style.setProperty('height', `${scrollbarHeight}px`, 'important');
      hScrollBar.style.setProperty('visibility', 'visible', 'important');
      hScrollBar.style.setProperty('opacity', '1', 'important');
    }
  }, [rows, scrollbarHeight]);

  useEffect(() => {
    applyScrollbarStyles();
  }, [rows, columns, loading, scrollbarHeight, applyScrollbarStyles]);

  const handleScrollbarHeightChange = useCallback((height: number) => {
    setScrollbarHeight(height);
  }, []);

  // ─── Initial loading state (no data yet) ──────────────────────────────────
  if (loading && rows.length === 0) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <TableSkeleton rows={params.limit} columns={columns.length || 4} />
      </div>
    );
  }

  if (error && !isNotEmptyArray(staticData?.columns)) {
    return (
      <div className="py-12 w-full flex justify-center">
        <ErrorApi message={error} onRetry={onRetry} />
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
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: "max-content", y: scrollY }}
          size="small"
          pagination={
            total > 0
              ? {
                current: params.page,
                pageSize: params.limit,
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
              : false
          }
          footer={!staticData?.isPaginated && total > 0 ? () => (
            <div className="flex items-center gap-2 bg-background m-0">
              {showScrollbarControl && (
                <ScrollbarHeightControl onApply={handleScrollbarHeightChange} currentHeight={scrollbarHeight} />
              )}
              <span className="text-text-secondary font-medium text-sm">
                Showing {total} entries
              </span>
            </div>
          ) : undefined}
          locale={{ emptyText: <EmptyState msg="No Data Found" /> }}
        />
      </ConfigProvider>
    </div >
  );
}
