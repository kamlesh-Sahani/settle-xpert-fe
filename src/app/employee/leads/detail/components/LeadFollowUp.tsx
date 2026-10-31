"use client";

import React, { useState } from "react";
import dayjs from "dayjs";
import { App, DatePicker, Input } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import LabelField from "@/common/form/LabelField";
import ButtonField from "@/common/basic/ButtonField";
import DynamicModal from "@/common/dynamic/DynamicModal";
import DynamicConfirmationModal from "@/common/dynamic/DynamicConfirmationModal";
import { api, responseError } from "@/common/utils";

const { TextArea } = Input;

export interface FollowUpItem {
  id?: string;
  dueDate: string;
  assignedTo?: string;
  assignedToName?: string;
  status: string; // PENDING, COMPLETED, CANCELLED
  notes?: string;
  createdAt?: string;
  completedAt?: string;
}

interface LeadFollowUpProps {
  leadId?: string;
  leadName?: string;
  followUps?: FollowUpItem[];
  onRefresh?: () => void;
}

export default function LeadFollowUp({
  leadId,
  leadName = "Borrower",
  followUps = [],
  onRefresh,
}: LeadFollowUpProps) {
  const { message } = App.useApp();
  const [dueDate, setDueDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Reschedule Modal State (only Callback Date & Time and Notes)
  const [rescheduleTarget, setRescheduleTarget] = useState<FollowUpItem | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>("");
  const [rescheduleNotes, setRescheduleNotes] = useState<string>("");
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Mark Complete Confirmation Modal State
  const [completeTarget, setCompleteTarget] = useState<FollowUpItem | null>(null);

  // Separate pending and completed follow-ups
  const pendingFollowUps = followUps.filter(
    (f) => (f.status || "").toUpperCase() === "PENDING"
  );
  const pastFollowUps = followUps.filter(
    (f) => (f.status || "").toUpperCase() !== "PENDING"
  );

  // Submit new follow-up callback
  const handleScheduleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!leadId) {
      message.error("Lead ID is missing");
      return;
    }
    if (!dueDate) {
      message.warning("Please select a callback date and time");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/api/v1/lead/follow-up/create", {
        leadId,
        dueDate,
        notes: notes.trim(),
      });
      message.success("Follow-up callback scheduled successfully!");
      setDueDate("");
      setNotes("");
      setIsScheduleOpen(false);
      onRefresh?.();
    } catch (err) {
      message.error(responseError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mark Completed or Cancelled
  const handleStatusUpdate = async (
    followUpId: string,
    status: "COMPLETED" | "CANCELLED"
  ) => {
    if (!leadId) return;
    setUpdatingId(followUpId);
    try {
      await api.post("/api/v1/lead/follow-up/status", {
        leadId,
        followUpId,
        status,
      });
      message.success(
        status === "COMPLETED"
          ? "Follow-up marked as completed!"
          : "Follow-up cancelled."
      );
      onRefresh?.();
    } catch (err) {
      message.error(responseError(err));
    } finally {
      setUpdatingId(null);
    }
  };

  // Confirm Mark Complete
  const handleConfirmComplete = async () => {
    if (!completeTarget || !leadId || !completeTarget.id) return;
    await handleStatusUpdate(completeTarget.id, "COMPLETED");
    setCompleteTarget(null);
  };

  // Confirm Reschedule
  const handleConfirmReschedule = async () => {
    if (!leadId || !rescheduleTarget || !rescheduleTarget.id) return;

    if (!rescheduleDate) {
      message.warning("Please select a new callback date & time");
      return;
    }

    setIsRescheduling(true);
    try {
      await api.post("/api/v1/lead/follow-up/status", {
        leadId,
        followUpId: rescheduleTarget.id,
        status: "PENDING",
        dueDate: rescheduleDate,
        notes: rescheduleNotes.trim() || rescheduleTarget.notes || "",
      });
      message.success("Follow-up rescheduled successfully!");
      setRescheduleTarget(null);
      setRescheduleDate("");
      setRescheduleNotes("");
      onRefresh?.();
    } catch (err) {
      message.error(responseError(err));
    } finally {
      setIsRescheduling(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 pt-2">
      {/* ── Upcoming Follow-ups (Full Width) ────────────────────────── */}
      <div className="w-full flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider m-0">
              Upcoming Follow-ups
            </h4>
            {pendingFollowUps.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {pendingFollowUps.length} pending
              </span>
            )}
          </div>

          <ButtonField
            type="primary"
            size="small"
            onClick={() => setIsScheduleOpen(true)}
            className="h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5"
          >
            <CalendarOutlined /> Schedule Callback
          </ButtonField>
        </div>

        {pendingFollowUps.length > 0 ? (
          <div className="flex flex-col gap-3">
            {pendingFollowUps.map((fu, idx) => {
              const fuId = fu.id || String(idx);
              const isBusy = updatingId === fuId;

              return (
                <div
                  key={fuId}
                  className="border border-slate-200/90 rounded-xl bg-white p-4 shadow-2xs flex flex-col gap-3 transition-all hover:border-slate-300 hover:shadow-xs"
                >
                  {/* Timing & Badge */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Pending Callback
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                        <ClockCircleOutlined className="text-slate-400" />
                        <span>{dayjs(fu.dueDate).format("DD MMM YYYY, hh:mm A")}</span>
                      </div>
                    </div>

                    {fu.assignedToName && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                        <UserOutlined className="text-slate-400" />
                        <span>Assigned to <strong className="font-semibold text-slate-700">{fu.assignedToName}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Notes / Instructions */}
                  {fu.notes && (
                    <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/60 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {fu.notes}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <ButtonField
                      type="default"
                      size="small"
                      disabled={isBusy}
                      onClick={() => {
                        setRescheduleTarget(fu);
                        setRescheduleDate(fu.dueDate);
                        setRescheduleNotes(fu.notes || "");
                      }}
                      className="text-xs rounded-md"
                    >
                      Reschedule
                    </ButtonField>

                    <ButtonField
                      type="primary"
                      size="small"
                      onClick={() => setCompleteTarget(fu)}
                      className="text-xs rounded-md !bg-emerald-600 hover:!bg-emerald-700 !border-emerald-600"
                    >
                      <CheckCircleOutlined /> Mark Complete
                    </ButtonField>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/40">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2.5 text-base">
              <CalendarOutlined />
            </div>
            <span className="text-xs font-semibold text-slate-800">No Pending Callbacks</span>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs m-0 mb-3.5">
              No upcoming callbacks scheduled for this lead yet.
            </p>
            <ButtonField
              type="primary"
              size="small"
              onClick={() => setIsScheduleOpen(true)}
              className="h-8 px-3.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
            >
              <CalendarOutlined /> Schedule Callback
            </ButtonField>
          </div>
        )}
      </div>

      {/* ── SECTION 3: Completed / Past Follow-ups (Full Width) ─────── */}
      {pastFollowUps.length > 0 && (
        <div className="w-full flex flex-col gap-3 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider m-0">
              Follow-up History ({pastFollowUps.length})
            </h4>
          </div>

          <div className="flex flex-col gap-2.5">
            {pastFollowUps.map((fu, idx) => {
              const isCompleted = (fu.status || "").toUpperCase() === "COMPLETED";

              return (
                <div
                  key={fu.id || idx}
                  className="border border-slate-200/80 rounded-xl bg-white p-3.5 shadow-2xs flex flex-col gap-2 transition-colors hover:border-slate-300"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        isCompleted
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        <CheckCircleOutlined className={isCompleted ? "text-emerald-500" : "text-slate-400"} />
                        {isCompleted ? "Completed" : fu.status}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {dayjs(fu.dueDate).format("DD MMM YYYY, hh:mm A")}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      {fu.assignedToName && (
                        <span>Handled by <strong className="text-slate-600 font-medium">{fu.assignedToName}</strong></span>
                      )}
                      {(fu.completedAt || fu.createdAt) && (
                        <span>• {dayjs(fu.completedAt || fu.createdAt).format("DD MMM YYYY, hh:mm A")}</span>
                      )}
                    </div>
                  </div>

                  {fu.notes && (
                    <p className="text-xs text-slate-600 m-0 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/60">
                      {fu.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Schedule Callback Modal (2 fields only) ─────────────────── */}
      <DynamicModal
        isOpen={isScheduleOpen}
        onClose={() => {
          setIsScheduleOpen(false);
          setDueDate("");
          setNotes("");
        }}
        title={
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-primary" />
            <span className="font-semibold text-base">Schedule Callback</span>
          </div>
        }
        className="!w-[520px] !max-w-[95vw]"
      >
        <div className="flex flex-col gap-4 p-2">
          {/* Field 1: Callback Date & Time */}
          <div className="flex flex-col gap-1.5">
            <LabelField required>Callback Date & Time</LabelField>
            <DatePicker
              showTime={{ format: "hh:mm A", use12Hours: true }}
              format="DD/MM/YYYY hh:mm A"
              placeholder="Select callback date & time"
              value={dueDate ? dayjs(dueDate) : null}
              onChange={(d) => setDueDate(d ? d.toISOString() : "")}
              className="w-full h-10 rounded-lg text-xs"
            />
          </div>

          {/* Field 2: Notes & Instructions */}
          <div className="flex flex-col gap-1.5">
            <LabelField>
              Notes & Instructions <span className="text-slate-400 font-normal">(Optional)</span>
            </LabelField>
            <TextArea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Customer requested call post-lunch after salary credit..."
              className="rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <ButtonField
              type="default"
              onClick={() => {
                setIsScheduleOpen(false);
                setDueDate("");
                setNotes("");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </ButtonField>
            <ButtonField
              type="primary"
              loading={isSubmitting}
              onClick={() => handleScheduleSubmit()}
            >
              Schedule Callback
            </ButtonField>
          </div>
        </div>
      </DynamicModal>

      {/* ── Reschedule Follow-up Modal (2 fields only) ──────────────── */}
      <DynamicModal
        isOpen={Boolean(rescheduleTarget)}
        onClose={() => setRescheduleTarget(null)}
        title={
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-primary" />
            <span className="font-semibold text-base">Reschedule Callback</span>
          </div>
        }
        className="!w-[520px] !max-w-[95vw]"
      >
        <div className="flex flex-col gap-4 p-2">
          {/* Field 1: New Callback Date & Time */}
          <div className="flex flex-col gap-1.5">
            <LabelField required>New Callback Date & Time</LabelField>
            <DatePicker
              showTime={{ format: "hh:mm A", use12Hours: true }}
              format="DD/MM/YYYY hh:mm A"
              placeholder="Select new callback time"
              value={rescheduleDate ? dayjs(rescheduleDate) : null}
              onChange={(d) => setRescheduleDate(d ? d.toISOString() : "")}
              className="w-full h-10 rounded-lg"
            />
          </div>

          {/* Field 2: Notes & Instructions */}
          <div className="flex flex-col gap-1.5">
            <LabelField>
              Notes & Instructions <span className="text-slate-400 font-normal">(Optional)</span>
            </LabelField>
            <TextArea
              value={rescheduleNotes}
              onChange={(e) => setRescheduleNotes(e.target.value)}
              placeholder="e.g. Customer asked to postpone callback to evening..."
              rows={3}
              className="rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <ButtonField
              type="default"
              onClick={() => setRescheduleTarget(null)}
              disabled={isRescheduling}
            >
              Cancel
            </ButtonField>
            <ButtonField
              type="primary"
              loading={isRescheduling}
              onClick={handleConfirmReschedule}
            >
              Confirm Reschedule
            </ButtonField>
          </div>
        </div>
      </DynamicModal>

      {/* ── Confirmation Modal: Mark Complete ───────────────────────── */}
      {completeTarget && (
        <DynamicConfirmationModal
          isOpen={Boolean(completeTarget)}
          onClose={() => setCompleteTarget(null)}
          onConfirm={handleConfirmComplete}
          isLoading={updatingId === completeTarget.id}
          title="Mark Follow-up Complete"
          message={
            <p className="m-0 text-sm text-slate-600 leading-relaxed">
              Are you sure you want to mark the callback scheduled for{" "}
              <span className="font-semibold text-slate-900">
                {dayjs(completeTarget.dueDate).format("DD MMM YYYY, hh:mm A")}
              </span>{" "}
              as completed?
            </p>
          }
          confirmText="Mark Complete"
          cancelText="Cancel"
          confirmButtonClassName="!bg-emerald-600 hover:!bg-emerald-700 !border-emerald-600"
        />
      )}
    </div>
  );
}
