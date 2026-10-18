import {
  FieldConfig,
  FieldType,
  FormSchema,
} from "@/components/form-builder/form.types";
import { create } from "zustand";

function generateId() {
  return crypto.randomUUID();
}

function createDefaultField(type: FieldType, label: string): FieldConfig {
  const id = generateId();

  const base: FieldConfig = {
    id,
    type,
    label,
    placeholder: "",
    helpText: "",
    validation: { required: false },
    width: "full",
    hidden: false,
    disabled: false,
  };

  if (["select", "multiselect", "radio", "checkbox"].includes(type)) {
    base.options = [
      { label: "Option 1", value: "option_1" },
      { label: "Option 2", value: "option_2" },
      { label: "Option 3", value: "option_3" },
    ];
  }

  return base;
}

interface FormBuilderState {
  form: FormSchema;

  addField: (type: FieldType, label: string) => void;
  removeField: (id: string) => void;
  updateField: (id: string, updates: Partial<FieldConfig>) => void;
  selectField: (id: string | null) => void;
  duplicateField: (id: string) => void;
  reorderById: (activeId: string, overId: string) => void;
}

export const useFormBuilder = create<FormBuilderState>((set) => ({
  form: {
    fields: {},
    order: [],
    selectedFieldId: null,
  },

  // ✅ Add field
  addField: (type, label) => {
    const field = createDefaultField(type, label);

    set((state) => ({
      form: {
        ...state.form,
        fields: {
          ...state.form.fields,
          [field.id]: field,
        },
        order: [...state.form.order, field.id],
        selectedFieldId: field.id,
      },
    }));
  },

  // ✅ Remove field
  removeField: (id) =>
    set((state) => {
      if (!state.form.fields[id]) return state;

      const { [id]: _, ...rest } = state.form.fields;

      return {
        form: {
          ...state.form,
          fields: rest,
          order: state.form.order.filter((fid) => fid !== id),
          selectedFieldId:
            state.form.selectedFieldId === id
              ? null
              : state.form.selectedFieldId,
        },
      };
    }),

  // ✅ Update field
  updateField: (id, updates) =>
    set((state) => {
      const field = state.form.fields[id];
      if (!field) return state;

      return {
        form: {
          ...state.form,
          fields: {
            ...state.form.fields,
            [id]: {
              ...field,
              ...updates,
            },
          },
        },
      };
    }),

  // ✅ Select field
  selectField: (id) =>
    set((state) => ({
      form: {
        ...state.form,
        selectedFieldId: id,
      },
    })),

  // ✅ Duplicate field (clean + safe)
  duplicateField: (id) =>
    set((state) => {
      const original = state.form.fields[id];
      if (!original) return state;

      const newId = generateId();

      const newField: FieldConfig = {
        ...structuredClone(original),
        id: newId,
        label: original.label + " (Copy)",
      };

      const index = state.form.order.indexOf(id);
      const newOrder = [...state.form.order];
      newOrder.splice(index + 1, 0, newId);

      return {
        form: {
          ...state.form,
          fields: {
            ...state.form.fields,
            [newId]: newField,
          },
          order: newOrder,
          selectedFieldId: newId,
        },
      };
    }),

  // 🔥 CORE: dnd-kit reorder
  reorderById: (activeId, overId) =>
    set((state) => {
      const order = state.form.order;

      const oldIndex = order.indexOf(activeId);
      const newIndex = order.indexOf(overId);

      if (oldIndex === -1 || newIndex === -1) return state;
      if (oldIndex === newIndex) return state;

      const newOrder = [...order];
      const [moved] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, moved);

      return {
        form: {
          ...state.form,
          order: newOrder,
        },
      };
    }),
}));
