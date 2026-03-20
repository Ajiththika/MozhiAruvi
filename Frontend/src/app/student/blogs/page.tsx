"use client";

import React, { useEffect, useState } from "react";
import { getMyBlogs, deleteMyBlog, Blog } from "@/services/blogService";
import Link from "next/link";
import { Plus, Edit2, Trash2, Loader2, BookOpen, ExternalLink, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  published: { label: "Published",  className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  draft:     { label: "Draft",      className: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" },
  pending:   { label: "Pending Review", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  rejected:  { label: "Rejected",   className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" },
};

export default function MyBlogsPage() {
  const [blogs, setBlogs]         = useState<Blog[]>([]);
  const [loading, setLoading]     = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);

  const fetchBlogs = () => {
    setLoading(true);
    setError(null);
    getMyBlogs()
      .then(setBlogs)
      .catch(() => setError("Failed to load your blogs."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteMyBlog(id);
      setBlogs((prev) => prev.filter((b) => b._id !== id));
    } catch {
      setError("Failed to delete this post. Please try again.");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">My Blog Posts</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your published and draft posts.</p>
        </div>
        <Link
          href="/student/blogs/create"
          className="flex items-center gap-2 rounded-2xl bg-mozhi-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-mozhi-primary-dark transition-all"
        >
          <Plus className="w-4 h-4" /> Write New Post
        </Link>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24 gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-mozhi-primary" />
          <span className="text-sm font-medium text-slate-500">Loading your posts...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && blogs.length === 0 && !error && (
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">No posts yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">You haven't written any blog posts. Share your Tamil learning journey!</p>
          <Link href="/student/blogs/create" className="inline-flex items-center gap-2 rounded-xl bg-mozhi-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-mozhi-primary-dark">
            <Plus className="w-4 h-4" /> Write first post
          </Link>
        </div>
      )}

      {/* Table */}
      {!loading && blogs.length > 0 && (
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">Title</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 hidden sm:table-cell">Date</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
              {blogs.map((blog) => {
                const sc = statusConfig[blog.status] ?? statusConfig.draft;
                const isConfirming = confirmId === blog._id;
                const isDeleting = deletingId === blog._id;
                return (
                  <tr key={blog._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{blog.title}</p>
                      {blog.excerpt && (
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{blog.excerpt}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold", sc.className)}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end flex-wrap">
                        {blog.status === "published" && (
                          <Link
                            href={`/blogs/${blog.slug || blog._id}`}
                            target="_blank"
                            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-mozhi-primary transition-colors"
                            title="View live"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <Link
                          href={`/student/blogs/${blog._id}/edit`}
                          className="flex items-center gap-1 text-sm font-bold text-mozhi-primary hover:text-mozhi-secondary transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </Link>
                        {!isConfirming ? (
                          <button
                            onClick={() => setConfirmId(blog._id)}
                            className="flex items-center gap-1 text-sm font-bold text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        ) : (
                          <span className="flex items-center gap-2 text-xs font-bold">
                            <button
                              onClick={() => handleDelete(blog._id)}
                              disabled={isDeleting}
                              className="text-red-600 hover:text-red-800 underline disabled:opacity-60"
                            >
                              {isDeleting ? "Deleting..." : "Confirm"}
                            </button>
                            <button onClick={() => setConfirmId(null)} className="text-slate-400 hover:text-slate-600 underline">
                              Cancel
                            </button>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
