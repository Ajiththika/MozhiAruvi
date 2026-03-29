"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Layers, Plus, ExternalLink, Loader2, Trash2, Edit2, X } from "lucide-react";
import { getLessons, Lesson, getLessonQuestions, Question } from "@/services/lessonService";
import api from "@/lib/api";

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Modal State
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ title: "", moduleName: "Tamil Alphabets", sectionName: "உயிர் எழுத்து", orderIndex: 1, isPremiumOnly: false, moduleNumber: 1, category: "Uyir Eluthu", type: "mixed", examples: "" });
  const [creating, setCreating] = useState(false);

  // Manage Questions Modal
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qFormData, setQFormData] = useState({ type: "quiz", text: "", options: "Choice 1, Choice 2", correctAnswer: "", correctOptionIndex: 0, scoreValue: 10, expectedAudioText: "" });
  const [qLoading, setQLoading] = useState(false);

  useEffect(() => {
    fetchLessons();
  }, []);

  async function fetchLessons() {
    try {
      setLoading(true);
      const data = await getLessons();
      setLessons(data.lessons || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/lessons", { 
          ...formData, 
          examples: formData.examples ? formData.examples.split(",").map(e => e.trim()).filter(e => e.length > 0) : [] 
      });
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
      setQFormData({ type: "quiz", text: "", options: "Choice 1, Choice 2", correctAnswer: "", correctOptionIndex: 0, scoreValue: 10, expectedAudioText: "" });
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
      <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
           <div className="flex items-center gap-2">
            <span className="h-1.5 w-8 rounded-full bg-secondary" />
            <span className="text-xs font-bold text-secondary tracking-tight">Management</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight leading-tight">Lessons & Curriculum</h1>
           <p className="mt-2 text-gray-500 font-medium">Manage modules, sections, and paths for the learning tree.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold uppercase tracking-tight text-white shadow-lg shadow-primary/20 hover:scale-105 transition">
             <Plus className="h-4 w-4" /> Create Lesson Node
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100  mb-8 max-w-2xl">
          <h3 className="text-xl font-bold mb-4 dark:text-white">Create New Lesson Node</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Module Name</label>
                <input required value={formData.moduleName} onChange={e => setFormData({...formData, moduleName: e.target.value})} className="w-full p-2 border rounded-xl dark:bg-white" placeholder="e.g. Tamil Alphabets" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Section Name</label>
                <input required value={formData.sectionName} onChange={e => setFormData({...formData, sectionName: e.target.value})} className="w-full p-2 border rounded-xl dark:bg-white" placeholder="e.g. உயிர் எழுத்து" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Lesson Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded-xl dark:bg-white" placeholder="e.g. Basics 1" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Order Index (Path position)</label>
                <input required type="number" value={formData.orderIndex} onChange={e => setFormData({...formData, orderIndex: parseInt(e.target.value)||1})} className="w-full p-2 border rounded-xl dark:bg-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2 border rounded-xl dark:bg-white">
                    <option value="Uyir Eluthu">Uyir Eluthu</option>
                    <option value="Mei Eluthu">Mei Eluthu</option>
                    <option value="Uyirmei Eluthu">Uyirmei Eluthu</option>
                    <option value="Ayutha Eluthu">Ayutha Eluthu</option>
                    <option value="Grantha Eluthugal">Grantha Eluthugal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Lesson Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2 border rounded-xl dark:bg-white">
                    <option value="mixed">Mixed</option>
                    <option value="MCQ">MCQ Only</option>
                    <option value="speaking">Speaking Focus</option>
                    <option value="writing">Writing Focus</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Examples (comma separated text)</label>
              <input value={formData.examples} onChange={e => setFormData({...formData, examples: e.target.value})} className="w-full p-2 border rounded-xl dark:bg-white" placeholder="e.g. அ - அம்மா, ஆ - ஆடு" />
            </div>
            
            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl">Cancel</button>
              <button type="submit" disabled={creating} className="px-4 py-2 bg-primary text-white font-bold rounded-xl flex items-center gap-2">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Lesson"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-100  rounded-2xl shadow-sm overflow-hidden auto-x-scroll">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100 ">
              <tr>
                <th className="p-4 font-bold text-gray-600 dark:text-gray-300">Module / Section</th>
                <th className="p-4 font-bold text-gray-600 dark:text-gray-300">Lesson Title</th>
                <th className="p-4 font-bold text-gray-600 dark:text-gray-300">Access</th>
                <th className="p-4 font-bold text-gray-600 dark:text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lessons.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-500">No lessons built yet.</td></tr>}
              {lessons.map(lesson => (
                <tr key={lesson._id} className="border-b border-gray-100  hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-4">
                    <div className="font-bold text-primary">{lesson.moduleName}</div>
                    <div className="text-sm font-semibold text-gray-500 mt-0.5">{lesson.sectionName}</div>
                  </td>
                  <td className="p-4 font-bold text-gray-800 dark:text-slate-100">{lesson.title}</td>
                  <td className="p-4 font-bold text-gray-800 dark:text-slate-100">{lesson.isPremiumOnly ? "Premium" : "Free"}</td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    <button onClick={() => openActivities(lesson._id)} className="p-2 text-gray-400 hover:text-primary bg-white dark:bg-slate-700 shadow-sm border dark:border-slate-600 rounded-lg transition" title="Manage Activities">
                       <ExternalLink className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(lesson._id)} className="p-2 text-gray-400 hover:text-red-500 bg-white dark:bg-slate-700 shadow-sm border dark:border-slate-600 rounded-lg transition" title="Delete Lesson">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
             <button onClick={() => setActiveLessonId(null)} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200"><X className="w-6 h-6 dark:text-white" /></button>
             <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Manage Activities</h2>
             
             {qLoading ? <Loader2 className="animate-spin mx-auto my-8 dark:text-white" /> : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                   <h3 className="font-bold text-gray-500 mb-4 tracking-wider uppercase">Existing Activities</h3>
                   <div className="space-y-3">
                     {questions.length === 0 && <p className="text-gray-500">No activities.</p>}
                     {questions.map(q => (
                       <div key={q._id} className="p-4 border border-gray-100  rounded-xl hover:border-primary">
                         <div className="flex justify-between items-start">
                           <span className="bg-blue-100 dark:bg-blue-900/40 text-primary dark:text-blue-300 text-xs px-2 py-1 rounded font-bold uppercase">{q.type}</span>
                           <button onClick={() => handleDeleteActivity(q._id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                         </div>
                         <p className="font-bold text-gray-800 dark:text-gray-200 mt-2">{q.text}</p>
                       </div>
                     ))}
                   </div>
                 </div>

                 <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 ">
                   <h3 className="font-bold text-gray-800 dark:text-white mb-4">Add New Activity</h3>
                   <form onSubmit={handleCreateActivity} className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Type</label>
                        <select className="w-full p-2 border rounded-xl " value={qFormData.type} onChange={e => setQFormData({...qFormData, type: e.target.value})}>
                          <option value="quiz">Multiple Choice</option>
                          <option value="speaking">Speaking Practice</option>
                          <option value="writing">Writing Practice</option>
                          <option value="fill">Fill in Blank / Typing</option>
                          <option value="match">Match Pairs</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Question / Prompt Text</label>
                        <input required value={qFormData.text} onChange={e => setQFormData({...qFormData, text: e.target.value})} className="w-full p-2 border rounded-xl " />
                      </div>
                      
                      {qFormData.type === "quiz" && (
                        <>
                          <div>
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Options (comma separated)</label>
                            <input value={qFormData.options} onChange={e => setQFormData({...qFormData, options: e.target.value})} className="w-full p-2 border rounded-xl " />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Correct Option Index (0-based)</label>
                            <input type="number" value={qFormData.correctOptionIndex} onChange={e => setQFormData({...qFormData, correctOptionIndex: parseInt(e.target.value)||0})} className="w-full p-2 border rounded-xl " />
                          </div>
                        </>
                      )}

                      {(qFormData.type === "speaking" || qFormData.type === "fill") && (
                        <>
                          <div>
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Correct Answer (Text match for Fill)</label>
                            <input value={qFormData.correctAnswer} onChange={e => setQFormData({...qFormData, correctAnswer: e.target.value})} className="w-full p-2 border rounded-xl " />
                          </div>
                          {qFormData.type === "speaking" && (
                            <div>
                               <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Expected Audio Text</label>
                               <input required value={qFormData.expectedAudioText} onChange={e => setQFormData({...qFormData, expectedAudioText: e.target.value})} className="w-full p-2 border rounded-xl " />
                            </div>
                          )}
                        </>
                      )}

                      <button type="submit" className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl mt-4 hover:bg-emerald-600">Save Activity</button>
                   </form>
                 </div>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
