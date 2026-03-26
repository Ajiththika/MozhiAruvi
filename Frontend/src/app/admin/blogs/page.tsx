"use client";

import React, { useEffect, useState } from "react";
import { getAllBlogsForAdmin, updateBlogStatusAdmin, adminDeleteBlog, Blog } from "@/services/blogService";
import { Trash2, CheckCircle, XCircle, Loader2, RefreshCw, AlertCircle, ExternalLink, Filter, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/Pagination";
import Button from "@/components/common/Button";

const statusConfig: Record<string, { label: string; className: string }> = {
  published: { label: "Published",  className: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  draft:     { label: "Draft",      className: "bg-gray-50 text-gray-500 border-gray-100" },
  pending:   { label: "Pending",    className: "bg-amber-50 text-amber-600 border-amber-100" },
  rejected:  { label: "Rejected",   className: "bg-red-50 text-red-600 border-red-100" },
};

export default function AdminBlogsPage() {
  const [blogs, setBlogs]         = useState<Blog[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [actionId, setActionId]   = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchBlogs = (page: number = 1) => {
    setLoading(true);
    setError(null);
    getAllBlogsForAdmin(page)
      .then(res => {
        setBlogs(res.blogs);
        setTotalPages(res.totalPages);
        setTotalItems(res.totalBlogs);
        setCurrentPage(res.currentPage);
      })
      .catch(() => setError("Failed to load blogs."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBlogs(currentPage); }, [currentPage]);

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
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto py-10">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-gray-100">
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <span className="h-1.5 w-6 rounded-full bg-primary" />
              <span className="text-xs font-bold text-primary tracking-tight">Post moderation</span>
           </div>
           <h1 className="text-4xl font-bold text-gray-800 tracking-tight leading-none">Content Control</h1>
           <p className="text-gray-500 font-medium max-w-md">Oversee community contributions and maintain excellence.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            href="/student/blogs/create"
            variant="primary"
            size="md"
            className="rounded-xl shadow-xl shadow-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Write Story
          </Button>
          <button
            onClick={() => fetchBlogs(currentPage)}
            className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
          </button>
        </div>
      </div>



      {/* Error / Loading */}
      {error && (
        <div className="mb-8 flex items-center gap-4 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-bold text-red-700">
          <AlertCircle className="h-6 w-6 shrink-0" /> {error}
        </div>
      )}

      {loading && filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm font-bold text-gray-400">Loading audit log...</p>
        </div>
      ) : null}

      {!loading && filtered.length === 0 && !error && (
        <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center">
          <p className="text-gray-500 font-medium">No results match your selection.</p>
        </div>
      )}

      {/* Audit Table */}
      {filtered.length > 0 && (
        <div className="space-y-12">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-slate-200/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Article details</th>
                    <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">Author</th>
                    <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Current state</th>
                    <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest hidden lg:table-cell">Timestamp</th>
                    <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((blog) => {
                    const sc = statusConfig[blog.status] ?? statusConfig.draft;
                    const inAction = actionId === blog._id;
                    const inConfirmDelete = confirmDeleteId === blog._id;
                    return (
                      <tr key={blog._id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-8 py-6 max-w-sm">
                          <p className="font-bold text-gray-800 line-clamp-1 text-base tracking-tight">{blog.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-md bg-primary/5 border border-primary/10">{blog.category || "General"}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                             <span className="text-sm font-bold text-gray-700">{(blog.author as any)?.name || "Unknown"}</span>
                             { (blog.author as any)?.role === 'admin' && (
                               <span className="text-[9px] font-bold text-primary border border-primary/20 bg-primary/5 px-1.5 py-0.5 rounded-md">Admin</span>
                             )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn("inline-flex items-center rounded-full px-4 py-1 text-[11px] font-bold tracking-tight border", sc.className)}>
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-gray-400 text-sm font-medium hidden lg:table-cell">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4 justify-end">
                            {blog.status === "published" && (
                              <Link href={`/blogs/${blog.slug || blog._id}`} target="_blank" className="text-gray-400 hover:text-primary transition-all p-2 bg-gray-50 rounded-lg border border-transparent shadow-sm">
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            )}
    
                            <div className="flex items-center gap-2">
                              {inAction ? (
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                              ) : (
                                <>
                                  {blog.status === "pending" && (
                                    <>
                                      <button onClick={() => handleStatus(blog._id, "published")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-[11px] font-bold text-emerald-600 hover:bg-emerald-100 transition-all border border-emerald-200">
                                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                                      </button>
                                      <button onClick={() => handleStatus(blog._id, "rejected")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-[11px] font-bold text-red-600 hover:bg-red-100 transition-all border border-red-200">
                                        <XCircle className="w-3.5 h-3.5" /> Reject
                                      </button>
                                    </>
                                  )}
                                  {(blog.status === "published" || blog.status === "rejected") && (
                                    <button onClick={() => handleStatus(blog._id, "pending")} className="text-[11px] font-bold text-gray-500 hover:text-primary p-2 transition-all">
                                      Flag pending
                                    </button>
                                  )}
                                  {!inConfirmDelete ? (
                                    <button onClick={() => setConfirmDeleteId(blog._id)} className="p-2 text-gray-300 hover:text-red-500 transition-all">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                                      <button onClick={() => handleDelete(blog._id)} className="text-[11px] font-bold text-red-600 underline">Confirm</button>
                                      <button onClick={() => setConfirmDeleteId(null)} className="text-xs font-bold text-gray-400">Esc</button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}
    </div>
  );
}

