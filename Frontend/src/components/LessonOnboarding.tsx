"use client";

import React, { useState } from "react";
import { completeOnboarding } from "@/services/authService";
import { Loader2, ArrowRight, AlertCircle } from "lucide-react";

// Maps the human-readable choice to the backend enum value
const LEVEL_MAP: Record<string, "Basic" | "Intermediate" | "Advanced"> = {
  "Beginner — I know nothing": "Basic",
  "Elementary — I know a few words": "Basic",
  "Intermediate — I can read a bit": "Intermediate",
  "Advanced — I can hold a conversation": "Advanced",
};

// Level is FIRST — it must be captured before any other step
const steps = [
  {
    id: "level",
    title: "How much Tamil do you know?",
    subtitle: "We'll build your personal path from here.",
    options: [
      "Beginner — I know nothing",
      "Elementary — I know a few words",
      "Intermediate — I can read a bit",
      "Advanced — I can hold a conversation",
    ],
  },
  {
    id: "goal",
    title: "Why are you learning Tamil?",
    subtitle: "Your goal shapes how we teach you.",
    options: ["Travel", "Career", "Culture & Family", "School", "Brain Exercise"],
  },
  {
    id: "time",
    title: "How much time can you spend daily?",
    subtitle: "Even 5 minutes a day makes a difference.",
    options: ["5 mins", "15 mins", "30 mins", "60+ mins"],
  },
];

export function LessonOnboarding({ onSuccess }: { onSuccess: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSelect(option: string) {
    const step = steps[currentStep];
    const newAnswers = { ...answers, [step.id]: option };
    setAnswers(newAnswers);

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Last step — submit to backend
      setSubmitting(true);
      setSubmitError(null);
      try {
        const rawLevel = newAnswers["level"] || "";
        const mappedLevel = LEVEL_MAP[rawLevel] ?? "Basic";
        await completeOnboarding({
          level: mappedLevel,
          goal: newAnswers["goal"],
          timeAvailability: newAnswers["time"],
        });
        onSuccess();
      } catch (err: any) {
        console.error("Onboarding error:", err);
        setSubmitError(
          err?.response?.data?.message ?? "Something went wrong. Please try again."
        );
        setSubmitting(false);
      }
    }
  }

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

        {submitting ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-xl font-bold text-gray-800">Personalizing your path...</h2>
            <p className="text-sm text-gray-400 font-medium">Just a moment.</p>
          </div>
        ) : (
          <div key={currentStep} className="animate-in slide-in-from-right-8 duration-300">

            {/* Progress indicators */}
            <div className="flex items-center gap-2 mb-6">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2.5 rounded-full transition-all duration-500 ${
                    i <= currentStep ? "bg-primary" : "bg-gray-100"
                  }`}
                />
              ))}
            </div>

            {/* Question */}
            <div className="mb-6">
              <h2 className="text-3xl font-black tracking-tight text-gray-800 mb-1">
                {step.title}
              </h2>
              {step.subtitle && (
                <p className="text-sm text-gray-400 font-medium">{step.subtitle}</p>
              )}
            </div>

            {/* Error banner */}
            {submitError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm font-bold px-4 py-3 rounded-xl mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {submitError}
              </div>
            )}

            {/* Answer options */}
            <div className="space-y-3">
              {step.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className="w-full text-left px-6 py-4 rounded-2xl border-2 border-gray-100 font-bold text-gray-700 hover:border-primary/50 hover:bg-primary/5 transition-all text-base flex items-center justify-between group"
                >
                  {opt}
                  <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </button>
              ))}
            </div>

            <p className="text-center text-[10px] font-black uppercase tracking-widest text-gray-300 mt-6">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
