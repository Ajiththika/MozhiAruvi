import React from "react";

export function LessonsSkeleton() {
  return (
    <div className="space-y-12 animate-pulse w-full max-w-3xl mx-auto px-4 py-20">
      {/* Header Sticky Skeleton */}
      <div className="h-20 bg-gray-50 rounded-2xl border border-gray-100 mb-8" />

      {/* Title Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-100 rounded-lg" />
        <div className="h-4 w-96 bg-gray-100 rounded-md" />
      </div>

      {/* Path Skeleton */}
      {[1, 2].map((m) => (
        <div key={m} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-gray-100 rounded-2xl" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-gray-100 rounded-md" />
              <div className="h-3 w-20 bg-gray-100 rounded-md" />
            </div>
          </div>
          <div className="pl-14 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-50 rounded-2xl border border-gray-100" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

