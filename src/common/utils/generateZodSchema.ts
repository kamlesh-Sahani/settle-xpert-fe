import { z } from "zod";
import { FieldConfig } from "@/types/formField.types";

/**
 * Recursively extracts all fields from a 2D rows array and converts them
 * into a single flat Zod schema object.
 */
export const generateZodSchema = (fieldsOrRows: FieldConfig[] | FieldConfig[][]) => {
  const shape: Record<string, z.ZodTypeAny> = {};
  
  // Flatten in case it's a 2D array (rows)
  const fields = fieldsOrRows.flat();

  fields.forEach((field) => {
    // Ignore layout/presentation fields
    if (["heading", "paragraph", "divider", "chart"].includes(field.type)) {
      return;
    }

    const { id, name, type, label, validation } = field;
    const fieldKey = name || id;

    if (!fieldKey) return;
    
    // Default base type
    let fieldSchema: any;

    if (type === "number" || type === "rating" || type === "slider") {
      fieldSchema = z.coerce.number();
    } else if (type === "checkbox" || type === "multiselect") {
      fieldSchema = z.array(z.string());
    } else if (type === "toggle") {
      fieldSchema = z.coerce.boolean();
    } else {
      fieldSchema = z.string();
    }

    // Apply specific type validations if the field is a string
    if (type === "email") {
      fieldSchema = fieldSchema.email(validation?.customMessage || "Invalid email address");
    } else if (type === "url") {
      fieldSchema = fieldSchema.url(validation?.customMessage || "Invalid URL format");
    }

    // Apply ValidationRule restrictions
    if (validation) {
      if (type === "number" || type === "rating" || type === "slider") {
        if (validation.min !== undefined) fieldSchema = fieldSchema.min(validation.min, validation.customMessage || `Must be at least ${validation.min}`);
        if (validation.max !== undefined) fieldSchema = fieldSchema.max(validation.max, validation.customMessage || `Must be at most ${validation.max}`);
      } else if (type !== "checkbox" && type !== "multiselect" && type !== "toggle") {
        // String validations
        if (validation.minLength !== undefined) fieldSchema = fieldSchema.min(validation.minLength, validation.customMessage || `Must be at least ${validation.minLength} characters`);
        if (validation.maxLength !== undefined) fieldSchema = fieldSchema.max(validation.maxLength, validation.customMessage || `Must be at most ${validation.maxLength} characters`);
        if (validation.pattern) {
          try {
            fieldSchema = fieldSchema.regex(new RegExp(validation.pattern), validation.customMessage || "Invalid format");
          } catch (_e) {
            console.error(`Invalid regex pattern for field ${id}: ${validation.pattern}`);
          }
        }
      }
    }

    // Handle required vs optional
    if (validation?.required) {
      if (type === "checkbox" || type === "multiselect") {
        fieldSchema = fieldSchema.min(1, validation?.customMessage || `${label || "Field"} is required`);
      } else if (type !== "number" && type !== "rating" && type !== "slider" && type !== "toggle") {
        // For strings, .min(1) is the standard way to make it required (not empty)
        fieldSchema = fieldSchema.min(1, validation?.customMessage || `${label || "Field"} is required`);
      }
    } else {
      // If not required, it can be empty/undefined/null
      if (type === "number" || type === "rating" || type === "slider" || type === "toggle") {
        fieldSchema = fieldSchema.optional().nullable();
      } else if (type === "checkbox" || type === "multiselect") {
        fieldSchema = fieldSchema.optional().default([]);
      } else {
        // For strings, allow empty string
        fieldSchema = fieldSchema.optional().or(z.literal(""));
      }
    }

    // Assign to schema shape
    shape[fieldKey] = fieldSchema;
  });

  return z.object(shape);
};
