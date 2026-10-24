import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppSettings {
  primaryColor: string;
  mode: 'light' | 'dark';
  currency: string;
  language: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface StoreState {
  user: User | null;
  appSettings: AppSettings;
  tenantSettings: AppSettings;
  setUser: (user: User | null) => void;
  setAppSettings: (settings: Partial<AppSettings>) => void;
  setTenantSettings: (settings: Partial<AppSettings>) => void;
  toggleTheme: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      user: null,
      appSettings: {
        primaryColor: '#e62e4d',
        mode: 'light',
        currency: 'USD',
        language: 'en'
      },
      tenantSettings: {
        primaryColor: '#e62e4d',
        mode: 'light',
        currency: 'USD',
        language: 'en'
      },
      setUser: (user) => set({ user }),
      setAppSettings: (settings) => set((state) => {
        const next = { ...state.appSettings, ...settings };
        return { appSettings: next, tenantSettings: next };
      }),
      setTenantSettings: (settings) => set((state) => {
        const next = { ...state.tenantSettings, ...settings };
        return { appSettings: next, tenantSettings: next };
      }),
      toggleTheme: () => set((state) => {
        const nextMode = state.appSettings.mode === 'light' ? 'dark' : 'light';
        const next = { ...state.appSettings, mode: nextMode as 'light' | 'dark' };
        return { appSettings: next, tenantSettings: next };
      })
    }),
    {
      name: 'app-settings-store',
    }
  )
);
