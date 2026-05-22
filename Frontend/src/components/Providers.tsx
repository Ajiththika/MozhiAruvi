"use client";

import React, { useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import FeedbackPopup from "@/components/common/FeedbackPopup";
import { ToastProvider } from "@/components/ui/Toast";

const PlatformChat = dynamic(() => import("@/components/ui/PlatformChat"), {
  ssr: false,
  loading: () => null,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
        {children}
        </ToastProvider>
        <PlatformChat />
        <FeedbackPopup />
      </AuthProvider>
    </QueryClientProvider>
  );
}

















