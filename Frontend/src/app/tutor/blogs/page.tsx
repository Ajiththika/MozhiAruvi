"use client";

import React, { useEffect, useState } from "react";
import { getMyBlogs, deleteMyBlog, Blog } from "@/services/blogService";
import { Plus, Trash2, Edit2, Loader2, BookOpen, AlertCircle, Search, Filter } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

const statusConfig: Record<string, { label: string; className: string }> = {
  published: { label: "Published", className: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  draft:     { label: "Draft",     className: "bg-orange-50 text-orange-600 border-orange-100" },
  pending:   { label: "Pending",   className: "bg-amber-50 text-amber-600 border-amber-100" },
  rejected:  { label: "Rejected",  className: "bg-red-50 text-red-600 border-red-100" },
};

export default function TutorBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await getMyBlogs();
      setBlogs(data);
    } catch (err) {
      setError("Failed to load your heritage repository.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this story from your archives?")) return;
    try {
      await deleteMyBlog(id);
      setBlogs((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      alert("Transformation removal failed.");
    }
  };

  const filtered = blogs.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto py-10">
      {/* Header Section */}
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-10 pb-12 border-b border-border">
        <div className="space-y-6">
           <div className="flex items-center gap-3">
              <div className="h-0.5 w-8 bg-primary/40 rounded-full" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Portfolio Management</span>
           </div>
           <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Creative Archives</h1>
           <p className="text-slate-400 font-bold max-w-lg tracking-tight">Manage your contributions to the community library and track your thought leadership.</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative group hidden lg:block">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your vault..."
              className="w-80 h-14 rounded-2xl border border-border bg-white px-12 text-sm font-bold text-slate-800 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/5 placeholder:text-slate-300"
            />
          </div>
          <Button
            href="/blogs/write"
            variant="primary"
            size="xl"
            className="rounded-[2rem] shadow-2xl shadow-primary/20 h-16 px-10 font-black uppercase text-[10px] tracking-widest"
          >
            <Plus className="w-4 h-4 mr-3" /> Write
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-10 flex items-center gap-5 rounded-3xl border border-red-100 bg-red-50 p-6 text-sm font-bold text-red-700">
          <AlertCircle className="h-6 w-6 shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Opening vault...</p>
        </div>
      ) : null}

      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-border p-24 text-center space-y-8 shadow-sm">
          <div className="h-24 w-24 bg-surface-soft rounded-full flex items-center justify-center mx-auto">
             <BookOpen className="h-10 w-10 text-slate-200" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Your repository is empty</h3>
            <p className="text-slate-400 font-bold max-w-xs mx-auto">Start sharing your linguistic expertise and heritage stories today.</p>
          </div>
          <Button href="/student/blogs/create" variant="secondary" className="rounded-2xl px-12 font-black">Begin Writing</Button>
        </div>
      )}

      {/* Grid of Blogs */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
          {filtered.map((blog) => {
            const sc = statusConfig[blog.status] ?? statusConfig.draft;
            return (
              <div key={blog._id} className="group relative flex flex-col h-full bg-white rounded-2xl border border-border overflow-hidden transition-all hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
                <div className="aspect-[1.5/1] w-full bg-surface-soft relative overflow-hidden">
                  {blog.featuredImage ? (
                    <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000" />
                  ) : (
                    <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-primary/5" />
                    </div>
                  )}
                  <div className="absolute top-6 left-6">
                    <span className={cn("inline-flex items-center rounded-xl px-4 py-1.5 text-[8px] font-black uppercase tracking-widest border shadow-sm backdrop-blur-md", sc.className)}>
                      {sc.label}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-10 space-y-6">
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{blog.category || "General"}</span>
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight tracking-tighter">
                    {blog.title}
                  </h3>
                  <p className="text-slate-400 text-sm font-bold line-clamp-2 tracking-tight leading-relaxed flex-1">
                    {blog.excerpt || "No summary provided for this archive entry."}
                  </p>

                  <div className="flex items-center justify-between pt-8 border-t border-border mt-auto">
                    <div className="flex items-center gap-6">
                      <Link
                        href={`/tutor/blogs/${blog._id}/edit`}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-secondary transition-all"
                      >
                        <Edit2 className="w-4 h-4" /> Config
                      </Link>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="text-slate-200 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Link
                      href={`/blogs/${blog.slug || blog._id}`}
                      target="_blank"
                      className="h-10 w-10 rounded-full bg-surface-soft border border-border flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4 rotate-45" />
                    </Link>
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



