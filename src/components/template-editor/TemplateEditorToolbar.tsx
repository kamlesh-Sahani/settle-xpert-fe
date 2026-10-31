"use client";

import React from "react";
import { Select, Tooltip, Divider } from "antd";
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdFormatStrikethrough,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdFormatAlignJustify,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdTableChart,
  MdHorizontalRule,
  MdFormatQuote,
  MdFormatClear,
  MdUndo,
  MdRedo,
} from "react-icons/md";
import ButtonField from "@/common/basic/ButtonField";

interface TemplateEditorToolbarProps {
  onCommand: (command: string, value?: string) => void;
  onInsertTable: () => void;
}

export default function TemplateEditorToolbar({
  onCommand,
  onInsertTable,
}: TemplateEditorToolbarProps) {
  const handleHeadingChange = (value: string) => {
    if (value === "p") {
      onCommand("formatBlock", "<p>");
    } else {
      onCommand("formatBlock", `<${value}>`);
    }
  };

  return (
    <div
      className="flex items-center flex-wrap gap-0.5 px-3 py-1.5 bg-white border-b sticky top-0 z-10"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Undo / Redo */}
      <Tooltip title="Undo">
        <ButtonField
          type="text"
          size="small"
          icon={<MdUndo />}
          onClick={() => onCommand("undo")}
        />
      </Tooltip>
      <Tooltip title="Redo">
        <ButtonField
          type="text"
          size="small"
          icon={<MdRedo />}
          onClick={() => onCommand("redo")}
        />
      </Tooltip>

      <Divider type="vertical" className="h-4 my-auto" />

      {/* Heading Selector */}
      <Select
        size="small"
        defaultValue="p"
        style={{ width: 110 }}
        onChange={handleHeadingChange}
        options={[
          { value: "h1", label: "Heading 1" },
          { value: "h2", label: "Heading 2" },
          { value: "h3", label: "Heading 3" },
          { value: "p", label: "Normal Text" },
        ]}
      />

      <Divider type="vertical" className="h-4 my-auto" />

      {/* Text Styles */}
      <Tooltip title="Bold (Ctrl+B)">
        <ButtonField
          type="text"
          size="small"
          icon={<MdFormatBold />}
          onClick={() => onCommand("bold")}
        />
      </Tooltip>
      <Tooltip title="Italic (Ctrl+I)">
        <ButtonField
          type="text"
          size="small"
          icon={<MdFormatItalic />}
          onClick={() => onCommand("italic")}
        />
      </Tooltip>
      <Tooltip title="Underline (Ctrl+U)">
        <ButtonField
          type="text"
          size="small"
          icon={<MdFormatUnderlined />}
          onClick={() => onCommand("underline")}
        />
      </Tooltip>
      <Tooltip title="Strikethrough">
        <ButtonField
          type="text"
          size="small"
          icon={<MdFormatStrikethrough />}
          onClick={() => onCommand("strikeThrough")}
        />
      </Tooltip>

      <Divider type="vertical" className="h-4 my-auto" />

      {/* Alignment */}
      <Tooltip title="Align Left">
        <ButtonField
          type="text"
          size="small"
          icon={<MdFormatAlignLeft />}
          onClick={() => onCommand("justifyLeft")}
        />
      </Tooltip>
      <Tooltip title="Align Center">
        <ButtonField
          type="text"
          size="small"
          icon={<MdFormatAlignCenter />}
          onClick={() => onCommand("justifyCenter")}
        />
      </Tooltip>
      <Tooltip title="Align Right">
        <ButtonField
          type="text"
          size="small"
          icon={<MdFormatAlignRight />}
          onClick={() => onCommand("justifyRight")}
        />
      </Tooltip>
      <Tooltip title="Justify">
        <ButtonField
          type="text"
          size="small"
          icon={<MdFormatAlignJustify />}
          onClick={() => onCommand("justifyFull")}
        />
      </Tooltip>

      <Divider type="vertical" className="h-4 my-auto" />

      {/* Lists & Quotes */}
      <Tooltip title="Bullet List">
        <ButtonField
          type="text"
          size="small"
          icon={<MdFormatListBulleted />}
          onClick={() => onCommand("insertUnorderedList")}
        />
      </Tooltip>
      <Tooltip title="Numbered List">
        <ButtonField
          type="text"
          size="small"
          icon={<MdFormatListNumbered />}
          onClick={() => onCommand("insertOrderedList")}
        />
      </Tooltip>
      <Tooltip title="Blockquote">
        <ButtonField
          type="text"
          size="small"
          icon={<MdFormatQuote />}
          onClick={() => onCommand("formatBlock", "<blockquote>")}
        />
      </Tooltip>

      <Divider type="vertical" className="h-4 my-auto" />

      {/* Table & Divider */}
      <Tooltip title="Insert Pricing / Data Table">
        <ButtonField
          type="text"
          size="small"
          icon={<MdTableChart />}
          onClick={onInsertTable}
        />
      </Tooltip>
      <Tooltip title="Horizontal Divider">
        <ButtonField
          type="text"
          size="small"
          icon={<MdHorizontalRule />}
          onClick={() => onCommand("insertHorizontalRule")}
        />
      </Tooltip>
      <Tooltip title="Clear Formatting">
        <ButtonField
          type="text"
          size="small"
          icon={<MdFormatClear />}
          onClick={() => onCommand("removeFormat")}
        />
      </Tooltip>
    </div>
  );
}
