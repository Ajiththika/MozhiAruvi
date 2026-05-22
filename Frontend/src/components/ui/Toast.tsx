"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setItems((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismiss = (id: string) => setItems((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl bg-white animate-in slide-in-from-right duration-300",
              t.type === "success" && "border-emerald-200",
              t.type === "error" && "border-red-200",
              t.type === "info" && "border-slate-200"
            )}
          >
            {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
            {t.type === "error" && <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
            {t.type === "info" && <Info className="w-5 h-5 text-primary shrink-0" />}
            <p className="text-sm font-bold text-slate-700 flex-1">{t.message}</p>
            <button type="button" onClick={() => dismiss(t.id)} className="text-slate-300 hover:text-slate-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: (msg: string) => {
        if (typeof window !== "undefined") alert(msg);
      },
    };
  }
  return ctx;
}
