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

const inp = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm";
const lbl = "text-[9px] font-black uppercase tracking-[0.2em] text-primary/50 mb-2 block px-1";

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
       // Auto-save section first if it's new
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
    <div className="max-w-4xl mx-auto py-8 px-4 min-h-screen">
      
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">
              {viewMode === 'list' ? 'Curriculum' : 'Manage Content'}
            </h1>
            <p className="text-[9px] font-black text-primary/30 uppercase tracking-widest">
              {viewMode === 'list' ? 'Resource Library' : 'One-Page Manager'}
            </p>
          </div>
        </div>
        
        {viewMode === 'list' ? (
          <button
            onClick={openAddMode}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        ) : (
          <button 
            onClick={goToList}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-all"
          >
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
        )}
      </div>

      {loading && viewMode === 'list' ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 opacity-40">
           <Loader2 className="w-8 h-8 animate-spin text-primary" />
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Syncing...</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Tighter Level Selector */}
          <div className="flex gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-lg shadow-slate-100">
            {LEVELS.map(lv => (
              <button key={lv} onClick={() => setActiveLevel(lv)}
                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeLevel === lv ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
              >{lv}</button>
            ))}
          </div>

          {/* List View */}
          <div className="grid grid-cols-1 gap-4">
            {levelSections.map(sec => (
              <div key={sec._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex items-center justify-between px-6 py-5">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary/40">
                       <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                       <h3 className="font-black text-slate-800 text-sm tracking-tight">{sec.title}</h3>
                       <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{sec.description || "General Materials"}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <button onClick={() => openEditMode(sec)} className="p-2.5 rounded-lg hover:bg-primary/5 text-slate-300 hover:text-primary transition-all">
                       <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => { if(confirm("Delete?")) deleteSection(sec._id).then(fetchAll); }} className="p-2.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all">
                       <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* One-Page Unified Manager (Section + Resource) */
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
           
           {/* Section Heading Area (Image 3 Style) */}
           <div className="bg-white rounded-[1.8rem] border border-slate-100 shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                 <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Settings2 className="w-4 h-4" /></div>
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Heading & Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className={lbl}>Section Title</label>
                    <input required value={sectionForm.title} onChange={e => setSectionForm({ ...sectionForm, title: e.target.value })} className={inp} />
                 </div>
                 <div>
                    <label className={lbl}>Level</label>
                    <select value={sectionForm.level} onChange={e => setSectionForm({ ...sectionForm, level: e.target.value })} className={inp}>
                       {LEVELS.map(lv => <option key={lv} value={lv}>{lv}</option>)}
                    </select>
                 </div>
              </div>
              <div className="mt-6">
                 <label className={lbl}>Description</label>
                 <input value={sectionForm.description} onChange={e => setSectionForm({ ...sectionForm, description: e.target.value })} className={inp} />
              </div>
              <div className="flex justify-end mt-6">
                 <button onClick={() => handleSaveSection()} disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all">
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Update Heading
                 </button>
              </div>
           </div>

           {/* Upload Page Area (Image 2 Style) */}
           <div className="bg-white rounded-[1.8rem] border border-slate-100 shadow-xl p-8">
              <div className="flex items-center gap-3 mb-8">
                 <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500"><UploadCloud className="w-4 h-4" /></div>
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Upload Material</h3>
              </div>
              
              <div className="space-y-6">
                 <div>
                    <label className={lbl}>Material Title</label>
                    <input value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} className={inp} placeholder="e.g. Lesson 01 PDF" />
                 </div>

                 {/* Online Text Toolbar (Compact Image 2 Style) */}
                 <div>
                    <label className={lbl}>Online Text</label>
                    <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-inner bg-slate-50/20">
                       <div className="flex items-center gap-1.5 p-3 border-b border-slate-50 bg-white">
                          <button type="button" className="p-1.5 hover:bg-slate-50 rounded text-slate-400"><Bold className="w-3.5 h-3.5" /></button>
                          <button type="button" className="p-1.5 hover:bg-slate-50 rounded text-slate-400"><Italic className="w-3.5 h-3.5" /></button>
                          <div className="w-px h-4 bg-slate-100 mx-1" />
                          <button type="button" className="p-1.5 hover:bg-slate-50 rounded text-slate-400"><ImageIcon className="w-3.5 h-3.5" /></button>
                          <button type="button" className="p-1.5 hover:bg-slate-50 rounded text-slate-400"><Video className="w-3.5 h-3.5" /></button>
                          <button type="button" className="p-1.5 hover:bg-slate-50 rounded text-slate-400"><Mic className="w-3.5 h-3.5" /></button>
                       </div>
                       <textarea value={resourceForm.content} onChange={e => setResourceForm({...resourceForm, content: e.target.value, type: e.target.value ? 'text' : resourceForm.type})} rows={6} className="w-full p-6 text-sm font-medium text-slate-600 focus:outline-none bg-transparent" placeholder="Paste text content..." />
                    </div>
                 </div>

                 {/* Dropzone (Compact Image 2 Style) */}
                 <div>
                    <label className={lbl}>File Submission</label>
                    <div onClick={() => document.getElementById('file-up')?.click()} className="h-40 rounded-[1.5rem] border-2 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/20 hover:bg-white transition-all group">
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
                          <div className="flex items-center gap-3 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100">
                             <CheckCircle2 className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">File Loaded</span>
                          </div>
                       ) : (
                          <>
                             <UploadCloud className="w-8 h-8 text-slate-200 mb-2 group-hover:text-primary transition-colors" />
                             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Drop file or click to upload</p>
                          </>
                       )}
                    </div>
                 </div>

                 {/* External Link */}
                 <div>
                    <label className={lbl}>External Link</label>
                    <div className="relative">
                       <input value={resourceForm.url} onChange={e => setResourceForm({...resourceForm, url: e.target.value, type: e.target.value.includes('youtube') ? 'video' : 'link'})} className={inp} placeholder="https://..." />
                       {resourceForm.url && <div className="absolute right-4 top-1/2 -translate-y-1/2"><LinkIcon className="w-4 h-4 text-primary/40" /></div>}
                    </div>
                 </div>

                 <div className="pt-6 border-t border-slate-50 flex justify-end">
                    <button onClick={handleSaveResource} disabled={saving} className="flex items-center gap-3 px-12 py-4 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                       {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                       Save Changes
                    </button>
                 </div>
              </div>
           </div>

           {/* Existing Materials List */}
           {activeSectionId && resources.filter(r => r.sectionId === activeSectionId).length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-100 p-8">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Existing Materials in this Section</h3>
                 <div className="space-y-2">
                    {resources.filter(r => r.sectionId === activeSectionId).map(r => (
                       <div key={r._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                          <div className="flex items-center gap-3">
                             <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-primary/40"><FileText className="w-4 h-4" /></div>
                             <span className="text-sm font-bold text-slate-600">{r.title}</span>
                          </div>
                          <button onClick={() => { if(confirm("Delete?")) deleteResource(r._id).then(fetchAll); }} className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                             <Trash2 className="w-4 h-4" />
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
