"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Calendar, ArrowRight, UserCircle } from "lucide-react";
import Link from "next/link";
import { getPublicBlogs, Blog } from "@/services/blogService";

const categories = ["All", "Grammar", "Culture", "Pronunciation", "Tutor Tips", "Updates"];

export default function BlogsPage() {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicBlogs()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 animate-in fade-in duration-500">
        
        {/* 1. Hero Section */}
        <section className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Mozhi Aruvi <span className="text-mozhi-primary">Blog</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Discover insights, study tips, and cultural stories to accelerate your Tamil learning journey.
          </p>
        </section>

        {/* 2. Search & Filter Bar */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-200 pb-8">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat, idx) => (
              <button
                key={cat}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  idx === 0
                    ? "bg-mozhi-primary text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-mozhi-primary focus:ring-1 focus:ring-mozhi-primary"
            />
          </div>
        </section>

        {/* 3. Featured Post */}
        {posts.length > 0 && (
          <section className="mb-16 md:mb-24">
            <Link href={`/blogs/${posts[0].slug || posts[0]._id}`} className="group relative flex flex-col lg:flex-row gap-8 overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-mozhi-soft cursor-pointer">
              <div className="w-full lg:w-1/2 min-h-[300px] bg-slate-100 flex items-center justify-center relative overflow-hidden">
                 {posts[0].featuredImage ? (
                   <img src={posts[0].featuredImage} alt={posts[0].title} className="w-full h-full object-cover" />
                 ) : (
                   <>
                     <div className="absolute inset-0 bg-gradient-to-tr from-mozhi-soft/20 to-mozhi-light/40"></div>
                     <span className="text-slate-400 font-medium whitespace-nowrap">Featured Image Placeholder</span>
                   </>
                 )}
              </div>
              
              <div className="flex flex-col justify-center p-8 lg:w-1/2">
                <div className="mb-4">
                   <span className="inline-flex rounded-full bg-mozhi-light/50 px-3 py-1 text-xs font-bold text-mozhi-dark">
                     Latest Post
                   </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 group-hover:text-mozhi-primary transition-colors">
                  {posts[0].title}
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed mb-6 line-clamp-3">
                  {posts[0].excerpt || posts[0].content.substring(0, 150) + '...'}
                </p>
                
                <div className="flex items-center gap-6 mt-auto border-t border-slate-100 pt-6">
                   <div className="flex items-center gap-2 text-sm text-slate-600">
                      <UserCircle className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold text-slate-900">{posts[0].author?.name || 'Unknown'}</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{new Date(posts[0].createdAt).toLocaleDateString()}</span>
                   </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* 4. Article Grid */}
        <section className="mb-16">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Latest Articles</h3>
          {loading ? (
             <div className="text-center py-12 text-slate-500">Loading articles...</div>
          ) : posts.length === 0 ? (
             <div className="text-center py-12 text-slate-500">No articles published yet.</div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {posts.map((post) => (
              <Link href={`/blogs/${post.slug || post._id}`} key={post._id} className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-mozhi-soft cursor-pointer">
                {/* Thumbnail */}
                <div className="aspect-[16/9] w-full bg-slate-100 flex items-center justify-center relative overflow-hidden border-b border-slate-100">
                   {post.featuredImage ? (
                     <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
                   ) : (
                     <>
                       <div className="absolute inset-0 bg-mozhi-light/20 group-hover:bg-mozhi-light/40 transition-colors"></div>
                       <span className="text-slate-400 text-sm font-medium">Thumbnail</span>
                     </>
                   )}
                </div>
                
                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      {post.category || "General"}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-mozhi-primary transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt || post.content.substring(0, 100) + '...'}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
                    <span className="text-xs font-semibold text-slate-600">By {post.author?.name || 'Unknown'}</span>
                    <span className="flex items-center gap-1 text-sm font-bold text-mozhi-primary group-hover:text-mozhi-secondary transition-colors">
                      Read <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          )}
        </section>

        {/* Pagination disabled until implemented
        <div className="flex justify-center mb-10">
          <button className="rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors">
            Load More Articles
          </button>
        </div>
        */}

      </main>

      <Footer />
    </div>
  );
}
