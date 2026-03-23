"use client";

import React, { useEffect, useState } from "react";
import { getMyBlogs, deleteMyBlog, Blog } from "@/services/blogService";
import Link from "next/link";
import { Plus, Edit2, Trash2, Loader2, BookOpen, ExternalLink, AlertCircle, LayoutGrid, CheckCircle2, FileText, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/common/Button";

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  published: { label: "Published",  className: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: CheckCircle2 },
  draft:     { label: "Draft",      className: "bg-slate-50 text-slate-500 border-slate-100", icon: FileText },
  pending:   { label: "Pending Review", className: "bg-amber-50 text-amber-600 border-amber-100", icon: Loader2 },
  rejected:  { label: "Rejected",   className: "bg-red-50 text-red-600 border-red-100", icon: AlertCircle },
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
    <div className="animate-in fade-in duration-700 max-w-6xl mx-auto py-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-6 rounded-full bg-primary" />
            <span className="text-xs font-bold text-primary tracking-tight">Creator Studio</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
            My <span className="text-primary italic">Stories</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
            Craft and manage your insights about Tamil culture. Each story contributes to a larger shared heritage.
          </p>
        </div>
        
        <Button
          href="/student/blogs/create"
          variant="primary"
          size="lg"
          className="shadow-xl shadow-primary/20 rounded-2xl px-10"
        >
          <Plus className="w-5 h-5 mr-3" /> Write a new story
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-10 flex items-center gap-4 rounded-3xl border border-red-100 bg-red-50 p-6 text-sm font-bold text-red-700">
          <AlertCircle className="h-6 w-6 shrink-0" /> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm font-bold text-slate-400 tracking-tight">Opening your personal library...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && blogs.length === 0 && !error && (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-20 text-center shadow-2xl shadow-slate-200/20">
          <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-10">
            <BookOpen className="h-10 w-10 text-primary/40" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Your bookshelf is empty</h3>
          <p className="text-slate-500 max-w-xs mx-auto mb-12 font-medium leading-relaxed font-sans text-lg">
            Be the first to share unique Tamil learning hacks or cultural stories with the mozhi community.
          </p>
          <Button href="/student/blogs/create" variant="primary" size="lg" className="rounded-2xl px-12 shadow-2xl">
            Start writing today
          </Button>
        </div>
      )}

      {/* Grid of Manageable Stories */}
      {!loading && blogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {blogs.map((blog) => {
              const sc = statusConfig[blog.status] ?? statusConfig.draft;
              const StatusIcon = sc.icon;
              const isConfirming = confirmId === blog._id;
              const isDeleting = deletingId === blog._id;
              
              return (
                <div key={blog._id} className="group flex flex-col rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/5">
                   <div className="aspect-[1.8/1] w-full bg-slate-50 dark:bg-slate-800 relative overflow-hidden border-b border-slate-50">
                      {blog.featuredImage ? (
                        <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
                           <FileText className="w-12 h-12 text-primary/10" />
                        </div>
                      )}
                      
                      <div className="absolute top-6 left-6">
                         <span className={cn("inline-flex items-center gap-2 rounded-full px-5 py-2 text-[11px] font-bold tracking-tight shadow-xl border", sc.className)}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {sc.label}
                         </span>
                      </div>
                   </div>
                   
                   <div className="flex flex-col p-8 flex-1 space-y-4">
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight group-hover:text-primary transition-colors">
                         {blog.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-bold tracking-tight">
                         Last edited: {new Date(blog.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between pt-8 border-t border-slate-50 dark:border-slate-800">
                         <Link
                            href={`/student/blogs/${blog._id}/edit`}
                            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-secondary transition-colors"
                         >
                            <Edit2 className="w-4 h-4" /> Edit story
                         </Link>
                         
                         <div className="flex items-center gap-4">
                            {blog.status === "published" && (
                               <Link
                                  href={`/blogs/${blog.slug || blog._id}`}
                                  target="_blank"
                                  className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-primary hover:bg-white border border-transparent hover:border-slate-100 transition-all shadow-sm"
                               >
                                  <ExternalLink className="w-4 h-4" />
                               </Link>
                            )}
                            
                            {!isConfirming ? (
                               <button
                                  onClick={() => setConfirmId(blog._id)}
                                  className="h-10 w-10 flex items-center justify-center rounded-full bg-red-50/50 text-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            ) : (
                               <div className="flex items-center gap-4 animate-in slide-in-from-right-2">
                                  <button
                                     onClick={() => handleDelete(blog._id)}
                                     disabled={isDeleting}
                                     className="text-xs font-bold text-red-600 underline disabled:opacity-60"
                                  >
                                     {isDeleting ? "..." : "Delete now"}
                                  </button>
                                  <button onClick={() => setConfirmId(null)} className="text-xs font-bold text-slate-400">
                                     Cancel
                                  </button>
                               </div>
                            )}
                         </div>
                      </div>
                   </div>
                </div>
              );
           })}
        </div>
      )}
    </div>
  );
}
