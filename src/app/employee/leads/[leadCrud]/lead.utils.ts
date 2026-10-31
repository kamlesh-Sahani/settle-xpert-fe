import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";

/* ── 1. Schema & Types ─────────────────────────────────────────── */
export const leadSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(8, "Phone number is required"),
  alternatePhone: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  panCard: z.string().optional().or(z.literal("")),
  address: z.object({
    line1: z.string().optional().or(z.literal("")),
    country: z.string().optional().or(z.literal("")),
    state: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
    zip: z.string().optional().or(z.literal("")),
  }).optional(),
  serviceRequired: z.string().min(1, "Service required is required"),
  source: z.string().min(1, "Lead source is required"),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).default("NORMAL"),
  initialEnquiry: z.string().optional().or(z.literal("")),
  totalDebtAmount: z.coerce.number().optional().default(0),
  outstandingAmount: z.coerce.number().optional().default(0),
  monthlyIncome: z.coerce.number().optional().default(0),
  currentEmiAmount: z.coerce.number().optional().default(0),
  debts: z.array(z.object({
    lender: z.string(),
    loanType: z.string(),
    outstandingAmount: z.coerce.number(),
    monthlyEmi: z.coerce.number().optional().default(0),
  })).optional().default([]),
  assignedTo: z.string().optional().or(z.literal("")),
  conversation: z.object({
    callStartTime: z.string().optional().or(z.literal("")),
    callEndTime: z.string().optional().or(z.literal("")),
    callDuration: z.string().optional().or(z.literal("")),
    discussionNotes: z.string().optional().or(z.literal("")),
    rawChat: z.string().optional().or(z.literal("")),
  }).optional(),
});

export type LeadSchema = z.infer<typeof leadSchema>;

export interface DebtItem {
  lender: string;
  loanType: string;
  outstandingAmount: number;
  monthlyEmi: number;
}

export interface ParsedChatMessage {
  time: string;
  sender: string;
  text: string;
  isMe?: boolean;
  isSystem?: boolean;
}

/* ── 2. Default Values & Form Hook ─────────────────────────────── */
export const leadDefaultValues: LeadSchema = {
  fullName: "",
  phone: "",
  alternatePhone: "",
  email: "",
  dob: "",
  panCard: "",
  address: {
    line1: "",
    country: "IN",
    state: "",
    city: "",
    zip: "",
  },
  serviceRequired: "Credit Card Debt Assistance",
  source: "Manual Entry",
  priority: "NORMAL",
  initialEnquiry: "",
  totalDebtAmount: 0,
  outstandingAmount: 0,
  monthlyIncome: 0,
  currentEmiAmount: 0,
  debts: [],
  assignedTo: "",
  conversation: {
    callStartTime: "",
    callEndTime: "",
    callDuration: "",
    discussionNotes: "",
    rawChat: "",
  },
};

export function useLeadForm(defaultValues = leadDefaultValues) {
  return useForm<LeadSchema>({
    resolver: zodResolver(leadSchema) as any,
    defaultValues,
  });
}

/* ── 3. Options Constants ───────────────────────────────────────── */
export const serviceOptions = [
  { key: "Credit Card Debt Assistance", value: "Credit Card Debt Assistance", label: "Credit Card Debt Assistance" },
  { key: "Personal Loan Assistance", value: "Personal Loan Assistance", label: "Personal Loan Assistance" },
  { key: "Business Loan Restructuring", value: "Business Loan Restructuring", label: "Business Loan Restructuring" },
  { key: "Multiple Loans Consolidation", value: "Multiple Loans Consolidation", label: "Multiple Loans Consolidation" },
  { key: "Recovery Harassment Protection", value: "Recovery Harassment Protection", label: "Recovery Harassment Protection" },
  { key: "General Debt Counseling", value: "General Debt Counseling", label: "General Debt Counseling" },
];

export const sourceOptions = [
  { key: "Manual Entry", value: "Manual Entry", label: "Manual Entry" },
  { key: "Website Form", value: "Website Form", label: "Website Form" },
  { key: "Facebook Ad", value: "Facebook Ad", label: "Facebook Ad" },
  { key: "Google Ad", value: "Google Ad", label: "Google Ad" },
  { key: "Referral", value: "Referral", label: "Referral" },
  { key: "Cold Call", value: "Cold Call", label: "Cold Call" },
];

export const priorityOptions = [
  { key: "HIGH", label: "High", value: "HIGH" },
  { key: "NORMAL", label: "Normal", value: "NORMAL" },
  { key: "LOW", label: "Low", value: "LOW" },
];

export const loanTypeOptions = [
  { value: "Credit Card", label: "Credit Card" },
  { value: "Personal Loan", label: "Personal Loan" },
  { value: "Business Loan", label: "Business Loan" },
  { value: "Consumer Durable", label: "Consumer Durable" },
  { value: "Auto Loan", label: "Auto Loan" },
  { value: "Other", label: "Other" },
];

/* ── 4. Helper & Transformation Functions ───────────────────────── */
export function calculateDuration(startTime?: string | null, endTime?: string | null): string {
  if (!startTime || !endTime) return "";
  const start = dayjs(startTime);
  const end = dayjs(endTime);
  if (!start.isValid() || !end.isValid()) return "";

  const diffMinutes = end.diff(start, "minute");
  if (diffMinutes < 0) return "End time before start";

  const days = Math.floor(diffMinutes / (24 * 60));
  const remainingMins = diffMinutes % (24 * 60);
  const hours = Math.floor(remainingMins / 60);
  const mins = remainingMins % 60;

  const parts = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} hr${hours > 1 ? "s" : ""}`);
  if (mins > 0 || parts.length === 0) parts.push(`${mins} min${mins !== 1 ? "s" : ""}`);

  return parts.join(" ");
}

const waLineRegex = /^\[?(\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}[,\s]+[\d:APMapm\s]+)\]?\s*[-–]?\s*([^:]+):\s*(.+)$/;

export function parseWhatsAppChat(raw: string): ParsedChatMessage[] {
  if (!raw.trim()) return [];
  const lines = raw.split("\n");
  const msgs: ParsedChatMessage[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (/end-to-end encrypted/i.test(line)) {
      msgs.push({
        time: "",
        sender: "System",
        text: line,
        isSystem: true,
      });
      continue;
    }

    const match = line.match(waLineRegex);
    if (match) {
      const sender = match[2].trim();
      const isMe = /^(you|settlexpert|counselor|agent|me|admin)$/i.test(sender);
      msgs.push({
        time: match[1].trim(),
        sender,
        text: match[3].trim(),
        isMe,
      });
    } else if (msgs.length > 0 && !msgs[msgs.length - 1].isSystem) {
      msgs[msgs.length - 1].text += "\n" + line;
    }
  }

  if (msgs.length === 0 && raw.trim()) {
    return [{
      time: "",
      sender: "Message",
      text: raw.trim(),
      isMe: false,
    }];
  }

  return msgs;
}

export function buildLeadPayload(values: LeadSchema, debts: DebtItem[]) {
  const calculatedDebt = debts.length > 0
    ? debts.reduce((sum, d) => sum + Number(d.outstandingAmount || 0), 0)
    : Number(values.outstandingAmount || values.totalDebtAmount) || 0;

  return {
    ...values,
    debts,
    totalDebtAmount: calculatedDebt,
    outstandingAmount: calculatedDebt,
    initialEnquiry: values.initialEnquiry || values.conversation?.discussionNotes || values.conversation?.rawChat || "",
  };
}

export function mapLeadDataToForm(leadData: any, fetchedDebts: DebtItem[]): LeadSchema {
  return {
    fullName: leadData.fullName || "",
    phone: leadData.phone || "",
    alternatePhone: leadData.alternatePhone || "",
    email: leadData.email || "",
    dob: leadData.dob || "",
    panCard: leadData.panCard || "",
    address: {
      line1: leadData.address?.line1 || "",
      country: leadData.address?.country || "IN",
      state: leadData.address?.state || "",
      city: leadData.address?.city || "",
      zip: leadData.address?.zip || "",
    },
    serviceRequired: leadData.serviceRequired || "",
    source: leadData.source || "Manual Entry",
    priority: leadData.priority || "NORMAL",
    initialEnquiry: leadData.initialEnquiry || "",
    totalDebtAmount: leadData.totalDebtAmount || 0,
    outstandingAmount: leadData.totalDebtAmount || 0,
    monthlyIncome: leadData.financialAssessment?.monthlyIncome || 0,
    currentEmiAmount: leadData.financialAssessment?.totalMonthlyEmi || 0,
    debts: fetchedDebts,
    assignedTo: leadData.assignedTo || "",
    conversation: {
      callStartTime: "",
      callEndTime: "",
      callDuration: "",
      discussionNotes: "",
      rawChat: "",
    },
  };
}
