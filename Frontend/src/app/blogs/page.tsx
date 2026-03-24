"use client";

import React, { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, ArrowRight, UserCircle, Loader2, BookOpen, Plus, FileText, Trash2, Edit2, Share2, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPublicBlogs, getSavedBlogs, getMyBlogs, deleteMyBlog, Blog } from "@/services/blogService";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

type ViewTab = "all" | "saved" | "drafts";

import Button from "@/components/common/Button";
import { Pagination } from "@/components/Pagination";

export default function BlogsPage() {
  const router = useRouter();
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
        <div className="mb-20 md:mb-28 space-y-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-1.5 w-12 rounded-full bg-primary" />
              <label>Community Library</label>
            </div>
            <h1>
              Insights into <br />
              <span className="text-primary italic">Tamil Culture & Learning</span>
            </h1>
            <p className="text-lg md:text-xl mt-8 max-w-3xl">
              A dedicated space for students, tutors, and heritage enthusiasts to share stories, grammar tips, and cultural milestones within our global community.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
            <Button
              onClick={() => {
                const target = "/student/blogs/create";
                if (!user) {
                  router.push(`/auth/signin?redirect=${encodeURIComponent(target)}`);
                } else {
                  router.push(target);
                }
              }}
              size="xl"
              className="w-full sm:w-auto"
            >
              <Plus className="w-5 h-5 mr-3" /> Start Writing
            </Button>
            <Button href="#feed" variant="secondary" size="xl" className="w-full sm:w-auto">
              Explore Feed
            </Button>
          </div>
        </div>

        {/* Management & Discovery Bar */}
        <section id="feed" className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 md:pb-0 no-scrollbar">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "whitespace-nowrap rounded-full px-8 py-3.5 text-sm font-bold tracking-tight transition-all duration-300",
                activeTab === "all"
                   ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                   : "text-slate-500 hover:text-primary hover:bg-slate-100"
              )}
            >
              Feed
            </button>
            {isAuthenticated && (
              <>
                <button
                  onClick={() => setActiveTab("saved")}
                  className={cn(
                    "whitespace-nowrap rounded-full px-8 py-3.5 text-sm font-bold tracking-tight transition-all duration-300",
                    activeTab === "saved"
                      ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                      : "text-slate-500 hover:text-primary hover:bg-slate-100"
                  )}
                >
                  Saved Stories
                </button>
                <button
                  onClick={() => setActiveTab("drafts")}
                  className={cn(
                    "whitespace-nowrap rounded-full px-8 py-3.5 text-sm font-bold tracking-tight transition-all duration-300 relative",
                    activeTab === "drafts"
                      ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                      : "text-slate-500 hover:text-primary hover:bg-slate-100"
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

          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter stories..."
              className="w-full pl-14"
            />
          </div>
        </section>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <label>Gathering the latest stories...</label>
          </div>
        ) : null}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 text-center gap-8 animate-in slide-in-from-bottom-8 duration-1000">
            <div className="w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center shadow-inner">
                <BookOpen className="h-12 w-12 text-slate-200" />
            </div>
            <div className="space-y-3">
              <h2>
                {activeTab === "drafts" ? "No drafts found" : activeTab === "saved" ? "Nothing bookmarked" : "No stories match"}
              </h2>
              <p className="max-w-sm mx-auto">
                {activeTab === "drafts" ? "Start something new and it will appear here." : "Try adjusting your filters or explore our main feed."}
              </p>
            </div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-24">
            {/* Featured Section - High-impact card */}
            {featured && (
              <Link
                href={`/blogs/${featured.slug || featured._id}`}
                className="group relative flex flex-col lg:flex-row gap-0 overflow-hidden rounded-[2rem] bg-white border border-slate-100 transition-all hover:shadow-[0_32px_64px_-16px_rgba(42,87,148,0.1)]"
              >
                <div className="w-full lg:w-1/2 aspect-[16/10] lg:aspect-auto bg-slate-50 relative overflow-hidden">
                  {featured.featuredImage ? (
                    <img src={featured.featuredImage} alt={featured.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                      <FileText className="h-24 w-24 text-primary/10" />
                    </div>
                  )}
                  <div className="absolute top-10 left-10">
                     <span className="rounded-full bg-slate-900/90 backdrop-blur px-6 py-2.5 text-[10px] font-bold text-white uppercase tracking-widest">
                        Featured Story
                     </span>
                  </div>
                </div>

                <div className="flex flex-col justify-center p-12 md:p-16 lg:w-1/2 space-y-8">
                  <div className="space-y-6">
                    <label className="text-primary">{featured.category || "Tamil Culture"}</label>
                    <h2 className="group-hover:text-primary transition-colors duration-300 lg:text-5xl">
                      {featured.title}
                    </h2>
                    <p className="text-lg line-clamp-3">
                      {featured.excerpt || featured.content.substring(0, 180) + "..."}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-10 border-t border-slate-50 mt-auto">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                        <UserCircle className="h-8 w-8 text-slate-300" />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-slate-900">
                          {featured.author?.name || "Verified Member"}
                          {featured.author?.role === 'admin' && (
                            <span className="ml-3 text-[9px] font-bold text-primary border border-primary/20 bg-primary/5 px-2 py-0.5 rounded-full uppercase tracking-tighter">Admin</span>
                          )}
                        </span>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">
                           {new Date(featured.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-7 w-7 text-slate-200 group-hover:text-primary group-hover:translate-x-3 transition-all duration-500" />
                  </div>
                </div>
              </Link>
            )}

            {/* Main Listing Grid - Refined cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
              {rest.map((post) => {
                const isOwner = user && ((post.author as any)?._id === user._id || (post.author as any) === user._id);
                
                return (
                  <div key={post._id} className="group relative flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <Link
                      href={`/blogs/${post.slug || post._id}`}
                      className="flex flex-col flex-1"
                    >
                      <div className="aspect-[1.5/1] w-full bg-slate-50 rounded-[2rem] relative overflow-hidden mb-8 border border-slate-100 transition-all group-hover:shadow-2xl shadow-slate-200/20 shadow-xl">
                        {post.featuredImage ? (
                          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                        ) : (
                          <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                            <FileText className="h-14 w-14 text-primary/10" />
                          </div>
                        )}
                        <div className="absolute top-6 left-6 flex gap-3">
                           {post.status === 'draft' && (
                              <span className="rounded-full bg-white/95 backdrop-blur px-4 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm border border-slate-100 uppercase tracking-widest">
                                Draft
                              </span>
                           )}
                           <span className="rounded-full bg-slate-900/80 backdrop-blur-md px-4 py-1.5 text-[10px] font-bold text-white border border-white/10 uppercase tracking-widest">
                              {post.category || "Article"}
                           </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-1 flex-col space-y-4 px-2">
                        <h4 className="group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
                          {post.title}
                        </h4>
                        <p className="text-sm line-clamp-2 flex-1">
                          {post.excerpt || post.content.substring(0, 100) + "..."}
                        </p>
                        
                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                           <div className="flex items-center gap-3">
                              <span className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">
                                {post.author?.name || "Community"}
                                {post.author?.role === 'admin' && (
                                  <span className="ml-2 text-[8px] font-bold text-primary border border-primary/20 bg-primary/5 px-1.5 py-0.5 rounded-full">ADMIN</span>
                                )}
                              </span>
                           </div>
                           <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                              {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                           </span>
                        </div>
                      </div>
                    </Link>
                    
                    {/* Management Actions */}
                    <div className="flex items-center justify-between mt-8 pt-8 border-t border-slate-50 px-2">
                       <button
                        onClick={(e) => handleShare(e, post)}
                        className="flex items-center gap-3 text-[11px] font-bold text-slate-400 hover:text-primary transition-all uppercase tracking-widest"
                       >
                         {copiedId === post._id ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                         {copiedId === post._id ? "Link Copied" : "Share"}
                       </button>

                       {isOwner && (
                         <div className="flex items-center gap-8">
                           <Link
                             href={`/student/blogs/${post._id}/edit`}
                             className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-secondary transition-all uppercase tracking-widest"
                           >
                              <Edit2 className="w-4 h-4" /> Edit
                           </Link>
                           <button
                             onClick={(e) => handleDelete(e, post._id)}
                             className="text-slate-200 hover:text-red-500 transition-all duration-300"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Pagination Controls */}
            {totalBlogs > posts.length && activeTab === 'all' && (
              <div className="pt-16 border-t border-slate-100 flex justify-center">
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
