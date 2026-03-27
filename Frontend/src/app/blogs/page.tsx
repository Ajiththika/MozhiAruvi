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
import { Pagination } from "@/components/ui/Pagination";

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

  const featured = activeTab === "all" && !search ? filtered[0] : null;
  const rest = featured ? filtered.slice(1) : filtered;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-surface-soft/30">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-24 animate-in fade-in duration-700">

        {/* --- 1. Premium Hero Section --- */}
        <div className="mb-20 md:mb-32 space-y-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-0.5 w-12 bg-primary/40 rounded-full" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Community Archives</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-[0.95] mb-10">
              Echoes of <br />
              <span className="text-primary italic font-serif">Tamil Heritage</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-500 font-bold leading-relaxed max-w-2xl tracking-tight">
              A curated space where students, mentors, and scholars share linguistic gems, cultural stories, and learning breakthroughs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-10">
            <button
              onClick={() => {
                const target = "/blogs/write";
                if (!user) {
                  router.push(`/auth/signin?redirect=${encodeURIComponent(target)}`);
                } else {
                  router.push(target);
                }
              }}
              className="w-full sm:w-auto px-12 h-16 rounded-[2rem] bg-gray-900 py-4 text-xs font-black uppercase tracking-widest text-white shadow-2xl hover:bg-black transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center group"
            >
              <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-500" /> 
              Write
            </button>
            <Button href="#feed" variant="secondary" size="xl" className="w-full sm:w-auto px-12 rounded-[2rem] border-border text-gray-600 hover:bg-white shadow-sm font-black uppercase text-[10px] tracking-widest">
              Explore Live Feed
            </Button>
          </div>
        </div>

        {/* Management & Discovery Bar */}
        <section id="feed" className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-20 scroll-mt-24">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "whitespace-nowrap rounded-[1.5rem] px-10 py-4 text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === "all"
                  ? "bg-gray-900 text-white shadow-2xl"
                  : "bg-white text-gray-500 hover:text-primary border border-border"
              )}
            >
              The Feed
            </button>
            {isAuthenticated && (
              <>
                <button
                  onClick={() => setActiveTab("saved")}
                  className={cn(
                    "whitespace-nowrap rounded-[1.5rem] px-10 py-4 text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === "saved"
                      ? "bg-gray-900 text-white shadow-2xl"
                      : "bg-white text-gray-400 hover:text-primary border border-border"
                  )}
                >
                  Saved Gems
                </button>
                <button
                  onClick={() => setActiveTab("drafts")}
                  className={cn(
                    "whitespace-nowrap rounded-[1.5rem] px-10 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                    activeTab === "drafts"
                      ? "bg-gray-900 text-white shadow-2xl"
                      : "bg-white text-gray-400 hover:text-primary border border-border"
                  )}
                >
                  My Archives
                  {myDrafts.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[10px] font-black text-white ring-4 ring-surface-soft">
                      {myDrafts.length}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>

          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search heritage repository..."
              className="w-full h-16 rounded-[2rem] border border-border bg-white px-14 text-sm font-bold text-gray-800 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/5 placeholder:text-gray-300"
            />
          </div>
        </section>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-xs font-bold text-gray-400 tracking-tight">Gathering the latest stories...</p>
          </div>
        ) : null}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-6 animate-in slide-in-from-bottom-4 duration-700">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-gray-200" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
                {activeTab === "drafts" ? "No drafts found" : activeTab === "saved" ? "Nothing bookmarked" : "No stories match your search"}
              </p>
              <p className="text-gray-500 mt-2 text-base font-medium max-w-sm mx-auto">
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
                className="group relative flex flex-col md:flex-row gap-0 overflow-hidden rounded-[3rem] bg-white border border-border transition-all hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]"
              >
                <div className="w-full md:w-1/2 aspect-[16/10] md:aspect-auto bg-surface-soft relative overflow-hidden">
                  {featured.featuredImage ? (
                    <img src={featured.featuredImage} alt={featured.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-1000" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
                      <FileText className="h-24 w-24 text-primary/10" />
                    </div>
                  )}
                  <div className="absolute top-10 left-10">
                     <span className="rounded-full bg-gray-900 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                        Vault Selection
                     </span>
                  </div>
                </div>

                <div className="flex flex-col justify-center p-12 md:p-16 md:w-1/2 space-y-10">
                  <div className="space-y-6">
                    <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">{featured.category || "Heritage Insight"}</span>
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 group-hover:text-primary transition-colors leading-[1.05] tracking-tighter">
                      {featured.title}
                    </h2>
                    <p className="text-xl text-gray-400 line-clamp-3 leading-relaxed font-bold tracking-tight">
                      {featured.excerpt || featured.content.substring(0, 180) + "..."}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-10 border-t border-border mt-auto">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-surface-soft flex items-center justify-center border border-border shadow-sm">
                        <UserCircle className="h-8 w-8 text-gray-300" />
                      </div>
                      <div>
                        <span className="block text-[11px] font-black uppercase tracking-widest text-gray-900">
                          {featured.author?.name || "Member"}
                          {featured.author?.role === 'admin' && (
                            <span className="ml-3 text-[8px] font-black text-secondary border border-secondary/20 bg-secondary/5 px-2 py-0.5 rounded-lg">Authority</span>
                          )}
                        </span>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 block">
                           {new Date(featured.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                       <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-white transition-all" />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Main Listing Grid - Refined cards in Light Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
              {rest.map((post) => {
                const isOwner = user && ((post.author as any)?._id === user._id || (post.author as any) === user._id || user.role === 'admin');
                
                return (
                  <div key={post._id} className="group relative flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Link
                      href={`/blogs/${post.slug || post._id}`}
                      className="flex flex-col flex-1"
                    >
                      <div className="aspect-[1.4/1] w-full bg-surface-soft rounded-[3rem] relative overflow-hidden mb-8 border border-border transition-all hover:border-primary/20">
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
                           <span className="rounded-xl bg-white/90 backdrop-blur-md px-4 py-1.5 text-[8px] font-black uppercase tracking-widest text-gray-900 border border-border shadow-sm">
                              {post.category || "General"}
                           </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-1 flex-col space-y-6">
                        <h4 className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight tracking-tighter">
                          {post.title}
                        </h4>
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 flex-1 font-bold tracking-tight">
                          {post.excerpt || post.content.substring(0, 100) + "..."}
                        </p>
                        
                        <div className="flex items-center justify-between pt-6 border-t border-border">
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
                                {post.author?.name || "Member"}
                                {post.author?.role === 'admin' && (
                                  <span className="ml-2 text-[8px] font-black text-secondary border border-secondary/20 bg-secondary/5 px-1.5 py-0.5 rounded-lg">Staff</span>
                                )}
                              </span>
                           </div>
                           <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                              {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                           </span>
                        </div>
                      </div>
                    </Link>
                    
                    <div className="flex items-center justify-between mt-8 pt-8 border-t border-border">
                       <button
                        onClick={(e) => handleShare(e, post)}
                        className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-all"
                       >
                         {copiedId === post._id ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                         {copiedId === post._id ? "Copied" : "Spread"}
                       </button>

                       {isOwner && (
                         <div className="flex items-center gap-8">
                           <Link
                             href={`/${user.role === 'admin' ? 'admin' : (user.role === 'teacher' ? 'tutor' : 'student')}/blogs/${post._id}/edit`}
                             className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-secondary transition-all"
                           >
                              <Edit2 className="w-4 h-4" /> Config
                           </Link>
                           <button
                             onClick={(e) => handleDelete(e, post._id)}
                             className="text-gray-200 hover:text-red-500 transition-all"
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

