/**
 * speakingLabService.ts — client for the endless Speaking Lab module (/api/speaking-lab).
 */

import { api } from "@/lib/api";
import type { SpeakingStatus } from "./lessonService";

export type LabItemType = "phonetic" | "roleplay" | "dragboard" | "tongue_twister" | "fluency";

export interface SpeakingLabItem {
  _id: string;
  type: LabItemType;
  prompt: string;
  tamilWord?: string;
  expectedAudioText?: string;
  phoneticHint?: string;
  audioUrl?: string;
  sequence?: string[];
  acceptedAnswers?: string[];
  difficulty?: number;
  xp?: number;
  order?: number;
  isActive?: boolean;
}

export interface LabProgress {
  level: number;
  xp: number;
  itemsCompleted: number;
  currentStreak: number;
  bestStreak: number;
}

export interface LabSession {
  items: SpeakingLabItem[];
  level: number;
  progress: LabProgress;
}

export interface LabEvaluation {
  isCorrect: boolean;
  status: SpeakingStatus;
  score: number;
  confidence?: number | null;
  transcription: string;
  correctText: string;
  feedback: string;
  xpEarned: number;
  leveledUp: boolean;
  progress: LabProgress;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  profilePhoto?: string | null;
  xp: number;
  level: number;
  bestStreak: number;
}

export interface LeaderboardResult {
  leaderboard: LeaderboardEntry[];
  me: { rank: number; xp: number; level: number; bestStreak: number };
}

// ── Student ───────────────────────────────────────────────────────────────────
export async function getLabSession(level?: number): Promise<LabSession> {
  const res = await api.get<LabSession>("/speaking-lab/session", {
    params: level ? { level } : undefined,
  });
  return res.data;
}

export async function evaluateLabSpeaking(itemId: string, audioBase64: string): Promise<LabEvaluation> {
  const res = await api.post<LabEvaluation>("/speaking-lab/evaluate", { itemId, audioBase64 });
  return res.data;
}

export async function getLabLeaderboard(): Promise<LeaderboardResult> {
  const res = await api.get<LeaderboardResult>("/speaking-lab/leaderboard");
  return res.data;
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export async function listLabItems(): Promise<{ items: SpeakingLabItem[] }> {
  const res = await api.get<{ items: SpeakingLabItem[] }>("/speaking-lab/items");
  return res.data;
}

export async function createLabItem(data: Partial<SpeakingLabItem>): Promise<{ item: SpeakingLabItem }> {
  const res = await api.post<{ item: SpeakingLabItem }>("/speaking-lab/items", data);
  return res.data;
}

export async function updateLabItem(id: string, data: Partial<SpeakingLabItem>): Promise<{ item: SpeakingLabItem }> {
  const res = await api.patch<{ item: SpeakingLabItem }>(`/speaking-lab/items/${id}`, data);
  return res.data;
}

export async function deleteLabItem(id: string): Promise<{ message: string }> {
  const res = await api.delete<{ message: string }>(`/speaking-lab/items/${id}`);
  return res.data;
}
