"use client";

import React, { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-xl border border-gray-100 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">System Interruption</h2>
        <p className="text-gray-500 mb-8 font-medium italic">
          We encountered an unexpected error processing this view. Our diagnostic systems have logged the anomaly.
        </p>
        <button
          onClick={() => reset()}
          className="w-full py-4 rounded-xl font-bold bg-indigo-600 text-white mb-3 hover:bg-indigo-700 transition-colors"
        >
          Attempt Recovery
        </button>
        <a 
          href="/" 
          className="block w-full py-4 rounded-xl font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Return to Hub
        </a>
      </div>
    </div>
  );
}
