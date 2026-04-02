"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, SafeUser } from "@/services/authService";
import { getRoleDashboardRoute } from "@/lib/roleUtils";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Array<"student" | "teacher" | "admin">;
}

export function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
  const router = useRouter();
  const { user: authUser, isLoading: authLoading, setUser } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  // Stable string dep to avoid reference-equality-based re-render loops
  const allowedKey = allowedRoles.join(",");

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    // If AuthContext is still resolving, wait for it
    if (authLoading) return;

    async function checkAuth() {
      // Fast path: user already in context
      if (authUser) {
        if (allowedRoles.includes(authUser.role)) {
          if (isMounted.current) setIsAuthorized(true);
        } else {
          // Wrong role → redirect to their own dashboard
          router.replace(getRoleDashboardRoute(authUser.role));
        }
        if (isMounted.current) setLoading(false);
        return;
      }

      // Slow path: no user in context yet, try fetching from API
      try {
        const user: SafeUser = await getMe();
        if (!isMounted.current) return;
        setUser(user);
        if (allowedRoles.includes(user.role)) {
          setIsAuthorized(true);
        } else {
          router.replace(getRoleDashboardRoute(user.role));
        }
      } catch {
        if (!isMounted.current) return;
        const currentPath = window.location.pathname;
        router.replace(`/auth/signin?redirect=${encodeURIComponent(currentPath)}`);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    }

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, authUser, allowedKey]);

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-white gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div className="space-y-1 text-center">
          <p className="text-base font-bold tracking-tight text-slate-800">MozhiAruvi</p>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Verifying your session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return <>{children}</>;
}




