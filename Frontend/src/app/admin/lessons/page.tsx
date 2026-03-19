"use client";

import React from "react";
import { DataTable, ColumnDef } from "@/components/admin/DataTable";
import { BookOpen, AlertTriangle, Layers, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLessonRow {
  id: string;
  unitId: string;
  title: string;
  wordCount: number;
  grammarRules: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "draft" | "live" | "archived";
}

const mockLessonData: AdminLessonRow[] = [
  { id: "L-1", unitId: "Unit 1: Introductions", title: "Greeting in Tamil", wordCount: 15, grammarRules: 0, difficulty: "beginner", status: "live" },
  { id: "L-2", unitId: "Unit 1: Introductions", title: "Pronouns (Naan, Nee)", wordCount: 8, grammarRules: 2, difficulty: "beginner", status: "live" },
  { id: "L-3", unitId: "Unit 2: Family", title: "Family Members 101", wordCount: 20, grammarRules: 1, difficulty: "beginner", status: "draft" },
  { id: "L-4", unitId: "Unit 3: Verbs", title: "Present Tense Conjugation", wordCount: 30, grammarRules: 5, difficulty: "intermediate", status: "live" },
  { id: "L-5", unitId: "Unit 4: Society", title: "Cultural Idioms", wordCount: 12, grammarRules: 0, difficulty: "advanced", status: "draft" },
];

export default function AdminLessonsPage() {
  const columns: ColumnDef<AdminLessonRow>[] = [
    {
       header: "Lesson Title",
       accessorKey: "title",
       cell: (row) => (
          <div className="flex flex-col">
             <span className="font-bold text-slate- dark:text-slate-">{row.title}</span>
             <span className="flex items-center gap-1 text-xs text-slate- dark:text-slate- mt-0.5">
                <Layers className="h-3 w-3" /> {row.unitId}
             </span>
          </div>
       )
    },
    {
       header: "Content Weight",
       accessorKey: "wordCount",
       cell: (row) => (
          <div className="text-sm font-medium text-slate- dark:text-slate- space-y-1">
             <div className="flex items-center gap-2">
                 <div className="w-4 flex justify-center"><BookOpen className="h-4 w-4 text-emerald-500" /></div>
                 <span>{row.wordCount} standard words</span>
             </div>
             <div className="flex items-center gap-2">
                 <div className="w-4 flex justify-center"><AlertTriangle className="h-4 w-4 text-amber-500" /></div>
                 <span>{row.grammarRules} grammar rules</span>
             </div>
          </div>
       )
    },
    {
       header: "Difficulty",
       accessorKey: "difficulty",
       cell: (row) => {
          const dtMap = {
             "beginner": "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-500 border-green-200 dark:border-green-800",
             "intermediate": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-500 border-amber-200 dark:border-amber-800",
             "advanced": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-500 border-red-200 dark:border-red-800",
          };
          return (
             <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize tracking-wide", dtMap[row.difficulty])}>
                {row.difficulty}
             </span>
          );
       }
    },
    {
       header: "Status",
       accessorKey: "status",
       cell: (row) => {
          if (row.status === "live") return <span className="inline-flex items-center gap-1.5 font-bold text-mozhi-primary dark:text-mozhi-secondary"><div className="h-2 w-2 rounded-full bg-mozhi-primary animate-pulse" /> Live</span>;
          if (row.status === "draft") return <span className="font-semibold text-slate- dark:text-slate-">Draft / Editing</span>;
          return <span className="text-slate-">Archived</span>;
       }
    },
    {
       header: "Actions",
       accessorKey: "id",
       className: "text-right",
       cell: (row) => (
          <button className="rounded border border-mozhi-light bg-mozhi-light/50 px-3 py-1.5 text-sm font-semibold text-mozhi-primary transition hover:bg-mozhi-light dark:border-indigo-900 dark:bg-mozhi-primary/20 dark:text-mozhi-secondary dark:hover:bg-mozhi-primary/20">
             Edit Content
          </button>
       )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
         <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate- dark:text-slate-">
               Curriculum Engine 🧩
            </h2>
            <p className="mt-1 text-slate- dark:text-slate-">
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
            <span className="text-4xl font-black text-blue-900 dark:text-blue-100 mt-2">124</span>
         </div>
         <div className="flex flex-col rounded-2xl border border-mozhi-light bg-mozhi-light/50 p-6 dark:border-purple-900/30 dark:bg-purple-950/20">
            <span className="text-sm font-semibold text-mozhi-primary dark:text-mozhi-secondary">Active Units</span>
            <span className="text-4xl font-black text-purple-900 dark:text-purple-100 mt-2">12</span>
         </div>
         <div className="flex flex-col rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/30 dark:bg-emerald-950/20">
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-500">Vocabulary Bank</span>
            <span className="text-4xl font-black text-emerald-900 dark:text-emerald-100 mt-2">1,050</span>
         </div>
         <div className="flex flex-col justify-center items-center rounded-2xl border border-dashed border-slate- p-6 text-center dark:border-slate- transition-colors hover:bg-slate- dark:hover:bg-slate-/50 cursor-pointer">
             <Plus className="h-8 w-8 text-slate- mb-2" />
             <span className="text-sm font-bold text-slate- dark:text-slate-">Manage Categories</span>
         </div>
      </div>

      <DataTable title="Curriculum Builder" columns={columns} data={mockLessonData} onSearch={() => {}} />
    </div>
  );
}