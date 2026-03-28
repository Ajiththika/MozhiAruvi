/**
 * adminService.ts
 *
 * All calls to /api/admin/*
 */

import api from "@/lib/api";
import { User } from "@/types/user";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TeacherApplication {
  _id: string;
  userId: { _id: string; name: string; email: string };
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

export async function getAdminStats(): Promise<AdminStats> {
  const res = await api.get<AdminStats>("/admin/stats");
  return res.data;
}

// ── User Management ───────────────────────────────────────────────────────────

export async function getAllUsers(page = 1, limit = 6): Promise<PaginatedResponse<User> & { users: User[] }> {
  const res = await api.get<PaginatedResponse<User> & { users: User[] }>(`/admin/users?page=${page}&limit=${limit}`);
  return res.data;
}

export async function getAllTutors(page = 1, limit = 6): Promise<PaginatedResponse<User> & { tutors: User[] }> {
  const res = await api.get<PaginatedResponse<User> & { tutors: User[] }>(`/admin/tutors?page=${page}&limit=${limit}`);
  return res.data;
}

export async function deactivateUser(id: string): Promise<User> {
  const res = await api.patch<{ user: User }>(`/admin/users/${id}/deactivate`);
  return res.data.user;
}

export async function activateUser(id: string): Promise<User> {
  const res = await api.patch<{ user: User }>(`/admin/users/${id}/activate`);
  return res.data.user;
}

export async function updateTutorStatus(
  id: string,
  isTutorAvailable: boolean
): Promise<User> {
  const res = await api.patch<{ user: User }>(`/admin/users/${id}/tutor-status`, {
    isTutorAvailable,
  });
  return res.data.user;
}

export async function updateUserAdmin(
  id: string,
  data: Partial<User>
): Promise<User> {
  const res = await api.patch<{ user: User }>(`/admin/users/${id}/edit`, data);
  return res.data.user;
}

// ── Teacher Applications ──────────────────────────────────────────────────────

export async function getTeacherApplications(page = 1, limit = 8, status?: string): Promise<PaginatedResponse<TeacherApplication> & { applications: TeacherApplication[] }> {
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

export async function rejectEventJoinRequest(id: string): Promise<JoinRequestAdminView> {
  const res = await api.patch<{ request: JoinRequestAdminView }>(
    `/admin/events/join-requests/${id}/reject`
  );
  return res.data.request;
}
