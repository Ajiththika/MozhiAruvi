/**
 * adminService.ts
 *
 * All calls to /api/admin/*
 */

import api from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BaseUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "teacher" | "admin";
  isActive: boolean;
  isTutorAvailable?: boolean;
  phoneNumber?: string;
  country?: string;
  age?: number;
  gender?: string;
  bio?: string;
  specialization?: string;
  experience?: string;
}

export interface TeacherApplication {
  _id: string;
  applicant: { _id: string; name: string; email: string };
  fullName: string;
  status: "pending" | "approved" | "rejected" | "needs_revision";
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

// ── User Management ───────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<BaseUser[]> {
  const res = await api.get<{ users: BaseUser[] }>("/admin/users");
  return res.data.users;
}

export async function getAllTutors(): Promise<BaseUser[]> {
  const res = await api.get<{ tutors: BaseUser[] }>("/admin/tutors");
  return res.data.tutors;
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

export async function updateUserAdmin(
  id: string,
  data: Partial<BaseUser>
): Promise<BaseUser> {
  const res = await api.patch<{ user: BaseUser }>(`/admin/users/${id}/edit`, data);
  return res.data.user;
}

// ── Teacher Applications ──────────────────────────────────────────────────────

export async function getTeacherApplications(): Promise<TeacherApplication[]> {
  const res = await api.get<{ applications: TeacherApplication[] }>(
    "/admin/teacher-applications"
  );
  return res.data.applications;
}

export async function approveTeacherApplication(id: string): Promise<TeacherApplication> {
  const res = await api.patch<{ application: TeacherApplication }>(
    `/admin/teacher-applications/${id}/approve`
  );
  return res.data.application;
}

export async function rejectTeacherApplication(
  id: string,
  reason: string
): Promise<TeacherApplication> {
  const res = await api.patch<{ application: TeacherApplication }>(
    `/admin/teacher-applications/${id}/reject`,
    { reason }
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
