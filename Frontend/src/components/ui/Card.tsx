import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "flat" | "shadow" | "outline" | "elevated";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

export function Card({
  children,
  className,
  variant = "shadow",
  padding = "md",
}: CardProps) {
  const baseClasses = "bg-surface overflow-hidden rounded-responsive transition-all duration-300";

  const variants = {
    flat: "bg-surface-soft border-none",
    shadow: "border border-border/80 shadow-sm",
    outline: "border-2 border-border/50 bg-transparent",
    elevated: "border border-border/50 shadow-xl shadow-slate-200/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5",
  };

  const paddings = {
    none: "p-0",
    sm: "p-4",
    md: "p-6 sm:p-8",
    lg: "p-8 sm:p-10",
    xl: "p-10 sm:p-12",
  };

  return (
    <div className={cn(baseClasses, variants[variant], paddings[padding], className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mb-6 border-b border-border/40 pb-4", className)}>{children}</div>;
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex-1", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mt-8 pt-6 border-t border-border/80", className)}>{children}</div>;
}

export default Card;
