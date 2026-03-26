import React from "react";
import { Award, Flame, Target, Trophy, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/features/dashboard/StatCard";

export default function StudentProgressPage() {
   return (
     <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500 pb-12">
        <div>
           <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
              Learning Progress
           </h1>
           <p className="mt-2 text-sm text-gray-500 font-medium">
              Visualize your Tamil learning journey and unlock achievements.
           </p>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Current Streak" value="12 Days" description="Learned for 12 days in a row" icon={Flame} trend="up" trendValue="+2" className="border-secondary/10 bg-secondary/5" />
            <StatCard title="Overall Accuracy" value="94%" description="Average quiz score" icon={Target} trend="up" trendValue="+1.2%" />
            <StatCard title="Total Experience" value="8,450" description="XP earned from milestones" icon={Trophy} trend="up" trendValue="+1.2k" />
            <StatCard title="Lessons Finished" value="34" description="Modules fully completed" icon={Award} trend="neutral" trendValue="Unit 3" />
        </div>

        {/* XP Chart Area (Visual structure only) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
               <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                  Weekly Activity
               </h3>
               <select className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-1.5 text-xs font-semibold text-gray-600 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all">
                  <option>Last 7 Days</option>
                  <option>Last Month</option>
               </select>
            </div>
           
           <div className="mt-6 flex h-64 items-end justify-between gap-2 px-4">
              {/* Mock Bar Chart */}
               {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                  const heights = ["h-32", "h-24", "h-48", "h-12", "h-64", "h-40", "h-56"];
                  return (
                     <div key={day} className="flex flex-col items-center gap-3 w-full group">
                        <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-primary transition-opacity">
                           {Math.floor(Math.random() * 500) + 50}
                        </span>
                        <div className={`w-full max-w-[48px] rounded-xl bg-accent/30 group-hover:bg-primary transition-all duration-300 ${heights[i]}`} />
                        <span className="text-xs font-semibold text-gray-400">{day}</span>
                     </div>
                  );
               })}
           </div>
       </div>

       {/* Badges / Achievements */}
       <div>
            <h3 className="text-base font-semibold text-gray-800 mb-6 uppercase tracking-widest">
               Achievements
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 text-center hover:border-secondary/20 transition-all group">
                   <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10 text-secondary border-4 border-secondary/5 transition-transform group-hover:scale-110">
                      <Flame className="h-10 w-10 fill-current" />
                   </div>
                   <h4 className="mt-4 font-bold text-gray-800 text-sm">7-Day Streak</h4>
                   <p className="mt-1 text-xs text-gray-500 font-medium">Completed</p>
                </div>
                
                <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 text-center hover:border-primary/20 transition-all group">
                   <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary border-4 border-primary/5 transition-transform group-hover:scale-110">
                      <Target className="h-10 w-10" />
                   </div>
                   <h4 className="mt-4 font-bold text-gray-800 text-sm">Sharpshooter</h4>
                   <p className="mt-1 text-xs text-gray-500 font-medium">Completed</p>
                </div>
 
                <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 text-center opacity-70 grayscale">
                   <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-400 border-4 border-gray-100">
                      <Award className="h-10 w-10" />
                   </div>
                   <h4 className="mt-4 font-bold text-gray-600 text-sm">Word Master</h4>
                   <p className="mt-2 text-[10px] font-bold text-primary uppercase tracking-widest bg-accent/30 px-2 py-0.5 rounded-full">Locked</p>
                </div>
 
                <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 text-center opacity-70 grayscale">
                   <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-400 border-4 border-gray-100">
                      <Trophy className="h-10 w-10" />
                   </div>
                   <h4 className="mt-4 font-bold text-gray-600 text-sm">Top 1 %</h4>
                   <p className="mt-2 text-[10px] font-bold text-primary uppercase tracking-widest bg-accent/30 px-2 py-0.5 rounded-full">Locked</p>
                </div>
            </div>
        </div>
    </div>
  );
}
