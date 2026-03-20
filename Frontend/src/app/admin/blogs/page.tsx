"use client";

import React, { useEffect, useState } from "react";
import { getAllBlogsForAdmin, updateBlogStatusAdmin, adminDeleteBlog, Blog } from "@/services/blogService";
import { Trash2, CheckCircle, XCircle, Loader2, RefreshCw, AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  published: { label: "Published",  className: "bg-emerald-100 text-emerald-700" },
  draft:     { label: "Draft",      className: "bg-slate-100 text-slate-600" },
  pending:   { label: "Pending",    className: "bg-amber-100 text-amber-700" },
  rejected:  { label: "Rejected",   className: "bg-red-100 text-red-700" },
};

export default function AdminBlogsPage() {
  const [blogs, setBlogs]         = useState<Blog[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [actionId, setActionId]   = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchBlogs = () => {
    setLoading(true);
    setError(null);
    getAllBlogsForAdmin()
      .then(setBlogs)
      .catch(() => setError("Failed to load blogs."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleStatus = async (id: string, newStatus: "published" | "rejected" | "pending" | "draft") => {
    setActionId(id);
    try {
      const updated = await updateBlogStatusAdmin(id, newStatus);
      setBlogs((prev) => prev.map((b) => b._id === id ? { ...b, status: updated.status } : b));
    } catch {
      setError("Failed to update blog status.");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionId(id);
    try {
      await adminDeleteBlog(id);
      setBlogs((prev) => prev.filter((b) => b._id !== id));
    } catch {
      setError("Failed to delete blog.");
    } finally {
      setActionId(null);
      setConfirmDeleteId(null);
    }
  };

  const filtered = statusFilter === "all" ? blogs : blogs.filter((b) => b.status === statusFilter);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Blog Posts</h1>
          <p className="mt-1 text-sm text-slate-500">Approve, reject, or delete user submitted blog articles.</p>
        </div>
        <button onClick={fetchBlogs} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-colors self-start">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "pending", "published", "rejected", "draft"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "rounded-full px-3.5 py-1 text-xs font-bold capitalize transition-all",
              statusFilter === s
                ? "bg-slate-800 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
            )}
          >
            {s === "all" ? "All Posts" : s}
            {s !== "all" && (
              <span className="ml-1.5 opacity-60">({blogs.filter((b) => b.status === s).length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24 gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-mozhi-primary" />
          <span className="text-sm text-slate-500">Loading blogs…</span>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && !error && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <p className="text-slate-500">{blogs.length === 0 ? "No blog posts yet." : `No ${statusFilter} posts.`}</p>
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">Title</th>
                <th className="px-5 py-4 hidden md:table-cell">Author</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 hidden sm:table-cell">Date</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((blog) => {
                const sc = statusConfig[blog.status] ?? statusConfig.draft;
                const inAction = actionId === blog._id;
                const inConfirmDelete = confirmDeleteId === blog._id;
                return (
                  <tr key={blog._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-semibold text-slate-900 line-clamp-1">{blog.title}</p>
                      {blog.category && <p className="text-xs text-slate-400 mt-0.5">{blog.category}</p>}
                    </td>
                    <td className="px-5 py-4 text-slate-600 hidden md:table-cell">
                      {(blog.author as any)?.name || "Unknown"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold", sc.className)}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 hidden sm:table-cell">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end flex-wrap">
                        {/* View public if published */}
                        {blog.status === "published" && (
                          <Link href={`/blogs/${blog.slug || blog._id}`} target="_blank" className="text-slate-400 hover:text-mozhi-primary transition-colors" title="View post">
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}

                        {inAction ? (
                          <Loader2 className="h-4 w-4 animate-spin text-mozhi-primary" />
                        ) : (
                          <>
                            {blog.status === "pending" && (
                              <>
                                <button onClick={() => handleStatus(blog._id, "published")} className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors">
                                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button onClick={() => handleStatus(blog._id, "rejected")} className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 transition-colors">
                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                </button>
                              </>
                            )}
                            {(blog.status === "published" || blog.status === "rejected") && (
                              <button onClick={() => handleStatus(blog._id, "pending")} className="text-xs font-bold text-amber-600 hover:text-amber-800 underline transition-colors">
                                Pending
                              </button>
                            )}
                            {!inConfirmDelete ? (
                              <button onClick={() => setConfirmDeleteId(blog._id)} className="text-red-400 hover:text-red-600 transition-colors" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="flex items-center gap-1.5 text-xs font-bold">
                                <button onClick={() => handleDelete(blog._id)} className="text-red-600 underline hover:text-red-800">Delete?</button>
                                <button onClick={() => setConfirmDeleteId(null)} className="text-slate-400 underline hover:text-slate-600">Cancel</button>
                              </span>
                            )}
                          </>
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
