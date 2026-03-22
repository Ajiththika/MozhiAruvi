"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPublicBlogByIdOrSlug, deleteMyBlog, toggleSaveBlog, Blog } from "@/services/blogService";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Calendar, UserCircle, Clock, Edit2, Trash2, Loader2, BookOpen, Share2, Bookmark, BookmarkCheck, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

function readingTime(content: string) {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

const statusColors: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  draft:     "bg-slate-100 text-slate-600",
  pending:   "bg-amber-100 text-amber-700",
  rejected:  "bg-red-100 text-red-700",
};

export default function BlogDetailsPage() {
  const params  = useParams();
  const router  = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [blog, setBlog]       = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    const id = params.id as string;
    getPublicBlogByIdOrSlug(id)
      .then((b) => {
        setBlog(b);
        if (user && b.savedBy?.includes(user._id)) {
          setIsSaved(true);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id, user]);

  const canManage = user && blog && (user.role === "admin" || (blog.author as any)?._id === user._id || (blog.author as any) === user._id);

  const handleDelete = async () => {
    if (!blog) return;
    setDeleting(true);
    try {
      await deleteMyBlog(blog._id);
      router.push("/blogs");
    } catch {
      alert("Failed to delete post.");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleToggleSave = async () => {
    if (!isAuthenticated || !blog) {
      router.push("/auth/signin");
      return;
    }
    try {
      const res = await toggleSaveBlog(blog._id);
      setIsSaved(res.isSaved);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: blog?.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="h-10 w-10 animate-spin text-mozhi-primary" />
    </div>
  );

  if (!blog) return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 px-4">
        <BookOpen className="h-20 w-20 text-slate-100" />
        <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Story Hidden</h1>
        <p className="text-slate-500 max-w-md">This article may have been removed or moved to the drafts by the author.</p>
        <Link href="/blogs" className="rounded-full bg-mozhi-primary px-8 py-3 text-sm font-black text-white uppercase tracking-widest hover:scale-105 transition-all">
          Explore Others
        </Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 animate-in fade-in duration-700">
        
        {/* Navigation & Actions Top */}
        <div className="flex items-center justify-between mb-12 gap-4 flex-wrap">
          <Link href="/blogs" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-mozhi-primary transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to feed
          </Link>
          
          <div className="flex items-center gap-2">
            {/* Share */}
            <button
               onClick={handleShare}
               className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-mozhi-primary hover:border-mozhi-primary transition-all shadow-sm"
               title="Share post"
            >
               {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
            
            {/* Save */}
            <button
               onClick={handleToggleSave}
               className={cn(
                 "flex h-10 w-10 items-center justify-center rounded-full border transition-all shadow-sm",
                 isSaved 
                   ? "bg-mozhi-primary text-white border-mozhi-primary shadow-mozhi-primary/20" 
                   : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-mozhi-primary hover:border-mozhi-primary"
               )}
               title={isSaved ? "Saved" : "Save for later"}
            >
               {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>

            {/* Owner Logic */}
            {canManage && (
              <>
                <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />
                <Link
                  href={`/student/blogs/${blog._id}/edit`}
                  className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white hover:border-mozhi-primary hover:text-mozhi-primary transition-all shadow-sm"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </Link>
                {!showConfirm ? (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="flex items-center gap-2 rounded-full border border-red-100 bg-white dark:bg-slate-900 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                ) : (
                  <div className="flex items-center gap-3 rounded-full border border-red-300 bg-red-50 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-red-700">
                    <button onClick={handleDelete} disabled={deleting} className="underline hover:text-red-900 disabled:opacity-60">
                      {deleting ? "Deleting..." : "Confirm"}
                    </button>
                    <button onClick={() => setShowConfirm(false)} className="underline text-slate-400 hover:text-slate-700">Cancel</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Detailed Article Card */}
        <article className="max-w-4xl mx-auto">
          {/* Cover Header */}
          <div className="relative mb-12 rounded-[3.5rem] overflow-hidden bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 aspect-[21/9]">
            {blog.featuredImage ? (
              <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-tr from-mozhi-primary/20 via-mozhi-secondary/5 to-transparent flex items-center justify-center">
                <BookOpen className="h-24 w-24 text-mozhi-primary/10" />
              </div>
            )}
            <div className="absolute bottom-10 left-10">
               <span className="rounded-full bg-white/90 backdrop-blur px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl">
                  {blog.category || "Community Hub"}
               </span>
            </div>
          </div>

          <div className="px-4">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-8 text-slate-400 mb-8 font-black uppercase tracking-[0.2em] text-[10px]">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-mozhi-light dark:bg-mozhi-primary/10 flex items-center justify-center p-2">
                   <UserCircle className="w-full h-full text-mozhi-primary" />
                </div>
                <div>
                   <span className="block text-slate-900 dark:text-white text-xs mb-0.5">{blog.author?.name || "Member"}</span>
                   <span>Contributor</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(blog.createdAt).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{readingTime(blog.content)} min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-10 leading-[1.05] uppercase tracking-tighter">
              {blog.title}
            </h1>

            {/* Content Body */}
            <div className="prose prose-slate dark:prose-invert lg:prose-xl max-w-none text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap selection:bg-mozhi-primary selection:text-white">
              {blog.content}
            </div>
            
            {/* Bottom Actions Share */}
            <div className="mt-20 border-t border-slate-100 dark:border-slate-800 pt-10 flex flex-col items-center gap-6">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Liked this story?</p>
               <div className="flex items-center gap-4">
                 <button 
                  onClick={handleShare}
                  className="flex items-center gap-3 rounded-full bg-slate-900 dark:bg-slate-800 px-8 py-4 text-sm font-black text-white hover:bg-mozhi-primary transition-all uppercase tracking-widest shadow-xl shadow-slate-900/10"
                 >
                   <Share2 className="w-4 h-4" /> {copied ? "Copying..." : "Share Link"}
                 </button>
                 <button 
                  onClick={handleToggleSave}
                  className={cn(
                    "flex items-center gap-3 rounded-full px-8 py-4 text-sm font-black uppercase tracking-widest transition-all border-2",
                    isSaved 
                      ? "bg-white dark:bg-slate-900 border-mozhi-primary text-mozhi-primary shadow-xl shadow-mozhi-primary/10"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-mozhi-primary hover:text-mozhi-primary"
                  )}
                 >
                   {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                   {isSaved ? "Article Saved" : "Save Story"}
                 </button>
               </div>
            </div>
          </div>
        </article>

        {/* Footer Navigation */}
        <div className="mt-24 text-center border-t border-slate-100 dark:border-slate-800 pt-16">
          <Link href="/blogs" className="inline-flex items-center gap-3 text-sm font-black text-mozhi-primary hover:text-mozhi-secondary transition-all uppercase tracking-widest group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" /> Join the Conversation
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
