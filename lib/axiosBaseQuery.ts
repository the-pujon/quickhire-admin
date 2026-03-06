import axios, { AxiosError, AxiosRequestConfig } from "axios";
import type { BaseQueryFn } from "@reduxjs/toolkit/query/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_BASE = `${API_URL}/api/v1`;

// ── localStorage token helpers ─────────────────────────────────────────────────
// Single source of truth for token read/write — no cookies needed.
export const tokenStorage = {
  getAccess: (): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem("accessToken");
    } catch {
      return null;
    }
  },
  getRefresh: (): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem("refreshToken");
    } catch {
      return null;
    }
  },
  setAccess: (token: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("accessToken", token);
    } catch {}
  },
  setRefresh: (token: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("refreshToken", token);
    } catch {}
  },
  set: (access: string, refresh: string): void => {
    tokenStorage.setAccess(access);
    tokenStorage.setRefresh(refresh);
  },
  clear: (): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } catch {}
  },
};

// ── Axios instance ─────────────────────────────────────────────────────────────
const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: false, // cookies not needed — tokens live in localStorage
  headers: { "Content-Type": "application/json" },
});

// ── Shared token-refresh state (used by both request and response interceptors) ─
let isRefreshing = false;
let refreshFailed = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

// Attach access token — proactively refresh if access token is missing but refresh token exists
axiosInstance.interceptors.request.use(
  async (config) => {
    let token = tokenStorage.getAccess();

    // Proactive refresh: no access token but refresh token is available.
    // Skip for the refresh-token endpoint itself to prevent double-rotation.
    if (
      !token &&
      tokenStorage.getRefresh() &&
      !refreshFailed &&
      !config.url?.includes("refresh-token")
    ) {
      if (isRefreshing) {
        // Another refresh is already in flight — wait for it to finish
        token = await new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).catch(() => null);
      } else {
        isRefreshing = true;
        try {
          const refreshToken = tokenStorage.getRefresh();
          const response = await axios.post(
            `${API_BASE}/auth/refresh-token`,
            { refreshToken },
            { withCredentials: false },
          );
          const responseData = response.data as {
            data?: { accessToken: string; refreshToken?: string };
            accessToken?: string;
            refreshToken?: string;
          };
          const newAccessToken =
            responseData?.data?.accessToken ?? responseData?.accessToken;
          const newRefreshToken =
            responseData?.data?.refreshToken ?? responseData?.refreshToken;

          if (newAccessToken) {
            tokenStorage.setAccess(newAccessToken);
            if (newRefreshToken) tokenStorage.setRefresh(newRefreshToken);
            refreshFailed = false;
            processQueue(null, newAccessToken);
            token = newAccessToken;
          } else {
            refreshFailed = true;
            processQueue(new Error("Invalid refresh response"), null);
          }
        } catch (err) {
          refreshFailed = true;
          processQueue(err, null);
          tokenStorage.clear();
        } finally {
          isRefreshing = false;
        }
      }
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("refresh-token")
    ) {
      if (refreshFailed) return Promise.reject(error);

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            }
            return Promise.reject(error);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = tokenStorage.getRefresh();
        if (!refreshToken) {
          refreshFailed = true;
          throw new Error("No refresh token available");
        }

        // Send refreshToken in body — backend accepts both cookie and body now
        const response = await axios.post(
          `${API_BASE}/auth/refresh-token`,
          { refreshToken },
          { withCredentials: false },
        );

        const responseData = response.data as {
          data?: { accessToken: string; refreshToken?: string };
          accessToken?: string;
          refreshToken?: string;
        };
        const newAccessToken =
          responseData?.data?.accessToken ?? responseData?.accessToken;
        const newRefreshToken =
          responseData?.data?.refreshToken ?? responseData?.refreshToken;

        if (newAccessToken) {
          tokenStorage.setAccess(newAccessToken);
          if (newRefreshToken) tokenStorage.setRefresh(newRefreshToken);
          refreshFailed = false;
          processQueue(null, newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return axiosInstance(originalRequest);
        }

        refreshFailed = true;
        throw new Error("Invalid refresh response");
      } catch (refreshError) {
        const err = refreshError as AxiosError;
        if (err.response?.status === 429) refreshFailed = true;
        processQueue(refreshError, null);
        tokenStorage.clear();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ── RTK Query base query ───────────────────────────────────────────────────────
export interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  headers?: AxiosRequestConfig["headers"];
}

export const axiosBaseQuery: BaseQueryFn<
  AxiosBaseQueryArgs,
  unknown,
  { status?: number; data?: unknown; message?: string }
> = async ({ url, method = "GET", data, params, headers }) => {
  try {
    const result = await axiosInstance({ url, method, data, params, headers });
    return { data: result.data };
  } catch (axiosError) {
    const err = axiosError as AxiosError<{ message?: string }>;
    return {
      error: {
        status: err.response?.status,
        data: err.response?.data,
        message: err.response?.data?.message || err.message,
      },
    };
  }
};

// Call after successful login to reset any prior failed-refresh state
export const resetRefreshState = () => {
  refreshFailed = false;
  isRefreshing = false;
  failedQueue = [];
};

export { axiosInstance };
