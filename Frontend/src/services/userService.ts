/**
 * userService.ts
 *
 * All calls to /api/users/*
 */

import { api } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
  experience?: string;
  specialization?: string;
  profilePhoto?: string | null;
  isTutorAvailable?: boolean;
  credits?: number;
  level?: "Basic" | "Beginner" | "Elementary" | "Intermediate" | "Advanced" | "Not Set";
  learningCredits?: number;
  xp?: number;
}

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  experience?: string;
  specialization?: string;
}

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// ── Get profile ───────────────────────────────────────────────────────────────

export async function getProfile(): Promise<UserProfile> {
  const res = await api.get<{ user: UserProfile }>("/users/me");
  return res.data.user;
}

// ── Update profile ────────────────────────────────────────────────────────────

export async function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  const res = await api.patch<{ user: UserProfile }>("/users/me", payload);
  return res.data.user;
}

// ── Change password ───────────────────────────────────────────────────────────

export async function changePassword(payload: UpdatePasswordPayload): Promise<{ message: string }> {
  const res = await api.patch<{ message: string }>("/users/me/password", payload);
  return res.data;
}

// ── Deactivate account ────────────────────────────────────────────────────────

export async function deactivateAccount(): Promise<{ message: string }> {
  const res = await api.patch<{ message: string }>("/users/me/deactivate");
  return res.data;
}

// ── Progression / Duolingo Flow ──────────────────────────────────────────────────

import { SafeUser } from "./authService";

export async function setLevel(level: "Basic" | "Beginner" | "Elementary" | "Intermediate" | "Advanced" | "Not Set"): Promise<SafeUser> {
  const res = await api.patch<{ message: string; user: SafeUser }>("/users/me/level", { level });
  return res.data.user;
}

export async function consumeCredit(): Promise<{ learningCredits: number }> {
  const res = await api.post<{ message: string; learningCredits: number }>("/users/me/consume-credit");
  return res.data;
}

