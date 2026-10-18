"use client";

import React from "react";
import { Input, Switch, InputNumber, Select, Divider } from "antd";
import { MdSettings, MdAdd, MdClose } from "react-icons/md";
import { useFormBuilder } from "@/store/form/formBuilder.store";
import { FieldConfig, FieldOption } from "./form.types";

const FIELD_TYPE_OPTIONS = [
  { label: "Text Input", value: "text" },
  { label: "Email", value: "email" },
  { label: "Number", value: "number" },
  { label: "Phone", value: "phone" },
  { label: "URL", value: "url" },
  { label: "Text Area", value: "textarea" },
  { label: "Dropdown", value: "select" },
  { label: "Multi Select", value: "multiselect" },
  { label: "Radio Group", value: "radio" },
  { label: "Checkbox", value: "checkbox" },
  { label: "Toggle", value: "toggle" },
  { label: "Date", value: "date" },
  { label: "Time", value: "time" },
  { label: "Rating", value: "rating" },
  { label: "Slider", value: "slider" },
  { label: "File Upload", value: "file" },
  { label: "Image Upload", value: "image" },
  { label: "Heading", value: "heading" },
  { label: "Paragraph", value: "paragraph" },
  { label: "Divider", value: "divider" },
];

const HAS_OPTIONS = ["select", "multiselect", "radio", "checkbox"];

export default function FieldSettings() {
  const { form, updateField, selectField } = useFormBuilder();
  const { selectedFieldId, fields } = form;
  const field = selectedFieldId ? fields[selectedFieldId] : null;

  if (!field) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center p-6 text-center"
        style={{ background: "var(--card)" }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "var(--background)" }}
        >
          <MdSettings
            className="text-2xl"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--text-secondary)" }}
        >
          No field selected
        </p>
        <p
          className="text-xs mt-1 leading-relaxed max-w-[200px]"
          style={{ color: "var(--text-secondary)" }}
        >
          Click a field in the canvas to configure its properties
        </p>
      </div>
    );
  }

  const update = (updates: Partial<FieldConfig>) =>
    updateField(field.id, updates);
  const updateValidation = (key: string, value: unknown) => {
    updateField(field.id, {
      validation: { ...field.validation, [key]: value },
    });
  };
  const updateOption = (
    index: number,
    key: keyof FieldOption,
    value: string,
  ) => {
    const opts = [...(field.options || [])];
    opts[index] = { ...opts[index], [key]: value };
    update({ options: opts });
  };
  const addOption = () => {
    const opts = [...(field.options || [])];
    const n = opts.length + 1;
    opts.push({ label: `Option ${n}`, value: `option_${n}` });
    update({ options: opts });
  };
  const removeOption = (index: number) => {
    const opts = [...(field.options || [])];
    opts.splice(index, 1);
    update({ options: opts });
  };

  const showOptions = HAS_OPTIONS.includes(field.type);
  const showValidation = !["heading", "paragraph", "divider"].includes(
    field.type,
  );
  const showPlaceholder = ![
    "toggle",
    "rating",
    "slider",
    "heading",
    "paragraph",
    "divider",
    "file",
    "image",
  ].includes(field.type);

  return (
    <div
      className="h-full overflow-y-auto p-5"
      style={{ background: "var(--card)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3
          className="text-sm font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Field Settings
        </h3>
        <button
          onClick={() => selectField(null)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
          style={{
            background: "var(--background)",
            color: "var(--text-secondary)",
          }}
        >
          <MdClose className="text-sm" />
        </button>
      </div>

      {/* Field Type Badge */}
      <div
        className="mb-5 px-3 py-2.5 rounded-xl border"
        style={{
          background: "var(--primary-50)",
          borderColor: "var(--primary-200)",
        }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: "var(--primary)" }}
        >
          Editing: {field.type}
        </span>
        <p
          className="text-xs mt-0.5 truncate"
          style={{ color: "var(--primary-700)" }}
        >
          {field.label}
        </p>
      </div>

      {/* ── General ── */}
      <SectionTitle>General</SectionTitle>

      <FieldRow label="Field Type">
        <Select
          value={field.type}
          options={FIELD_TYPE_OPTIONS}
          onChange={(val) => update({ type: val })}
          style={{ width: "100%" }}
          size="middle"
        />
      </FieldRow>

      <FieldRow label="Label">
        <Input
          value={field.label}
          onChange={(e) => update({ label: e.target.value })}
          placeholder="Field label"
        />
      </FieldRow>

      {showPlaceholder && (
        <FieldRow label="Placeholder">
          <Input
            value={field.placeholder || ""}
            onChange={(e) => update({ placeholder: e.target.value })}
            placeholder="Placeholder text"
          />
        </FieldRow>
      )}

      <FieldRow label="Help Text">
        <Input
          value={field.helpText || ""}
          onChange={(e) => update({ helpText: e.target.value })}
          placeholder="Optional help text"
        />
      </FieldRow>

      {/* ── Layout ── */}
      <Divider style={{ margin: "16px 0" }} />
      <SectionTitle>Layout</SectionTitle>

      <FieldRow label="Width">
        <div className="flex gap-1.5">
          {(["full", "half", "third"] as const).map((w) => (
            <button
              key={w}
              onClick={() => update({ width: w })}
              className="flex-1 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer"
              style={{
                borderColor:
                  field.width === w ? "var(--primary)" : "var(--border)",
                background:
                  field.width === w ? "var(--primary-50)" : "var(--card)",
                color:
                  field.width === w
                    ? "var(--primary)"
                    : "var(--text-secondary)",
              }}
            >
              {w === "full" ? "Full" : w === "half" ? "½ Half" : "⅓ Third"}
            </button>
          ))}
        </div>
      </FieldRow>

      {/* ── Options ── */}
      {showOptions && (
        <>
          <Divider style={{ margin: "16px 0" }} />
          <SectionTitle>Options</SectionTitle>
          <div className="space-y-2 mb-3">
            {(field.options || []).map((opt, i) => (
              <div key={i} className="flex gap-1.5 items-center">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{
                    background: "var(--background)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {i + 1}
                </div>
                <Input
                  value={opt.label}
                  onChange={(e) => updateOption(i, "label", e.target.value)}
                  placeholder="Label"
                  size="small"
                  className="flex-1"
                />
                <button
                  onClick={() => removeOption(i)}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-xs transition-colors shrink-0 cursor-pointer"
                  style={{
                    background: "var(--danger-50 || #fee2e2)",
                    color: "var(--danger)",
                  }}
                >
                  <MdClose />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addOption}
            className="w-full py-2 rounded-lg border border-dashed text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
              background: "var(--background)",
            }}
          >
            <MdAdd /> Add Option
          </button>
        </>
      )}

      {/* ── Validation ── */}
      {showValidation && (
        <>
          <Divider style={{ margin: "16px 0" }} />
          <SectionTitle>Validation</SectionTitle>

          <SwitchRow
            label="Required"
            checked={field.validation?.required || false}
            onChange={(val) => updateValidation("required", val)}
          />
          <SwitchRow
            label="Disabled"
            checked={field.disabled || false}
            onChange={(val) => update({ disabled: val })}
          />
          <SwitchRow
            label="Hidden"
            checked={field.hidden || false}
            onChange={(val) => update({ hidden: val })}
          />

          {["text", "email", "textarea", "url", "phone"].includes(
            field.type,
          ) && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              <FieldRow label="Min Length">
                <InputNumber
                  value={field.validation?.minLength}
                  onChange={(val) => updateValidation("minLength", val)}
                  min={0}
                  style={{ width: "100%" }}
                  size="small"
                  placeholder="0"
                />
              </FieldRow>
              <FieldRow label="Max Length">
                <InputNumber
                  value={field.validation?.maxLength}
                  onChange={(val) => updateValidation("maxLength", val)}
                  min={0}
                  style={{ width: "100%" }}
                  size="small"
                  placeholder="∞"
                />
              </FieldRow>
            </div>
          )}

          {field.type === "number" && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              <FieldRow label="Min Value">
                <InputNumber
                  value={field.validation?.min}
                  onChange={(val) => updateValidation("min", val)}
                  style={{ width: "100%" }}
                  size="small"
                />
              </FieldRow>
              <FieldRow label="Max Value">
                <InputNumber
                  value={field.validation?.max}
                  onChange={(val) => updateValidation("max", val)}
                  style={{ width: "100%" }}
                  size="small"
                />
              </FieldRow>
            </div>
          )}

          {(field.type === "file" || field.type === "image") && (
            <div className="space-y-3 mt-3">
              <SwitchRow
                label="Allow Multiple Files"
                checked={field.validation?.multiple || false}
                onChange={(val) => updateValidation("multiple", val)}
              />
              {field.validation?.multiple && (
                <FieldRow label="Max Files Limit">
                  <InputNumber
                    value={field.validation?.maxFiles}
                    onChange={(val) => updateValidation("maxFiles", val)}
                    min={1}
                    style={{ width: "100%" }}
                    size="small"
                    placeholder="10"
                  />
                </FieldRow>
              )}
              <FieldRow label="Max File Size (MB)">
                <InputNumber
                  value={field.validation?.maxSizeMB || 10}
                  onChange={(val) => updateValidation("maxSizeMB", val)}
                  min={1}
                  style={{ width: "100%" }}
                  size="small"
                  placeholder="10"
                />
              </FieldRow>
              <FieldRow label="Allowed Formats (e.g. .png,.jpg)">
                <Input
                  value={field.validation?.accept || ""}
                  onChange={(e) => updateValidation("accept", e.target.value)}
                  placeholder={
                    field.type === "image"
                      ? "image/*"
                      : ".pdf,.doc,.docx"
                  }
                  size="small"
                />
              </FieldRow>
            </div>
          )}

          <FieldRow label="Error Message">
            <Input
              value={field.validation?.customMessage || ""}
              onChange={(e) =>
                updateValidation("customMessage", e.target.value)
              }
              placeholder="Custom error message"
              size="small"
            />
          </FieldRow>
        </>
      )}
    </div>
  );
}

/* ── Subcomponents ── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[10.5px] font-bold uppercase tracking-[1.2px] mb-3 px-0.5"
      style={{ color: "var(--text-secondary)" }}
    >
      {children}
    </div>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <label
        className="text-xs font-semibold mb-1.5 block"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function SwitchRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div
      className="flex items-center justify-between px-3 py-2.5 rounded-xl border mb-2"
      style={{ background: "var(--background)", borderColor: "var(--border)" }}
    >
      <span
        className="text-[13px] font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        {label}
      </span>
      <Switch size="small" checked={checked} onChange={onChange} />
    </div>
  );
}
