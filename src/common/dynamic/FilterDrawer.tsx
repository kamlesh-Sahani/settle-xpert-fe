"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Drawer, Switch, Button } from "antd";
import { FilterOutlined, DownOutlined } from "@ant-design/icons";
import { useGridFilters } from "@/hooks/useGridFilters";
import classNames from "classnames";
import { isNotEmptyArray, isNotEmptyObject } from "@/common/utils/main.utils";
import FilterControl from "./FilterControl";
import type { TableColumnType } from "./DynamicTable/types";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filterKey: string;
}

export default function FilterDrawer({ isOpen, onClose, filterKey }: FilterDrawerProps) {
  const [filters, setFilters] = useGridFilters<any>(filterKey);

  // Available filters from backend columns
  const availableFilters = useMemo<TableColumnType[]>(() => {
    if (isNotEmptyArray(filters?.columns)) {
      return filters.columns
        .filter((c: any) => c.id && c.title && c.id !== "actions")
        .map((c: any) => ({
          ...c,
          type: c.type || "TEXT",
        }));
    }
    return [];
  }, [filters?.columns]);



  // Local state for the filter fields
  const [localFilters, setLocalFilters] = useState<Record<string, { operator: string; value: any }>>({});
  const [isFilterActive, setIsFilterActive] = useState(true);

  // Accordion expanded states
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  // Sync state when drawer opens
  useEffect(() => {
    if (isOpen) {
      const activeFilters = filters?.columnFilters || {};
      setLocalFilters(activeFilters);
      setIsFilterActive(filters?.isFilterActive !== false);

      // Default expand the first filter field if none are active
      if (isNotEmptyArray(availableFilters)) {
        const firstId = availableFilters[0].id;
        const initialExpanded: Record<string, boolean> = {};

        // Expand fields that have values, otherwise just expand the first one
        let hasActiveLocal = false;
        availableFilters.forEach((field) => {
          if (activeFilters[field.id]?.value !== undefined && activeFilters[field.id]?.value !== "") {
            initialExpanded[field.id] = true;
            hasActiveLocal = true;
          }
        });

        if (!hasActiveLocal) {
          initialExpanded[firstId] = true;
        }
        setExpandedKeys(initialExpanded);
      }
    }
  }, [isOpen, filters, availableFilters]);

  // Toggle expand for accordion
  const toggleExpand = (id: string) => {
    setExpandedKeys((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Handle changing an operator
  const _handleOperatorChange = (id: string, operator: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        operator,
      },
    }));
  };

  // Handle changing a value
  const _handleValueChange = (id: string, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        value,
      },
    }));
  };

  // Reset a specific field
  const handleResetField = (id: string) => {
    setLocalFilters((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // Apply all filters to global store
  const handleApply = () => {
    const cleanedFilters = Object.fromEntries(
      Object.entries(localFilters).filter(([_, f]) => f?.value !== undefined && f?.value !== "")
    );
    setFilters({
      columnFilters: cleanedFilters,
      isFilterActive,
    });
    onClose();
  };

  // Reset all filters in the drawer
  const handleResetAll = () => {
    setLocalFilters({});
  };

  // Count active filters in local state
  const localActiveCount = useMemo(() => {
    return Object.values(localFilters).filter(
      (f: any) => f?.value !== undefined && f?.value !== ""
    ).length;
  }, [localFilters]);

  // Count active filters in applied state
  const appliedCount = useMemo(() => {
    if (filters?.isFilterActive === false) return 0;
    if (!filters?.columnFilters) return 0;
    return Object.values(filters.columnFilters).filter(
      (f: any) => f?.value !== undefined && f?.value !== ""
    ).length;
  }, [filters]);

  // Render controls inside each accordion panel
  const renderFieldControls = (field: TableColumnType) => {
    const current = localFilters[field.id] || { operator: "", value: "" };

    return (
      <FilterControl
        field={field}
        current={current}
        onChange={(val) => {
          setLocalFilters((prev) => ({
            ...prev,
            [field.id]: val,
          }));
        }}
        onClear={() => handleResetField(field.id)}
        onReset={() => handleResetField(field.id)}
        variant="drawer"
      />
    );
  };

  // Header Title Component
  const drawerTitle = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2.5">
        <FilterOutlined className="text-text-primary text-[16px]" />
        <span className="font-bold text-text-primary text-[16px]">Filters</span>
        {appliedCount > 0 && (
          <span className="flex items-center justify-center bg-primary text-white dark:bg-primary-500 dark:text-slate-900 rounded-full text-[10px] w-5 h-5 font-bold">
            {appliedCount}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-text-secondary font-medium">Active</span>
        <Switch
          checked={isFilterActive}
          onChange={setIsFilterActive}
          size="small"
        />
      </div>
    </div>
  );

  // Footer Buttons
  const drawerFooter = (
    <div className="flex items-center justify-between w-full px-2">
      <Button
        type="text"
        onClick={handleResetAll}
        disabled={!isNotEmptyObject(localFilters)}
        className="text-red-500 hover:text-red-600 font-semibold text-sm disabled:opacity-40 disabled:hover:text-red-500"
      >
        Reset All
      </Button>
      <div className="flex items-center gap-2">
        <Button onClick={onClose} className="border-border hover:bg-slate-50 font-medium">
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={handleApply}
          className="bg-primary hover:bg-primary-100 border-none font-semibold px-4 flex items-center gap-2"
        >
          <span>Apply Filters</span>
          {localActiveCount > 0 && (
            <span className="flex items-center justify-center bg-white/20 text-white rounded-full text-[10px] w-4.5 h-4.5 font-bold">
              {localActiveCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      styles={{
        wrapper: { width: 400 }
      }}
      title={drawerTitle}
      footer={drawerFooter}
      closeIcon={false}
      classNames={{
        header: "px-6 py-4.5 border-b border-border bg-background",
        body: "p-0 overflow-y-auto bg-background",
        footer: "px-6 py-4.5 border-t border-border bg-background",
      }}
    >
      {!isNotEmptyArray(availableFilters) ? (
        <div className="p-8 text-center text-text-secondary text-[13px]">
          No filters available for this view.
        </div>
      ) : (
        <div className="flex flex-col bg-background divide-y divide-border">
          {availableFilters.map((field) => {
            const isExpanded = !!expandedKeys[field.id];
            const hasValue = localFilters[field.id]?.value !== undefined && localFilters[field.id]?.value !== "";

            return (
              <div key={field.id} className="w-full flex flex-col">
                {/* Accordion Header */}
                <div
                  onClick={() => toggleExpand(field.id)}
                  className={classNames(
                    "flex items-center justify-between px-6 py-4.5 cursor-pointer select-none transition-colors duration-200"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-text-primary text-[14px]">
                      {field.title}
                    </span>
                    {hasValue && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <DownOutlined
                    className={classNames(
                      "text-text-secondary text-[11px] transition-transform duration-200",
                      {
                        "rotate-180": isExpanded,
                      }
                    )}
                  />
                </div>

                {/* Accordion Content */}
                <div
                  className={classNames(
                    "grid transition-all duration-300 ease-in-out",
                    {
                      "grid-rows-[1fr] opacity-100": isExpanded,
                      "grid-rows-[0fr] opacity-0": !isExpanded,
                    }
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-4 pt-1 bg-background">
                      {renderFieldControls(field)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Drawer>
  );
}
