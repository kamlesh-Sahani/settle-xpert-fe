import { create } from 'zustand';

interface EmployeeAddress {
  line1?: string;
  country?: string;
  state?: string;
  city?: string;
  zip?: string;
}

export interface Employee {
  id: string;
  empId?: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  roleId: string;
  roleName?: string;
  logo?: string;
  dob?: string;
  gender?: string;
  fatherName?: string;
  motherName?: string;
  panCard?: string;
  dateOfJoining?: string;
  aadharNumber?: string;
  aadharFront?: string;
  aadharBack?: string;
  address?: EmployeeAddress;
}

interface Webhooks {
  [key: string]: string;
}

interface EmployeeState {
  employee: Employee | null;
  permissions: Set<string>;
  webhooks: Webhooks;
  isInitialized: boolean;
  setEmployeeData: (data: { employee?: Employee; permissions: string[] | Set<string>; webhooks?: Webhooks }) => void;
  clearEmployeeData: () => void;
  handleSessionExpired: () => void;
}

export const useEmployeeStore = create<EmployeeState>((set, get) => {
  // Sync auth state across multiple browser tabs
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const authChannel = new BroadcastChannel('debtcrm_auth_channel');
      authChannel.onmessage = (event) => {
        if (event.data?.type === 'LOGOUT') {
          get().clearEmployeeData();
        } else if (event.data?.type === 'LOGIN') {
          set({ isInitialized: false });
        }
      };
    } catch {
      // Fallback silently if BroadcastChannel fails
    }
  }

  return {
    employee: null,
    permissions: new Set(),
    webhooks: {},
    isInitialized: false,
    setEmployeeData: (data) => {
      set((state) => ({
        employee: data.employee || null,
        permissions: data.permissions instanceof Set ? data.permissions : new Set(data.permissions),
        webhooks: data.webhooks ?? state.webhooks,
        isInitialized: true,
      }));
    },
    clearEmployeeData: () => {
      set({
        employee: null,
        permissions: new Set(),
        webhooks: {},
        isInitialized: true,
      });
    },
    handleSessionExpired: () => {
      get().clearEmployeeData();

      if (typeof window !== 'undefined') {
        try {
          const authChannel = new BroadcastChannel('debtcrm_auth_channel');
          authChannel.postMessage({ type: 'LOGOUT' });
          authChannel.close();
        } catch {
          // ignore
        }

        const pathname = window.location.pathname;
        const isPublicRoute = ['/login', '/register', '/verify'].some((route) =>
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
