"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen, Plus, Loader2, Trash2, X, ChevronDown, ChevronUp,
  Mic, AlertCircle, Settings, ArrowRight
} from "lucide-react";
import { getLessons, Lesson, getLessonQuestions, Question } from "@/services/lessonService";
import { getCategories, Category as DBCategory } from "@/services/categoryService";
import { api } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

type QuestionType = "mcq" | "fill_blank" | "matching" | "listening" | "speaking";

interface MCQData { question: string; options: string[]; correctAnswer: string; }
interface FillBlankData { sentence: string; correctAnswer: string; }
interface MatchingData { pairs: { left: string; right: string }[]; }
interface ListeningData { audioUrl: string; correctAnswer: string; }
interface SpeakingData { promptText: string; correctSentence: string; phoneticHint: string; referenceAudio: string; }

type QuestionData = MCQData | FillBlankData | MatchingData | ListeningData | SpeakingData;

interface DraftQuestion {
  id: string; // temp local id
  type: QuestionType;
  data: QuestionData;
  error?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_META: Record<QuestionType, { label: string; icon: React.ReactNode; color: string }> = {
  mcq:        { label: "MCQ",         icon: null, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  fill_blank: { label: "Fill Blank",  icon: null, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  matching:   { label: "Matching",    icon: null, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  listening:  { label: "Listening",   icon: null, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  speaking:   { label: "Speaking",    icon: <Mic className="w-4 h-4" />, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
};

const defaultData = (type: QuestionType): QuestionData => {
  switch (type) {
    case "mcq":        return { question: "", options: ["", ""], correctAnswer: "" };
    case "fill_blank": return { sentence: "", correctAnswer: "" };
    case "matching":   return { pairs: [{ left: "", right: "" }] };
    case "listening":  return { audioUrl: "", correctAnswer: "" };
    case "speaking":   return { promptText: "", correctSentence: "", phoneticHint: "", referenceAudio: "" };
  }
};

function uid() { return Math.random().toString(36).slice(2); }

function validateQuestion(q: DraftQuestion): string | undefined {
  switch (q.type) {
    case "mcq": {
      const d = q.data as MCQData;
      if (!d.question.trim()) return "Question text is required.";
      if (d.options.filter(o => o.trim()).length < 2) return "At least 2 non-empty options required.";
      if (!d.correctAnswer.trim()) return "Select a correct answer.";
      return;
    }
    case "fill_blank": {
      const d = q.data as FillBlankData;
      if (!d.sentence.trim()) return "Sentence is required.";
      if (!/_{2,}/.test(d.sentence)) return 'Sentence must contain at least "__" to mark the blank.';
      if (!d.correctAnswer.trim()) return "Correct answer is required.";
      return;
    }
    case "matching": {
      const d = q.data as MatchingData;
      if (d.pairs.some(p => !p.left.trim() || !p.right.trim())) return "All pairs must have both sides filled.";
      if (d.pairs.length < 1) return "At least one pair is required.";
      return;
    }
    case "listening": {
      const d = q.data as ListeningData;
      if (!d.audioUrl.trim()) return "Audio URL is required.";
      if (!d.correctAnswer.trim()) return "Correct answer is required.";
      return;
    }
    case "speaking": {
      const d = q.data as SpeakingData;
      if (!d.promptText.trim()) return "Prompt text is required.";
      if (!d.correctSentence.trim()) return "Correct sentence is required.";
      return;
    }
  }
}

// ── Input primitives (consistent with existing design system) ─────────────────

const inputCls = "w-full p-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:font-medium placeholder:text-primary/40";
const labelCls = "block text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1.5 ml-1";

// ── Question-type-specific sub-forms ──────────────────────────────────────────

function MCQForm({ data, onChange }: { data: MCQData; onChange: (d: MCQData) => void }) {
  const setOption = (idx: number, val: string) => {
    const opts = [...data.options];
    opts[idx] = val;
    onChange({ ...data, options: opts });
  };
  const addOption = () => onChange({ ...data, options: [...data.options, ""] });
  const removeOption = (idx: number) => {
    const opts = data.options.filter((_, i) => i !== idx);
    onChange({ ...data, options: opts, correctAnswer: data.correctAnswer === data.options[idx] ? "" : data.correctAnswer });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className={labelCls}>Question</label>
        <input className={inputCls} placeholder="e.g. What is the Tamil word for 'water'?" value={data.question} onChange={e => onChange({ ...data, question: e.target.value })} />
      </div>
      <div>
        <label className={labelCls}>Options</label>
        <div className="space-y-3">
          {data.options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-[10px] font-black text-primary/40 w-6 shrink-0">{idx + 1}.</span>
              <input className={inputCls} placeholder={`Option ${idx + 1}`} value={opt} onChange={e => setOption(idx, e.target.value)} />
              {data.options.length > 2 && (
                <button type="button" onClick={() => removeOption(idx)} className="p-2 text-primary/40 hover:text-red-400 transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addOption} className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Option
        </button>
      </div>
      <div>
        <label className={labelCls}>Correct Answer</label>
        <select className={inputCls + " cursor-pointer appearance-none"} value={data.correctAnswer} onChange={e => onChange({ ...data, correctAnswer: e.target.value })}>
          <option value="">— Select correct option —</option>
          {data.options.filter(o => o.trim()).map((opt, idx) => (
            <option key={idx} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function FillBlankForm({ data, onChange }: { data: FillBlankData; onChange: (d: FillBlankData) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className={labelCls}>Sentence (use __ for the blank)</label>
        <input className={inputCls} placeholder='e.g. Next letter of ஆ __' value={data.sentence} onChange={e => onChange({ ...data, sentence: e.target.value })} />
        <p className="text-[10px] text-primary/60 font-medium mt-1.5 ml-1">Use at least two underscores <code className="bg-slate-100 px-1 rounded">__</code> to mark where the blank is.</p>
      </div>
      <div>
        <label className={labelCls}>Correct Answer</label>
        <input className={inputCls} placeholder="e.g. eat" value={data.correctAnswer} onChange={e => onChange({ ...data, correctAnswer: e.target.value })} />
      </div>
    </div>
  );
}

function MatchingForm({ data, onChange }: { data: MatchingData; onChange: (d: MatchingData) => void }) {
  const setPair = (idx: number, side: "left" | "right", val: string) => {
    const pairs = data.pairs.map((p, i) => i === idx ? { ...p, [side]: val } : p);
    onChange({ ...data, pairs });
  };
  const addPair = () => onChange({ ...data, pairs: [...data.pairs, { left: "", right: "" }] });
  const removePair = (idx: number) => onChange({ ...data, pairs: data.pairs.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-4">
      <label className={labelCls}>Pairs (left ↔ right)</label>
      {data.pairs.map((pair, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <input className={inputCls} placeholder="English / Word" value={pair.left} onChange={e => setPair(idx, "left", e.target.value)} />
          <span className="text-primary/40 font-black shrink-0">↔</span>
          <input className={inputCls} placeholder="Tamil / Match" value={pair.right} onChange={e => setPair(idx, "right", e.target.value)} />
          {data.pairs.length > 1 && (
            <button type="button" onClick={() => removePair(idx)} className="p-2 text-primary/40 hover:text-red-400 transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={addPair} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add Pair
      </button>
    </div>
  );
}

function ListeningForm({ data, onChange }: { data: ListeningData; onChange: (d: ListeningData) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className={labelCls}>Audio URL</label>
        <input className={inputCls} placeholder="https://... or paste Cloudinary / S3 URL" value={data.audioUrl} onChange={e => onChange({ ...data, audioUrl: e.target.value })} />
      </div>
      <div>
        <label className={labelCls}>Correct Answer (what the audio says)</label>
        <input className={inputCls} placeholder="e.g. Vanakkam" value={data.correctAnswer} onChange={e => onChange({ ...data, correctAnswer: e.target.value })} />
      </div>
    </div>
  );
}

function SpeakingForm({ data, onChange }: { data: SpeakingData; onChange: (d: SpeakingData) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className={labelCls}>Prompt Text (what should the user say?)</label>
        <input className={inputCls} placeholder="e.g. Say the Tamil greeting for hello" value={data.promptText} onChange={e => onChange({ ...data, promptText: e.target.value })} />
      </div>
      <div>
        <label className={labelCls}>Correct Sentence</label>
        <input className={inputCls} placeholder="e.g. Vanakkam" value={data.correctSentence} onChange={e => onChange({ ...data, correctSentence: e.target.value })} />
      </div>
      <div>
        <label className={labelCls}>Phonetic Hint (optional)</label>
        <input className={inputCls} placeholder="e.g. Vaa-nah-kam" value={data.phoneticHint} onChange={e => onChange({ ...data, phoneticHint: e.target.value })} />
      </div>
      <div>
        <label className={labelCls}>Reference Audio URL (optional)</label>
        <input className={inputCls} placeholder="https://... audio clip the user can listen to" value={data.referenceAudio} onChange={e => onChange({ ...data, referenceAudio: e.target.value })} />
      </div>
    </div>
  );
}

// ── Question Card ─────────────────────────────────────────────────────────────

function QuestionCard({
  question, index, onUpdate, onRemove,
}: {
  question: DraftQuestion;
  index: number;
  onUpdate: (q: DraftQuestion) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const meta = TYPE_META[question.type];

  const updateData = (data: QuestionData) => onUpdate({ ...question, data, error: undefined });
  const changeType = (type: QuestionType) => onUpdate({ ...question, type, data: defaultData(type), error: undefined });

  return (
    <div className={`bg-white border-2 rounded-[2rem] overflow-hidden transition-all duration-300 ${question.error ? "border-red-200" : "border-slate-100 hover:border-slate-200"}`}>
      {/* Card Header */}
      <div className="flex items-center gap-4 p-6 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${meta.color}`}>
          {meta.icon} {meta.label}
        </span>
        <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Question {index + 1}</span>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }} className="p-2 text-primary/40 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="p-2 text-primary/40">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Error */}
      {question.error && (
        <div className="mx-6 mb-4 flex items-center gap-2 text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {question.error}
        </div>
      )}

      {/* Body */}
      {expanded && (
        <div className="px-6 pb-8 space-y-6 border-t border-slate-50 pt-6">
          {/* Type selector */}
          <div>
            <label className={labelCls}>Question Type</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TYPE_META) as QuestionType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => changeType(t)}
                  className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${
                    question.type === t ? TYPE_META[t].color + " scale-105 shadow-sm" : "border-slate-100 text-primary/60 hover:border-slate-200"
                  }`}
                >
                  {TYPE_META[t].icon} {TYPE_META[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic form */}
          {question.type === "mcq"        && <MCQForm       data={question.data as MCQData}       onChange={updateData} />}
          {question.type === "fill_blank" && <FillBlankForm data={question.data as FillBlankData} onChange={updateData} />}
          {question.type === "matching"   && <MatchingForm  data={question.data as MatchingData}  onChange={updateData} />}
          {question.type === "listening"  && <ListeningForm data={question.data as ListeningData} onChange={updateData} />}
          {question.type === "speaking"   && <SpeakingForm  data={question.data as SpeakingData}  onChange={updateData} />}
        </div>
      )}
    </div>
  );
}

// ── Admin Lesson Row (Compact Level item) ───────────────────────────────────

interface AdminLessonRowProps {
  index: number;
  lesson: Lesson;
  onManageQuestions: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function AdminLessonRow({ index, lesson, onManageQuestions, onEdit, onDelete }: AdminLessonRowProps) {
  return (
    <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm hover:border-primary/20 transition-all group/l">
      <span className="text-[10px] font-black uppercase tracking-widest text-primary/40 shrink-0 w-6 group-hover/l:text-primary transition-colors">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <p className="text-sm font-bold text-slate-700 truncate">
          {!isNaN(Number(lesson.title)) && lesson.title.trim() !== "" ? `Level ${lesson.title}` : lesson.title}
        </p>
        {lesson.isPremiumOnly && (
          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-600 shrink-0">
            Premium
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2 md:opacity-0 group-hover/l:opacity-100 transition-opacity">
        <button
          onClick={onManageQuestions}
          className="px-4 py-2 bg-primary text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          + Questions
        </button>
        <button
          onClick={onEdit}
          className="p-2 border border-slate-100 rounded-lg hover:bg-slate-50 text-primary/40 hover:text-primary transition-colors"
          title="Edit Level"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 border border-slate-100 rounded-lg hover:bg-red-50 text-primary/40 hover:text-red-500 transition-colors"
          title="Delete Level"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Admin Category Group (expandable container for lessons) ─────────────────

function AdminCategoryGroup({ categoryName, lessons, openQuestions, openEdit, handleDelete, onAddLesson }: { categoryName: string, lessons: Lesson[], openQuestions: (l: Lesson) => void, openEdit: (l: Lesson) => void, handleDelete: (id: string) => void, onAddLesson: (catName: string, nextNum?: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`bg-white rounded-[2.5rem] border transition-all duration-300 ${expanded ? "ring-2 ring-primary/20 border-primary shadow-2xl shadow-primary/5" : "border-slate-100 hover:border-primary/20 hover:shadow-sm"}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-8 cursor-pointer relative" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-6">
          <div className={`h-16 w-16 rounded-[1.5rem] border flex items-center justify-center shrink-0 transition-all duration-500 ${expanded ? "bg-primary text-white border-white/20" : "bg-primary/5 text-primary border-primary/10"}`}>
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{categoryName}</h2>
            <p className="text-xs font-bold text-primary/60 uppercase tracking-widest mt-1">{lessons.length} {lessons.length === 1 ? 'Stage' : 'Stages'} configured</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <button
            onClick={e => { e.stopPropagation(); onAddLesson(categoryName, lessons.length + 1); }}
            className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-primary rounded-xl hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 transition-all"
          >
            <Plus className="w-4 h-4 ml-[-4px]" /> Lesson
          </button>
          <div className="p-3 text-primary/50 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-slate-50 bg-slate-50/20 p-8">
          {lessons.length === 0 ? (
            <div className="text-center py-6">
               <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">No levels found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {lessons.map((lesson, index) => (
                <AdminLessonRow
                  key={lesson._id}
                  index={index}
                  lesson={lesson}
                  onManageQuestions={() => openQuestions(lesson)}
                  onEdit={() => openEdit(lesson)}
                  onDelete={() => handleDelete(lesson._id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  // Unified Category (which is a Lesson in DB) creation form
  const [showCreate, setShowCreate] = useState(false);
  const [isAddingToExisting, setIsAddingToExisting] = useState(false);
  const [formData, setFormData] = useState({ 
    category: "", 
    title: "", 
    isPremiumOnly: false, 
    level: "Beginner", // The 'Stage'
    moduleNumber: 1, 
    orderIndex: 0 
  });
  const [creating, setCreating] = useState(false);
  const [lessonError, setLessonError] = useState("");

  // Question panel
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeLessonTitle, setActiveLessonTitle] = useState("");
  const [savedQuestions, setSavedQuestions] = useState<Question[]>([]);
  const [draftQuestions, setDraftQuestions] = useState<DraftQuestion[]>([]);
  const [qLoading, setQLoading] = useState(false);
  const [savingQ, setSavingQ] = useState(false);

  const [activeLevel, setActiveLevel] = useState("Beginner");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when level changes
  useEffect(() => { setCurrentPage(1); }, [activeLevel]);

  function openAddLesson(catName?: string, nextNum?: number) {
    setShowCreate(true);
    setLessonError("");
    setIsAddingToExisting(!!catName);
    setFormData(prev => ({
      ...prev,
      category: catName || "",
      title: nextNum ? nextNum.toString() : "1",
      level: activeLevel
    }));
  }

  useEffect(() => { 
    fetchLessons(); 
  }, []);

  async function fetchLessons() {
    try {
      setLoading(true);
      const data = await getLessons();
      setLessons(data.lessons || []);
    } catch (e: unknown) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.category.trim()) { setLessonError("Category name is required."); return; }
    if (!formData.title.trim()) { setLessonError("Lesson title is required."); return; }
    setLessonError("");
    setCreating(true);
      try {
        await api.post("/lessons", {
          ...formData,
          orderIndex: parseInt(formData.title) || lessons.length,
          type: "mixed",
          moduleName: formData.level, 
          sectionName: formData.category, // Map input name to Section
        });
      setShowCreate(false);
      setIsAddingToExisting(false);
      setFormData({ 
        category: "", 
        title: "", 
        isPremiumOnly: false, 
        level: "Beginner", 
        moduleNumber: 1, 
        orderIndex: lessons.length 
      });
      fetchLessons();
    } catch {
      setLessonError("Failed to save. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category and all its questions?")) return;
    try {
      await api.delete(`/lessons/${id}`);
      fetchLessons();
    } catch {
      alert("Failed to delete.");
    }
  }

  // Edit logic
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ title: "", level: "Beginner", category: "", moduleNumber: 1, orderIndex: 0, isPremiumOnly: false });

  function openEdit(lesson: Lesson) {
    setEditingLessonId(lesson._id);
    setEditFormData({
      title: lesson.title,
      level: lesson.level || "Beginner",
      category: lesson.category || "",
      moduleNumber: lesson.moduleNumber || 1,
      orderIndex: lesson.orderIndex || 0,
      isPremiumOnly: lesson.isPremiumOnly || false,
    });
  }

  async function handleUpdateLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!editingLessonId) return;
    try {
      await api.patch(`/lessons/${editingLessonId}`, {
        ...editFormData,
        moduleNumber: Number(editFormData.moduleNumber),
        orderIndex: parseInt(editFormData.title) || Number(editFormData.orderIndex),
      });
      setEditingLessonId(null);
      fetchLessons();
    } catch {
      alert("Failed to update.");
    }
  }

  async function openQuestions(lesson: Lesson) {
    setActiveLessonId(lesson._id);
    setActiveLessonTitle(lesson.title);
    setDraftQuestions([]);
    setQLoading(true);
    try {
      const data = await getLessonQuestions(lesson._id);
      setSavedQuestions(data.questions || []);
    } catch {
      setSavedQuestions([]);
    } finally {
      setQLoading(false);
    }
  }

  function addDraftQuestion() {
    setDraftQuestions(prev => [...prev, { id: uid(), type: "mcq", data: defaultData("mcq") }]);
  }

  function updateDraft(id: string, updated: DraftQuestion) {
    setDraftQuestions(prev => prev.map(q => q.id === id ? updated : q));
  }

  function removeDraft(id: string) {
    setDraftQuestions(prev => prev.filter(q => q.id !== id));
  }

  async function handleDeleteSaved(qId: string) {
    if (!activeLessonId) return;
    try {
      await api.delete(`/lessons/${activeLessonId}/questions/${qId}`);
      setSavedQuestions(prev => prev.filter(q => q._id !== qId));
    } catch {
      alert("Failed to delete question.");
    }
  }

  async function handleSaveQuestions() {
    if (!activeLessonId) return;
    let hasError = false;
    const validated = draftQuestions.map(q => {
      const err = validateQuestion(q);
      if (err) { hasError = true; return { ...q, error: err }; }
      return { ...q, error: undefined };
    });
    if (hasError) { setDraftQuestions(validated); return; }

    setSavingQ(true);
    try {
      for (const q of draftQuestions) {
        const payload = buildPayload(q);
        await api.post(`/lessons/${activeLessonId}/questions`, payload);
      }
      const data = await getLessonQuestions(activeLessonId);
      setSavedQuestions(data.questions || []);
      setDraftQuestions([]);
    } catch {
      alert("Failed to save questions.");
    } finally {
      setSavingQ(false);
    }
  }

  function buildPayload(q: DraftQuestion) {
    switch (q.type) {
      case "mcq": {
        const d = q.data as MCQData;
        return { type: "quiz", text: d.question, options: d.options, correctAnswer: d.correctAnswer, correctOptionIndex: d.options.indexOf(d.correctAnswer), scoreValue: 10 };
      }
      case "fill_blank": {
        const d = q.data as FillBlankData;
        return { type: "fill", text: d.sentence, correctAnswer: d.correctAnswer, scoreValue: 10 };
      }
      case "matching": {
        const d = q.data as MatchingData;
        return { type: "match", text: "Match the pairs", options: d.pairs.map(p => p.left), correctAnswer: JSON.stringify(d.pairs), scoreValue: 10 };
      }
      case "listening": {
        const d = q.data as ListeningData;
        return { type: "listening", text: "Listen and answer", expectedAudioText: d.correctAnswer, correctAnswer: d.correctAnswer, scoreValue: 10 };
      }
      case "speaking": {
        const d = q.data as SpeakingData;
        return { type: "speaking", text: d.promptText, correctAnswer: d.correctSentence, expectedAudioText: d.correctSentence, scoreValue: 10 };
      }
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm shadow-slate-200/50">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-10 rounded-full bg-primary/20" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Curriculum Master</span>
          </div>
          <h1 className="text-4xl font-black text-primary tracking-tight">Manage Categories</h1>
          <p className="text-primary/70 font-medium mt-1">Organize your learning path and levels.</p>
        </div>
        <button
          onClick={() => openAddLesson()}
          className="flex items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="h-5 w-5" /> + ADD NEW CATEGORY
        </button>
      </div>

      {/* Unified Creation Form */}
      {showCreate && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-primary/10 max-w-4xl mx-auto animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-800">
              {isAddingToExisting ? `Add Lesson to "${formData.category}"` : "Create New Category"}
            </h3>
            <button onClick={() => { setShowCreate(false); setIsAddingToExisting(false); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-primary/60" />
            </button>
          </div>

          {lessonError && (
            <div className="flex items-center gap-2 text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 px-4 py-3 rounded-xl mb-6">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {lessonError}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!isAddingToExisting && (
                <div>
                  <label className={labelCls}>Category Name</label>
                  <input
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. Uyir Eluththu (Vowels)"
                  />
                  <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest pl-4">A category is initialized along with its first lesson.</p>
                </div>
              )}
              
              <div className={isAddingToExisting ? "col-span-1 md:col-span-2" : ""}>
                <label className={labelCls}>Auto-assigned Level Number</label>
                <div className="px-5 py-4 bg-slate-50 border border-slate-100/50 rounded-2xl flex items-center justify-between">
                  <span className="text-sm font-black text-slate-700">Level {formData.title}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary/40 bg-primary/5 px-2 py-1 rounded">Auto-generated</span>
                </div>
              </div>
            </div>

            {!isAddingToExisting && (
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className={labelCls}>Access Level</label>
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, isPremiumOnly: false})}
                    className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${!formData.isPremiumOnly ? "bg-emerald-500 text-white border-emerald-500" : "bg-slate-50 text-primary/60 border-slate-100"}`}
                  >
                    ✓ Free
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, isPremiumOnly: true})}
                    className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${formData.isPremiumOnly ? "bg-amber-500 text-white border-amber-500" : "bg-slate-50 text-primary/60 border-slate-100"}`}
                  >
                    ★ Premium
                  </button>
                </div>
              </div>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-8 py-4 font-black uppercase tracking-widest text-[10px] text-primary/60">Cancel</button>
              <button type="submit" disabled={creating} className="px-10 py-4 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : (isAddingToExisting ? "Add Lesson" : "Create Category")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lesson List */}

      {/* Level Filter Tabs */}
      {!loading && lessons.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm">
          {["Beginner", "Elementary", "Intermediate", "Advanced"].map((lv) => (
            <button
              key={lv}
              onClick={() => setActiveLevel(lv)}
              className={`flex-1 min-w-[140px] py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border-2 ${
                activeLevel === lv 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                : "bg-slate-50 text-primary/60 border-transparent hover:bg-slate-100 hover:text-slate-600"
              }`}
            >
              {lv}
            </button>
          ))}
        </div>
      )}

      {/* Lesson List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary/30" strokeWidth={1} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 animate-pulse">Loading lessons...</p>
        </div>
      ) : (
        <div className="space-y-16">
          {lessons.length === 0 && (
            <div className="p-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
              <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-primary/60 font-bold italic">No lessons yet. Create your first lesson above.</p>
            </div>
          )}

          {(() => {
            const levelFiltered = lessons.filter(l => {
              const lvl = l.level || "Beginner";
              if (lvl === "Basic") return activeLevel === "Beginner";
              return lvl === activeLevel;
            });
            const totalPages = Math.ceil(levelFiltered.length / 6);
            const paginated = levelFiltered
              .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
              .slice((currentPage - 1) * 6, currentPage * 6);

            const categoriesOnPage = paginated.reduce((acc: Record<string, Lesson[]>, lesson: Lesson) => {
              let category = lesson.category || "Uncategorized";
              // Legacy data fallback: if the category was mistakenly saved as the level name
              if (category.toLowerCase() === (lesson.level || "").toLowerCase() || category === "General") {
                category = lesson.title || "Uncategorized";
              }
              if (!acc[category]) acc[category] = [];
              acc[category].push(lesson);
              return acc;
            }, {});

            return (
              <>
                <div className="space-y-16">
                  {paginated.length === 0 ? (
                    <div className="p-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                      <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                      <p className="text-primary/60 font-bold italic">This level is currently empty.</p>
                    </div>
                  ) : (
                  <div className="space-y-6">
                    {Object.entries(categoriesOnPage).map(([catName, catLessons]) => (
                      <AdminCategoryGroup
                        key={catName}
                        categoryName={catName}
                        lessons={catLessons}
                        openQuestions={openQuestions}
                        openEdit={openEdit}
                        handleDelete={handleDelete}
                        onAddLesson={openAddLesson}
                      />
                    ))}
                  </div>
                  )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-4">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="px-6 py-3 rounded-xl border border-slate-100 font-black text-[10px] uppercase tracking-widest text-primary/60 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
                    >
                      Prev
                    </button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-10 h-10 rounded-xl font-black text-[10px] transition-all ${
                            currentPage === i + 1 
                            ? "bg-primary text-white shadow-lg shadow-primary/20" 
                            : "bg-white border border-slate-100 text-primary/60 hover:bg-slate-50"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="px-6 py-3 rounded-xl border border-slate-100 font-black text-[10px] uppercase tracking-widest text-primary/60 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Edit Lesson Modal */}
      {editingLessonId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-white/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-primary/10 max-w-2xl w-full mx-auto animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-800">Edit Lesson</h3>
              <button onClick={() => setEditingLessonId(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-primary/60" />
              </button>
            </div>

            <form onSubmit={handleUpdateLesson} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Category Name</label>
                  <input
                    required
                    value={editFormData.category}
                    onChange={e => setEditFormData({ ...editFormData, category: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Lesson Number</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editFormData.title}
                    onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>



              <div className="flex justify-end gap-4 pt-2">
                <button type="button" onClick={() => setEditingLessonId(null)} className="px-8 py-4 font-black uppercase tracking-widest text-[10px] text-primary/60">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-10 py-4 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Builder Modal */}
      {activeLessonId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-slate-100 flex flex-col animate-in zoom-in-95 duration-300">

            {/* Modal Header */}
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 shrink-0">
              <div>
                <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">Question Builder</p>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{activeLessonTitle}</h2>
              </div>
              <button
                onClick={() => { setActiveLessonId(null); setDraftQuestions([]); }}
                className="h-12 w-12 flex items-center justify-center bg-white rounded-2xl hover:bg-red-50 hover:text-red-500 shadow-sm border border-slate-100 transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {qLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary/30" strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Loading questions...</p>
                </div>
              ) : (
                <>
                  {/* Saved Questions */}
                  {savedQuestions.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/70">Saved Questions</h3>
                        <span className="text-[10px] font-bold bg-slate-50 text-primary/60 px-3 py-1 rounded-full border border-slate-100">{savedQuestions.length} saved</span>
                      </div>
                      <div className="space-y-3">
                        {savedQuestions.map((q, idx) => (
                          <div key={q._id} className="flex items-center justify-between bg-slate-50 p-5 rounded-2xl border border-slate-100 group">
                            <div className="flex items-center gap-4 min-w-0">
                              <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-white text-primary/60 rounded-full border border-slate-100 shrink-0">{idx + 1} • {q.type}</span>
                              <p className="text-sm font-bold text-slate-700 truncate">{q.text}</p>
                            </div>
                            <button onClick={() => handleDeleteSaved(q._id)} className="p-2 text-primary/40 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 shrink-0 ml-3">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Draft Questions */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary">New Questions</h3>
                      {draftQuestions.length > 0 && (
                        <span className="text-[10px] font-bold bg-secondary/5 text-secondary px-3 py-1 rounded-full">{draftQuestions.length} unsaved</span>
                      )}
                    </div>

                    {draftQuestions.length === 0 && savedQuestions.length === 0 && (
                      <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem] mb-4">
                        <BookOpen className="w-10 h-10 text-slate-100 mx-auto mb-3" />
                        <p className="text-primary/60 text-sm font-bold mb-1">No questions yet.</p>
                        <p className="text-primary/40 text-xs font-medium">Click "+ Add Question" to get started.</p>
                      </div>
                    )}

                    {draftQuestions.length > 0 && (
                      <div className="space-y-4 mb-4">
                        {draftQuestions.map((q, idx) => (
                          <QuestionCard
                            key={q.id}
                            question={q}
                            index={savedQuestions.length + idx}
                            onUpdate={updated => updateDraft(q.id, updated)}
                            onRemove={() => removeDraft(q.id)}
                          />
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={addDraftQuestion}
                      className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary/60 hover:border-primary hover:text-primary hover:bg-primary/2 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add Question
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {!qLoading && (
              <div className="p-6 border-t border-slate-50 flex items-center justify-end gap-4 shrink-0 bg-slate-50/30">
                <button
                  type="button"
                  onClick={() => { setActiveLessonId(null); setDraftQuestions([]); }}
                  className="px-8 py-3.5 font-black uppercase tracking-widest text-[10px] text-primary/60 hover:text-slate-600 transition-colors"
                >
                  Close
                </button>
                {draftQuestions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSaveQuestions}
                    disabled={savingQ}
                    className="px-10 py-3.5 bg-secondary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60 disabled:scale-100"
                  >
                    {savingQ ? <Loader2 className="w-4 h-4 animate-spin" /> : `Save Questions (${draftQuestions.length})`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
















