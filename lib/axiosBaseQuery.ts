import axios, { AxiosError, AxiosRequestConfig } from "axios";
import type { BaseQueryFn } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_BASE = `${API_URL}/api/v1`;

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Include cookies for auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach access token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for token refresh
let isRefreshing = false;
let refreshFailed = false; // Track if refresh has failed to prevent retry loops
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh if we've already failed or are already refreshing without success
      if (refreshFailed) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue the request while refresh is in progress
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
        const refreshToken = Cookies.get("refreshToken");
        if (!refreshToken) {
          refreshFailed = true;
          throw new Error("No refresh token");
        }

        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        // Handle both wrapped (TransformInterceptor) and direct response formats
        const responseData = response.data as {
          data?: { accessToken: string; refreshToken: string };
          accessToken?: string;
          refreshToken?: string;
        };
        const tokenData = responseData.data || responseData;
        const { accessToken, refreshToken: newRefreshToken } = tokenData;

        if (accessToken && newRefreshToken) {
          Cookies.set("accessToken", accessToken, { expires: 1 }); // 1 day
          Cookies.set("refreshToken", newRefreshToken, { expires: 30 }); // 30 days

          // Reset the failure flag on successful refresh
          refreshFailed = false;
          processQueue(null, accessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return axiosInstance(originalRequest);
        }

        refreshFailed = true;
        throw new Error("Invalid refresh response");
      } catch (refreshError) {
        const err = refreshError as AxiosError;

        // If we get throttled (429), mark as failed and don't retry
        if (err.response?.status === 429) {
          refreshFailed = true;
        }

        processQueue(refreshError, null);
        // Clear tokens on refresh failure
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");

        // Don't redirect here - let the app handle it through Redux state
        // Redirecting can cause more API calls and create loops

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// RTK Query base query using Axios
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
    const result = await axiosInstance({
      url,
      method,
      data,
      params,
      headers,
    });
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

// Reset refresh state - call this when user logs in successfully
export const resetRefreshState = () => {
  refreshFailed = false;
  isRefreshing = false;
  failedQueue = [];
};

export { axiosInstance };
