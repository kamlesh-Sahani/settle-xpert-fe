import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  roleId: string;
}

interface Webhooks {
  [key: string]: string;
}

interface UserState {
  user: User | null;
  permissions: Set<string>;
  webhooks: Webhooks;
  isInitialized: boolean;
  setUserData: (data: { user: User; permissions: string[] | Set<string>; webhooks?: Webhooks }) => void;
  clearUserData: () => void;
  handleSessionExpired: () => void;
}

export const useUserStore = create<UserState>((set, get) => {
  // Sync auth state across multiple browser tabs
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const authChannel = new BroadcastChannel('debtcrm_auth_channel');
      authChannel.onmessage = (event) => {
        if (event.data?.type === 'LOGOUT') {
          get().clearUserData();
        } else if (event.data?.type === 'LOGIN') {
          // Trigger a refresh or mark uninitialized to reload
          set({ isInitialized: false });
        }
      };
    } catch {
      // Fallback silently if BroadcastChannel fails
    }
  }

  return {
    user: null,
    permissions: new Set(),
    webhooks: {},
    isInitialized: false,
    setUserData: (data) => {
      set((state) => ({
        user: data.user,
        permissions: data.permissions instanceof Set ? data.permissions : new Set(data.permissions),
        webhooks: data.webhooks ?? state.webhooks,
        isInitialized: true,
      }));
    },
    clearUserData: () => {
      set({
        user: null,
        permissions: new Set(),
        webhooks: {},
        isInitialized: true,
      });
    },
    handleSessionExpired: () => {
      get().clearUserData();

      if (typeof window !== 'undefined') {
        // Notify other tabs
        try {
          const authChannel = new BroadcastChannel('debtcrm_auth_channel');
          authChannel.postMessage({ type: 'LOGOUT' });
          authChannel.close();
        } catch {
          // ignore
        }

        const pathname = window.location.pathname;
        const isPublicRoute = ['/login', '/register', '/verify-otp', '/verify'].some((route) =>
          pathname.startsWith(route)
        );

        if (!isPublicRoute) {
          const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/login?callbackUrl=${callbackUrl}`;
        }
      }
    },
  };
});
