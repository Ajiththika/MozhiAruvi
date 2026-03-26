"use client";

import React, { useEffect, useState } from "react";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { 
  BookOpen, Flame, Trophy, AlertCircle, ArrowRight, 
  PenTool, BookMarked, MessageSquare, 
  Clock, User, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { getDashboardData, SafeUser } from "@/services/authService";
import { Lesson } from "@/services/lessonService";
import { JoinRequest } from "@/services/eventService";
import { Blog } from "@/services/blogService";
import { TutorRequest } from "@/services/tutorService";
import { cn } from "@/lib/utils";

import { DashboardSkeleton } from "./DashboardSkeleton";

export default function StudentDashboard() {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [questions, setQuestions] = useState<TutorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardData()
      .then((data) => {
        setUser(data.user);
        setLessons(data.lessons);
        setJoinRequests(data.joinRequests);
        setBlogs(data.blogs);
        setQuestions(data.questions);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load dashboard data.");
      })
      .finally(() => setLoading(false));
  }, []);

  const nextLesson = lessons[0] ?? null;
  const upcomingEvents = joinRequests.filter(
    (r) => r.status === "approved" || r.status === "pending"
  );
  
  const recentBlogs = blogs.slice(0, 3);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto py-8 lg:py-12 px-2 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center p-2 border border-primary/10">
             <Trophy className="text-primary w-5 h-5" />
          </div>
          <span className="text-[10px] font-black text-primary tracking-widest uppercase">Student Hub</span>
        </div>
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-800 tracking-tight leading-tight">
            Vanakkam, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-lg text-gray-500 font-medium leading-relaxed mt-4">
            Continuing your journey into the world's oldest living classical language. Here's your current progress and community highlights.
          </p>
        </div>
      </div>

      {error && (
        <Card variant="outline" className="border-red-100 bg-red-50/30 flex items-center gap-4 text-red-600">
           <AlertCircle className="shrink-0 w-6 h-6" />
           <p className="font-bold tracking-tight">{error}</p>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Curriculum"
          value={lessons.length}
          description="Available modules"
          icon={BookOpen}
        />
        <StatCard
          title="Event RSVPs"
          value={upcomingEvents.length}
          description="Pending & Active"
          icon={Flame}
          trend={upcomingEvents.length > 0 ? "up" : "neutral"}
          trendValue="Live"
        />
        <StatCard
          title="Account Status"
          value={user?.role === "user" ? "Standard" : "Verified"}
          description={user?.role === "user" ? "Free Member" : "Tutor / Premium"}
          icon={Trophy}
        />
        <StatCard
          title="Contributions"
          value={blogs.length}
          description="Stories Shared"
          icon={PenTool}
        />
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 items-start">
        {/* Main Learning Path & Feed */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Section: Learning Roadmap */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-6">
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">Active Learning Path</h3>
              <Button href="/student/lessons" variant="ghost" size="sm" className="text-primary uppercase tracking-widest text-[10px] font-black">
                Full Curriculum <ArrowRight className="ml-2 w-3 h-3" />
              </Button>
            </div>

            {nextLesson ? (
              <Card variant="elevated" padding="lg" className="group relative overflow-hidden bg-primary shadow-2xl shadow-primary/20">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute top-1/2 left-0 opacity-[0.02] font-black text-[15rem] text-white select-none pointer-events-none -translate-x-1/4 -translate-y-1/2">
                   க
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                  <div className="flex-1 space-y-6 text-white text-center md:text-left">
                    <div className="space-y-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">
                        <Clock className="w-3.5 h-3.5" /> Resume Activity
                      </span>
                      <h4 className="text-3xl lg:text-4xl font-black tracking-tight drop-shadow-sm leading-tight">
                        {nextLesson.title}
                      </h4>
                      <p className="text-lg text-white/70 font-medium leading-relaxed line-clamp-2 italic">
                        "{nextLesson.description || "Continue where you left off in the foundational modules."}"
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                      <Button
                        href={`/student/lessons/${nextLesson._id}`}
                        className="bg-white text-primary hover:bg-white/90 border-none h-14 px-10 rounded-2xl shadow-xl shadow-black/10 w-full sm:w-auto"
                      >
                         Start Lesson <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      <div className="flex items-center gap-2 text-white/50 text-[10px] font-bold uppercase tracking-widest border border-white/10 rounded-full px-4 py-3">
                         <div className="flex -space-x-2">
                           {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-primary bg-white/20" />)}
                         </div>
                         <span className="ml-2">500+ active in this module</span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden lg:flex shrink-0 w-48 h-48 rounded-[3rem] bg-white/5 items-center justify-center border border-white/10 shadow-inner group-hover:rotate-6 transition-transform duration-700">
                     <BookMarked className="w-20 h-20 text-white/50" />
                  </div>
                </div>
              </Card>
            ) : (
              <Card variant="outline" padding="xl" className="flex flex-col items-center justify-center text-center border-dashed bg-gray-50/50">
                <BookOpen className="h-14 w-14 text-gray-200 mb-6" />
                <p className="text-lg font-black text-gray-400 uppercase tracking-widest">No Active Lessons</p>
                <Button href="/student/lessons" variant="primary" className="mt-6">Explore the Curriculum</Button>
              </Card>
            )}
          </div>

          {/* Section: Community Stories */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-6">
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">Recent Stories</h3>
              <Button href="/blogs" variant="ghost" size="sm" className="text-primary uppercase tracking-widest text-[10px] font-black">
                Writer's Hub <ArrowRight className="ml-2 w-3 h-3" />
              </Button>
            </div>
            
            {recentBlogs.length === 0 ? (
              <Card variant="outline" padding="xl" className="text-center group hover:bg-primary/5 transition-colors border-dashed">
                <PenTool className="h-12 w-12 text-gray-200 mx-auto mb-6" />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Stories Written Yet</p>
                <Link href="/blogs/create" className="text-primary font-black text-xs mt-4 block hover:underline tracking-widest uppercase">Draft Your First Piece →</Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {recentBlogs.map((post) => (
                  <Card key={post._id} variant="elevated" padding="md" className="group flex flex-col h-full hover:border-primary/20">
                    <CardHeader className="mb-4 flex items-center justify-between">
                       <span className={cn(
                         "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                         post.status === "published" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-50 text-gray-400 border-gray-100"
                       )}>
                         {post.status}
                       </span>
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </CardHeader>
                    <h4 className="text-xl font-black text-gray-800 group-hover:text-primary transition-colors tracking-tight line-clamp-1 mb-3">
                      {post.title}
                    </h4>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed italic flex-1 line-clamp-2">
                       "{post.excerpt || post.content.substring(0, 80) + "..."}"
                    </p>
                    <Link href={`/blogs/${post.slug || post._id}`} className="mt-8 pt-4 border-t border-gray-50 flex items-center justify-between group/link">
                       <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400 group-hover/link:text-primary transition-colors">Continue Reading</span>
                       <ArrowRight className="w-4 h-4 text-gray-300 group-hover/link:text-primary group-hover/link:translate-x-1 transition-all" />
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actionable Sidebar */}
        <div className="space-y-12 h-full">
          {/* Engaged Events Widget */}
          <div className="space-y-8">
            <h3 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
               My Events <span className="text-gray-200 text-sm">/ {upcomingEvents.length}</span>
            </h3>
            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <Card variant="flat" padding="lg" className="text-center border border-dashed border-gray-200">
                   <Flame className="h-10 w-10 text-gray-200 mx-auto mb-4" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">No Event Records</p>
                   <Button href="/events" variant="primary" size="sm" className="w-full h-12 shadow-lg shadow-primary/10">Browse Activities</Button>
                </Card>
              ) : (
                upcomingEvents.slice(0, 3).map((req) => {
                  const event = typeof req.eventId === "object" ? req.eventId : (typeof req.event === "object" ? req.event : null);
                  return (
                    <Card key={req._id} variant="elevated" padding="md" className="group cursor-pointer hover:bg-primary/5 transition-all">
                      <Link href="/events" className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-400 flex items-center justify-center border border-orange-100 group-hover:scale-110 transition-transform shadow-inner">
                           <Flame className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-black text-gray-800 tracking-tight truncate mb-1">
                             {event?.title ?? "Cultural Meetup"}
                           </p>
                           <div className="flex items-center gap-2">
                             <div className={cn(
                               "w-2 h-2 rounded-full",
                               req.status === "approved" ? "bg-emerald-400 animate-pulse" : "bg-orange-400"
                             )} />
                             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                               {req.status}
                             </span>
                           </div>
                        </div>
                      </Link>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* Academic Doubt History Widget */}
          <div className="space-y-8">
             <h3 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
               My Doubts <span className="text-gray-200 text-sm">/ {questions.length}</span>
            </h3>
            <div className="space-y-4">
              {questions.length === 0 ? (
                <Card variant="flat" padding="lg" className="text-center border border-dashed border-gray-200">
                   <MessageSquare className="h-10 w-10 text-gray-200 mx-auto mb-4" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">No Academic Support</p>
                   <Button href="/student/tutors" variant="outline" size="sm" className="w-full h-12 font-black uppercase tracking-widest">Connect with Tutor</Button>
                </Card>
              ) : (
                questions.slice(0, 3).map((q) => {
                  const statusColors = {
                    pending: "bg-amber-400",
                    accepted: "bg-blue-400",
                    replied: "bg-emerald-400 animate-pulse",
                    resolved: "bg-emerald-500",
                    declined: "bg-red-400"
                  };
                  const color = statusColors[q.status] ?? "bg-gray-400";
                  
                  return (
                    <Card key={q._id} variant="shadow" padding="md" className="group cursor-pointer hover:border-primary/20 transition-all border-none bg-white shadow-xl shadow-slate-200/20">
                      <Link href="/student/tutors/my-requests" className="space-y-4">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-bold text-gray-700 leading-relaxed italic line-clamp-2 lg:line-clamp-none">
                            "{q.content}"
                          </p>
                        </div>
                        <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", color)} />
                              <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{q.status}</span>
                           </div>
                           <ArrowRight className="w-3 h-3 text-gray-200 group-hover:text-primary transition-colors" />
                        </div>
                      </Link>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* Engagement Card */}
          {user?.role !== "user" && (
            <Card variant="elevated" padding="lg" className="bg-emerald-500 text-white shadow-2xl shadow-emerald-200 relative overflow-hidden group border-none">
               <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white opacity-[0.05] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
               <div className="relative z-10 space-y-8">
                  <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center border border-white/20 group-hover:rotate-12 transition-transform duration-500 shadow-xl">
                     <PenTool className="w-7 h-7 text-white" />
                  </div>
                  <div className="space-y-3">
                     <h4 className="text-2xl font-black tracking-tight leading-tight">Contribution Power</h4>
                     <p className="text-white/80 font-medium leading-relaxed">
                        As a verified member, you can share cultural heritage stories directly to the public feed.
                     </p>
                  </div>
                  <Button href="/blogs/create" className="bg-white text-emerald-600 hover:bg-emerald-50 border-none w-full h-14 rounded-2xl text-[10px] uppercase font-black tracking-widest shadow-xl shadow-black/10">
                     Start Drafting
                  </Button>
               </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
