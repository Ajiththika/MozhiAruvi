"use client";

import React, { useEffect, useState } from "react";
import {
  Library, Loader2, Youtube, FileText, Link as LinkIcon,
  BookOpen, ExternalLink, ChevronDown, Download, Play
} from "lucide-react";
import { getResources, Resource } from "@/services/resourceService";
import { getSections, ResourceSection } from "@/services/resourceSectionService";

const LEVELS = ["Basic", "Beginner", "Elementary", "Intermediate", "Advanced"];

const TYPE_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  video: { label: "Video",   color: "text-red-500",     bg: "bg-red-50",     border: "border-red-100" },
  pdf:   { label: "PDF",     color: "text-orange-500",  bg: "bg-orange-50",  border: "border-orange-100" },
  text:  { label: "Note",    color: "text-blue-500",    bg: "bg-blue-50",    border: "border-blue-100" },
  link:  { label: "Link",    color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
};

function getYoutubeEmbed(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

function ResourceItem({ r }: { r: Resource }) {
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_META[r.type] || TYPE_META.link;
  const embed  = r.type === "video" && r.url ? getYoutubeEmbed(r.url) : null;

  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden hover:border-primary/20 hover:shadow-sm transition-all">
      <div className="flex items-center gap-3 px-5 py-3.5">
        <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${meta.bg} ${meta.border}`}>
          {r.type === "video" ? <Play className={`w-3.5 h-3.5 ${meta.color}`} /> :
           r.type === "pdf"   ? <Download className={`w-3.5 h-3.5 ${meta.color}`} /> :
           r.type === "text"  ? <FileText className={`w-3.5 h-3.5 ${meta.color}`} /> :
                                <LinkIcon className={`w-3.5 h-3.5 ${meta.color}`} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-800">{r.title}</span>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>{meta.label}</span>
          </div>
          {r.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{r.description}</p>}
        </div>
        {r.type === "video" && embed && (
          <button onClick={() => setExpanded(x => !x)} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all">
            <Play className="w-3 h-3" /> {expanded ? "Hide" : "Watch"}
          </button>
        )}
        {(r.type === "pdf" || r.type === "link") && r.url && (
          <a href={r.url} target="_blank" rel="noopener noreferrer" className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${meta.bg} ${meta.color} hover:bg-primary hover:text-white border ${meta.border}`}>
            <ExternalLink className="w-3 h-3" /> Open
          </a>
        )}
        {r.type === "text" && r.content && (
          <button onClick={() => setExpanded(x => !x)} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 hover:text-white transition-all">
            <FileText className="w-3 h-3" /> {expanded ? "Hide" : "Read"}
          </button>
        )}
      </div>
      {expanded && embed && (
        <div className="aspect-video w-full border-t border-slate-100">
          <iframe src={embed} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
      )}
      {expanded && r.type === "text" && r.content && (
        <div className="px-5 pb-5 border-t border-slate-50">
          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed mt-3">{r.content}</div>
        </div>
      )}
    </div>
  );
}

function SectionCard({ section, resources }: { section: ResourceSection; resources: Resource[] }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div id={`section-${section._id}`} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden scroll-mt-8">
      <button
        onClick={() => setCollapsed(x => !x)}
        className="w-full flex items-center gap-3 px-6 py-4 bg-primary/5 border-b border-primary/10 hover:bg-primary/10 transition-colors text-left"
      >
        <ChevronDown className={`w-4 h-4 text-primary/60 transition-transform shrink-0 ${collapsed ? "-rotate-90" : ""}`} />
        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <BookOpen className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-800 text-sm text-left">{section.title}</p>
          {section.description && <p className="text-xs text-slate-500 text-left mt-0.5 truncate">{section.description}</p>}
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-primary/40 shrink-0">{resources.length} item{resources.length !== 1 ? "s" : ""}</span>
      </button>
      {!collapsed && (
        <div className="p-4 space-y-2">
          {resources.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4 italic">No resources in this section yet.</p>
          ) : (
            resources.map(r => <ResourceItem key={r._id} r={r} />)
          )}
        </div>
      )}
    </div>
  );
}

export default function ResourcesPage() {
  const [sections, setSections] = useState<ResourceSection[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState("Basic");

  useEffect(() => {
    Promise.all([getSections(), getResources()])
      .then(([secs, res]) => { setSections(secs); setResources(res); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const levelSections = sections.filter(s => s.level === activeLevel);

  // Resources without a section (standalone)
  const sectionIds = new Set(levelSections.map(s => s._id));
  const standaloneResources = resources.filter(r => r.level === activeLevel && (!r.sectionId || !sectionIds.has(r.sectionId)));

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-8 flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Library className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Learning Resources</h1>
            <p className="text-sm text-slate-500 mt-1">Free videos, PDFs and notes to help you learn Tamil at every level.</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 items-start">

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside className="w-full md:w-60 shrink-0 md:sticky md:top-24">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            {/* Level Filter */}
            <div className="px-4 pt-4 pb-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-primary/40 px-2 mb-2">Level</p>
              <div className="space-y-1">
                {LEVELS.map(lv => (
                  <button key={lv} onClick={() => setActiveLevel(lv)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-[11px] font-black uppercase tracking-widest transition-all ${activeLevel === lv ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-primary/70 hover:bg-slate-50 hover:text-primary"}`}
                  >
                    <BookOpen className="w-3.5 h-3.5 shrink-0" /> {lv}
                  </button>
                ))}
              </div>
            </div>

            {/* Sections Quick Nav */}
            {levelSections.length > 0 && (
              <div className="px-4 pt-2 pb-4 border-t border-slate-100 mt-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary/40 px-2 mb-2 mt-2">Sections</p>
                <div className="space-y-0.5">
                  {levelSections.map(s => (
                    <a key={s._id} href={`#section-${s._id}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-primary/5 hover:text-primary transition-all truncate"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary/30 shrink-0" />
                      {s.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">
          {levelSections.length === 0 && standaloneResources.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-16 text-center">
              <Library className="w-12 h-12 mx-auto mb-4 text-slate-200" />
              <p className="font-bold text-slate-400 text-sm">No resources for {activeLevel} yet.</p>
              <p className="text-xs text-slate-400 mt-1">Check back soon — your teacher is adding materials.</p>
            </div>
          ) : (
            <>
              {levelSections.map(sec => (
                <SectionCard
                  key={sec._id}
                  section={sec}
                  resources={resources.filter(r => r.sectionId === sec._id)}
                />
              ))}
              {standaloneResources.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                    <p className="font-black text-slate-700 text-sm">Other Resources</p>
                  </div>
                  <div className="p-4 space-y-2">
                    {standaloneResources.map(r => <ResourceItem key={r._id} r={r} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
