"use client";

import React, { useEffect, useState } from "react";
import {
  Library, Plus, Trash2, Loader2, Youtube, FileText,
  Link as LinkIcon, Edit3, ChevronDown, FolderOpen, X, Save, BookOpen, AlertCircle
} from "lucide-react";
import {
  getResources, createResource, deleteResource, updateResource, Resource
} from "@/services/resourceService";
import {
  getSections, createSection, deleteSection, updateSection, ResourceSection
} from "@/services/resourceSectionService";
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
    <div className="max-w-4xl mx-auto space-y-6 py-8 px-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Library className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Resources</h1>
            <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Upload & Organize</p>
          </div>
        </div>
        {!addingSection && (
          <button
            onClick={openAddSection}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        )}
      </div>

      {/* Level Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-2.5 rounded-[2rem] border border-slate-100 shadow-sm">
        {LEVELS.map(lv => (
          <button key={lv} onClick={() => { setActiveLevel(lv); setAddingSection(false); setAddingResourceId(null); setEditingSectionId(null); setEditingResourceId(null); }}
            className={`flex-1 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all border-2 ${activeLevel === lv ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-slate-50 text-primary/60 border-transparent hover:bg-slate-100"}`}
          >{lv}</button>
        ))}
      </div>

      {/* Inline Section Add Form */}
      {addingSection && (
        <div className="bg-white rounded-3xl border-2 border-primary/20 shadow-xl p-8 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Section Upload
            </h3>
            <button onClick={() => setAddingSection(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={saveSection} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            <div className="flex justify-end gap-3 pt-2">
              <button type="submit" disabled={sectionSaving} className="flex items-center gap-2 px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60">
                {sectionSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Upload Section
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : levelSections.length === 0 && !addingSection ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 text-slate-200" />
          <p className="font-bold text-slate-400 text-sm">No sections for {activeLevel} yet.</p>
          <p className="text-xs text-slate-400 mt-1">Click "Add" to start uploading materials.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {levelSections.map(sec => {
            const secResources = resources.filter(r => r.sectionId === sec._id);
            const isCollapsed = collapsed.has(sec._id);
            const isEditing = editingSectionId === sec._id;

            return (
              <div key={sec._id} className={cn(
                "bg-white rounded-3xl border transition-all overflow-hidden",
                isEditing ? "border-primary shadow-xl scale-[1.01] z-10" : "border-slate-100 shadow-sm"
              )}>
                {/* Section Header or Edit Form */}
                {isEditing ? (
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <Edit3 className="w-4 h-4" /> Edit Section
                      </h3>
                      <button onClick={() => setEditingSectionId(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <form onSubmit={saveSection} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      <div className="flex justify-end gap-3 pt-2">
                        <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 transition-all">
                          {sectionSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Update Section
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-6 py-4 bg-primary/5 border-b border-primary/10">
                    <button onClick={() => toggleCollapse(sec._id)} className="text-primary/60 hover:text-primary transition-colors">
                      <ChevronDown className={`w-5 h-5 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                    </button>
                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-800 text-sm truncate">{sec.title}</h3>
                      {sec.description && <p className="text-xs text-slate-500 truncate">{sec.description}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEditSection(sec)} className="p-2 rounded-xl hover:bg-primary/10 text-slate-400 hover:text-primary transition-all">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteThisSection(sec._id)} disabled={deletingId === sec._id} className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                        {deletingId === sec._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Resources List and Resource Forms */}
                {!isCollapsed && !isEditing && (
                  <div>
                    {secResources.length === 0 && addingResourceId !== sec._id ? (
                      <p className="text-xs text-slate-400 px-6 py-4 italic">No materials uploaded in this section yet.</p>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {secResources.map(r => {
                          const isEditingRes = editingResourceId === r._id;
                          const typeInfo = getTypeInfo(r.type);

                          if (isEditingRes) {
                            return (
                              <div key={r._id} className="p-8 bg-slate-50/50">
                                <ResourceInlineForm 
                                  form={resourceForm} 
                                  setForm={setResourceForm} 
                                  onSave={saveResource} 
                                  onCancel={() => setEditingResourceId(null)} 
                                  saving={resourceSaving}
                                  title="Edit Resource"
                                />
                              </div>
                            );
                          }

                          return (
                            <div key={r._id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50/50 transition-colors group">
                              <div className={cn("h-8 w-8 rounded-lg border flex items-center justify-center shrink-0", typeInfo.color)}>
                                <typeInfo.icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-700 truncate">{r.title}</p>
                                {r.description && <p className="text-xs text-slate-400 truncate">{r.description}</p>}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEditResource(r)} className="p-2 rounded-xl hover:bg-primary/10 text-slate-400 hover:text-primary transition-all">
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => deleteThisResource(r._id)} disabled={deletingId === r._id} className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                                  {deletingId === r._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Inline Resource Add Form */}
                    {addingResourceId === sec._id && (
                      <div className="p-8 bg-primary/5 border-y border-primary/10">
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
                          className="flex items-center gap-2 text-xs font-black text-primary/60 hover:text-primary transition-colors uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-xl border border-dashed border-primary/20 w-full justify-center"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
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
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" /> {title}
        </h4>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 transition-all">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <form onSubmit={onSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Title</label>
            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inp} placeholder="e.g. Tamil Vowels Introduction" />
          </div>
          <div>
            <label className={lbl}>Type</label>
            <div className="relative">
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Resource["type"] })} className={inp + " appearance-none"}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
            </div>
          </div>
        </div>

        {(form.type === "video" || form.type === "pdf" || form.type === "link") && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
            <label className={lbl}>{form.type === "video" ? "YouTube URL" : "Resource Link / URL"}</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input required value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className={inp} placeholder={form.type === "video" ? "https://youtube.com/watch?v=..." : "https://"} />
                {form.type === "video" && <Youtube className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />}
                {form.type === "pdf" && <FileText className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />}
              </div>
            </div>
          </div>
        )}

        {form.type === "text" && (
          <div className="space-y-2">
            <label className={lbl}>Online Text / Content</label>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
               {/* Simplified Editor look as per screenshot */}
               <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/50">
                  <div className="h-6 w-px bg-slate-200 mx-1" />
                  <button type="button" className="p-1 hover:bg-white rounded text-slate-400 transition-colors font-serif font-bold">B</button>
                  <button type="button" className="p-1 hover:bg-white rounded text-slate-400 transition-colors italic">I</button>
                  <div className="h-6 w-px bg-slate-200 mx-1" />
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
               </div>
               <textarea required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={5} className="w-full p-4 text-sm font-medium text-slate-600 placeholder:text-slate-300 focus:outline-none resize-none" placeholder="Write your notes here..." />
            </div>
          </div>
        )}

        <div>
          <label className={lbl}>Description (optional)</label>
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inp} placeholder="Short description..." />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Cancel</button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Upload
          </button>
        </div>
      </form>
    </div>
  );
}
