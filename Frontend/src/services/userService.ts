/**
 * userService.ts
 *
 * All calls to /api/users/*
 */

import api from "@/lib/api";
import { User, UpdateUserPayload } from "@/types/user";

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// ── Get profile ───────────────────────────────────────────────────────────────

export async function getProfile(): Promise<User> {
  const res = await api.get<{ user: User }>("/users/me");
  return res.data.user;
}

// ── Update profile ────────────────────────────────────────────────────────────

export async function updateProfile(payload: UpdateUserPayload): Promise<User> {
  const res = await api.patch<{ user: User }>("/users/me", payload);
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

export async function setLevel(level: "Beginner" | "Intermediate" | "Advanced" | "Not Set"): Promise<User> {
  const res = await api.patch<{ message: string; user: User }>("/users/me/level", { level });
  return res.data.user;
}

export async function consumeCredit(): Promise<{ learningCredits: number }> {
  const res = await api.post<{ message: string; learningCredits: number }>("/users/me/consume-credit");
  return res.data;
}
