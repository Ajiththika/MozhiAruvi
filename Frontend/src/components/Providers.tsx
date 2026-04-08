"use client";

import React, { useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";

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
        {children}
        <PlatformChat />
      </AuthProvider>
    </QueryClientProvider>
  );
}

















