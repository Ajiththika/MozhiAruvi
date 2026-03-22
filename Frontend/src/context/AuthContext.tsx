"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SafeUser, getMe, refresh } from "@/services/authService";
import { authStore } from "@/lib/authStore";

interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<SafeUser | null>>;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        if (!authStore.get()) {
          // Attempt to refresh token on initial load
          await refresh();
        }
        if (authStore.get()) {
          const userData = await getMe();
          setUser(userData);
        }
      } catch (error) {
        // No valid session, or refresh failed
        authStore.clear();
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const logoutUser = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logoutUser }}>
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
