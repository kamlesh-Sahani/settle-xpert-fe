"use client";

import React from "react";
import { Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";

interface EmployeeStatusDropdownProps {
    currentStatus: string;
    isStatusUpdating?: boolean;
    onStatusChange: (status: "ACTIVE" | "SUSPENDED") => void;
}

const STATUS_ITEMS = [
    { key: "ACTIVE", label: "Active", dotColor: "bg-[#16a34a]" },
    { key: "SUSPENDED", label: "Suspended", dotColor: "bg-[#f59e0b]" },
] as const;

export default function EmployeeStatusDropdown({
    currentStatus,
    isStatusUpdating = false,
    onStatusChange,
}: EmployeeStatusDropdownProps) {
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
    );
}
