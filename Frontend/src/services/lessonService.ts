/**
 * lessonService.ts
 *
 * All calls to /api/lessons/*
 */

import api from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  moduleNumber: number;
  orderIndex: number;
  videoUrl?: string;
  content?: string;
  isPremiumOnly: boolean;
}

export interface Question {
  _id: string;
  type?: 'choice' | 'speaking';
  text: string;
  options: string[];
  scoreValue: number;
  correctOptionIndex?: number;
  expectedAudioText?: string;
}

export interface SubmitAnswerItem {
  questionId: string;
  selectedOptionIndex: number;
}

export interface Progress {
  _id: string;
  lessonId: string;
  score: number;
  isCompleted: boolean;
  completedAt: string;
}

export interface SubmitResult {
  score: number;
  total: number;
  passed: boolean;
  results: Array<{ questionId: string; correct: boolean }>;
}

// ── Get all lessons ───────────────────────────────────────────────────────────

export async function getLessons(): Promise<{ lessons: Lesson[], progress: Progress[] }> {
  const res = await api.get<{ lessons: Lesson[], progress: Progress[] }>("/lessons");
  return res.data;
}

// ── Get single lesson ─────────────────────────────────────────────────────────

export async function getLessonById(id: string): Promise<Lesson> {
  const res = await api.get<{ lesson: Lesson }>(`/lessons/${id}`);
  return res.data.lesson;
}

// ── Get lesson questions ──────────────────────────────────────────────────────

export async function getLessonQuestions(id: string): Promise<Question[]> {
  const res = await api.get<{ questions: Question[] }>(`/lessons/${id}/questions`);
  return res.data.questions;
}

// ── Submit answers ────────────────────────────────────────────────────────────

export async function submitAnswers(
  lessonId: string,
  answers: SubmitAnswerItem[]
): Promise<SubmitResult> {
  const res = await api.post<SubmitResult>(`/lessons/${lessonId}/submit`, { answers });
  return res.data;
}

// ── Speaking Evaluation ───────────────────────────────────────────────────────

export async function evaluateSpeaking(
  lessonId: string,
  questionId: string,
  audioBase64?: string
): Promise<{ passed: boolean; message: string }> {
  const res = await api.post<{ passed: boolean; message: string }>(
    `/lessons/${lessonId}/evaluate-speaking`,
    { questionId, audioBase64 }
  );
  return res.data;
}

// ── Admin operations ──────────────────────────────────────────────────────────

export async function deleteLesson(id: string): Promise<{ message: string }> {
  const res = await api.delete<{ message: string }>(`/lessons/${id}`);
  return res.data;
}
