import React from "react";
import {
  Input,
  Select,
  DatePicker,
  TimePicker,
  InputNumber,
  Rate,
  Slider,
  Switch,
} from "antd";
import {
  MdDragIndicator,
  MdContentCopy,
  MdDeleteOutline,
} from "react-icons/md";
import { HiOutlineCursorClick } from "react-icons/hi";
import { useFormBuilder } from "@/store/form/formBuilder.store";
import { FIELD_ICON_MAP } from "./FieldLibrary";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  defaultAnimateLayoutChanges,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FieldConfig } from "./form.types";
import { CSS } from "@dnd-kit/utilities";

export default function FormCanvas() {
  const { form, reorderById } = useFormBuilder();
  const { fields, order } = form;

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;
    if (active.id !== over.id) {
      reorderById(active.id as string, over.id as string);
    }
  }

  // Empty state
  if (order.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div
          className="w-full max-w-[700px] min-h-[500px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 shadow-sm"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center animate-bounce"
              style={{ background: "var(--primary-100)" }}
            >
              <HiOutlineCursorClick
                className="text-3xl"
                style={{ color: "var(--primary)" }}
              />
            </div>
            <div
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "var(--primary)" }}
            >
              <span className="text-white text-[10px] font-bold">+</span>
            </div>
          </div>
          <div className="text-center mt-2">
            <h3
              className="text-base font-bold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              Start building your form
            </h3>
            <p
              className="text-sm max-w-[300px] leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Click any field from the left panel to add it here. Drag to
              reorder fields.
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            {["Text", "Email", "Select"].map((t) => (
              <span
                key={t}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: "var(--background)",
                  color: "var(--text-secondary)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8 flex justify-center">
      <div className="w-full max-w-[700px]">
        <div className="min-h-[400px] flex flex-col gap-4">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
          >
            <SortableContext
              items={order}
              strategy={verticalListSortingStrategy}
            >
              {order.map((id) => {
                const field = fields[id];
                if (!field) return null;
                return <FieldItem key={id} field={field} id={id} />;
              })}
            </SortableContext>

            <DragOverlay dropAnimation={null}>
              {activeId ? (
                <div className="w-full opacity-80 pointer-events-none">
                  <FieldItem field={fields[activeId]} id={activeId} isOverlay />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
}

function FieldItem({
  field,
  id,
  isOverlay,
}: {
  field: FieldConfig;
  id: string;
  isOverlay?: boolean;
}) {
  const {
    setNodeRef,
    listeners,
    attributes,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    animateLayoutChanges: defaultAnimateLayoutChanges,
    disabled: isOverlay,
  });

  const { form, selectField, removeField, duplicateField } = useFormBuilder();
  const Icon = FIELD_ICON_MAP[field.type];
  const isSelected = form.selectedFieldId === id && !isOverlay;

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging && !isOverlay ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        if (isOverlay) return;
        e.preventDefault();
        selectField(id);
      }}
      className={`group relative p-4 rounded-xl border-[0.5px] transition-all duration-200 bg-background ${
        isSelected ? "border-primary shadow-lg z-30" : "border-border "
      } ${isOverlay ? "shadow-2xl border-primary z-40" : ""}`}
    >
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={(e) => {
            e.stopPropagation();
            duplicateField(id);
          }}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-colors cursor-pointer"
          style={{
            background: "var(--background)",
            color: "var(--text-secondary)",
          }}
        >
          <MdContentCopy />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeField(id);
          }}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-colors cursor-pointer"
          style={{
            background: "var(--danger-50 || #fee2e2)",
            color: "var(--danger)",
          }}
        >
          <MdDeleteOutline />
        </button>
      </div>

      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="p-1 rounded-md cursor-grab active:cursor-grabbing transition-colors hover:bg-slate-100 text-slate-400 hover:text-primary"
        >
          <MdDragIndicator className="text-xl" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Label */}
          <div className="flex items-center gap-1.5 mb-2">
            {Icon && (
              <Icon className="text-sm" style={{ color: "var(--primary)" }} />
            )}
            <span
              className="text-[13px] font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {field.label}
            </span>
            {field.validation?.required && (
              <span style={{ color: "var(--danger)" }} className="text-sm">
                *
              </span>
            )}
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded ml-1"
              style={{
                background: "var(--background)",
                color: "var(--text-secondary)",
              }}
            >
              {field.type}
            </span>
          </div>

          {/* Help text */}
          {field.helpText && (
            <p
              className="text-[11px] mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {field.helpText}
            </p>
          )}

          {/* Preview */}
          <div className="pointer-events-none">
            <FieldPreview
              type={field.type}
              placeholder={field.placeholder}
              options={field.options}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Field Preview ── */
function FieldPreview({
  type,
  placeholder,
  options,
}: {
  type: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
}) {
  const selectOpts =
    options?.map((o) => ({ label: o.label, value: o.value })) || [];

  switch (type) {
    case "text":
    case "email":
    case "phone":
    case "url":
      return (
        <Input placeholder={placeholder || `Enter ${type}...`} size="middle" />
      );
    case "number":
      return (
        <InputNumber
          placeholder={placeholder || "0"}
          style={{ width: "100%" }}
        />
      );
    case "textarea":
      return (
        <Input.TextArea placeholder={placeholder || "Enter text..."} rows={2} />
      );
    case "select":
      return (
        <Select
          placeholder={placeholder || "Select..."}
          options={selectOpts}
          style={{ width: "100%" }}
        />
      );
    case "multiselect":
      return (
        <Select
          mode="multiple"
          placeholder={placeholder || "Select..."}
          options={selectOpts}
          style={{ width: "100%" }}
        />
      );
    case "date":
      return <DatePicker style={{ width: "100%" }} />;
    case "time":
      return <TimePicker style={{ width: "100%" }} />;
    case "datetime":
      return <DatePicker showTime style={{ width: "100%" }} />;
    case "toggle":
      return <Switch />;
    case "rating":
      return <Rate />;
    case "slider":
      return <Slider />;
    case "heading":
      return (
        <div
          className="text-lg font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {placeholder || "Section Heading"}
        </div>
      );
    case "paragraph":
      return (
        <div
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {placeholder || "Paragraph text..."}
        </div>
      );
    case "divider":
      return <hr style={{ borderColor: "var(--border)" }} className="my-1" />;
    case "file":
    case "image":
      return (
        <div
          className="border-2 border-dashed rounded-xl py-5 text-center text-xs"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          Click or drag to upload {type === "image" ? "an image" : "a file"}
        </div>
      );
    case "radio":
      return (
        <div className="flex flex-col gap-1.5">
          {(options || []).map((o, i) => (
            <label
              key={i}
              className="flex items-center gap-2 text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              <input type="radio" disabled className="accent-indigo-500" />{" "}
              {o.label}
            </label>
          ))}
        </div>
      );
    case "checkbox":
      return (
        <div className="flex flex-col gap-1.5">
          {(options || []).map((o, i) => (
            <label
              key={i}
              className="flex items-center gap-2 text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              <input type="checkbox" disabled className="accent-indigo-500" />{" "}
              {o.label}
            </label>
          ))}
        </div>
      );
    case "color":
      return (
        <input
          type="color"
          defaultValue="#6366f1"
          className="w-12 h-9 border-none cursor-pointer rounded"
        />
      );
    default:
      return <Input placeholder={placeholder || "Enter value..."} />;
  }
}
