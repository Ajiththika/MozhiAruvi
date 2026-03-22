/**
 * eventService.ts
 *
 * All calls to /api/events/*
 */

import api from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MozhiEvent {
  _id: string;
  eventCode: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  capacity: number;
  location: string;
  isActive: boolean;
  organizedBy: { _id: string; name: string };
  attendees: string[];
}

export interface JoinRequest {
  _id: string;
  user: { _id: string; name: string; email: string };
  event: MozhiEvent | string;
  status: "pending" | "approved" | "rejected";
  message?: string;
  createdAt: string;
}

export interface JoinRequestPayload {
  message?: string;
}

export type CreateEventPayload = Omit<
  MozhiEvent,
  "_id" | "isActive" | "organizedBy" | "attendees"
>;

export type UpdateEventPayload = Partial<CreateEventPayload & { isActive: boolean }>;

// ── Public / Participant Endpoints ────────────────────────────────────────────

export interface PaginatedEvents {
  events: MozhiEvent[];
  totalEvents: number;
  totalPages: number;
  currentPage: number;
}

export async function getEvents(page = 1, limit = 6): Promise<PaginatedEvents> {
  const res = await api.get<PaginatedEvents>(`/events?page=${page}&limit=${limit}`);
  return res.data;
}

export async function getEventById(id: string): Promise<MozhiEvent> {
  const res = await api.get<{ event: MozhiEvent }>(`/events/${id}`);
  return res.data.event;
}

export async function getMyJoinRequests(): Promise<JoinRequest[]> {
  const res = await api.get<{ requests: JoinRequest[] }>("/events/my-requests");
  return res.data.requests;
}

export async function submitJoinRequest(
  eventId: string,
  payload: JoinRequestPayload
): Promise<JoinRequest> {
  const res = await api.post<{ request: JoinRequest }>(
    `/events/${eventId}/join-request`,
    payload
  );
  return res.data.request;
}

// ── Admin / Teacher Endpoints ─────────────────────────────────────────────────

export async function createEvent(payload: CreateEventPayload): Promise<MozhiEvent> {
  const res = await api.post<{ event: MozhiEvent }>("/events", payload);
  return res.data.event;
}

export async function updateEvent(
  id: string,
  payload: UpdateEventPayload
): Promise<MozhiEvent> {
  const res = await api.patch<{ event: MozhiEvent }>(`/events/${id}`, payload);
  return res.data.event;
}

export async function deleteEvent(id: string): Promise<{ message: string }> {
  const res = await api.delete<{ message: string }>(`/events/${id}`);
  return res.data;
}
