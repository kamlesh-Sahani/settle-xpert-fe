"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";
import api from "@/common/utils/api";
import LoadingSpinner from "@/common/basic/LoadingSpinner";
import ButtonField from "@/common/basic/ButtonField";
import DynamicHeader from "@/common/dynamic/DynamicHeader";
import { ErrorApi } from "@/common/ui/ErrorApi";
import { Tag, Tabs, Dropdown, ConfigProvider } from "antd";
import { DownOutlined, ExpandOutlined, EditOutlined, ClockCircleOutlined } from "@ant-design/icons";
import DynamicModal from "@/common/dynamic/DynamicModal";
import DynamicConfirmationModal from "@/common/dynamic/DynamicConfirmationModal";
import { SubmitStatusType } from "@/common/form/FormStatusMessage";
import { responseError } from "@/common/utils";
import dayjs from "dayjs";
import ProfileIcon from "@/common/icons/ProfileIcon";
import { FiExternalLink, FiAlertCircle } from "react-icons/fi";
import LeadFollowUp from "./components/LeadFollowUp";
import { WhatsAppChatBubbleView } from "@/app/employee/leads/[leadCrud]/components/LeadConversation";
import { parseWhatsAppChat, ParsedChatMessage } from "@/app/employee/leads/[leadCrud]/lead.utils";

interface DebtItem {
  id?: string;
  lender: string;
  loanType: string;
  outstandingAmount: number;
  monthlyEmi: number;
  status?: string;
}

interface ConversationItem {
  id?: string;
  callStartTime?: string;
  callEndTime?: string;
  duration?: string;
  outcome?: string;
  whatsappChat?: string;
  discussionNotes?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  createdAt: string;
}

interface ActivityItem {
  id?: string;
  type: string;
  description: string;
  performedByName?: string;
  createdAt: string;
}

interface FollowUpItem {
  id?: string;
  dueDate: string;
  assignedToName?: string;
  status: string;
  notes?: string;
  createdAt?: string;
  completedAt?: string;
}

interface AssignmentLog {
  id?: string;
  assignedToName?: string;
  assignedByName?: string;
  assignedAt: string;
  reason?: string;
}

interface Address {
  line1?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

interface FinancialAssessment {
  monthlyIncome: number;
  totalMonthlyEmi?: number;
  overdueDuration?: string;
  reasonForDifficulty?: string;
  desiredOutcome?: string;
  totalDebtAmount?: number;
  outstandingAmount?: number;
}

interface LeadData {
  id: string;
  leadNumber: string;
  fullName: string;
  email?: string;
  phone: string;
  alternatePhone?: string;
  dob?: string;
  panCard?: string;
  address?: Address;
  city?: string;
  state?: string;
  serviceRequired: string;
  source: string;
  priority: string;
  initialEnquiry?: string;
  qualificationNotes?: string;
  status: string;
  isReengaged?: boolean;
  repeatEnquiryCount?: number;
  lastEnquiryAt?: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedTeam?: string;
  assignmentHistory?: AssignmentLog[];
  totalDebtAmount: number;
  outstandingAmount: number;
  financialAssessment?: FinancialAssessment;
  debts?: DebtItem[];
  conversations?: ConversationItem[];
  followUps?: FollowUpItem[];
  activityTimeline?: ActivityItem[];
  lostReason?: string;
  closingNotes?: string;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = [
  { key: "NEW", label: "New", dotColor: "bg-[#3b82f6]" },
  { key: "CONTACTED", label: "Contacted", dotColor: "bg-[#0284c7]" },
  { key: "QUALIFIED", label: "Qualified", dotColor: "bg-[#16a34a]" },
  { key: "IN_PROGRESS", label: "In Progress", dotColor: "bg-[#6366f1]" },
  { key: "FOLLOW_UP", label: "Follow Up", dotColor: "bg-[#f59e0b]" },
  { key: "RE_ENGAGED", label: "Re-engaged", dotColor: "bg-[#8b5cf6]" },
  { key: "UNQUALIFIED", label: "Unqualified", dotColor: "bg-[#94a3b8]" },
  { key: "UNREACHABLE", label: "Unreachable", dotColor: "bg-[#64748b]" },
  { key: "CONVERTED", label: "Converted", dotColor: "bg-[#0d9488]" },
  { key: "LOST", label: "Lost", dotColor: "bg-[#ef4444]" },
] as const;

const TIMELINE_THEMES = [
  {
    border: "border-[#eab308]",
    bg: "bg-[#fef9c3]",
    dot: "bg-[#ca8a04]",
    line: "bg-[#fde047]",
  },
  {
    border: "border-[#3b82f6]",
    bg: "bg-[#eff6ff]",
    dot: "bg-[#2563eb]",
    line: "bg-[#bfdbfe]",
  },
  {
    border: "border-[#22c55e]",
    bg: "bg-[#f0fdf4]",
    dot: "bg-[#16a34a]",
    line: "bg-[#bbf7d0]",
  },
  {
    border: "border-[#a855f7]",
    bg: "bg-[#faf5ff]",
    dot: "bg-[#9333ea]",
    line: "bg-[#e9d5ff]",
  },
  {
    border: "border-[#ef4444]",
    bg: "bg-[#fef2f2]",
    dot: "bg-[#dc2626]",
    line: "bg-[#fecaca]",
  },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (name[0] || "C").toUpperCase();
}

export default function LeadDetailView({ leadId }: { leadId?: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<SubmitStatusType | null>(null);
  const [viewingChat, setViewingChat] = useState<{ title: string; messages: ParsedChatMessage[] } | null>(null);

  const { data: fetchResponse, loading, error, refetch } = useFetch<{ data: LeadData }>({
    client: api.get,
    url: `/api/v1/lead/get?id=${leadId}`,
    dontCall: !leadId,
  });

  const handleCloseStatusModal = () => {
    if (isStatusUpdating) return;
    setIsStatusModalOpen(false);
    setPendingStatus(null);
    setStatusFeedback(null);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatus || !fetchResponse?.data?.id) return;

    setIsStatusUpdating(true);
    setStatusFeedback(null);
    try {
      const res = await api.get(
        `/api/v1/lead/status?id=${fetchResponse.data.id}&status=${pendingStatus}`
      );
      if (res.data?.success) {
        setStatusFeedback({
          type: "success",
          text: res.data?.message || "Lead status updated successfully",
        });
        setTimeout(() => {
          setIsStatusModalOpen(false);
          setPendingStatus(null);
          setStatusFeedback(null);
          refetch();
        }, 700);
      } else {
        setStatusFeedback({
          type: "error",
          text: res.data?.message || "Failed to update lead status",
        });
      }
    } catch (err: any) {
      setStatusFeedback({
        type: "error",
        text: responseError(err),
      });
    } finally {
      setIsStatusUpdating(false);
    }
  };

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
          title="Lead Not Found"
          message={error || "We could not find the requested lead record."}
          onRetry={refetch}
          action={
            <ButtonField onClick={() => router.push("/employee/leads")}>
              Back to Leads
            </ButtonField>
          }
        />
      </div>
    );
  }

  const currentStatusObj = STATUS_OPTIONS.find(
    (s) => s.key === (fetchResponse.data.status || "").toUpperCase()
  ) || {
    key: fetchResponse.data.status,
    label: fetchResponse.data.status,
    dotColor: "bg-[#16a34a]",
  };

  const statusMenuItems = STATUS_OPTIONS.map((item) => ({
    key: item.key,
    label: (
      <div className="flex items-center gap-2 py-1 px-1">
        <span className={`w-2.5 h-2.5 rounded-full ${item.dotColor}`} />
        <span className="text-sm font-semibold text-text-primary">{item.label}</span>
      </div>
    ),
    onClick: () => {
      if (item.key !== fetchResponse.data.status) {
        setPendingStatus(item.key);
        setStatusFeedback(null);
        setIsStatusModalOpen(true);
      }
    },
  }));

  const rightSection = (
    <div className="flex items-center gap-3">
      <ButtonField
        type="primary"
        icon={<EditOutlined className="text-xs" />}
        onClick={() => router.push(`/employee/leads/${fetchResponse.data.id}`)}
        className="h-[38px] text-xs font-semibold rounded-lg px-4 flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all"
      >
        Edit Details
      </ButtonField>
      <Dropdown menu={{ items: statusMenuItems }} trigger={["click"]}>
        <div className="relative flex items-center justify-between min-w-[130px] px-3 h-[38px] border border-border rounded-lg bg-background hover:border-text-secondary transition-colors cursor-pointer select-none">
          <span className="absolute -top-2 left-2 px-1 bg-background text-[11px] font-medium text-text-secondary leading-none">
            Status
          </span>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${currentStatusObj.dotColor}`} />
            <span className="text-sm font-medium text-text-primary">
              {currentStatusObj.label}
            </span>
          </div>
          <DownOutlined className="text-[10px] text-text-secondary ml-2" />
        </div>
      </Dropdown>
    </div>
  );

  const tabItems = [
    {
      key: "overview",
      label: "Overview & Debts",
      children: (
        <div className="space-y-6 pt-2">
          {/* Financial KPI Numbers Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4.5 bg-slate-50/90 rounded-xl border border-slate-200/60">
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Total Debt</span>
              <p className="text-xl font-semibold tracking-tight text-slate-800 m-0">
                ₹{(fetchResponse.data.totalDebtAmount ?? 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="space-y-0.5 sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Outstanding Balance</span>
              <p className="text-xl font-semibold tracking-tight text-rose-600 m-0">
                ₹{(fetchResponse.data.outstandingAmount ?? 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="space-y-0.5 sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Monthly Income</span>
              <p className="text-xl font-semibold tracking-tight text-slate-800 m-0">
                ₹{(fetchResponse.data.financialAssessment?.monthlyIncome ?? 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="space-y-0.5 sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Monthly EMI</span>
              <p className="text-xl font-semibold tracking-tight text-slate-800 m-0">
                ₹{(fetchResponse.data.financialAssessment?.totalMonthlyEmi ?? 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Debts Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 m-0">Debts Portfolio</h3>
                <p className="text-xs text-slate-500 m-0 mt-0.5">Individual creditor loans and liability obligations</p>
              </div>
            </div>

            <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3.5">Lender</th>
                    <th className="py-3 px-3.5">Loan Type</th>
                    <th className="py-3 px-3.5 text-right">Outstanding</th>
                    <th className="py-3 px-3.5 text-right">Monthly EMI</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(fetchResponse.data.debts || []).map((debt, idx) => (
                    <tr key={debt.id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3.5 font-medium text-slate-800">{debt.lender}</td>
                      <td className="py-3 px-3.5 text-slate-600">{debt.loanType}</td>
                      <td className="py-3 px-3.5 text-right font-normal text-slate-800">
                        ₹{(debt.outstandingAmount ?? 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3.5 text-right font-normal text-slate-800">
                        ₹{(debt.monthlyEmi ?? 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <Tag color={debt.status === "Active" ? "blue" : "warning"} className="m-0 rounded">
                          {debt.status || "Active"}
                        </Tag>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50/50 border-t border-slate-200/80 font-semibold text-slate-800 text-xs">
                    <td className="py-3 px-3.5" colSpan={2}>Total Combined Liabilities</td>
                    <td className="py-3 px-3.5 text-right text-rose-600 font-semibold">
                      ₹{(fetchResponse.data.totalDebtAmount ?? 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3.5 text-right font-semibold">
                      ₹{(fetchResponse.data.financialAssessment?.totalMonthlyEmi ?? 0).toLocaleString("en-IN")}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Financial Assessment & Demographics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
            {/* Column A: Financial Assessment & Hardship */}
            <div className="border border-slate-200/80 rounded-xl p-4 bg-white space-y-3">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 m-0">
                Financial Assessment & Hardship
              </h4>
              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between py-1.5 pt-0">
                  <span className="text-slate-500">Overdue Duration</span>
                  <span className="font-medium text-slate-800">
                    {fetchResponse.data.financialAssessment?.overdueDuration || "-"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Hardship Reason</span>
                  <span className="font-medium text-slate-800">
                    {fetchResponse.data.financialAssessment?.reasonForDifficulty || "-"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Desired Outcome</span>
                  <span className="font-medium text-slate-800">
                    {fetchResponse.data.financialAssessment?.desiredOutcome || "-"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Service Required</span>
                  <span className="font-medium text-slate-800">{fetchResponse.data.serviceRequired || "-"}</span>
                </div>
                {fetchResponse.data.initialEnquiry && (
                  <div className="pt-2">
                    <span className="text-slate-400 block mb-1">Initial Enquiry Message:</span>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed m-0">
                      &quot;{fetchResponse.data.initialEnquiry}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Column B: Demographics & Canonical Address */}
            <div className="border border-slate-200/80 rounded-xl p-4 bg-white space-y-3">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 m-0">
                Demographics & Canonical Address
              </h4>
              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between py-1.5 pt-0">
                  <span className="text-slate-500">Date of Birth</span>
                  <span className="font-medium text-slate-800">
                    {fetchResponse.data.dob && dayjs(fetchResponse.data.dob).isValid()
                      ? dayjs(fetchResponse.data.dob).format("DD MMM YYYY")
                      : fetchResponse.data.dob || "-"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">PAN Card</span>
                  <span className="font-medium text-slate-800 font-mono">{fetchResponse.data.panCard || "-"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Street Address</span>
                  <span className="font-medium text-slate-800">{fetchResponse.data.address?.line1 || "-"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">City / State / Zip</span>
                  <span className="font-medium text-slate-800">
                    {fetchResponse.data.address?.city || fetchResponse.data.city || "-"}, {fetchResponse.data.address?.state || fetchResponse.data.state || ""} {fetchResponse.data.address?.zip || ""}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Country</span>
                  <span className="font-medium text-slate-800">{fetchResponse.data.address?.country || "IN"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Lead Source</span>
                  <span className="font-semibold text-slate-900">{fetchResponse.data.source || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "conversations",
      label: `Conversations (${fetchResponse.data.conversations?.length || 0})`,
      children: (
        <div className="space-y-4 pt-2">
          {(fetchResponse.data.conversations || []).map((conv, idx) => {
            const waMsgs = conv.whatsappChat && typeof conv.whatsappChat === "string"
              ? parseWhatsAppChat(conv.whatsappChat)
              : [];
            const rawDate = conv.createdAt || conv.uploadedAt || conv.callStartTime;
            const formattedDate = rawDate
              ? dayjs(rawDate).isValid()
                ? dayjs(rawDate).format("DD MMM YYYY, hh:mm A")
                : String(rawDate)
              : "";

            return (
              <div
                key={conv.id || idx}
                className="border border-slate-200/90 rounded-xl bg-white shadow-2xs overflow-hidden flex flex-col transition-shadow hover:shadow-xs"
              >
                {/* Card Header: Avatar, Counselor, Outcome, Duration, Date */}
                <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(conv.uploadedBy || "Counselor")}
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-semibold text-slate-900 text-xs">
                        {conv.uploadedBy || "Counselor"}
                      </span>
                      {conv.outcome && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {conv.outcome}
                        </span>
                      )}
                      {conv.duration && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          ⏱ {conv.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  {formattedDate && (
                    <span className="text-slate-400 text-[11px] font-medium">
                      {formattedDate}
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col gap-3.5">
                  {/* Call Start & End Time Info Strip */}
                  {(conv.callStartTime || conv.callEndTime) && (
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 text-xs bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200/80 text-slate-600">
                      <ClockCircleOutlined className="text-slate-400 text-xs" />
                      <span className="font-medium text-slate-600">Call Time:</span>
                      <span className="font-semibold text-slate-900">
                        {conv.callStartTime
                          ? dayjs(conv.callStartTime).isValid()
                            ? dayjs(conv.callStartTime).format("DD MMM YYYY, hh:mm A")
                            : conv.callStartTime
                          : ""}
                      </span>
                      {conv.callEndTime && (
                        <>
                          <span className="text-slate-400">→</span>
                          <span className="font-semibold text-slate-900">
                            {dayjs(conv.callEndTime).isValid()
                              ? dayjs(conv.callEndTime).format("DD MMM YYYY, hh:mm A")
                              : conv.callEndTime}
                          </span>
                        </>
                      )}
                      {conv.duration && (
                        <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded ml-1">
                          {conv.duration}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Discussion Notes */}
                  {conv.discussionNotes && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-slate-600">
                        Discussion Notes
                      </span>
                      <div className="bg-slate-50/60 p-3.5 rounded-lg border border-slate-200/80 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {conv.discussionNotes}
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Transcript in Chat View */}
                  {conv.whatsappChat && typeof conv.whatsappChat === "string" && (
                    <div className="flex flex-col gap-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-600">
                            WhatsApp Transcript
                          </span>
                          {waMsgs.length > 0 && (
                            <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                              {waMsgs.length} messages
                            </span>
                          )}
                        </div>
                        {waMsgs.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setViewingChat({
                              title: `WhatsApp Transcript — ${conv.uploadedBy || "Counselor"} (${formattedDate})`,
                              messages: waMsgs,
                            })}
                            className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <ExpandOutlined /> Fullscreen
                          </button>
                        )}
                      </div>

                      <WhatsAppChatBubbleView
                        messages={waMsgs}
                        style={{ maxHeight: "320px", minHeight: "120px" }}
                        className="border border-slate-300 rounded-xl overflow-hidden shadow-inner"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {(!fetchResponse.data.conversations || fetchResponse.data.conversations.length === 0) && (
            <div className="border border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2.5 text-base">
                💬
              </div>
              <span className="text-xs font-semibold text-slate-800">No Conversation Logs Yet</span>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm m-0">
                No call discussion notes or WhatsApp transcripts have been logged for this lead yet.
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "followups",
      label: `Follow-ups (${fetchResponse.data.followUps?.length || 0})`,
      children: (
        <LeadFollowUp
          leadId={leadId}
          leadName={fetchResponse.data.fullName || "Borrower"}
          followUps={fetchResponse.data.followUps || []}
          onRefresh={refetch}
        />
      ),
    },
    {
      key: "assignments",
      label: `Assignment History (${fetchResponse.data.assignmentHistory?.length || 0})`,
      children: (
        <div className="space-y-3 pt-2">
          {(fetchResponse.data.assignmentHistory || []).map((log, idx) => (
            <div key={log.id || idx} className="p-3 bg-slate-50 rounded-lg text-xs flex items-center justify-between border border-slate-100">
              <div>
                <p className="font-medium text-slate-900">
                  Assigned to: {log.assignedToName || "Counselor"} {log.assignedByName && `by ${log.assignedByName}`}
                </p>
                {log.reason && <p className="text-slate-600 mt-0.5">Reason: {log.reason}</p>}
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                {log.assignedAt && dayjs(log.assignedAt).isValid()
                  ? dayjs(log.assignedAt).format("DD MMM YYYY, hh:mm A")
                  : log.assignedAt || "-"}
              </span>
            </div>
          ))}
          {(!fetchResponse.data.assignmentHistory || fetchResponse.data.assignmentHistory.length === 0) && (
            <p className="text-xs text-slate-400 py-4 text-center">No assignment transfers logged.</p>
          )}
        </div>
      ),
    },
  ];

  const tabHeaders = tabItems.map((item) => ({
    key: item.key,
    label: item.label,
  }));
  const currentTabContent = tabItems.find((item) => item.key === activeTab)?.children;

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily:
            '"Segoe Pro Semibold", "Segoe UI Semibold", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
        },
      }}
    >
      <div
        className="flex flex-col h-full bg-[#f8fafc] w-full overflow-hidden"
        style={{
          fontFamily:
            '"Segoe Pro Semibold", "Segoe UI Semibold", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
      <DynamicHeader
        title="Leads"
        subTitles={[fetchResponse.data.leadNumber, fetchResponse.data.fullName]}
        filterKey="lead-detail"
        rightSection={rightSection}
        onRefresh={refetch}
      />

      <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
        <main className="flex-1 flex flex-col min-h-0 w-full px-6 py-4 max-w-[1600px] mx-auto gap-4">
          {/* Top Full-Width Segmented Borrower Profile Card */}
          <div className="shrink-0 bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Profile Section */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                <ProfileIcon className="w-full h-full" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-semibold text-slate-900 tracking-tight leading-snug m-0 truncate">
                    {fetchResponse.data.fullName}
                  </h1>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-slate-400 hover:text-slate-800 inline-flex items-center"
                  >
                    <FiExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="mt-1">
                  <span className="inline-flex items-center text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200/70 px-2.5 py-0.5 rounded-full">
                    {fetchResponse.data.serviceRequired || "Debt Settlement"}
                    {" • "}
                    {fetchResponse.data.priority
                      ? fetchResponse.data.priority.charAt(0).toUpperCase() +
                        fetchResponse.data.priority.slice(1).toLowerCase()
                      : "Normal"}{" "}
                    Priority
                  </span>
                </div>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden lg:block w-[1px] bg-slate-200 h-14 shrink-0 mx-2 self-center" />

            {/* Right Metadata Grid (4 Vertically Aligned Columns) */}
            <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-y-3.5 gap-x-5 text-xs">
              {/* Row 1 */}
              <div>
                <span className="text-[11px] text-slate-400 block font-normal leading-tight">
                  Lead ID
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-800 font-mono leading-tight mt-0.5 block truncate">
                  {fetchResponse.data.leadNumber}
                </span>
              </div>
              <div className="sm:border-l sm:border-slate-200 sm:pl-5">
                <span className="text-[11px] text-slate-400 block font-normal leading-tight">
                  Phone
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-800 leading-tight mt-0.5 block truncate">
                  {fetchResponse.data.phone}
                </span>
              </div>
              <div className="sm:border-l sm:border-slate-200 sm:pl-5 col-span-2">
                <span className="text-[11px] text-slate-400 block font-normal leading-tight">
                  Email
                </span>
                <span
                  className="text-xs sm:text-sm font-medium text-slate-800 leading-tight mt-0.5 truncate block"
                  title={fetchResponse.data.email || "-"}
                >
                  {fetchResponse.data.email || "-"}
                </span>
              </div>

              {/* Row 2 */}
              <div>
                <span className="text-[11px] text-slate-400 block font-normal leading-tight">
                  PAN
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-800 font-mono leading-tight mt-0.5 block truncate">
                  {fetchResponse.data.panCard || "-"}
                </span>
              </div>
              <div className="sm:border-l sm:border-slate-200 sm:pl-5">
                <span className="text-[11px] text-slate-400 block font-normal leading-tight">
                  Location
                </span>
                <span
                  className="text-xs sm:text-sm font-medium text-slate-800 leading-tight mt-0.5 block truncate"
                  title={`${fetchResponse.data.address?.city || fetchResponse.data.city || "-"}, ${fetchResponse.data.address?.state || fetchResponse.data.state || ""}`}
                >
                  {fetchResponse.data.address?.city || fetchResponse.data.city || "-"}, {fetchResponse.data.address?.state || fetchResponse.data.state || ""}
                </span>
              </div>
              <div className="sm:border-l sm:border-slate-200 sm:pl-5">
                <span className="text-[11px] text-slate-400 block font-normal leading-tight">
                  Assigned Counselor
                </span>
                <span
                  className="text-xs sm:text-sm font-medium text-slate-800 leading-tight mt-0.5 truncate block"
                  title={fetchResponse.data.assignedToName || "Unassigned"}
                >
                  {fetchResponse.data.assignedToName || "Unassigned"}
                </span>
              </div>
              <div className="sm:border-l sm:border-slate-200 sm:pl-5">
                <span className="text-[11px] text-slate-400 block font-normal leading-tight">
                  Source
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-800 leading-tight mt-0.5 block truncate">
                  {fetchResponse.data.source || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Qualification / Notice Callout Banners */}
          {fetchResponse.data.qualificationNotes && (
            <div className="shrink-0 flex items-start gap-3 p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl text-amber-900 text-xs">
              <FiAlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 flex-1 min-w-0">
                <span className="font-semibold text-amber-950 uppercase tracking-wide text-[11px] block">
                  Qualification & Intake Notes
                </span>
                <p className="text-amber-900/90 leading-relaxed font-normal m-0">
                  {fetchResponse.data.qualificationNotes}
                </p>
              </div>
            </div>
          )}

          {(fetchResponse.data.status === "LOST" || fetchResponse.data.lostReason) && (
            <div className="shrink-0 flex items-start gap-3 p-4 bg-rose-50/80 border border-rose-200/80 rounded-xl text-rose-900 text-xs">
              <FiAlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 flex-1 min-w-0">
                <span className="font-semibold text-rose-950 uppercase tracking-wide text-[11px] block">
                  Lost Lead Reason: {fetchResponse.data.lostReason || "Marked as Lost"}
                </span>
                {fetchResponse.data.closingNotes && (
                  <p className="text-rose-900/90 leading-relaxed font-normal m-0">
                    {fetchResponse.data.closingNotes}
                  </p>
                )}
              </div>
            </div>
          )}

          {(fetchResponse.data.isReengaged || (fetchResponse.data.repeatEnquiryCount ?? 0) > 0) && (
            <div className="shrink-0 flex items-center justify-between p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl text-blue-900 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
                <span className="font-semibold text-blue-950">
                  Re-engaged Lead: Borrower submitted {fetchResponse.data.repeatEnquiryCount || 1} repeat enquiries.
                </span>
              </div>
              {fetchResponse.data.lastEnquiryAt && (
                <span className="text-blue-700 font-mono text-[11px] shrink-0">
                  Last enquiry: {dayjs(fetchResponse.data.lastEnquiryAt).format("DD MMM YYYY")}
                </span>
              )}
            </div>
          )}

          {/* 2-Column Main Workspace: Left Tabs + Right Activity Timeline */}
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 items-stretch overflow-hidden">
            {/* Left Column: Tabbed Content Card */}
            <div className="flex-1 min-h-0 flex flex-col bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="shrink-0 border-b border-slate-200/80 pb-0.5">
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  className="[&_.ant-tabs-nav]:!mb-0 [&_.ant-tabs-nav::before]:!border-none"
                  items={tabHeaders}
                />
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto pt-3 pb-6 pr-1.5">
                {currentTabContent}
              </div>
            </div>

            {/* Right Column: Always Visible Activity Timeline Card */}
            <aside className="w-full lg:w-[335px] shrink-0 flex flex-col bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="shrink-0 flex items-center justify-between pb-3.5 border-b border-slate-200/80">
                <h3 className="text-[14px] font-semibold text-slate-800 m-0">Timeline & Activity History</h3>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-medium border border-slate-200/70">
                  {fetchResponse.data.activityTimeline?.length || 0} events
                </span>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto pt-2 space-y-0 pr-1">
                {(fetchResponse.data.activityTimeline || []).map((act, idx) => {
                  const theme = TIMELINE_THEMES[idx % TIMELINE_THEMES.length];
                  const title = act.type
                    ? act.type
                        .toLowerCase()
                        .split("_")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")
                    : "Activity Logged";
                  const formattedDate = dayjs(act.createdAt).isValid()
                    ? dayjs(act.createdAt).format("DD MMM YYYY, hh:mm A")
                    : act.createdAt;
                  const isGreenDescription =
                    act.type?.toUpperCase().includes("CREATED") ||
                    act.description?.toLowerCase().includes("created");
                  const isLast = idx === (fetchResponse.data.activityTimeline?.length || 0) - 1;

                  return (
                    <div key={act.id || idx} className="relative pl-8 pb-6 last:pb-1">
                      {/* Connector line to next event */}
                      {!isLast && (
                        <div
                          className={`absolute left-[9px] top-4 bottom-0 w-[2px] ${theme.line}`}
                        />
                      )}

                      {/* Concentric Node Circle */}
                      <span
                        className={`absolute left-0 top-0.5 z-10 w-5 h-5 rounded-full border-[2px] ${theme.border} ${theme.bg} flex items-center justify-center`}
                      >
                        <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                      </span>

                      <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug m-0">
                          {title}
                        </h4>
                        <p
                          className={`text-xs leading-snug m-0 ${
                            isGreenDescription
                              ? "text-[#15803d] font-normal"
                              : "text-slate-700 font-normal"
                          }`}
                        >
                          {act.description}
                        </p>
                        <p className="text-xs text-slate-500 font-normal m-0">
                          By - {act.performedByName || "Kamlesh Kumar"}
                        </p>
                        <p className="text-xs text-slate-500 font-normal m-0">
                          {formattedDate}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {(!fetchResponse.data.activityTimeline || fetchResponse.data.activityTimeline.length === 0) && (
                  <p className="text-xs text-slate-400 py-3 text-center">No activity recorded yet.</p>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>

      {isStatusModalOpen && pendingStatus && (
        <DynamicConfirmationModal
          isOpen={isStatusModalOpen}
          onClose={handleCloseStatusModal}
          onConfirm={handleConfirmStatusChange}
          isLoading={isStatusUpdating}
          status={statusFeedback}
          onDismissStatus={() => setStatusFeedback(null)}
          title="Change Lead Status"
          message={
            <p className="m-0 text-sm text-text-secondary leading-relaxed">
              Are you sure you want to change the status of{" "}
              <span className="font-semibold text-text-primary">
                &quot;{fetchResponse.data.fullName}&quot;
              </span>{" "}
              from{" "}
              <span className="font-semibold text-text-primary">
                {currentStatusObj.label}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-text-primary">
                {STATUS_OPTIONS.find((s) => s.key === pendingStatus)?.label || pendingStatus}
              </span>
              ?
            </p>
          }
          confirmText="Change Status"
          cancelText="Cancel"
        />
      )}

      {/* WhatsApp Chat Fullscreen Modal */}
      <DynamicModal
        isOpen={Boolean(viewingChat)}
        onClose={() => setViewingChat(null)}
        title={
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-base">{viewingChat?.title || "WhatsApp Conversation"}</span>
            {viewingChat && viewingChat.messages.length > 0 && (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                {viewingChat.messages.length} messages
              </span>
            )}
          </div>
        }
        close="icon"
        className="!w-[1040px] !max-w-[95vw]"
        bodyClassName="!bg-[#efeae2] p-4"
      >
        <div className="w-full">
          <WhatsAppChatBubbleView
            messages={viewingChat?.messages || []}
            style={{ height: "76vh", minHeight: "520px", maxHeight: "78vh" }}
            className="border-none rounded-none bg-transparent"
          />
        </div>
      </DynamicModal>
    </div>
    </ConfigProvider>
  );
}
