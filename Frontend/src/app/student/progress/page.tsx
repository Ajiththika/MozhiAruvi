import React from "react";
import { Award, Flame, Target, Trophy, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";

export default function StudentProgressPage() {
  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500 pb-12">
       <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate- dark:text-slate-">
             Your Progress 📈
          </h2>
          <p className="mt-1 text-slate- dark:text-slate-">
             Visualize your Tamil learning journey and unlock achievements.
          </p>
       </div>

       {/* Top Metrics Row */}
       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
           <StatCard title="Current Streak" value="12 Days" icon={Flame} trend="up" trendValue="+2" className="border-orange-200 bg-orange-50/50 dark:border-orange-900/40 dark:bg-orange-950/20" />
           <StatCard title="Accuracy" value="94%" icon={Target} trend="up" trendValue="+1.2%" />
           <StatCard title="Total XP" value="8,450" icon={Trophy} trend="up" trendValue="+1,200 XP" />
           <StatCard title="Lessons Finished" value="34" icon={Award} trend="neutral" trendValue="Unit 3" />
       </div>

       {/* XP Chart Area (Visual structure only) */}
       <div className="rounded-2xl border border-slate- bg-white p-6 shadow-sm dark:border-slate- dark:bg-slate-">
           <div className="flex items-center justify-between border-b border-slate- pb-4 dark:border-slate-">
              <h3 className="font-bold text-slate- dark:text-slate- flex items-center gap-2">
                 <TrendingUp className="h-5 w-5 text-mozhi-secondary" />
                 Weekly XP Earning
              </h3>
              <select className="rounded-lg border border-slate- bg-slate- px-3 py-1 text-sm dark:border-slate- dark:bg-slate- dark:text-slate-">
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
                       <span className="opacity-0 group-hover:opacity-100 text-xs font-bold text-mozhi-primary transition-opacity dark:text-mozhi-secondary">
                          {Math.floor(Math.random() * 500) + 50}
                       </span>
                       <div className={`w-full max-w-[48px] rounded-t-lg bg-mozhi-light dark:bg-mozhi-primary/20 group-hover:bg-mozhi-primary dark:group-hover:bg-mozhi-primary transition-colors ${heights[i]}`} />
                       <span className="text-xs font-semibold text-slate- dark:text-slate-">{day}</span>
                    </div>
                 );
              })}
           </div>
       </div>

       {/* Badges / Achievements */}
       <div>
           <h3 className="text-xl font-bold text-slate- dark:text-slate- mb-6">
              Achievements
           </h3>
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="flex flex-col items-center rounded-2xl border border-slate- bg-slate- p-6 text-center dark:border-slate- dark:bg-slate-">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-500 border-4 border-orange-200 dark:border-orange-800/50">
                     <Flame className="h-10 w-10 fill-current" />
                  </div>
                  <h4 className="mt-4 font-bold text-slate- dark:text-slate-">7-Day Streak</h4>
                  <p className="mt-1 text-xs text-slate- dark:text-slate-">Learned for 7 days in a row</p>
               </div>
               
               <div className="flex flex-col items-center rounded-2xl border border-mozhi-light bg-mozhi-light/50/50 p-6 text-center dark:border-blue-900/20 dark:bg-mozhi-dark/50">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-mozhi-light text-mozhi-primary dark:bg-mozhi-dark/50 dark:text-mozhi-secondary border-4 border-mozhi-light dark:border-mozhi-primary/30">
                     <Target className="h-10 w-10" />
                  </div>
                  <h4 className="mt-4 font-bold text-slate- dark:text-slate-">Sharpshooter</h4>
                  <p className="mt-1 text-xs text-slate- dark:text-slate-">Complete 5 quizzes with 100%</p>
               </div>

               <div className="flex flex-col items-center rounded-2xl border border-slate- bg-slate-/50 p-6 text-center opacity-70 grayscale dark:border-slate- dark:bg-slate-">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate- text-slate- dark:bg-slate- dark:text-slate- border-4 border-slate- dark:border-slate-">
                     <Award className="h-10 w-10" />
                  </div>
                  <h4 className="mt-4 font-bold text-slate- dark:text-slate-">Word Master</h4>
                  <p className="mt-1 text-xs text-slate- dark:text-slate-">Learn 500 Vocabulary Words</p>
                  <p className="mt-2 text-[10px] font-bold text-mozhi-primary uppercase tracking-wider dark:text-mozhi-secondary">Locked</p>
               </div>

               <div className="flex flex-col items-center rounded-2xl border border-slate- bg-slate-/50 p-6 text-center opacity-70 grayscale dark:border-slate- dark:bg-slate-">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate- text-slate- dark:bg-slate- dark:text-slate- border-4 border-slate- dark:border-slate-">
                     <Trophy className="h-10 w-10" />
                  </div>
                  <h4 className="mt-4 font-bold text-slate- dark:text-slate-">Top 10% Learner</h4>
                  <p className="mt-1 text-xs text-slate- dark:text-slate-">Earn 50,000 XP in a month</p>
                  <p className="mt-2 text-[10px] font-bold text-mozhi-primary uppercase tracking-wider dark:text-mozhi-secondary">Locked</p>
               </div>
           </div>
       </div>
    </div>
  );
}