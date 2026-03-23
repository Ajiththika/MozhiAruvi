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

import Button from "@/components/common/Button";
import { Pagination } from "@/components/Pagination";

export default function BlogsPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
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
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-20 animate-in fade-in duration-700">

        {/* --- 1. Premium Hero Section --- */}
        <div className="mb-16 md:mb-24 space-y-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-1.5 w-10 rounded-full bg-primary" />
              <span className="text-xs font-bold text-primary tracking-tight">Community Library</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-8">
              Insights into <br />
              <span className="text-primary italic">Tamil Culture & Learning</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl">
              A dedicated space for students, tutors, and heritage enthusiasts to share stories, grammar tips, and cultural milestones within our global community.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 pt-6">
            {isAuthenticated && (
              <Button href="/student/blogs/create" variant="primary" size="lg" className="w-full sm:w-auto px-10 shadow-xl shadow-primary/10">
                <Plus className="w-5 h-5 mr-2" /> Start Writing
              </Button>
            )}
            <Button href="#feed" variant="secondary" size="lg" className="w-full sm:w-auto px-10 border-primary text-primary hover:bg-primary/5">
              Explore Feed
            </Button>
          </div>
        </div>

        {/* Management & Discovery Bar */}
        <section id="feed" className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "whitespace-nowrap rounded-full px-8 py-3.5 text-sm font-bold tracking-tight transition-all",
                activeTab === "all"
                  ? "bg-primary text-white shadow-xl shadow-primary/10"
                  : "text-slate-500 hover:text-primary hover:bg-slate-50"
              )}
            >
              Feed
            </button>
            {isAuthenticated && (
              <>
                <button
                  onClick={() => setActiveTab("saved")}
                  className={cn(
                    "whitespace-nowrap rounded-full px-8 py-3.5 text-sm font-bold tracking-tight transition-all",
                    activeTab === "saved"
                      ? "bg-primary text-white shadow-xl shadow-primary/10"
                      : "text-slate-500 hover:text-primary hover:bg-slate-50"
                  )}
                >
                  Saved Stories
                </button>
                <button
                  onClick={() => setActiveTab("drafts")}
                  className={cn(
                    "whitespace-nowrap rounded-full px-8 py-3.5 text-sm font-bold tracking-tight transition-all relative",
                    activeTab === "drafts"
                      ? "bg-primary text-white shadow-xl shadow-primary/10"
                      : "text-slate-500 hover:text-primary hover:bg-slate-50"
                  )}
                >
                  My Drafts
                  {myDrafts.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white ring-4 ring-white">
                      {myDrafts.length}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>

          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter stories..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-5 text-sm font-semibold text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/5 placeholder:text-slate-400"
            />
          </div>
        </section>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-xs font-bold text-slate-400 tracking-tight">Gathering the latest stories...</p>
          </div>
        ) : null}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-6 animate-in slide-in-from-bottom-4 duration-700">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-slate-200" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {activeTab === "drafts" ? "No drafts found" : activeTab === "saved" ? "Nothing bookmarked" : "No stories match your search"}
              </p>
              <p className="text-slate-500 mt-2 text-base font-medium max-w-sm mx-auto">
                {activeTab === "drafts" ? "Start something new and it will appear here." : "Try adjusting your filters or explore our main feed."}
              </p>
            </div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-20">
            {/* Featured Section - High-impact card */}
            {featured && (
              <Link
                href={`/blogs/${featured.slug || featured._id}`}
                className="group relative flex flex-col md:flex-row gap-0 overflow-hidden rounded-[3rem] bg-white border border-slate-100 transition-all hover:shadow-2xl hover:shadow-primary/5"
              >
                <div className="w-full md:w-1/2 aspect-[16/10] md:aspect-auto bg-slate-50 relative overflow-hidden">
                  {featured.featuredImage ? (
                    <img src={featured.featuredImage} alt={featured.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-1000" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                      <FileText className="h-24 w-24 text-primary/10" />
                    </div>
                  )}
                  <div className="absolute top-8 left-8">
                     <span className="rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white tracking-tight">
                        Featured Story
                     </span>
                  </div>
                </div>

                <div className="flex flex-col justify-center p-10 md:p-14 md:w-1/2 space-y-8">
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-primary tracking-tight">{featured.category || "Tamil Culture"}</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 group-hover:text-primary transition-colors leading-[1.1] tracking-tight">
                      {featured.title}
                    </h2>
                    <p className="text-lg text-slate-600 line-clamp-3 leading-relaxed font-medium">
                      {featured.excerpt || featured.content.substring(0, 180) + "..."}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-8 border-t border-slate-50 mt-auto">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
                        <UserCircle className="h-7 w-7 text-slate-300" />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-slate-900">
                          {featured.author?.name || "Verified Member"}
                          {featured.author?.role === 'admin' && (
                            <span className="ml-2 text-[10px] font-bold text-primary border border-primary/20 bg-primary/5 px-2 py-0.5 rounded-md">Admin</span>
                          )}
                        </span>
                        <span className="text-xs text-slate-500 font-medium tracking-tight">
                           {new Date(featured.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-6 w-6 text-slate-300 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                  </div>
                </div>
              </Link>
            )}

            {/* Main Listing Grid - Refined cards in Light Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {rest.map((post) => {
                const isOwner = user && ((post.author as any)?._id === user._id || (post.author as any) === user._id);
                
                return (
                  <div key={post._id} className="group relative flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Link
                      href={`/blogs/${post.slug || post._id}`}
                      className="flex flex-col flex-1"
                    >
                      <div className="aspect-[1.6/1] w-full bg-slate-50 rounded-[2.5rem] relative overflow-hidden mb-6 border border-slate-100 transition-all group-hover:shadow-2xl shadow-slate-200/20">
                        {post.featuredImage ? (
                          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                        ) : (
                          <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                            <FileText className="h-12 w-12 text-primary/10" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 flex gap-2">
                           {post.status === 'draft' && (
                              <span className="rounded-full bg-white/90 backdrop-blur px-3 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm border border-slate-100">
                                Draft
                              </span>
                           )}
                           <span className="rounded-full bg-slate-100 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold text-slate-700 border border-black/5">
                              {post.category || "Article"}
                           </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-1 flex-col space-y-4">
                        <h4 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight tracking-tight">
                          {post.title}
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 flex-1 font-medium">
                          {post.excerpt || post.content.substring(0, 100) + "..."}
                        </p>
                        
                        <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                           <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-slate-900 tracking-tight">
                                {post.author?.name || "Community"}
                                {post.author?.role === 'admin' && (
                                  <span className="ml-1.5 text-[9px] font-bold text-primary border border-primary/20 bg-primary/5 px-1.5 py-0.5 rounded-md">Admin</span>
                                )}
                              </span>
                           </div>
                           <span className="text-[11px] font-bold text-slate-400 tracking-tight">
                              {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                           </span>
                        </div>
                      </div>
                    </Link>
                    
                    {/* Management Actions - Refined Light Design */}
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                       <button
                        onClick={(e) => handleShare(e, post)}
                        className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-primary transition-all tracking-tight"
                       >
                         {copiedId === post._id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                         {copiedId === post._id ? "Link Copied" : "Share Story"}
                       </button>

                       {isOwner && (
                         <div className="flex items-center gap-6">
                           <Link
                             href={`/student/blogs/${post._id}/edit`}
                             className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-secondary transition-all tracking-tight"
                           >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                           </Link>
                           <button
                             onClick={(e) => handleDelete(e, post._id)}
                             className="text-slate-200 hover:text-red-500 transition-all"
                           >
                             <Trash2 className="w-3.5 h-3.5" />
                           </button>
                         </div>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Pagination Controls - Refined Light Mode */}
            {totalBlogs > posts.length && activeTab === 'all' && (
              <div className="pt-10 border-t border-slate-50">
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
