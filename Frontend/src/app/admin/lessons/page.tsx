"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen, Plus, Loader2, Trash2, X, ChevronDown, ChevronUp,
  Mic, AlertCircle
} from "lucide-react";
import { getLessons, Lesson, getLessonQuestions, Question } from "@/services/lessonService";
import { getCategories, Category as DBCategory } from "@/services/categoryService";
import api from "@/lib/api";

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
  mcq:        { label: "MCQ",         icon: null, color: "text-violet-600 bg-violet-50 border-violet-100" },
  fill_blank: { label: "Fill Blank",  icon: null, color: "text-sky-600 bg-sky-50 border-sky-100" },
  matching:   { label: "Matching",    icon: null, color: "text-amber-600 bg-amber-50 border-amber-100" },
  listening:  { label: "Listening",   icon: null, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  speaking:   { label: "Speaking",    icon: <Mic         className="w-4 h-4" />, color: "text-rose-600 bg-rose-50 border-rose-100" },
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
      if (!d.sentence.includes("___")) return 'Sentence must contain "___" to mark the blank.';
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

const inputCls = "w-full p-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-bold text-gray-700 placeholder:font-medium placeholder:text-gray-300";
const labelCls = "block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1";

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
              <span className="text-[10px] font-black text-gray-300 w-6 shrink-0">{idx + 1}.</span>
              <input className={inputCls} placeholder={`Option ${idx + 1}`} value={opt} onChange={e => setOption(idx, e.target.value)} />
              {data.options.length > 2 && (
                <button type="button" onClick={() => removeOption(idx)} className="p-2 text-gray-300 hover:text-red-400 transition-colors shrink-0">
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
        <label className={labelCls}>Sentence (use ___ for the blank)</label>
        <input className={inputCls} placeholder='e.g. I ___ rice every day.' value={data.sentence} onChange={e => onChange({ ...data, sentence: e.target.value })} />
        <p className="text-[10px] text-gray-400 font-medium mt-1.5 ml-1">Use three underscores <code className="bg-gray-100 px-1 rounded">___</code> to mark where the blank is.</p>
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
          <span className="text-gray-300 font-black shrink-0">↔</span>
          <input className={inputCls} placeholder="Tamil / Match" value={pair.right} onChange={e => setPair(idx, "right", e.target.value)} />
          {data.pairs.length > 1 && (
            <button type="button" onClick={() => removePair(idx)} className="p-2 text-gray-300 hover:text-red-400 transition-colors shrink-0">
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
    <div className={`bg-white border-2 rounded-[2rem] overflow-hidden transition-all duration-300 ${question.error ? "border-red-200" : "border-gray-100 hover:border-gray-200"}`}>
      {/* Card Header */}
      <div className="flex items-center gap-4 p-6 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${meta.color}`}>
          {meta.icon} {meta.label}
        </span>
        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Question {index + 1}</span>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }} className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="p-2 text-gray-300">
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
        <div className="px-6 pb-8 space-y-6 border-t border-gray-50 pt-6">
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
                    question.type === t ? TYPE_META[t].color + " scale-105 shadow-sm" : "border-gray-100 text-gray-400 hover:border-gray-200"
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

// ── Admin Lesson Card (expandable) ───────────────────────────────────────────

interface AdminLessonCardProps {
  lesson: Lesson;
  onManageQuestions: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function AdminLessonCard({ lesson, onManageQuestions, onEdit, onDelete }: AdminLessonCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [cardQuestions, setCardQuestions] = useState<Question[]>([]);
  const [cardQLoading, setCardQLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  async function handleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next && !fetched) {
      setCardQLoading(true);
      try {
        const data = await getLessonQuestions(lesson._id);
        setCardQuestions(data.questions || []);
        setFetched(true);
      } catch {
        setCardQuestions([]);
      } finally {
        setCardQLoading(false);
      }
    }
  }

  const levelColor: Record<string, string> = {
    Basic: "text-sky-600 bg-sky-50 border-sky-100",
    Intermediate: "text-amber-600 bg-amber-50 border-amber-100",
    Advanced: "text-rose-600 bg-rose-50 border-rose-100",
  };

  return (
    <div className={`bg-white rounded-[2rem] border transition-all duration-300 shadow-sm overflow-hidden ${expanded ? "border-primary/20 shadow-xl shadow-primary/5" : "border-gray-100 hover:border-gray-200 hover:shadow-md"}`}>
      {/* Card Header */}
      <div
        className="flex items-center gap-4 p-5 cursor-pointer group"
        onClick={handleExpand}
      >
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${expanded ? "bg-primary text-white" : "bg-gray-50 text-primary group-hover:bg-primary/10"}`}>
          <BookOpen className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-black text-gray-800 text-sm truncate">{lesson.title}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {/* Level badge */}
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${levelColor[lesson.level || "Basic"] || levelColor["Basic"]}`}>
              {lesson.level || "Basic"} • L{lesson.orderIndex}
            </span>
            {/* Published / Premium tag */}
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${lesson.isPremiumOnly ? "text-amber-600 bg-amber-50 border-amber-100" : "text-emerald-600 bg-emerald-50 border-emerald-100"}`}>
              {lesson.isPremiumOnly ? "★ Premium" : "✓ Free"}
            </span>
            {/* Question count (once loaded) */}
            {fetched && (
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border text-gray-400 bg-gray-50 border-gray-100">
                {cardQuestions.length} Questions
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onManageQuestions(); }}
            className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white bg-secondary rounded-xl hover:scale-105 active:scale-95 shadow-md shadow-secondary/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Questions
          </button>
          <button
            onClick={e => { e.stopPropagation(); onEdit(); }}
            className="p-2.5 text-gray-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
            title="Edit lesson details"
          >
            <Plus className="w-4 h-4 rotate-45" /> {/* This is a stand-in for edit if I don't want to import more */}
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="p-2 text-gray-300">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded question list */}
      {expanded && (
        <div className="border-t border-gray-50 bg-gray-50/40 px-5 pb-5 pt-4">
          {cardQLoading ? (
            <div className="flex items-center gap-3 py-4 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-bold">Loading questions...</span>
            </div>
          ) : cardQuestions.length === 0 ? (
            <div className="py-6 text-center border-2 border-dashed border-gray-100 rounded-2xl">
              <p className="text-xs font-bold text-gray-400">No questions yet.</p>
              <button
                onClick={onManageQuestions}
                className="mt-2 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
              >
                + Add Question
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {cardQuestions.map((q, idx) => (
                <div key={q._id} className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-100">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 shrink-0 w-5">{idx + 1}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100 text-gray-400 shrink-0">
                    {q.type}
                  </span>
                  <p className="text-sm font-bold text-gray-700 truncate flex-1">{q.text}</p>
                </div>
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
  const [formData, setFormData] = useState({ 
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

  useEffect(() => { 
    fetchLessons(); 
  }, []);

  async function fetchLessons() {
    try {
      setLoading(true);
      const data = await getLessons();
      setLessons(data.lessons || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) { setLessonError("Category name is required."); return; }
    setLessonError("");
    setCreating(true);
    try {
      await api.post("/lessons", {
        ...formData,
        type: "mixed",
        moduleName: formData.level, 
        category: formData.level,  
        moduleNumber: Number(formData.moduleNumber),
        orderIndex: Number(formData.orderIndex),
      });
      setShowCreate(false);
      setFormData({ 
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
        orderIndex: Number(editFormData.orderIndex),
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm shadow-gray-200/50">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-10 rounded-full bg-primary/20" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Curriculum Master</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Manage Categories</h1>
          <p className="text-gray-500 font-medium mt-1">Organize your learning path and levels.</p>
        </div>
        <button
          onClick={() => { setShowCreate(s => !s); setLessonError(""); }}
          className="flex items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="h-5 w-5" /> Add New Category
        </button>
      </div>

      {/* Unified Creation Form */}
      {showCreate && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200/40 border border-primary/10 max-w-4xl mx-auto animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-gray-800">New Category Item</h3>
            <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {lessonError && (
            <div className="flex items-center gap-2 text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 px-4 py-3 rounded-xl mb-6">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {lessonError}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className={labelCls}>Category Name</label>
              <input
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className={inputCls}
                placeholder="e.g. Traditional Greetings"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className={labelCls}>Select Stage</label>
                <select 
                  className={inputCls} 
                  value={formData.level} 
                  onChange={e => setFormData({ ...formData, level: e.target.value })}
                >
                  {["Beginner", "Elementary", "Intermediate", "Advanced"].map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Level # (e.g. 1)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.orderIndex}
                  onChange={e => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                  className={inputCls}
                />
              </div>
              <div className="lg:col-span-2">
                <label className={labelCls}>Access Level</label>
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, isPremiumOnly: false})}
                    className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${!formData.isPremiumOnly ? "bg-emerald-500 text-white border-emerald-500" : "bg-gray-50 text-gray-400 border-gray-100"}`}
                  >
                    ✓ Free
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, isPremiumOnly: true})}
                    className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${formData.isPremiumOnly ? "bg-amber-500 text-white border-amber-500" : "bg-gray-50 text-gray-400 border-gray-100"}`}
                  >
                    ★ Premium
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-8 py-4 font-black uppercase tracking-widest text-[10px] text-gray-400">Cancel</button>
              <button type="submit" disabled={creating} className="px-10 py-4 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Register Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lesson List */}

      {/* Lesson List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary/30" strokeWidth={1} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">Loading lessons...</p>
        </div>
      ) : (
        <div className="space-y-16">
          {lessons.length === 0 && (
            <div className="p-20 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
              <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold italic">No lessons yet. Create your first lesson above.</p>
            </div>
          )}

          {Object.entries(
            lessons.reduce((acc: Record<string, Record<string, Lesson[]>>, lesson) => {
              const level = lesson.level || "Basic";
              const category = lesson.category || "Uncategorized";
              if (!acc[level]) acc[level] = {};
              if (!acc[level][category]) acc[level][category] = [];
              acc[level][category].push(lesson);
              return acc;
            }, {})
          ).map(([level, categories]) => (
            <div key={level} className="animate-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-4 mb-10 overflow-hidden">
                <div className="h-[2px] w-12 bg-primary/10 shrink-0" />
                <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] whitespace-nowrap bg-white px-2">Level: {level}</h2>
                <div className="h-[2px] w-full bg-gradient-to-r from-primary/10 to-transparent" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16 pl-6">
                {Object.entries(categories).map(([category, catLessons]) => (
                  <div key={category} className="space-y-4 relative border-l-2 border-gray-50 pl-10">
                    <div className="absolute -left-[11px] top-0 h-5 w-5 rounded-full border-4 border-white bg-secondary shadow-md" />
                    <h3 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-4">
                      {category}
                      <span className="text-[10px] font-bold text-gray-300 bg-gray-50 px-3 py-1 rounded-full">{catLessons.length} Lessons</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {catLessons
                        .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                        .map(lesson => (
                          <AdminLessonCard
                            key={lesson._id}
                            lesson={lesson}
                            onManageQuestions={() => openQuestions(lesson)}
                            onEdit={() => openEdit(lesson)}
                            onDelete={() => handleDelete(lesson._id)}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Lesson Modal */}
      {editingLessonId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-white/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200/40 border border-primary/10 max-w-2xl w-full mx-auto animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-800">Edit Lesson</h3>
              <button onClick={() => setEditingLessonId(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleUpdateLesson} className="space-y-6">
              <div>
                <label className={labelCls}>Lesson Title</label>
                <input
                  required
                  value={editFormData.title}
                  onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className={labelCls}>Select Stage</label>
                  <select 
                    className={inputCls} 
                    value={editFormData.level} 
                    onChange={e => setEditFormData({ ...editFormData, level: e.target.value })}
                  >
                    {["Beginner", "Elementary", "Intermediate", "Advanced"].map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Level #</label>
                  <input
                    type="number"
                    required
                    value={editFormData.orderIndex}
                    onChange={e => setEditFormData({ ...editFormData, orderIndex: parseInt(e.target.value) })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <button type="button" onClick={() => setEditingLessonId(null)} className="px-8 py-4 font-black uppercase tracking-widest text-[10px] text-gray-400">
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
          <div className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-gray-100 flex flex-col animate-in zoom-in-95 duration-300">

            {/* Modal Header */}
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30 shrink-0">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Question Builder</p>
                <h2 className="text-2xl font-black text-gray-800 tracking-tight">{activeLessonTitle}</h2>
              </div>
              <button
                onClick={() => { setActiveLessonId(null); setDraftQuestions([]); }}
                className="h-12 w-12 flex items-center justify-center bg-white rounded-2xl hover:bg-red-50 hover:text-red-500 shadow-sm border border-gray-100 transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {qLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary/30" strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Loading questions...</p>
                </div>
              ) : (
                <>
                  {/* Saved Questions */}
                  {savedQuestions.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Saved Questions</h3>
                        <span className="text-[10px] font-bold bg-gray-50 text-gray-400 px-3 py-1 rounded-full border border-gray-100">{savedQuestions.length} saved</span>
                      </div>
                      <div className="space-y-3">
                        {savedQuestions.map((q, idx) => (
                          <div key={q._id} className="flex items-center justify-between bg-gray-50 p-5 rounded-2xl border border-gray-100 group">
                            <div className="flex items-center gap-4 min-w-0">
                              <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-white text-gray-400 rounded-full border border-gray-100 shrink-0">{idx + 1} • {q.type}</span>
                              <p className="text-sm font-bold text-gray-700 truncate">{q.text}</p>
                            </div>
                            <button onClick={() => handleDeleteSaved(q._id)} className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 shrink-0 ml-3">
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
                      <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-[2rem] mb-4">
                        <BookOpen className="w-10 h-10 text-gray-100 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm font-bold mb-1">No questions yet.</p>
                        <p className="text-gray-300 text-xs font-medium">Click "+ Add Question" to get started.</p>
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
                      className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/2 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add Question
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {!qLoading && (
              <div className="p-6 border-t border-gray-50 flex items-center justify-end gap-4 shrink-0 bg-gray-50/30">
                <button
                  type="button"
                  onClick={() => { setActiveLessonId(null); setDraftQuestions([]); }}
                  className="px-8 py-3.5 font-black uppercase tracking-widest text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
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
