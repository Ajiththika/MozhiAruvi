/**
 * tutorService.ts
 *
 * All calls to /api/tutors/*
 */

import { api } from "@/lib/api";
export const startStripeOnboarding = async () => {
    const response = await api.get('/tutors/me/stripe/onboard');
    return response.data;
};

export const finalizeStripeOnboarding = async () => {
    const response = await api.get('/tutors/me/stripe/finalize');
    return response.data;
};

export const getTutorFinancials = async () => {
    const response = await api.get('/tutors/me/financials');
    return response.data;
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Tutor {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  experience?: string;
  specialization?: string;
  weeklySchedule?: string;
  hourlyRate?: number;
  oneClassFee?: number;
  eightClassFee?: number;
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
  lessonId: string | { _id: string; title: string; moduleNumber?: number };
  requestType: "doubt" | "speaking" | "practice" | "question" | "live_class" | "multi_class";
  content: string;
  status: "pending" | "accepted" | "declined" | "replied" | "resolved" | "answered" | "scheduled";
  
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
    studentProgress?: {
      score?: number;
      accuracy?: number;
      weakAreas?: string[];
    };
  };
}

export interface RequestTutorPayload {
  teacherId?: string; // Optional for auto-assignment
  lessonId?: string;
  requestType: "doubt" | "speaking" | "practice" | "question" | "live_class" | "multi_class";
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
  weeklySchedule?: string;
  hourlyRate?: number;
  oneClassFee?: number;
  eightClassFee?: number;
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

// ── Mentor Application Logic ──────────────────────────────────────────────────

export interface MentorApplicationPayload {
  fullName: string;
  bio: string;
  experience: string;
  specialization: string;
  languages: string[];
  hourlyRate: number;
  teachingMode: "online" | "offline" | "both";
  motivation: string;
}

export interface MentorApplication {
  _id: string;
  fullName: string;
  status: "pending" | "approved" | "rejected" | "needs_revision";
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
}

/** Submit a new mentor application */
export async function submitTutorApplication(payload: MentorApplicationPayload): Promise<MentorApplication> {
  const res = await api.post<{ application: MentorApplication }>("/tutors/apply", payload);
  return res.data.application;
}

/** Get my own application status (authorized tutor/teacher) */
export async function getMyMentorApplication(): Promise<MentorApplication | null> {
  try {
    const res = await api.get<{ application: MentorApplication | null }>("/tutors/application/me");
    return res.data.application;
  } catch (error: unknown) {
    const err = error as { response?: { status: number } };
    if (err.response?.status === 404) return null;
    throw error;
  }
}

/** Admin: List all applications */
export async function getTutorApplicationsAdmin(): Promise<MentorApplication[]> {
  const res = await api.get<{ applications: MentorApplication[] }>("/admin/tutors/applications");
  return res.data.applications;
}

/** Admin: Approve application */
export async function approveTutorApplication(id: string): Promise<{ success: boolean; message: string }> {
    const res = await api.patch<{ success: boolean; message: string }>(`/admin/tutors/${id}/approve`);
    return res.data;
}

/** Admin: Reject application */
export async function rejectTutorApplication(id: string, adminNotes?: string): Promise<{ success: boolean; message: string }> {
    const res = await api.patch<{ success: boolean; message: string }>(`/admin/tutors/${id}/reject`, { adminNotes });
    return res.data;
}

