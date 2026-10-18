"use client";

import React, { useMemo, useState } from "react";
import {
  MdTextFields,
  MdEmail,
  MdNumbers,
  MdPhone,
  MdLink,
  MdNotes,
  MdArrowDropDownCircle,
  MdChecklist,
  MdRadioButtonChecked,
  MdCheckBox,
  MdToggleOn,
  MdCalendarToday,
  MdAccessTime,
  MdDateRange,
  MdAttachFile,
  MdImage,
  MdStar,
  MdTune,
  MdColorLens,
  MdTitle,
  MdShortText,
  MdHorizontalRule,
  MdSearch,
} from "react-icons/md";
import { LibraryField, FieldCategory, FieldType } from "./form.types";
import { useFormBuilder } from "@/store/form/formBuilder.store";
import { IconType } from "react-icons";

export const FIELD_ICON_MAP: Record<FieldType, IconType> = {
  text: MdTextFields,
  email: MdEmail,
  number: MdNumbers,
  phone: MdPhone,
  url: MdLink,
  textarea: MdNotes,
  select: MdArrowDropDownCircle,
  multiselect: MdChecklist,
  radio: MdRadioButtonChecked,
  checkbox: MdCheckBox,
  toggle: MdToggleOn,
  date: MdCalendarToday,
  time: MdAccessTime,
  datetime: MdDateRange,
  file: MdAttachFile,
  image: MdImage,
  rating: MdStar,
  slider: MdTune,
  color: MdColorLens,
  heading: MdTitle,
  paragraph: MdShortText,
  divider: MdHorizontalRule,
};

const ICON_STYLES: Record<FieldCategory, { color: string }> = {
  basic: { color: "var(--primary)" },
  advanced: { color: "var(--success)" },
  layout: { color: "var(--warning)" },
  media: { color: "var(--danger)" },
};

const LIBRARY_FIELDS: LibraryField[] = [
  {
    type: "text",
    label: "Text Input",
    category: "basic",
    description: "Single line text",
  },
  {
    type: "email",
    label: "Email",
    category: "basic",
    description: "Email address",
  },
  {
    type: "number",
    label: "Number",
    category: "basic",
    description: "Numeric value",
  },
  {
    type: "phone",
    label: "Phone",
    category: "basic",
    description: "Phone number",
  },
  {
    type: "textarea",
    label: "Text Area",
    category: "basic",
    description: "Multi-line text",
  },
  {
    type: "select",
    label: "Dropdown",
    category: "basic",
    description: "Single selection",
  },
  {
    type: "date",
    label: "Date",
    category: "basic",
    description: "Date picker",
  },
  {
    type: "multiselect",
    label: "Multi Select",
    category: "advanced",
    description: "Multiple choices",
  },
  {
    type: "radio",
    label: "Radio Group",
    category: "advanced",
    description: "Radio buttons",
  },
  {
    type: "checkbox",
    label: "Checkbox",
    category: "advanced",
    description: "Multiple checkboxes",
  },
  {
    type: "toggle",
    label: "Toggle",
    category: "advanced",
    description: "On/off switch",
  },
  { type: "url", label: "URL", category: "advanced", description: "Web link" },
  {
    type: "time",
    label: "Time",
    category: "advanced",
    description: "Time picker",
  },
  {
    type: "rating",
    label: "Rating",
    category: "advanced",
    description: "Star rating",
  },
  {
    type: "slider",
    label: "Slider",
    category: "advanced",
    description: "Range slider",
  },
  {
    type: "file",
    label: "File Upload",
    category: "media",
    description: "Upload files",
  },
  {
    type: "image",
    label: "Image Upload",
    category: "media",
    description: "Upload images",
  },
  {
    type: "heading",
    label: "Heading",
    category: "layout",
    description: "Section title",
  },
  {
    type: "paragraph",
    label: "Paragraph",
    category: "layout",
    description: "Info text",
  },
  {
    type: "divider",
    label: "Divider",
    category: "layout",
    description: "Horizontal rule",
  },
];

const CATEGORY_LABELS: Record<FieldCategory, string> = {
  basic: "Basic Fields",
  advanced: "Advanced",
  layout: "Layout",
  media: "Media & Files",
};
const CATEGORY_ORDER: FieldCategory[] = [
  "basic",
  "advanced",
  "media",
  "layout",
];

export default function FieldLibrary() {
  const [search, setSearch] = useState("");
  const addField = useFormBuilder((s) => s.addField);

  const filtered = useMemo(() => {
    if (!search.trim()) return LIBRARY_FIELDS;
    const q = search.toLowerCase();
    return LIBRARY_FIELDS.filter(
      (f) => f.label.toLowerCase().includes(q) || f.type.includes(q),
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map = new Map<FieldCategory, LibraryField[]>();
    for (const cat of CATEGORY_ORDER) {
      const items = filtered.filter((f) => f.category === cat);
      if (items.length > 0) map.set(cat, items);
    }
    return map;
  }, [filtered]);

  return (
    <div
      className="p-4 h-full overflow-y-auto"
      style={{ background: "var(--card)" }}
    >
      {/* Search */}
      <div className="relative mb-5">
        <MdSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 text-lg"
          style={{ color: "var(--text-secondary)" }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search fields..."
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border transition-all duration-200"
          style={{
            background: "var(--background)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* Grouped fields */}
      {Array.from(grouped).map(([category, items]) => (
        <div key={category} className="mb-5">
          <div
            className="text-[10.5px] font-bold uppercase tracking-[1.2px] mb-2.5 px-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {CATEGORY_LABELS[category]}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {items.map((field) => {
              const Icon = FIELD_ICON_MAP[field.type];
              const styles = ICON_STYLES[field.category];
              return (
                <div
                  key={field.type}
                  onClick={() => addField(field.type, field.label)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-base group-hover:scale-110 transition-transform duration-200"
                    style={{ color: styles.color }}
                  >
                    <Icon className="text-[18px]" />
                  </div>
                  <span
                    className="text-[11px] font-semibold leading-tight text-center"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {field.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {grouped.size === 0 && (
        <div
          className="text-center py-10 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          No fields match &ldquo;{search}&rdquo;
        </div>
      )}
    </div>
  );
}
