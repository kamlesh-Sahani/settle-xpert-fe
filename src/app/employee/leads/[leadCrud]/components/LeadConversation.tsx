"use client";

import React, { useState } from "react";
import dayjs from "dayjs";
import { Tag, Segmented } from "antd";
import { ExpandOutlined, EditOutlined, EyeOutlined, ClockCircleOutlined, LockFilled } from "@ant-design/icons";
import { useFormContext } from "react-hook-form";
import LabelField from "@/common/form/LabelField";
import DateField from "@/common/form/DateField";
import InputField from "@/common/form/InputField";
import TextAreaField from "@/common/form/TextAreaField";
import DynamicModal from "@/common/dynamic/DynamicModal";
import {
  LeadSchema,
  ParsedChatMessage,
  parseWhatsAppChat,
  calculateDuration,
} from "../lead.utils";

function renderMessageText(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline break-all font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function WhatsAppChatBubbleView({
  messages,
  style,
  className,
}: {
  messages: ParsedChatMessage[];
  style?: React.CSSProperties;
  className?: string;
}) {
  const defaultStyle: React.CSSProperties = {
    backgroundColor: "#efeae2",
    backgroundImage: "radial-gradient(#d6cdc4 0.75px, transparent 0.75px)",
    backgroundSize: "16px 16px",
    height: "268px",
    minHeight: "268px",
    maxHeight: "268px",
    ...style,
  };

  if (messages.length === 0) {
    return (
      <div
        style={defaultStyle}
        className={`w-full flex flex-col items-center justify-center p-6 text-center border border-slate-300 rounded-xl ${className || ""}`}
      >
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2 text-lg">
          💬
        </div>
        <div className="text-xs font-semibold text-slate-800">No Messages in WhatsApp Transcript</div>
        <p className="text-[11px] text-slate-500 mt-1 max-w-[280px] m-0 leading-normal">
          Switch to &quot;Text&quot; to paste conversation lines or upload a .txt export file.
        </p>
      </div>
    );
  }

  return (
    <div
      style={defaultStyle}
      className={`w-full overflow-y-auto p-4 flex flex-col gap-2 ${className || ""}`}
    >
      {messages.map((msg, idx) => {
        if (msg.isSystem) {
          return (
            <div key={idx} className="flex justify-center my-1.5">
              <span className="text-[11px] text-[#54656f] bg-[#ffeecd]/95 border border-[#f3d993]/60 px-3.5 py-1 rounded-lg text-center max-w-[90%] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] leading-relaxed flex items-center justify-center gap-1.5 font-normal select-none">
                <LockFilled className="text-[10px] text-[#54656f]" />
                {msg.text}
              </span>
            </div>
          );
        }

        const isMe = msg.isMe;

        return (
          <div
            key={idx}
            className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] px-3 py-1.5 text-xs flex flex-col gap-0.5 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] ${
                isMe
                  ? "bg-[#d9fdd3] text-[#111b21] rounded-lg rounded-tr-none border border-[#c6f1be]/60"
                  : "bg-white text-[#111b21] rounded-lg rounded-tl-none border border-slate-100"
              }`}
            >
              {!isMe && (
                <span className="font-semibold text-xs text-[#00a884] select-none block mb-0.5">
                  {msg.sender}
                </span>
              )}
              <div className="whitespace-pre-wrap break-words leading-relaxed select-text text-[#111b21]">
                {renderMessageText(msg.text)}
              </div>
              {msg.time && (
                <div className="flex items-center justify-end gap-1 text-[10px] text-[#667781] self-end mt-0.5 select-none">
                  <span>{msg.time}</span>
                  {isMe && <span className="text-[#53bdeb] font-bold text-[10px] tracking-tighter">✓✓</span>}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (name[0] || "C").toUpperCase();
}

function formatConvDate(conv: any): string {
  const rawDate = conv.createdAt || conv.uploadedAt || conv.callStartTime;
  if (!rawDate) return "";
  const d = dayjs(rawDate);
  return d.isValid() ? d.format("DD MMM YYYY, hh:mm A") : String(rawDate);
}

function formatDateTime(val?: string | null): string {
  if (!val) return "";
  const d = dayjs(val);
  return d.isValid() ? d.format("DD MMM YYYY, hh:mm A") : String(val);
}

interface LeadConversationProps {
  leadName?: string;
  phone?: string;
  conversations?: any[];
  isCreation?: boolean;
}

export default function LeadConversation({
  conversations = [],
  isCreation = false,
}: LeadConversationProps) {
  const { control, watch, setValue } = useFormContext<LeadSchema>();

  const [chatViewMode, setChatViewMode] = useState<"edit" | "preview">("edit");
  const [viewingChat, setViewingChat] = useState<{ title: string; messages: ParsedChatMessage[] } | null>(null);

  const callStartTime = watch("conversation.callStartTime") || "";
  const callEndTime = watch("conversation.callEndTime") || "";
  const rawChat = watch("conversation.rawChat") || "";

  // Parse chat messages reactively from raw text
  const parsedMessages: ParsedChatMessage[] = parseWhatsAppChat(rawChat);

  const handleStartTimeChange = (iso: string | null) => {
    const duration = calculateDuration(iso, callEndTime);
    setValue("conversation.callDuration", duration, { shouldDirty: true });
  };

  const handleEndTimeChange = (iso: string | null) => {
    const duration = calculateDuration(callStartTime, iso);
    setValue("conversation.callDuration", duration, { shouldDirty: true });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setValue("conversation.rawChat", content, { shouldDirty: true });
        setChatViewMode("preview");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1120px]">

      {/* ── Top Section: Log New Interaction Card ──────────────────────── */}
      <div className="border border-border/80 rounded-xl bg-background p-5 shadow-2xs flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-border/60 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold text-text-primary m-0">Log New Interaction</h3>
            <p className="text-xs text-text-tertiary m-0 mt-0.5">
              Record call details, discussion notes, or attach WhatsApp chat transcripts for this lead.
            </p>
          </div>
          {isCreation && (
            <span className="text-[11px] font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
              New Lead
            </span>
          )}
        </div>

        {/* Top Grid: Call Section (Left) & WhatsApp Section (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">

          {/* ── LEFT: Call Discussion Section ─────────────────────────────── */}
          <div className="flex flex-col gap-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 w-full">
              <div className="flex flex-col">
                <LabelField>Call Start Date & Time</LabelField>
                <DateField
                  id="conversation.callStartTime"
                  control={control as any}
                  showTime={{ format: "hh:mm A", use12Hours: true }}
                  format="DD/MM/YYYY hh:mm A"
                  placeholder="Select start date & time"
                  onChange={handleStartTimeChange}
                />
              </div>

              <div className="flex flex-col">
                <LabelField>Call End Date & Time</LabelField>
                <DateField
                  id="conversation.callEndTime"
                  control={control as any}
                  showTime={{ format: "hh:mm A", use12Hours: true }}
                  format="DD/MM/YYYY hh:mm A"
                  placeholder="Select end date & time"
                  onChange={handleEndTimeChange}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <LabelField>Call Duration</LabelField>
              <InputField
                id="conversation.callDuration"
                control={control as any}
                disabled
                placeholder="Auto-calculated from start and end time"
                className="bg-background-light font-medium text-text-primary"
              />
            </div>

            <div className="flex flex-col">
              <LabelField>
                Discussion Notes <span className="text-text-secondary font-normal">(What was discussed?)</span>
              </LabelField>
              <TextAreaField
                id="conversation.discussionNotes"
                control={control as any}
                placeholder="Describe conversation details, hardship reason, settlement willingness..."
                rows={5}
              />
            </div>
          </div>

          {/* ── RIGHT: WhatsApp Chat Section with Preview ─────────────────── */}
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between mb-2 shrink-0 flex-nowrap gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <LabelField>WhatsApp Chat</LabelField>
                {parsedMessages.length > 0 && (
                  <Tag color="cyan" className="text-[10px] py-0 px-1 m-0 font-normal">
                    {parsedMessages.length} msgs
                  </Tag>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Segmented
                  size="small"
                  value={chatViewMode}
                  onChange={(val) => setChatViewMode(val as "edit" | "preview")}
                  options={[
                    { label: "Text", value: "edit", icon: <EditOutlined /> },
                    { label: "Chat View", value: "preview", icon: <EyeOutlined /> },
                  ]}
                />

                {parsedMessages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setViewingChat({ title: "WhatsApp Conversation Preview", messages: parsedMessages })}
                    className="h-6 px-2 rounded border border-border bg-background hover:bg-background-light text-text-secondary hover:text-text-primary text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    title="Fullscreen View"
                  >
                    <ExpandOutlined /> Full
                  </button>
                )}

                <label className="h-6 px-2 rounded border border-border bg-background hover:bg-background-light text-primary text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer">
                  Upload .txt
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="w-full">
              {chatViewMode === "edit" ? (
                <TextAreaField
                  id="conversation.rawChat"
                  control={control as any}
                  placeholder="Paste WhatsApp chat transcript here, e.g.:&#10;12/03/24, 2:30 PM - Rahul: Need help settling cards&#10;12/03/24, 2:31 PM - SettleXpert: We can help..."
                  className="font-mono text-xs"
                  rows={12}
                  style={{ height: "268px", minHeight: "268px", maxHeight: "268px", resize: "none" }}
                />
              ) : (
                <WhatsAppChatBubbleView
                  messages={parsedMessages}
                  className="border border-slate-300 rounded-lg overflow-hidden"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── DynamicModal: WhatsApp Chat Fullscreen View ──────────────── */}
      <DynamicModal
        isOpen={Boolean(viewingChat)}
        onClose={() => setViewingChat(null)}
        title={
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-base">{viewingChat?.title || "WhatsApp Conversation"}</span>
            {viewingChat && viewingChat.messages.length > 0 && (
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
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

      {/* ── Unified Interaction History ─────────────────────────────── */}
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-text-primary m-0">Interaction History</h3>
            {conversations.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {conversations.length}
              </span>
            )}
          </div>
        </div>

        {isCreation ? (
          <p className="text-xs text-text-tertiary italic m-0">
            This is a new lead. Discussion notes and conversation records entered above will be submitted together with the lead details.
          </p>
        ) : conversations.length > 0 ? (
          <div className="flex flex-col gap-4">
            {conversations.map((conv, idx) => {
              const msgs = conv.whatsappChat && typeof conv.whatsappChat === "string"
                ? parseWhatsAppChat(conv.whatsappChat)
                : [];
              const formattedDate = formatConvDate(conv);

              return (
                <div
                  key={conv.id || idx}
                  className="border border-border/80 rounded-xl bg-background shadow-2xs overflow-hidden flex flex-col transition-shadow hover:shadow-xs"
                >
                  {/* Card Header: Counselor Avatar, Name, Outcome, Duration, Date */}
                  <div className="px-4 py-3 bg-background-light/60 border-b border-border/60 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {getInitials(conv.uploadedBy || "Counselor")}
                      </div>
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-semibold text-text-primary text-xs">
                          {conv.uploadedBy || "Counselor"}
                        </span>
                        {conv.outcome && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                            {conv.outcome}
                          </span>
                        )}
                        {conv.duration && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40">
                            ⏱ {conv.duration}
                          </span>
                        )}
                      </div>
                    </div>

                    {formattedDate && (
                      <span className="text-text-tertiary text-[11px] font-medium">
                        {formattedDate}
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex flex-col gap-3.5">
                    {/* Call Timing & Duration Info */}
                    {(conv.callStartTime || conv.callEndTime) && (
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 text-xs bg-background-light/60 px-3.5 py-2 rounded-lg border border-border/60 text-text-secondary">
                        <ClockCircleOutlined className="text-text-tertiary text-xs" />
                        <span className="font-medium text-text-secondary">Call Time:</span>
                        <span className="font-semibold text-text-primary">
                          {formatDateTime(conv.callStartTime)}
                        </span>
                        {conv.callEndTime && (
                          <>
                            <span className="text-text-tertiary">→</span>
                            <span className="font-semibold text-text-primary">
                              {formatDateTime(conv.callEndTime)}
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
                        <span className="text-xs font-semibold text-text-secondary">
                          Discussion Notes
                        </span>
                        <div className="bg-background-light/50 p-3.5 rounded-lg border border-border/60 text-xs text-text-primary leading-relaxed whitespace-pre-wrap">
                          {conv.discussionNotes}
                        </div>
                      </div>
                    )}

                    {/* WhatsApp Transcript Bubbles */}
                    {conv.whatsappChat && typeof conv.whatsappChat === "string" && (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-text-secondary">
                              WhatsApp Transcript
                            </span>
                            {msgs.length > 0 && (
                              <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                                {msgs.length} messages
                              </span>
                            )}
                          </div>
                          {msgs.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setViewingChat({
                                title: `WhatsApp Transcript — ${conv.uploadedBy || "Counselor"} (${formattedDate})`,
                                messages: msgs,
                              })}
                              className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <ExpandOutlined /> Fullscreen
                            </button>
                          )}
                        </div>

                        <WhatsAppChatBubbleView
                          messages={msgs}
                          style={{ maxHeight: "320px", minHeight: "120px" }}
                          className="border border-slate-300 rounded-xl overflow-hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed border-border/80 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-background-light/30">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2.5 text-base">
              💬
            </div>
            <span className="text-xs font-semibold text-text-primary">No Previous Interactions</span>
            <p className="text-[11px] text-text-tertiary mt-1 max-w-sm m-0">
              No conversation history recorded for this lead yet. Use the fields above to log call details or attach WhatsApp chat transcripts.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
