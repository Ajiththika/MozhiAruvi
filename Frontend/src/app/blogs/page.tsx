import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Calendar, ArrowRight, UserCircle } from "lucide-react";
import Link from "next/link";

const categories = ["All", "Grammar", "Culture", "Pronunciation", "Tutor Tips", "Updates"];

const mockPosts = [
  {
    id: 1,
    title: "Mastering the Use of 'ழ' (Zha) in Tamil",
    excerpt: "The most unique sound in the Tamil language can be tricky. Here's a practical guide on how to shape your tongue and practice.",
    category: "Pronunciation",
    date: "Oct 12, 2026",
    author: "Kavitha R.",
  },
  {
    id: 2,
    title: "5 Essential Tamil Proverbs for Everyday Life",
    excerpt: "Enrich your conversational Tamil by sprinkling in these classic proverbs that native speakers use all the time.",
    category: "Culture",
    date: "Oct 08, 2026",
    author: "Arun P.",
  },
  {
    id: 3,
    title: "Understanding Tamil Verb Conjugations",
    excerpt: "A simple, structured approach to conjugating verbs in past, present, and future tenses without memorizing endless charts.",
    category: "Grammar",
    date: "Sep 29, 2026",
    author: "Dr. Selvam",
  },
  {
    id: 4,
    title: "How to Prepare for Your First Tutor Session",
    excerpt: "Nervous about your first 1-on-1? Here is a checklist of what to prepare and how to set goals with your Tamil tutor.",
    category: "Tutor Tips",
    date: "Sep 21, 2026",
    author: "Maya S.",
  },
  {
    id: 5,
    title: "Pongal Festival: The Harvest Celebration",
    excerpt: "Learn the vocabulary and cultural significance behind Tamil Nadu's most important four-day festival.",
    category: "Culture",
    date: "Sep 15, 2026",
    author: "Kavitha R.",
  },
  {
    id: 6,
    title: "Platform Update: New Interactive Quizzes!",
    excerpt: "We've completely revamped our testing engine. Earn XP, track your accuracy, and unlock new achievements.",
    category: "Updates",
    date: "Sep 02, 2026",
    author: "Mozhi Team",
  },
];

export default function BlogsPage() {
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
        <section className="mb-16 md:mb-24">
          <div className="group relative flex flex-col lg:flex-row gap-8 overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-mozhi-soft cursor-pointer">
            <div className="w-full lg:w-1/2 min-h-[300px] bg-slate-100 flex items-center justify-center relative overflow-hidden">
               {/* Placeholder for real image */}
               <div className="absolute inset-0 bg-gradient-to-tr from-mozhi-soft/20 to-mozhi-light/40"></div>
               <span className="text-slate-400 font-medium whitespace-nowrap">Featured Image Placeholder</span>
            </div>
            
            <div className="flex flex-col justify-center p-8 lg:w-1/2">
              <div className="mb-4">
                 <span className="inline-flex rounded-full bg-mozhi-light/50 px-3 py-1 text-xs font-bold text-mozhi-dark">
                   Editor's Choice
                 </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 group-hover:text-mozhi-primary transition-colors">
                The Nuances of Spoken vs. Written Tamil
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6 line-clamp-3">
                Written Tamil is highly formalized, but spoken Tamil relies heavily on colloquialisms and regional dialects. Learn how to bridge the gap and sound like a native faster.
              </p>
              
              <div className="flex items-center gap-6 mt-auto border-t border-slate-100 pt-6">
                 <div className="flex items-center gap-2 text-sm text-slate-600">
                    <UserCircle className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold text-slate-900">Dr. Selvam</span>
                 </div>
                 <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Oct 20, 2026</span>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Article Grid */}
        <section className="mb-16">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Latest Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {mockPosts.map((post) => (
              <div 
                key={post.id} 
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-mozhi-soft cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="aspect-[16/9] w-full bg-slate-100 flex items-center justify-center relative overflow-hidden border-b border-slate-100">
                   <div className="absolute inset-0 bg-mozhi-light/20 group-hover:bg-mozhi-light/40 transition-colors"></div>
                   <span className="text-slate-400 text-sm font-medium">Thumbnail</span>
                </div>
                
                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-mozhi-primary transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
                    <span className="text-xs font-semibold text-slate-600">By {post.author}</span>
                    <span className="flex items-center gap-1 text-sm font-bold text-mozhi-primary group-hover:text-mozhi-secondary transition-colors">
                      Read <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Load More Output */}
        <div className="flex justify-center mb-10">
          <button className="rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors">
            Load More Articles
          </button>
        </div>

      </main>

      <Footer />
    </div>
  );
}
