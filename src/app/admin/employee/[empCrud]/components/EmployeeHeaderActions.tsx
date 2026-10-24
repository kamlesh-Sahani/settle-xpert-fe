"use client";

import React from "react";
import { Tooltip, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import AuditIcon from "@/assets/icons/AuditIcon";

interface EmployeeHeaderActionsProps {
    currentStatus: string;
    isStatusUpdating?: boolean;
    canViewAudit?: boolean;
    onStatusChange: (status: "ACTIVE" | "SUSPENDED") => void;
    onAuditClick: () => void;
}

const STATUS_ITEMS = [
    { key: "ACTIVE", label: "Active", dotColor: "bg-[#16a34a]" },
    { key: "SUSPENDED", label: "Suspended", dotColor: "bg-[#f59e0b]" },
] as const;

export default function EmployeeHeaderActions({
    currentStatus,
    isStatusUpdating = false,
    canViewAudit = true,
    onStatusChange,
    onAuditClick,
}: EmployeeHeaderActionsProps) {
    const isActive = currentStatus === "ACTIVE";

    const menuItems = STATUS_ITEMS.map((item) => ({
        key: item.key,
        label: (
            <div className="flex items-center gap-2 py-1 px-1">
                <span className={`w-2.5 h-2.5 rounded-full ${item.dotColor}`} />
                <span className="text-sm font-semibold text-text-primary">{item.label}</span>
            </div>
        ),
        onClick: () => onStatusChange(item.key as "ACTIVE" | "SUSPENDED"),
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

            <div className="h-6 w-[1px] bg-border mx-0.5" />

            <Dropdown menu={{ items: menuItems }} trigger={["click"]} disabled={isStatusUpdating}>
                <div className="relative flex items-center justify-between min-w-[124px] px-3 h-[38px] border border-border rounded-lg bg-background hover:border-text-secondary transition-colors cursor-pointer select-none">
                    <span className="absolute -top-2 left-2 px-1 bg-background text-[11px] font-semibold text-text-secondary leading-none">
                        Status
                    </span>
                    <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-[#16a34a]" : "bg-[#f59e0b]"}`} />
                        <span className="text-sm font-bold text-text-primary">
                            {isActive ? "Active" : "Suspended"}
                        </span>
                    </div>
                    <DownOutlined className="text-[10px] text-text-secondary ml-2" />
                </div>
            </Dropdown>
        </div>
    );
}
