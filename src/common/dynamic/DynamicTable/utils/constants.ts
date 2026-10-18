import type { TablePayloadType } from "../types";

// ─── Ant Design Table Theme Tokens ──────────────────────────────────────────

export const TABLE_THEME = {
  headerBg: "var(--primary-5)",
  headerColor: "var(--text-primary)",
  headerBorderRadius: 0,
  borderColor: "var(--border)",
  rowHoverBg: "var(--background-secondary)",
} as const;

// ─── Pagination Defaults ────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 100;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// ─── Initial Params State ───────────────────────────────────────────────────

export const INITIAL_TABLE_PAYLOAD: TablePayloadType = {
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  search: "",
  sortBy: "",
  order: "",
};

// ─── Search Debounce ────────────────────────────────────────────────────────

export const SEARCH_DEBOUNCE_MS = 400;

// ─── Cell Renderer Layout ───────────────────────────────────────────────────

export const CELL_GAP = 8;
export const IMAGE_DEFAULT_SIZE = 25;
export const STATUS_BADGE_RADIUS = 20;
