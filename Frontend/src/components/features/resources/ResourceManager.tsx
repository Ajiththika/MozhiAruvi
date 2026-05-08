"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Library, Plus, Trash2, Loader2, Youtube, FileText,
  Link as LinkIcon, Edit3, ChevronDown, FolderOpen, X, Save, BookOpen, 
  Bold, Italic, List, Image as ImageIcon, Video, Mic, Maximize2, 
  MoreHorizontal, UploadCloud, File, AlertCircle, CheckCircle2,
  ArrowRight
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

const inp = "w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-primary/30 focus:ring-8 focus:ring-primary/5 transition-all";
const lbl = "text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2 block";

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

  const [addingResourceId, setAddingResourceId] = useState<string | null>(null);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="max-w-5xl mx-auto space-y-8 py-10 px-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Library className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">Resources</h1>
            <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em]">Upload & Organize Learning Materials</p>
          </div>
        </div>
        {!addingSection && (
          <button
            onClick={openAddSection}
            className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        )}
      </div>

      {/* Level Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-2.5 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
        {LEVELS.map(lv => (
          <button key={lv} onClick={() => { setActiveLevel(lv); setAddingSection(false); setAddingResourceId(null); setEditingSectionId(null); setEditingResourceId(null); }}
            className={`flex-1 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all border-2 ${activeLevel === lv ? "bg-primary text-white border-primary shadow-xl shadow-primary/20" : "bg-slate-50 text-primary/40 border-transparent hover:bg-slate-100"}`}
          >{lv}</button>
        ))}
      </div>

      {/* Inline Section Form (Add/Edit) */}
      {(addingSection || editingSectionId) && (
        <div className="bg-white rounded-[2.5rem] border-2 border-primary/10 shadow-2xl p-10 animate-in slide-in-from-top-6 duration-500">
          <div className="flex items-center justify-between mb-10 pb-4 border-b border-slate-50">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-3">
              {editingSectionId ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />} 
              {editingSectionId ? "Edit Section" : "New Upload"}
            </h3>
            <button onClick={() => { setAddingSection(false); setEditingSectionId(null); }} className="p-2 rounded-xl hover:bg-slate-50 text-slate-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={saveSection} className="space-y-8">
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
                  <ChevronDown className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/20" />
                </div>
              </div>
            </div>
            <div>
              <label className={lbl}>Description</label>
              <textarea value={sectionForm.description} onChange={e => setSectionForm({ ...sectionForm, description: e.target.value })} rows={2} className={inp + " resize-none"} placeholder="e.g. Basic Tamil letters and pronunciation guide..." />
            </div>
            <div className="flex justify-end gap-4 pt-6">
              <button type="button" onClick={() => { setAddingSection(false); setEditingSectionId(null); }} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Cancel</button>
              <button type="submit" disabled={sectionSaving} className="flex items-center gap-3 px-12 py-4 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-60">
                {sectionSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {editingSectionId ? "Update" : "Upload"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="w-12 h-12 animate-spin text-primary/40" /></div>
      ) : levelSections.length === 0 && !addingSection ? (
        <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm">
          <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
             <FolderOpen className="w-10 h-10 text-slate-100" />
          </div>
          <p className="font-black text-slate-300 text-xl tracking-tight">No sections available</p>
          <p className="text-sm text-slate-400 mt-2">Click "Add" to start organizing your curriculum.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {levelSections.map(sec => {
            const secResources = resources.filter(r => r.sectionId === sec._id);
            const isCollapsed = collapsed.has(sec._id);

            return (
              <div key={sec._id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 transition-all overflow-hidden">
                {/* Section Header Card */}
                <div className="flex items-center gap-5 px-8 py-6 bg-white hover:bg-slate-50/50 transition-colors">
                  <button onClick={() => toggleCollapse(sec._id)} className="text-primary/30 hover:text-primary transition-all p-2 rounded-xl">
                    <ChevronDown className={`w-6 h-6 transition-transform duration-500 ease-out ${isCollapsed ? "-rotate-90" : ""}`} />
                  </button>
                  <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-sm border border-primary/5 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-800 text-lg tracking-tight truncate">{sec.title}</h3>
                    {sec.description && <p className="text-[11px] font-bold text-slate-400 truncate mt-0.5">{sec.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => openEditSection(sec)} className="p-3 rounded-2xl hover:bg-primary/10 text-slate-300 hover:text-primary transition-all">
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button onClick={() => deleteThisSection(sec._id)} disabled={deletingId === sec._id} className="p-3 rounded-2xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all">
                      {deletingId === sec._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Resources List and Resource Forms */}
                {!isCollapsed && (
                  <div className="p-4 pt-0">
                    <div className="bg-slate-50/50 rounded-[2rem] p-4">
                      {secResources.length === 0 && addingResourceId !== sec._id ? (
                        <div className="text-center py-16">
                           <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.3em]">No Materials</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {secResources.map(r => {
                            const isEditingRes = editingResourceId === r._id;
                            const typeInfo = getTypeInfo(r.type);

                            if (isEditingRes) {
                              return (
                                <div key={r._id} className="m-2 p-10 bg-white rounded-[2rem] border-2 border-primary/10 shadow-2xl">
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
                              <div key={r._id} className="flex items-center gap-5 px-8 py-5 bg-white rounded-[1.5rem] hover:bg-slate-50 transition-all group shadow-sm border border-slate-50">
                                <div className={cn("h-11 w-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm", typeInfo.color)}>
                                  <typeInfo.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-black text-slate-700 tracking-tight truncate">{r.title}</p>
                                  {r.description && <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{r.description}</p>}
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                  <button onClick={() => openEditResource(r)} className="p-2.5 rounded-xl hover:bg-primary/10 text-slate-300 hover:text-primary transition-all">
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => deleteThisResource(r._id)} disabled={deletingId === r._id} className="p-2.5 rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all">
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
                        <div className="m-2 p-10 bg-white rounded-[2rem] border-2 border-dashed border-primary/20 shadow-2xl">
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
                        <div className="px-2 mt-4">
                          <button
                            onClick={() => openAddResource(sec._id, sec.level)}
                            className="flex items-center gap-3 text-[11px] font-black text-primary/40 hover:text-primary hover:bg-white transition-all uppercase tracking-widest px-8 py-4 rounded-2xl border-2 border-dashed border-slate-100 hover:border-primary/20 w-full justify-center group shadow-sm"
                          >
                            <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" /> Add
                          </button>
                        </div>
                      )}
                    </div>
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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center justify-between border-b border-slate-50 pb-6">
        <h4 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-4">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <UploadCloud className="w-4 h-4" />
          </div>
          {title}
        </h4>
        <button onClick={onCancel} className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-300 transition-all">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-10">
        <div>
           <label className={lbl}>Title</label>
           <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inp + " text-lg font-black"} placeholder="Enter resource title..." />
        </div>

        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <label className={lbl}>Online Text</label>
           </div>
           <div className={cn(
             "bg-white border-2 border-slate-50 rounded-[2rem] overflow-hidden focus-within:border-primary/20 focus-within:ring-[12px] focus-within:ring-primary/5 transition-all shadow-xl shadow-slate-100",
             form.type === 'text' && "border-primary/20"
           )}>
              <div className="flex items-center flex-wrap gap-2 p-4 border-b border-slate-50 bg-slate-50/20">
                 <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-xl p-1.5">
                    <button type="button" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Bold className="w-4 h-4" /></button>
                    <button type="button" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Italic className="w-4 h-4" /></button>
                 </div>
                 <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-xl p-1.5">
                    <button type="button" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><ImageIcon className="w-4 h-4" /></button>
                    <button type="button" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Video className="w-4 h-4" /></button>
                    <button type="button" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Mic className="w-4 h-4" /></button>
                 </div>
                 <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-xl p-1.5">
                    <button type="button" className={cn("p-2 hover:bg-slate-50 rounded-lg", form.type === 'link' ? "bg-primary/10 text-primary" : "text-slate-400")}>
                       <LinkIcon className="w-4 h-4" />
                    </button>
                    <button type="button" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 opacity-20"><Maximize2 className="w-4 h-4" /></button>
                 </div>
              </div>
              <textarea 
                value={form.content} 
                onChange={e => { setForm({ ...form, content: e.target.value, type: e.target.value ? 'text' : form.type }); }} 
                rows={8} 
                className="w-full p-8 text-sm font-bold text-slate-600 placeholder:text-slate-300 focus:outline-none resize-none leading-relaxed" 
                placeholder="Type or paste your rich content here..." 
              />
           </div>
        </div>

        <div className="space-y-4">
           <label className={lbl}>File Submissions</label>
           <div 
             onClick={() => fileInputRef.current?.click()}
             className={cn(
               "relative group cursor-pointer min-h-[220px] rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-slate-50/30 flex flex-col items-center justify-center transition-all hover:border-primary/40 hover:bg-white hover:shadow-2xl hover:shadow-primary/5",
               form.type === 'pdf' && "border-primary/40 bg-white shadow-xl shadow-primary/5"
             )}
           >
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              
              {uploading ? (
                <div className="flex flex-col items-center gap-6">
                   <div className="relative h-20 w-20">
                      <svg className="h-20 w-20 -rotate-90">
                         <circle cx="40" cy="40" r="36" fill="none" stroke="#f8fafc" strokeWidth="5" />
                         <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="5" strokeDasharray={226} strokeDashoffset={226 - (226 * uploadProgress) / 100} className="text-primary transition-all duration-300" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-primary">{uploadProgress}%</span>
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">Uploading Document...</p>
                </div>
              ) : form.url && form.type === 'pdf' ? (
                <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-500">
                   <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/10 border border-primary/20">
                      <File className="w-10 h-10" />
                   </div>
                   <div className="text-center">
                      <p className="text-sm font-black text-slate-700 max-w-[280px] truncate">{form.url.split('/').pop()}</p>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center justify-center gap-1.5 mt-2">
                        <CheckCircle2 className="w-4 h-4" /> Resource Uploaded Successfully
                      </p>
                   </div>
                   <button 
                     type="button" 
                     onClick={(e) => { e.stopPropagation(); setForm({...form, url: '', type: 'text'}); }}
                     className="text-[10px] font-black text-red-400 hover:text-red-500 uppercase tracking-widest underline mt-4 transition-colors"
                   >Remove file</button>
                </div>
              ) : (
                <div className="text-center space-y-6 px-10">
                   <div className="h-20 w-20 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-300 mx-auto group-hover:scale-110 group-hover:text-primary group-hover:shadow-xl transition-all duration-700">
                      <UploadCloud className="w-10 h-10" />
                   </div>
                   <div>
                      <p className="text-base font-black text-slate-600 group-hover:text-primary transition-colors tracking-tight">You can drag and drop files here to add them.</p>
                      <p className="text-[10px] font-black text-slate-300 mt-2 uppercase tracking-widest">PDF, DOCX, ZIP • Max 20MB</p>
                   </div>
                </div>
              )}
           </div>
        </div>

        {form.type !== 'pdf' && (
          <div className="p-8 bg-emerald-50/30 rounded-3xl border border-emerald-100/50 group/link">
             <label className={lbl + " text-emerald-600/60"}>External Link / URL</label>
             <div className="relative">
                <input value={form.url} onChange={e => { setForm({ ...form, url: e.target.value, type: e.target.value.includes('youtube.com') ? 'video' : 'link' }); }} className={inp + " border-emerald-100 bg-white focus:border-emerald-400 focus:ring-emerald-500/5"} placeholder="https://..." />
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                   {form.type === 'video' ? <Youtube className="w-5 h-5 text-red-500" /> : <LinkIcon className="w-5 h-5 text-emerald-500" />}
                </div>
             </div>
          </div>
        )}

        <div>
          <label className={lbl}>Description (optional)</label>
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inp} placeholder="Short summary of this resource..." />
        </div>

        <div className="flex justify-end gap-4 pt-10 border-t border-slate-50">
          <button type="button" onClick={onCancel} className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Cancel</button>
          <button 
            type="button" 
            onClick={onSave}
            disabled={saving || uploading} 
            className="flex items-center gap-3 px-14 py-4 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
