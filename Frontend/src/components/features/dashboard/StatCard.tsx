import React from "react";
import { cn } from "@/lib/utils";
import { MoveUpRight, MoveDownRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string | React.ReactNode;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  return (
    <Card
      variant="elevated"
      className={cn("flex flex-col gap-6", className)}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10 shadow-inner">
          <Icon className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110" />
        </div>
        
        {trend && (
           <div className={cn(
             "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
             trend === "up" ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm" : 
             trend === "down" ? "bg-red-50 text-red-600 border-red-100 shadow-sm" : 
             "bg-gray-50 text-gray-400 border-gray-100"
           )}>
             <div className="flex items-center gap-1.5">
                {trend === "up" ? <MoveUpRight className="h-3.5 w-3.5" /> : 
                 trend === "down" ? <MoveDownRight className="h-3.5 w-3.5" /> : 
                 null}
                {trendValue}
             </div>
           </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">
          {title}
        </p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-4xl font-black tracking-tight text-gray-800">
            {value}
          </h3>
          {trend === "up" && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-2" />}
        </div>
        {description && (
          <p className="text-xs font-bold text-gray-500 leading-relaxed pr-4">
            {description}
          </p>
        )}
      </div>
    </Card>
  );
}
