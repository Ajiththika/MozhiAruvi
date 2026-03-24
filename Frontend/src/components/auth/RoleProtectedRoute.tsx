"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, SafeUser } from "@/services/authService";
import { getRoleDashboardRoute } from "@/lib/roleUtils";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Array<"user" | "teacher" | "admin">;
}

export function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
  const router = useRouter();
  const { user: authUser, setUser } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      // If we already have a user in context, check their role immediately
      if (authUser) {
        if (allowedRoles.includes(authUser.role)) {
          setIsAuthorized(true);
          setLoading(false);
          return;
        }
      }

      try {
        const user: SafeUser = await getMe();
        
        if (isMounted) {
          // Update AuthContext so others don't have to refetch
          setUser(user);
          
          if (allowedRoles.includes(user.role)) {
            setIsAuthorized(true);
          } else {
            router.replace(getRoleDashboardRoute(user.role));
          }
        }
      } catch (err) {
        if (isMounted) {
          const currentPath = window.location.pathname;
          router.replace(`/auth/signin?redirect=${encodeURIComponent(currentPath)}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [allowedRoles, router, authUser, setUser]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-white dark:bg-slate-900">
         <Loader2 className="h-10 w-10 animate-spin text-primary" />
         <div className="mt-8 space-y-2 text-center text-sans">
            <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Mozhi aruvi</p>
            <p className="text-xs font-bold text-slate-400 tracking-tight">Verifying identity...</p>
         </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return <>{children}</>;
}
