"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Library, Plus, Trash2, Loader2, Youtube, FileText,
  Link as LinkIcon, Edit3, ChevronDown, FolderOpen, X, Save, BookOpen, 
  Bold, Italic, List, Image as ImageIcon, Video, Mic, Maximize2, 
  MoreHorizontal, UploadCloud, File, AlertCircle, CheckCircle2,
  ArrowLeft, ChevronRight, Settings2, Sparkles
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

const inp = "w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-primary/30 focus:ring-[12px] focus:ring-primary/5 transition-all shadow-sm";
const lbl = "text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 mb-3 block px-1";

const emptySection = { title: "", description: "", level: "Basic" };
const emptyResource = { title: "", description: "", type: "video" as Resource["type"], url: "", content: "", level: "Basic", sectionId: "" };

type ViewMode = "list" | "section-form" | "resource-form";

export default function ResourceManager() {
  const [sections, setSections] = useState<ResourceSection[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState("Basic");
  
  // Navigation State
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeResourceId, setActiveResourceId] = useState<string | null>(null);

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
    setActiveResourceId(null);
  };

  // ── Section Actions ──────────────────────────────────────────────────────
  const openAddSection = () => {
    setSectionForm({ ...emptySection, level: activeLevel });
    setActiveSectionId(null);
    setViewMode("section-form");
  };

  const openEditSection = (s: ResourceSection) => {
    setSectionForm({ title: s.title, description: s.description || "", level: s.level });
    setActiveSectionId(s._id);
    setViewMode("section-form");
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (activeSectionId) {
        const u = await updateSection(activeSectionId, sectionForm);
        setSections(prev => prev.map(s => s._id === activeSectionId ? u : s));
      } else {
        const c = await createSection(sectionForm);
        setSections(prev => [...prev, c]);
      }
      goToList();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm("Delete this section and all its resources?")) return;
    setDeletingId(id);
    try {
      await deleteSection(id);
      setSections(prev => prev.filter(s => s._id !== id));
      setResources(prev => prev.filter(r => r.sectionId !== id));
    } catch (e) { console.error(e); }
    finally { setDeletingId(null); }
  };

  // ── Resource Actions ─────────────────────────────────────────────────────
  const openAddResource = (sectionId: string, level: string) => {
    setResourceForm({ ...emptyResource, sectionId, level });
    setActiveResourceId(null);
    setActiveSectionId(sectionId);
    setViewMode("resource-form");
  };

  const openEditResource = (r: Resource) => {
    setResourceForm({ 
      title: r.title, 
      description: r.description || "", 
      type: r.type, 
      url: r.url || "", 
      content: r.content || "", 
      level: r.level, 
      sectionId: r.sectionId || "" 
    });
    setActiveResourceId(r._id);
    setActiveSectionId(r.sectionId || null);
    setViewMode("resource-form");
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (activeResourceId) {
        const u = await updateResource(activeResourceId, resourceForm);
        setResources(prev => prev.map(r => r._id === activeResourceId ? u : r));
      } else {
        const c = await createResource(resourceForm);
        setResources(prev => [...prev, c]);
      }
      goToList();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    setDeletingId(id);
    try {
      await deleteResource(id);
      setResources(prev => prev.filter(r => r._id !== id));
    } catch (e) { console.error(e); }
    finally { setDeletingId(null); }
  };

  const levelSections = sections.filter(s => s.level === activeLevel);

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 min-h-screen">
      
      {/* Dynamic Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/5">
            <Library className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">
              {viewMode === 'list' ? 'Resources' : viewMode === 'section-form' ? 'Section Details' : 'Resource Upload'}
            </h1>
            <p className="text-[11px] font-black text-primary/40 uppercase tracking-[0.3em]">
              {viewMode === 'list' ? 'Upload & Organize Curriculum' : 'Fill in the details below'}
            </p>
          </div>
        </div>
        
        {viewMode === 'list' ? (
          <button
            onClick={openAddSection}
            className="flex items-center gap-3 px-10 py-5 bg-primary text-white font-black text-[12px] uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" /> Add
          </button>
        ) : (
          <button 
            onClick={goToList}
            className="flex items-center gap-2 px-6 py-4 bg-slate-100 text-slate-500 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to List
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {loading && viewMode === 'list' ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
             <Loader2 className="w-12 h-12 animate-spin text-primary/20" />
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Loading Materials...</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-10">
            {/* Level Selector */}
            <div className="flex gap-2 bg-white p-3 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40">
              {LEVELS.map(lv => (
                <button key={lv} onClick={() => setActiveLevel(lv)}
                  className={`flex-1 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all border-2 ${activeLevel === lv ? "bg-primary text-white border-primary shadow-xl shadow-primary/20" : "bg-slate-50 text-primary/30 border-transparent hover:bg-slate-100"}`}
                >{lv}</button>
              ))}
            </div>

            {/* List of Sections */}
            {levelSections.length === 0 ? (
               <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                  <FolderOpen className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                  <p className="text-lg font-black text-slate-300 tracking-tight">No sections available for {activeLevel}</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {levelSections.map(sec => (
                  <SectionCard 
                    key={sec._id} 
                    section={sec} 
                    resources={resources.filter(r => r.sectionId === sec._id)}
                    onEdit={() => openEditSection(sec)}
                    onDelete={() => handleDeleteSection(sec._id)}
                    onAddResource={() => openAddResource(sec._id, sec.level)}
                    onEditResource={openEditResource}
                    onDeleteResource={handleDeleteResource}
                    deletingId={deletingId}
                  />
                ))}
              </div>
            )}
          </div>
        ) : viewMode === 'section-form' ? (
          /* Image 3: Edit Section Style */
          <div className="bg-white rounded-[3rem] border-2 border-primary/10 shadow-2xl p-12 max-w-4xl mx-auto">
             <div className="flex items-center gap-4 mb-12 border-b border-slate-50 pb-8">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                   {activeSectionId ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">
                   {activeSectionId ? 'Edit Section' : 'Add New Section'}
                </h3>
             </div>
             <form onSubmit={handleSaveSection} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
                        <ChevronDown className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/20" />
                      </div>
                   </div>
                </div>
                <div>
                   <label className={lbl}>Description (optional)</label>
                   <textarea value={sectionForm.description} onChange={e => setSectionForm({ ...sectionForm, description: e.target.value })} rows={3} className={inp + " resize-none"} placeholder="What will students learn in this section?" />
                </div>
                <div className="flex justify-end items-center gap-6 pt-10 border-t border-slate-50">
                   <button type="button" onClick={goToList} className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all">Cancel</button>
                   <button type="submit" disabled={saving} className="flex items-center gap-3 px-14 py-5 bg-primary text-white text-[12px] font-black uppercase tracking-widest rounded-[2rem] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-60">
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      {activeSectionId ? 'Update' : 'Create Section'}
                   </button>
                </div>
             </form>
          </div>
        ) : (
          /* Image 2: Resource Upload Style */
          <div className="bg-white rounded-[3rem] border-2 border-primary/10 shadow-2xl p-12 max-w-4xl mx-auto">
             <ResourceForm 
               form={resourceForm} 
               setForm={setResourceForm} 
               onSave={handleSaveResource} 
               onCancel={goToList} 
               saving={saving} 
               title={activeResourceId ? "Edit Resource" : "New Upload"} 
             />
          </div>
        )}

      </div>
    </div>
  );
}

function SectionCard({ section, resources, onEdit, onDelete, onAddResource, onEditResource, onDeleteResource, deletingId }: any) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-200/60 group">
      <div className="flex items-center gap-6 px-10 py-8">
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-primary/30 hover:text-primary transition-all p-3 bg-slate-50 rounded-2xl">
          <ChevronRight className={cn("w-6 h-6 transition-transform duration-500", isExpanded ? "rotate-90" : "")} />
        </button>
        <div className="h-14 w-14 rounded-3xl bg-primary/5 flex items-center justify-center text-primary shadow-inner shrink-0 group-hover:scale-110 transition-transform duration-500">
           <BookOpen className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
           <h3 className="font-black text-slate-800 text-xl tracking-tight mb-1">{section.title}</h3>
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{section.description || "Educational Module"}</p>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={onEdit} className="p-4 rounded-2xl hover:bg-primary/5 text-slate-300 hover:text-primary transition-all shadow-sm bg-white border border-slate-50">
              <Edit3 className="w-5 h-5" />
           </button>
           <button onClick={onDelete} disabled={deletingId === section._id} className="p-4 rounded-2xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all shadow-sm bg-white border border-slate-50">
              {deletingId === section._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
           </button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-10 pb-10 pt-4 animate-in slide-in-from-top-4 duration-500">
           <div className="bg-slate-50/50 rounded-[2.5rem] p-6 border border-slate-100">
              <div className="space-y-3 mb-6">
                 {resources.length === 0 ? (
                   <p className="text-center py-10 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">No materials added yet</p>
                 ) : (
                   resources.map((r: any) => (
                     <div key={r._id} className="flex items-center gap-5 px-8 py-5 bg-white rounded-3xl border border-slate-50 shadow-sm hover:shadow-md transition-all group/res">
                        <div className="h-10 w-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary/60 shrink-0">
                           <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-black text-slate-700 truncate">{r.title}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{r.type}</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover/res:opacity-100 transition-all">
                           <button onClick={() => onEditResource(r)} className="p-2.5 rounded-xl hover:bg-primary/10 text-slate-300 hover:text-primary transition-all">
                              <Edit3 className="w-4 h-4" />
                           </button>
                           <button onClick={() => onDeleteResource(r._id)} className="p-2.5 rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                   ))
                 )}
              </div>
              <button 
                onClick={onAddResource}
                className="w-full py-5 rounded-[1.8rem] border-2 border-dashed border-slate-200 hover:border-primary/40 text-[11px] font-black text-primary/40 hover:text-primary hover:bg-white transition-all uppercase tracking-widest flex items-center justify-center gap-3"
              >
                <Plus className="w-5 h-5" /> Add Material
              </button>
           </div>
        </div>
      )}
    </div>
  );
}

function ResourceForm({ form, setForm, onSave, onCancel, saving, title }: any) {
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
        onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / (p.total || 100))),
      });
      setForm({ ...form, url: response.data.url, type: "pdf" });
    } catch (e) { alert("Upload failed"); } 
    finally { setUploading(false); setUploadProgress(0); }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center justify-between border-b border-slate-50 pb-8">
        <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-4">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <UploadCloud className="w-5 h-5" />
          </div>
          {title}
        </h4>
        <button onClick={onCancel} className="p-3 rounded-2xl hover:bg-slate-50 text-slate-300 transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={onSave} className="space-y-12">
        <div className="space-y-4">
           <label className={lbl}>Title of the Resource</label>
           <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inp + " text-lg font-black"} placeholder="Enter title..." />
        </div>

        {/* Online Text - Toolbar matching Image 2 */}
        <div className="space-y-4">
           <label className={lbl}>Online Text</label>
           <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] overflow-hidden focus-within:ring-[15px] focus-within:ring-primary/5 transition-all shadow-2xl shadow-slate-100">
              <div className="flex items-center flex-wrap gap-2 p-5 border-b border-slate-50 bg-slate-50/30">
                 <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-xl p-2">
                    <button type="button" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Bold className="w-4 h-4" /></button>
                    <button type="button" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Italic className="w-4 h-4" /></button>
                 </div>
                 <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-xl p-2">
                    <button type="button" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><ImageIcon className="w-4 h-4" /></button>
                    <button type="button" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Video className="w-4 h-4" /></button>
                    <button type="button" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Mic className="w-4 h-4" /></button>
                 </div>
                 <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-xl p-2">
                    <button type="button" className={cn("p-2 hover:bg-slate-50 rounded-lg", form.type === 'link' ? "bg-primary/10 text-primary" : "text-slate-400")}>
                       <LinkIcon className="w-4 h-4" />
                    </button>
                    <button type="button" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 opacity-20"><Maximize2 className="w-4 h-4" /></button>
                 </div>
              </div>
              <textarea 
                value={form.content} 
                onChange={e => { setForm({ ...form, content: e.target.value, type: e.target.value ? 'text' : form.type }); }} 
                rows={10} 
                className="w-full p-10 text-base font-bold text-slate-600 placeholder:text-slate-300 focus:outline-none resize-none leading-relaxed" 
                placeholder="Type or paste your content here..." 
              />
           </div>
        </div>

        {/* File Submissions - Dropzone matching Image 2 */}
        <div className="space-y-4">
           <label className={lbl}>File Submissions</label>
           <div 
             onClick={() => fileInputRef.current?.click()}
             className={cn(
               "relative group cursor-pointer min-h-[260px] rounded-[3rem] border-2 border-dashed border-slate-100 bg-slate-50/20 flex flex-col items-center justify-center transition-all hover:border-primary/40 hover:bg-white hover:shadow-2xl",
               form.type === 'pdf' && "border-primary/40 bg-white shadow-2xl"
             )}
           >
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              
              {uploading ? (
                <div className="flex flex-col items-center gap-6">
                   <div className="h-2 w-48 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">{uploadProgress}% Uploading...</p>
                </div>
              ) : form.url && form.type === 'pdf' ? (
                <div className="flex flex-col items-center gap-4">
                   <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/5">
                      <File className="w-10 h-10" />
                   </div>
                   <p className="text-sm font-black text-slate-700 truncate max-w-xs">{form.url.split('/').pop()}</p>
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                     <CheckCircle2 className="w-4 h-4" /> Ready to Save
                   </p>
                </div>
              ) : (
                <div className="text-center space-y-6">
                   <div className="h-20 w-20 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-200 mx-auto group-hover:scale-110 group-hover:text-primary transition-all duration-700">
                      <UploadCloud className="w-10 h-10" />
                   </div>
                   <div className="px-10">
                      <p className="text-lg font-black text-slate-600 group-hover:text-primary transition-colors tracking-tight">You can drag and drop files here to add them.</p>
                      <p className="text-[10px] font-black text-slate-300 mt-2 uppercase tracking-widest">PDF, DOCX, ZIP • Max 20MB</p>
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* Link - Grouped matching Image 2 */}
        {form.type !== 'pdf' && (
          <div className="p-10 bg-emerald-50/20 rounded-[2.5rem] border border-emerald-100 group/link shadow-inner">
             <label className={lbl + " text-emerald-600/60"}>External Link / URL</label>
             <div className="relative">
                <input value={form.url} onChange={e => { setForm({ ...form, url: e.target.value, type: e.target.value.includes('youtube.com') ? 'video' : 'link' }); }} className={inp + " border-emerald-100 bg-white focus:border-emerald-400 focus:ring-emerald-500/5"} placeholder="https://..." />
                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                   {form.type === 'video' ? <Youtube className="w-6 h-6 text-red-500" /> : <LinkIcon className="w-6 h-6 text-emerald-500" />}
                </div>
             </div>
          </div>
        )}

        <div className="flex justify-end items-center gap-8 pt-10 border-t border-slate-50">
          <button type="button" onClick={onCancel} className="text-[12px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all">Cancel</button>
          <button 
            type="submit"
            disabled={saving || uploading} 
            className="flex items-center gap-4 px-16 py-6 bg-primary text-white text-[13px] font-black uppercase tracking-widest rounded-[2rem] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
