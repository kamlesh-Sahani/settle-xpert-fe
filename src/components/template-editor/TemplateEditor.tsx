"use client";

import React, { useState } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import { Input, Dropdown, MenuProps, message, Tooltip, Switch } from "antd";
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatQuote,
  MdUndo,
  MdRedo,
  MdPictureAsPdf,
  MdSave,
  MdVisibility,
  MdEdit,
} from "react-icons/md";
import { HiOutlineSparkles } from "react-icons/hi2";
import ButtonField from "@/common/basic/ButtonField";
import { api, responseError } from "@/common/utils";
import DocumentCanvas from "./DocumentCanvas";
import {
  TemplateData,
  TemplateEditorProps,
} from "./templateEditor.types";
import { DEFAULT_VARIABLES, INITIAL_TEMPLATE_DATA } from "./constants";

export default function TemplateEditor({
  initialData,
  variables = DEFAULT_VARIABLES,
  saveEndpoint = "/api/v1/template",
  onSave,
  onExportPdf,
  className = "",
}: TemplateEditorProps) {
  const [data, setData] = useState<TemplateData>({
    ...INITIAL_TEMPLATE_DATA,
    ...initialData,
    header: { ...INITIAL_TEMPLATE_DATA.header, ...(initialData?.header || {}) },
    footer: { ...INITIAL_TEMPLATE_DATA.footer, ...(initialData?.footer || {}) },
    settings: { ...INITIAL_TEMPLATE_DATA.settings, ...(initialData?.settings || {}) },
  });

  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize TipTap Editor with StarterKit and Mention extension
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: "tiptap-mention-chip",
        },
        renderLabel({ node }) {
          return `${node.attrs.label ?? node.attrs.id}`;
        },
      }),
    ],
    content: data.body,
    onUpdate: ({ editor: currentEditor }) => {
      setData((prev) => ({ ...prev, body: currentEditor.getHTML() }));
    },
  });

  // Insert Variable Token atomically
  const handleInsertVariable = (variableKey: string) => {
    if (!editor) return;
    if (isPreview) setIsPreview(false);

    editor
      .chain()
      .focus()
      .insertContent({
        type: "mention",
        attrs: {
          id: variableKey,
          label: variableKey,
        },
      })
      .insertContent(" ")
      .run();
  };

  // Build variable dropdown items grouped by category
  const categories = ["Lead", "Company", "Employee", "System"];
  const variableMenuItems: MenuProps["items"] = categories.map((cat) => ({
    key: cat,
    label: <span className="font-bold text-gray-700 text-xs">{cat} Variables</span>,
    type: "group",
    children: variables
      .filter((v) => v.category === cat)
      .map((v) => ({
        key: v.key,
        label: (
          <div className="flex items-center justify-between gap-4 py-0.5">
            <span className="text-xs text-gray-800">{v.label}</span>
            <code className="text-[10px] text-primary font-mono bg-gray-50 px-1 rounded">
              {v.key}
            </code>
          </div>
        ),
        onClick: () => handleInsertVariable(v.key),
      })),
  }));

  // Export to PDF / Print
  const handleExportPdf = () => {
    if (onExportPdf) {
      onExportPdf(data);
      return;
    }
    window.print();
  };

  // Save to Backend
  const handleSave = async () => {
    setIsSaving(true);
    const payload: TemplateData = {
      ...data,
      body: editor ? editor.getHTML() : data.body,
    };

    try {
      if (onSave) {
        await onSave(payload);
      } else {
        await api.post(saveEndpoint, payload);
      }
      message.success("Template saved successfully");
    } catch (err) {
      message.error(responseError(err) || "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen bg-slate-100 ${className}`}>
      {/* ── Top Clean Toolbar & Navigation ── */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 shadow-xs print:hidden">
        {/* Left: Template Name */}
        <div className="flex items-center gap-2">
          <Input
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            placeholder="Template Name..."
            className="font-bold text-sm text-gray-800 w-64 hover:border-gray-300 focus:border-primary-500"
          />
        </div>

        {/* Center: Formatting & Insert Tools (TipTap Reactive Controls) */}
        {editor && (
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
            <Tooltip title="Undo">
              <ButtonField
                type="text"
                size="small"
                icon={<MdUndo />}
                disabled={!editor.can().undo()}
                onClick={() => editor.chain().focus().undo().run()}
              />
            </Tooltip>
            <Tooltip title="Redo">
              <ButtonField
                type="text"
                size="small"
                icon={<MdRedo />}
                disabled={!editor.can().redo()}
                onClick={() => editor.chain().focus().redo().run()}
              />
            </Tooltip>

            <div className="w-px h-4 bg-gray-200 mx-1" />

            <Tooltip title="Bold">
              <ButtonField
                type={editor.isActive("bold") ? "primary" : "text"}
                size="small"
                icon={<MdFormatBold />}
                onClick={() => editor.chain().focus().toggleBold().run()}
              />
            </Tooltip>
            <Tooltip title="Italic">
              <ButtonField
                type={editor.isActive("italic") ? "primary" : "text"}
                size="small"
                icon={<MdFormatItalic />}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              />
            </Tooltip>

            <div className="w-px h-4 bg-gray-200 mx-1" />

            <Tooltip title="Heading 1">
              <ButtonField
                type={editor.isActive("heading", { level: 1 }) ? "primary" : "text"}
                size="small"
                className="font-bold text-xs"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              >
                H1
              </ButtonField>
            </Tooltip>
            <Tooltip title="Heading 2">
              <ButtonField
                type={editor.isActive("heading", { level: 2 }) ? "primary" : "text"}
                size="small"
                className="font-bold text-xs"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                H2
              </ButtonField>
            </Tooltip>

            <div className="w-px h-4 bg-gray-200 mx-1" />

            <Tooltip title="Bullet List">
              <ButtonField
                type={editor.isActive("bulletList") ? "primary" : "text"}
                size="small"
                icon={<MdFormatListBulleted />}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              />
            </Tooltip>
            <Tooltip title="Numbered List">
              <ButtonField
                type={editor.isActive("orderedList") ? "primary" : "text"}
                size="small"
                icon={<MdFormatListNumbered />}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              />
            </Tooltip>
            <Tooltip title="Blockquote">
              <ButtonField
                type={editor.isActive("blockquote") ? "primary" : "text"}
                size="small"
                icon={<MdFormatQuote />}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
              />
            </Tooltip>

            <div className="w-px h-4 bg-gray-200 mx-1" />

            {/* Insert Variable Dropdown */}
            <Dropdown menu={{ items: variableMenuItems }} trigger={["click"]}>
              <ButtonField
                size="small"
                className="text-primary font-semibold flex items-center gap-1 border-primary-200 hover:border-primary-400"
              >
                <HiOutlineSparkles className="text-primary text-sm" />
                <span>Insert Variable ▾</span>
              </ButtonField>
            </Dropdown>
          </div>
        )}

        {/* Right: Header/Footer Toggles + Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
            <span>Header</span>
            <Switch
              size="small"
              checked={data.header.enabled}
              onChange={(checked) =>
                setData({ ...data, header: { ...data.header, enabled: checked } })
              }
            />
            <span className="ml-1">Footer</span>
            <Switch
              size="small"
              checked={data.footer.enabled}
              onChange={(checked) =>
                setData({ ...data, footer: { ...data.footer, enabled: checked } })
              }
            />
          </div>

          <ButtonField
            size="small"
            icon={isPreview ? <MdEdit /> : <MdVisibility />}
            onClick={() => setIsPreview(!isPreview)}
          >
            {isPreview ? "Edit Mode" : "Preview"}
          </ButtonField>

          <ButtonField
            size="small"
            icon={<MdPictureAsPdf className="text-rose-500" />}
            onClick={handleExportPdf}
          >
            Export PDF
          </ButtonField>

          <ButtonField
            type="primary"
            size="small"
            icon={<MdSave />}
            loading={isSaving}
            onClick={handleSave}
          >
            Save Template
          </ButtonField>
        </div>
      </header>

      {/* ── Document Canvas (A4 Sheet with Inline Editable Header/Body/Footer) ── */}
      <DocumentCanvas
        editor={editor}
        header={data.header}
        onHeaderChange={(header) => setData((prev) => ({ ...prev, header }))}
        footer={data.footer}
        onFooterChange={(footer) => setData((prev) => ({ ...prev, footer }))}
        settings={data.settings}
        variables={variables}
        isPreviewMode={isPreview}
      />

      {/* ── PDF Print Stylesheet ── */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          header,
          .print\\:hidden {
            display: none !important;
          }
          #template-printable-canvas {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            min-height: 100vh !important;
            margin: 0 auto !important;
            padding: 12mm !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
