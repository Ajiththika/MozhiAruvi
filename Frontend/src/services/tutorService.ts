/**
 * tutorService.ts
 *
 * All calls to /api/tutors/*
 */

import api from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Tutor {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  experience?: string;
  specialization?: string;
  hourlyRate?: number;
  teachingMode?: "online" | "offline" | "both";
  languages?: string[];
  profilePhoto?: string | null;
  isTutorAvailable: boolean;
  levelSupport?: ("beginner" | "intermediate" | "advanced")[];
  responseTime?: string;
}

export interface TutorRequest {
  _id: string;
  teacherId: string;
  lessonId?: string;
  question: string;
  status: "pending" | "accepted" | "declined" | "resolved";
  response?: string;
  createdAt: string;
}

export interface RequestTutorPayload {
  teacherId: string;
  lessonId?: string;
  question: string;
}

export interface TutorProfilePayload {
  bio?: string;
  experience?: string;
  specialization?: string;
  schedule?: unknown;
  hourlyRate?: number;
  languages?: string[];
  teachingMode?: "online" | "offline" | "both";
  profilePhoto?: string | null;
}

// ── List available tutors ─────────────────────────────────────────────────────

export async function getAvailableTutors(): Promise<Tutor[]> {
  const res = await api.get<{ tutors: Tutor[] }>("/tutors");
  return res.data.tutors;
}

// ── Get single tutor ──────────────────────────────────────────────────────────

export async function getTutorById(id: string): Promise<Tutor> {
  const res = await api.get<{ tutor: Tutor }>(`/tutors/${id}`);
  return res.data.tutor;
}

// ── Send a tutor request ──────────────────────────────────────────────────────

export async function requestTutor(payload: RequestTutorPayload): Promise<TutorRequest> {
  const res = await api.post<{ request: TutorRequest }>("/tutors/request", payload);
  return res.data.request;
}

// ── Get my requests (learner) ─────────────────────────────────────────────────

export async function getMyTutorRequests(): Promise<TutorRequest[]> {
  const res = await api.get<{ requests: TutorRequest[] }>("/tutors/my-requests");
  return res.data.requests;
}

// ── Teacher endpoints ─────────────────────────────────────────────────────────

export async function getPendingRequests(): Promise<TutorRequest[]> {
  const res = await api.get<{ requests: TutorRequest[] }>("/tutors/pending");
  return res.data.requests;
}

export async function acceptRequest(requestId: string): Promise<TutorRequest> {
  const res = await api.patch<{ request: TutorRequest }>(`/tutors/requests/${requestId}/accept`);
  return res.data.request;
}

export async function declineRequest(requestId: string): Promise<TutorRequest> {
  const res = await api.patch<{ request: TutorRequest }>(`/tutors/requests/${requestId}/decline`);
  return res.data.request;
}

export async function resolveRequest(
  requestId: string,
  response: string
): Promise<TutorRequest> {
  const res = await api.patch<{ request: TutorRequest }>(
    `/tutors/requests/${requestId}/resolve`,
    { response }
  );
  return res.data.request;
}

export async function updateTutorProfile(payload: TutorProfilePayload): Promise<Tutor> {
  const res = await api.patch<{ tutor: Tutor }>("/tutors/me", payload);
  return res.data.tutor;
}

export async function updateTutorAvailability(isTutorAvailable: boolean): Promise<Tutor> {
  const res = await api.patch<{ tutor: Tutor }>("/tutors/me/availability", { isTutorAvailable });
  return res.data.tutor;
}
