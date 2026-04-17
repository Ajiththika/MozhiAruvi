"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SafeUser, getMe, refresh, logout } from "@/services/authService";
import { authStore } from "@/lib/authStore";

export interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<SafeUser | null>>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authStore.hasSessionHint()) {
      const cached = authStore.getCachedUser();
      if (cached) {
        setUser(cached);
      }
    }

    async function initAuth() {
      try {
        if (!authStore.get() && authStore.hasSessionHint()) {
          await refresh();
        }
        if (authStore.get()) {
          const userData = await getMe();
          if (userData) {
            setUser(userData);
            authStore.saveUser(userData);
          } else {
            // Safe retrieval returned null -> unauthenticated
            authStore.clear();
            setUser(null);
          }
        }
      } catch (error: any) {
        const status = error?.response?.status;
        const isNetworkError = !error?.response; // timeout / server down / no response

        if (status === 401) {
          // Truly unauthorized — clear session so user goes to signin
          authStore.clear();
          setUser(null);
        } else if (status === 429) {
          // Rate limited — do NOT clear session. Use cached user if possible.
          const cached = authStore.getCachedUser();
          if (cached) setUser(cached);
          console.warn("[AUTH] Rate limit hit during init. Using cached data.");
        } else if (isNetworkError || status === 503) {
          // Backend temporarily unreachable (DB down, cold start, etc.)
          // Keep any cached user so the UI doesn't flash to login screen
          const cached = authStore.getCachedUser();
          if (cached) setUser(cached);
          // Silently swallow — not a logout event
        } else {
          // Unknown error — clear to be safe
          authStore.clear();
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const handleSetUser = (u: SafeUser | ( (prev: SafeUser | null) => SafeUser | null )) => {
    setUser((prev) => {
      const newUser = typeof u === "function" ? u(prev) : u;
      if (newUser) {
        authStore.saveUser(newUser);
      } else {
        authStore.clear();
      }
      return newUser;
    });
  };

  const logoutUser = async () => {
    try {
      await logout();
    } catch {
      // silently handle — we still clear local state below
    } finally {
      authStore.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser: handleSetUser as any, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


















export default AuthProvider;
