import React, { useState } from "react";
import { completeOnboarding } from "@/services/authService";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";

const steps = [
  {
    id: "age",
    title: "What is your age?",
    options: ["Under 18", "18-24", "25-34", "35-44", "45+"],
  },
  {
    id: "level",
    title: "What is your current Tamil level?",
    options: ["Basic", "Intermediate", "Advanced"],
  },
  {
    id: "goal",
    title: "Why are you learning Tamil?",
    options: ["Travel", "Career", "Culture & Family", "School", "Brain Exercise"],
  },
  {
    id: "time",
    title: "How much time can you spend daily?",
    options: ["5 mins", "15 mins", "30 mins", "60+ mins"],
  },
  {
    id: "knowledge",
    title: "What do you know already?",
    options: ["Nothing", "A few words", "Can read a bit", "Can hold a basic conversation"],
  },
];

export function LessonOnboarding({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = async (option: string) => {
    const step = steps[currentStep];
    const newAnswers = { ...answers, [step.id]: option };
    setAnswers(newAnswers);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setSubmitting(true);
      try {
        await completeOnboarding({
          age: newAnswers["age"],
          level: newAnswers["level"] as any,
          goal: newAnswers["goal"],
          timeAvailability: newAnswers["time"],
          priorKnowledge: newAnswers["knowledge"],
        });
        onSuccess();
        router.push("/student");
      } catch (err) {
        console.error("Onboarding error:", err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        {submitting ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Personalizing your path...</h2>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right-8 duration-300 relative">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                {steps.map((s, i) => (
                  <div key={s.id} className={`flex-1 h-3 rounded-full ${i <= currentStep ? "bg-primary" : "bg-gray-100"}`} />
                ))}
              </div>
              <h2 className="text-3xl font-black tracking-tight text-gray-800 mb-2">{step.title}</h2>
            </div>
            <div className="space-y-3">
              {step.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className="w-full text-left px-6 py-4 rounded-2xl border-2 border-gray-100 font-bold text-gray-700 hover:border-primary/50 hover:bg-primary/5 transition-all text-lg flex items-center justify-between group"
                >
                  {opt}
                  <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
