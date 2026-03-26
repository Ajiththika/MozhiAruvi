"use client";

import React, { useState } from "react";
import { createBlog } from "@/services/blogService";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Save, Send, UserCircle, Image as ImageIcon, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

const CATEGORIES = ["Grammar", "Culture", "Pronunciation", "Tutor Tips", "Updates", "General"];

import { hasPermission, ROLES } from "@/lib/roles";

export default function CreateBlogPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  
  // Protect page
  React.useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(`/auth/signin?redirect=${encodeURIComponent("/blogs/create")}`);
      } else if (!hasPermission(user.role, [ROLES.ADMIN, ROLES.TEACHER])) {
        // Redirect to a dashboard or access denied
        router.push("/auth/signin"); 
      }
    }
  }, [user, isLoading, router]);

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

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar - Medium Style */}
      <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-50 h-16">
        <div className="max-w-[1000px] mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link href="/blogs" className="text-gray-400 hover:text-gray-800 transition-colors">
                <ArrowLeft size={20} />
             </Link>
             <Link href="/" className="text-xl font-bold text-gray-800">
                Mozhi<span className="text-primary italic">Aruvi</span>
             </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="text-gray-400 hover:text-gray-800 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              Draft
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="px-5 py-1.5 rounded-full bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Publish
            </button>
            
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-100 overflow-hidden ml-2">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="User" className="h-full w-full object-cover" />
              ) : (
                <UserCircle className="h-5 w-5 text-gray-300" />
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 max-w-[700px] mx-auto px-6 animate-in fade-in duration-1000">
        
        {banner && (
          <div className={`mb-12 flex items-start gap-4 rounded-2xl border px-6 py-4 text-sm font-bold animate-in slide-in-from-top-4 ${
            banner.type === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700 shadow-sm"
              : "border-red-100 bg-red-50 text-red-700 shadow-sm"
          }`}>
            {banner.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
            {banner.message}
          </div>
        )}

        <div className="space-y-8">
          {/* Featured Image Link */}
          <div className="flex items-center gap-2 px-1">
             <ImageIcon size={16} className="text-gray-300" />
             <input
               type="url"
               name="featuredImage"
               value={form.featuredImage}
               onChange={handleChange}
               placeholder="Link to featured image..."
               className="w-full text-xs font-semibold text-gray-400 focus:text-gray-600 outline-none placeholder:text-gray-200 bg-transparent"
             />
          </div>

          {/* Category Selector - Subtle */}
          <div className="flex items-center gap-2 px-1">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</span>
             <select 
               name="category" 
               value={form.category} 
               onChange={handleChange} 
               className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded cursor-pointer outline-none hover:bg-primary/10 transition-colors appearance-none"
             >
               {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>

          {/* Title - Large font, no borders */}
          <textarea
            name="title"
            value={form.title}
            onChange={handleChange}
            rows={1}
            placeholder="Title"
            className="w-full text-4xl md:text-5xl font-bold text-gray-800 placeholder:text-gray-100 border-none outline-none resize-none px-1 overflow-hidden h-auto"
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = target.scrollHeight + "px";
            }}
          />

          {/* Excerpt - Secondary typography */}
          <textarea
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            rows={1}
            placeholder="Article preview..."
            className="w-full text-xl font-medium text-gray-400 placeholder:text-gray-100 border-none outline-none resize-none px-1 h-auto"
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = target.scrollHeight + "px";
            }}
          />

          {/* Divider */}
          <div className="h-[1px] w-12 bg-gray-50 my-6" />

          {/* Content Body - Clean typing experience */}
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows={15}
            placeholder="Tell your story..."
            className="w-full text-lg md:text-xl leading-[1.8] text-gray-700 placeholder:text-gray-100 border-none outline-none resize-none px-1 font-serif min-h-[500px]"
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = target.scrollHeight + "px";
            }}
          />
        </div>

        {/* Floating Sidebar Help - Only for large screens */}
        <div className="hidden xl:block fixed right-10 top-32 w-56 text-[11px] font-bold text-gray-300 space-y-6">
           <div className="p-6 border-l border-gray-50 space-y-4">
              <Sparkles size={14} className="text-secondary" />
              <p className="leading-relaxed">Sharing your journey helps others learn Tamil in context. Focus on clarity and cultural debt.</p>
           </div>
           <div className="p-6 border-l border-gray-50 space-y-2">
              <p className="uppercase tracking-widest text-[9px] text-gray-200">Stats</p>
              <p>{form.content.trim() ? form.content.trim().split(/\s+/).length : 0} Words</p>
              <p>{Math.ceil((form.content.trim() ? form.content.trim().split(/\s+/).length : 0) / 200)} min read</p>
           </div>
        </div>
      </main>
    </div>
  );
}

