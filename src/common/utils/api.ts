import Velocity, { type VelocityConfig } from "velocity-http";
import { useUserStore } from "@/store/user.store";

export interface responseType<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

// 1. Dedicated unintercepted auth client for refresh calls (avoids infinite loops)
const authClient = new Velocity({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    platform: "WEB",
  },
  withCredentials: true,
});

// Single in-flight refresh promise to deduplicate concurrent 401s
let refreshPromise: Promise<boolean> | null = null;

const isAuthEndpoint = (url: string = "") => {
  return (
    url.includes("/api/v1/users/login") ||
    url.includes("/api/v1/users/login-otp") ||
    url.includes("/api/v1/users/reset-password") ||
    url.includes("/api/v1/users/logout") ||
    url.includes("/api/v1/users/refresh") ||
    url.includes("/api/v1/otp/")
  );
};

const refreshAccessToken = async (): Promise<boolean> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await authClient.post("/api/v1/users/refresh");
      return Boolean(res?.status === 200 && (res?.data as any)?.success);
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// 2. Main API client with built-in retry-based auth refresh
const api = new Velocity({
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    platform: "WEB",
  },
  withCredentials: true,

  // ── Native Retry Logic for Silent Auth Refresh ──
  retry: {
    attempts: 1, // Maximum 1 retry attempt per failed request
    shouldRetry: async (errorOrResponse: any, attempt: number) => {
      const status = errorOrResponse?.status;
      const url = errorOrResponse?.config?.url || "";

      // Never attempt to refresh or retry on auth endpoints
      if (status !== 401 || isAuthEndpoint(url)) {
        return false;
      }

      // Deduplicate refresh: all concurrent 401s await this single promise
      const refreshed = await refreshAccessToken();

      if (!refreshed) {
        // Refresh token expired or revoked -> cleanly expire session
        useUserStore.getState().handleSessionExpired();
        return false;
      }

      // Refresh succeeded -> Velocity automatically retries with new cookies!
      return true;
    },
  },
});

// Gate incoming requests while a refresh is in progress to avoid 401 roundtrips
api.onRequest(async (config: VelocityConfig) => {
  const url = config.url || "";
  if (refreshPromise && !isAuthEndpoint(url)) {
    await refreshPromise;
  }
  return config;
});

export const userApi = {
  getConfig: () => api.get("/api/v1/users/config"),
  login: (data: any) => api.post("/api/v1/users/login", data),
  loginWithOtp: (data: { email: string; otpId: string; code: string }) =>
    api.post("/api/v1/users/login-otp", data),
  resetPassword: (data: { email: string; otpId: string; code: string; newPassword: string }) =>
    api.post("/api/v1/users/reset-password", data),
  logout: () => api.post("/api/v1/users/logout"),
  refresh: () => api.post("/api/v1/users/refresh"),
};

export const otpApi = {
  send: (data: { action: "PASSWORD_RESET" | "LOGIN" | "REGISTRATION" | string; email: string }) =>
    api.post("/api/v1/otp/send", data),
  verify: (data: any) =>
    api.post("/api/v1/otp/verify", data),
};

export const subscriptionApi = {
  getMe: () => api.get("/api/v1/subscriptions/get"),
  upgrade: (data: any) => api.post("/api/v1/subscriptions/update", data),
};

export const planApi = {
  getAll: (data: any = {}) => api.post("/api/v1/products/list", data),
};

export const couponApi = {
  getAll: () => api.get("/api/v1/coupons/list"),
  delete: (id: string) => api.post("/api/v1/coupons/delete", { id }),
};

export const uploadApi = {
  getPresignedUrl: (data: { filename: string; contentType: string; folder?: string }) =>
    api.post("/api/v1/upload/presigned-url", data),
  verifyUpload: (data: { key: string }) => api.post("/api/v1/upload/verify", data),
  deleteFiles: (keys: string[]) => api.post("/api/v1/upload/delete", { keys }),
};

export default api;
