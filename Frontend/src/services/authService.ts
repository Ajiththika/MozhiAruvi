/**
 * authService.ts
 *
 * All calls to /api/auth/*
 * Access token is stored via authStore after login/register/refresh.
 */

import api from "@/lib/api";
import { authStore } from "@/lib/authStore";
import { Lesson, Progress } from "./lessonService";
import { User } from "@/types/user";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// ── Register ──────────────────────────────────────────────────────────────────

export async function register(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/register", data);
  authStore.set(res.data.accessToken);
  return res.data;
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function login(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  console.log("[AUTH] Dispatching login request to /auth/login...");
  const res = await api.post<AuthResponse>("/auth/login", data);
  authStore.set(res.data.accessToken);
  return res.data;
}

// ── Logout ────────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
  authStore.clear();
}

// ── Refresh ───────────────────────────────────────────────────────────────────
// Called automatically by the Axios interceptor; exposed here for manual use.

export async function refresh(): Promise<string> {
  const res = await api.post<{ accessToken: string }>("/auth/refresh");
  authStore.set(res.data.accessToken);
  return res.data.accessToken;
}

export interface DashboardData {
  user: User;
  lessons: Lesson[];
  progress: Progress[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const res = await api.get<DashboardData>("/users/dashboard");
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await api.get<{ user: User }>("/auth/me");
  return res.data.user;
}

// ── Forgot password ───────────────────────────────────────────────────────────

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>("/auth/forgot-password", { email });
  return res.data;
}

// ── Reset password ────────────────────────────────────────────────────────────

export async function resetPassword(data: {
  token: string;
  password: string;
}): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>("/auth/reset-password", data);
  return res.data;
}
