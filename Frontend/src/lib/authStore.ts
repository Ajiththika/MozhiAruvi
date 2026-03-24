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
const SESSION_HINT_KEY = "mozhi_session_exists";

export const authStore = {
  /** Read the current access token (null if not authenticated). */
  get(): string | null {
    return accessToken;
  },

  /** Set after a successful login / register / refresh. */
  set(token: string): void {
    accessToken = token;
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_HINT_KEY, "true");
    }
  },

  /** Clear on logout or unrecoverable 401. */
  clear(): void {
    accessToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_HINT_KEY);
    }
  },

  /** Check if a session likely exists (hint in localStorage). */
  hasSessionHint(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SESSION_HINT_KEY) === "true";
  },
};
