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

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const apiBaseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 10000,
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

    // 2. Logging and Final reject
    console.error("[API ERROR]:", error.response?.data || error.message);

    if (!error.response) {
      console.error("Server not reachable");
    }

    return Promise.reject(error);
  }
);

export default api;
