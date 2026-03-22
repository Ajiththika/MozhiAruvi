"use client";

import React, { useEffect, useState } from "react";
<<<<<<< HEAD
import { BookOpen, Layers, Plus, ExternalLink, Loader2, Trash2, Edit2, X } from "lucide-react";
import { getLessons, Lesson, getLessonQuestions, Question } from "@/services/lessonService";
import api from "@/lib/api";
=======
import { DataTable, ColumnDef } from "@/components/admin/DataTable";
import { BookOpen, Layers, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLessons, deleteLesson, Lesson } from "@/services/lessonService";
>>>>>>> origin/main

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  
  // Create Modal State
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ title: "", moduleName: "Tamil Alphabets", sectionName: "உயிர் எழுத்து", orderIndex: 1 });
  const [creating, setCreating] = useState(false);

  // Manage Questions Modal
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qFormData, setQFormData] = useState({ type: "quiz", text: "", options: "Choice 1, Choice 2", correctAnswer: "", correctOptionIndex: 0, scoreValue: 10 });
  const [qLoading, setQLoading] = useState(false);
=======
>>>>>>> origin/main

  useEffect(() => {
    fetchLessons();
  }, []);

<<<<<<< HEAD
  async function fetchLessons() {
    try {
      setLoading(true);
      const data = await getLessons();
      setLessons(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
=======
  const fetchLessons = () => {
    setLoading(true);
    getLessons()
      .then((data) => setLessons(data.lessons))
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
>>>>>>> origin/main
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/lessons", formData);
      setShowCreate(false);
      fetchLessons();
    } catch (err) {
      alert("Error creating lesson");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this lesson? This will remove all its activities.")) return;
    try {
      await api.delete(`/lessons/${id}`);
      fetchLessons();
    } catch (e) {
      alert("Error deleting lesson");
    }
  }

  async function openActivities(id: string) {
    setActiveLessonId(id);
    setQLoading(true);
    try {
      const data = await getLessonQuestions(id);
      setQuestions(data);
    } catch (e) {
    } finally {
      setQLoading(false);
    }
  }

  async function handleCreateActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!activeLessonId) return;
    setQLoading(true);
    try {
      await api.post(`/lessons/${activeLessonId}/questions`, {
        ...qFormData,
        options: qFormData.type === "quiz" ? qFormData.options.split(",").map(s => s.trim()) : [],
      });
      // reload
      const data = await getLessonQuestions(activeLessonId);
      setQuestions(data);
      setQFormData({ type: "quiz", text: "", options: "C1, C2", correctAnswer: "", correctOptionIndex: 0, scoreValue: 10 });
    } catch (e) {
      alert("Error creating activity");
    } finally {
      setQLoading(false);
    }
  }

  async function handleDeleteActivity(qId: string) {
    if (!activeLessonId) return;
    try {
      await api.delete(`/lessons/${activeLessonId}/questions/${qId}`);
      const data = await getLessonQuestions(activeLessonId);
      setQuestions(data);
    } catch (e) {
      alert("Delete failed");
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
         <div>
<<<<<<< HEAD
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">
               Curriculum Engine 🧩
            </h2>
            <p className="mt-1 text-slate-500">
               Administrate learning paths, manage modules and sections for the Duolingo-style tree.
=======
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
               Curriculum Engine 🧩
            </h2>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
               Administrate learning paths, upload new vocabulary, and group lessons into major units.
>>>>>>> origin/main
            </p>
         </div>
         <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-xl bg-mozhi-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-opacity-90 transition">
             <Plus className="h-4 w-4" /> Create Lesson Node
         </button>
      </div>

<<<<<<< HEAD
      {showCreate && (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 mb-8 max-w-2xl">
          <h3 className="text-xl font-bold mb-4">Create New Lesson Node</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Module Name</label>
                <input required value={formData.moduleName} onChange={e => setFormData({...formData, moduleName: e.target.value})} className="w-full p-2 border rounded-xl" placeholder="e.g. Tamil Alphabets" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Section Name</label>
                <input required value={formData.sectionName} onChange={e => setFormData({...formData, sectionName: e.target.value})} className="w-full p-2 border rounded-xl" placeholder="e.g. உயிர் எழுத்து" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Lesson Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded-xl" placeholder="e.g. Basics 1" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Order Index (Path position)</label>
                <input required type="number" value={formData.orderIndex} onChange={e => setFormData({...formData, orderIndex: parseInt(e.target.value)||1})} className="w-full p-2 border rounded-xl" />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button type="submit" disabled={creating} className="px-4 py-2 bg-mozhi-primary text-white font-bold rounded-xl flex items-center gap-2">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Lesson"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-mozhi-primary" /></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold text-slate-600">Module / Section</th>
                <th className="p-4 font-bold text-slate-600">Lesson Title</th>
                <th className="p-4 font-bold text-slate-600">Order</th>
                <th className="p-4 font-bold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lessons.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-500">No lessons built yet.</td></tr>}
              {lessons.map(lesson => (
                <tr key={lesson._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4">
                    <div className="font-bold text-mozhi-primary">{lesson.moduleName}</div>
                    <div className="text-sm font-semibold text-slate-500 mt-0.5">{lesson.sectionName}</div>
                  </td>
                  <td className="p-4 font-bold text-slate-800">{lesson.title}</td>
                  <td className="p-4 text-slate-500 font-semibold text-lg">{lesson.orderIndex}</td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    <button onClick={() => openActivities(lesson._id)} className="p-2 text-slate-400 hover:text-mozhi-primary bg-white shadow-sm border rounded-lg transition" title="Manage Activities">
                       <ExternalLink className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(lesson._id)} className="p-2 text-slate-400 hover:text-red-500 bg-white shadow-sm border rounded-lg transition" title="Delete Lesson">
                       <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeLessonId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
             <button onClick={() => setActiveLessonId(null)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X className="w-6 h-6" /></button>
             <h2 className="text-2xl font-bold mb-6 text-slate-800">Manage Activities</h2>
             
             {qLoading ? <Loader2 className="animate-spin mx-auto my-8" /> : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Current list */}
                 <div>
                   <h3 className="font-bold text-slate-500 mb-4 tracking-wider uppercase">Existing Activities</h3>
                   <div className="space-y-3">
                     {questions.length === 0 && <p className="text-slate-500">No activities.</p>}
                     {questions.map(q => (
                       <div key={q._id} className="p-4 border border-slate-200 rounded-xl hover:border-mozhi-primary">
                         <div className="flex justify-between items-start">
                           <span className="bg-blue-100 text-mozhi-primary text-xs px-2 py-1 rounded font-bold uppercase">{q.type}</span>
                           <button onClick={() => handleDeleteActivity(q._id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                         </div>
                         <p className="font-bold text-slate-800 mt-2">{q.text}</p>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Ass activity */}
                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                   <h3 className="font-bold text-slate-800 mb-4">Add New Activity</h3>
                   <form onSubmit={handleCreateActivity} className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">Type</label>
                        <select className="w-full p-2 border rounded-xl" value={qFormData.type} onChange={e => setQFormData({...qFormData, type: e.target.value})}>
                          <option value="quiz">Multiple Choice</option>
                          <option value="speaking">Speaking Practice</option>
                          <option value="fill">Fill in Blank / Typing</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">Question / Prompt Text</label>
                        <input required value={qFormData.text} onChange={e => setQFormData({...qFormData, text: e.target.value})} className="w-full p-2 border rounded-xl" />
                      </div>
                      
                      {qFormData.type === "quiz" && (
                        <>
                          <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">Options (comma separated)</label>
                            <input value={qFormData.options} onChange={e => setQFormData({...qFormData, options: e.target.value})} className="w-full p-2 border rounded-xl" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">Correct Option Index (0-based)</label>
                            <input type="number" value={qFormData.correctOptionIndex} onChange={e => setQFormData({...qFormData, correctOptionIndex: parseInt(e.target.value)||0})} className="w-full p-2 border rounded-xl" />
                          </div>
                        </>
                      )}

                      {(qFormData.type === "speaking" || qFormData.type === "fill") && (
                        <div>
                          <label className="block text-sm font-bold text-slate-600 mb-1">Correct Answer (Text match)</label>
                          <input required value={qFormData.correctAnswer} onChange={e => setQFormData({...qFormData, correctAnswer: e.target.value})} className="w-full p-2 border rounded-xl" />
                        </div>
                      )}

                      <button type="submit" className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl mt-4 hover:bg-emerald-600">Save Activity</button>
                   </form>
                 </div>
               </div>
             )}
          </div>
        </div>
=======
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
>>>>>>> origin/main
      )}
    </div>
  );
}