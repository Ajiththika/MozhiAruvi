"use client";

import React, { useEffect, useState } from "react";
import { getMyBlogById, updateMyBlog, Blog } from "@/services/blogService";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Save, Send, BookOpen, UserCircle, LayoutGrid, Image as ImageIcon, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Button from "@/components/common/Button";

const CATEGORIES = ["Grammar", "Culture", "Pronunciation", "Tutor Tips", "Updates", "General"];

const labelCls = "text-xs font-bold text-gray-400 tracking-tight ml-2 mb-2 block";
const inputCls = "w-full rounded-2xl border border-gray-100  bg-gray-50 px-6 py-4 text-sm font-medium text-gray-800 dark:text-white placeholder:text-gray-300 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all shadow-sm";

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [form, setForm] = useState({
    title: "", content: "", excerpt: "", category: "General", featuredImage: "",
  });

  useEffect(() => {
    const id = params.id as string;
    getMyBlogById(id)
      .then((blog) => {
        setForm({
          title: blog.title,
          content: blog.content,
          excerpt: blog.excerpt || "",
          category: blog.category || "General",
          featuredImage: blog.featuredImage || "",
        });
      })
      .catch(() => setBanner({ type: "error", message: "Failed to load story for editing." }))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!form.title.trim() || !form.content.trim()) {
      setBanner({ type: "error", message: "Title and Content are required to preserve your story." });
      return;
    }
    setSubmitting(true);
    setBanner(null);
    try {
      const blog = await updateMyBlog(params.id as string, { ...form, status: isDraft ? "draft" : "published" });
      setBanner({ type: "success", message: isDraft ? "Story preserved as draft." : "Updates published to the feed!" });
      setTimeout(() => {
        if (isDraft) router.push("/student/blogs");
        else router.push(`/blogs/${blog.slug || blog._id}`);
      }, 1500);
    } catch (err: any) {
      setBanner({ type: "error", message: err?.response?.data?.message || "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-white">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 max-w-6xl mx-auto py-10">
      <Link href="/student/blogs" className="group mb-12 inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-primary transition-colors tracking-tight">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to studio
      </Link>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Editor Form */}
        <div className="flex-1 space-y-10">
           <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <Sparkles className="w-5 h-5 text-primary" />
                 <span className="text-xs font-bold text-primary tracking-tight">Refining Mode</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white tracking-tight leading-none">
                Refine your <span className="text-primary italic">story</span>
              </h1>
              <p className="text-gray-500 font-medium max-w-lg leading-relaxed">Fine-tune your cultural insights. Quality content drives deeper community engagement.</p>
           </div>

           {/* Banner Feedback */}
           {banner && (
            <div className={`flex items-start gap-4 rounded-3xl border px-6 py-5 text-sm font-bold shadow-xl animate-in slide-in-from-top-4 ${
              banner.type === "success"
                ? "border-emerald-100 bg-emerald-50 text-emerald-700 shadow-emerald-500/5"
                : "border-red-100 bg-red-50 text-red-700 shadow-red-500/5"
            }`}>
              {banner.type === "success" ? <CheckCircle2 className="h-6 w-6 shrink-0 mt-0.5" /> : <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />}
              {banner.message}
            </div>
           )}

           <div className="bg-white rounded-[3rem] border border-gray-100  p-8 md:p-14 shadow-2xl shadow-slate-200/20 dark:shadow-none space-y-10">
              {/* Title Section */}
              <div className="space-y-4">
                 <input 
                  type="text" 
                  name="title" 
                  required 
                  value={form.title} 
                  onChange={handleChange} 
                  className="w-full bg-transparent border-none text-3xl md:text-5xl font-bold text-gray-800 dark:text-white placeholder:text-slate-100 focus:ring-0 px-0 outline-none tracking-tight leading-tight" 
                  placeholder="The title of your story..." 
                 />
                 <div className="h-[1px] w-full bg-gray-50 dark:bg-gray-800" />
              </div>

              {/* Sub-meta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <label className={labelCls}>Topic Category</label>
                   <div className="relative">
                      <LayoutGrid className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-40" />
                      <select name="category" value={form.category} onChange={handleChange} className={cn(inputCls, "pl-14 appearance-none")}>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                </div>
                <div>
                   <label className={labelCls}>Featured Cover Image</label>
                   <div className="relative">
                      <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-40" />
                      <input type="url" name="featuredImage" value={form.featuredImage} onChange={handleChange} className={cn(inputCls, "pl-14")} placeholder="https://unsplash.com/..." />
                   </div>
                </div>
              </div>

              {/* Summary / Excerpt */}
              <div>
                 <label className={labelCls}>Article Preview (Excerpt)</label>
                 <textarea name="excerpt" rows={2} value={form.excerpt} onChange={handleChange} className={cn(inputCls, "resize-none h-24")} placeholder="Briefly describe what your readers can expect..." />
              </div>

              {/* Main Content Body */}
              <div className="pt-6 space-y-4">
                 <div className="flex items-center justify-between px-2">
                      <label className={labelCls}>Body Content</label>
                      <span className="text-[10px] font-bold text-primary border border-primary/20 bg-primary/5 px-2 py-0.5 rounded-md">{wordCount} Words</span>
                 </div>
                 <textarea name="content" required rows={16} value={form.content} onChange={handleChange} className={cn(inputCls, "resize-none text-base md:text-lg leading-relaxed font-medium bg-white border-gray-100  h-[30rem]")} placeholder="Start sharing your knowledge..." />
              </div>
           </div>
        </div>

        {/* Action Sidebar / Settings */}
        <div className="w-full lg:w-80 shrink-0">
           <div className="sticky top-10 space-y-8">
              <div className="bg-white rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-900/10">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-8 px-2">Update story</p>
                 <div className="flex flex-col gap-5">
                    <Button
                      onClick={() => handleSubmit(false)}
                      disabled={submitting}
                      className="w-full h-16 rounded-2xl bg-primary text-white hover:scale-[1.02] shadow-xl shadow-primary/20 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Send className="w-5 h-5 mr-3" />}
                      Push Updates
                    </Button>
                    <button
                      onClick={() => handleSubmit(true)}
                      disabled={submitting}
                      className="w-full h-16 flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 text-sm font-bold text-white hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                      <Save className="w-5 h-5 mr-1" /> Move to Draft
                    </button>
                 </div>
                 
                 <div className="mt-12 pt-10 border-t border-white/5 space-y-8">
                    <div className="flex items-center gap-4 group">
                       <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 transition-colors group-hover:bg-primary/20">
                          <UserCircle className="w-6 h-6 text-primary" />
                       </div>
                       <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">Author</p>
                          <p className="text-xs font-bold text-white">Community Member</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                       <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 transition-colors group-hover:bg-primary/20">
                          <BookOpen className="w-6 h-6 text-primary" />
                       </div>
                       <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">Visibility</p>
                          <p className="text-xs font-bold text-white">Public Revision</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Revision Sidebar */}
              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-[3rem] p-10">
                 <h4 className="flex items-center gap-2 text-xs font-bold text-primary mb-6 tracking-tight">
                    <FileText className="w-4 h-4" /> Editing Policy
                 </h4>
                 <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    Changes made to published stories will go live immediately after submission. Please ensure accuracy before pushing.
                 </p>
                 <div className="flex items-center gap-2 text-gray-400">
                    <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                       <div className="h-full w-full bg-primary animate-pulse" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
