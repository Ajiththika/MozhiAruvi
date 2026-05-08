"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Library, Loader2, Youtube, FileText, Link as LinkIcon,
  BookOpen, ExternalLink, ChevronDown, Download, Play, Menu, X, ChevronRight
} from "lucide-react";
import { getResources, Resource } from "@/services/resourceService";
import { getSections, ResourceSection } from "@/services/resourceSectionService";
import { cn } from "@/lib/utils";

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
    <div className="border border-slate-100 rounded-2xl overflow-hidden hover:border-primary/20 hover:shadow-md transition-all bg-white">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className={cn("h-10 w-10 rounded-xl border flex items-center justify-center shrink-0", meta.bg, meta.border)}>
          {r.type === "video" ? <Play className={cn("w-4 h-4", meta.color)} /> :
           r.type === "pdf"   ? <Download className={cn("w-4 h-4", meta.color)} /> :
           r.type === "text"  ? <FileText className={cn("w-4 h-4", meta.color)} /> :
                                <LinkIcon className={cn("w-4 h-4", meta.color)} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-800">{r.title}</span>
            <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", meta.bg, meta.color, meta.border)}>{meta.label}</span>
          </div>
          {r.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{r.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {r.type === "video" && embed && (
            <button onClick={() => setExpanded(x => !x)} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-100">
              <Play className="w-3 h-3" /> {expanded ? "Hide" : "Watch"}
            </button>
          )}
          {(r.type === "pdf" || r.type === "link") && r.url && (
            <a href={r.url} target="_blank" rel="noopener noreferrer" className={cn("shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border", meta.bg, meta.color, "hover:bg-primary hover:text-white hover:border-primary", meta.border)}>
              <ExternalLink className="w-3 h-3" /> Open
            </a>
          )}
          {r.type === "text" && r.content && (
            <button onClick={() => setExpanded(x => !x)} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 hover:text-white transition-all border border-blue-100">
              <FileText className="w-3 h-3" /> {expanded ? "Hide" : "Read"}
            </button>
          )}
        </div>
      </div>
      {expanded && embed && (
        <div className="aspect-video w-full border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
          <iframe src={embed} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
      )}
      {expanded && r.type === "text" && r.content && (
        <div className="px-5 pb-5 border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed mt-3">{r.content}</div>
        </div>
      )}
    </div>
  );
}

function SectionCard({ section, resources }: { section: ResourceSection; resources: Resource[] }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div id={`section-${section._id}`} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden scroll-mt-24 mb-6">
      <button
        onClick={() => setCollapsed(x => !x)}
        className="w-full flex items-center gap-3 px-6 py-5 bg-slate-50/50 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left"
      >
        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform shrink-0", collapsed ? "-rotate-90" : "")} />
        <div className="h-9 w-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
          <BookOpen className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-800 text-sm">{section.title}</p>
          {section.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{section.description}</p>}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0 bg-white px-3 py-1 rounded-full border border-slate-100">
          {resources.length} item{resources.length !== 1 ? "s" : ""}
        </span>
      </button>
      {!collapsed && (
        <div className="p-4 sm:p-6 space-y-3 bg-white">
          {resources.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 italic">No resources in this section yet.</p>
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    Promise.all([getSections(), getResources()])
      .then(([secs, res]) => { 
        setSections(secs); 
        setResources(res); 
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const levelSections = sections.filter(s => s.level === activeLevel);
  const sectionIds = new Set(levelSections.map(s => s._id));
  const standaloneResources = resources.filter(r => r.level === activeLevel && (!r.sectionId || !sectionIds.has(r.sectionId)));

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-xs font-black uppercase tracking-widest text-primary/40">Loading Library...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/30">
      <Navbar />

      <main className="flex-1">


        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            
            {/* ── Sidebar (Desktop) ─────────────────────────────────────────── */}
            <aside className="hidden lg:block w-72 shrink-0 sticky top-24">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="p-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 px-2 mb-4">Select Level</p>
                  <div className="space-y-2">
                    {LEVELS.map(lv => (
                      <button 
                        key={lv} 
                        onClick={() => setActiveLevel(lv)}
                        className={cn(
                          "w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-left text-xs font-black uppercase tracking-widest transition-all duration-300 group",
                          activeLevel === lv 
                            ? "bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]" 
                            : "text-slate-600 hover:bg-slate-50 hover:text-primary border border-transparent hover:border-slate-100"
                        )}
                      >
                        <div className={cn("w-1.5 h-1.5 rounded-full", activeLevel === lv ? "bg-white" : "bg-primary/30 group-hover:bg-primary")} />
                        {lv}
                      </button>
                    ))}
                  </div>
                </div>

                {levelSections.length > 0 && (
                  <div className="p-6 border-t border-slate-50 bg-slate-50/30">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 px-2 mb-4">On this page</p>
                    <div className="space-y-1">
                      {levelSections.map(s => (
                        <a 
                          key={s._id} 
                          href={`#section-${s._id}`}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold text-slate-500 hover:bg-white hover:text-primary hover:shadow-sm border border-transparent hover:border-slate-100 transition-all truncate"
                        >
                          <ChevronRight className="w-3 h-3 text-slate-300" />
                          {s.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* ── Mobile Level Picker ─────────────────────────────────────────── */}
            <div className="lg:hidden w-full flex items-center gap-3 mb-8 overflow-x-auto no-scrollbar pb-2">
              {LEVELS.map(lv => (
                <button 
                  key={lv} 
                  onClick={() => setActiveLevel(lv)}
                  className={cn(
                    "whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                    activeLevel === lv 
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                      : "bg-white text-slate-600 border-slate-100 shadow-sm"
                  )}
                >
                  {lv}
                </button>
              ))}
            </div>

            {/* ── Main Feed ─────────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {levelSections.length === 0 && standaloneResources.length === 0 ? (
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Library className="w-10 h-10 text-slate-200" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">Curating your path...</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed font-medium">
                    Our educators are currently adding new materials for the <strong>{activeLevel}</strong> level.
                  </p>
                  <button className="mt-8 text-[10px] font-black uppercase tracking-widest text-primary border-b-2 border-primary/20 hover:border-primary transition-all pb-1">
                    Request a Resource
                  </button>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {levelSections.map(sec => (
                    <SectionCard
                      key={sec._id}
                      section={sec}
                      resources={resources.filter(r => r.sectionId === sec._id)}
                    />
                  ))}
                  
                  {standaloneResources.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
                      <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100">
                        <p className="font-black text-slate-800 text-sm">General Learning Materials</p>
                      </div>
                      <div className="p-4 sm:p-6 space-y-3">
                        {standaloneResources.map(r => <ResourceItem key={r._id} r={r} />)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

