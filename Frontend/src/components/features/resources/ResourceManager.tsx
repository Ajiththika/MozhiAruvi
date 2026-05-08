"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Library, Plus, Trash2, Loader2, Youtube, FileText,
  Link as LinkIcon, Edit3, ChevronDown, FolderOpen, X, Save, BookOpen, 
  Bold, Italic, List, Image as ImageIcon, Video, Mic, Maximize2, 
  MoreHorizontal, UploadCloud, File, AlertCircle, CheckCircle2,
  ArrowLeft, ChevronRight, Settings2, Sparkles, LayoutGrid
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

const inp = "w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-primary/40 focus:ring-8 focus:ring-primary/5 transition-all shadow-sm";
const lbl = "text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-2.5 block px-1";

const emptySection = { title: "", description: "", level: "Basic" };
const emptyResource = { title: "", description: "", type: "video" as Resource["type"], url: "", content: "", level: "Basic", sectionId: "" };

type ViewMode = "list" | "manage";

export default function ResourceManager() {
  const [sections, setSections] = useState<ResourceSection[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState("Basic");
  
  // Navigation State
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Form State
  const [sectionForm, setSectionForm] = useState(emptySection);
  const [resourceForm, setResourceForm] = useState(emptyResource);
  const [saving, setSaving] = useState(false);
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

  const goToList = () => {
    setViewMode("list");
    setActiveSectionId(null);
    setResourceForm(emptyResource);
  };

  // ── Actions ──────────────────────────────────────────────────────
  const openAddMode = () => {
    setSectionForm({ ...emptySection, level: activeLevel });
    setResourceForm(emptyResource);
    setActiveSectionId(null);
    setViewMode("manage");
  };

  const openEditMode = (s: ResourceSection) => {
    setSectionForm({ title: s.title, description: s.description || "", level: s.level });
    setResourceForm({ ...emptyResource, sectionId: s._id, level: s.level });
    setActiveSectionId(s._id);
    setViewMode("manage");
  };

  const handleSaveSection = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      if (activeSectionId) {
        const u = await updateSection(activeSectionId, sectionForm);
        setSections(prev => prev.map(s => s._id === activeSectionId ? u : s));
      } else {
        const c = await createSection(sectionForm);
        setSections(prev => [...prev, c]);
        setActiveSectionId(c._id);
        setResourceForm(prev => ({ ...prev, sectionId: c._id }));
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSectionId) {
       await handleSaveSection();
    }
    setSaving(true);
    try {
      const c = await createResource({ ...resourceForm, sectionId: activeSectionId || "" });
      setResources(prev => [...prev, c]);
      setResourceForm({ ...emptyResource, sectionId: activeSectionId || "", level: sectionForm.level });
      alert("Material uploaded successfully!");
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const levelSections = sections.filter(s => s.level === activeLevel);

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 min-h-screen">
      
      {/* Refined Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-5">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Library className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1.5">
              {viewMode === 'list' ? 'Resources' : 'Manage Content'}
            </h1>
            <p className="text-[11px] font-black text-primary/40 uppercase tracking-[0.2em]">
              {viewMode === 'list' ? 'Resource Library' : 'One-Page Manager'}
            </p>
          </div>
        </div>
        
        {viewMode === 'list' ? (
          <button
            onClick={openAddMode}
            className="flex items-center gap-3 px-8 py-4 bg-primary text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        ) : (
          <button 
            onClick={goToList}
            className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to List
          </button>
        )}
      </div>

      {loading && viewMode === 'list' ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 opacity-50">
           <Loader2 className="w-10 h-10 animate-spin text-primary" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Library...</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-8 animate-in fade-in duration-700">
          {/* Refined Level Selector */}
          <div className="flex gap-2 bg-white p-2.5 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
            {LEVELS.map(lv => (
              <button key={lv} onClick={() => setActiveLevel(lv)}
                className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeLevel === lv ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
              >{lv}</button>
            ))}
          </div>

          {/* List View with Increased Card Sizes */}
          <div className="grid grid-cols-1 gap-5">
            {levelSections.map(sec => (
              <div key={sec._id} className="bg-white rounded-[2rem] border border-slate-100 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all group flex items-center justify-between px-8 py-6">
                 <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-inner">
                       <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="font-black text-slate-800 text-base tracking-tight">{sec.title}</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{sec.description || "Educational Module"}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <button onClick={() => openEditMode(sec)} className="p-3 rounded-xl hover:bg-primary/5 text-slate-300 hover:text-primary transition-all">
                       <Edit3 className="w-5 h-5" />
                    </button>
                    <button onClick={() => { if(confirm("Delete this section?")) deleteSection(sec._id).then(fetchAll); }} className="p-3 rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all">
                       <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* One-Page Unified Manager (Section + Resource) */
        <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700 pb-24">
           
           {/* Section Heading Area (Image 3 Style) */}
           <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-10">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-50">
                 <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Settings2 className="w-5 h-5" /></div>
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Heading & Resource Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <label className={lbl}>Section Title</label>
                    <input required value={sectionForm.title} onChange={e => setSectionForm({ ...sectionForm, title: e.target.value })} className={inp} placeholder="e.g. Tamil Alphabets" />
                 </div>
                 <div>
                    <label className={lbl}>Level</label>
                    <div className="relative">
                      <select value={sectionForm.level} onChange={e => setSectionForm({ ...sectionForm, level: e.target.value })} className={inp + " appearance-none"}>
                         {LEVELS.map(lv => <option key={lv} value={lv}>{lv}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
                    </div>
                 </div>
              </div>
              <div className="mt-8">
                 <label className={lbl}>Description / Brief</label>
                 <textarea value={sectionForm.description} onChange={e => setSectionForm({ ...sectionForm, description: e.target.value })} rows={2} className={inp + " resize-none"} placeholder="Explain what this section covers..." />
              </div>
              <div className="flex justify-end mt-8">
                 <button onClick={() => handleSaveSection()} disabled={saving} className="flex items-center gap-3 px-10 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Update Heading
                 </button>
              </div>
           </div>

           {/* Upload Page Area (Image 2 Style) */}
           <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-10">
              <div className="flex items-center gap-4 mb-10 pb-4 border-b border-slate-50">
                 <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500"><UploadCloud className="w-5 h-5" /></div>
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">New Material Upload</h3>
              </div>
              
              <div className="space-y-8">
                 <div>
                    <label className={lbl}>Material Title</label>
                    <input value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} className={inp + " text-lg font-black"} placeholder="e.g. Module 01: Vowels PDF" />
                 </div>

                 {/* Online Text Toolbar (Image 2 Style) */}
                 <div>
                    <label className={lbl}>Online Text Content</label>
                    <div className="border-2 border-slate-100 rounded-[2rem] overflow-hidden shadow-sm bg-white focus-within:border-primary/20 transition-all">
                       <div className="flex items-center flex-wrap gap-2 p-4 border-b border-slate-50 bg-slate-50/30">
                          <div className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-xl p-1.5 shadow-sm">
                             <button type="button" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Bold className="w-4 h-4" /></button>
                             <button type="button" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Italic className="w-4 h-4" /></button>
                          </div>
                          <div className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-xl p-1.5 shadow-sm">
                             <button type="button" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><ImageIcon className="w-4 h-4" /></button>
                             <button type="button" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Video className="w-4 h-4" /></button>
                             <button type="button" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Mic className="w-4 h-4" /></button>
                          </div>
                          <div className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-xl p-1.5 shadow-sm">
                             <button type="button" className={cn("p-2 hover:bg-slate-50 rounded-lg", resourceForm.type === 'link' ? "bg-primary/10 text-primary" : "text-slate-400")}>
                                <LinkIcon className="w-4 h-4" />
                             </button>
                             <button type="button" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 opacity-20"><Maximize2 className="w-4 h-4" /></button>
                          </div>
                       </div>
                       <textarea value={resourceForm.content} onChange={e => setResourceForm({...resourceForm, content: e.target.value, type: e.target.value ? 'text' : resourceForm.type})} rows={8} className="w-full p-8 text-base font-bold text-slate-600 focus:outline-none bg-transparent leading-relaxed" placeholder="Type or paste your content here..." />
                    </div>
                 </div>

                 {/* Dropzone (Image 2 Style) */}
                 <div>
                    <label className={lbl}>File Submission / Dropzone</label>
                    <div onClick={() => document.getElementById('file-up')?.click()} className="min-h-[220px] rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-white transition-all group shadow-inner">
                       <input id="file-up" type="file" className="hidden" onChange={async (e) => {
                          const f = e.target.files?.[0]; if(!f) return;
                          setSaving(true);
                          const fd = new FormData(); fd.append("file", f);
                          try {
                             const r = await api.post("/uploads/file", fd, { headers: {"Content-Type": "multipart/form-data"} });
                             setResourceForm({...resourceForm, url: r.data.url, type: 'pdf'});
                          } finally { setSaving(false); }
                       }} />
                       {resourceForm.url && resourceForm.type === 'pdf' ? (
                          <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-500">
                             <div className="h-20 w-20 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/10 border border-emerald-100">
                                <File className="w-10 h-10" />
                             </div>
                             <div className="text-center">
                                <p className="text-sm font-black text-slate-700">{resourceForm.url.split('/').pop()}</p>
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Ready for Curriculum</p>
                             </div>
                          </div>
                       ) : (
                          <>
                             <div className="h-16 w-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-200 mb-4 group-hover:scale-110 group-hover:text-primary transition-all duration-500 shadow-sm">
                                <UploadCloud className="w-8 h-8" />
                             </div>
                             <p className="text-base font-black text-slate-600 group-hover:text-primary transition-colors tracking-tight">You can drag and drop files here to add them.</p>
                             <p className="text-[10px] font-black text-slate-300 mt-2 uppercase tracking-widest">Supports PDF, DOCX, ZIP • Max 20MB</p>
                          </>
                       )}
                    </div>
                 </div>

                 {/* External Link */}
                 <div className="p-8 bg-emerald-50/30 rounded-[2rem] border border-emerald-100/50 shadow-inner">
                    <label className={lbl + " text-emerald-600/70"}>External Link / YouTube URL</label>
                    <div className="relative">
                       <input value={resourceForm.url} onChange={e => setResourceForm({...resourceForm, url: e.target.value, type: e.target.value.includes('youtube') ? 'video' : 'link'})} className={inp + " border-emerald-100 focus:border-emerald-400 focus:ring-emerald-500/5"} placeholder="https://..." />
                       {resourceForm.url && <div className="absolute right-6 top-1/2 -translate-y-1/2"><LinkIcon className="w-5 h-5 text-emerald-400" /></div>}
                    </div>
                 </div>

                 <div className="pt-10 border-t border-slate-50 flex justify-end">
                    <button onClick={handleSaveResource} disabled={saving} className="flex items-center gap-4 px-16 py-5 bg-primary text-white text-[12px] font-black uppercase tracking-widest rounded-[2rem] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all">
                       {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                       Save Material
                    </button>
                 </div>
              </div>
           </div>

           {/* Existing Materials List */}
           {activeSectionId && resources.filter(r => r.sectionId === activeSectionId).length > 0 && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl">
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-8 pb-4 border-b border-slate-50">Current Materials in this Section</h3>
                 <div className="grid grid-cols-1 gap-3">
                    {resources.filter(r => r.sectionId === activeSectionId).map(r => (
                       <div key={r._id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-primary/50 shadow-sm"><FileText className="w-5 h-5" /></div>
                             <span className="text-sm font-black text-slate-700">{r.title}</span>
                          </div>
                          <button onClick={() => { if(confirm("Permanently delete this material?")) deleteResource(r._id).then(fetchAll); }} className="p-3 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                             <Trash2 className="w-5 h-5" />
                          </button>
                       </div>
                    ))}
                 </div>
              </div>
           )}
        </div>
      )}
    </div>
  );
}
