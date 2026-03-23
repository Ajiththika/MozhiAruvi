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
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
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

// ── 3. Response interceptor ──────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Only attempt refresh if it's a 401, not already retrying, and not a login/logout/refresh request
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;
      return axios
        .post<{ accessToken: string }>(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        .then((res) => {
          const newToken = res.data.accessToken;
          authStore.set(newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        })
        .catch((refreshError) => {
          authStore.clear();
          return Promise.reject(refreshError);
        });
    }

    return Promise.reject(error);
  }
);

export default api;
