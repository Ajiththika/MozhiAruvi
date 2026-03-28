"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe, refresh, logout } from "@/services/authService";
import { authStore } from "@/lib/authStore";
import { User } from "@/types/user";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Instant-on: Load user from cache if hint exists
    if (authStore.hasSessionHint()) {
      const cached = authStore.getCachedUser();
      if (cached) {
        setUser(cached);
        // We still set isLoading to false if we have a cache to show the UI immediately
        setIsLoading(false); 
      }
    }

    async function initAuth() {
      try {
        if (!authStore.get() && authStore.hasSessionHint()) {
          await refresh();
        }
        if (authStore.get()) {
          const userData = await getMe();
          setUser(userData);
          authStore.saveUser(userData);
        }
      } catch (error) {
        authStore.clear();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const handleSetUser = (u: User | ( (prev: User | null) => User | null )) => {
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

