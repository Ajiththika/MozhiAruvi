"use client";

import React, { useEffect, useState } from "react";
import {
  Library, Plus, Trash2, Loader2, Youtube, FileText,
  Link as LinkIcon, Edit3, ChevronDown, FolderOpen, X, Save, BookOpen
} from "lucide-react";
import {
  getResources, createResource, deleteResource, updateResource, Resource
} from "@/services/resourceService";
import {
  getSections, createSection, deleteSection, updateSection, ResourceSection
} from "@/services/resourceSectionService";

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

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-primary transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}

export default function AdminResourcesPage() {
  const [sections, setSections] = useState<ResourceSection[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState("Basic");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Section modal
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState<ResourceSection | null>(null);
  const [sectionForm, setSectionForm] = useState(emptySection);
  const [sectionSaving, setSectionSaving] = useState(false);

  // Resource modal
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
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
    setEditingSection(null);
    setSectionForm({ ...emptySection, level: activeLevel });
    setShowSectionModal(true);
  }
  function openEditSection(s: ResourceSection) {
    setEditingSection(s);
    setSectionForm({ title: s.title, description: s.description || "", level: s.level });
    setShowSectionModal(true);
  }
  async function saveSection(e: React.FormEvent) {
    e.preventDefault(); setSectionSaving(true);
    try {
      if (editingSection) {
        const u = await updateSection(editingSection._id, sectionForm);
        setSections(prev => prev.map(s => s._id === editingSection._id ? u : s));
      } else {
        const c = await createSection(sectionForm);
        setSections(prev => [...prev, c]);
      }
      setShowSectionModal(false);
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
    setEditingResource(null);
    setResourceForm({ ...emptyResource, sectionId, level });
    setShowResourceModal(true);
  }
  function openEditResource(r: Resource) {
    setEditingResource(r);
    setResourceForm({ title: r.title, description: r.description || "", type: r.type, url: r.url || "", content: r.content || "", level: r.level, sectionId: r.sectionId || "" });
    setShowResourceModal(true);
  }
  async function saveResource(e: React.FormEvent) {
    e.preventDefault(); setResourceSaving(true);
    try {
      if (editingResource) {
        const u = await updateResource(editingResource._id, resourceForm);
        setResources(prev => prev.map(r => r._id === editingResource._id ? u : r));
      } else {
        const c = await createResource(resourceForm);
        setResources(prev => [...prev, c]);
      }
      setShowResourceModal(false);
    } catch (e) { console.error(e); }
    finally { setResourceSaving(false); }
  }
  async function deleteThisResource(id: string) {
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
            <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Manage Learning Materials</p>
          </div>
        </div>
        <button
          onClick={openAddSection}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Section
        </button>
      </div>

      {/* Level Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-2.5 rounded-[2rem] border border-slate-100 shadow-sm">
        {LEVELS.map(lv => (
          <button key={lv} onClick={() => setActiveLevel(lv)}
            className={`flex-1 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all border-2 ${activeLevel === lv ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-slate-50 text-primary/60 border-transparent hover:bg-slate-100"}`}
          >{lv}</button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : levelSections.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 text-slate-200" />
          <p className="font-bold text-slate-400 text-sm">No sections for {activeLevel} yet.</p>
          <p className="text-xs text-slate-400 mt-1">Click "Add Section" to create your first module.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {levelSections.map(sec => {
            const secResources = resources.filter(r => r.sectionId === sec._id);
            const isCollapsed = collapsed.has(sec._id);
            return (
              <div key={sec._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Section Header */}
                <div className="flex items-center gap-3 px-6 py-4 bg-primary/5 border-b border-primary/10">
                  <button onClick={() => toggleCollapse(sec._id)} className="text-primary/60 hover:text-primary transition-colors">
                    <ChevronDown className={`w-5 h-5 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                  </button>
                  <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
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

                {/* Resources List */}
                {!isCollapsed && (
                  <div>
                    {secResources.length === 0 ? (
                      <p className="text-xs text-slate-400 px-6 py-4 italic">No resources in this section yet.</p>
                    ) : (
                      secResources.map(r => {
                        const typeInfo = getTypeInfo(r.type);
                        return (
                          <div key={r._id} className="flex items-center gap-3 px-6 py-3.5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                            <div className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${typeInfo.color}`}>
                              <typeInfo.icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-700 truncate">{r.title}</p>
                              {r.description && <p className="text-xs text-slate-400 truncate">{r.description}</p>}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEditResource(r)} className="p-1.5 rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-all">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteThisResource(r._id)} disabled={deletingId === r._id} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                                {deletingId === r._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div className="px-6 py-3">
                      <button
                        onClick={() => openAddResource(sec._id, sec.level)}
                        className="flex items-center gap-2 text-xs font-black text-primary/60 hover:text-primary transition-colors uppercase tracking-widest"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Resource
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <Modal title={editingSection ? "Edit Section" : "Add New Section"} onClose={() => setShowSectionModal(false)}>
          <form onSubmit={saveSection} className="space-y-5">
            <div>
              <label className={lbl}>Section Title</label>
              <input required value={sectionForm.title} onChange={e => setSectionForm({ ...sectionForm, title: e.target.value })} className={inp} placeholder="e.g. Module 01 - Tamil Alphabets" />
            </div>
            <div>
              <label className={lbl}>Description (optional)</label>
              <input value={sectionForm.description} onChange={e => setSectionForm({ ...sectionForm, description: e.target.value })} className={inp} placeholder="Brief description of this section..." />
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
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowSectionModal(false)} className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Cancel</button>
              <button type="submit" disabled={sectionSaving} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-60">
                {sectionSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingSection ? "Save" : "Create"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Resource Modal */}
      {showResourceModal && (
        <Modal title={editingResource ? "Edit Resource" : "Add Resource"} onClose={() => setShowResourceModal(false)}>
          <form onSubmit={saveResource} className="space-y-4">
            <div>
              <label className={lbl}>Title</label>
              <input required value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} className={inp} placeholder="e.g. Tamil Vowels Introduction" />
            </div>
            <div>
              <label className={lbl}>Type</label>
              <div className="relative">
                <select value={resourceForm.type} onChange={e => setResourceForm({ ...resourceForm, type: e.target.value as Resource["type"] })} className={inp + " appearance-none"}>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
              </div>
            </div>
            {(resourceForm.type === "video" || resourceForm.type === "pdf" || resourceForm.type === "link") && (
              <div>
                <label className={lbl}>{resourceForm.type === "video" ? "YouTube URL" : "URL"}</label>
                <input value={resourceForm.url} onChange={e => setResourceForm({ ...resourceForm, url: e.target.value })} className={inp} placeholder={resourceForm.type === "video" ? "https://youtube.com/watch?v=..." : "https://"} />
              </div>
            )}
            {resourceForm.type === "text" && (
              <div>
                <label className={lbl}>Content</label>
                <textarea value={resourceForm.content} onChange={e => setResourceForm({ ...resourceForm, content: e.target.value })} rows={4} className={inp + " resize-none"} placeholder="Write your notes here..." />
              </div>
            )}
            <div>
              <label className={lbl}>Description (optional)</label>
              <input value={resourceForm.description} onChange={e => setResourceForm({ ...resourceForm, description: e.target.value })} className={inp} placeholder="Short description..." />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowResourceModal(false)} className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Cancel</button>
              <button type="submit" disabled={resourceSaving} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-60">
                {resourceSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingResource ? "Save" : "Add"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
