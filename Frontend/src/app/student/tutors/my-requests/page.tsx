"use client";

import React, { useEffect, useState } from "react";
import { MessageSquare, Loader2, AlertCircle, ArrowLeft, Send, User, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { getMyTutorRequests, addRequestMessage, TutorRequest } from "@/services/tutorService";
import { cn } from "@/lib/utils";

export default function StudentRequestsPage() {
  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await getMyTutorRequests();
      setRequests(data);
    } catch (e) {
      setError("Could not load your tutor requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (requestId: string) => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const updated = await addRequestMessage(requestId, reply.trim(), "student");
      setRequests(prev => prev.map(r => r._id === requestId ? updated : r));
      setReply("");
    } catch (e) {
      alert("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const selectedRequest = requests.find(r => r._id === selectedId);

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/student/dashboard" className="h-10 w-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Doubt Support History</h1>
          <p className="text-sm text-gray-500 font-medium">Clear your doubts with expert guidance.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading interactions...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600 flex items-center gap-3 font-bold">
          <AlertCircle className="h-5 w-5" /> {error}
        </div>
      ) : requests.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-gray-100">
           <MessageSquare className="h-12 w-12 text-gray-200 mx-auto mb-6" />
           <h3 className="text-xl font-bold text-gray-800 uppercase tracking-widest">No requests yet</h3>
           <p className="text-gray-400 mt-2">Any questions you ask your tutors will appear here.</p>
           <Link href="/student/tutors" className="mt-8 inline-block text-sm font-bold text-primary hover:underline">Find a Teacher →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 ring-1 ring-slate-100 rounded-[2.5rem] bg-gray-50/30 p-2 overflow-hidden min-h-[600px]">
          {/* List */}
          <div className="lg:col-span-4 bg-white rounded-[2rem] border border-gray-100 overflow-y-auto max-h-[600px] shadow-sm">
            <div className="p-6 border-b border-slate-50">
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Recent Doubts</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {requests.map((r) => {
                const teacher = typeof r.teacherId === 'object' ? r.teacherId : null;
                const active = selectedId === r._id;
                return (
                  <button
                    key={r._id}
                    onClick={() => setSelectedId(r._id)}
                    className={cn(
                      "w-full p-6 text-left transition-all hover:bg-gray-50 flex items-start gap-4",
                      active && "bg-primary/5 ring-1 ring-inset ring-primary/10"
                    )}
                  >
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-100 overflow-hidden border border-slate-50 shadow-inner">
                      {teacher?.profilePhoto ? (
                        <img src={teacher.profilePhoto} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary/5 text-primary font-bold">
                          {teacher?.name?.charAt(0) || "T"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black uppercase text-primary/70">{r.requestType}</span>
                          <span className="text-[9px] text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                       </div>
                       <p className={cn("text-sm font-bold truncate", active ? "text-primary" : "text-gray-800")}>{r.content}</p>
                       <div className="flex items-center gap-2 mt-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border",
                            r.status === "replied" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                          )}>
                             {r.status}
                          </span>
                       </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thread Detail */}
          <div className="lg:col-span-8 bg-white rounded-[2rem] border border-gray-100 flex flex-col shadow-sm relative overflow-hidden">
            {!selectedId ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4 opacity-40">
                <MessageSquare className="h-12 w-12" />
                <p className="text-sm font-bold uppercase tracking-widest">Select a doubt to view details</p>
              </div>
            ) : (
              <>
                {/* Thread Header */}
                <div className="p-8 border-b border-slate-50 bg-gray-50/30 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {typeof selectedRequest?.teacherId === 'object' ? selectedRequest.teacherId.name : "Tutor Response"}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">ID: {selectedRequest?._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <span className={cn(
                    "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm",
                    selectedRequest?.status === "replied" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                  )}>
                    {selectedRequest?.status}
                  </span>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 max-h-[450px]">
                   {/* The initial question */}
                   <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 relative group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100/50">
                      <div className="absolute -top-3 left-8 bg-white text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Your Question</div>
                      <p className="text-lg font-bold text-gray-700 leading-relaxed italic">"{selectedRequest?.content}"</p>
                      {selectedRequest?.lessonId && typeof selectedRequest.lessonId === 'object' && (
                        <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-1 text-[11px] font-bold text-primary">
                           📖 {selectedRequest.lessonId.title}
                        </div>
                      )}
                   </div>

                   {/* The replies thread */}
                   {selectedRequest?.messages?.map((msg, idx) => (
                      <div key={idx} className={cn(
                        "flex flex-col gap-2 transition-all animate-in slide-in-from-bottom-3",
                        msg.senderRole === "student" ? "items-end" : "items-start"
                      )}>
                         <div className={cn(
                           "max-w-[85%] p-6 rounded-[1.8rem] text-sm font-bold leading-relaxed shadow-sm border",
                           msg.senderRole === "student" 
                             ? "bg-white text-white border-slate-800 rounded-tr-none" 
                             : "bg-white text-gray-700 border-gray-100 rounded-tl-none shadow-xl shadow-slate-100/30"
                         )}>
                            {msg.content}
                         </div>
                         <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest px-2">
                            {msg.senderRole === "teacher" ? "Expert Response" : "You"} · {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                   ))}
                </div>

                {/* Reply Box */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <div className="flex gap-4">
                    <textarea
                      rows={1}
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      placeholder="Type your follow-up message..."
                      className="flex-1 rounded-2xl border border-gray-100 bg-white px-6 py-3.5 text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none shadow-inner"
                    />
                    <button
                      onClick={() => handleSendMessage(selectedId!)}
                      disabled={sending || !reply.trim()}
                      className="h-12 w-12 shrink-0 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 hover:bg-white transition-all active:scale-90 disabled:opacity-30"
                    >
                      {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="mt-3 text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
                    Maintain a professional interaction for best results.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
