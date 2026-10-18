import type { TableColumnType as AntColumnType } from "antd";
import type { TableColumnType, TableCellType } from "../types";
import { isNotEmpty, isNotEmptyArray } from "@/common/utils/main.utils";
import CompositeCell from "../renderers/CompositeCell";
import FilterControl from "../../FilterControl";

export function buildColumns(
  columns: TableColumnType[],
  onActionClick?: (data: any, record?: any) => void,
  columnFilters?: any
): AntColumnType<Record<string, TableCellType[]>>[] {
  if (!isNotEmptyArray(columns)) return [];

  return columns
    .map((col) => {
      const activeFilter = columnFilters?.[col.id];
      const hasActiveValue = isNotEmpty(activeFilter?.value);
      
      let filterProps: any = {};
      const isFilterable =
        col.id !== "actions" &&
        col.filterable !== false &&
        Boolean(col.type);

      if (isFilterable) {
        filterProps = {
          filteredValue: hasActiveValue ? [JSON.stringify(activeFilter)] : null,
          filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => {
            const parsedCurrent = (() => {
              if (selectedKeys && selectedKeys[0]) {
                try {
                  return JSON.parse(selectedKeys[0]);
                } catch (e) {
                  console.error("Failed to parse selectedKeys", e);
                }
              }
              if (hasActiveValue) {
                return activeFilter;
              }
              return { operator: "", value: "" };
            })();
            
            return (
              <div 
                onKeyDown={(e) => e.stopPropagation()} 
                className="bg-white dark:bg-zinc-950 rounded-lg shadow-xl border border-slate-100 dark:border-zinc-800 p-3 w-[210px]"
              >
                <FilterControl
                  field={col}
                  current={parsedCurrent}
                  onChange={(val) => {
                    if (isNotEmpty(val?.value)) {
                      setSelectedKeys([JSON.stringify(val)]);
                    } else {
                      setSelectedKeys([]);
                    }
                  }}
                  onApply={() => confirm({ closeDropdown: true })}
                  onReset={() => {
                    setSelectedKeys([]);
                    if (clearFilters) {
                      clearFilters({ confirm: true, closeDropdown: true });
                    }
                    confirm({ closeDropdown: true });
                  }}
                  onClear={() => {
                    setSelectedKeys([]);
                    if (clearFilters) {
                      clearFilters({ confirm: true, closeDropdown: false });
                    }
                    confirm({ closeDropdown: false });
                  }}
                  variant="dropdown"
                />
              </div>
            );
          },
          filterIcon: (filtered: boolean) => (
            <span style={{ color: filtered ? 'var(--primary)' : undefined }}>
              <svg viewBox="64 64 896 896" focusable="false" data-icon="filter" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <path d="M349 838c0 17.7 14.2 32 31.8 32h262.4c17.6 0 31.8-14.3 31.8-32V642H349v196zm531.1-684H143.9c-24.5 0-39.8 26.7-27.5 48l221.3 376h352.6l221.3-376c12.2-21.3-3.1-48-27.5-48z"></path>
              </svg>
            </span>
          ),
        };
      }

      return {
        title: col.title,
        dataIndex: col.id,
        key: col.id,
        fixed: col.fixed as "left" | "right" | undefined,
        width: col.width ?? 280,
        ellipsis: col.ellipsis,
        sorter: col.sortable,
        ...filterProps,
        render: (cells: TableCellType[], record: any) => {
          if (!isNotEmptyArray(cells)) return null;
          return <CompositeCell cells={cells} record={record} onActionClick={onActionClick} />;
        },
      };
    });
}
