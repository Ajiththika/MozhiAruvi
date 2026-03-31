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
  category?: string;
  type?: 'MCQ' | 'speaking' | 'writing' | 'mixed';
  examples?: string[];
  moduleName?: string;
  sectionName?: string;
  moduleNumber?: number;
  orderIndex?: number;
  videoUrl?: string;
  content?: string;
  isPremiumOnly: boolean;
  level?: 'Basic' | 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface Question {
  _id: string;
  type?: "learn" | "match" | "identify" | "listening" | "fill" | "spelling" | "quiz" | "speaking" | "choice" | "writing" | "reading";
  text: string;
  paragraph?: string; // For Read and Respond
  options?: string[];
  correctOptionIndex?: number;
  correctAnswer?: string;
  scoreValue: number;
  expectedAudioText?: string;
}

export interface SubmitAnswerItem {
  questionId: string;
  selectedOptionIndex: number;
  isSpeakingCompleted?: boolean;
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
  nextLessonId?: string;
  user?: any;
  redirect?: string;
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

export async function getLessonQuestions(id: string): Promise<{ questions: Question[], user: any }> {
  const res = await api.get<{ questions: Question[], user: any }>(`/lessons/${id}/questions`);
  return res.data;
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
  audioBase64: string
): Promise<{ isCorrect: boolean; score: number; transcription: string; feedback: string; correctText: string }> {
  const res = await api.post<{ isCorrect: boolean; score: number; transcription: string; feedback: string; correctText: string }>(
    `/lessons/${lessonId}/evaluate-speaking`,
    { questionId, audioBase64 }
  );
  return res.data;
}

export async function generateSpeech(lessonId: string, text: string): Promise<{ audioUrl: string }> {
  const res = await api.post<{ audioUrl: string }>(`/lessons/${lessonId}/generate-speech`, { text });
  return res.data;
}

// ── Admin operations ──────────────────────────────────────────────────────────

export async function deleteLesson(id: string): Promise<{ message: string }> {
  const res = await api.delete<{ message: string }>(`/lessons/${id}`);
  return res.data;
}
