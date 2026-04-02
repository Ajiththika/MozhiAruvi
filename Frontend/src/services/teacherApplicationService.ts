/**
 * teacherApplicationService.ts
 *
 * All calls to /api/teachers/*
 */

import { api } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ApplicationPayload {
  fullName: string;
  bio: string;
  experience: string;
  specialization: string;
  languages: string[];
  hourlyRate: number;
  schedule: string;
  teachingMode: "online" | "offline" | "both";
  motivation: string;
  profilePhoto?: string | null;
}

export interface TeacherApplication {
  _id: string;
  fullName: string;
  status: "pending" | "approved" | "rejected" | "needs_revision";
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
}

// ── Endpoints ─────────────────────────────────────────────────────────────────

export async function submitApplication(
  payload: ApplicationPayload
): Promise<TeacherApplication> {
  const res = await api.post<{ application: TeacherApplication }>("/teachers/apply", payload);
  return res.data.application;
}

export async function getMyApplication(): Promise<TeacherApplication | null> {
  try {
    const res = await api.get<{ application: TeacherApplication | null }>("/teachers/application/me");
    return res.data.application;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}

export async function updateMyApplication(
  payload: Partial<ApplicationPayload>
): Promise<TeacherApplication> {
  const res = await api.patch<{ application: TeacherApplication }>(
    "/teachers/application/me",
    payload
  );
  return res.data.application;
}

