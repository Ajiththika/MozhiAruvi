"use client";

import React, { useState } from "react";
import { createBlog } from "@/services/blogService";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Save, Send, BookOpen, UserCircle, LayoutGrid, Image as ImageIcon, FileText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Grammar", "Culture", "Pronunciation", "Tutor Tips", "Updates", "General"];

const inputCls = "w-full rounded-[1.5rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6 py-4 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-mozhi-primary/20 outline-none transition-all shadow-sm";

export default function CreateBlogPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [form, setForm] = useState({
    title: "", content: "", excerpt: "", category: "General", featuredImage: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!form.title.trim() || !form.content.trim()) {
      setBanner({ type: "error", message: "Title and Content are required to continue." });
      return;
    }
    setSubmitting(true);
    setBanner(null);
    try {
      const blog = await createBlog({ ...form, status: isDraft ? "draft" : "published" });
      setBanner({ type: "success", message: isDraft ? "Story saved as draft." : "Story published to the world!" });
      setTimeout(() => {
        if (isDraft) router.push("/blogs");
        else router.push(`/blogs/${blog.slug || blog._id}`);
      }, 1500);
    } catch (err: any) {
      setBanner({ type: "error", message: err?.response?.data?.message || "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;

  return (
    <div className="animate-in fade-in duration-700 max-w-5xl mx-auto py-10">
      <Link href="/student/blogs" className="group mb-12 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-mozhi-primary transition-colors">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to library
      </Link>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Editor Form */}
        <div className="flex-1 space-y-8">
           <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 leading-none">
                Write a <span className="text-mozhi-primary">Story</span>
              </h1>
              <p className="text-slate-500 font-medium">Capture your Tamil heritage and insights in high-end typography.</p>
           </div>

           {/* Banner Feedback */}
           {banner && (
            <div className={`mb-10 flex items-start gap-4 rounded-[2rem] border px-6 py-4 text-sm font-bold shadow-xl animate-in slide-in-from-top-4 ${
              banner.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400"
                : "border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400"
            }`}>
              {banner.type === "success" ? <CheckCircle2 className="h-6 w-6 shrink-0 mt-0.5" /> : <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />}
              {banner.message}
            </div>
           )}

           <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-8 md:p-12 shadow-2xl shadow-slate-200/20 dark:shadow-none space-y-8">
              {/* Title Section */}
              <div className="space-y-4">
                 <input 
                  type="text" 
                  name="title" 
                  required 
                  value={form.title} 
                  onChange={handleChange} 
                  className="w-full bg-transparent border-none text-3xl md:text-4xl font-black text-slate-900 dark:text-white placeholder:text-slate-200 focus:ring-0 px-0 outline-none uppercase tracking-tighter leading-tight" 
                  placeholder="Article Title..." 
                 />
                 <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800" />
              </div>

              {/* Sub-meta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Topic Category</label>
                   <div className="relative">
                      <LayoutGrid className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-mozhi-primary" />
                      <select name="category" value={form.category} onChange={handleChange} className={cn(inputCls, "pl-14 appearance-none")}>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Cover URL</label>
                   <div className="relative">
                      <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-mozhi-primary" />
                      <input type="url" name="featuredImage" value={form.featuredImage} onChange={handleChange} className={cn(inputCls, "pl-14")} placeholder="https://..." />
                   </div>
                </div>
              </div>

              {/* Summary / Excerpt */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Quick Excerpt</label>
                 <textarea name="excerpt" rows={2} value={form.excerpt} onChange={handleChange} className={cn(inputCls, "resize-none")} placeholder="A short hook for the feed..." />
              </div>

              {/* Main Content Body */}
              <div className="space-y-4 pt-4">
                 <div className="flex items-center justify-between px-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Main Content</span>
                     <span className="text-[10px] font-black uppercase tracking-widest text-mozhi-primary">{wordCount} Words</span>
                 </div>
                 <textarea name="content" required rows={18} value={form.content} onChange={handleChange} className={cn(inputCls, "resize-none text-base md:text-lg leading-relaxed font-medium bg-transparent border-slate-100")} placeholder="Tell your story..." />
              </div>
           </div>
        </div>

        {/* Action Sidebar / Settings */}
        <div className="w-full lg:w-80 space-y-6">
           <div className="sticky top-10 space-y-6">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Article Status</p>
                 <div className="flex flex-col gap-4">
                    <button
                      onClick={() => handleSubmit(false)}
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-3 rounded-full bg-mozhi-primary px-6 py-5 text-sm font-black text-white hover:scale-[1.03] transition-all uppercase tracking-widest shadow-xl shadow-mozhi-primary/20 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Publish Feed
                    </button>
                    <button
                      onClick={() => handleSubmit(true)}
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-3 rounded-full bg-white/5 border border-white/10 px-6 py-5 text-sm font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" /> Save Draft
                    </button>
                 </div>
                 
                 <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center shadow-inner">
                          <UserCircle className="w-5 h-5 text-mozhi-primary" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Author</p>
                          <p className="text-xs font-bold">Authenticated User</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center shadow-inner">
                          <BookOpen className="w-5 h-5 text-mozhi-primary" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visibility</p>
                          <p className="text-xs font-bold">Standard Public</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Writing Tips */}
              <div className="bg-mozhi-light/10 border border-mozhi-light/20 rounded-[2.5rem] p-8">
                 <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-mozhi-primary mb-4">
                    <FileText className="w-4 h-4" /> Writing Tips
                 </h4>
                 <ul className="text-xs space-y-4 text-slate-600 font-medium">
                    <li className="flex gap-2">
                       <span className="text-mozhi-primary">•</span> 
                       Use bold headers for Tamil words.
                    </li>
                    <li className="flex gap-2">
                       <span className="text-mozhi-primary">•</span> 
                       Add a high-quality cover photo to boost read rates.
                    </li>
                    <li className="flex gap-2">
                       <span className="text-mozhi-primary">•</span> 
                       Keep your excerpts punchy and engaging.
                    </li>
                 </ul>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
