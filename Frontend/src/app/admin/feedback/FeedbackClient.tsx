"use client";

import React, { useState } from "react";
import DataTable, { ColumnDef } from "@/components/ui/DataTable";
import { Loader2, Star, Trash2, Mail, MessageSquare, Calendar } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFeedbacks, deleteFeedback, Feedback } from "@/services/feedbackService";
import { cn } from "@/lib/utils";

export default function FeedbackClient() {
  const queryClient = useQueryClient();
  const [actioning, setActioning] = useState<string | null>(null);

  const { data: feedbacks = [], isLoading, isError } = useQuery({
    queryKey: ["admin", "feedbacks"],
    queryFn: getFeedbacks,
    staleTime: 2 * 60 * 1000,
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    setActioning(id);
    try {
      await deleteFeedback(id);
      queryClient.invalidateQueries({ queryKey: ["admin", "feedbacks"] });
    } catch (err) {
      alert("Failed to delete feedback");
    } finally {
      setActioning(null);
    }
  };

  const columns: ColumnDef<Feedback>[] = [
    {
      header: "User Detail",
      accessorKey: "userEmail",
      cell: (row) => (
        <div className="flex items-center gap-4 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 border border-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800">{row.userEmail}</h4>
            <div className="flex items-center gap-2 mt-1">
               <Calendar className="h-3 w-3 text-slate-300" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 {new Date(row.createdAt).toLocaleDateString()}
               </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Rating",
      accessorKey: "rating",
      cell: (row) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-4 h-4",
                i < row.rating ? "fill-primary text-primary" : "text-slate-100"
              )}
            />
          ))}
          <span className="ml-2 text-xs font-black text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
            {row.rating}.0
          </span>
        </div>
      ),
    },
    {
      header: "Feedback Comment",
      accessorKey: "comment",
      cell: (row) => (
        <div className="flex items-start gap-3 max-w-md">
           <div className="mt-1 shrink-0"><MessageSquare className="h-4 w-4 text-slate-200" /></div>
           <p className="text-sm font-medium text-slate-600 italic leading-relaxed">
             {row.comment || "No comment provided."}
           </p>
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "_id",
      className: "text-right",
      cell: (row) => (
        <button
          onClick={() => handleDelete(row._id)}
          disabled={actioning === row._id}
          className="p-3 rounded-xl bg-red-50 text-red-400 hover:text-red-500 transition-all border border-red-100/50 shadow-sm"
        >
          {actioning === row._id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 border-b border-slate-100 pb-10">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <span className="h-1.5 w-6 rounded-full bg-primary" />
              <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.3em]">Insights</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter leading-none">User Feedback</h1>
           <p className="text-lg text-primary/70 font-medium leading-relaxed max-w-2xl">
              Real-time ratings and suggestions from MozhiAruvi users to help improve the platform.
           </p>
        </div>
      </div>

      {isError && (
        <div className="p-10 bg-red-50 rounded-[2rem] border border-red-100 text-center">
           <p className="text-red-500 font-black uppercase tracking-widest text-xs">Failed to load feedback records.</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary/20" />
           <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Retrieving Insights...</p>
        </div>
      ) : (
        <DataTable 
          title="Recent Responses" 
          columns={columns} 
          data={feedbacks} 
        />
      )}
    </div>
  );
}
