/**
 * authService.ts
 *
 * All calls to /api/auth/*
 * Access token is stored via authStore after login/register/refresh.
 */

import { api } from "@/lib/api";
import { authStore } from "@/lib/authStore";
import { Lesson, Progress } from "./lessonService";
import { JoinRequest } from "./eventService";
import { Blog } from "./blogService";
import { TutorRequest } from "./tutorService";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SafeUser {
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin" | "tutor" | "tutor_pending" | "rejected";
  tutorStatus?: "none" | "pending" | "approved" | "rejected";
  isTutorAvailable?: boolean;
  profilePhoto?: string | null;
  level?: "Basic" | "Beginner" | "Intermediate" | "Advanced" | "Not Set";
  hasCompletedOnboarding?: boolean;
  learningCredits?: number;
  power?: number;
  credits?: number;
  xp?: number;
  points?: number;
  phoneNumber?: string;
  country?: string;
  age?: number;
  gender?: string;
  bio?: string;
  specialization?: string;
  experience?: string;
  hourlyRate?: number;
  oneClassFee?: number;
  eightClassFee?: number;
  weeklySchedule?: string;
  isPremium?: boolean;
  progress?: {
    energy: number;
    lastEnergyUpdate: string;
    completedLessons: string[];
    level: string;
    currentStreak: number;
    highStreak: number;
    lastLessonDate?: string;
  };
  subscription?: {
    plan: "FREE" | "PRO" | "PREMIUM" | "BUSINESS";
    billingCycle: "monthly" | "yearly" | "none";
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: string;
    paidEvents?: string[];
    paidTutors?: string[];
    freeEventsUsedThisCycle?: number;
    tutorSupportUsed?: number;
    eventUsageCount?: number;
    status?: "trialing" | "active" | "canceled" | "none";
  };
  organizationId?: string;
  roleInOrg?: "owner" | "member";
  createdAt?: string;
  updatedAt?: string;
  hasUsedTrial?: boolean;
  stripeAccountId?: string;
  isStripeVerified?: boolean;
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
  user: SafeUser;
  lessons: Lesson[];
  progress: Progress[];
  statistics?: {
    totalLessons: number;
    completedCount: number;
    progressPercentage: number;
    nextLesson: Lesson | null;
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const res = await api.get<DashboardData>("/users/dashboard");
  return res.data;
}

export async function getMe(): Promise<SafeUser> {
  const res = await api.get<{ user: SafeUser }>("/auth/me");
  return res.data.user;
}

export async function completeOnboarding(data: {
  age?: number | string;
  level?: "Basic" | "Beginner" | "Intermediate" | "Advanced" | "Not Set";
  goal?: string;
  timeAvailability?: string;
  priorKnowledge?: string;
}): Promise<SafeUser> {
  const res = await api.post<{ message: string, user: SafeUser }>("/users/me/onboarding", data);
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

