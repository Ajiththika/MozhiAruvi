"use client";

import React, { useEffect, useState } from "react";
import { StatCard } from "@/components/common/StatCard";
import { BookOpen, Target, Flame, Trophy, Loader2, AlertCircle, ArrowRight, PenTool, BookMarked, UserCircle } from "lucide-react";
import Link from "next/link";
import Button from "@/components/common/Button";
import { getMe, SafeUser } from "@/services/authService";
import { getLessons, Lesson } from "@/services/lessonService";
import { getMyJoinRequests, JoinRequest } from "@/services/eventService";
import { getMyBlogs, Blog } from "@/services/blogService";
import { cn } from "@/lib/utils";

export default function StudentDashboard() {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMe(), getLessons(), getMyJoinRequests(), getMyBlogs()])
      .then(([u, { lessons }, jrs, b]) => {
        setUser(u);
        setLessons(lessons);
        setJoinRequests(jrs);
        setBlogs(b);
      })
      .catch(() => setError("Could not load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const nextLesson = lessons[0] ?? null;
  const upcomingEvents = joinRequests.filter(
    (r) => r.status === "approved" || r.status === "pending"
  );
  
  const recentBlogs = blogs.slice(0, 3);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <span className="h-1.5 w-10 rounded-full bg-primary" />
              <label>Student Dashboard</label>
           </div>
           <h1>Welcome back, {user?.name?.split(" ")[0]}!</h1>
           <p className="max-w-2xl">
            Track your progress, manage your community events, and contribute to the Tamil heritage feed.
           </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-sm font-bold text-red-700 animate-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Curriculum"
          value={String(lessons.length)}
          description="Available modules"
          icon={BookOpen}
          className="border-primary/5 bg-primary/5 shadow-none rounded-[2rem]"
        />
        <StatCard
          title="Event RSVPs"
          value={String(upcomingEvents.length)}
          description="Confirmed activities"
          icon={Flame}
          trend={upcomingEvents.length > 0 ? "up" : "neutral"}
          className="border-amber-100/50 bg-amber-50/30 shadow-none text-amber-700 rounded-[2rem]"
        />
        <StatCard
          title="Account Status"
          value={user?.role === "user" ? "Free" : "Premium"}
          description={user?.role === "user" ? "Standard member" : "Verified premium"}
          icon={Trophy}
          className="border-slate-100 bg-white shadow-none rounded-[2rem]"
        />
        <StatCard
          title="Story Contributions"
          value={String(blogs.length)}
          description="Total stories written"
          icon={PenTool}
          className="border-secondary/5 bg-secondary/5 shadow-none text-secondary rounded-[2rem]"
        />
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Next Lesson */}
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center justify-between px-2">
              <h3>Continue Learning</h3>
              <Link href="/student/lessons" className="text-sm font-bold text-primary hover:underline transition-all">View curriculum</Link>
           </div>

          {nextLesson ? (
            <div className="flex flex-col md:flex-row gap-8 rounded-[2rem] border border-slate-100 bg-white p-8 md:p-12 shadow-xl shadow-slate-200/20 transition-all group overflow-hidden relative hover:shadow-2xl hover:shadow-primary/5">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 group-hover:scale-110 transition-transform duration-1000" />
              
              <div className="flex-1 space-y-6 relative z-10">
                <span className="inline-flex rounded-full bg-primary/10 px-5 py-2 text-[11px] font-bold text-primary uppercase tracking-widest border border-primary/5">
                  Module {nextLesson.moduleNumber}
                </span>
                <h2 className="md:text-4xl text-slate-900 leading-tight">
                  {nextLesson.title}
                </h2>
                <p className="max-w-lg">
                  {nextLesson.description || "Master the foundation of Tamil language through our structured curriculum."}
                </p>
                
                <div className="pt-4 flex items-center justify-start">
                  <Button
                    href={`/student/lessons/${nextLesson._id}`}
                    variant="primary"
                    size="lg"
                    className="group"
                  >
                    Resume Lesson <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 p-16 text-center bg-white/50">
               <BookMarked className="h-16 w-16 text-slate-200 mb-6" />
                <h4 className="text-slate-900">No lessons available yet</h4>
                <p className="mt-2 max-w-xs mx-auto text-sm">We are currently updating our curriculum. Check back soon for new content!</p>
            </div>
          )}

          {/* Recently Authored stories */}
          <div className="pt-8 space-y-8">
             <div className="flex items-center justify-between px-2">
                <h3>My Recent Stories</h3>
                <Link href="/student/blogs" className="text-sm font-bold text-primary hover:underline transition-all">All contributions</Link>
             </div>
             
             {recentBlogs.length === 0 ? (
                <div className="rounded-[2rem] border border-slate-100 bg-white p-16 text-center shadow-sm">
                   <PenTool className="h-12 w-12 text-slate-200 mx-auto mb-6" />
                   <p className="font-bold text-slate-500">You haven't shared any stories yet.</p>
                   <Link href="/student/blogs/create" className="text-primary font-bold text-sm mt-3 block hover:underline">Write your first story →</Link>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {recentBlogs.map((post) => (
                      <Link 
                        key={post._id} 
                        href={`/blogs/${post.slug || post._id}`} 
                        className="group flex flex-col p-8 rounded-[2rem] border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all"
                      >
                         <div className="flex items-center justify-between mb-6">
                            <span className={cn(
                              "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
                              post.status === 'published' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                            )}>
                               {post.status}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                         </div>
                         <h4 className="group-hover:text-primary transition-colors line-clamp-1 mb-3">{post.title}</h4>
                         <p className="text-sm line-clamp-2 flex-1">{post.excerpt || post.content.substring(0, 80) + "..."}</p>
                         <div className="mt-6 flex items-center justify-end">
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                         </div>
                      </Link>
                   ))}
                </div>
             )}
          </div>
        </div>

        {/* Sidebar Sections */}
        <div className="space-y-16">
          {/* Upcoming Events */}
          <div className="space-y-8">
            <h3 className="px-2">Engaged Events</h3>
            <div className="flex flex-col gap-6">
              {upcomingEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 p-12 text-center bg-white/50">
                   <Flame className="h-10 w-10 text-slate-200 mb-4" />
                  <p className="font-bold text-slate-500 mb-6">No RSVPs tracked yet</p>
                  <Button href="/events" variant="secondary" size="md" className="w-full">
                    Explore Events
                  </Button>
                </div>
              ) : (
                  upcomingEvents.slice(0, 4).map((req) => {
                  const event = typeof req.event === "object" ? req.event : null;
                  return (
                    <div key={req._id} className="group flex items-center gap-5 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm hover:shadow-xl transition-all">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <Flame className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm truncate mb-1">
                          {event?.title ?? "Community Meetup"}
                        </h4>
                        <div className="flex items-center gap-2">
                           <span className={cn(
                             "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                             req.status === 'approved' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                           )}>
                              {req.status}
                           </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          {/* Contribution Prompt */}
          <div className="bg-slate-900 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/30 to-transparent pointer-events-none" />
             <div className="relative z-10 space-y-8">
                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
                   <PenTool className="w-7 h-7 text-primary" />
                </div>
                <div className="space-y-3">
                   <h3 className="text-white">Share your journey</h3>
                   <p className="text-slate-400 font-medium">
                      Write cultural stories, language tips, or personal experiences.
                   </p>
                </div>
                <Button href="/student/blogs/create" variant="primary" size="lg" className="w-full bg-primary hover:bg-white hover:text-slate-900 border-none transition-all duration-500">
                   Start a Story
                </Button>
             </div>
          </div>
        </div>
      </div>
    </div>

  );
}