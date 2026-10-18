import { useCallback } from 'react';
import { create } from 'zustand';

interface FilterStoreState {
   
  memory: Record<string, any>;
   
  setFilters: (key: string, value: any) => void;
}

// Internal Zustand store to hold all memory keys globally
const useFilterStore = create<FilterStoreState>((set) => ({
  memory: {},
  setFilters: (key, value) => 
    set((state) => ({
      memory: {
        ...state.memory,
        [key]: {
          ...(state.memory[key] || {}),
          ...value,
        },
      },
    })),
}));

/**
 * Custom hook that replaces the old `useMemory` / `useGridFilters`.
 * It is backed by Zustand, meaning it avoids the slow window event listeners
 * and forces React to automatically re-render ONLY the components using this specific key.
 * 
 * @param key Unique identifier for the table/component filter memory
 * @param defaultValue Fallback value if the memory is empty
 * @returns [filters, setFilters] array just like useState
 */
 
export function useGridFilters<T extends Record<string, any>>(
  key: string,
  defaultValue: T = {} as T
): [T, (value: Partial<T>) => void] {  
  
  // Only subscribe to the specific key in the store to prevent unnecessary re-renders
  const filters = useFilterStore((state) => state.memory[key] as T) || defaultValue;
  const setFiltersAction = useFilterStore((state) => state.setFilters);

  const setFilters = useCallback((value: Partial<T>) => {
    setFiltersAction(key, value);
  }, [setFiltersAction, key]);

  return [filters, setFilters];
}
