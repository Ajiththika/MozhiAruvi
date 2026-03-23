"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authStore } from "@/lib/authStore";
import { useAuth } from "@/context/AuthContext";
import { getMe } from "@/services/authService";
import { getRoleDashboardRoute } from "@/lib/roleUtils";
import { Loader2 } from "lucide-react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get("accessToken");
    if (token) {
      authStore.set(token);
      
      // Fetch user data and redirect
      getMe()
        .then((userData) => {
          setUser(userData);
          router.push(getRoleDashboardRoute(userData.role));
        })
        .catch(() => {
          authStore.clear();
          router.push("/auth/signin?error=OAuth failed");
        });
    } else {
      router.push("/auth/signin");
    }
  }, [router, searchParams, setUser]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-slate-950">
      <Loader2 className="h-10 w-10 animate-spin text-mozhi-primary" />
      <p className="mt-4 font-bold text-slate-500 uppercase tracking-widest text-sm">
        Completing your sign in...
      </p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-mozhi-primary" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
