"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, SafeUser } from "@/services/authService";
import { getRoleDashboardRoute } from "@/lib/roleUtils";
import { Loader2 } from "lucide-react";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Array<"user" | "teacher" | "admin">;
}

export function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const user: SafeUser = await getMe();
        
        if (isMounted) {
          if (allowedRoles.includes(user.role)) {
            setIsAuthorized(true);
          } else {
            // Logged in but wrong role, send them to their correct dashboard
            router.replace(getRoleDashboardRoute(user.role));
          }
        }
      } catch (err) {
        // Not logged in or token expired
        if (isMounted) {
          router.replace("/auth/signin");
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
  }, [allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-50">
         <Loader2 className="h-10 w-10 animate-spin text-primary" />
         <p className="mt-4 text-sm font-medium text-slate-600">Verifying session...</p>
      </div>
    );
  }

  // Only render children if authorized
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
