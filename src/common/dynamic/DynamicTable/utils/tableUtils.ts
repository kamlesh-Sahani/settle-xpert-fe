import { isNotEmpty, isNotEmptyArray } from "@/common/utils/main.utils";
import type { TablePayloadType, DynamicTableProps } from "../types";

/**
 * Builds the payload for POST requests sent to the API.
 */
export function buildTablePayload({
  apiData,
  payload,
  tableSearch,
  activeFiltersObj,
  paginationType = "offset",
}: {
  apiData: DynamicTableProps["apiData"];
  payload: TablePayloadType;
  tableSearch?: string;
  activeFiltersObj: Record<string, any>;
  paginationType?: "offset" | "cursor";
}) {
  const postBody: Record<string, any> = {
    page: payload.page,
    limit: payload.limit,
    search: tableSearch || "",
    sortBy: payload.sortBy || "",
    order: payload.order || "",
    filters: activeFiltersObj,
    paginationType: paginationType,
  };

  if (payload.cursor) {
    postBody.cursor = payload.cursor;
  }

  if (apiData?.body) {
    Object.assign(postBody, apiData.body);
  }

  return { postBody };
}

/**
 * Parses Ant Design's filter object into our custom API format.
 */
export function parseAntdFilters(
  antdFilters: any,
  currentFilters: any,
  columnsConfig: any[]
) {
  const newColumnFilters = { ...(currentFilters || {}) };
  let hasChanges = false;

  Object.keys(antdFilters).forEach((key) => {
    const val = antdFilters[key];

    if (isNotEmptyArray(val)) {
      try {
        const columnConfig = columnsConfig?.find((c: any) => c.id === key);
        const isSelect = columnConfig?.type === "SELECT" || isNotEmptyArray(columnConfig?.options);
        
        // Use uppercase standard operators
        const defaultOperator = isSelect ? "EQUAL" : "CONTAINS";
        
        const parsed = JSON.parse(String(val[0]));
        if (isNotEmpty(parsed.value)) {
          newColumnFilters[key] = {
            operator: parsed.operator || defaultOperator,
            // Ensure value is always sent as an array
            value: Array.isArray(parsed.value) ? parsed.value : [parsed.value],
          };
          hasChanges = true;
        } else if (newColumnFilters[key]) {
          delete newColumnFilters[key];
          hasChanges = true;
        }
      } catch (e) {
        console.error("Failed to parse column filter", e);
      }
    } else if (newColumnFilters[key]) {
      // Clear filter
      delete newColumnFilters[key];
      hasChanges = true;
    }
  });

  return { newColumnFilters, hasChanges };
}
