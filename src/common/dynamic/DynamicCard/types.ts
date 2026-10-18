import type { ApiDataType } from "../DynamicTable/types";

// ─── Card Data Shape (from API) ──────────────────────────────────────────────

export interface CardInfoItem {
  key: string;
  value: string;
}

export interface CardDataItem {
  title: string;
  info: CardInfoItem[];
}

// ─── API Response ────────────────────────────────────────────────────────────

export interface CardResponseData {
  rows: CardDataItem[];
  totalRows: number;
  pageNumber?: number;
  totalPages?: number;
  pageSize?: number;
  filters?: any;
}

export interface CardResponseType {
  success: boolean;
  message: string;
  data: CardResponseData;
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface DynamicCardProps {
  apiData: ApiDataType;
  refreshTrigger?: number;
  filterKey: string;
  className?: string;
  gridClassName?: string;
  pageSize?: number;
}
