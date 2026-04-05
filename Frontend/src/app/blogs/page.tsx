"use client";

import React, { useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Search, ArrowRight, UserCircle, Loader2, BookOpen, Plus, FileText, Trash2, Edit2, Share2, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPublicBlogs, getSavedBlogs, getMyBlogs, deleteMyBlog, Blog } from "@/services/blogService";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type ViewTab = "all" | "saved" | "drafts";

import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";

export default function BlogsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ViewTab>("all");
  const [copiedId, setCopiedId]   = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Feed Query
  const { data: feedData, isLoading: feedLoading, refetch: refetchFeed } = useQuery({
    queryKey: ["blogs", "feed", currentPage],
    queryFn: () => {
      console.log(`[DEBUG] Fetching public blogs... Page: ${currentPage}`);
      return getPublicBlogs(currentPage);
    },
    staleTime: 5 * 60 * 1000,
  });

  // 2. Saved Blogs (Auth only)
  const { data: savedPosts = [], isLoading: savedLoading } = useQuery({
    queryKey: ["blogs", "saved"],
    queryFn: () => getSavedBlogs(),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
  });

  // 3. My Drafts (Auth only)
  const { data: myDrafts = [], isLoading: draftsLoading } = useQuery({
    queryKey: ["blogs", "mine"],
    queryFn: async () => {
      const blogs = await getMyBlogs();
      return blogs.filter(b => b.status === "draft");
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const posts = feedData?.blogs || [];
  const totalPages = feedData?.totalPages || 1;
  const totalBlogs = feedData?.totalBlogs || 0;
  const loading = feedLoading || (isAuthenticated && (savedLoading || draftsLoading));

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
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    } catch (err) {
      alert("Failed to delete post.");
    }
  };



  return (
    <div className="min-h-screen flex flex-col font-sans bg-surface-soft/30">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-24 animate-in fade-in duration-700">

        {/* Header Section (Clean) */}
        <div className="mb-16 border-l-4 border-primary pl-6 py-2">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight uppercase">Read Our Stories</h1>
          <p className="text-sm text-primary/60 font-bold uppercase tracking-widest mt-2 max-w-2xl">
            Discover insights, cultural deep-dives, and updates from the Mozhi Aruvi community
          </p>
        </div>

        {/* --- Unified Management & Discovery Bar --- */}
        <section id="feed" className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-20">
          <div className="flex flex-wrap items-center gap-4">
            {/* The Write Action - Elevated (Restricted to Tutors/Admins) */}
            {(user?.role === 'admin' || user?.role === 'teacher') && (
              <button
                 onClick={() => {
                   const target = "/blogs/write";
                   router.push(target);
                 }}
                 className="h-16 px-10 rounded-[2rem] bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 group"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                Write a Story
              </button>
            )}

            {isAuthenticated && (
              <div className="hidden sm:block w-[1px] h-8 bg-slate-200 mx-2" />
            )}

            {isAuthenticated && (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                <button
                  onClick={() => setActiveTab("all")}
                  className={cn(
                    "whitespace-nowrap rounded-[1.5rem] px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === "all"
                      ? "bg-slate-900 text-white shadow-xl"
                      : "bg-white text-primary/70 hover:text-primary border border-border"
                  )}
                >
                  All Stories
                </button>
                <>
                  <button
                    onClick={() => setActiveTab("saved")}
                    className={cn(
                      "whitespace-nowrap rounded-[1.5rem] px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all",
                      activeTab === "saved"
                        ? "bg-slate-900 text-white shadow-xl"
                        : "bg-white text-primary/60 hover:text-primary border border-border"
                    )}
                  >
                    Saved Gems
                  </button>
                  {/* Hide Archives/Drafts for Students */}
                  {(user?.role === 'admin' || user?.role === 'teacher') && (
                    <button
                      onClick={() => setActiveTab("drafts")}
                      className={cn(
                        "whitespace-nowrap rounded-[1.5rem] px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                        activeTab === "drafts"
                          ? "bg-slate-900 text-white shadow-xl"
                          : "bg-white text-primary/60 hover:text-primary border border-border"
                      )}
                    >
                      My Archives
                      {myDrafts.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-black text-white ring-4 ring-surface-soft">
                          {myDrafts.length}
                        </span>
                      )}
                    </button>
                  )}
                </>
              </div>
            )}
          </div>

          <div className="relative flex-1 w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Tamil stories, culture, and learning..."
              className="w-full h-16 rounded-[2rem] border border-border bg-white px-14 text-sm font-bold text-slate-800 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/5 placeholder:text-primary/40 shadow-xl shadow-slate-200/20"
            />
          </div>
        </section>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-xs font-bold text-primary/60 tracking-tight">Gathering the latest stories...</p>
          </div>
        ) : null}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-6 animate-in slide-in-from-bottom-4 duration-700">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-slate-200" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                {activeTab === "drafts" ? "No drafts found" : activeTab === "saved" ? "Nothing bookmarked" : "No stories match your search"}
              </p>
              <p className="text-primary/70 mt-2 text-base font-medium max-w-sm mx-auto">
                {activeTab === "drafts" ? "Start something new and it will appear here." : "Try adjusting your filters or explore our main feed."}
              </p>
            </div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-20">
            {/* Main Listing Grid - Refined cards in Light Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
              {filtered.map((post) => {
                const isOwner = user && ((post.author as any)?._id === user._id || (post.author as any) === user._id || user.role === 'admin');
                
                return (
                  <div key={post._id} className="group relative flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Link
                      href={`/blogs/${post.slug || post._id}`}
                      className="flex flex-col flex-1"
                    >
                      <div className="aspect-[1.4/1] w-full bg-surface-soft rounded-2xl relative overflow-hidden mb-8 border border-border transition-all hover:border-primary/20">
                        {post.featuredImage ? (
                          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000" />
                        ) : (
                          <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                            <FileText className="h-16 w-16 text-primary/5" />
                          </div>
                        )}
                        <div className="absolute top-6 left-6 flex gap-3">
                           {post.status === 'draft' && (
                              <span className="rounded-xl bg-orange-500 px-4 py-1.5 text-[8px] font-black uppercase tracking-widest text-white shadow-lg">
                                Draft
                              </span>
                           )}
                           <span className="rounded-xl bg-white/90 backdrop-blur-md px-4 py-1.5 text-[8px] font-black uppercase tracking-widest text-primary border border-border shadow-sm">
                              {post.category || "General"}
                           </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-1 flex-col space-y-6">
                        <h4 className="text-2xl font-black text-primary group-hover:text-primary transition-colors line-clamp-2 leading-tight tracking-tighter">
                          {post.title}
                        </h4>
                        <p className="text-primary/60 text-sm leading-relaxed line-clamp-3 flex-1 font-bold tracking-tight">
                          {post.excerpt || post.content.substring(0, 100) + "..."}
                        </p>
                        
                        <div className="flex items-center justify-between pt-6 border-t border-border">
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                {post.author?.name || "Member"}
                                {post.author?.role === 'admin' && (
                                  <span className="ml-2 text-[8px] font-black text-secondary border border-secondary/20 bg-secondary/5 px-1.5 py-0.5 rounded-lg">Staff</span>
                                )}
                              </span>
                           </div>
                           <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">
                              {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                           </span>
                        </div>
                      </div>
                    </Link>
                    
                    <div className="flex items-center justify-between mt-8 pt-8 border-t border-border">
                       <button
                        onClick={(e) => handleShare(e, post)}
                        className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-all"
                       >
                         {copiedId === post._id ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                         {copiedId === post._id ? "Copied" : "Spread"}
                       </button>

                       {isOwner && (
                         <div className="flex items-center gap-8">
                           <Link
                             href={`/blogs/${post._id}/edit`}
                             className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-secondary transition-all"
                           >
                              <Edit2 className="w-4 h-4" /> Config
                           </Link>
                           <button
                             onClick={(e) => handleDelete(e, post._id)}
                             className="text-slate-200 hover:text-red-500 transition-all"
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
















