/**
 * authStore.ts
 *
 * Minimal in-memory store for the JWT access token.
 * The refresh token lives in an HTTP-only cookie managed entirely by the
 * backend — we never touch it here.
 *
 * Why in-memory?
 *  - XSS-safe: JS malware cannot read it from localStorage/sessionStorage
 *  - The Axios interceptor reads it automatically on every request
 */

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

  saveUser(user: any): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    }
  },

  getCachedUser(): any | null {
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
