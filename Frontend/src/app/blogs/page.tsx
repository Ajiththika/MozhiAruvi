"use client";

import React, { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Calendar, ArrowRight, UserCircle, Loader2, BookOpen, Plus, BookmarkCheck, LayoutGrid, FileText, Trash2, Edit2, Share2, Check } from "lucide-react";
import Link from "next/link";
import { getPublicBlogs, getSavedBlogs, getMyBlogs, deleteMyBlog, Blog } from "@/services/blogService";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

type ViewTab = "all" | "saved" | "drafts";

import { Pagination } from "@/components/Pagination";

export default function BlogsPage() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Blog[]>([]);
  const [savedPosts, setSavedPosts] = useState<Blog[]>([]);
  const [myDrafts, setMyDrafts]     = useState<Blog[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ViewTab>("all");
  const [copiedId, setCopiedId]   = useState<string | null>(null);

  // Pagination (only for main feed)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);

  const fetchContent = (page: number = 1) => {
    setLoading(true);
    const promises = [
      getPublicBlogs(page).then(res => {
        setPosts(res.blogs);
        setTotalPages(res.totalPages);
        setTotalBlogs(res.totalBlogs);
        setCurrentPage(res.currentPage);
      })
    ];
    if (isAuthenticated) {
      promises.push(getSavedBlogs().then(setSavedPosts));
      promises.push(getMyBlogs().then(blogs => setMyDrafts(blogs.filter(b => b.status === 'draft'))));
    }
    Promise.all(promises)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchContent(currentPage);
  }, [isAuthenticated, currentPage]);

  const displayPosts = useMemo(() => {
    if (activeTab === "all") return posts;
    if (activeTab === "saved") return savedPosts;
    return myDrafts;
  }, [activeTab, posts, savedPosts, myDrafts]);

  const filtered = useMemo(() => {
    return displayPosts.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.author?.name?.toLowerCase().includes(q);
      return matchesSearch;
    });
  }, [displayPosts, search]);

  const handleShare = (e: React.MouseEvent, post: Blog) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/blogs/${post.slug || post._id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(post._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this story? This action cannot be undone.")) return;
    try {
      await deleteMyBlog(id);
      fetchContent();
    } catch (err) {
      alert("Failed to delete post.");
    }
  };

  const featured = activeTab === "all" && !search ? filtered[0] : null;
  const rest = featured ? filtered.slice(1) : filtered;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 animate-in fade-in duration-500">

        {/* Hero Section - Medium Style */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 border-b border-slate-100 dark:border-slate-800 pb-16">
          <div className="text-left max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-6 uppercase leading-none">
              Mozhi <span className="text-mozhi-primary">Daily</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-bold">
              A place to read, write, and deepen your connection with Tamil culture.
            </p>
          </div>

          {isAuthenticated && (
             <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
               <Link
                href="/student/blogs/create"
                className="group w-full sm:w-auto flex items-center justify-center gap-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-5 text-sm font-black shadow-2xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest"
              >
                <Plus className="w-5 h-5" />
                Start Writing
              </Link>
             </div>
          )}
        </section>

        {/* Management & Discovery Bar */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "whitespace-nowrap rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all",
                activeTab === "all"
                  ? "bg-mozhi-primary text-white shadow-lg shadow-mozhi-primary/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              Feed
            </button>
            {isAuthenticated && (
              <>
                <button
                  onClick={() => setActiveTab("saved")}
                  className={cn(
                    "whitespace-nowrap rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all",
                    activeTab === "saved"
                      ? "bg-mozhi-primary text-white shadow-lg shadow-mozhi-primary/20"
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  Saved
                </button>
                <button
                  onClick={() => setActiveTab("drafts")}
                  className={cn(
                    "whitespace-nowrap rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all relative",
                    activeTab === "drafts"
                      ? "bg-mozhi-primary text-white shadow-lg shadow-mozhi-primary/20"
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  My Drafts
                  {myDrafts.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-mozhi-secondary text-[8px] text-white animate-pulse">
                      {myDrafts.length}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>

          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter stories..."
              className="w-full rounded-full border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-3 pl-11 pr-4 text-xs font-bold text-slate-900 dark:text-white outline-none transition focus:ring-2 focus:ring-mozhi-primary/20"
            />
          </div>
        </section>

        {/* Content Area */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-mozhi-primary" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waking up the ink...</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-6 animate-in slide-in-from-bottom-4 duration-700">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center shadow-inner">
                <BookOpen className="h-10 w-10 text-slate-200" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                {activeTab === "drafts" ? "No unfinished stories" : activeTab === "saved" ? "Nothing bookmarked" : "The feed is quiet"}
              </p>
              <p className="text-slate-400 mt-2 text-sm font-medium">
                {activeTab === "drafts" ? "Start something new and it will appear here." : "Your collection is waiting for its first addition."}
              </p>
            </div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-16">
            {/* Featured Section - Only for all feed */}
            {featured && (
              <Link
                href={`/blogs/${featured.slug || featured._id}`}
                className="group relative flex flex-col md:flex-row gap-0 overflow-hidden rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl hover:shadow-mozhi-primary/5"
              >
                <div className="w-full md:w-1/2 aspect-[16/10] md:aspect-auto bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  {featured.featuredImage ? (
                    <img src={featured.featuredImage} alt={featured.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-1000" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-mozhi-primary/10 to-mozhi-secondary/10 flex items-center justify-center">
                      <FileText className="h-24 w-24 text-mozhi-primary/10" />
                    </div>
                  )}
                  <div className="absolute top-8 left-8">
                     <span className="rounded-full bg-black px-5 py-2 text-[10px] font-black uppercase tracking-widest text-white">
                        Editor's Choice
                     </span>
                  </div>
                </div>

                <div className="flex flex-col justify-center p-10 md:p-14 md:w-1/2">
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 group-hover:text-mozhi-primary transition-colors leading-[1] uppercase tracking-tighter">
                    {featured.title}
                  </h2>
                  <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 line-clamp-3 leading-relaxed font-medium">
                    {featured.excerpt || featured.content.substring(0, 180) + "..."}
                  </p>
                  
                  <div className="flex items-center justify-between pt-8 border-t border-slate-50 dark:border-slate-800 mt-auto">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                        <UserCircle className="h-6 w-6 text-slate-400" />
                      </div>
                      <div>
                        <span className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{featured.author?.name || "Verified Member"}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Digital Storyteller</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Main Listing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {rest.map((post) => {
                const isOwner = user && ((post.author as any)?._id === user._id || (post.author as any) === user._id);
                
                return (
                  <div key={post._id} className="group relative flex flex-col h-full">
                    <Link
                      href={`/blogs/${post.slug || post._id}`}
                      className="flex flex-col flex-1 overflow-hidden"
                    >
                      <div className="aspect-[1.6/1] w-full bg-slate-50 dark:bg-slate-900 rounded-[2rem] relative overflow-hidden mb-6 border border-slate-50 dark:border-slate-800">
                        {post.featuredImage ? (
                          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                        ) : (
                          <div className="absolute inset-0 bg-mozhi-light/5 flex items-center justify-center">
                            <FileText className="h-12 w-12 text-mozhi-light" />
                          </div>
                        )}
                        {post.status === 'draft' && (
                           <div className="absolute top-4 left-4">
                              <span className="rounded-full bg-white/90 backdrop-blur px-3 py-1 text-[8px] font-black uppercase tracking-widest text-slate-900 shadow-sm border border-slate-100">
                                Draft Mode
                              </span>
                           </div>
                        )}
                      </div>
                      
                      <div className="flex flex-1 flex-col pr-4">
                        <h4 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-mozhi-primary transition-colors line-clamp-2 leading-[1.2] uppercase tracking-tight">
                          {post.title}
                        </h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2 flex-1 font-medium">
                          {post.excerpt || post.content.substring(0, 100) + "..."}
                        </p>
                        
                        <div className="flex items-center justify-between pb-4">
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                              By {post.author?.name || "Community"}
                           </span>
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              {new Date(post.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                           </span>
                        </div>
                      </div>
                    </Link>
                    
                    {/* Inline Actions for Owner/Interaction */}
                    <div className="flex items-center gap-2 mt-2 pt-4 border-t border-slate-50 dark:border-slate-800">
                       <button
                        onClick={(e) => handleShare(e, post)}
                        className="flex items-center gap-2 rounded-full bg-slate-50 dark:bg-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-mozhi-primary hover:bg-mozhi-light/10 transition-all"
                       >
                         {copiedId === post._id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                         {copiedId === post._id ? "Copied" : "Share"}
                       </button>

                       {isOwner && (
                         <>
                           <Link
                            href={`/student/blogs/${post._id}/edit`}
                            className="flex items-center gap-2 rounded-full bg-slate-50 dark:bg-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-mozhi-secondary hover:bg-mozhi-light/10 transition-all"
                           >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                           </Link>
                           <button
                            onClick={(e) => handleDelete(e, post._id)}
                            className="flex items-center gap-2 rounded-full bg-slate-50 dark:bg-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50/50 transition-all ml-auto"
                           >
                              <Trash2 className="w-3.5 h-3.5" />
                           </button>
                         </>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>

            {activeTab === "all" && totalPages > 1 && (
              <div className="pt-16 pb-12">
                <Pagination 
                   currentPage={currentPage}
                   totalPages={totalPages}
                   onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
