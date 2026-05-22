"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function TutorOnboardingSuccess() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/tutor/dashboard"), 2000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8 text-center">
      <CheckCircle2 className="h-16 w-16 text-emerald-500" />
      <h1 className="text-2xl font-black text-slate-800">You&apos;re all set</h1>
      <p className="text-slate-500 font-medium max-w-md">Student payments are handled via PayPal when they book sessions.</p>
      <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
    </div>
  );
}
