/**
 * user.ts
 *
 * Centralized User types for Mozhi Aruvi.
 */

export type UserRole = "student" | "teacher" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isTutorAvailable?: boolean;
  profilePhoto?: string | null;
  phoneNumber?: string;
  country?: string;
  age?: number;
  gender?: string;
  bio?: string;
  specialization?: string;
  experience?: string;
  hourlyRate?: number;
  credits?: number;
  learningCredits?: number;
  xp?: number;
  level?: "Beginner" | "Intermediate" | "Advanced" | "Not Set";
  createdAt?: string;
  updatedAt?: string;
}

export type UpdateUserPayload = Partial<Omit<User, "_id" | "role" | "createdAt" | "updatedAt">>;
