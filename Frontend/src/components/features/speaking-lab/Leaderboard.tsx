"use client";

import React from "react";
import { Trophy, Flame, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeaderboardResult } from "@/services/speakingLabService";

interface LeaderboardProps {
  data?: LeaderboardResult;
  isLoading?: boolean;
}

const MEDAL = ["bg-amber-400 text-slate-900", "bg-slate-300 text-slate-800", "bg-orange-400 text-white"];

export function Leaderboard({ data, isLoading }: LeaderboardProps) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
          <Trophy className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-primary">Leaderboard</h3>
          <p className="text-[10px] font-semibold text-slate-400">Top speakers this season</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
        </div>
      ) : !data || data.leaderboard.length === 0 ? (
        <p className="text-center text-xs font-semibold text-slate-400 py-8">Be the first to climb the ranks!</p>
      ) : (
        <div className="space-y-2">
          {data.leaderboard.map((entry) => {
            const isMe = entry.rank === data.me.rank && entry.xp === data.me.xp;
            return (
              <div
                key={entry.userId}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-2xl border transition-all",
                  isMe ? "bg-primary/5 border-primary/20" : "bg-slate-50/60 border-transparent"
                )}
              >
                <span
                  className={cn(
                    "h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[11px] font-black",
                    entry.rank <= 3 ? MEDAL[entry.rank - 1] : "bg-slate-100 text-slate-500"
                  )}
                >
                  {entry.rank}
                </span>
                <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                  {entry.profilePhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.profilePhoto} alt="" className="h-full w-full object-cover" />
                  ) : (
                    entry.name?.charAt(0) || "?"
                  )}
                </div>
                <span className="flex-1 text-sm font-bold text-slate-700 truncate">
                  {entry.name} {isMe && <span className="text-[9px] text-primary font-black">(You)</span>}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-black text-amber-500" title="Best streak">
                  <Flame className="h-3 w-3" /> {entry.bestStreak}
                </span>
                <span className="text-xs font-black text-primary tabular-nums">{entry.xp} XP</span>
              </div>
            );
          })}

          {data.me.rank > data.leaderboard.length && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-primary/5 border border-primary/20 mt-3">
              <span className="h-7 w-7 shrink-0 rounded-full bg-primary text-white flex items-center justify-center text-[11px] font-black">
                {data.me.rank}
              </span>
              <span className="flex-1 text-sm font-bold text-primary">You</span>
              <span className="text-xs font-black text-primary tabular-nums">{data.me.xp} XP</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
