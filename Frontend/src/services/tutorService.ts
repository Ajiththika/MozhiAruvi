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
  teacherId: string | { _id: string; name: string; email: string; profilePhoto?: string };
  studentId?: string | { _id: string; name: string; email: string };
  lessonId?: string | { _id: string; title: string; moduleNumber?: number };
  requestType: "question" | "live_class" | "multi_class";
  content: string;
  status: "pending" | "accepted" | "declined" | "replied" | "resolved";
  
  /** Threaded conversation messages */
  messages?: {
    senderRole: "student" | "teacher";
    content: string;
    createdAt: string;
  }[];

  teacherReply?: string;
  priceCredits?: number;
  createdAt: string;
  metadata?: {
    topics?: string[];
    preferredTime?: string;
    sessionsCount?: number;
    additionalNotes?: string;
    lessonTitle?: string;
    lessonModule?: number;
  };
}

export interface RequestTutorPayload {
  teacherId: string;
  lessonId?: string;
  requestType: "question" | "live_class" | "multi_class";
  content: string;
  metadata?: {
    topics?: string[];
    preferredTime?: string;
    sessionsCount?: number;
    additionalNotes?: string;
    lessonTitle?: string;
    lessonModule?: number;
  };
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

export interface PaginatedTutors {
  tutors: Tutor[];
  totalTutors: number;
  totalPages: number;
  currentPage: number;
}

// ── List available tutors ─────────────────────────────────────────────────────

export async function getAvailableTutors(
  page = 1, 
  limit = 6, 
  filters: { search?: string; level?: string; mode?: string } = {}
): Promise<PaginatedTutors> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (filters.search) params.append("search", filters.search);
  if (filters.level && filters.level !== "all") params.append("level", filters.level);
  if (filters.mode && filters.mode !== "all") params.append("mode", filters.mode);

  const res = await api.get<PaginatedTutors>(`/tutors?${params.toString()}`);
  return res.data;
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

export async function addRequestMessage(
  requestId: string,
  content: string,
  role: "student" | "teacher"
): Promise<TutorRequest> {
  const res = await api.post<{ request: TutorRequest }>(
    `/tutors/requests/${requestId}/message`,
    { content, role }
  );
  return res.data.request;
}
