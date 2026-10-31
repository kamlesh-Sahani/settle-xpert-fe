"use client";

import React from "react";
import { Editor, EditorContent } from "@tiptap/react";
import { HeaderConfig, FooterConfig, DocumentSettings, VariableItem } from "./templateEditor.types";
import { MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight } from "react-icons/md";

interface DocumentCanvasProps {
  editor: Editor | null;
  header: HeaderConfig;
  onHeaderChange: (header: HeaderConfig) => void;
  footer: FooterConfig;
  onFooterChange: (footer: FooterConfig) => void;
  settings: DocumentSettings;
  variables: VariableItem[];
  isPreviewMode: boolean;
}

export default function DocumentCanvas({
  editor,
  header,
  onHeaderChange,
  footer,
  onFooterChange,
  settings,
  variables,
  isPreviewMode,
}: DocumentCanvasProps) {
  // Resolve tokens for preview mode
  const getResolvedHtml = () => {
    if (!editor) return "";
    let html = editor.getHTML();
    variables.forEach((v) => {
      // Replace mention tags with styled preview values
      const tagRegex = new RegExp(
        `<span[^>]*data-id="${v.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>[^<]*<\\/span>`,
        "g"
      );
      html = html.replace(
        tagRegex,
        `<span style="background-color: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${v.previewValue}</span>`
      );

      // Also replace raw {{...}} if any exists
      const rawRegex = new RegExp(v.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
      html = html.replace(
        rawRegex,
        `<span style="background-color: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${v.previewValue}</span>`
      );
    });
    return html;
  };

  const resolveText = (text: string) => {
    let resolved = text;
    variables.forEach((v) => {
      const regex = new RegExp(v.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
      resolved = resolved.replace(regex, v.previewValue);
    });
    return resolved;
  };

  const headerAlignClass =
    header.alignment === "center"
      ? "text-center items-center"
      : header.alignment === "right"
      ? "text-right items-end"
      : "text-left items-start";

  return (
    <div className="flex justify-center p-8 bg-slate-100 overflow-y-auto flex-1 print:p-0 print:bg-white min-h-[calc(100vh-80px)]">
      {/* ── Realistic A4 Sheet ── */}
      <div
        id="template-printable-canvas"
        className="bg-white shadow-lg rounded-sm flex flex-col justify-between border border-gray-200 p-12 transition-all print:shadow-none print:border-none print:w-full print:p-8"
        style={{
          width: settings.orientation === "landscape" ? "1123px" : "794px",
          minHeight: settings.orientation === "landscape" ? "794px" : "1123px",
          fontSize: `${settings.fontSize}px`,
          fontFamily: settings.fontFamily,
        }}
      >
        {/* ════════ HEADER SECTION ════════ */}
        {header.enabled ? (
          <div className="mb-6 group relative">
            {!isPreviewMode && (
              <div className="flex items-center justify-between pb-1 mb-2 border-b border-dashed border-gray-200 text-[11px] text-gray-400">
                <span className="font-semibold uppercase tracking-wider text-gray-400">
                  Header Area (Click below to edit)
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    title="Align Left"
                    onClick={() => onHeaderChange({ ...header, alignment: "left" })}
                    className={`p-1 rounded hover:bg-gray-100 ${header.alignment === "left" ? "text-primary font-bold" : "text-gray-500"}`}
                  >
                    <MdFormatAlignLeft />
                  </button>
                  <button
                    type="button"
                    title="Align Center"
                    onClick={() => onHeaderChange({ ...header, alignment: "center" })}
                    className={`p-1 rounded hover:bg-gray-100 ${header.alignment === "center" ? "text-primary font-bold" : "text-gray-500"}`}
                  >
                    <MdFormatAlignCenter />
                  </button>
                  <button
                    type="button"
                    title="Align Right"
                    onClick={() => onHeaderChange({ ...header, alignment: "right" })}
                    className={`p-1 rounded hover:bg-gray-100 ${header.alignment === "right" ? "text-primary font-bold" : "text-gray-500"}`}
                  >
                    <MdFormatAlignRight />
                  </button>
                </div>
              </div>
            )}

            <div className={`flex flex-col gap-1.5 ${headerAlignClass}`}>
              {header.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={header.logoUrl}
                  alt="Logo"
                  className="max-h-12 object-contain mb-1"
                />
              )}

              {isPreviewMode ? (
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  {resolveText(header.title)}
                </h1>
              ) : (
                <input
                  type="text"
                  value={header.title}
                  onChange={(e) => onHeaderChange({ ...header, title: e.target.value })}
                  placeholder="Enter Document Header Title..."
                  className="w-full text-xl font-bold text-gray-900 tracking-tight outline-none border-b border-transparent hover:border-gray-300 focus:border-primary-400 pb-0.5 bg-transparent"
                />
              )}

              {isPreviewMode ? (
                <p className="text-xs text-gray-500 font-medium">
                  {resolveText(header.subtitle)}
                </p>
              ) : (
                <input
                  type="text"
                  value={header.subtitle}
                  onChange={(e) => onHeaderChange({ ...header, subtitle: e.target.value })}
                  placeholder="Enter subtitle, date, or document reference..."
                  className="w-full text-xs text-gray-500 font-medium outline-none border-b border-transparent hover:border-gray-300 focus:border-primary-400 pb-0.5 bg-transparent"
                />
              )}
            </div>

            {header.showDivider && <hr className="w-full border-gray-200 mt-3" />}
          </div>
        ) : (
          !isPreviewMode && (
            <div className="mb-4 text-center">
              <button
                type="button"
                onClick={() => onHeaderChange({ ...header, enabled: true })}
                className="text-xs text-gray-400 hover:text-primary border border-dashed border-gray-300 hover:border-primary-400 px-3 py-1 rounded transition-colors cursor-pointer"
              >
                + Add Document Header
              </button>
            </div>
          )
        )}

        {/* ════════ BODY CONTENT SECTION (TIPTAP) ════════ */}
        <div className="flex-1 my-2">
          {isPreviewMode ? (
            <div
              className="prose max-w-none text-gray-800 leading-relaxed min-h-[500px]"
              dangerouslySetInnerHTML={{ __html: getResolvedHtml() }}
            />
          ) : (
            <div className="tiptap-wrapper min-h-[500px] cursor-text">
              <EditorContent editor={editor} />
            </div>
          )}
        </div>

        {/* ════════ FOOTER SECTION ════════ */}
        {footer.enabled ? (
          <div className="mt-8 pt-3 border-t border-gray-200 text-xs text-gray-500 group relative">
            {!isPreviewMode && (
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                Footer Area (Click below to edit)
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                {isPreviewMode ? (
                  <div>{resolveText(footer.text)}</div>
                ) : (
                  <input
                    type="text"
                    value={footer.text}
                    onChange={(e) => onFooterChange({ ...footer, text: e.target.value })}
                    placeholder="Enter footer disclaimer or company notes..."
                    className="w-full text-xs text-gray-500 outline-none border-b border-transparent hover:border-gray-300 focus:border-primary-400 pb-0.5 bg-transparent"
                  />
                )}
              </div>

              {footer.showPageNumbers && (
                <span className="text-[11px] font-mono text-gray-400 shrink-0">
                  Page 1 of 1
                </span>
              )}
            </div>
          </div>
        ) : (
          !isPreviewMode && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => onFooterChange({ ...footer, enabled: true })}
                className="text-xs text-gray-400 hover:text-primary border border-dashed border-gray-300 hover:border-primary-400 px-3 py-1 rounded transition-colors cursor-pointer"
              >
                + Add Document Footer
              </button>
            </div>
          )
        )}
      </div>

      {/* ── TipTap Custom Styling ── */}
      <style jsx global>{`
        .tiptap-mention-chip {
          background-color: #fee2e2 !important;
          color: #991b1b !important;
          border: 1px solid #fca5a5 !important;
          padding: 1px 6px !important;
          border-radius: 4px !important;
          font-family: monospace !important;
          font-size: 11.5px !important;
          font-weight: 600 !important;
          white-space: nowrap !important;
          user-select: all !important;
          display: inline-block !important;
          line-height: 1.4 !important;
        }
        .tiptap {
          outline: none !important;
          min-height: 500px;
        }
        .tiptap p {
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }
        .tiptap h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .tiptap h2 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .tiptap h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .tiptap ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .tiptap ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .tiptap blockquote {
          border-left: 3px solid #cbd5e1;
          padding-left: 1rem;
          color: #64748b;
          font-style: italic;
          margin-bottom: 0.75rem;
        }
      `}</style>
    </div>
  );
}
