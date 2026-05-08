"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Library, Plus, Trash2, Loader2, Youtube, FileText,
  Link as LinkIcon, Edit3, ChevronDown, FolderOpen, X, Save, BookOpen, 
  Bold, Italic, List, Image as ImageIcon, Video, Mic, Maximize2, 
  MoreHorizontal, UploadCloud, File, AlertCircle, CheckCircle2
} from "lucide-react";
import {
  getResources, createResource, deleteResource, updateResource, Resource
} from "@/services/resourceService";
import {
  getSections, createSection, deleteSection, updateSection, ResourceSection
} from "@/services/resourceSectionService";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const LEVELS = ["Basic", "Beginner", "Elementary", "Intermediate", "Advanced"];
const TYPES = [
  { value: "video", label: "YouTube Video", icon: Youtube, color: "text-red-500 bg-red-50 border-red-100" },
  { value: "pdf",   label: "PDF / File",    icon: FileText, color: "text-orange-500 bg-orange-50 border-orange-100" },
  { value: "text",  label: "Text / Note",   icon: FileText, color: "text-blue-500 bg-blue-50 border-blue-100" },
  { value: "link",  label: "External Link", icon: LinkIcon, color: "text-emerald-500 bg-emerald-50 border-emerald-100" },
];

const inp = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all";
const lbl = "text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1.5 block";

const emptySection = { title: "", description: "", level: "Basic" };
const emptyResource = { title: "", description: "", type: "video" as Resource["type"], url: "", content: "", level: "Basic", sectionId: "" };

export default function ResourceManager() {
  const [sections, setSections] = useState<ResourceSection[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState("Basic");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Inline forms state
  const [addingSection, setAddingSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState(emptySection);
  const [sectionSaving, setSectionSaving] = useState(false);

  const [addingResourceId, setAddingResourceId] = useState<string | null>(null); // sectionId where adding
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [resourceForm, setResourceForm] = useState(emptyResource);
  const [resourceSaving, setResourceSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [secs, res] = await Promise.all([getSections(), getResources()]);
      setSections(secs);
      setResources(res);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  // ── Section handlers ──────────────────────────────────────────────────────
  function openAddSection() {
    setEditingSectionId(null);
    setSectionForm({ ...emptySection, level: activeLevel });
    setAddingSection(true);
  }
  function openEditSection(s: ResourceSection) {
    setAddingSection(false);
    setEditingSectionId(s._id);
    setSectionForm({ title: s.title, description: s.description || "", level: s.level });
  }
  async function saveSection(e: React.FormEvent) {
    e.preventDefault(); setSectionSaving(true);
    try {
      if (editingSectionId) {
        const u = await updateSection(editingSectionId, sectionForm);
        setSections(prev => prev.map(s => s._id === editingSectionId ? u : s));
        setEditingSectionId(null);
      } else {
        const c = await createSection(sectionForm);
        setSections(prev => [...prev, c]);
        setAddingSection(false);
      }
    } catch (e) { console.error(e); }
    finally { setSectionSaving(false); }
  }
  async function deleteThisSection(id: string) {
    if (!confirm("Delete this section and all its resources?")) return;
    setDeletingId(id);
    try {
      await deleteSection(id);
      setSections(prev => prev.filter(s => s._id !== id));
      setResources(prev => prev.filter(r => r.sectionId !== id));
    } catch (e) { console.error(e); }
    finally { setDeletingId(null); }
  }

  // ── Resource handlers ─────────────────────────────────────────────────────
  function openAddResource(sectionId: string, level: string) {
    setEditingResourceId(null);
    setResourceForm({ ...emptyResource, sectionId, level });
    setAddingResourceId(sectionId);
  }
  function openEditResource(r: Resource) {
    setAddingResourceId(null);
    setEditingResourceId(r._id);
    setResourceForm({ 
      title: r.title, 
      description: r.description || "", 
      type: r.type, 
      url: r.url || "", 
      content: r.content || "", 
      level: r.level, 
      sectionId: r.sectionId || "" 
    });
  }
  async function saveResource(e: React.FormEvent) {
    e.preventDefault(); setResourceSaving(true);
    try {
      if (editingResourceId) {
        const u = await updateResource(editingResourceId, resourceForm);
        setResources(prev => prev.map(r => r._id === editingResourceId ? u : r));
        setEditingResourceId(null);
      } else {
        const c = await createResource(resourceForm);
        setResources(prev => [...prev, c]);
        setAddingResourceId(null);
      }
    } catch (e) { console.error(e); }
    finally { setResourceSaving(false); }
  }
  async function deleteThisResource(id: string) {
    if (!confirm("Delete this resource?")) return;
    setDeletingId(id);
    try {
      await deleteResource(id);
      setResources(prev => prev.filter(r => r._id !== id));
    } catch (e) { console.error(e); }
    finally { setDeletingId(null); }
  }

  function toggleCollapse(id: string) {
    setCollapsed(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  const levelSections = sections.filter(s => s.level === activeLevel);
  const getTypeInfo = (type: string) => TYPES.find(t => t.value === type) || TYPES[3];

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-8 px-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Library className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Resources</h1>
            <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Upload & Organize Learning Materials</p>
          </div>
        </div>
        {!addingSection && (
          <button
            onClick={openAddSection}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        )}
      </div>

      {/* Level Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-2.5 rounded-[2rem] border border-slate-100 shadow-sm">
        {LEVELS.map(lv => (
          <button key={lv} onClick={() => { setActiveLevel(lv); setAddingSection(false); setAddingResourceId(null); setEditingSectionId(null); setEditingResourceId(null); }}
            className={`flex-1 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all border-2 ${activeLevel === lv ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-slate-50 text-primary/60 border-transparent hover:bg-slate-100"}`}
          >{lv}</button>
        ))}
      </div>

      {/* Inline Section Add Form */}
      {addingSection && (
        <div className="bg-white rounded-3xl border-2 border-primary/20 shadow-2xl p-8 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Plus className="w-5 h-5" /> New Upload
            </h3>
            <button onClick={() => setAddingSection(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={saveSection} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={lbl}>Section Title</label>
                <input required value={sectionForm.title} onChange={e => setSectionForm({ ...sectionForm, title: e.target.value })} className={inp} placeholder="e.g. Module 01 - Tamil Alphabets" />
              </div>
              <div>
                <label className={lbl}>Level</label>
                <div className="relative">
                  <select value={sectionForm.level} onChange={e => setSectionForm({ ...sectionForm, level: e.target.value })} className={inp + " appearance-none"}>
                    {LEVELS.map(lv => <option key={lv} value={lv}>{lv}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                </div>
              </div>
            </div>
            <div>
              <label className={lbl}>Description (optional)</label>
              <input value={sectionForm.description} onChange={e => setSectionForm({ ...sectionForm, description: e.target.value })} className={inp} placeholder="Brief description of this section..." />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setAddingSection(false)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Cancel</button>
              <button type="submit" disabled={sectionSaving} className="flex items-center gap-2 px-10 py-4 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60">
                {sectionSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Upload
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      ) : levelSections.length === 0 && !addingSection ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-slate-100" />
          <p className="font-bold text-slate-400 text-lg">No sections for {activeLevel} yet.</p>
          <p className="text-sm text-slate-400 mt-2">Click the "Add" button to start uploading materials.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {levelSections.map(sec => {
            const secResources = resources.filter(r => r.sectionId === sec._id);
            const isCollapsed = collapsed.has(sec._id);
            const isEditing = editingSectionId === sec._id;

            return (
              <div key={sec._id} className={cn(
                "bg-white rounded-[2rem] border transition-all overflow-hidden",
                isEditing ? "border-primary shadow-2xl scale-[1.01] z-10" : "border-slate-100 shadow-md"
              )}>
                {/* Section Header or Edit Form */}
                {isEditing ? (
                  <div className="p-10">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <Edit3 className="w-5 h-5" /> Edit Section
                      </h3>
                      <button onClick={() => setEditingSectionId(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <form onSubmit={saveSection} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={lbl}>Section Title</label>
                          <input required value={sectionForm.title} onChange={e => setSectionForm({ ...sectionForm, title: e.target.value })} className={inp} />
                        </div>
                        <div>
                          <label className={lbl}>Level</label>
                          <div className="relative">
                            <select value={sectionForm.level} onChange={e => setSectionForm({ ...sectionForm, level: e.target.value })} className={inp + " appearance-none"}>
                              {LEVELS.map(lv => <option key={lv} value={lv}>{lv}</option>)}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className={lbl}>Description</label>
                        <input value={sectionForm.description} onChange={e => setSectionForm({ ...sectionForm, description: e.target.value })} className={inp} />
                      </div>
                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                         <button type="button" onClick={() => setEditingSectionId(null)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Cancel</button>
                        <button type="submit" className="flex items-center gap-2 px-10 py-4 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 transition-all">
                          {sectionSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          Update
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 px-8 py-5 bg-slate-50/50 border-b border-slate-100">
                    <button onClick={() => toggleCollapse(sec._id)} className="text-primary/40 hover:text-primary transition-colors">
                      <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${isCollapsed ? "-rotate-90" : ""}`} />
                    </button>
                    <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-primary shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-800 text-base tracking-tight truncate">{sec.title}</h3>
                      {sec.description && <p className="text-xs text-slate-400 truncate">{sec.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => openEditSection(sec)} className="p-2.5 rounded-xl hover:bg-primary/10 text-slate-400 hover:text-primary transition-all">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteThisSection(sec._id)} disabled={deletingId === sec._id} className="p-2.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                        {deletingId === sec._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Resources List and Resource Forms */}
                {!isCollapsed && !isEditing && (
                  <div className="p-2">
                    {secResources.length === 0 && addingResourceId !== sec._id ? (
                      <div className="text-center py-12">
                         <FolderOpen className="w-10 h-10 mx-auto mb-3 text-slate-100" />
                         <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No materials uploaded here yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {secResources.map(r => {
                          const isEditingRes = editingResourceId === r._id;
                          const typeInfo = getTypeInfo(r.type);

                          if (isEditingRes) {
                            return (
                              <div key={r._id} className="m-2 p-10 bg-slate-50 rounded-[1.5rem] border-2 border-primary/10">
                                <ResourceInlineForm 
                                  form={resourceForm} 
                                  setForm={setResourceForm} 
                                  onSave={saveResource} 
                                  onCancel={() => setEditingResourceId(null)} 
                                  saving={resourceSaving}
                                  title="Edit Upload"
                                />
                              </div>
                            );
                          }

                          return (
                            <div key={r._id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 rounded-2xl transition-all group mx-2">
                              <div className={cn("h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm", typeInfo.color)}>
                                <typeInfo.icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-700 tracking-tight truncate">{r.title}</p>
                                {r.description && <p className="text-[11px] text-slate-400 truncate">{r.description}</p>}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                <button onClick={() => openEditResource(r)} className="p-2 rounded-xl hover:bg-primary/10 text-slate-400 hover:text-primary transition-all">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button onClick={() => deleteThisResource(r._id)} disabled={deletingId === r._id} className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                                  {deletingId === r._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Inline Resource Add Form */}
                    {addingResourceId === sec._id && (
                      <div className="m-2 p-10 bg-primary/5 rounded-[1.5rem] border-2 border-dashed border-primary/20">
                        <ResourceInlineForm 
                          form={resourceForm} 
                          setForm={setResourceForm} 
                          onSave={saveResource} 
                          onCancel={() => setAddingResourceId(null)} 
                          saving={resourceSaving}
                          title="New Upload"
                        />
                      </div>
                    )}

                    {addingResourceId !== sec._id && (
                      <div className="px-6 py-4">
                        <button
                          onClick={() => openAddResource(sec._id, sec.level)}
                          className="flex items-center gap-2 text-[10px] font-black text-primary/40 hover:text-primary hover:bg-primary/5 transition-all uppercase tracking-widest px-6 py-3 rounded-2xl border border-dashed border-slate-200 hover:border-primary/40 w-full justify-center group"
                        >
                          <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" /> Add
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ResourceInlineForm({ form, setForm, onSave, onCancel, saving, title }: any) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/uploads/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          setUploadProgress(percent);
        },
      });
      setForm({ ...form, url: response.data.url, type: "pdf" });
    } catch (error) {
      console.error("Upload failed", error);
      alert("File upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-primary/10 pb-4">
        <h4 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-3">
          <UploadCloud className="w-5 h-5" /> {title}
        </h4>
        <button onClick={onCancel} className="p-2 rounded-xl hover:bg-white text-slate-400 transition-all shadow-sm">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-8">
        {/* Title and Level (Inherited) */}
        <div>
           <label className={lbl}>Title of the Resource</label>
           <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inp + " text-lg font-black"} placeholder="e.g. Lesson 01: Introduction to Vowels" />
        </div>

        {/* Online Text Section (Always visible but expandable) */}
        <div className="space-y-3">
           <div className="flex items-center justify-between">
              <label className={lbl}>Online Text</label>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Rich Content Editor</span>
           </div>
           <div className={cn(
             "bg-white border-2 border-slate-100 rounded-[1.5rem] overflow-hidden focus-within:border-primary/30 focus-within:ring-8 focus-within:ring-primary/5 transition-all shadow-sm",
             form.type === 'text' && "border-primary/20"
           )}>
              {/* Tool Bar matching 2nd pic */}
              <div className="flex items-center flex-wrap gap-1 p-3 border-b border-slate-50 bg-slate-50/30">
                 <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-lg p-1 mr-2">
                    <button type="button" className="p-1.5 hover:bg-slate-50 rounded text-slate-400"><Bold className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1.5 hover:bg-slate-50 rounded text-slate-400"><Italic className="w-3.5 h-3.5" /></button>
                 </div>
                 <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-lg p-1 mr-2">
                    <button type="button" className="p-1.5 hover:bg-slate-50 rounded text-slate-400"><ImageIcon className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1.5 hover:bg-slate-50 rounded text-slate-400"><Video className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1.5 hover:bg-slate-50 rounded text-slate-400"><Mic className="w-3.5 h-3.5" /></button>
                 </div>
                 <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-lg p-1 mr-2">
                    <button type="button" className={cn("p-1.5 hover:bg-slate-50 rounded", form.type === 'link' ? "bg-primary/10 text-primary" : "text-slate-400")}>
                       <LinkIcon className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1.5 hover:bg-slate-50 rounded text-slate-400 opacity-30"><Maximize2 className="w-3.5 h-3.5" /></button>
                 </div>
                 <div className="ml-auto">
                    <button type="button" className="p-1.5 hover:bg-slate-50 rounded text-slate-400"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                 </div>
              </div>
              <textarea 
                value={form.content} 
                onChange={e => { setForm({ ...form, content: e.target.value, type: e.target.value ? 'text' : form.type }); }} 
                rows={6} 
                className="w-full p-6 text-sm font-medium text-slate-600 placeholder:text-slate-300 focus:outline-none resize-none leading-relaxed" 
                placeholder="Type or paste your content here... It will automatically be saved as 'Online Text' if no file is uploaded." 
              />
           </div>
        </div>

        {/* File Submissions Section */}
        <div className="space-y-3">
           <div className="flex items-center justify-between">
              <label className={lbl}>File Submissions</label>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Maximum size: 20MB</span>
           </div>
           
           <div 
             onClick={() => fileInputRef.current?.click()}
             className={cn(
               "relative group cursor-pointer h-48 rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center transition-all hover:border-primary/40 hover:bg-primary/5",
               form.type === 'pdf' && "border-primary/40 bg-primary/5 shadow-inner"
             )}
           >
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              
              {uploading ? (
                <div className="flex flex-col items-center gap-4">
                   <div className="relative h-16 w-16">
                      <svg className="h-16 w-16 -rotate-90">
                         <circle cx="32" cy="32" r="28" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                         <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={176} strokeDashoffset={176 - (176 * uploadProgress) / 100} className="text-primary transition-all duration-300" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-primary">{uploadProgress}%</span>
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Uploading file...</p>
                </div>
              ) : form.url && form.type === 'pdf' ? (
                <div className="flex flex-col items-center gap-3">
                   <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/10">
                      <File className="w-7 h-7" />
                   </div>
                   <div className="text-center">
                      <p className="text-xs font-black text-slate-700 max-w-[200px] truncate">{form.url.split('/').pop()}</p>
                      <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center justify-center gap-1 mt-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready to save
                      </p>
                   </div>
                   <button 
                     type="button" 
                     onClick={(e) => { e.stopPropagation(); setForm({...form, url: '', type: 'text'}); }}
                     className="text-[9px] font-black text-red-400 hover:text-red-500 uppercase tracking-widest underline mt-2"
                   >Remove file</button>
                </div>
              ) : (
                <div className="text-center space-y-4 px-6">
                   <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mx-auto group-hover:scale-110 group-hover:text-primary transition-all duration-500">
                      <UploadCloud className="w-7 h-7" />
                   </div>
                   <div>
                      <p className="text-sm font-black text-slate-600 group-hover:text-primary transition-colors">You can drag and drop files here to add them.</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Supports PDF, DOCX, ZIP, and more</p>
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* External Link Section (Optional Toggle) */}
        {form.type !== 'pdf' && (
          <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
             <label className={lbl + " text-emerald-600"}>Or provide a URL Link</label>
             <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input value={form.url} onChange={e => { setForm({ ...form, url: e.target.value, type: e.target.value.includes('youtube.com') ? 'video' : 'link' }); }} className={inp + " border-emerald-200 bg-white"} placeholder="https://..." />
                  {form.url && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                       {form.type === 'video' ? <Youtube className="w-4 h-4 text-red-500" /> : <LinkIcon className="w-4 h-4 text-emerald-500" />}
                    </div>
                  )}
                </div>
             </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-8 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Cancel</button>
          <button 
            type="button" 
            onClick={onSave}
            disabled={saving || uploading} 
            className="flex items-center gap-3 px-12 py-4 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
