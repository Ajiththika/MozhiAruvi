"use client";

import React, { useEffect, useState } from "react";
import { DataTable, ColumnDef } from "@/components/admin/DataTable";
import { BookOpen, Layers, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLessons, deleteLesson, Lesson } from "@/services/lessonService";

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = () => {
    setLoading(true);
    getLessons()
      .then(setLessons)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await deleteLesson(id);
      fetchLessons();
    } catch (err) {
      console.error(err);
      alert("Failed to delete lesson");
    }
  };

  const columns: ColumnDef<Lesson>[] = [
    {
       header: "Lesson Title",
       accessorKey: "title",
       cell: (row) => (
          <div className="flex flex-col">
             <span className="font-bold text-slate-900 dark:text-slate-100">{row.title}</span>
             <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <Layers className="h-3 w-3" /> Module {row.moduleNumber}
             </span>
          </div>
       )
    },
    {
       header: "Details",
       accessorKey: "orderIndex",
       cell: (row) => (
          <div className="text-sm font-medium text-slate-600 dark:text-slate-300 space-y-1">
             <div className="flex items-center gap-2">
                 <div className="w-4 flex justify-center"><BookOpen className="h-4 w-4 text-emerald-500" /></div>
                 <span>Index: {row.orderIndex}</span>
             </div>
          </div>
       )
    },
    {
       header: "Access",
       accessorKey: "isPremiumOnly",
       cell: (row) => {
          return (
             <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
               row.isPremiumOnly 
                 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-500 border-amber-200 dark:border-amber-800"
                 : "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-500 border-green-200 dark:border-green-800"
             )}>
                {row.isPremiumOnly ? "Premium" : "Free"}
             </span>
          );
       }
    },
    {
       header: "Actions",
       accessorKey: "_id",
       className: "text-right",
       cell: (row) => (
          <div className="flex justify-end gap-2">
             <button className="rounded border border-mozhi-light bg-mozhi-light/50 px-3 py-1.5 text-sm font-semibold text-mozhi-primary transition hover:bg-mozhi-light dark:border-indigo-900 dark:bg-mozhi-primary/20 dark:text-mozhi-secondary dark:hover:bg-mozhi-primary/20">
                Edit Content
             </button>
             <button onClick={() => handleDelete(row._id)} className="text-sm font-semibold text-red-600 hover:text-red-500 dark:text-red-500 transition ml-2 inline-flex items-center gap-1">
                 <Trash2 className="h-4 w-4" /> Delete
             </button>
          </div>
       )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
         <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
               Curriculum Engine 🧩
            </h2>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
               Administrate learning paths, upload new vocabulary, and group lessons into major units.
            </p>
         </div>
         <button className="flex items-center gap-2 rounded-xl bg-mozhi-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-mozhi-primary">
             <Plus className="h-4 w-4" /> Create Lesson Node
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
         <div className="flex flex-col rounded-2xl border border-mozhi-light bg-mozhi-light/50 p-6 dark:border-blue-900/30 dark:bg-mozhi-dark/50">
            <span className="text-sm font-semibold text-mozhi-primary dark:text-mozhi-secondary">Total Live Lessons</span>
            <span className="text-4xl font-black text-blue-900 dark:text-blue-100 mt-2">{lessons.length}</span>
         </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading lessons...</div>
      ) : (
        <DataTable title="Curriculum Builder" columns={columns} data={lessons} onSearch={() => {}} />
      )}
    </div>
  );
}