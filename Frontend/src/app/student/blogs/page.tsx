"use client";

import React, { useEffect, useState } from "react";
import { getMyBlogs, deleteMyBlog, Blog } from "@/services/blogService";
import Link from "next/link";
import { Plus, Edit2, Trash2, Loader2, BookOpen, ExternalLink, AlertCircle, LayoutGrid, CheckCircle2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  published: { label: "Published",  className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400", icon: CheckCircle2 },
  draft:     { label: "Draft",      className: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300", icon: FileText },
  pending:   { label: "Pending Review", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400", icon: Loader2 },
  rejected:  { label: "Rejected",   className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400", icon: AlertCircle },
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
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto py-6">
      {/* Header with Visual Impact */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
           <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-mozhi-secondary">
              <LayoutGrid className="w-3 h-3" />
              Creator Studio
           </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
            My <span className="text-mozhi-primary">Stories</span>
          </h1>
          <p className="mt-4 text-slate-500 font-medium max-w-md">
            Manage your published insights and evolving drafts. All your content is real-time and connected.
          </p>
        </div>
        
        <Link
          href="/student/blogs/create"
          className="group flex items-center gap-3 rounded-full bg-mozhi-primary px-8 py-4 text-sm font-black text-white shadow-2xl shadow-mozhi-primary/20 hover:scale-[1.02] transition-all uppercase tracking-widest"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> 
          Write New Story
        </Link>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-8 flex items-center gap-3 rounded-[2rem] border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20 px-6 py-4 text-sm font-bold text-red-700 dark:text-red-400 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {/* States - Skeleton / Loader */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-mozhi-primary" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Opening your library...</p>
        </div>
      )}

      {/* Empty Experience */}
      {!loading && blogs.length === 0 && !error && (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-16 text-center shadow-xl shadow-slate-200/20 dark:shadow-none">
          <div className="w-24 h-24 bg-mozhi-light dark:bg-mozhi-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <BookOpen className="h-10 w-10 text-mozhi-primary" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">Your bookshelf is empty</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-10 font-medium">Be the first to share unique Tamil learning hacks or cultural stories with the mozhi community.</p>
          <Link href="/student/blogs/create" className="inline-flex items-center gap-3 rounded-full bg-mozhi-primary px-10 py-5 text-sm font-black text-white shadow-xl shadow-mozhi-primary/20 hover:scale-105 transition-all uppercase tracking-widest">
            <Plus className="w-5 h-5" /> Write first post
          </Link>
        </div>
      )}

      {/* High-Contrast Management Card Grid */}
      {!loading && blogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {blogs.map((blog) => {
              const sc = statusConfig[blog.status] ?? statusConfig.draft;
              const StatusIcon = sc.icon;
              const isConfirming = confirmId === blog._id;
              const isDeleting = deletingId === blog._id;
              
              return (
                <div key={blog._id} className="group relative flex flex-col rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all hover:shadow-2xl hover:shadow-mozhi-primary/5">
                   <div className="aspect-[1.8/1] w-full bg-slate-50 dark:bg-slate-800 relative overflow-hidden">
                      {blog.featuredImage ? (
                        <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-mozhi-light/20 to-transparent">
                           <FileText className="w-12 h-12 text-mozhi-primary/20" />
                        </div>
                      )}
                      
                      <div className="absolute top-4 left-4">
                         <span className={cn("inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-xl", sc.className)}>
                            <StatusIcon className="w-3 h-3" />
                            {sc.label}
                         </span>
                      </div>
                   </div>
                   
                   <div className="flex flex-col p-8 flex-1">
                      <h4 className="text-xl font-black text-slate-900 dark:text-white mb-3 line-clamp-2 leading-tight uppercase tracking-tight">
                         {blog.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">
                         Last edited: {new Date(blog.updatedAt).toLocaleDateString()}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                         <Link
                            href={`/student/blogs/${blog._id}/edit`}
                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-mozhi-primary hover:text-mozhi-secondary transition-colors"
                         >
                            <Edit2 className="w-3.5 h-3.5" /> Edit post
                         </Link>
                         
                         <div className="flex items-center gap-3">
                            {blog.status === "published" && (
                               <Link
                                  href={`/blogs/${blog.slug || blog._id}`}
                                  target="_blank"
                                  className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-mozhi-primary transition-all"
                                  title="View on site"
                               >
                                  <ExternalLink className="w-4 h-4" />
                               </Link>
                            )}
                            
                            {!isConfirming ? (
                               <button
                                  onClick={() => setConfirmId(blog._id)}
                                  className="h-9 w-9 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-400 hover:text-red-600 transition-all"
                                  title="Delete post"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            ) : (
                               <div className="flex items-center gap-2">
                                  <button
                                     onClick={() => handleDelete(blog._id)}
                                     disabled={isDeleting}
                                     className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-800 underline underline-offset-4 disabled:opacity-60"
                                  >
                                     {isDeleting ? "..." : "Burn"}
                                  </button>
                                  <button onClick={() => setConfirmId(null)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">
                                     Save
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
