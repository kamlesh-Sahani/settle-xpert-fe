"use client";

import React from "react";
import { Tooltip, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import AuditIcon from "@/assets/icons/AuditIcon";
import DeleteIcon from "@/assets/icons/deleteIcon";

interface DepartmentHeaderActionsProps {
    currentStatus: "ACTIVE" | "IN_ACTIVE";
    isStatusUpdating?: boolean;
    canViewAudit?: boolean;
    canDelete?: boolean;
    onStatusChange: (status: "ACTIVE" | "IN_ACTIVE") => void;
    onAuditClick: () => void;
    onDeleteClick: () => void;
}

const STATUS_ITEMS = [
    { key: "ACTIVE", label: "Active", dotColor: "bg-[#16a34a]" },
    { key: "IN_ACTIVE", label: "Inactive", dotColor: "bg-[#f59e0b]" },
] as const;

export default function DepartmentHeaderActions({
    currentStatus,
    isStatusUpdating = false,
    canViewAudit = true,
    canDelete = false,
    onStatusChange,
    onAuditClick,
    onDeleteClick,
}: DepartmentHeaderActionsProps) {
    const isActive = currentStatus === "ACTIVE";

    const menuItems = STATUS_ITEMS.map((item) => ({
        key: item.key,
        label: (
            <div className="flex items-center gap-2 py-1 px-1">
                <span className={`w-2.5 h-2.5 rounded-full ${item.dotColor}`} />
                <span className="text-sm font-semibold text-text-primary">{item.label}</span>
            </div>
        ),
        onClick: () => onStatusChange(item.key as "ACTIVE" | "IN_ACTIVE"),
    }));

    return (
        <div className="flex items-center gap-2.5">
            {canViewAudit && (
                <Tooltip title="Audit History">
                    <button
                        type="button"
                        onClick={onAuditClick}
                        className="w-[38px] h-[38px] flex items-center justify-center rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-text-primary transition-colors cursor-pointer"
                    >
                        <AuditIcon className="w-5 h-5" />
                    </button>
                </Tooltip>
            )}

            {canDelete && (
                <Tooltip title="Delete Department">
                    <button
                        type="button"
                        onClick={onDeleteClick}
                        className="w-[38px] h-[38px] flex items-center justify-center rounded-lg border border-[#fecdd3] bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#e11d48] transition-colors cursor-pointer"
                    >
                        <DeleteIcon width={22} height={22} />
                    </button>
                </Tooltip>
            )}

            <div className="h-6 w-[1px] bg-border mx-0.5" />

            <Dropdown menu={{ items: menuItems }} trigger={["click"]} disabled={isStatusUpdating}>
                <div className="relative flex items-center justify-between min-w-[124px] px-3 h-[38px] border border-border rounded-lg bg-background hover:border-text-secondary transition-colors cursor-pointer select-none">
                    <span className="absolute -top-2 left-2 px-1 bg-background text-[11px] font-semibold text-text-secondary leading-none">
                        Status
                    </span>
                    <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-[#16a34a]" : "bg-[#f59e0b]"}`} />
                        <span className="text-sm font-bold text-text-primary">
                            {isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                    <DownOutlined className="text-[10px] text-text-secondary ml-2" />
                </div>
            </Dropdown>
        </div>
    );
}
