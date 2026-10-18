// ─── HTTP Config ─────────────────────────────────────────────────────────────

export type ApiMethod = "get" | "post" | "put" | "delete";

export interface ApiDataType<T = any> {
  apiUrl: string;
  apiType: ApiMethod;
  params?: Record<string, string>;
  body?: Record<string, any>;
  data?: T;
}

// ─── Cell Types (Discriminated Union) ────────────────────────────────────────
// Each cell in a table column is an ARRAY of these types, rendered in sequence.

export interface ImageCellType {
  type: "IMAGE";
  src: string;
  alt?: string;
  isPreview: boolean;
  width?: number;
  height?: number;
  shape?: "circle" | "square";
  subTitle?: string;
}

export interface LinkCellType {
  type: "LINK";
  url?: string;
  title: string;
  color?: string;
  target?: "_self" | "_blank" | "_parent" | "_top";
  isEllipses?: boolean;
  subTitle?: string;
  params?: Record<string, string>;
  modalData?: {
    apiUrl?: string;
    apiType?: string;
    payload?: any;
    params?: any;
  };
}

export interface TextCellType {
  type: "TEXT";
  title: string;
  isEllipses?: boolean;
  isBold?: boolean;
  color?: string;
  fontSize?: number;
  subTitle?: string;

}

export interface StatusCellType {
  type: "STATUS";
  title: string;
  bgColor: string;
  textColor: string;
  borderColor?: string;
  subTitle?: string;

}

export interface DynamicFormCellType {
  type: "DYNAMIC_FORM";
  label?: string;
  apiData: ApiDataType;
  subTitle?: string;
}

export interface ActionCellType {
  type: "ACTION";
  actionKey: string;
  actionType?: string;
  icon?: string;
  label?: string;
  confirmMessage?: string;
  subTitle?: string;

  actionData: Record<string,any>;
}

export interface ModalCellType {
  type: "MODAL";
  label?: string;
  icon?: string;
  modalType: "IMAGE" | "IMAGES" | "CUSTOM";
  data?: any;
  subTitle?: string;

}

export type TableCellType =
  | ImageCellType
  | LinkCellType
  | TextCellType
  | StatusCellType
  | DynamicFormCellType
  | ActionCellType
  | ModalCellType;

// ─── Column Definition ──────────────────────────────────────────────────────

export interface TableColumnType {
  title: string;
  id: string;
  fixed?: "left" | "right";
  width?: number;
  minWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
  ellipsis?: boolean;
  type?: FilterType;
  options?: { key: string, value: string }[];
}

// ─── Row: each key maps to a composite cell (array of cell types) ───────────

export type TableRowType = Record<string, TableCellType[]>;

// ─── Filter Types ─────────────────────────────────────────────────────────────

export type FilterType = "TEXT" | "SELECT" | "DATE" | "DATE_RANGE" | "NUMBER";

// ─── Backend-Driven Feature Toggles ─────────────────────────────────────────

export interface TableFeaturesType {
  search?: boolean;
  sort?: boolean;
  export?: boolean;
  refresh?: boolean;
  columnToggle?: boolean;
  rowSelection?: boolean;
}
// ─── Table Data Payload ─────────────────────────────────────────────────────

export interface TableDataType {
  columns: TableColumnType[];
  rows: TableRowType[];
  features: TableFeaturesType;
  isPaginated: boolean;
  pageNumber: number;
  totalPages: number;
  pageSize: number;
  totalRows: number;
  extraData?: any;
  count: number; // total data available in db
  nextCursor?: string | null;
}

// ─── API Response Envelope ──────────────────────────────────────────────────

export interface TableResponseType {
  success: boolean;
  message: string;
  data: TableDataType;
}

// ─── Component Props ────────────────────────────────────────────────────────

import type { TableProps } from "antd";

export interface DynamicTableProps<RecordType = any>
  extends Omit<
    TableProps<RecordType>,
    "dataSource" | "pagination" | "loading" | "onChange" | "columns"
  > {
  apiData: ApiDataType;
  refreshTrigger?: number;
  onActionClick?: (data:any) => void;
  filterKey: string;
  paginationType?: "offset" | "cursor";
  border?: boolean;
}

export interface StaticTableProps<RecordType = any>
  extends Omit<
    TableProps<RecordType>,
    "dataSource" | "pagination" | "onChange" | "columns"
  > {
  staticData: TableDataType;
  refreshTrigger?: number;
  onActionClick?: (data:any) => void;
  filterKey?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  border?: boolean;
}

// ─── Internal Params State ──────────────────────────────────────────────────

export interface TablePayloadType {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  order: string;
  cursor?: string;
  direction?: "next" | "prev";
}