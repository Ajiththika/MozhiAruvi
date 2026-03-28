import { User } from "@/types/user";

let accessToken: string | null = null;
const SESSION_HINT_KEY = "mozhi_session_hint";
const USER_CACHE_KEY = "mozhi_cached_user";

export const authStore = {
  get(): string | null {
    return accessToken;
  },

  set(token: string): void {
    accessToken = token;
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_HINT_KEY, "true");
    }
  },

  saveUser(user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    }
  },

  getCachedUser(): User | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  clear(): void {
    accessToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_HINT_KEY);
      localStorage.removeItem(USER_CACHE_KEY);
    }
  },

  hasSessionHint(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SESSION_HINT_KEY) === "true";
  },
};
