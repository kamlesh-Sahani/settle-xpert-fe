"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";
import api from "@/common/utils/api";
import LoadingSpinner from "@/common/basic/LoadingSpinner";
import ButtonField from "@/common/basic/ButtonField";
import DynamicHeader from "@/common/dynamic/DynamicHeader";
import { ErrorApi } from "@/common/ui/ErrorApi";
import { Tag, Tabs, Dropdown, MenuProps } from "antd";
import {
  ArrowLeftOutlined,
  BankOutlined,
  ContactsOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  DollarCircleOutlined,
  EditOutlined,
  FolderOpenOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import DynamicModal from "@/common/dynamic/DynamicModal";
import { responseError } from "@/common/utils";

interface LoanSettlementItem {
  id: string;
  lender: string;
  loanType: string;
  accountNumber?: string;
  originalAmount: number;
  outstandingAmount: number;
  settlementOffered?: number;
  settlementApproved?: number;
  savingsAmount?: number;
  savingsPercent?: number;
  status: string;
  remarks?: string;
  updatedAt?: string;
}

interface Address {
  line1?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

interface FinancialAssessment {
  monthlyIncome?: number;
  totalMonthlyEmi?: number;
  overdueDuration?: string;
  reasonForDifficulty?: string;
  desiredOutcome?: string;
  totalDebtAmount?: number;
  outstandingAmount?: number;
}

interface CustomerData {
  id: string;
  customerNumber: string;
  caseNumber?: string;
  caseStatus?: string;
  leadId?: string;
  leadNumber?: string;
  fullName: string;
  email?: string;
  phone: string;
  alternatePhone?: string;
  dob?: string;
  panCard?: string;
  address?: Address;
  city?: string;
  state?: string;
  status: string;
  totalDebtAmount: number;
  outstandingAmount: number;
  financialAssessment?: FinancialAssessment;
  loans?: LoanSettlementItem[];
  debts?: { lender: string; loanType: string; outstandingAmount: number; monthlyEmi: number }[];
  assignedTo?: string;
  assignedToName?: string;
  assignedTeam?: string;
  convertedBy?: string;
  convertedByName?: string;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const CASE_STAGES = [
  { key: "ONBOARDING", label: "Client Onboarding", desc: "Intake form & client consent" },
  { key: "DOCS_VERIFICATION", label: "Documents Verified", desc: "KYC & loan statements audited" },
  { key: "BANK_NEGOTIATION", label: "Bank Negotiation", desc: "Settlement notices & offers active" },
  { key: "PARTIALLY_SETTLED", label: "Settlements in Progress", desc: "Offers approved by lenders" },
  { key: "RESOLVED", label: "Debt Free & Closed", desc: "All debts settled with NDC" },
] as const;

const SETTLEMENT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending Review", color: "default" },
  IN_NEGOTIATION: { label: "In Negotiation", color: "blue" },
  OTS_APPROVED: { label: "OTS Approved", color: "warning" },
  SETTLED: { label: "Settled", color: "success" },
  CLOSED: { label: "Closed with NDC", color: "purple" },
};

export default function CustomerDetailView({ customerId }: { customerId?: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("settlements");
  const [isUpdatingCase, setIsUpdatingCase] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanSettlementItem | null>(null);
  const [loanForm, setLoanForm] = useState({
    accountNumber: "",
    settlementOffered: 0,
    settlementApproved: 0,
    status: "PENDING",
    remarks: "",
  });
  const [isSavingLoan, setIsSavingLoan] = useState(false);
  const [loanSaveError, setLoanSaveError] = useState<string | null>(null);

  const { data: fetchResponse, loading, error, refetch } = useFetch<{ data: CustomerData }>({
    client: api.get,
    url: `/api/v1/customer/get?id=${customerId}`,
    dontCall: !customerId,
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (!fetchResponse?.data) {
    return (
      <div className="flex h-screen items-center justify-center bg-white p-8">
        <ErrorApi
          title="Customer Not Found"
          message={error || "We could not find the requested customer record."}
          onRetry={refetch}
          action={
            <ButtonField onClick={() => router.push("/customers")}>
              Back to Customers
            </ButtonField>
          }
        />
      </div>
    );
  }

  const cust = fetchResponse.data;
  const currentCaseStatus = cust.caseStatus || "ONBOARDING";
  const currentStageIndex = CASE_STAGES.findIndex((s) => s.key === currentCaseStatus);

  const handleUpdateCaseStatus = async (newStatus: string) => {
    setIsUpdatingCase(true);
    try {
      const res = await api.post("/api/v1/customer/case-status", {
        customerId: cust.id,
        caseStatus: newStatus,
      });
      if (res.data?.success) {
        refetch();
      }
    } catch (err) {
      console.error("Failed to update case status:", err);
    } finally {
      setIsUpdatingCase(false);
    }
  };

  const handleOpenEditLoan = (loan: LoanSettlementItem) => {
    setEditingLoan(loan);
    setLoanForm({
      accountNumber: loan.accountNumber || "",
      settlementOffered: loan.settlementOffered || 0,
      settlementApproved: loan.settlementApproved || 0,
      status: loan.status || "PENDING",
      remarks: loan.remarks || "",
    });
    setLoanSaveError(null);
  };

  const handleSaveLoanSettlement = async () => {
    if (!editingLoan) return;
    setIsSavingLoan(true);
    setLoanSaveError(null);
    try {
      const res = await api.post("/api/v1/customer/loan/update", {
        customerId: cust.id,
        loanId: editingLoan.id,
        accountNumber: loanForm.accountNumber,
        settlementOffered: Number(loanForm.settlementOffered) || 0,
        settlementApproved: Number(loanForm.settlementApproved) || 0,
        status: loanForm.status,
        remarks: loanForm.remarks,
      });
      if (res.data?.success) {
        setEditingLoan(null);
        refetch();
      } else {
        setLoanSaveError(res.data?.message || "Failed to update loan details");
      }
    } catch (err) {
      setLoanSaveError(responseError(err));
    } finally {
      setIsSavingLoan(false);
    }
  };

  const loans = cust.loans && cust.loans.length > 0 ? cust.loans : [];
  const totalOriginalDebt = cust.totalDebtAmount || loans.reduce((acc, l) => acc + (l.originalAmount || 0), 0);
  const totalSettledAmount = loans.reduce((acc, l) => acc + (l.settlementApproved || 0), 0);
  const totalSavings = loans.reduce((acc, l) => acc + (l.savingsAmount || 0), 0);

  const caseStatusMenuItems: MenuProps["items"] = CASE_STAGES.map((stage) => ({
    key: stage.key,
    label: (
      <div className="py-1">
        <p className="font-semibold text-xs text-slate-800 m-0">{stage.label}</p>
        <p className="text-[11px] text-slate-400 m-0">{stage.desc}</p>
      </div>
    ),
    onClick: () => handleUpdateCaseStatus(stage.key),
  }));

  const rightSection = (
    <div className="flex items-center gap-3">
      {cust.leadId && (
        <ButtonField
          type="default"
          icon={<ContactsOutlined className="text-xs" />}
          onClick={() => router.push(`/employee/leads/detail/${cust.leadId}`)}
          className="h-[38px] text-xs font-semibold rounded-lg px-3.5 flex items-center gap-1.5"
        >
          Origin Lead ({cust.leadNumber || "Lead"})
        </ButtonField>
      )}
      <ButtonField
        type="primary"
        icon={<ArrowLeftOutlined className="text-xs" />}
        onClick={() => router.push("/customers")}
        className="h-[38px] text-xs font-semibold rounded-lg px-4 flex items-center gap-1.5 shadow-2xs"
      >
        All Customers
      </ButtonField>
    </div>
  );

  const tabItems = [
    {
      key: "settlements",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <BankOutlined /> Case & Loan Settlements
        </span>
      ),
      children: (
        <div className="space-y-6 pt-2">
          {/* Visual Case Pipeline Stepper */}
          <div className="bg-white rounded-xl border border-border p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 m-0 flex items-center gap-2">
                  <FolderOpenOutlined className="text-primary" /> Case Resolution Pipeline
                </h3>
                <p className="text-xs text-slate-400 m-0 mt-0.5">
                  Current Case File: <span className="font-mono font-medium text-slate-700">{cust.caseNumber || "CASE-ACTIVE"}</span>
                </p>
              </div>
              <Dropdown menu={{ items: caseStatusMenuItems }} trigger={["click"]}>
                <ButtonField
                  type="default"
                  loading={isUpdatingCase}
                  icon={<EditOutlined className="text-xs" />}
                  className="text-xs font-semibold h-8.5 rounded-lg border-primary text-primary hover:!bg-primary/5"
                >
                  Change Case Stage
                </ButtonField>
              </Dropdown>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
              {CASE_STAGES.map((stage, idx) => {
                const isPassed = currentStageIndex >= idx;
                const isCurrent = currentStageIndex === idx;
                return (
                  <div
                    key={stage.key}
                    onClick={() => handleUpdateCaseStatus(stage.key)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-primary/10 border-primary text-primary ring-1 ring-primary/30"
                        : isPassed
                        ? "bg-slate-50 border-slate-200 text-slate-700"
                        : "bg-white border-dashed border-slate-200 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                        Stage {idx + 1}
                      </span>
                      {isPassed && <CheckCircleOutlined className="text-xs text-emerald-600" />}
                    </div>
                    <p className="font-semibold text-xs m-0 leading-tight">{stage.label}</p>
                    <p className="text-[11px] opacity-80 m-0 mt-1 line-clamp-1">{stage.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Settlement KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4.5 bg-slate-50/90 rounded-xl border border-slate-200/60">
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Total Enrolled Debt</span>
              <p className="text-xl font-semibold tracking-tight text-slate-800 m-0">
                ₹{totalOriginalDebt.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="space-y-0.5 sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Remaining Balance</span>
              <p className="text-xl font-semibold tracking-tight text-rose-600 m-0">
                ₹{(cust.outstandingAmount ?? totalOriginalDebt).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="space-y-0.5 sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Approved Settlements</span>
              <p className="text-xl font-semibold tracking-tight text-emerald-600 m-0">
                ₹{totalSettledAmount > 0 ? totalSettledAmount.toLocaleString("en-IN") : "0"}
              </p>
            </div>
            <div className="space-y-0.5 sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Negotiated Savings</span>
              <p className="text-xl font-semibold tracking-tight text-blue-600 m-0">
                ₹{totalSavings > 0 ? totalSavings.toLocaleString("en-IN") : "0"}
              </p>
            </div>
          </div>

          {/* Individual Bank Loan Settlement Cards */}
          <div className="bg-white rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 m-0 flex items-center gap-2">
                  <DollarCircleOutlined className="text-primary" /> Creditor Accounts & Bank Settlements
                </h3>
                <p className="text-xs text-slate-400 m-0 mt-0.5">
                  Track individual one-time settlement (OTS) negotiation progress for each bank
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/70">
                {loans.length} {loans.length === 1 ? "Creditor" : "Creditors"}
              </span>
            </div>

            {loans.length > 0 ? (
              <div className="space-y-3">
                {loans.map((loan, idx) => {
                  const statusInfo = SETTLEMENT_STATUS_MAP[loan.status] || {
                    label: loan.status,
                    color: "default",
                  };
                  return (
                    <div
                      key={loan.id || idx}
                      className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-primary/40 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 mt-0.5">
                          <BankOutlined className="text-base" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-slate-900 m-0">{loan.lender}</h4>
                            <Tag color={statusInfo.color as any} className="m-0 text-[11px] font-semibold">
                              {statusInfo.label}
                            </Tag>
                          </div>
                          <p className="text-xs text-slate-500 m-0">
                            {loan.loanType} {loan.accountNumber ? `• A/C: ${loan.accountNumber}` : "• A/C: Not provided"}
                          </p>
                          {loan.remarks && (
                            <p className="text-xs text-slate-600 italic m-0 pt-0.5">
                              &ldquo;{loan.remarks}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                        <div className="text-left md:text-right">
                          <span className="text-[11px] text-slate-400 block">Original Debt</span>
                          <span className="text-sm font-semibold text-slate-800">
                            ₹{(loan.originalAmount ?? loan.outstandingAmount ?? 0).toLocaleString("en-IN")}
                          </span>
                        </div>

                        {loan.settlementApproved && loan.settlementApproved > 0 ? (
                          <div className="text-left md:text-right">
                            <span className="text-[11px] text-emerald-600 font-medium block">Approved OTS</span>
                            <span className="text-sm font-bold text-emerald-700">
                              ₹{loan.settlementApproved.toLocaleString("en-IN")}
                            </span>
                            {loan.savingsPercent ? (
                              <span className="text-[10px] text-emerald-600 block">
                                ({loan.savingsPercent.toFixed(0)}% Savings)
                              </span>
                            ) : null}
                          </div>
                        ) : null}

                        <ButtonField
                          type="default"
                          icon={<EditOutlined className="text-xs" />}
                          onClick={() => handleOpenEditLoan(loan)}
                          className="h-8 text-xs font-medium rounded-lg border-slate-300 hover:border-primary text-slate-700"
                        >
                          Update Settlement
                        </ButtonField>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No creditor loan accounts registered for this customer.
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "profile",
      label: (
        <span className="flex items-center gap-1.5 font-medium">
          <FileTextOutlined /> Profile & KYC
        </span>
      ),
      children: (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Personal Info */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-border p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 m-0 flex items-center gap-2">
              <FileTextOutlined className="text-primary" /> Contact & Identification
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Full Name</span>
                <p className="font-semibold text-slate-800 text-sm m-0">{cust.fullName}</p>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Phone Number</span>
                <p className="text-slate-700 m-0 flex items-center gap-1.5 font-medium">
                  <PhoneOutlined className="text-slate-400" /> {cust.phone || "—"}
                </p>
              </div>
              {cust.alternatePhone && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Alternate Phone</span>
                  <p className="text-slate-700 m-0 font-medium">{cust.alternatePhone}</p>
                </div>
              )}
              {cust.email && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Email</span>
                  <p className="text-slate-700 m-0 flex items-center gap-1.5 font-medium">
                    <MailOutlined className="text-slate-400" /> {cust.email}
                  </p>
                </div>
              )}
              <div>
                <span className="text-slate-400 block mb-0.5">Location</span>
                <p className="text-slate-700 m-0 flex items-center gap-1.5 font-medium">
                  <EnvironmentOutlined className="text-slate-400" />
                  {[cust.city, cust.state].filter(Boolean).join(", ") || "—"}
                </p>
              </div>
              {cust.panCard && (
                <div>
                  <span className="text-slate-400 block mb-0.5">PAN Card</span>
                  <p className="text-slate-700 font-mono font-medium m-0">{cust.panCard}</p>
                </div>
              )}
              {cust.dob && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Date of Birth</span>
                  <p className="text-slate-700 font-medium m-0">{cust.dob}</p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
              <h4 className="font-semibold text-slate-700 m-0 text-xs">Account Assignment</h4>
              <div className="flex justify-between">
                <span className="text-slate-400">Case Manager:</span>
                <span className="font-medium text-slate-700">{cust.assignedToName || "Unassigned"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Converted By:</span>
                <span className="font-medium text-slate-700">{cust.convertedByName || "System"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Converted Date:</span>
                <span className="font-medium text-slate-700">
                  {cust.convertedAt ? dayjs(cust.convertedAt).format("DD MMM YYYY") : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Assessment */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-border p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 m-0 flex items-center gap-2">
              <SafetyCertificateOutlined className="text-primary" /> Hardship & Financial Assessment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 block mb-1">Monthly Income</span>
                <p className="text-base font-semibold text-slate-800 m-0">
                  ₹{(cust.financialAssessment?.monthlyIncome ?? 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="text-slate-400 block mb-1">Total Monthly EMI</span>
                <p className="text-base font-semibold text-slate-800 m-0">
                  ₹{(cust.financialAssessment?.totalMonthlyEmi ?? 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              {cust.financialAssessment?.overdueDuration && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Overdue Duration</span>
                  <p className="text-slate-700 font-medium m-0">{cust.financialAssessment.overdueDuration}</p>
                </div>
              )}
              {cust.financialAssessment?.reasonForDifficulty && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Reason for Financial Difficulty</span>
                  <p className="text-slate-700 font-medium m-0">{cust.financialAssessment.reasonForDifficulty}</p>
                </div>
              )}
              {cust.financialAssessment?.desiredOutcome && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Desired Settlement Outcome</span>
                  <p className="text-slate-700 font-medium m-0">{cust.financialAssessment.desiredOutcome}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] w-full min-h-screen">
      <DynamicHeader
        title="Customers"
        subTitles={[cust.customerNumber, cust.fullName]}
        filterKey="customer-detail"
        rightSection={rightSection}
        onRefresh={refetch}
      />

      <div className="flex-1 px-6 py-4 max-w-7xl mx-auto w-full space-y-4">
        {/* Top Profile Card */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 font-bold text-xl flex items-center justify-center shrink-0 border border-blue-100">
              {(cust.fullName?.[0] || "C").toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-snug m-0">
                  {cust.fullName}
                </h1>
                <Tag color="blue" className="font-semibold text-xs m-0">
                  {cust.customerNumber}
                </Tag>
                <Tag color="purple" className="font-semibold text-xs m-0">
                  {cust.caseNumber || "CASE-ACTIVE"}
                </Tag>
                <Tag color="green" className="font-semibold text-xs m-0 inline-flex items-center gap-1">
                  <CheckCircleOutlined /> {cust.status}
                </Tag>
              </div>
              <p className="text-xs text-slate-500 m-0 mt-1">
                Converted on {cust.convertedAt ? dayjs(cust.convertedAt).format("DD MMM YYYY") : "—"} by {cust.convertedByName || "System"}
              </p>
            </div>
          </div>

          <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs lg:border-l lg:border-slate-200 lg:pl-6">
            <div>
              <span className="text-[11px] text-slate-400 block font-normal">Phone</span>
              <span className="font-medium text-slate-800">{cust.phone || "—"}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-normal">Email</span>
              <span className="font-medium text-slate-800 truncate block">{cust.email || "—"}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-normal">Location</span>
              <span className="font-medium text-slate-800">{[cust.city, cust.state].filter(Boolean).join(", ") || "—"}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-normal">Case Manager</span>
              <span className="font-medium text-slate-800">{cust.assignedToName || "Unassigned"}</span>
            </div>
          </div>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} className="custom-detail-tabs" />
      </div>

      {/* Edit Loan Settlement Modal */}
      {editingLoan && (
        <DynamicModal
          isOpen={Boolean(editingLoan)}
          onClose={() => setEditingLoan(null)}
          title={`Update Settlement — ${editingLoan.lender}`}
          close="icon"
          className="!w-[520px] !max-w-[95vw]"
        >
          <div className="p-5 space-y-4 text-xs">
            {loanSaveError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                {loanSaveError}
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Bank Loan / Credit Card Account Number</label>
              <input
                type="text"
                value={loanForm.accountNumber}
                onChange={(e) => setLoanForm({ ...loanForm, accountNumber: e.target.value })}
                placeholder="e.g. 4312-XXXX-8901"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Original Debt (₹)</label>
                <input
                  type="text"
                  disabled
                  value={`₹${(editingLoan.originalAmount ?? editingLoan.outstandingAmount ?? 0).toLocaleString("en-IN")}`}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded-lg text-xs text-slate-500 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Approved Settlement / OTS (₹)</label>
                <input
                  type="number"
                  value={loanForm.settlementApproved}
                  onChange={(e) => setLoanForm({ ...loanForm, settlementApproved: Number(e.target.value) })}
                  placeholder="e.g. 120000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-primary font-semibold text-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Settlement Status</label>
              <select
                value={loanForm.status}
                onChange={(e) => setLoanForm({ ...loanForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-primary bg-white"
              >
                <option value="PENDING">Pending Review</option>
                <option value="IN_NEGOTIATION">In Negotiation</option>
                <option value="OTS_APPROVED">OTS Offer Approved</option>
                <option value="SETTLED">Settled (Payment Made)</option>
                <option value="CLOSED">Closed with NDC (No Dues Certificate)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Negotiation Remarks & Terms</label>
              <textarea
                rows={3}
                value={loanForm.remarks}
                onChange={(e) => setLoanForm({ ...loanForm, remarks: e.target.value })}
                placeholder="e.g. Bank agreed to 45% settlement payable in two equal installments by 15th Nov."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <ButtonField
                type="default"
                onClick={() => setEditingLoan(null)}
                className="text-xs h-8.5 rounded-lg px-4"
              >
                Cancel
              </ButtonField>
              <ButtonField
                type="primary"
                loading={isSavingLoan}
                onClick={handleSaveLoanSettlement}
                className="text-xs h-8.5 rounded-lg px-4"
              >
                Save Settlement Details
              </ButtonField>
            </div>
          </div>
        </DynamicModal>
      )}
    </div>
  );
}
