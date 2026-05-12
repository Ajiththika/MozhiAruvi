"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, AlertCircle, Loader2, Sparkles, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Mistake {
  _id: string;
  lessonId: {
    _id: string;
    title: string;
  };
  questionId: {
    _id: string;
    text: string;
    type: string;
    correctAnswer?: string;
    options?: string[];
    correctOptionIndex?: number;
    explanation?: string;
  };
  wrongAnswers: string[];
  isResolved: boolean;
  updatedAt: string;
}

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMistakes();
  }, []);

  async function fetchMistakes() {
    try {
      setLoading(true);
      const res = await api.get("/lessons/mistakes");
      setMistakes(res.data.mistakes || []);
    } catch (err) {
      console.error("Failed to fetch mistakes:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary/30" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Analyzing your struggles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30">
      <div className="max-w-5xl mx-auto py-12 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <Link href="/student/dashboard" className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm hover:scale-105 active:scale-95 transition-all group">
              <ArrowLeft className="w-5 h-5 text-primary/60 group-hover:text-primary" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BrainCircuit className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Personalized Review</span>
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Your Learning Gaps</h1>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-600">{mistakes.length} Items to Master</span>
          </div>
        </div>

        {mistakes.length === 0 ? (
          <Card className="p-20 text-center border-dashed rounded-[3rem]">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full scale-150" />
              <Sparkles className="w-16 h-16 text-primary relative" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-3">Flawless Record!</h2>
            <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
              You haven't made any mistakes yet. Keep pushing your boundaries to find new areas to grow.
            </p>
            <Button href="/student/lessons" className="mt-10 px-10 rounded-2xl">Start a Lesson</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {mistakes.map((mistake) => (
              <Card key={mistake._id} className="group overflow-hidden rounded-[2.5rem] border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 bg-slate-50/50 p-8 border-b md:border-b-0 md:border-r border-slate-100 space-y-4">
                    <div className="flex items-center gap-2">
                       <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[9px] font-black uppercase tracking-widest text-primary/60">
                         {mistake.lessonId.title}
                       </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-800 leading-tight">
                      {mistake.questionId.text}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Type: {mistake.questionId.type}
                    </p>
                  </div>
                  
                  <div className="flex-1 p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                          <AlertCircle className="w-3 h-3" /> Recent Struggles
                        </p>
                        <div className="space-y-2">
                          {mistake.wrongAnswers.slice(-3).map((wa, i) => (
                            <div key={i} className="px-4 py-2.5 bg-red-50/50 border border-red-100 rounded-xl text-sm font-medium text-red-700">
                              {wa}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" /> Correct Answer
                        </p>
                        <div className="px-4 py-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-sm font-bold text-emerald-700">
                          {mistake.questionId.correctAnswer || mistake.questionId.options?.[mistake.questionId.correctOptionIndex || 0]}
                        </div>
                      </div>
                    </div>

                    {mistake.questionId.explanation && (
                      <div className="pt-6 border-t border-slate-50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Academic Insight</p>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                          "{mistake.questionId.explanation}"
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end pt-4">
                      <Button 
                        href={`/student/lessons/${mistake.lessonId._id}`}
                        variant="primary" 
                        size="sm" 
                        className="rounded-xl px-8 h-10 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                      >
                        Retake Lesson
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
