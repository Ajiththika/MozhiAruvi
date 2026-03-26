import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-[95vw] h-[95vh]",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden sm:overflow-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-text-primary/10 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-[2.5rem] bg-surface shadow-3xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 fill-mode-forwards border border-border/60",
          sizes[size]
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/40 bg-surface-soft/40 px-8 py-6">
            <div className="space-y-1.5">
               <div className="flex items-center gap-2">
                  <span className="h-1 w-4 rounded-full bg-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">System Dialog</span>
               </div>
              <h3 className="text-2xl font-black text-text-primary tracking-tight leading-none pt-1">
                {title}
              </h3>
              {description && (
                <p className="text-sm font-semibold text-text-secondary italic">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-background p-3 text-text-secondary transition-all hover:bg-error/5 hover:text-error active:scale-90 border border-border/40"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
