"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPublicBlogByIdOrSlug, deleteMyBlog, Blog } from "@/services/blogService";
import { getMe, SafeUser } from "@/services/authService";
import { ArrowLeft, Calendar, UserCircle, Clock, Edit2, Trash2, Loader2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

function readingTime(content: string) {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

const statusColors: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  draft:     "bg-slate-100 text-slate-600",
  pending:   "bg-amber-100 text-amber-700",
  rejected:  "bg-red-100 text-red-700",
};

export default function BlogDetailsPage() {
  const params  = useParams();
  const router  = useRouter();
  const [blog, setBlog]       = useState<Blog | null>(null);
  const [user, setUser]       = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    Promise.allSettled([
      getPublicBlogByIdOrSlug(id).then(setBlog),
      getMe().then(setUser),
    ]).finally(() => setLoading(false));
  }, [params.id]);

  const canManage = user && blog && (user.role === "admin" || (blog.author as any)?._id === user._id || (blog.author as any) === user._id);

  const handleDelete = async () => {
    if (!blog) return;
    setDeleting(true);
    try {
      await deleteMyBlog(blog._id);
      router.push("/blogs");
    } catch {
      alert("Failed to delete post.");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-mozhi-primary" />
    </div>
  );

  if (!blog) return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 px-4">
        <BookOpen className="h-16 w-16 text-slate-300" />
        <h1 className="text-2xl font-bold text-slate-700">Article not found</h1>
        <p className="text-slate-500 text-sm">This article may have been removed or is not yet published.</p>
        <Link href="/blogs" className="text-mozhi-primary font-bold hover:text-mozhi-secondary flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 animate-in fade-in duration-500">
        {/* Back + Owner actions */}
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <Link href="/blogs" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-mozhi-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          {canManage && (
            <div className="flex items-center gap-2">
              <Link
                href={`/student/blogs/${blog._id}/edit`}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:border-mozhi-primary hover:text-mozhi-primary transition-colors shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </Link>
              {!showConfirm ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-bold text-red-700">
                  <span>Confirm?</span>
                  <button onClick={handleDelete} disabled={deleting} className="underline hover:text-red-900 disabled:opacity-60">
                    {deleting ? "Deleting..." : "Yes, delete"}
                  </button>
                  <button onClick={() => setShowConfirm(false)} className="underline text-slate-500 hover:text-slate-700">Cancel</button>
                </div>
              )}
            </div>
          )}
        </div>

        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Featured image */}
          {blog.featuredImage && (
            <div className="w-full aspect-video bg-slate-100 overflow-hidden">
              <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-6 md:p-12">
            {/* Category + status */}
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              {blog.category && (
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  {blog.category}
                </span>
              )}
              {canManage && (
                <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize", statusColors[blog.status])}>
                  {blog.status}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-5 text-slate-500 border-b border-slate-100 pb-8 mb-8">
              <div className="flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-slate-400" />
                <span className="font-semibold text-slate-700">{blog.author?.name || "Unknown"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{new Date(blog.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{readingTime(blog.content)} min read</span>
              </div>
            </div>

            <div className="prose prose-slate lg:prose-lg max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
              {blog.content}
            </div>
          </div>
        </article>

        {/* Footer CTA */}
        <div className="mt-10 text-center">
          <Link href="/blogs" className="inline-flex items-center gap-2 text-sm font-bold text-mozhi-primary hover:text-mozhi-secondary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Browse all articles
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
