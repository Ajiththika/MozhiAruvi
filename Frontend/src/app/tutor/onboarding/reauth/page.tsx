"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function TutorOnboardingReauth() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/tutor/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-lg font-bold text-slate-700">Redirecting to dashboard...</p>
    </div>
  );
}
