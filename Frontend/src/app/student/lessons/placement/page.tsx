"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { setLevel } from "@/services/userService";
import { Loader2, CheckCircle2, ChevronRight, BookOpen, GraduationCap, Mountain } from "lucide-react";

export default function PlacementPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const levels = [
    {
      id: "Beginner",
      title: "New to Tamil",
      description: "Learn alphabets and basic words.",
      icon: <BookOpen className="w-8 h-8 text-blue-500" />,
    },
    {
      id: "Intermediate",
      title: "Know some words",
      description: "Build sentences and improve pronunciation.",
      icon: <GraduationCap className="w-8 h-8 text-purple-500" />,
    },
    {
      id: "Advanced",
      title: "Can converse basically",
      description: "Master complex structures and fluency.",
      icon: <Mountain className="w-8 h-8 text-pink-500" />,
    },
  ];

  async function handleComplete() {
    if (!selectedLevel) return;
    setSaving(true);
    setError(null);
    try {
      await setLevel(selectedLevel as any);
      router.push("/student/lessons");
    } catch (e: any) {
      setError("Could not save level. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-20 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-4 tracking-tight">
          How much Tamil do you know?
        </h1>
        <p className="text-lg text-slate-500">
          This helps us build a personalized lesson path for you.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {levels.map((l) => (
          <button
            key={l.id}
            onClick={() => setSelectedLevel(l.id)}
            className={`w-full flex items-center p-6 border-2 rounded-2xl transition-all duration-300 text-left ${
              selectedLevel === l.id
                ? "border-mozhi-primary bg-blue-50 shadow-md scale-[1.02]"
                : "border-slate-200 bg-white hover:border-mozhi-primary/50 hover:bg-slate-50"
            }`}
          >
            <div className="shrink-0 mr-4 bg-white p-2 rounded-full shadow-sm">
              {l.icon}
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-bold ${selectedLevel === l.id ? "text-mozhi-primary" : "text-slate-800"}`}>
                {l.title}
              </h3>
              <p className="text-slate-500">{l.description}</p>
            </div>
            <div className="shrink-0 ml-4">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedLevel === l.id
                    ? "border-mozhi-primary bg-mozhi-primary"
                    : "border-slate-300"
                }`}
              >
                {selectedLevel === l.id && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
            </div>
          </button>
        ))}
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <button
        disabled={!selectedLevel || saving}
        onClick={handleComplete}
        className="w-full flex items-center justify-center gap-2 bg-mozhi-primary text-white py-4 px-8 rounded-2xl font-bold text-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed hover:shadow-lg active:scale-95"
      >
        {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : "Continue"}
        {!saving && <ChevronRight className="w-6 h-6" />}
      </button>
    </div>
  );
}
