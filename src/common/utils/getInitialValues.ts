import { FieldConfig } from "@/types/formField.types";
import { isArray, isNotEmptyArray } from "./main.utils";

function getInitialValues(fields: FieldConfig[] | FieldConfig[][]) {
  const data = {} as Record<string, any>;
  if (!isNotEmptyArray(fields)) return data;

  const processField = (field: FieldConfig) => {
    if (field.type === "heading" || field.type === "divider") return;
    data[field.id] = field.value !== undefined ? field.value : field.defaultValue;
  };

  fields.forEach((item: any) => {
    if (isArray(item)) {
      item.forEach(processField);
    } else {
      processField(item);
    }
  });

  return data;
}

export default getInitialValues;
