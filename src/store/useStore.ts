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
  setUser: (user: User | null) => void;
  setAppSettings: (settings: Partial<AppSettings>) => void;
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
      setUser: (user) => set({ user }),
      setAppSettings: (settings) => set((state) => ({
        appSettings: { ...state.appSettings, ...settings }
      })),
      toggleTheme: () => set((state) => ({
        appSettings: {
          ...state.appSettings,
          mode: state.appSettings.mode === 'light' ? 'dark' : 'light'
        }
      }))
    }),
    {
      name: 'app-settings-store',
    }
  )
);
