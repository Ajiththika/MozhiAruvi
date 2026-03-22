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
  moduleName: string;
  sectionName: string;
  moduleNumber: number;
  orderIndex: number;
  videoUrl?: string;
  content?: string;
  isPremiumOnly: boolean;
}

export interface Question {
  _id: string;
  type: "learn" | "match" | "identify" | "listening" | "fill" | "spelling" | "quiz" | "speaking";
  text: string;
  options?: string[];
  correctOptionIndex?: number;
  correctAnswer?: string;
  scoreValue: number;
}

export interface SubmitAnswerItem {
  questionId: string;
  selectedOptionIndex: number;
}

export interface SubmitResult {
  score: number;
  total: number;
  passed: boolean;
  results: Array<{ questionId: string; correct: boolean }>;
}

// ── Get all lessons ───────────────────────────────────────────────────────────

export async function getLessons(): Promise<Lesson[]> {
  const res = await api.get<{ lessons: Lesson[] }>("/lessons");
  return res.data.lessons;
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
