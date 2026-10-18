import adjustColor from "@/common/utils/adjsutColor.utils";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeState = {
  themeName?: string;
  primaryColor: string;
  sidebarColor: string;
  hydrated: boolean;
  setHydrated: (state: boolean) => void;
  setPrimaryColor: (color: string) => void;
  setSidebarColor: (color: string) => void;
  setTheme: (primary: string, sidebar: string, name?: string) => void;
};

// Simple color scale generation
const generateColorScale = (base: string) => ({
  20: adjustColor(base, 280),
  30: adjustColor(base, 250),
  50: adjustColor(base, 200),
  100: adjustColor(base, 160),
  200: adjustColor(base, 120),
  300: adjustColor(base, 80),
  400: adjustColor(base, 40),
  500: base,
  600: adjustColor(base, -20),
  700: adjustColor(base, -40),
  800: adjustColor(base, -60),
  900: adjustColor(base, -80),
});

const generateSidebarScale = (base: string) => {
  const num = parseInt(base.replace("#", ""), 16) || 0;
  const isLight = ((num >> 16) * 0.299 + ((num >> 8) & 0x00ff) * 0.587 + (num & 0x0000ff) * 0.114) > 186;
  return {
    bg: base,
    hover: isLight ? adjustColor(base, -10) : adjustColor(base, 20),
    border: isLight ? adjustColor(base, -20) : adjustColor(base, 40),
    textPrimary: isLight ? "#1f2937" : "#f9fafb",
    textSecondary: isLight ? "#4b5563" : "#9ca3af",
  };
};

// Helper to set CSS variables
const setCSSVar = (name: string, value: string) => {
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty(name, value);
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeName: "Light Blush",
      primaryColor: "#e62e4d",
      sidebarColor: "#fdebee",
      hydrated: false,

      setHydrated: (state) => set({ hydrated: state }),

      setPrimaryColor: (color) => {
        const hoverColor = adjustColor(color, -20);
        const scale = generateColorScale(color);

        // Apply all CSS variables
        setCSSVar("--primary", color);
        setCSSVar("--primary-hover", hoverColor);
        
        Object.entries(scale).forEach(([key, value]) => {
          setCSSVar(`--primary-${key}`, value);
        });

        set({ primaryColor: color });
      },

      setSidebarColor: (color) => {
        const scale = generateSidebarScale(color);
        setCSSVar("--sidebar-bg", scale.bg);
        setCSSVar("--sidebar-hover", scale.hover);
        setCSSVar("--sidebar-border", scale.border);
        setCSSVar("--sidebar-text", scale.textPrimary);
        setCSSVar("--sidebar-text-muted", scale.textSecondary);
        set({ sidebarColor: color });
      },

      setTheme: (primary, sidebar, name) => {
        const hoverColor = adjustColor(primary, -20);
        const scale = generateColorScale(primary);

        setCSSVar("--primary", primary);
        setCSSVar("--primary-hover", hoverColor);

        Object.entries(scale).forEach(([key, value]) => {
          setCSSVar(`--primary-${key}`, value);
        });

        const sidebarScale = generateSidebarScale(sidebar);
        setCSSVar("--sidebar-bg", sidebarScale.bg);
        setCSSVar("--sidebar-hover", sidebarScale.hover);
        setCSSVar("--sidebar-border", sidebarScale.border);
        setCSSVar("--sidebar-text", sidebarScale.textPrimary);
        setCSSVar("--sidebar-text-muted", sidebarScale.textSecondary);

        set({ primaryColor: primary, sidebarColor: sidebar, themeName: name });
      },
    }),
    {
      name: "theme-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Reapply stored primary theme
          const hoverColor = adjustColor(state.primaryColor, -20);
          const scale = generateColorScale(state.primaryColor);
          
          setCSSVar("--primary", state.primaryColor);
          setCSSVar("--primary-hover", hoverColor);
          
          Object.entries(scale).forEach(([key, value]) => {
            setCSSVar(`--primary-${key}`, value);
          });
          
          // Reapply stored sidebar theme
          const sidebarScale = generateSidebarScale(state.sidebarColor);
          setCSSVar("--sidebar-bg", sidebarScale.bg);
          setCSSVar("--sidebar-hover", sidebarScale.hover);
          setCSSVar("--sidebar-border", sidebarScale.border);
          setCSSVar("--sidebar-text", sidebarScale.textPrimary);
          setCSSVar("--sidebar-text-muted", sidebarScale.textSecondary);

          state.setHydrated(true);
        }
      },
    }
  )
);