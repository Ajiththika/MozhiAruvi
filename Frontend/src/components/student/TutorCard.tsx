import React from "react";
import Link from "next/link";
import { Star, Clock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TutorCardProps {
  id: string;
  name: string;
  avatarUrl?: string;
  rating: number;
  reviews: number;
  languages: string[];
  specialties: string[];
  hourlyRate: string;
  shortBio: string;
}

export function TutorCard({
  id,
  name,
  avatarUrl,
  rating,
  reviews,
  languages,
  specialties,
  hourlyRate,
  shortBio,
}: TutorCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate- bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate- dark:bg-slate-">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-mozhi-light dark:bg-mozhi-primary/20">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span className="text-xl font-bold text-mozhi-primary dark:text-mozhi-secondary">
              {name.charAt(0)}
            </span>
          )}
        </div>

        {/* Header Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate- dark:text-slate-">
              {name}
            </h3>
            <div className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-500">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate- dark:text-slate-">
            {reviews} lessons taught
          </p>
        </div>
      </div>

      {/* Bio */}
      <p className="mt-4 line-clamp-2 text-sm text-slate- dark:text-slate-">
        {shortBio}
      </p>

      {/* Meta details */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-slate- dark:text-slate-">
          <Globe className="h-4 w-4" />
          <span>Speaks: {languages.join(", ")}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate- dark:text-slate-">
          <Clock className="h-4 w-4" />
          <span>{hourlyRate}/hour</span>
        </div>
      </div>

      {/* Specialties */}
      <div className="mt-4 flex flex-wrap gap-2">
        {specialties.slice(0, 3).map((spec) => (
          <span
            key={spec}
            className="inline-flex rounded-full bg-slate- px-2.5 py-0.5 text-xs font-medium text-slate- dark:bg-slate- dark:text-slate-"
          >
            {spec}
          </span>
        ))}
        {specialties.length > 3 && (
          <span className="inline-flex rounded-full bg-slate- px-2.5 py-0.5 text-xs font-medium text-slate- dark:bg-slate- dark:text-slate-">
            +{specialties.length - 3}
          </span>
        )}
      </div>

      <div className="mt-6">
        <Link
          href={`/student/tutors/${id}`}
          className="flex w-full items-center justify-center rounded-xl bg-mozhi-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mozhi-primary focus:outline-none focus:ring-2 focus:ring-mozhi-primary focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
