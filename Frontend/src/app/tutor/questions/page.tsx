"use client";

import React, { useEffect, useState } from "react";
import {
  MessageSquareReply, Filter, Search, CheckCircle2, Loader2, AlertCircle,
} from "lucide-react";
import {
  getPendingRequests, resolveRequest, TutorRequest,
} from "@/services/tutorService";

export default function TutorQuestionsPage() {
  const [questions, setQuestions] = useState<TutorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getPendingRequests()
      .then(setQuestions)
      .catch(() => setError("Could not load questions. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const handleReply = async (qId: string) => {
    const text = replies[qId]?.trim();
    if (!text) return;
    setSubmitting(qId);
    try {
      const updated = await resolveRequest(qId, text);
      setQuestions((prev) => prev.map((q) => (q._id === qId ? updated : q)));
    } catch {
      // toast would go here
    } finally {
      setSubmitting(null);
    }
  };

  const filtered = questions.filter(
    (q) =>
      !search.trim() ||
      q.question.toLowerCase().includes(search.toLowerCase())
  );

  const pending = filtered.filter((q) => q.status === "pending" || q.status === "accepted");
  const resolved = filtered.filter((q) => q.status === "resolved");

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate- dark:text-slate-">
            Student Q&A Forum 💬
          </h2>
          <p className="mt-1 text-slate- dark:text-slate-">
            Answer questions from students attending your sessions.
          </p>
        </div>
        {!loading && (
          <span className="flex items-center gap-1.5 rounded-xl bg-red-100 px-3 py-1 font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-500 text-sm w-fit">
            {pending.length} Pending
          </span>
        )}
      </div>

      {/* Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full rounded-xl border border-slate- bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate- focus:border-mozhi-primary focus:ring-2 focus:ring-mozhi-primary/20 dark:border-slate- dark:bg-slate- dark:text-slate-"
          />
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-mozhi-primary" />
          <p className="text-sm font-medium text-slate-">Loading questions...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="py-20 text-center text-slate- dark:text-slate-">
          No questions {search ? "matching your search" : "yet"}.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {[...pending, ...resolved].map((q) => {
          const isResolved = q.status === "resolved";
          return (
            <div
              key={q._id}
              className="flex flex-col lg:flex-row rounded-2xl border border-slate- bg-white shadow-sm dark:border-slate- dark:bg-slate- overflow-hidden"
            >
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mozhi-light font-bold text-mozhi-primary dark:bg-mozhi-primary/20 dark:text-mozhi-secondary">
                      S
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate- dark:text-slate-">Student</p>
                      <p className="text-xs text-slate- dark:text-slate-">
                        {new Date(q.createdAt).toLocaleDateString()}
                        {q.lessonId && ` • Lesson: ${q.lessonId}`}
                      </p>
                    </div>
                  </div>
                  {isResolved && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-500">
                      <CheckCircle2 className="h-4 w-4" /> Resolved
                    </span>
                  )}
                </div>
                <p className="text-base text-slate- dark:text-slate- leading-relaxed">
                  "{q.question}"
                </p>
                {q.response && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400">
                    <strong>Your reply:</strong> {q.response}
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center border-t border-slate- bg-slate- p-6 lg:w-72 lg:border-l lg:border-t-0 dark:border-slate- dark:bg-slate-/50">
                {!isResolved ? (
                  <div className="space-y-4">
                    <textarea
                      rows={3}
                      value={replies[q._id] ?? ""}
                      onChange={(e) => setReplies((prev) => ({ ...prev, [q._id]: e.target.value }))}
                      placeholder="Type your response..."
                      className="w-full resize-none rounded-xl border border-slate- bg-white p-3 text-sm focus:border-mozhi-primary focus:outline-none focus:ring-1 focus:ring-mozhi-primary dark:border-slate- dark:bg-slate- dark:text-slate-"
                    />
                    <button
                      onClick={() => handleReply(q._id)}
                      disabled={submitting === q._id || !replies[q._id]?.trim()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-mozhi-primary py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-mozhi-primary disabled:opacity-50"
                    >
                      <MessageSquareReply className="h-4 w-4" />
                      {submitting === q._id ? "Sending..." : "Reply & Resolve"}
                    </button>
                  </div>
                ) : (
                  <div className="flex h-full flex-col justify-center text-center">
                    <p className="text-sm text-slate- dark:text-slate-">
                      This question has been marked resolved.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}