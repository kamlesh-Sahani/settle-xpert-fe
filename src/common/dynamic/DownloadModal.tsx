"use client";

import React, { useState, useMemo } from "react";
import { Button } from "antd";
import DynamicModal from "./DynamicModal";
import { InfoCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useGridFilters } from "@/hooks/useGridFilters";
import { useForm, Control, FieldValues, useWatch } from "react-hook-form";
import InputField from "../form/InputField";
import FormStatusMessage, { SubmitStatusType } from "../form/FormStatusMessage";
import api from "@/common/utils/api";
import { useFetch } from "@/hooks/useFetch";
import { isArray, isString, isNotEmptyArray, responseError } from "@/common/utils/main.utils";
import LoadingSpinner from "@/common/basic/LoadingSpinner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DownloadModalProps {
    open: boolean;
    onClose: () => void;
    format: "csv" | "excel" | null;
    filterKey: string;
}

interface FilterChip {
    key: string;
    label: string;
    operator: string;
    value: string;
}

interface FormData {
    rowCount: string;
    fileName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseFilterValue(raw: any): string {
    if (!raw?.value && raw?.value !== 0) return String(raw ?? "");
    const val = raw.value;
    return isArray(val) ? val.join(", ") : String(val);
}

function parseRawFilter(f: any): { operator: string; value: string } {
    if (isString(f.value) && f.value.startsWith("{")) {
        const parsed = JSON.parse(f.value);
        return {
            operator: f.operator || parsed?.operator || "Equal",
            value: parseFilterValue(parsed),
        };
    }
    return {
        operator: f.operator || "Equal",
        value: parseFilterValue(f.value),
    };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const CHIP_CLASS = "flex items-center gap-1 px-2.5 py-1 bg-background border border-border rounded text-xs";

function FilterChipItem({ label, operator, value }: Omit<FilterChip, "key">) {
    return (
        <div className={CHIP_CLASS}>
            <span className="font-semibold text-text-primary">{label} ({operator})</span>
            <span className="text-text-secondary">- {value}</span>
        </div>
    );
}

function SummaryCard({ label, value, valueClass, isLoading }: { label: string; value: number; valueClass?: string, isLoading?: boolean }) {
    return (
        <div className="border border-border rounded p-3 bg-secondary flex flex-col gap-0.5">
            <span className="text-xs text-text-secondary">{label}</span>
            {isLoading ? (
                <div className="h-[28px] w-[60px] bg-slate-200 dark:bg-zinc-700 animate-pulse rounded mt-0.5"></div>
            ) : (
                <span className={`text-xl font-bold ${valueClass ?? "text-text-primary"}`}>{value}</span>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const DownloadModal: React.FC<DownloadModalProps> = ({ open, onClose, format, filterKey }) => {
    const [filters] = useGridFilters<any>(filterKey);

    const [submitStatus, setSubmitStatus] = useState<SubmitStatusType | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    const { control, handleSubmit, setValue } = useForm<FormData>({
        defaultValues: {
            rowCount: String(filters?.tableCount || 1),
            fileName: `Export ${dayjs().format("YYYY-MM-DD")}`,
        },
        mode: "onChange"
    });

    const totalPayload = useMemo(() => {
        if (!filters?.postBody) return null;
        return {
            ...filters.postBody,
            fetchTotal: true,
        };
    }, [filters?.postBody]);

    const { data: fetchTotalData, loading: isFetchingTotal } = useFetch({
        client: api.post,
        url: filters?.apiUrl,
        body: totalPayload,
        dontCall: !open || filters?.paginationType !== "cursor" || !filters?.apiUrl || !totalPayload,
        onSuccess: (data: any) => {
            if (data?.success && data?.data?.totalRows !== undefined) {
                setValue("rowCount", String(data.data.totalRows || 1));
            }
        }
    });

    const fetchedTotal = (fetchTotalData as any)?.data?.totalRows;
    const tableCount = fetchedTotal ?? (filters?.tableCount || 0);

    const formRowCount = useWatch({ control, name: "rowCount" });

    // Clamp the row count to [1, tableCount]
    const finalRowCount = useMemo(() => {
        const n = parseInt(formRowCount) || 0;
        return Math.min(Math.max(n, 1), Math.max(tableCount, 1));
    }, [formRowCount, tableCount]);

    // Build the filter chips list (search + column filters)
    const filterChips = useMemo<FilterChip[]>(() => {
        const chips: FilterChip[] = [];

        if (filters?.tableSearch) {
            chips.push({ key: "__search__", label: "Search", operator: "Contains", value: filters.tableSearch });
        }

        const isActive = filters?.isFilterActive !== false;
        if (isActive && filters?.columnFilters) {
            for (const [key, f] of Object.entries<any>(filters.columnFilters)) {
                if (f?.value === undefined || f?.value === "") continue;

                const { operator, value } = parseRawFilter(f);
                const colConfig = filters.columns?.find(
                    (c: any) => c.dataIndex === key || c.key === key || c.id === key
                );

                chips.push({ key, label: colConfig?.title || key, operator, value });
            }
        }

        return chips;
    }, [filters]);

    const handleDownload = async (data: FormData) => {
        if (!format) return;
        setSubmitStatus(null);

        const apiUrl = filters?.apiUrl;

        const downloadPayload = {
            ...(filters?.postBody || {}),
        };

        // Remove pagination state so it exports from the beginning of the filtered dataset
        delete downloadPayload.cursor;
        delete downloadPayload.page;
        delete downloadPayload.limit;

        downloadPayload.export = {
            export: true,
            format: format,
            fileName: data.fileName,
            count: finalRowCount
        };

        setIsExporting(true);
        try {
            const response = await api.post(apiUrl, downloadPayload, {
                responseType: "blob",
                timeout: 60000 // 1 minute timeout
            });

            const contentDisposition = response.headers.get("Content-Disposition");
            let downloadedFileName = data.fileName.endsWith(`.${format}`) ? data.fileName : `${data.fileName}.${format}`;
            if (contentDisposition && contentDisposition.includes("filename=")) {
                downloadedFileName = contentDisposition.split("filename=")[1].replace(/"/g, "");
            }

            const blob = response.data;
            const { saveAs } = await import("file-saver");
            saveAs(blob, downloadedFileName);

            // The backend returns a raw file stream (Blob) on success, so it doesn't contain a JSON message.
            // We check if they ever add a custom header, otherwise default to generic success.
            const successMsg = response.headers.get("X-Success-Message") || 'Downloaded successfully';
            setSubmitStatus({ type: 'success', text: successMsg });
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (_error: any) {
            console.error("Export Error:", _error);
            let errorMsg = responseError(_error);
            setSubmitStatus({ type: 'error', text: errorMsg });
        } finally {
            setIsExporting(false);
        }
    };

    const btnStyle = { width: 150, height: 37, borderRadius: 4 };
    const capitalizedFormat = format ? format.charAt(0).toUpperCase() + format.slice(1) : "";

    return (
        <DynamicModal
            isOpen={open}
            onClose={onClose}
            title={`Download ${capitalizedFormat}`}
            zIndex={1050}
            className="w-[700px] h-auto max-h-[90vh]"
            footer={
                <div className="flex items-center gap-3">
                    <Button onClick={onClose} style={btnStyle} className="font-medium">Cancel</Button>
                    <Button type="primary" loading={isExporting} disabled={isFetchingTotal} onClick={handleSubmit(handleDownload)} style={btnStyle} className="font-medium">
                        Download
                    </Button>
                    <FormStatusMessage status={submitStatus} />
                </div>
            }
        >
            <div className="relative">
                {isFetchingTotal && (
                    <div className="absolute inset-0 z-10 flex justify-center items-center bg-background/50 backdrop-blur-[2px]">
                        <LoadingSpinner />
                    </div>
                )}

                <div className={`flex flex-col gap-4 py-1 ${isFetchingTotal ? 'opacity-50 pointer-events-none' : ''}`}>

                    {/* ── Inputs ───────────────────────────────────────────── */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-text-primary">Number of rows to download*</label>
                            <InputField
                                id="rowCount"
                                type="number"
                                control={control as unknown as Control<FieldValues, any, FieldValues>}
                                placeholder="Enter rows count"
                                className="h-[32px] rounded-[4px]"
                                rules={{
                                    required: "Number of rows is required",
                                    min: { value: 1, message: "Minimum 1 row required" },
                                    max: { value: Math.max(tableCount, 1), message: `Maximum ${tableCount} rows allowed` }
                                }}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-text-primary">
                                File Name
                            </label>
                            <InputField
                                id="fileName"
                                type="text"
                                control={control as unknown as Control<FieldValues, any, FieldValues>}
                                placeholder="Enter file name"
                                className="h-[32px] rounded-[4px]"
                                rules={{ required: "File name is required" }}
                            />
                        </div>
                    </div>

                    {/* ── Info hint ─────────────────────────────────────────── */}
                    <p className="flex items-center gap-1.5 text-xs text-text-secondary m-0">
                        <InfoCircleOutlined />
                        Only first {finalRowCount} rows will be downloaded from filtered result (Max {tableCount} rows)
                    </p>

                    {/* ── Rows Summary ──────────────────────────────────────── */}
                    <div className="flex flex-col gap-2">
                        <h4 className="text-sm font-bold text-text-primary m-0">Rows Summary</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <SummaryCard label="Rows after filters" value={tableCount} isLoading={isFetchingTotal} />
                            <SummaryCard label="You are downloading" value={finalRowCount} valueClass="text-primary" />
                        </div>
                    </div>

                    {/* ── Applied Filters ───────────────────────────────────── */}
                    {isNotEmptyArray(filterChips) && (
                        <div className="flex flex-col gap-2">
                            <h4 className="text-sm font-bold text-text-primary m-0">
                                Applied Filters ({filterChips.length})
                            </h4>
                            <div className="border border-border rounded p-3 bg-secondary flex flex-wrap gap-2 items-start">
                                {filterChips.map((chip) => (
                                    <FilterChipItem key={chip.key} label={chip.label} operator={chip.operator} value={chip.value} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DynamicModal>
    );
};

export default DownloadModal;
