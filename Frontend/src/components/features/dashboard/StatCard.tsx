import React from "react";
import { cn } from "@/lib/utils";
import { MoveUpRight, MoveDownRight } from "lucide-react";
import Card from "@/components/ui/Card";

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
      className={cn("flex flex-col gap-6 hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group", className)}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 shadow-inner group-hover:bg-slate-200/50 transition-colors">
          <Icon className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110" />
        </div>
        
        {trend && (
           <div className={cn(
             "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
             trend === "up" ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm" : 
             trend === "down" ? "bg-red-50 text-red-600 border-red-100 shadow-sm" : 
             "bg-slate-50 text-primary/60 border-slate-100"
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
        <p className="text-xs font-bold text-slate-600 uppercase tracking-[0.15em] leading-none mb-1">
          {title}
        </p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-2xl font-black tracking-tight text-slate-900">
            {value}
          </h3>
          {trend === "up" && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-2" />}
        </div>
        {description && (
          <p className="text-xs font-semibold text-slate-600 leading-relaxed pr-4">
            {description}
          </p>
        )}
      </div>
    </Card>
  );
}

export default StatCard;













