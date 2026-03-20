"use client";

import React, { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Calendar, ArrowRight, UserCircle, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";
import { getPublicBlogs, Blog } from "@/services/blogService";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Grammar", "Culture", "Pronunciation", "Tutor Tips", "Updates", "General"];

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function BlogsPage() {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    getPublicBlogs()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.author?.name?.toLowerCase().includes(q);
      const matchesCat = activeCategory === "All" || p.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [posts, search, activeCategory]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 animate-in fade-in duration-500">

        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto mb-14">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Mozhi Aruvi <span className="text-mozhi-primary">Blog</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Insights, study tips, and cultural stories to accelerate your Tamil learning journey.
          </p>
        </section>

        {/* Filter bar */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 border-b border-slate-200 pb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                  activeCategory === cat
                    ? "bg-mozhi-primary text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-mozhi-primary focus:ring-1 focus:ring-mozhi-primary"
            />
          </div>
        </section>

        {/* States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-mozhi-primary" />
            <p className="text-sm text-slate-500">Loading articles...</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <BookOpen className="h-12 w-12 text-slate-300" />
            <p className="text-slate-500 font-medium">
              {posts.length === 0
                ? "No articles published yet. Check back soon!"
                : `No articles found for "${activeCategory}"${search ? ` matching "${search}"` : ""}.`}
            </p>
            {(activeCategory !== "All" || search) && (
              <button onClick={() => { setActiveCategory("All"); setSearch(""); }} className="text-sm font-bold text-mozhi-primary hover:text-mozhi-secondary">
                Clear filters
              </button>
            )}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <>
            {/* Featured post */}
            {featured && (
              <section className="mb-16">
                <Link
                  href={`/blogs/${featured.slug || featured._id}`}
                  className="group relative flex flex-col lg:flex-row gap-0 overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-mozhi-primary/30"
                >
                  <div className="w-full lg:w-1/2 min-h-[280px] bg-slate-100 flex items-center justify-center relative overflow-hidden">
                    {featured.featuredImage ? (
                      <img src={featured.featuredImage} alt={featured.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-tr from-mozhi-primary/10 via-mozhi-light/30 to-transparent" />
                        <BookOpen className="h-16 w-16 text-slate-300" />
                      </>
                    )}
                  </div>

                  <div className="flex flex-col justify-center p-8 lg:w-1/2">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="inline-flex rounded-full bg-mozhi-primary/10 px-3 py-1 text-xs font-bold text-mozhi-primary">
                        Latest Post
                      </span>
                      {featured.category && (
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                          {featured.category}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 group-hover:text-mozhi-primary transition-colors line-clamp-2">
                      {featured.title}
                    </h2>
                    <p className="text-slate-600 leading-relaxed mb-6 line-clamp-3">
                      {featured.excerpt || featured.content.substring(0, 180) + "..."}
                    </p>
                    <div className="flex items-center gap-6 mt-auto border-t border-slate-100 pt-5">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <UserCircle className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-900">{featured.author?.name || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>{new Date(featured.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className="ml-auto text-xs font-medium text-slate-400">{readingTime(featured.content)} min read</span>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* Article grid */}
            {rest.length > 0 && (
              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  {activeCategory !== "All" ? `${activeCategory} Articles` : "More Articles"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((post) => (
                    <Link
                      key={post._id}
                      href={`/blogs/${post.slug || post._id}`}
                      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-mozhi-primary/30"
                    >
                      <div className="aspect-[16/9] w-full bg-slate-100 flex items-center justify-center relative overflow-hidden border-b border-slate-100">
                        {post.featuredImage ? (
                          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-mozhi-light/20 group-hover:bg-mozhi-light/40 transition-colors" />
                            <BookOpen className="h-8 w-8 text-slate-300" />
                          </>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                            {post.category || "General"}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mb-2 group-hover:text-mozhi-primary transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-2 flex-1">
                          {post.excerpt || post.content.substring(0, 100) + "..."}
                        </p>
                        <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                          <span className="text-xs font-semibold text-slate-500">By {post.author?.name || "Unknown"}</span>
                          <span className="flex items-center gap-1 text-sm font-bold text-mozhi-primary group-hover:text-mozhi-secondary transition-colors">
                            Read <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
