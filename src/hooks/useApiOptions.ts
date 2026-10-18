import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import api from "@/common/utils/api";
import { responseError, isArray, isObject, isNotEmptyArray } from "@/common/utils/main.utils";

export interface OptionType {
  key: string;
  value: string;
  [key: string]: any;
}

export interface UseApiOptionsProps {
  apiUrl?: string;
  apiMethod?: (params: any, config?: any) => Promise<any>;
  method?: "GET" | "POST";
  searchParam?: string;
  labelPath?: string;
  valuePath?: string;
  limit?: number;
  debounceMs?: number;
  extraParams?: Record<string, any>;
  onFormatData?: (data: any[]) => any[];
  initialValue?: OptionType[] | OptionType | null;
  refreshTrigger?: number;
}

export const useApiOptions = ({
  apiUrl,
  apiMethod,
  method = "GET",
  searchParam = "search",
  labelPath,
  valuePath,
  limit = 50,
  debounceMs = 400,
  extraParams = {},
  onFormatData,
  initialValue,
  refreshTrigger,
}: UseApiOptionsProps) => {
  // Normalize initialValue to an array of { key, value }
  const normalizedInitialOptions = useMemo<OptionType[]>(() => {
    if (!initialValue) return [];
    const list = isArray(initialValue) ? initialValue : isObject(initialValue) ? [initialValue] : [];
    return list
      .filter((item) => item && (item.key !== undefined || item.id !== undefined || item.value !== undefined))
      .map((item: any) => ({
        key: String(item.key !== undefined ? item.key : (item.id !== undefined ? item.id : item.value)),
        value: String(
          item.value !== undefined && item.key !== undefined
            ? item.value
            : (item.name !== undefined ? item.name : (item.label !== undefined ? item.label : item.value))
        ),
        ...item,
      }));
  }, [initialValue]);

  const [options, setOptions] = useState<OptionType[]>(normalizedInitialOptions);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [_page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingMoreError, setLoadingMoreError] = useState<string | null>(null);

  // References to prevent race conditions during rapid scrolling/typing
  const loadingRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(1);
  const searchRef = useRef("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep references in sync with state
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  // Sync initial options when initialValue updates asynchronously (e.g. edit page loads)
  useEffect(() => {
    if (isNotEmptyArray(normalizedInitialOptions)) {
      setOptions((prev) => {
        const existingKeys = new Set(prev.map((o) => o.key));
        const toAdd = normalizedInitialOptions.filter((o) => !existingKeys.has(o.key));
        if (toAdd.length === 0) return prev;
        return [...toAdd, ...prev];
      });
    }
  }, [normalizedInitialOptions]);

  // Helper to extract nested values based on a dot-separated path
  const getNestedValue = (obj: any, path?: string) => {
    if (!path) return undefined;
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  const fetchOptions = useCallback(
    async (currentSearch: string, currentPage: number, append: boolean = false) => {
      if (!apiUrl && !apiMethod) return;

      // Abort previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (append) {
        loadingMoreRef.current = true;
        setLoadingMore(true);
        setLoadingMoreError(null);
      } else {
        loadingRef.current = true;
        setLoading(true);
        setError(null);
      }

      try {
        const params = {
          [searchParam]: currentSearch,
          page: currentPage,
          limit,
          ...extraParams,
        };

        let response: any;
        if (apiMethod) {
          response = await apiMethod(params, { signal: controller.signal });
        } else if (apiUrl) {
          if (method === "POST") {
            response = await api.post(apiUrl, params, {
              signal: controller.signal,
            });
          } else {
            response = await api.get(apiUrl, {
              params,
              signal: controller.signal,
            });
          }
        }

        // Automatically resolve standard response formats
        let items: any[] = [];
        const payload = response?.data || response;

        if (isArray(payload)) {
          items = payload;
        } else if (payload && isArray(payload.rows)) {
          items = payload.rows;
        } else if (payload?.data && isArray(payload.data.rows)) {
          items = payload.data.rows;
        } else if (payload && isArray(payload.data)) {
          items = payload.data;
        } else if (payload?.data && isArray(payload.data.data)) {
          items = payload.data.data;
        } else if (payload && isArray(payload.items)) {
          items = payload.items;
        }

        if (onFormatData) {
          items = onFormatData(items);
        }

        // Map items to standard { key, value } options
        const newOptions: OptionType[] = items.map((item: any) => {
          const optKey = String(
            getNestedValue(item, valuePath) !== undefined
              ? getNestedValue(item, valuePath)
              : (item.key !== undefined ? item.key : (item.id !== undefined ? item.id : item.value))
          );

          const optValue = String(
            getNestedValue(item, labelPath) !== undefined
              ? getNestedValue(item, labelPath)
              : (item.value !== undefined && item.key !== undefined
                  ? item.value
                  : (item.name !== undefined ? item.name : (item.label !== undefined ? item.label : item.value)))
          );

          const itemLink = item.link || getNestedValue(item, "link") || item.url || getNestedValue(item, "url");

          return {
            ...item,
            key: optKey,
            value: optValue,
            link: itemLink,
            original: item,
          };
        });

        setOptions((prev) => {
          if (append) {
            const existingKeys = new Set(prev.map((o) => o.key));
            const uniqueNewOptions = newOptions.filter((o) => !existingKeys.has(o.key));
            return [...prev, ...uniqueNewOptions];
          } else {
            // Merge with normalizedInitialOptions to preserve selected items not on page 1
            const newKeys = new Set(newOptions.map((o) => o.key));
            const preservedInitials = normalizedInitialOptions.filter((o) => !newKeys.has(o.key));
            return [...preservedInitials, ...newOptions];
          }
        });

        const canLoadMore = items.length >= limit;
        hasMoreRef.current = canLoadMore;
        setHasMore(canLoadMore);
      } catch (err: any) {
        if (err.name !== "AbortError" && err.name !== "CanceledError") {
          const errMsg = responseError(err);
          if (append) {
            setLoadingMoreError(errMsg);
          } else {
            setError(errMsg);
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          loadingRef.current = false;
          loadingMoreRef.current = false;
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [apiUrl, apiMethod, method, searchParam, labelPath, valuePath, limit, extraParams, onFormatData, normalizedInitialOptions]
  );

  const fetchOptionsRef = useRef(fetchOptions);
  useEffect(() => {
    fetchOptionsRef.current = fetchOptions;
  }, [fetchOptions]);

  // Imperative refresh when refreshTrigger prop increments
  const isFirstMountRef = useRef(true);
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    if (refreshTrigger !== undefined) {
      pageRef.current = 1;
      setPage(1);
      fetchOptionsRef.current(searchRef.current, 1, false);
    }
  }, [refreshTrigger]);

  // Cleanup timers and abort controllers on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Triggered when typing into the select search with proper debouncing
  const handleSearch = useCallback(
    (value: string) => {
      searchRef.current = value;
      setSearch(value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        pageRef.current = 1;
        setPage(1);
        fetchOptionsRef.current(value, 1, false);
      }, debounceMs);
    },
    [debounceMs]
  );

  // Triggered when dropdown opens: ALWAYS fetch page 1 fresh
  const openDropdown = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchRef.current = "";
    pageRef.current = 1;
    setPage(1);
    setSearch("");
    setError(null);
    setLoadingMoreError(null);
    fetchOptionsRef.current("", 1, false);
  }, []);

  // Triggered when dropdown closes: cancel in-flight requests and clear search debounce
  const closeDropdown = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Infinite scroll: load next page with strict ref-locking
  const loadMore = useCallback(() => {
    if (loadingRef.current || loadingMoreRef.current || !hasMoreRef.current) {
      return;
    }
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    setPage(nextPage);
    fetchOptionsRef.current(searchRef.current, nextPage, true);
  }, []);

  // Retry helpers
  const retryFetch = useCallback(() => {
    pageRef.current = 1;
    setPage(1);
    fetchOptionsRef.current(searchRef.current, 1, false);
  }, []);

  const retryLoadMore = useCallback(() => {
    fetchOptionsRef.current(searchRef.current, pageRef.current, true);
  }, []);

  return {
    options,
    loading,
    loadingMore,
    hasMore,
    error,
    loadingMoreError,
    search,
    openDropdown,
    closeDropdown,
    handleSearch,
    loadMore,
    retryFetch,
    retryLoadMore,
  };
};
