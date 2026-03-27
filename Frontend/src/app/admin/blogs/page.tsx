"use client";

import React, { useEffect, useState } from "react";
import { getAllBlogsForAdmin, updateBlogStatusAdmin, adminDeleteBlog, Blog } from "@/services/blogService";
import { Trash2, CheckCircle, XCircle, Loader2, RefreshCw, AlertCircle, ExternalLink, Filter, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";

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
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-12 pb-14 border-b border-border">
        <div className="space-y-6">
           <div className="flex items-center gap-4">
              <div className="h-0.5 w-10 bg-primary/40 rounded-full" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Central Archive Control</span>
           </div>
           <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">Content Moderation</h1>
           <p className="text-gray-400 font-bold max-w-lg tracking-tight">Audit and orchestrate community contributions to maintain architectural and cultural excellence.</p>
        </div>
        
        <div className="flex items-center gap-6">
          <Button
            href="/blogs/write"
            variant="primary"
            size="xl"
            className="rounded-2xl shadow-2xl shadow-primary/20 h-16 px-12 font-black uppercase text-[10px] tracking-widest bg-gray-900 hover:bg-black text-white"
          >
            <Plus className="w-5 h-5 mr-3" /> Write
          </Button>
          <button
            onClick={() => fetchBlogs(currentPage)}
            className="flex items-center gap-3 rounded-[2rem] border border-border bg-white h-16 px-10 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all shadow-sm group"
          >
            <RefreshCw className={cn("h-4 w-4 transition-transform group-hover:rotate-180 duration-700", loading && "animate-spin")} /> Refresh Log
          </button>
        </div>
      </div>



      {/* Error / Loading */}
      {error && (
        <div className="mb-12 flex items-center gap-6 rounded-[2rem] border border-red-100 bg-red-50 p-8 text-sm font-bold text-red-700">
          <AlertCircle className="h-6 w-6 shrink-0" /> {error}
        </div>
      )}

      {loading && filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-48 gap-8">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Auditing the repository...</p>
        </div>
      ) : null}

      {!loading && filtered.length === 0 && !error && (
        <div className="bg-white rounded-2xl border border-border p-32 text-center shadow-sm">
           <div className="h-24 w-24 bg-surface-soft rounded-full flex items-center justify-center mx-auto mb-8">
              <Filter className="h-10 w-10 text-gray-200" />
           </div>
          <p className="text-gray-400 font-bold tracking-tight text-xl">No archival entries match your filter logic.</p>
        </div>
      )}

      {/* Audit Table */}
      {filtered.length > 0 && (
        <div className="space-y-16">
          <div className="bg-white rounded-2xl border border-border shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-soft border-b border-border">
                    <th className="px-12 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Repository Details</th>
                    <th className="px-12 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Contributor</th>
                    <th className="px-12 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Current State</th>
                    <th className="px-12 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell">Audit Stamp</th>
                    <th className="px-12 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Moderation Logic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
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

