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

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,           // sends the HTTP-only refresh-token cookie
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

// ── 3. Response interceptor — 401 refresh-and-retry ──────────────────────────

// Track whether a refresh is already in flight to avoid concurrent calls.
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function processQueue(newToken: string) {
  refreshQueue.forEach((resolve) => resolve(newToken));
  refreshQueue = [];
}

api.interceptors.response.use(
  // Happy path → pass through unchanged
  (response) => response,

  // Error path
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retried?: boolean;
    };

    // Only attempt refresh on 401, and only once per request.
    const is401 =
      error.response?.status === 401 &&
      original &&
      !original._retried;

    // Skip refresh for the refresh endpoint itself (prevent infinite loop).
    const isRefreshCall = original?.url?.includes("/auth/refresh");

    if (!is401 || isRefreshCall) {
      return Promise.reject(error);
    }

    original._retried = true;

    if (isRefreshing) {
      // Queue this request until the in-flight refresh completes.
      return new Promise<string>((resolve) => {
        refreshQueue.push(resolve);
      }).then((newToken) => {
        if (original.headers) {
          original.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(original);
      });
    }

    isRefreshing = true;

    try {
      // POST /auth/refresh — backend reads the HTTP-only cookie automatically.
      const { data } = await api.post<{ accessToken: string }>("/auth/refresh");
      const newToken = data.accessToken;

      authStore.set(newToken);
      processQueue(newToken);

      if (original.headers) {
        original.headers.Authorization = `Bearer ${newToken}`;
      }

      return api(original);
    } catch (refreshError) {
      // Refresh failed → log out silently.
      authStore.clear();
      refreshQueue = [];
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
