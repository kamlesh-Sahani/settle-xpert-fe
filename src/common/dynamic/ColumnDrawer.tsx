"use client";

import React, { useMemo } from "react";
import { Drawer, Switch, Button } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { useGridFilters } from "@/hooks/useGridFilters";
import { isNotEmptyArray } from "@/common/utils/main.utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ColumnDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filterKey: string;
}

function SortableColumnItem({ id, col, isHidden, onToggle }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-zinc-900/20 transition-colors duration-200 bg-background"
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:text-primary active:cursor-grabbing mr-1"
        >
          <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" className="text-text-secondary opacity-50 hover:opacity-100 transition-opacity">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
          </svg>
        </div>
        {isHidden ? (
          <EyeInvisibleOutlined className="text-text-secondary opacity-50" />
        ) : (
          <EyeOutlined className="text-primary" />
        )}
        <span
          className={`text-[14px] font-medium ${
            isHidden ? "text-text-secondary" : "text-text-primary"
          }`}
        >
          {col.title}
        </span>
      </div>
      <Switch
        size="small"
        checked={!isHidden}
        onChange={(checked) => onToggle(col.id, checked)}
      />
    </div>
  );
}

export default function ColumnDrawer({ isOpen, onClose, filterKey }: ColumnDrawerProps) {
  const [filters, setFilters] = useGridFilters<any>(filterKey);

  // Available columns from backend
  const columns = useMemo(() => {
    if (isNotEmptyArray(filters?.columns)) {
      return filters.columns.filter((c: any) => c.id && c.title && c.id !== "actions");
    }
    return [];
  }, [filters?.columns]);

  // Ordered columns
  const orderedColumns = useMemo(() => {
    if (!isNotEmptyArray(columns)) return [];
    if (isNotEmptyArray(filters?.columnOrder)) {
      const orderMap = new Map(filters.columnOrder.map((id: string, index: number) => [id, index]));
      return [...columns].sort((a: any, b: any) => {
        const indexA = orderMap.has(a.id) ? orderMap.get(a.id) : 9999;
        const indexB = orderMap.has(b.id) ? orderMap.get(b.id) : 9999;
        return (indexA as number) - (indexB as number);
      });
    }
    return columns;
  }, [columns, filters?.columnOrder]);

  const items = useMemo(() => orderedColumns.map((c: any) => c.id), [orderedColumns]);

  // Current hidden columns array
  const hiddenColumns: string[] = filters?.hiddenColumns || [];

  const handleToggle = (id: string, checked: boolean) => {
    if (checked) {
      setFilters({
        hiddenColumns: hiddenColumns.filter((colId) => colId !== id),
      });
    } else {
      setFilters({
        hiddenColumns: [...hiddenColumns, id],
      });
    }
  };

  const handleShowAll = () => {
    setFilters({ hiddenColumns: [] });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);
      setFilters({ columnOrder: newOrder });
    }
  };

  const drawerTitle = (
    <div className="flex items-center gap-2.5">
      <EyeOutlined className="text-text-primary text-[16px]" />
      <span className="font-bold text-text-primary text-[16px]">Columns</span>
    </div>
  );

  const drawerFooter = (
    <div className="flex items-center justify-between w-full px-2">
      <Button
        type="text"
        onClick={handleShowAll}
        disabled={hiddenColumns.length === 0}
        className="text-primary hover:text-primary-600 font-semibold text-sm disabled:opacity-40 disabled:hover:text-primary"
      >
        Show All
      </Button>
      <Button onClick={onClose} className="border-border hover:bg-slate-50 font-medium px-6">
        Close
      </Button>
    </div>
  );

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      styles={{
        wrapper: { width: 320 }
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
      {!isNotEmptyArray(orderedColumns) ? (
        <div className="p-8 text-center text-text-secondary text-[13px]">
          No columns available.
        </div>
      ) : (
        <DndContext id="column-dnd-context" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col bg-background divide-y divide-border">
              {orderedColumns.map((col: any) => {
                const isHidden = hiddenColumns.includes(col.id);
                return (
                  <SortableColumnItem
                    key={col.id}
                    id={col.id}
                    col={col}
                    isHidden={isHidden}
                    onToggle={handleToggle}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </Drawer>
  );
}
