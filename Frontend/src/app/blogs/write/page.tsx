"use client";

import React, { useState, useRef } from "react";
import { createBlog } from "@/services/blogService";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Save, Send, UserCircle, Image as ImageIcon, Sparkles, Upload, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import { ImageAdjuster } from "@/components/ui/ImageAdjuster";
import { EditorToolbar, useMozhiEditor } from "@/components/ui/RichTextEditor";
import { EditorContent } from "@tiptap/react";

const CATEGORIES = ["Grammar", "Culture", "Pronunciation", "Tutor Tips", "Updates", "General"];

export default function CreateBlogPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [adjustImage, setAdjustImage] = useState<string | null>(null);
  
  // Protect page: Only Admins and Teachers can write blogs
  React.useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(`/auth/signin?redirect=${encodeURIComponent("/blogs/write")}`);
      } else if (user.role !== 'admin' && user.role !== 'teacher') {
        // Redirect students or unauthorized roles back to feed
        router.push("/blogs");
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAdjustImage(URL.createObjectURL(file));
    }
  };

  const handleAdjustConfirm = async (croppedBlob: Blob) => {
    const file = new File([croppedBlob], "blog_cover.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    setBanner(null);
    setAdjustImage(null);
    try {
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(prev => ({ ...prev, featuredImage: res.data.url }));
    } catch (err: any) {
      setBanner({ type: "error", message: "Image transmission failed. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!form.title.trim() || !form.content.trim()) {
      setBanner({ type: "error", message: "Title and Content are required to preserve your story." });
      return;
    }
    setSubmitting(true);
    setBanner(null);
    try {
      const blog = await createBlog({ ...form, status: isDraft ? "draft" : "published" });
      const roleText = user?.role === 'teacher' && !isDraft ? "Story submitted for architectural review." : (isDraft ? "Story preserved as draft." : "Story published to the community!");
      setBanner({ type: "success", message: roleText });
      setTimeout(() => {
        if (isDraft) router.push("/blogs");
        else if (user?.role === 'teacher') router.push("/blogs"); // Tutors go to feed while pending
        else router.push(`/blogs/${blog.slug || blog._id}`);
      }, 1500);
    } catch (err: any) {
      setBanner({ type: "error", message: err?.response?.data?.message || "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const editor = useMozhiEditor({
    value: form.content,
    onChange: (html) => setForm((prev) => ({ ...prev, content: html })),
    placeholder: "Start sharing your linguistic journey..."
  });

  return (
    <div className="min-h-screen bg-surface-soft selection:bg-primary/10">
      {/* Premium Sticky Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-border h-20 px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-10">
             <Link href="/blogs" className="group flex items-center gap-2 text-primary/60 hover:text-primary transition-all font-black uppercase text-[10px] tracking-widest">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Feed
             </Link>
             <Link href="/" className="flex items-center gap-2 group">
               <span className="text-xl md:text-2xl font-black text-primary tracking-tighter">
                 Mozhi<span className="text-primary">Aruvi</span>
               </span>
             </Link>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
               <div className="hidden text-right md:block">
                  <h4 className="text-xs font-black text-text-primary truncate">{user?.name}</h4>
                  <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest leading-none mt-1">
                    {pathname.startsWith('/admin') ? 'Admin' : pathname.startsWith('/tutor') ? 'Teacher' : 'Student'}
                  </p>
               </div>
               <div className="h-10 w-10 rounded-full bg-surface-soft border border-border overflow-hidden ml-2">
                 {user?.profilePhoto ? (
                   <img src={user.profilePhoto} alt="User" className="h-full w-full object-cover" />
                 ) : (
                   <div className="h-full w-full flex items-center justify-center bg-primary/5">
                      <UserCircle className="h-6 w-6 text-primary/30" />
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Editorial Canvas */}
      <main className="pt-40 pb-32 max-w-[850px] mx-auto px-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {banner && (
          <div className={`mb-16 flex items-start gap-5 rounded-3xl border p-8 text-sm font-bold shadow-xl animate-in slide-in-from-top-4 ${
            banner.type === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700 shadow-emerald-500/5"
              : "border-red-100 bg-red-50 text-red-700 shadow-red-500/5"
          }`}>
            {banner.type === "success" ? <CheckCircle2 className="h-6 w-6 shrink-0 mt-0.5" /> : <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />}
            {banner.message}
          </div>
        )}

        <div className="pl-20">
            {/* Sidebar Fixed Toolbar (Rendered outside the flow) */}
            <EditorToolbar editor={editor} />

            {/* Main Editorial Canvas */}
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Title - Architectural Typography */}
                <div className="space-y-6 pt-6">
                    <textarea
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      rows={1}
                      placeholder="Title of your story..."
                      className="w-full text-4xl md:text-7xl font-black text-text-primary placeholder:text-primary/10 border-none outline-none resize-none px-1 overflow-hidden h-auto tracking-tighter leading-[0.9]"
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height = target.scrollHeight + "px";
                      }}
                    />

                    {/* Excerpt - Refined Context */}
                    <textarea
                      name="excerpt"
                      value={form.excerpt}
                      onChange={handleChange}
                      rows={1}
                      placeholder="A brief preview for your audience..."
                      className="w-full text-2xl font-bold text-text-secondary placeholder:text-primary/10 border-none outline-none resize-none px-1 h-auto leading-relaxed tracking-tight"
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height = target.scrollHeight + "px";
                      }}
                    />
                </div>

              {/* Enhanced Media Upload Orchestrator */}
              <div className="relative group rounded-[3rem] border border-dashed border-primary/10 p-2 transition-all focus-within:border-primary/40 focus-within:ring-8 focus-within:ring-primary/5 bg-white/30">
                {form.featuredImage ? (
                  <div className="relative aspect-[21/9] w-full rounded-[2.8rem] overflow-hidden group shadow-sm bg-surface-soft">
                     <img src={form.featuredImage} alt="Cover Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                     <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                        <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-white rounded-full text-primary shadow-xl hover:scale-110 transition-transform"><Upload size={20} /></button>
                        <button onClick={() => setForm(p => ({ ...p, featuredImage: "" }))} className="p-4 bg-white rounded-full text-red-500 shadow-xl hover:scale-110 transition-transform"><X size={20} /></button>
                     </div>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex flex-col items-center justify-center w-full aspect-[21/9] rounded-[2.8rem] bg-white hover:bg-surface-soft transition-all space-y-4 group">
                     <div className="p-5 rounded-full bg-surface-soft group-hover:bg-white border border-border transition-all">
                        {uploading ? <Loader2 size={24} className="animate-spin text-primary" /> : <Upload size={24} className="text-primary/60 group-hover:text-primary transition-colors" />}
                     </div>
                     <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Upload Visual Cover</p>
                        <p className="text-[9px] font-bold text-primary/60 mt-1 uppercase tracking-widest">Landscape recommended (Base 2:1)</p>
                     </div>
                  </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>

              <div className="flex flex-col space-y-20">
                {/* CONTENT AREA — NOW UNDER COVER IMAGE */}
                <div className="min-h-[300px]">
                    <EditorContent editor={editor} />
                </div>

                {/* Actions Area */}
                <div className="flex items-center gap-6 pt-12 border-t border-border">
                   <button
                      onClick={() => handleSubmit(true)}
                      disabled={submitting || uploading}
                      className="h-16 px-10 rounded-[2rem] text-[11px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-30 border border-primary/20"
                   >
                      Save as Draft
                   </button>
                   <Button
                    onClick={() => handleSubmit(false)}
                    disabled={submitting || uploading}
                    className="h-16 px-16 rounded-[2rem] bg-primary hover:bg-primary/90 text-white text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-4"
                   >
                     {submitting && <Loader2 size={16} className="animate-spin" />}
                     {user?.role === 'teacher' ? 'Submit for Review' : 'Publish Story'}
                   </Button>
                </div>
              </div>
            </div>
        </div>
      </main>
      {adjustImage && (
        <ImageAdjuster 
          image={adjustImage} 
          aspect={21 / 9} 
          onConfirm={handleAdjustConfirm} 
          onCancel={() => setAdjustImage(null)} 
        />
      )}
    </div>
  );
}















