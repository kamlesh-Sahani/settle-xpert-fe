import { isNotEmptyString } from "@/common/utils/main.utils";
import { create } from "zustand";

type localesPops = Record<string, string>;

export type localStoreType = {
  locales: localesPops;
  setLocales: (state: localesPops) => void;
};
const useLocalesStore = create<localStoreType>((set) => {
  return {
    locales: {},
    setLocales: (locales: localesPops) => {
      set({ locales });
    },
  };
});

export default useLocalesStore;

export const generateLocaleKey = (text: string) => {
  if(!isNotEmptyString(text)) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // allow hyphen too
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_');
};
