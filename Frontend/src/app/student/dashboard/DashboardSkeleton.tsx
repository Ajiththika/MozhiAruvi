import React from "react";

export function DashboardSkeleton() {
  return (
    <div className="space-y-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="h-2 w-24 bg-gray-100 rounded-full" />
        <div className="h-10 w-64 bg-gray-100 rounded-xl" />
        <div className="h-4 w-96 bg-gray-100 rounded-lg" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-50 rounded-[2rem] border border-gray-100" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-12">
          <div className="h-64 bg-gray-50 rounded-[2.5rem] border border-gray-100" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-40 bg-gray-50 rounded-3xl border border-gray-100" />
            <div className="h-40 bg-gray-50 rounded-3xl border border-gray-100" />
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-12">
          <div className="space-y-4">
            <div className="h-20 bg-gray-50 rounded-3xl border border-gray-100" />
            <div className="h-20 bg-gray-50 rounded-3xl border border-gray-100" />
          </div>
          <div className="h-48 bg-gray-50 rounded-[2.5rem] border border-gray-100" />
        </div>
      </div>
    </div>
  );
}
