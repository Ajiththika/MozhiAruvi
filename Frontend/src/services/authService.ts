/**
 * authService.ts
 *
 * All calls to /api/auth/*
 * Access token is stored via authStore after login/register/refresh.
 */

import api from "@/lib/api";
import { authStore } from "@/lib/authStore";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SafeUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "teacher" | "admin";
  isTutorAvailable?: boolean;
  profilePhoto?: string | null;
  level?: "Beginner" | "Intermediate" | "Advanced" | "Not Set";
  learningCredits?: number;
  credits?: number;
  xp?: number;
  phoneNumber?: string;
  country?: string;
  age?: number;
  gender?: string;
  bio?: string;
  specialization?: string;
  experience?: string;
  hourlyRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: SafeUser;
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

// ── Get current user ──────────────────────────────────────────────────────────

export async function getMe(): Promise<SafeUser> {
  const res = await api.get<{ user: SafeUser }>("/auth/me");
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
