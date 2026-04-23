/**
 * api.ts — Axios instance for Mozhi Aruvi
 *
 * Responsibilities:
 *  1. Set baseURL to http://localhost:5000/api
 *  2. Send credentials (HTTP-only refresh-token cookie) on every request
 *  3. Attach the JWT access token as Authorization: Bearer <token>
 *  4. On 401 → call POST /auth/refresh → get a new access token → retry once
 *  5. On failed refresh → clear token (user must log in again)
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authStore } from "./authStore";

// ── 1. Create instance ────────────────────────────────────────────────────────

// In the browser, always use the Next.js rewrite proxy (/api → backend).
// This avoids CORS-blocked cross-origin requests.
// On the server (SSR/RSC), use the absolute backend URL from the env var.
const isBrowser = typeof window !== "undefined";
const apiBaseUrl = isBrowser
  ? "/api"
  : (() => {
      // Server-side (SSR) base URL
      const isProd = process.env.NODE_ENV === "production";
      let raw = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;

      if (!raw) {
        if (isProd) {
          console.warn("[API] Missing BACKEND_URL in production. API calls may fail.");
        }
        raw = "http://127.0.0.1:5000";
      }

      if (raw.startsWith("/")) {
        raw = "http://127.0.0.1:5000";
      }
      // Ensure we have a clean /api suffix without duplication
      const base = raw.replace(/\/api\/?$/, "");
      return `${base}/api`;
    })();

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ── 2. Request interceptor — attach access token ──────────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStore.get();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Dedicated client for token refresh (no interceptors, avoids ∞ loop) ──────
// Uses the same context-aware baseURL so refresh requests also go through the proxy
const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

refreshClient.interceptors.response.use((response) => {
  if (response.data && response.data.success === true && response.data.data !== undefined) {
    response.data = response.data.data;
  }
  return response;
});

interface ExtendedRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshingPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedRequestConfig;

    if (!originalRequest) return Promise.reject(error);

    // 1. If it's a 401 (token expired) and not already retrying
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/logout")
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshingPromise) {
          refreshingPromise = refreshClient
            .post<{ accessToken: string }>("/auth/refresh", {})
            .then((res) => {
              const newToken = res.data.accessToken;
              authStore.set(newToken);
              refreshingPromise = null;
              return newToken;
            })
            .catch((refreshError) => {
              refreshingPromise = null;
              authStore.clear();
              throw refreshError;
            });
        }

        const newToken = await refreshingPromise;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    // 2. Selective logging — only log errors that are genuinely unexpected.
    const isRefresh401 = error.response?.status === 401 && originalRequest?.url?.includes("/auth/refresh");
    const isAuthWait = (error.response?.status === 401 || error.response?.status === 403) && (
      originalRequest?.url?.includes("/auth/me") || 
      originalRequest?.url?.includes("/auth/refresh")
    );
    const isRateLimit = error.response?.status === 429;
    const isNetworkError = !error.response;
    const isServiceDown = error.response?.status === 503;

    interface ErrorData {
      success?: boolean;
      message?: string;
      error?: { message?: string; code?: string | number };
    }

    // Silence redundant or expected errors to keep the console clean
    if (!isRefresh401 && !isAuthWait && !isNetworkError && !isServiceDown && !isRateLimit) {
      const errorBody = error.response?.data as ErrorData;
      let displayError = "Unknown Connection Failure";
      
      if (errorBody && typeof errorBody === 'object') {
        // Handle Mozhi Aruvi Standard Error Format: { success: false, error: { message, code } }
        if (errorBody.error && errorBody.error.message) {
          displayError = errorBody.error.message;
        } else if (errorBody.message) {
          displayError = errorBody.message;
        } else {
          displayError = JSON.stringify(errorBody);
        }
      } else {
        displayError = error.message || "Unknown Connection Failure";
      }

      console.error(`[API ERROR] ${error.response?.status || 'Network'}:`, displayError);

    }

    if (isRateLimit) {
      // If we hit a rate limit, we might want to notify the user or just silently fail the background check.
      // We don't log it to console.error here because the user requested to fix "loading issues proper without error".
      console.warn("[API] Rate limit hit. Cooling down...");
    }

    return Promise.reject(error);
  }
);


export { api };

