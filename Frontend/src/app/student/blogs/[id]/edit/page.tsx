"use client";

import React, { useEffect, useState } from "react";
import { getMyBlogById, updateMyBlog } from "@/services/blogService";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Save, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Grammar", "Culture", "Pronunciation", "Tutor Tips", "Updates", "General"];

const inputCls = "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-mozhi-primary focus:ring-2 focus:ring-mozhi-primary/20 outline-none transition";

const statusColors: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  draft:     "bg-slate-100 text-slate-600",
  pending:   "bg-amber-100 text-amber-700",
  rejected:  "bg-red-100 text-red-700",
};

export default function EditBlogPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("draft");
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [form, setForm] = useState({
    title: "", content: "", excerpt: "", category: "", featuredImage: "",
  });

  useEffect(() => {
    if (!id) return;
    getMyBlogById(id)
      .then((blog) => {
        setCurrentStatus(blog.status);
        setForm({
          title:        blog.title        || "",
          content:      blog.content      || "",
          excerpt:      blog.excerpt      || "",
          category:     blog.category     || "",
          featuredImage: blog.featuredImage || "",
        });
      })
      .catch(() => {
        setBanner({ type: "error", message: "Blog not found or you don't have permission to edit it." });
      })
      .finally(() => setInitialLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!form.title.trim() || !form.content.trim()) {
      setBanner({ type: "error", message: "Title and Content are required." });
      return;
    }
    setSubmitting(true);
    setBanner(null);
    try {
      await updateMyBlog(id, { ...form, status: isDraft ? "draft" : "pending" });
      setBanner({ type: "success", message: isDraft ? "Draft updated!" : "Post submitted for review!" });
      setTimeout(() => router.push("/student/blogs"), 1500);
    } catch (err: any) {
      setBanner({ type: "error", message: err?.response?.data?.message || "Failed to update post." });
    } finally {
      setSubmitting(false);
    }
  };

  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;

  if (initialLoading) return (
    <div className="flex items-center justify-center py-24 gap-3">
      <Loader2 className="h-7 w-7 animate-spin text-mozhi-primary" />
      <span className="text-sm font-medium text-slate-500">Loading editor…</span>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 max-w-3xl mx-auto">
      <Link href="/student/blogs" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-mozhi-primary dark:text-slate-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to My Posts
      </Link>

      <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-10">
        <div className="mb-8 flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Edit Post</h1>
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold capitalize", statusColors[currentStatus] ?? statusColors.draft)}>
            {currentStatus}
          </span>
        </div>

        {/* Banner */}
        {banner && (
          <div className={`mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium animate-in slide-in-from-top-2 ${
            banner.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400"
          }`}>
            {banner.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
            {banner.message}
          </div>
        )}

        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" required value={form.title} onChange={handleChange} className={inputCls} />
          </div>

          {/* Category + Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
                <option value="">Select Category…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Featured Image URL</label>
              <input type="url" name="featuredImage" value={form.featuredImage} onChange={handleChange} className={inputCls} placeholder="https://example.com/image.jpg" />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Excerpt <span className="text-slate-400 font-normal">(Short summary)</span>
            </label>
            <textarea name="excerpt" rows={2} value={form.excerpt} onChange={handleChange} className={inputCls} />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Content <span className="text-red-500">*</span></label>
              <span className="text-xs text-slate-400">{wordCount} words · ~{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
            </div>
            <textarea name="content" required rows={14} value={form.content} onChange={handleChange} className={inputCls} />
          </div>

          {/* Footer actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:border-slate-400 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" /> Save as Draft
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-mozhi-primary text-white font-bold text-sm shadow-sm hover:bg-mozhi-primary-dark disabled:opacity-50 transition-colors"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? "Saving…" : "Submit for Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
