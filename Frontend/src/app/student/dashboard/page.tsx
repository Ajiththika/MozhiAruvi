"use client";

import React, { useEffect, useState } from "react";
import { StatCard } from "@/components/common/StatCard";
import { BookOpen, Target, Flame, Trophy, Loader2, AlertCircle, ArrowRight, PenTool, BookMarked, UserCircle, MessageCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import Button from "@/components/common/Button";
import { getMe, SafeUser } from "@/services/authService";
import { getLessons, Lesson } from "@/services/lessonService";
import { getMyJoinRequests, JoinRequest } from "@/services/eventService";
import { getMyBlogs, Blog } from "@/services/blogService";
import { getMyTutorRequests, TutorRequest } from "@/services/tutorService";
import { cn } from "@/lib/utils";

export default function StudentDashboard() {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [questions, setQuestions] = useState<TutorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMe(), getLessons(), getMyJoinRequests(), getMyBlogs(), getMyTutorRequests()])
      .then(([u, { lessons }, jrs, b, qs]) => {
        setUser(u);
        setLessons(lessons);
        setJoinRequests(jrs);
        setBlogs(b);
        setQuestions(qs.slice(0, 5));
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
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-1">
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <span className="h-1.5 w-8 rounded-full bg-primary" />
              <span className="text-xs font-bold text-primary tracking-tight">Student Dashboard</span>
           </div>
           <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">Welcome back, {user?.name?.split(" ")[0]}!</h1>
           <p className="text-base text-slate-600 font-medium leading-relaxed max-w-xl">
            Track your progress, manage your community events, and contribute to the Tamil heritage feed.
           </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-sm font-bold text-red-700 animate-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Curriculum"
          value={String(lessons.length)}
          description="Available modules"
          icon={BookOpen}
          className="border-primary/10 bg-primary/5 shadow-none"
        />
        <StatCard
          title="Event RSVPs"
          value={String(upcomingEvents.length)}
          description="Confirmed activities"
          icon={Flame}
          trend={upcomingEvents.length > 0 ? "up" : "neutral"}
          className="border-amber-100 bg-amber-50/30 shadow-none text-amber-700"
        />
        <StatCard
          title="Account Status"
          value={user?.role === "user" ? "Free" : "Premium"}
          description={user?.role === "user" ? "Standard member" : "Verified premium"}
          icon={Trophy}
          className="border-slate-100 bg-slate-50 shadow-none"
        />
        <StatCard
          title="Story Contributions"
          value={String(blogs.length)}
          description="Total stories written"
          icon={PenTool}
          className="border-secondary/10 bg-secondary/5 shadow-none text-secondary"
        />
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Next Lesson */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Continue Learning</h3>
              <Link href="/student/lessons" className="text-sm font-bold text-primary hover:underline">View curriculum</Link>
           </div>

          {nextLesson ? (
            <div className="flex flex-col md:flex-row gap-8 rounded-[2.5rem] border border-slate-100 bg-white p-8 md:p-10 shadow-2xl shadow-slate-200/20 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
              
              <div className="flex-1 space-y-4 relative z-10">
                <span className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-[11px] font-bold text-primary uppercase tracking-widest border border-primary/5">
                  Module {nextLesson.moduleNumber}
                </span>
                <h4 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                  {nextLesson.title}
                </h4>
                <p className="text-base text-slate-600 font-medium leading-relaxed max-w-lg">
                  {nextLesson.description || "Master the foundation of Tamil language through our structured curriculum."}
                </p>
                
                <div className="pt-4 flex items-center justify-start">
                  <Button
                    href={`/student/lessons/${nextLesson._id}`}
                    variant="primary"
                    size="md"
                    className="h-14 px-8 rounded-2xl group"
                  >
                    Resuming Lesson <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-slate-200 p-12 text-center bg-slate-50/50">
               <BookMarked className="h-12 w-12 text-slate-300 mb-4" />
                <p className="text-base font-bold text-slate-900 tracking-tight">No lessons available yet</p>
                <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">We are currently updating our curriculum. Check back soon for new content!</p>
            </div>
          )}

          {/* Recently Authored stories */}
          <div className="pt-6 space-y-6">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">My Recent Stories</h3>
                <Link href="/student/blogs" className="text-sm font-bold text-primary hover:underline">All contributions</Link>
             </div>
             
             {recentBlogs.length === 0 ? (
                <div className="rounded-[2.5rem] border border-slate-100 bg-white p-12 text-center shadow-sm">
                   <PenTool className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                   <p className="text-sm font-bold text-slate-500">You haven't shared any stories yet.</p>
                   <Link href="/student/blogs/create" className="text-primary font-bold text-sm mt-2 block hover:underline">Write your first story →</Link>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {recentBlogs.map((post) => (
                      <Link 
                        key={post._id} 
                        href={`/blogs/${post.slug || post._id}`} 
                        className="group flex flex-col p-6 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all"
                      >
                         <div className="flex items-center justify-between mb-4">
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest",
                              post.status === 'published' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                            )}>
                               {post.status}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                         </div>
                         <h4 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1 mb-2 tracking-tight">{post.title}</h4>
                         <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed flex-1">{post.excerpt || post.content.substring(0, 80) + "..."}</p>
                         <div className="mt-4 flex items-center justify-end">
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                         </div>
                      </Link>
                   ))}
                </div>
             )}
          </div>
        </div>

        {/* Sidebar Sections */}
        <div className="space-y-12">
          {/* Upcoming Events */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight px-2">Engaged Events</h3>
            <div className="flex flex-col gap-4">
              {upcomingEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-slate-200 p-10 text-center bg-slate-50/50">
                   <Flame className="h-8 w-8 text-slate-300 mb-3" />
                  <p className="text-sm font-bold text-slate-500 mb-4">No RSVPs tracked yet</p>
                  <Button href="/events" variant="secondary" size="sm" className="w-full rounded-xl">
                    Explore Events
                  </Button>
                </div>
              ) : (
                  upcomingEvents.slice(0, 4).map((req) => {
                  const event = typeof req.event === "object" ? req.event : null;
                  return (
                    <div key={req._id} className="group flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-lg transition-all">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <Flame className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate tracking-tight">
                          {event?.title ?? "Community Meetup"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className={cn(
                             "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md",
                             req.status === 'approved' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
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
          
          {/* My Tutor Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">My Questions</h3>
              <Link href="/student/tutors" className="text-sm font-bold text-primary hover:underline">Find Tutors</Link>
            </div>

            {questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-slate-200 p-8 text-center bg-slate-50/50 gap-3">
                <MessageCircle className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-bold text-slate-500">No questions yet</p>
                <p className="text-xs text-slate-400">Ask a tutor during any lesson for help</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {questions.map(q => {
                  const statusMap = {
                    pending: { icon: <Clock className="h-3 w-3" />, label: "Pending", cls: "bg-amber-50 text-amber-600 border-amber-100" },
                    accepted: { icon: <Clock className="h-3 w-3" />, label: "Accepted", cls: "bg-blue-50 text-blue-600 border-blue-100" },
                    replied: { icon: <CheckCircle className="h-3 w-3" />, label: "Replied", cls: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                    resolved: { icon: <CheckCircle className="h-3 w-3" />, label: "Resolved", cls: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                    declined: { icon: <XCircle className="h-3 w-3" />, label: "Declined", cls: "bg-red-50 text-red-600 border-red-100" },
                  };
                  const st = statusMap[q.status] ?? statusMap.pending;
                  const lessonCtx = typeof q.lessonId === "object" ? q.lessonId : null;
                  const teacherInfo = typeof q.teacherId === "object" ? q.teacherId : null;
                  return (
                    <div key={q._id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-slate-800 line-clamp-2 flex-1">{q.content}</p>
                        <span className={cn("shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide", st.cls)}>
                          {st.icon} {st.label}
                        </span>
                      </div>
                      {lessonCtx && (
                        <p className="text-[11px] font-semibold text-primary truncate">
                          📖 {lessonCtx.title}
                        </p>
                      )}
                      {q.teacherReply && (
                        <div className="rounded-2xl bg-primary/5 border border-primary/10 px-3 py-2.5">
                          <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-1">Tutor Reply</p>
                          <p className="text-xs font-medium text-slate-700 line-clamp-3">{q.teacherReply}</p>
                        </div>
                      )}
                      {teacherInfo && (
                        <p className="text-[11px] text-slate-400 font-semibold">via {teacherInfo.name}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Contribution Prompt */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
             <div className="relative z-10 space-y-6">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                   <PenTool className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-2">
                   <h4 className="text-lg font-bold tracking-tight">Share your journey</h4>
                   <p className="text-sm text-slate-400 font-medium leading-relaxed">
                      Write cultural stories, language tips, or personal experiences.
                   </p>
                </div>
                <Button href="/student/blogs/create" variant="primary" size="md" className="w-full h-14 rounded-2xl bg-primary text-white hover:bg-white hover:text-slate-900 transition-colors">
                   Start a Story
                </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}