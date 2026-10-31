"use client";

import React, { useState, useRef, useMemo } from "react";
import { App } from "antd";
import { useForm } from "react-hook-form";
import {
  InboxOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import ExcelIcon from "@/common/icons/ExcelIcon";
import DynamicModal from "@/common/dynamic/DynamicModal";
import ButtonField from "@/common/basic/ButtonField";
import SelectField from "@/common/form/SelectField";
import SelectApiField from "@/common/form/SelectApiField";
import LabelField from "@/common/form/LabelField";
import StaticTable from "@/common/dynamic/DynamicTable/StaticTable";
import type {
  TableDataType,
  TableColumnType,
  TableRowType,
} from "@/common/dynamic/DynamicTable/types";
import { api, responseError } from "@/common/utils";

interface FieldDefinition {
  key: string;
  label: string;
  required: boolean;
}

const DEFAULT_CRM_FIELDS: FieldDefinition[] = [
  { key: "fullName", label: "Full Name", required: true },
  { key: "phone", label: "Phone Number", required: true },
  { key: "email", label: "Email Address", required: false },
  { key: "totalDebtAmount", label: "Total Debt Amount", required: false },
  { key: "monthlyIncome", label: "Monthly Income", required: false },
  { key: "currentEmiAmount", label: "Total Monthly EMI", required: false },
  { key: "city", label: "City", required: false },
  { key: "state", label: "State", required: false },
  { key: "serviceRequired", label: "Service Required", required: false },
  { key: "qualificationNotes", label: "Qualification Notes", required: false },
];

interface SkippedLead {
  row: number;
  phone: string;
  name: string;
  reason: string;
}

interface ValidatedLead {
  row: number;
  fullName: string;
  phone: string;
  email: string;
  serviceRequired: string;
  source: string;
  city: string;
  state: string;
  totalDebtAmount: number;
  monthlyIncome: number;
  currentEmiAmount: number;
  qualificationNotes: string;
  isValid: boolean;
  status: "VALID" | "INVALID" | "DUPLICATE_FILE" | "DUPLICATE_CRM";
  errorReason: string;
}

interface ValidationResult {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  validatedLeads: ValidatedLead[];
}

interface ImportSummary {
  totalSubmitted: number;
  createdCount: number;
  skippedCount: number;
  skippedLeads: SkippedLead[];
}

interface BulkLeadImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type StepType = "upload" | "map" | "preview" | "summary";

export default function BulkLeadImportModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkLeadImportModalProps) {
  const { message } = App.useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { control, watch, setValue, reset } = useForm<Record<string, any>>({
    defaultValues: {
      defaultSource: "EXCEL_IMPORT",
    },
  });
  const defaultSource = watch("defaultSource") || "EXCEL_IMPORT";

  const [currentStep, setCurrentStep] = useState<StepType>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [summaryTab, setSummaryTab] = useState<"created" | "skipped">("created");

  // Initialize header mappings based on exact field key or label
  const initHeaderMappings = (detectedCols: string[]) => {
    const mapping: Record<string, string> = {};

    detectedCols.forEach((col, idx) => {
      const normalized = col.toLowerCase().replace(/[^a-z0-9]/g, "");
      const matchedField = DEFAULT_CRM_FIELDS.find(
        (f) =>
          f.key.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized ||
          f.label.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized
      );

      if (matchedField) {
        mapping[col] = matchedField.key;
        setValue(`col_map_${idx}`, matchedField.key);
      } else {
        mapping[col] = "";
        setValue(`col_map_${idx}`, undefined);
      }
    });

    setColumnMapping(mapping);
  };

  // Read Excel/CSV file with xlsx-js-style
  const processUploadedFile = async (uploadedFile: File) => {
    try {
      const XLSX = await import("xlsx-js-style");
      const buffer = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

      if (!jsonData || jsonData.length < 2) {
        message.error("The spreadsheet is empty or has no data rows.");
        return;
      }

      const detectedCols = (jsonData[0] as string[]).map((c, i) =>
        String(c || "").trim() || `Column_${i + 1}`
      );
      const dataRows = jsonData.slice(1).filter((row) =>
        row && row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== "")
      );

      setFile(uploadedFile);
      setColumns(detectedCols);
      setRawRows(dataRows);
      initHeaderMappings(detectedCols);
      setCurrentStep("map");
    } catch {
      message.error("Failed to parse file. Please upload a valid .xlsx or .csv spreadsheet.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processUploadedFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processUploadedFile(droppedFile);
    }
  };

  // Download sample Excel template
  const handleDownloadTemplate = async () => {
    try {
      const XLSX = await import("xlsx-js-style");
      const templateData = [
        [
          "Customer Name",
          "Contact_No",
          "Email Address",
          "Outstanding_Amt",
          "Monthly_Salary",
          "Current Monthly EMI",
          "Region",
          "State",
          "Qualification Notes",
        ],
        [
          "Rahul Sharma",
          "9876543210",
          "rahul.sharma@example.com",
          450000,
          45000,
          12500,
          "Pune",
          "Maharashtra",
          "Looking for credit card settlement",
        ],
        [
          "Pooja Verma",
          "9988776655",
          "pooja.verma@example.com",
          650000,
          60000,
          18000,
          "Delhi",
          "Delhi",
          "Multiple personal loans restructuring",
        ],
      ];

      const ws = XLSX.utils.aoa_to_sheet(templateData);

      ws["!cols"] = [
        { wch: 20 },
        { wch: 15 },
        { wch: 26 },
        { wch: 18 },
        { wch: 16 },
        { wch: 20 },
        { wch: 14 },
        { wch: 16 },
        { wch: 35 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Leads_Template");
      XLSX.writeFile(wb, "SettleXpert_Lead_Import_Template.xlsx");
      message.success("Sample template downloaded!");
    } catch {
      message.error("Failed to generate sample template");
    }
  };

  // Convert raw rows to mapped lead objects
  const getMappedLeads = () => {
    return rawRows.map((row) => {
      const lead: Record<string, any> = {};

      columns.forEach((col, idx) => {
        const mappedKey = columnMapping[col];
        if (mappedKey) {
          let val = row[idx];
          if (val !== undefined && val !== null) {
            val = String(val).trim();
            if (["totalDebtAmount", "monthlyIncome", "currentEmiAmount"].includes(mappedKey)) {
              const cleanedNum = parseFloat(String(val).replace(/[^0-9.]/g, ""));
              lead[mappedKey] = isNaN(cleanedNum) ? 0 : cleanedNum;
            } else {
              lead[mappedKey] = val;
            }
          }
        }
      });

      return lead;
    });
  };

  // Validation checks for Mapping Step
  const isNameMapped = Object.values(columnMapping).includes("fullName");
  const isPhoneMapped = Object.values(columnMapping).includes("phone");
  const unmappedCount = columns.filter((col) => !columnMapping[col]).length;

  // Call Backend Validate API
  const handleValidateAndPreview = async () => {
    const rawLeads = getMappedLeads();
    setIsValidating(true);
    try {
      const res = await api.post("/api/v1/lead/validate-import", {
        defaultSource,
        leads: rawLeads,
      });

      if (res?.data?.success && res.data.data) {
        setValidationResult(res.data.data);
        setCurrentStep("preview");
      }
    } catch (err) {
      message.error(responseError(err));
    } finally {
      setIsValidating(false);
    }
  };

  // Submit Validated Leads to Backend API
  const handleConfirmImport = async () => {
    if (!validationResult || validationResult.validCount === 0) {
      message.warning("No valid leads available to import.");
      return;
    }

    const validLeads = validationResult.validatedLeads
      .filter((l) => l.isValid)
      .map((l) => ({
        fullName: l.fullName,
        phone: l.phone,
        email: l.email,
        serviceRequired: l.serviceRequired,
        source: defaultSource,
        city: l.city,
        state: l.state,
        totalDebtAmount: l.totalDebtAmount,
        monthlyIncome: l.monthlyIncome,
        currentEmiAmount: l.currentEmiAmount,
        qualificationNotes: l.qualificationNotes,
      }));

    setIsSubmitting(true);
    try {
      const res = await api.post("/api/v1/lead/bulk-create", {
        defaultSource,
        leads: validLeads,
      });

      if (res?.data?.success) {
        setImportSummary(res.data.data);
        setCurrentStep("summary");
        message.success(res.data.message || "Leads imported successfully!");
      }
    } catch (err) {
      message.error(responseError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    const hasImported = Boolean(importSummary && importSummary.createdCount > 0);
    setCurrentStep("upload");
    setFile(null);
    setColumns([]);
    setRawRows([]);
    setColumnMapping({});
    setValidationResult(null);
    setImportSummary(null);
    setSummaryTab("created");
    reset();
    onClose();
    if (hasImported) {
      onSuccess?.();
    }
  };

  // ─── Step 2: StaticTable Payload Construction for Column Mapping ──
  const mappingColumns: TableColumnType[] = [
    { id: "excelCol", title: "Excel Column", width: 220 },
    { id: "crmField", title: "CRM Lead Field", width: 340 },
    { id: "samplePreview", title: "Sample Preview", width: 280 },
  ];

  const mappingTableData: TableDataType = useMemo(() => {
    const rows: TableRowType[] = columns.map((col, idx) => {
      const previewSample = rawRows
        .slice(0, 3)
        .map((r) => r[idx])
        .filter(Boolean)
        .join(", ");

      return {
        excelCol: [
          {
            type: "TEXT",
            title: col,
            isBold: true,
          },
        ],
        crmField: [
          {
            type: "CUSTOM",
            render: () => {
              const selectedField = DEFAULT_CRM_FIELDS.find((f) => f.key === columnMapping[col]);
              const initialOpt = selectedField
                ? {
                    key: selectedField.key,
                    value: `${selectedField.label} ${selectedField.required ? "(Required)" : ""}`,
                  }
                : null;
              const otherMappedKeys = Object.entries(columnMapping)
                .filter(([c, v]) => c !== col && Boolean(v))
                .map(([_, v]) => v);

              return (
                <SelectApiField
                  id={`col_map_${idx}`}
                  name={`col_map_${idx}`}
                  control={control}
                  className="w-full text-xs"
                  placeholder="Select CRM Field..."
                  allowClear
                  hideKeys={otherMappedKeys}
                  apiUrl="/api/v1/lead/import-fields"
                  onFormatData={(data) =>
                    data.map((f: any) => ({
                      key: f.key,
                      value: `${f.label} ${f.required ? "(Required)" : ""}`,
                    }))
                  }
                  initialValue={initialOpt}
                  onChange={({ value }) => {
                    setColumnMapping((prev) => ({ ...prev, [col]: value || "" }));
                  }}
                />
              );
            },
          },
        ],
        samplePreview: [
          {
            type: "TEXT",
            title: previewSample || "Empty",
            color: previewSample ? "#6b7280" : "#d1d5db",
          },
        ],
      };
    });

    return {
      columns: mappingColumns,
      rows,
      features: { search: false, sort: false },
      isPaginated: false,
      pageNumber: 1,
      totalPages: 1,
      pageSize: 50,
      totalRows: rows.length,
      count: rows.length,
    };
  }, [columns, columnMapping, rawRows, control]);

  // ─── Step 3: StaticTable Payload Construction ───────────────────────
  const previewColumns: TableColumnType[] = [
    { id: "rowNumber", title: "#", width: 60 },
    { id: "fullName", title: "Full Name", width: 170 },
    { id: "phone", title: "Phone", width: 130 },
    { id: "totalDebt", title: "Total Debt", width: 130 },
    { id: "monthlyIncome", title: "Monthly Income", width: 130 },
    { id: "city", title: "City", width: 110 },
    { id: "status", title: "Validation Status", width: 140 },
    { id: "remarks", title: "Remarks / Reason", width: 220 },
  ];

  const previewTableData: TableDataType = useMemo(() => {
    const list = validationResult?.validatedLeads || [];
    const rows: TableRowType[] = list.map((lead) => {
      let statusTitle = "Valid";
      let bgColor = "#ecfdf5";
      let textColor = "#047857";

      if (lead.status === "DUPLICATE_CRM") {
        statusTitle = "Duplicate (CRM)";
        bgColor = "#fffbeb";
        textColor = "#b45309";
      } else if (lead.status === "DUPLICATE_FILE") {
        statusTitle = "Duplicate (File)";
        bgColor = "#fef3c7";
        textColor = "#92400e";
      } else if (!lead.isValid) {
        statusTitle = "Invalid";
        bgColor = "#fef2f2";
        textColor = "#b91c1c";
      }

      return {
        rowNumber: [
          {
            type: "TEXT",
            title: String(lead.row),
          },
        ],
        fullName: [
          {
            type: "TEXT",
            title: lead.fullName || "Missing Name",
            isBold: true,
            color: lead.fullName ? undefined : "#ef4444",
          },
        ],
        phone: [
          {
            type: "TEXT",
            title: lead.phone || "Missing Phone",
            color: lead.isValid ? undefined : "#ef4444",
          },
        ],
        totalDebt: [
          {
            type: "TEXT",
            title: lead.totalDebtAmount ? `₹${lead.totalDebtAmount.toLocaleString("en-IN")}` : "—",
          },
        ],
        monthlyIncome: [
          {
            type: "TEXT",
            title: lead.monthlyIncome ? `₹${lead.monthlyIncome.toLocaleString("en-IN")}` : "—",
          },
        ],
        city: [
          {
            type: "TEXT",
            title: lead.city || "—",
          },
        ],
        status: [
          {
            type: "STATUS",
            title: statusTitle,
            bgColor,
            textColor,
          },
        ],
        remarks: [
          {
            type: "TEXT",
            title: lead.errorReason || "Ready for import",
            color: lead.errorReason ? "#b91c1c" : "#047857",
          },
        ],
      };
    });

    return {
      columns: previewColumns,
      rows,
      features: { search: true, sort: true },
      isPaginated: false,
      pageNumber: 1,
      totalPages: 1,
      pageSize: 20,
      totalRows: rows.length,
      count: rows.length,
    };
  }, [validationResult]);

  // ─── Step 4: StaticTable Payload Construction ───────────────────────
  const createdColumns: TableColumnType[] = [
    { id: "row", title: "#", width: 60 },
    { id: "name", title: "Borrower Name", width: 180 },
    { id: "phone", title: "Phone", width: 140 },
    { id: "totalDebt", title: "Total Debt", width: 140 },
    { id: "city", title: "City", width: 120 },
    { id: "status", title: "Status", width: 150 },
  ];

  const createdTableData: TableDataType = useMemo(() => {
    const list = validationResult?.validatedLeads.filter((l) => l.isValid) || [];
    const rows: TableRowType[] = list.map((lead, idx) => ({
      row: [
        {
          type: "TEXT",
          title: String(idx + 1),
        },
      ],
      name: [
        {
          type: "TEXT",
          title: lead.fullName || "—",
          isBold: true,
        },
      ],
      phone: [
        {
          type: "TEXT",
          title: lead.phone || "—",
        },
      ],
      totalDebt: [
        {
          type: "TEXT",
          title: lead.totalDebtAmount ? `₹${lead.totalDebtAmount.toLocaleString("en-IN")}` : "—",
        },
      ],
      city: [
        {
          type: "TEXT",
          title: lead.city || "—",
        },
      ],
      status: [
        {
          type: "STATUS",
          title: "Created in CRM",
          bgColor: "#ecfdf5",
          textColor: "#047857",
        },
      ],
    }));

    return {
      columns: createdColumns,
      rows,
      features: { search: true, sort: true },
      isPaginated: false,
      pageNumber: 1,
      totalPages: 1,
      pageSize: 20,
      totalRows: rows.length,
      count: rows.length,
    };
  }, [validationResult]);

  const skippedColumns: TableColumnType[] = [
    { id: "row", title: "Row", width: 70 },
    { id: "name", title: "Borrower Name", width: 180 },
    { id: "phone", title: "Phone", width: 140 },
    { id: "reason", title: "Reason", width: 320 },
  ];

  const skippedTableData: TableDataType = useMemo(() => {
    const list = importSummary?.skippedLeads || [];
    const rows: TableRowType[] = list.map((item) => ({
      row: [
        {
          type: "TEXT",
          title: String(item.row),
        },
      ],
      name: [
        {
          type: "TEXT",
          title: item.name || "—",
          isBold: true,
        },
      ],
      phone: [
        {
          type: "TEXT",
          title: item.phone || "—",
        },
      ],
      reason: [
        {
          type: "STATUS",
          title: item.reason,
          bgColor: "#fef2f2",
          textColor: "#b91c1c",
        },
      ],
    }));

    return {
      columns: skippedColumns,
      rows,
      features: { search: true },
      isPaginated: false,
      pageNumber: 1,
      totalPages: 1,
      pageSize: 20,
      totalRows: rows.length,
      count: rows.length,
    };
  }, [importSummary]);

  return (
    <DynamicModal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={
        <div className="flex items-center gap-2.5">
          <span>Import Leads via Excel / CSV</span>
          {file && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 rounded-md text-xs text-slate-700 font-medium border border-slate-200/80">
              <ExcelIcon width={16} height={16} className="text-emerald-600 shrink-0" />
              <span className="truncate max-w-[280px]">{file.name}</span>
              <span className="text-slate-400 font-normal">•</span>
              <span className="text-[11px] text-slate-500 font-normal">
                {rawRows.length} rows
              </span>
            </div>
          )}
        </div>
      }
      className="w-[80%] max-w-[1100px] h-[90vh] max-h-[90vh] flex flex-col"
      bodyClassName="flex-1 overflow-hidden flex flex-col p-4"
      style={{ overlay: { alignItems: "center", paddingTop: 0 } }}
      close="icon"
    >
      <div className="flex flex-col h-full gap-4 min-h-0">
        {/* ── Stepper Indicator ─────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 px-2 shrink-0">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                currentStep !== "upload"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-primary text-white"
              }`}
            >
              {currentStep !== "upload" ? <CheckCircleOutlined /> : "1"}
            </span>
            <span
              className={`text-xs font-medium ${
                currentStep === "upload" ? "text-slate-900 font-semibold" : "text-slate-500"
              }`}
            >
              Upload File
            </span>
          </div>

          <div className="h-[1px] flex-1 bg-slate-200 mx-3" />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                currentStep === "preview" || currentStep === "summary"
                  ? "bg-emerald-100 text-emerald-700"
                  : currentStep === "map"
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {currentStep === "preview" || currentStep === "summary" ? (
                <CheckCircleOutlined />
              ) : (
                "2"
              )}
            </span>
            <span
              className={`text-xs font-medium ${
                currentStep === "map" ? "text-slate-900 font-semibold" : "text-slate-500"
              }`}
            >
              Map Columns
            </span>
          </div>

          <div className="h-[1px] flex-1 bg-slate-200 mx-3" />

          {/* Step 3 */}
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                currentStep === "summary"
                  ? "bg-emerald-100 text-emerald-700"
                  : currentStep === "preview"
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              3
            </span>
            <span
              className={`text-xs font-medium ${
                currentStep === "preview" ? "text-slate-900 font-semibold" : "text-slate-500"
              }`}
            >
              Preview & Validate
            </span>
          </div>
        </div>

        {/* ── STEP 1: FILE UPLOAD ────────────────────────────────────── */}
        {currentStep === "upload" && (
          <div className="flex flex-col flex-1 min-h-0 justify-between gap-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-primary/60 hover:bg-primary/5 transition-colors rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 flex-1 min-h-[280px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mb-3">
                <InboxOutlined />
              </div>
              <p className="text-base font-semibold text-slate-800 m-0">
                Click or drag & drop Excel / CSV file here
              </p>
              <p className="text-xs text-slate-500 mt-1 mb-0">
                Supports .xlsx, .xls, and .csv files (up to 500 leads per import)
              </p>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <ExcelIcon width={18} height={18} className="text-emerald-600 shrink-0" />
                <span>Need help with column format? Use our pre-formatted template.</span>
              </div>
              <ButtonField
                type="default"
                size="small"
                onClick={handleDownloadTemplate}
                icon={<DownloadOutlined />}
                className="text-xs text-slate-700 font-medium"
              >
                Download Template
              </ButtonField>
            </div>
          </div>
        )}

        {/* ── STEP 2: COLUMN MAPPING ─────────────────────────────────── */}
        {currentStep === "map" && file && (
          <div className="flex flex-col flex-1 min-h-0 gap-3">
            {/* Column Mapping Table using StaticTable */}
            <div className="flex-1 min-h-0 w-full border border-slate-200 rounded-lg overflow-hidden flex flex-col">
              <StaticTable
                filterKey="bulk-leads-mapping"
                staticData={mappingTableData}
              />
            </div>

            {/* Validation / Error Handling Banners */}
            {(!isNameMapped || !isPhoneMapped) && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-800 shrink-0">
                <ExclamationCircleOutlined className="text-rose-500 text-sm mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold">Mandatory Fields Missing: </span>
                  Please map both <strong className="underline">Full Name</strong> and{" "}
                  <strong className="underline">Phone Number</strong> to continue.
                </div>
              </div>
            )}

            {isNameMapped && isPhoneMapped && (
              <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-lg flex flex-col gap-1 text-xs text-amber-800 shrink-0">
                {unmappedCount > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>
                      <strong>{unmappedCount} Unmapped Column(s):</strong> Any unmapped column
                      will be safely ignored.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircleOutlined className="text-emerald-600" />
                    <span>All columns mapped properly. Ready for validation!</span>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 shrink-0">
              <ButtonField
                type="default"
                onClick={() => setCurrentStep("upload")}
                icon={<ArrowLeftOutlined />}
              >
                Back to Upload
              </ButtonField>
              <ButtonField
                type="primary"
                disabled={!isNameMapped || !isPhoneMapped}
                onClick={handleValidateAndPreview}
                loading={isValidating}
                icon={<ArrowRightOutlined />}
                className="bg-primary text-white"
              >
                Validate & Preview ({rawRows.length} Leads)
              </ButtonField>
            </div>
          </div>
        )}

        {/* ── STEP 3: PREVIEW & CONFIRM (Using StaticTable) ───────────── */}
        {currentStep === "preview" && (
          <div className="flex flex-col flex-1 min-h-0 gap-3">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex-wrap gap-2 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">Validation Results:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {validationResult?.validCount || 0} Valid Leads
                </span>
                {(validationResult?.duplicateCount || 0) > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                    {validationResult?.duplicateCount} Duplicates (will be skipped)
                  </span>
                )}
                {(validationResult?.invalidCount || 0) > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
                    {validationResult?.invalidCount} Invalid Rows (will be skipped)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <LabelField className="mb-0 text-xs text-slate-600 font-medium">
                  Assign Default Source:
                </LabelField>
                <div className="w-48">
                  <SelectField
                    id="defaultSource"
                    name="defaultSource"
                    control={control}
                    className="text-xs"
                    options={[
                      { key: "EXCEL_IMPORT", value: "Excel Import" },
                      { key: "OUTBOUND_CALL", value: "Outbound Call" },
                      { key: "FACEBOOK_ADS", value: "Facebook Ads" },
                      { key: "GOOGLE_ADS", value: "Google Ads" },
                      { key: "WEBSITE_FORM", value: "Website Form" },
                      { key: "PARTNER_REFERRAL", value: "Partner Referral" },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* StaticTable Preview of Mapped Leads */}
            <div className="flex-1 min-h-0 w-full border border-slate-200 rounded-lg overflow-hidden flex flex-col">
              <StaticTable
                filterKey="bulk-leads-preview"
                staticData={previewTableData}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 shrink-0">
              <ButtonField
                type="default"
                onClick={() => setCurrentStep("map")}
                disabled={isSubmitting}
                icon={<ArrowLeftOutlined />}
              >
                Back to Mapping
              </ButtonField>
              <ButtonField
                type="primary"
                onClick={handleConfirmImport}
                loading={isSubmitting}
                disabled={!validationResult || validationResult.validCount === 0}
                className="bg-primary text-white"
              >
                Import {validationResult?.validCount || 0} Leads
              </ButtonField>
            </div>
          </div>
        )}

        {/* ── STEP 4: SUMMARY & DEDUPLICATION REPORT (Enhanced UI) ─ */}
        {currentStep === "summary" && importSummary && (
          <div className="flex flex-col flex-1 min-h-0 gap-3">
            {/* Success Hero Banner */}
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircleOutlined className="text-emerald-600 text-2xl" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 m-0">
                    Bulk Import Processed Successfully!
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5 mb-0">
                    Successfully ingested <strong>{importSummary.createdCount}</strong> leads into your CRM database.
                  </p>
                </div>
              </div>
            </div>

            {/* KPI Stat Cards */}
            <div className="grid grid-cols-4 gap-3 shrink-0">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-500 font-medium block">Total In Spreadsheet</span>
                <span className="text-lg font-bold text-slate-800">{rawRows.length} rows</span>
              </div>
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                <span className="text-[11px] text-emerald-700 font-medium block">Created in CRM</span>
                <span className="text-lg font-bold text-emerald-800">{importSummary.createdCount} leads</span>
              </div>
              <div
                className={`p-3 rounded-lg border ${
                  importSummary.skippedCount > 0 ? "bg-amber-50/70 border-amber-200" : "bg-slate-50 border-slate-200"
                }`}
              >
                <span
                  className={`text-[11px] font-medium block ${
                    importSummary.skippedCount > 0 ? "text-amber-700" : "text-slate-500"
                  }`}
                >
                  Skipped (Duplicates / Errors)
                </span>
                <span
                  className={`text-lg font-bold ${
                    importSummary.skippedCount > 0 ? "text-amber-800" : "text-slate-700"
                  }`}
                >
                  {importSummary.skippedCount} leads
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-500 font-medium block">Source Channel</span>
                <span className="text-sm font-semibold text-slate-800 truncate block mt-0.5">
                  {defaultSource.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Tab switch between Created Leads and Skipped Leads */}
            <div className="flex items-center justify-between border-b border-slate-200 shrink-0 pb-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSummaryTab("created")}
                  className={`text-xs font-semibold pb-1.5 px-2 border-b-2 transition-colors cursor-pointer ${
                    summaryTab === "created"
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Created Leads ({importSummary.createdCount})
                </button>
                {importSummary.skippedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setSummaryTab("skipped")}
                    className={`text-xs font-semibold pb-1.5 px-2 border-b-2 transition-colors cursor-pointer ${
                      summaryTab === "skipped"
                        ? "border-amber-600 text-amber-700"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Skipped Leads ({importSummary.skippedCount})
                  </button>
                )}
              </div>
            </div>

            {/* Content Table Area */}
            <div className="flex-1 min-h-0 w-full border border-slate-200 rounded-lg overflow-hidden flex flex-col">
              {summaryTab === "created" ? (
                <StaticTable
                  filterKey="bulk-leads-created-summary"
                  staticData={createdTableData}
                />
              ) : (
                <StaticTable
                  filterKey="bulk-leads-skipped-summary"
                  staticData={skippedTableData}
                />
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 shrink-0">
              <ButtonField
                type="default"
                onClick={() => {
                  setCurrentStep("upload");
                  setFile(null);
                  setColumns([]);
                  setRawRows([]);
                  setColumnMapping({});
                  setValidationResult(null);
                  setImportSummary(null);
                  setSummaryTab("created");
                  reset();
                }}
                icon={<InboxOutlined />}
              >
                Import Another File
              </ButtonField>
              <ButtonField
                type="primary"
                onClick={handleResetAndClose}
                className="bg-primary text-white px-6"
              >
                Done
              </ButtonField>
            </div>
          </div>
        )}
      </div>
    </DynamicModal>
  );
}
