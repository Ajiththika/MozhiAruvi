/**
 * adminService.ts
 *
 * All calls to /api/admin/*
 */

import { api } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BaseUser {
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin" | "tutor";
  isActive: boolean;
  warnings?: number;
  adminNotes?: string;
  isTutorAvailable?: boolean;
  phoneNumber?: string;
  country?: string;
  age?: number;
  gender?: string;
  bio?: string;
  specialization?: string;
  experience?: string;
  subscription?: {
    plan: "FREE" | "PRO" | "PREMIUM" | "BUSINESS";
    billingCycle: "monthly" | "yearly" | "none";
    currentPeriodEnd?: string;
    tutorSupportUsed?: number;
    eventUsageCount?: number;
    hasUsedTrial?: boolean;
  };
}

export interface TeacherApplication {
  _id: string;
  userId: { _id: string; name: string; email: string; phoneNumber?: string };
  fullName: string;
  bio?: string;
  experience?: string;
  specialization?: string;
  motivation?: string;
  hourlyRate?: number;
  teachingMode?: string;
  status: "pending" | "approved" | "rejected" | "needs_revision";
  adminNotes?: string;
  rejectionReason?: string;
  reviewedAt?: string;
  createdAt: string;
  languages?: string[];
}

export interface JoinRequestAdminView {
  _id: string;
  user: { _id: string; name: string };
  event: { _id: string; title: string };
  status: "pending" | "approved" | "rejected";
  message?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  [key: string]: T[] | number; // This is a bit hacky but allows res.data[collection]
}

// ── Global Stats ─────────────────────────────────────────────────────────────
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTutors: number;
  pendingApps: number;
  totalEvents: number;
}

export interface PlanSettings {
  _id: string;
  plan: string;
  monthlyPrice: number;
  yearlyPrice: number;
  levelLimit: string[];
  categoryLimit?: number | null;
  tutorSupportLimit?: number;
  eventLimit?: number;
  isEnabled: boolean;
  stripeMonthlyPriceId?: string;
  stripeYearlyPriceId?: string;
}

export interface PremiumUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  country?: string;
  subscription: {
    plan: 'FREE' | 'PRO' | 'PREMIUM' | 'BUSINESS';
    billingCycle: 'monthly' | 'yearly' | 'none';
    currentPeriodEnd?: string;
    stripeCustomerId?: string;
  };
  createdAt: string;
}

export async function getPlanSettings(): Promise<PlanSettings[]> {
  const res = await api.get<PlanSettings[]>("/admin/plan-settings");
  return res.data;
}

export async function updatePlanSettings(planId: string, data: Partial<PlanSettings>): Promise<PlanSettings> {
  const res = await api.patch<PlanSettings>(`/admin/plan-settings/${planId}`, data);
  return res.data;
}

export async function createPlanSettings(data: Partial<PlanSettings>): Promise<PlanSettings> {
  const res = await api.post<PlanSettings>("/admin/plan-settings", data);
  return res.data;
}

export async function deletePlanSettings(planId: string): Promise<void> {
  await api.delete(`/admin/plan-settings/${planId}`);
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await api.get<AdminStats>("/admin/stats");
  return res.data;
}

export async function getPremiumUsers(page = 1, limit = 10): Promise<PaginatedResponse<PremiumUser> & { users: PremiumUser[] }> {
  const res = await api.get<PaginatedResponse<PremiumUser> & { users: PremiumUser[] }>(`/admin/premium-users?page=${page}&limit=${limit}`);
  return res.data;
}

// ── User Management ───────────────────────────────────────────────────────────

export async function getAllUsers(page = 1, limit = 6): Promise<PaginatedResponse<BaseUser> & { users: BaseUser[] }> {
  const res = await api.get<PaginatedResponse<BaseUser> & { users: BaseUser[] }>(`/admin/users?page=${page}&limit=${limit}`);
  return res.data;
}

export async function getAllTutors(page = 1, limit = 6): Promise<PaginatedResponse<BaseUser> & { tutors: BaseUser[] }> {
  const res = await api.get<PaginatedResponse<BaseUser> & { tutors: BaseUser[] }>(`/admin/tutors?page=${page}&limit=${limit}`);
  return res.data;
}

export async function deactivateUser(id: string): Promise<BaseUser> {
  const res = await api.patch<{ user: BaseUser }>(`/admin/users/${id}/deactivate`);
  return res.data.user;
}

export async function activateUser(id: string): Promise<BaseUser> {
  const res = await api.patch<{ user: BaseUser }>(`/admin/users/${id}/activate`);
  return res.data.user;
}

export async function updateTutorStatus(
  id: string,
  isTutorAvailable: boolean
): Promise<BaseUser> {
  const res = await api.patch<{ user: BaseUser }>(`/admin/users/${id}/tutor-status`, {
    isTutorAvailable,
  });
  return res.data.user;
}

export async function warnUser(id: string): Promise<BaseUser> {
  const res = await api.patch<{ user: BaseUser }>(`/admin/users/${id}/warn`);
  return res.data.user;
}

export async function updateUserAdmin(
  id: string,
  data: Partial<BaseUser>
): Promise<BaseUser> {
  const res = await api.patch<{ user: BaseUser }>(`/admin/users/${id}/edit`, data);
  return res.data.user;
}

// ── Teacher Applications ──────────────────────────────────────────────────────

export async function getTeacherApplications(page = 1, limit = 6, status?: string): Promise<PaginatedResponse<TeacherApplication> & { applications: TeacherApplication[] }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.append("status", status);
  const res = await api.get<PaginatedResponse<TeacherApplication> & { applications: TeacherApplication[] }>(
    `/admin/teacher-applications?${params.toString()}`
  );
  return res.data;
}

export async function approveTeacherApplication(id: string): Promise<TeacherApplication> {
  const res = await api.patch<{ application: TeacherApplication }>(
    `/admin/teacher-applications/${id}/approve`
  );
  return res.data.application;
}

export async function rejectTeacherApplication(
  id: string,
  rejectionReason: string,
  adminNotes?: string,
): Promise<TeacherApplication> {
  const res = await api.patch<{ application: TeacherApplication }>(
    `/admin/teacher-applications/${id}/reject`,
    { rejectionReason, adminNotes }
  );
  return res.data.application;
}

export async function requestRevisionTeacherApplication(
  id: string,
  reason: string
): Promise<TeacherApplication> {
  const res = await api.patch<{ application: TeacherApplication }>(
    `/admin/teacher-applications/${id}/request-revision`,
    { reason }
  );
  return res.data.application;
}

// ── Event Join Requests ───────────────────────────────────────────────────────

export async function getEventJoinRequests(
  eventId?: string,
  status?: string
): Promise<JoinRequestAdminView[]> {
  const params = new URLSearchParams();
  if (eventId) params.append("eventId", eventId);
  if (status) params.append("status", status);

  const res = await api.get<{ requests: JoinRequestAdminView[] }>(
    `/admin/events/join-requests?${params.toString()}`
  );
  return res.data.requests;
}

export async function approveEventJoinRequest(id: string): Promise<JoinRequestAdminView> {
  const res = await api.patch<{ request: JoinRequestAdminView }>(
    `/admin/events/join-requests/${id}/approve`
  );
  return res.data.request;
}

export async function adminDeleteBlog(id: string): Promise<{ message: string }> {
  const res = await api.delete<{ message: string }>(`/admin/blogs/${id}`);
  return res.data;
}

// ── Generic Uploads ──────────────────────────────────────────────────────────
export async function uploadAudio(file: File): Promise<{ url: string; public_id: string }> {
  const formData = new FormData();
  formData.append("audio", file);
  const res = await api.post<{ url: string; public_id: string }>("/upload/audio", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

