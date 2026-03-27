"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPublicBlogByIdOrSlug, deleteMyBlog, toggleSaveBlog, getPublicBlogs, Blog } from "@/services/blogService";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Calendar, UserCircle, Clock, Edit2, Trash2, Loader2, BookOpen, Share2, Bookmark, BookmarkCheck, ChevronRight, FileText, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

function readingTime(content: string) {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

import { hasPermission, ROLES } from "@/lib/roles";

export default function BlogDetailsPage() {
  const params  = useParams();
  const router  = useRouter();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  const [blog, setBlog]       = useState<Blog | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    const id = params.id as string;
    setLoading(true);
    getPublicBlogByIdOrSlug(id)
      .then((b) => {
        setBlog(b);
        if (user && b.savedBy?.includes(user._id)) {
          setIsSaved(true);
        }
        // Fetch related posts
        getPublicBlogs(1, 4).then(res => {
          setRelatedPosts(res.blogs.filter(p => p._id !== b._id).slice(0, 3));
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id, user]);

  const canManage = user && blog && hasPermission(user.role, [ROLES.ADMIN]) || (user && blog && ((blog.author as any)?._id === user._id || (blog.author as any) === user._id));

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
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-white">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  if (!blog) return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-white">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 px-4">
        <BookOpen className="h-20 w-20 text-slate-100" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Post not found</h1>
        <p className="text-gray-500 max-w-md">This article may have been removed or moved to drafts.</p>
        <Button href="/blogs" variant="primary">Explore others</Button>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 animate-in fade-in duration-700">
        
        {/* Navigation & Actions Top */}
        <div className="flex items-center justify-between mb-12 gap-4 flex-wrap">
          <Link href="/blogs" className="group flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-primary transition-colors tracking-tight">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to feed
          </Link>
          
          <div className="flex items-center gap-3">
            <button
               onClick={handleShare}
               className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-600 hover:text-primary transition-all shadow-sm"
               title="Share post"
            >
               {copied ? <Clock className="w-4 h-4 text-emerald-500 animate-pulse" /> : <Share2 className="w-4 h-4" />}
            </button>
            
            <button
               onClick={handleToggleSave}
               className={cn(
                 "flex h-10 w-10 items-center justify-center rounded-full border transition-all shadow-sm",
                 isSaved 
                   ? "bg-white text-white border-slate-900" 
                   : "bg-white border-gray-100 text-gray-600 hover:text-primary"
               )}
            >
               {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>

            {canManage && (
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-100">
                <Link
                  href={`/student/blogs/${blog._id}/edit`}
                  className="flex items-center gap-2 rounded-full border border-gray-100 px-5 py-2.5 text-xs font-bold text-gray-700 hover:border-primary hover:text-primary transition-all shadow-sm"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </Link>
                {!showConfirm ? (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-5 py-2.5 text-xs font-bold text-red-500 hover:bg-red-100 transition-all shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                ) : (
                  <div className="flex items-center gap-3 rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-xs font-bold text-red-700">
                    <button onClick={handleDelete} disabled={deleting} className="font-bold underline">Confirm</button>
                    <button onClick={() => setShowConfirm(false)} className="text-gray-400">Cancel</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <article className="max-w-4xl mx-auto mb-20">
          <header className="mb-12 space-y-8">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-4 py-1.5 text-[11px] font-bold text-primary tracking-tight">
                {blog.category || "Community Hub"}
              </span>
              <span className="text-[11px] font-bold text-gray-400 tracking-tight flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {readingTime(blog.content)} min read
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 leading-[1.1] tracking-tight">
              {blog.title}
            </h1>

            <div className="flex items-center gap-4 py-6 border-y border-gray-100">
              <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm">
                <UserCircle className="w-7 h-7 text-gray-300" />
              </div>
              <div>
                 <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">{blog.author?.name || "Member"}</span>
                    {blog.author?.role === 'admin' && (
                      <span className="text-[10px] font-bold text-primary border border-primary/20 bg-primary/5 px-2 py-0.5 rounded-md">Admin</span>
                    )}
                 </div>
                 <span className="text-xs text-gray-500 font-medium">Published on {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
          </header>

          <div className="relative mb-14 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 aspect-[21/9] shadow-2xl shadow-slate-200/20">
            {blog.featuredImage ? (
              <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                <BookOpen className="h-20 w-20 text-primary/10" />
              </div>
            )}
          </div>

          <div className="prose prose-slate lg:prose-xl max-w-none text-gray-700 leading-relaxed font-medium whitespace-pre-wrap selection:bg-primary/20">
            {blog.content}
          </div>
          
          <div className="mt-20 border-t border-gray-100 pt-16">
             <div className="bg-gray-50 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-gray-100">
                 <div className="space-y-4 text-center md:text-left">
                   <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Enjoyed the story?</h3>
                   <p className="text-gray-500 text-sm font-medium">Capture your own Tamil expertise and share it with our growing community.</p>
                 </div>
                 <div className="flex items-center gap-4 shrink-0 flex-col sm:flex-row">
                   <Button onClick={handleShare} variant="secondary" size="lg" className="rounded-2xl px-8 border-gray-100 dark:border-gray-800">
                     <Share2 className="w-4 h-4 mr-2" /> Share Link
                   </Button>
                   {(hasPermission(user?.role, [ROLES.ADMIN, ROLES.TEACHER]) || !user) && (
                     <Button href="/student/blogs/create" variant="primary" size="lg" className="rounded-2xl px-12 shadow-xl shadow-primary/20">
                        <Plus className="w-4 h-4 mr-2" /> Start Writing
                     </Button>
                   )}
                 </div>
             </div>
          </div>
        </article>

        {/* Recommended Stories */}
        {relatedPosts.length > 0 && (
          <div className="mt-24 pt-20 border-t border-gray-100">
            <div className="flex items-center justify-between mb-12">
               <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Recommended Stories</h2>
               <Link href="/blogs" className="text-sm font-bold text-primary hover:text-primary/80 transition-all flex items-center gap-1 group">
                  View all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {relatedPosts.map(post => (
                 <Link key={post._id} href={`/blogs/${post.slug || post._id}`} className="group space-y-4">
                    <div className="aspect-[1.6/1] rounded-3xl overflow-hidden bg-gray-50 border border-gray-100">
                       {post.featuredImage ? (
                         <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/20">
                           <FileText className="w-10 h-10" />
                         </div>
                       )}
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-lg font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-primary transition-colors tracking-tight">
                        {post.title}
                       </h4>
                       <span className="text-xs text-gray-500 font-medium">By {post.author?.name || "Member"}</span>
                    </div>
                 </Link>
               ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
