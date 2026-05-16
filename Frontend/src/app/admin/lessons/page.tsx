"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen, Plus, Loader2, Trash2, X, ChevronDown, ChevronUp,
  Mic, AlertCircle, Settings, Tag, ArrowUpDown, ArrowLeft, Save, Menu, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { getLessons, Lesson, getLessonQuestions, Question } from "@/services/lessonService";
import { getCategories, updateCategory, deleteCategory, createCategory, Category as DBCategory } from "@/services/categoryService";
import { api } from "@/lib/api";
import axios from "axios";
import { ImageUpload } from "@/components/ImageUpload";
import { VideoUpload } from "@/components/VideoUpload";

// ── Heuristics ────────────────────────────────────────────────────────────────

const TAMIL_ALPHABET_ORDER = [
  "uyir eluthu",
  "mei eluthu",
  "uyirmei eluthu",
  "uyir mei eluthu",
  "ayutha eluthu",
  "grantha eluthugal"
];

function getHeuristicOrder(name: string): number {
  const lower = name.trim().toLowerCase();
  
  // Direct matches in TAMIL_ALPHABET_ORDER
  const directIdx = TAMIL_ALPHABET_ORDER.indexOf(lower);
  if (directIdx !== -1) return directIdx * 10;

  // Keyword matches (highest priority first)
  if (lower.includes("uyir mei") || lower.includes("uyirmei")) return 30; // Index 2 * 10
  if (lower.includes("mei")) return 20; // Index 1 * 10 
  if (lower.includes("uyir")) return 10; // Index 0 * 10
  if (lower.includes("ayutha")) return 40;
  if (lower.includes("grantha")) return 50;
  
  return 999; // Unknown
}

// ── Types ─────────────────────────────────────────────────────────────────────

type QuestionType = "mcq" | "matching" | "speaking" | "writing" | "taparrange";

interface MCQData { question: string; options: string[]; correctAnswer: string; expectedAudioText?: string; }
interface MatchingData { pairs: { left: string; right: string }[]; expectedAudioText?: string; }
interface SpeakingData { promptText: string; correctSentence: string; referenceAudio: string; expectedAudioText?: string; }
interface WritingData { question: string; expectedText: string; expectedAudioText?: string; }
interface TapArrangeData { sentence: string; expectedAudioText?: string; }

interface CommonFields {
  difficulty: 'easy' | 'medium' | 'hard';
  skill: 'reading' | 'writing' | 'listening' | 'speaking';
  xp: number;
  hint: string;
  explanation: string;
  imageUrl?: string;
}

type QuestionData = MCQData | MatchingData | SpeakingData | WritingData | TapArrangeData;

interface DraftQuestion {
  id: string; // temp local id
  type: QuestionType;
  data: QuestionData;
  common?: CommonFields;
  error?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_META: Record<QuestionType, { label: string; icon: React.ReactNode; color: string }> = {
  mcq:        { label: "MCQ",         icon: null, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  matching:   { label: "Matching",    icon: null, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  speaking:   { label: "Speaking",    icon: <Mic className="w-4 h-4" />, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  writing:    { label: "Writing",     icon: null, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  taparrange: { label: "Tap-to-Arrange", icon: <ArrowUpDown className="w-4 h-4" />, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
};


const defaultData = (type: QuestionType): QuestionData => {
  switch (type) {
    case "mcq":        return { question: "", options: ["", ""], correctAnswer: "" };
    case "matching":   return { pairs: [{ left: "", right: "" }] };
    case "speaking":   return { promptText: "", correctSentence: "", referenceAudio: "" };
    case "writing":    return { question: "", expectedText: "" };
    case "taparrange": return { sentence: "" };
  }
};

const defaultCommonFields = (): CommonFields => ({
  difficulty: 'medium',
  skill: 'reading',
  xp: 10,
  hint: "",
  explanation: "",
  imageUrl: ""
});


function uid() { return Math.random().toString(36).slice(2); }

function validateQuestion(q: DraftQuestion): string | undefined {
  switch (q.type) {
    case "mcq": {
      const d = q.data as MCQData;
      if (!d.question?.trim()) return "Question text is required.";
      if (!d.options || d.options.filter(o => o.trim()).length < 2) return "At least 2 non-empty options required.";
      if (!d.correctAnswer?.trim()) return "Select a correct answer.";
      if (!d.options.includes(d.correctAnswer)) return "Correct answer must be one of the options.";
      return;
    }
    case "matching": {
      const d = q.data as MatchingData;
      if (!d.pairs || d.pairs.length < 1) return "At least one pair is required.";
      if (d.pairs.some(p => !p.left?.trim() || !p.right?.trim())) return "All pairs must have both sides filled.";
      return;
    }
    case "speaking": {
      const d = q.data as SpeakingData;
      if (!d.promptText?.trim()) return "Prompt text is required.";
      if (!d.correctSentence?.trim()) return "Correct sentence is required.";
      return;
    }
    case "writing": {
      const d = q.data as WritingData;
      if (!d.expectedText?.trim()) return "Expected text is required.";
      return;
    }
    case "taparrange": {
      const d = q.data as TapArrangeData;
      if (!d.sentence?.trim()) return "Sentence is required.";
      return;
    }
  }
}

function questionToDraft(q: Question): DraftQuestion {
  const type: QuestionType = (
    q.type === "quiz" ? "mcq" : 
    q.type === "match" ? "matching" : 
    (q.type === "fill" && q.words && q.words.length > 0) ? "taparrange" :
    q.type === "speaking" ? "speaking" :
    q.type === "writing" ? "writing" :
    "mcq" // fallback
  );
                             
  let data: any = {
    question: q.text,
    options: q.options || [],
    correctAnswer: q.options?.[q.correctOptionIndex || 0] || q.correctAnswer || "",
    promptText: q.text,
    correctSentence: q.correctAnswer || q.expectedAudioText || "",
    expectedText: q.correctAnswer || "",
    expectedAudioText: q.expectedAudioText || "",
    sentence: q.correctAnswer || "",
    imageUrl: q.imageUrl || ""
  };

  if (type === "matching") {
    try {
      data.pairs = typeof q.correctAnswer === 'string' ? JSON.parse(q.correctAnswer) : (q.correctAnswer || []);
      if (!Array.isArray(data.pairs)) data.pairs = [];
    } catch {
      data.pairs = [{ left: "", right: "" }];
    }
  }
  
  if (type === "speaking") {
    data.referenceAudio = (q as any).referenceAudio || "";
  }

  return {
    id: q._id,
    type,
    data,
    common: {
      difficulty: q.difficulty as any || 'medium',
      skill: q.skill as any || 'reading',
      xp: q.xp || q.scoreValue || 10,
      hint: q.hint || "",
      explanation: q.explanation || "",
      imageUrl: q.imageUrl || ""
    }
  };
}

// ── Input primitives (consistent with existing design system) ─────────────────

const inputCls = "w-full p-5 bg-white border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:font-medium placeholder:text-primary/40";
const labelCls = "block text-[11px] font-black uppercase tracking-widest text-primary/60 mb-2 ml-1";

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
        <label className={labelCls}>Text to Speech (optional - adds a speaker button)</label>
        <input className={inputCls} placeholder="e.g. Type the word to be spoken" value={data.expectedAudioText || ""} onChange={e => onChange({ ...data, expectedAudioText: e.target.value })} />
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

function WritingForm({ data, onChange }: { data: WritingData; onChange: (d: WritingData) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className={labelCls}>Question (Instruction for the student)</label>
        <input className={inputCls} placeholder="e.g. Draw the Tamil letter 'A'" value={data.question || ""} onChange={e => onChange({ ...data, question: e.target.value })} />
      </div>
      <div>
        <label className={labelCls}>Expected Tamil Letter / Word</label>
        <input className={inputCls} placeholder="e.g. அ" value={data.expectedText} onChange={e => onChange({ ...data, expectedText: e.target.value })} />
        <p className="text-[10px] text-primary/60 font-medium mt-1.5 ml-1">The student will be asked to draw this.</p>
      </div>
      <div>
        <label className={labelCls}>Text to Speech (optional - adds a speaker button)</label>
        <input className={inputCls} placeholder="e.g. Type the word to be spoken" value={data.expectedAudioText || ""} onChange={e => onChange({ ...data, expectedAudioText: e.target.value })} />
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
      <div>
        <label className={labelCls}>Text to Speech (optional - adds a speaker button)</label>
        <input className={inputCls} placeholder="e.g. Type the word to be spoken" value={data.expectedAudioText || ""} onChange={e => onChange({ ...data, expectedAudioText: e.target.value })} />
      </div>
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

function CommonFieldsForm({ fields, onChange }: { fields: CommonFields; onChange: (f: CommonFields) => void }) {
  return (
    <div className="border-t border-slate-50 pt-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <p className="text-[11px] font-black uppercase tracking-widest text-primary/40 mb-4">Common Settings</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Difficulty</label>
              <select className={inputCls} value={fields.difficulty} onChange={e => onChange({ ...fields, difficulty: e.target.value as any })}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Skill</label>
              <select className={inputCls} value={fields.skill} onChange={e => onChange({ ...fields, skill: e.target.value as any })}>
                <option value="reading">Reading</option>
                <option value="writing">Writing</option>
                <option value="listening">Listening</option>
                <option value="speaking">Speaking</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>XP Value</label>
              <input type="number" className={inputCls} value={fields.xp} min={1} max={100} onChange={e => onChange({ ...fields, xp: Number(e.target.value) })} />
            </div>
          </div>
        </div>
        <div className="md:w-72 shrink-0">
           <ImageUpload 
             value={fields.imageUrl} 
             onChange={url => onChange({ ...fields, imageUrl: url })} 
             label="Question Image"
           />
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Hint (shown on wrong answer)</label>
          <input className={inputCls} placeholder="Optional hint..." value={fields.hint} onChange={e => onChange({ ...fields, hint: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Explanation (shown after answer)</label>
          <textarea className={inputCls + " resize-none h-20"} placeholder="Why is this the correct answer?" value={fields.explanation} onChange={e => onChange({ ...fields, explanation: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

function TapArrangeForm({ data, onChange }: { data: TapArrangeData; onChange: (d: TapArrangeData) => void }) {
  const preview = data.sentence.trim().split(/\s+/).filter(Boolean);
  return (
    <div className="space-y-6">
      <div>
        <label className={labelCls}>Full Sentence (words will be shuffled for student)</label>
        <input className={inputCls} placeholder="e.g. அம்மா வீட்டில் இருக்கிறாள்" value={data.sentence} onChange={e => onChange({ ...data, sentence: e.target.value })} />
        {preview.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {preview.map((w, i) => (
              <span key={i} className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-base font-bold">{w}</span>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className={labelCls}>Text to Speech (optional)</label>
        <input className={inputCls} placeholder="Word to speak aloud" value={data.expectedAudioText || ""} onChange={e => onChange({ ...data, expectedAudioText: e.target.value })} />
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
        <label className={labelCls}>Text to Speech (optional - adds a speaker button for the prompt)</label>
        <input className={inputCls} placeholder="e.g. Type the word to be spoken" value={data.expectedAudioText || ""} onChange={e => onChange({ ...data, expectedAudioText: e.target.value })} />
      </div>
      <div>
        <label className={labelCls}>Correct Sentence</label>
        <input className={inputCls} placeholder="e.g. Vanakkam" value={data.correctSentence} onChange={e => onChange({ ...data, correctSentence: e.target.value })} />
      </div>
      <div>
        <label className={labelCls}>Reference Audio URL (optional - audio clip the user can listen to)</label>
        <input className={inputCls} placeholder="https://..." value={data.referenceAudio} onChange={e => onChange({ ...data, referenceAudio: e.target.value })} />
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
  const [isSaving, setIsSaving] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const meta = TYPE_META[question.type];

  const updateData = (data: QuestionData) => onUpdate({ ...question, data, error: undefined });
  const changeType = (type: QuestionType) => onUpdate({ ...question, type, data: defaultData(type), error: undefined });

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await onUpdate(question);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`bg-white border-2 rounded-[2.5rem] overflow-hidden transition-all duration-500 group/qc ${
      question.error 
        ? "border-red-200 shadow-xl shadow-red-500/5" 
        : "border-slate-100 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
    }`}>
      {/* Card Header */}
      <div className="flex items-center gap-6 p-8 cursor-pointer relative group-hover/qc:bg-primary/[0.01] transition-colors" onClick={() => setExpanded(e => !e)}>
        <div className={`inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl border transition-all duration-500 ${meta.color} group-hover/qc:scale-105`}>
          {meta.icon} {meta.label}
        </div>
        <div>
          <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">Configuring</span>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Question {index + 1}</h4>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          <button 
            type="button" 
            onClick={e => { e.stopPropagation(); onRemove(); }} 
            className="h-12 w-12 flex items-center justify-center text-primary/20 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
            title="Remove Question"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <div className={`h-12 w-12 flex items-center justify-center rounded-2xl border transition-all ${expanded ? "bg-primary/5 border-primary/10 text-primary" : "border-slate-100 text-slate-300"}`}>
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
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
                  disabled={isSaving}
                  onClick={() => changeType(t)}
                  className={`inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl border transition-all ${
                    question.type === t ? TYPE_META[t].color + " scale-105 shadow-sm" : "border-slate-100 text-primary/60 hover:border-slate-200"
                  }`}
                >
                  {TYPE_META[t].icon} {TYPE_META[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic form */}
          <div className={isSaving ? "opacity-50 pointer-events-none" : ""}>
            {question.type === "mcq"        && <MCQForm       data={question.data as MCQData}       onChange={updateData} />}
            {question.type === "matching"   && <MatchingForm  data={question.data as MatchingData}  onChange={updateData} />}
            {question.type === "speaking"   && <SpeakingForm  data={question.data as SpeakingData}  onChange={updateData} />}
            {question.type === "writing"    && <WritingForm   data={question.data as WritingData}   onChange={updateData} />}
            {question.type === "taparrange" && <TapArrangeForm data={question.data as TapArrangeData} onChange={updateData} />}
          </div>

          {/* Common Fields */}
          <CommonFieldsForm
            fields={question.common || defaultCommonFields()}
            onChange={f => onUpdate({ ...question, common: f })}
          />

          {/* Inline Save button for existing questions being edited */}
          {question.id.length > 20 && (
             <div className="flex justify-end pt-4">
                <button
                  onClick={handleUpdate}
                  disabled={isSaving}
                  className="px-8 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
             </div>
          )}
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
        {lesson.accessLevel !== 'BASIC' && (
          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border shrink-0 ${lesson.accessLevel === 'MASTER' ? 'border-amber-200 bg-amber-50 text-amber-600' : 'border-primary/20 bg-primary/5 text-primary'}`}>
            {lesson.accessLevel}
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

function AdminCategoryGroup({ 
  categoryName, 
  lessons, 
  dbCategory,
  openQuestions, 
  openEdit, 
  handleDelete, 
  onAddLesson,
  onEditCategory,
  onDeleteCategory,
  onMoveCategory
}: { 
  categoryName: string, 
  lessons: Lesson[], 
  dbCategory?: DBCategory,
  openQuestions: (l: Lesson) => void, 
  openEdit: (l: Lesson) => void, 
  handleDelete: (id: string) => void, 
  onAddLesson: (catName: string, nextNum?: number) => void,
  onEditCategory?: (cat: DBCategory) => void,
  onDeleteCategory?: (id: string) => void,
  onMoveCategory?: (id: string, direction: "up" | "down", currentIdx: number) => void
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`bg-white rounded-[2.5rem] border transition-all duration-300 ${expanded ? "ring-2 ring-primary/20 border-primary shadow-2xl shadow-primary/5" : "border-slate-100 hover:border-primary/20 hover:shadow-sm"}`}>
      <div className="flex flex-row items-center justify-between p-8 cursor-pointer relative gap-6" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-6 min-w-0">
          <div className={`h-16 w-16 rounded-[1.5rem] border flex items-center justify-center shrink-0 transition-all duration-500 ${expanded ? "bg-primary text-white border-white/20" : "bg-primary/5 text-primary border-primary/10"}`}>
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="truncate">
             <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight truncate">{categoryName}</h2>
             <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mt-1">{lessons.length} {lessons.length === 1 ? 'Stage' : 'Stages'} configured</p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center bg-slate-50/50 p-1.5 rounded-2xl border border-slate-100/50">
            <div className="flex flex-col items-center border-r border-slate-200/50 pr-2 mr-2">
              <button 
                onClick={e => { e.stopPropagation(); onMoveCategory?.(dbCategory?._id || categoryName, "up", dbCategory?.orderIndex ?? getHeuristicOrder(categoryName)); }}
                className="p-1 text-primary/30 hover:text-primary transition-all hover:scale-125 disabled:opacity-30"
                title="Move Up"
              >
                 <ChevronUp className="w-4 h-4" />
              </button>
              <button 
                onClick={e => { e.stopPropagation(); onMoveCategory?.(dbCategory?._id || categoryName, "down", dbCategory?.orderIndex ?? getHeuristicOrder(categoryName)); }}
                className="p-1 text-primary/30 hover:text-primary transition-all hover:scale-125 disabled:opacity-30"
                title="Move Down"
              >
                 <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={e => { 
                  e.stopPropagation(); 
                  if (dbCategory) onEditCategory?.(dbCategory);
                  else onEditCategory?.({ _id: "", name: categoryName, orderIndex: getHeuristicOrder(categoryName) }); 
                }}
                className="p-2.5 text-primary/30 hover:text-primary hover:bg-white rounded-xl transition-all shadow-sm shadow-transparent hover:shadow-slate-200/50"
                title="Edit Specifications"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={e => { 
                  e.stopPropagation(); 
                  if (dbCategory) onDeleteCategory?.(dbCategory._id);
                  else handleDelete(lessons[0]._id); 
                }}
                className="p-2.5 text-primary/30 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm shadow-transparent hover:shadow-slate-200/50"
                title="Remove Topic"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={e => { e.stopPropagation(); onAddLesson(categoryName, lessons.length + 1); }}
            className="hidden sm:flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-primary rounded-2xl hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 transition-all ml-2"
          >
            <Plus className="w-4 h-4" /> Levels
          </button>

          <div className={`p-4 rounded-full transition-all duration-300 ${expanded ? "bg-primary/10 text-primary" : "text-slate-300"}`}>
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
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
  const [dbCategories, setDbCategories] = useState<DBCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Unified Category (which is a Lesson in DB) creation form
  const [showCreate, setShowCreate] = useState(false);
  const [isAddingToExisting, setIsAddingToExisting] = useState(false);
  const [formData, setFormData] = useState({ 
    category: "", 
    title: "", 
    accessLevel: "BASIC" as 'BASIC' | 'PLUS' | 'MASTER', 
    level: "Beginner", // The 'Stage'
    moduleNumber: 1, 
    orderIndex: 0,
    imageUrl: "",
    videoUrl: ""
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
  const scrollRef = React.useRef<HTMLDivElement>(null);

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
      const [lessonData, categoryData] = await Promise.all([
        getLessons(),
        getCategories()
      ]);
      setLessons(lessonData.lessons || []);
      setDbCategories(categoryData || []);
    } catch (e: unknown) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const [editingSavedId, setEditingSavedId] = useState<string | null>(null);

  async function handleMoveQuestion(index: number, direction: "up" | "down") {
    if (!activeLessonId) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === savedQuestions.length - 1) return;

    const list = [...savedQuestions];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    [list[index], list[targetIdx]] = [list[targetIdx], list[index]];

    setSavedQuestions(list); 
    try {
      await api.patch(`/lessons/${activeLessonId}/questions/reorder`, { 
        orderedIds: list.map(q => q._id) 
      });
    } catch {
      alert("Reorder failed.");
      const data = await getLessonQuestions(activeLessonId);
      setSavedQuestions(data.questions || []);
    }
  }

  async function handleUpdateSaved(id: string, updated: DraftQuestion) {
    if (!activeLessonId) return;
    try {
      const payload = buildPayload(updated);
      
      // Validation: Ensure correctOptionIndex is valid for MCQ
      if (payload.type === 'quiz' && (payload as any).correctOptionIndex === -1) {
        throw new Error("Please select a correct answer from the options.");
      }

      await api.patch(`/lessons/${activeLessonId}/questions/${id}`, payload);
      setEditingSavedId(null);
      const data = await getLessonQuestions(activeLessonId);
      setSavedQuestions(data.questions || []);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || "Failed to update question.";
      alert(`Update Error: ${msg}`);
      // Don't close the editor so user can fix the error
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
        accessLevel: "BASIC", 
        level: "Beginner", 
        moduleNumber: 1, 
        orderIndex: lessons.length,
        imageUrl: "",
        videoUrl: ""
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
  const [editFormData, setEditFormData] = useState({ title: "", level: "Beginner", category: "", moduleNumber: 1, orderIndex: 0, accessLevel: "BASIC" as 'BASIC' | 'PLUS' | 'MASTER', imageUrl: "", videoUrl: "" });

  function openEdit(lesson: Lesson) {
    setEditingLessonId(lesson._id);
    setEditFormData({
      title: lesson.title,
      level: lesson.level || "Beginner",
      category: lesson.category || "",
      moduleNumber: lesson.moduleNumber || 1,
      orderIndex: lesson.orderIndex || 0,
      accessLevel: lesson.accessLevel || "BASIC",
      imageUrl: lesson.imageUrl || "",
      videoUrl: lesson.videoUrl || "",
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
    setDraftQuestions(prev => [...prev, { 
      id: uid(), 
      type: "mcq", 
      data: defaultData("mcq"),
      common: defaultCommonFields()
    }]);
    
    // Auto-scroll to bottom
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
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
      let savedCount = 0;
      for (const q of draftQuestions) {
        const payload = buildPayload(q);
        
        // Final MCQ check
        if (payload.type === 'quiz' && (payload as any).correctOptionIndex === -1) {
           q.error = "Please select a correct answer.";
           setSavingQ(false);
           return;
        }

        await api.post(`/lessons/${activeLessonId}/questions`, payload);
        savedCount++;
      }
      const data = await getLessonQuestions(activeLessonId);
      setSavedQuestions(data.questions || []);
      setDraftQuestions([]);
      alert(`Successfully saved ${savedCount} questions.`);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || "Failed to save questions.";
      alert(`Save Error: ${msg}`);
    } finally {
      setSavingQ(false);
    }
  }

  function buildPayload(q: DraftQuestion) {
    const common = q.common || defaultCommonFields();
    const commonPayload = {
      difficulty: common.difficulty,
      skill: common.skill,
      xp: common.xp,
      hint: common.hint,
      explanation: common.explanation,
      imageUrl: common.imageUrl,
      scoreValue: common.xp // Keep scoreValue in sync with XP
    };

    switch (q.type) {
      case "mcq": {
        const d = q.data as MCQData;
        return { 
          type: "quiz", 
          text: d.question, 
          options: d.options, 
          correctAnswer: d.correctAnswer, 
          correctOptionIndex: d.options.indexOf(d.correctAnswer), 
          expectedAudioText: d.expectedAudioText,
          ...commonPayload
        };
      }
      case "matching": {
        const d = q.data as MatchingData;
        return { 
          type: "match", 
          text: "Match the pairs", 
          options: d.pairs.map(p => p.left), 
          pairs: d.pairs,
          correctAnswer: JSON.stringify(d.pairs), 
          expectedAudioText: d.expectedAudioText,
          ...commonPayload
        };
      }
      case "speaking": {
        const d = q.data as SpeakingData;
        return { 
          type: "speaking", 
          text: d.promptText, 
          correctAnswer: d.correctSentence, 
          expectedAudioText: d.expectedAudioText || d.correctSentence, 
          referenceAudio: d.referenceAudio,
          ...commonPayload
        };
      }
      case "writing": {
        const d = q.data as WritingData;
        return { 
          type: "writing", 
          text: d.question || `Draw: ${d.expectedText}`, 
          correctAnswer: d.expectedText, 
          expectedAudioText: d.expectedAudioText,
          ...commonPayload
        };
      }
      case "taparrange": {
        const d = q.data as TapArrangeData;
        const words = d.sentence.trim().split(/\s+/).filter(Boolean);
        return {
          type: "fill",
          text: "Arrange the words in the correct order",
          words: words,
          correctAnswer: d.sentence.trim(),
          expectedAudioText: d.expectedAudioText,
          ...commonPayload
        };
      }
    }
  }


  // Category Mgmt Actions
  const [editingCategory, setEditingCategory] = useState<DBCategory | null>(null);
  const [catFormData, setCatFormData] = useState({ name: "", description: "", orderIndex: 0 });

  async function handleMoveCategory(idOrName: string, direction: "up" | "down", currentIdx: number) {
    setLoading(true);
    try {
      const visibleLessons = lessons.filter(l => {
        const lvl = l.level || "Beginner";
        return lvl === activeLevel;
      });

      const allNames = Array.from(new Set(visibleLessons.map(l => {
        const cat = l.category || "Uncategorized";
        if (cat.toLowerCase() === (l.level || "").toLowerCase() || cat === "General") return l.title || "Uncategorized";
        return cat;
      })));

      const fullList = allNames.map(name => {
        const dbC = dbCategories.find(c => c.name.toLowerCase() === name.toLowerCase());
        return {
          id: dbC?._id || name,
          name: name,
          isVirtual: !dbC,
          orderIndex: (dbC?.orderIndex !== undefined && dbC.orderIndex !== null) ? dbC.orderIndex : getHeuristicOrder(name)
        };
      });

      fullList.sort((a,b) => {
        if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
        return a.name.localeCompare(b.name);
      });

      const findIndex = fullList.findIndex(x => x.id === idOrName || x.name === idOrName);
      if (findIndex === -1) { setLoading(false); return; }
      if (direction === "up" && findIndex === 0) { setLoading(false); return; }
      if (direction === "down" && findIndex === fullList.length - 1) { setLoading(false); return; }

      const targetIdx = direction === "up" ? findIndex - 1 : findIndex + 1;
      const newList = [...fullList];
      const originItem = newList[findIndex];
      const targetItem = newList[targetIdx];
      
      newList[findIndex] = targetItem;
      newList[targetIdx] = originItem;

      interface CategoryMoveItem { isVirtual: boolean; name: string; orderIndex: number; _id?: string; id: string; }
      const resolveId = async (item: CategoryMoveItem): Promise<string> => {
        if (item.isVirtual) {
          try {
            const res = await createCategory({ name: item.name.trim(), orderIndex: item.orderIndex });
            return res._id;
          } catch (err: unknown) {
             if (axios.isAxiosError(err) && err.response?.status === 400 && (err.response.data as { message?: string })?.message?.toLowerCase().includes("exists")) {
                const refreshed = await getCategories();
                const matched = refreshed.find(c => c.name.trim().toLowerCase() === item.name.trim().toLowerCase());
                if (matched) return matched._id;
             }
             throw err;
          }
        }
        return item.id;
      };

      const idMap = await Promise.all(newList.map(async (item) => ({
        id: await resolveId(item),
        name: item.name
      })));
      await Promise.all(idMap.map((item, idx) => 
        updateCategory(item.id, { orderIndex: (idx + 1) * 10 })
      ));
      await fetchLessons();
    } catch (err: any) {
      console.error("Move failed", err);
      const msg = err.response?.data?.message || err.message || "Failed to reorder topics.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("Delete category? (Existing lessons will become 'Uncategorized')")) return;
    try {
      await deleteCategory(id);
      await fetchLessons();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to delete.";
      alert(msg);
    }
  }

  function openEditCategory(cat: DBCategory) {
    setEditingCategory(cat);
    setCatFormData({ 
      name: cat.name, 
      description: cat.description || "", 
      orderIndex: cat.orderIndex || 0 
    });
  }

  async function handleUpdateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCategory) return;
    setLoading(true);
    try {
      const oldName = editingCategory.name;
      const newName = catFormData.name.trim();
      const newOrder = Number(catFormData.orderIndex);

      if (!editingCategory._id) {
        // Create new category in DB
        try {
          await createCategory({
            name: newName,
            description: catFormData.description,
            orderIndex: newOrder
          });
        } catch (err: any) {
           if (err.response?.status === 400 && err.response?.data?.message?.toLowerCase().includes("exists")) {
              // It exists already, the UI just didn't catch it so it's "Virtual"
              // That's fine, we can just proceed to sync the oldName/newName logic below
           } else {
             throw err;
           }
        }
      } else {
        // Update existing category document
        await updateCategory(editingCategory._id, {
          name: newName,
          description: catFormData.description,
          orderIndex: newOrder
        });

        if (oldName && newName && oldName !== newName) {
           const affected = lessons.filter(l => 
             l.category?.toLowerCase() === oldName.toLowerCase() || 
             l.sectionName?.toLowerCase() === oldName.toLowerCase()
           );
           
           if (affected.length > 0) {
             await Promise.all(affected.map(l => 
               api.patch(`/lessons/${l._id}`, { 
                 category: newName, 
                 sectionName: newName 
               }).catch(e => console.error("Failed to sync lesson "+l._id, e))
             ));
           }
        }
      }
      setEditingCategory(null);
      await fetchLessons();
    } catch (err: any) {
      console.error("Update failed", err);
      const msg = err.response?.data?.message || err.message || "An unexpected error occurred.";
      alert(`Save Failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm shadow-slate-200/50">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1.5 w-6 rounded-full bg-primary" />
            <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.3em]">Curriculum Master</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter leading-none">Manage Categories</h1>
          <p className="text-lg text-primary/70 font-medium leading-relaxed max-w-2xl">Organize your learning path and levels.</p>
        </div>
        <button
          onClick={() => openAddLesson()}
          className="flex items-center justify-center gap-3 rounded-2xl bg-primary px-10 py-5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="h-5 w-5" /> ADD NEW CATEGORY
        </button>
      </div>

      {/* Unified Creation Form Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-white/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-[3rem] border-2 border-primary/10 shadow-2xl shadow-primary/5 max-w-2xl w-full mx-auto animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                   {isAddingToExisting ? <Plus className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{isAddingToExisting ? `Add Level to ${formData.category}` : "Create New Category"}</h2>
                  <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mt-0.5">Define your curriculum structure</p>
                </div>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-primary/60" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-8">
              <div className={`grid grid-cols-1 ${isAddingToExisting ? "" : "md:grid-cols-2"} gap-8`}>
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
                  <label className={labelCls}>Level Number / Title</label>
                  <div className="relative">
                    <input
                      required
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className={inputCls}
                      placeholder="e.g. 2"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-primary/40">
                      <span className="text-[9px] font-black uppercase tracking-widest bg-primary/5 px-2 py-1 rounded">Level</span>
                    </div>
                  </div>
                </div>
              </div>

              {!isAddingToExisting && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelCls}>Curriculum Level</label>
                    <div className="relative">
                      <select 
                        value={formData.level} 
                        onChange={e => setFormData({ ...formData, level: e.target.value })} 
                        className={inputCls + " cursor-pointer appearance-none w-full"}
                      >
                        {["Beginner", "Elementary", "Intermediate", "Advanced"].map(lv => (
                          <option key={lv} value={lv}>{lv}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-primary/40">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Access Level</label>
                    <div className="flex gap-3">
                      {[
                        { id: 'BASIC', label: 'Basic', icon: '✓', color: 'bg-emerald-500', border: 'border-emerald-500' },
                        { id: 'PLUS', label: 'Plus', icon: '+', color: 'bg-primary', border: 'border-primary' },
                        { id: 'MASTER', label: 'Master', icon: '★', color: 'bg-amber-500', border: 'border-amber-500' }
                      ].map((lvl) => (
                        <button 
                          key={lvl.id}
                          type="button" 
                          onClick={() => setFormData({...formData, accessLevel: lvl.id as any})}
                          className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${formData.accessLevel === lvl.id ? `${lvl.color} text-white ${lvl.border}` : "bg-slate-50 text-primary/60 border-slate-100"}`}
                        >
                          {lvl.icon} {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ImageUpload 
                    label="Lesson Image (Optional)" 
                    value={formData.imageUrl} 
                    onChange={url => setFormData({ ...formData, imageUrl: url })} 
                  />
                </div>
                <div>
                  <VideoUpload 
                    label="Lesson Video (Optional)" 
                    value={formData.videoUrl} 
                    onChange={url => setFormData({ ...formData, videoUrl: url })} 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-8 py-4 font-black uppercase tracking-widest text-[10px] text-primary/60">Cancel</button>
                <button type="submit" disabled={creating} className="px-10 py-4 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : (isAddingToExisting ? "Add Level" : "Create Category")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Level Filter Tabs */}
      {!loading && (
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-[2.5rem] border border-slate-100 shadow-sm mb-12">
          {["Beginner", "Elementary", "Intermediate", "Advanced"].map((lv) => {
            const isActive = activeLevel === lv;
            return (
              <button
                key={lv}
                onClick={() => setActiveLevel(lv)}
                className={`flex-1 min-w-[140px] py-5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border-2 ${
                  isActive 
                  ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-[1.03]" 
                  : "bg-slate-50 text-primary/60 border-transparent hover:bg-slate-100 hover:text-slate-600"
                }`}
              >
                {lv}
              </button>
            );
          })}
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
              <p className="text-primary/60 font-bold">No lessons yet. Create your first lesson above.</p>
            </div>
          )}

          {(() => {
            const levelFiltered = lessons.filter(l => {
              const lvl = l.level || "Beginner";
              return lvl === activeLevel;
            });
            const totalPages = Math.ceil(levelFiltered.length / 6);
            const paginated = levelFiltered
              .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
              .slice((currentPage - 1) * 6, currentPage * 6);

            const categoriesOnPage = paginated.reduce((acc: Record<string, Lesson[]>, lesson: Lesson) => {
              let category = lesson.category || "Uncategorized";
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
                      <p className="text-primary/60 font-bold">This level is currently empty.</p>
                    </div>
                  ) : (
                  <div className="space-y-6">
                    {Object.entries(categoriesOnPage)
                      .sort(([nameA], [nameB]) => {
                        const catA = dbCategories.find(c => c.name.toLowerCase() === nameA.toLowerCase());
                        const catB = dbCategories.find(c => c.name.toLowerCase() === nameB.toLowerCase());
                        
                        const orderA = (catA?.orderIndex !== undefined && catA.orderIndex !== null) ? catA.orderIndex : getHeuristicOrder(nameA);
                        const orderB = (catB?.orderIndex !== undefined && catB.orderIndex !== null) ? catB.orderIndex : getHeuristicOrder(nameB);
                        
                        if (orderA !== orderB) return orderA - orderB;
                        return nameA.localeCompare(nameB);
                      })
                      .map(([catName, catLessons]) => {
                        const dbCat = dbCategories.find(c => c.name.toLowerCase() === catName.toLowerCase());
                        return (
                          <AdminCategoryGroup
                            key={catName}
                            categoryName={catName}
                            lessons={catLessons}
                            dbCategory={dbCat}
                            openQuestions={openQuestions}
                            openEdit={openEdit}
                            handleDelete={handleDelete}
                            onAddLesson={openAddLesson}
                            onEditCategory={openEditCategory}
                            onDeleteCategory={handleDeleteCategory}
                            onMoveCategory={handleMoveCategory}
                          />
                        );
                      })}
                  </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-1 px-8 py-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
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
              <h3 className="text-xl font-black text-slate-800">Edit Level</h3>
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
                  <label className={labelCls}>Level Number</label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Level</label>
                <select
                  value={editFormData.level}
                  onChange={e => setEditFormData({ ...editFormData, level: e.target.value as any })}
                  className={inputCls}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Elementary">Elementary</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Access Level</label>
                <div className="flex gap-2">
                  {[
                    { id: 'BASIC', label: 'Basic', color: 'bg-emerald-500' },
                    { id: 'PLUS', label: 'Plus', color: 'bg-primary' },
                    { id: 'MASTER', label: 'Master', color: 'bg-amber-500' }
                  ].map((lvl) => (
                    <button 
                      key={lvl.id}
                      type="button" 
                      onClick={() => setEditFormData({...editFormData, accessLevel: lvl.id as any})}
                      className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${editFormData.accessLevel === lvl.id ? `${lvl.color} text-white border-transparent` : "bg-slate-50 text-primary/60 border-slate-100"}`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ImageUpload 
                    label="Lesson Image (Optional)" 
                    value={editFormData.imageUrl} 
                    onChange={url => setEditFormData({ ...editFormData, imageUrl: url })} 
                  />
                </div>
                <div>
                  <VideoUpload 
                    label="Lesson Video (Optional)" 
                    value={editFormData.videoUrl} 
                    onChange={url => setEditFormData({ ...editFormData, videoUrl: url })} 
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingLessonId(null)} className="flex-1 py-4 font-black uppercase tracking-widest text-[10px] text-primary/60">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                  Update Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Builder Page Overlay */}
      {activeLessonId && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[10000] bg-white flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
          
          {/* Top Bar */}
          <div className="h-28 px-10 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => { setActiveLessonId(null); setDraftQuestions([]); setEditingSavedId(null); }}
                className="h-12 w-12 flex items-center justify-center rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all active:scale-90"
              >
                <ArrowLeft className="w-5 h-5 text-primary/60" />
              </button>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                  <Menu className="w-5 h-5 text-primary/40" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-primary/40 uppercase tracking-widest mb-1">Level Management Portal</p>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">{activeLessonTitle}</h2>
                </div>
              </div>
            </div>

            
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                {savedQuestions.length} Saved Questions
              </span>
              <button
                onClick={() => { setActiveLessonId(null); setDraftQuestions([]); setEditingSavedId(null); }}
                className="h-12 w-12 flex items-center justify-center bg-slate-50 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-slate-50/30" ref={scrollRef}>
            <div className="max-w-6xl mx-auto py-16 px-10 space-y-12 pb-32">


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
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <ArrowUpDown className="w-4 h-4" />
                          </div>
                          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary/70">Saved Inventory</h3>
                        </div>
                        <div className="flex items-center gap-2 px-6 py-2 bg-slate-50 text-primary/40 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {savedQuestions.length} Questions Secured
                        </div>
                      </div>
                      <div className="space-y-4">
                        {savedQuestions.map((q, idx) => (
                          <div key={q._id} className="bg-white rounded-[2.5rem] border-2 border-slate-100/60 overflow-hidden group transition-all duration-500 hover:border-primary/40 hover:shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:z-10">
                            {editingSavedId === q._id ? (
                              <div className="p-6 bg-primary/[0.02]">
                                <QuestionCard 
                                  question={questionToDraft(q)} 
                                  index={idx}
                                  onUpdate={(updated) => handleUpdateSaved(q._id, updated)} 
                                  onRemove={() => setEditingSavedId(null)}
                                />
                              </div>
                            ) : (
                            <div className="flex items-center justify-between p-8 bg-white group-hover:bg-primary/[0.01] transition-all duration-500 relative overflow-hidden">
                              {/* Decorative Hover Background */}
                              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                              
                              <div className="flex items-center gap-8 min-w-0 relative z-10">
                                <div className="flex flex-col items-center border-r-2 border-slate-100 pr-8 mr-2 space-y-1">
                                  <button onClick={() => handleMoveQuestion(idx, 'up')} className="p-1.5 text-primary/20 hover:text-primary transition-all hover:scale-125 disabled:opacity-5" disabled={idx===0}><ChevronUp className="w-6 h-6" /></button>
                                  <button onClick={() => handleMoveQuestion(idx, 'down')} className="p-1.5 text-primary/20 hover:text-primary transition-all hover:scale-125 disabled:opacity-5" disabled={idx===savedQuestions.length-1}><ChevronDown className="w-6 h-6" /></button>
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-primary/5 text-primary rounded-full border border-primary/10 shrink-0">
                                      {idx + 1} • {q.type === 'quiz' ? 'MCQ' : q.type === 'match' ? 'Matching' : q.type}
                                    </span>
                                    {q.difficulty && (
                                      <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border ${
                                        q.difficulty === 'hard' ? 'bg-red-50 text-red-500 border-red-100' : 
                                        q.difficulty === 'medium' ? 'bg-amber-50 text-amber-500 border-amber-100' : 
                                        'bg-emerald-50 text-emerald-500 border-emerald-100'
                                      }`}>
                                        {q.difficulty}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-2xl font-black text-slate-800 tracking-tight truncate group-hover:text-primary transition-colors duration-300">
                                    {q.text}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 relative z-10">
                                <div className="h-10 w-[2px] bg-slate-100 mx-2 hidden md:block" />
                                <button 
                                  onClick={() => setEditingSavedId(q._id)} 
                                  className="h-14 w-14 flex items-center justify-center bg-slate-50 text-primary/30 hover:text-primary hover:bg-primary/5 hover:border-primary/20 border border-transparent rounded-2xl transition-all shadow-sm hover:shadow-xl hover:shadow-primary/10 group/btn"
                                  title="Edit Question"
                                >
                                  <Settings className="w-6 h-6 group-hover/btn:rotate-90 transition-transform duration-500" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteSaved(q._id)} 
                                  className="h-14 w-14 flex items-center justify-center bg-slate-50 text-primary/30 hover:text-red-500 hover:bg-red-50 hover:border-red-100 border border-transparent rounded-2xl transition-all shadow-sm hover:shadow-xl hover:shadow-red-500/10"
                                  title="Delete Question"
                                >
                                  <Trash2 className="w-6 h-6" />
                                </button>
                              </div>
                            </div>
                           )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Draft Questions Section */}
                  <div className="bg-white/50 p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-secondary/10 flex items-center justify-center">
                          <Plus className="w-4 h-4 text-secondary" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-secondary">New Questions</h3>
                      </div>
                      {draftQuestions.length > 0 && (
                        <span className="text-[10px] font-black bg-secondary text-white px-4 py-1.5 rounded-full shadow-lg shadow-secondary/20 animate-bounce">
                          {draftQuestions.length} To Save
                        </span>
                      )}
                    </div>


                    {draftQuestions.length === 0 && savedQuestions.length === 0 && (
                      <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem] mb-4">
                        <BookOpen className="w-10 h-10 text-slate-100 mx-auto mb-3" />
                        <p className="text-primary/60 text-sm font-bold mb-1">No questions yet.</p>
                        <p className="text-primary/40 text-xs font-medium">Click &quot;+ Add Question&quot; to get started.</p>
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
                      className="w-full py-10 rounded-[2.5rem] border-2 border-dashed border-secondary/20 flex flex-col items-center justify-center gap-3 text-xs font-black uppercase tracking-widest text-secondary hover:border-secondary hover:bg-secondary/5 hover:scale-[1.01] active:scale-[0.99] transition-all group"
                    >
                      <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-secondary" />
                      </div>
                      Add Another Question
                    </button>
                  </div>

                </>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          {!qLoading && (
            <div className="p-8 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                 {draftQuestions.length > 0 && (
                   <span className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary text-[10px] font-black uppercase rounded-full animate-pulse">
                     <AlertCircle className="w-3.5 h-3.5" /> {draftQuestions.length} unsaved changes
                   </span>
                 )}
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => { setActiveLessonId(null); setDraftQuestions([]); setEditingSavedId(null); }}
                  className="px-10 py-5 font-black uppercase tracking-widest text-xs text-primary/60 hover:text-slate-600 transition-colors"
                >
                  Discard Changes
                </button>
                {draftQuestions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSaveQuestions}
                    disabled={savingQ}
                    className="px-16 py-5 bg-secondary text-white font-black uppercase tracking-widest text-xs rounded-[1.5rem] shadow-2xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-60 disabled:scale-100"
                  >
                    {savingQ ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <Save className="w-5 h-5" /> Save All Questions
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* Category Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-primary/10 max-w-2xl w-full mx-auto animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-800">Adjust Category</h3>
              <button onClick={() => setEditingCategory(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-primary/60" />
              </button>
            </div>
            <form onSubmit={handleUpdateCategory} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1.5 ml-1">Category Name</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                    <input
                      required
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-700 pl-12"
                      value={catFormData.name}
                      onChange={e => setCatFormData({ ...catFormData, name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1.5 ml-1">Sequence Index</label>
                  <div className="relative">
                    <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                    <input
                      type="number"
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-700 pl-12"
                      value={catFormData.orderIndex}
                      onChange={e => setCatFormData({ ...catFormData, orderIndex: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1.5 ml-1">Curriculum Summary</label>
                <textarea
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-700 min-h-[120px]"
                  placeholder="What should students know about this category?"
                  value={catFormData.description}
                  onChange={e => setCatFormData({ ...catFormData, description: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button 
                  type="button" 
                  onClick={() => handleDeleteCategory(editingCategory._id)} 
                  className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                >
                  Delete Fully
                </button>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setEditingCategory(null)} className="px-8 py-4 font-black uppercase tracking-widest text-[10px] text-primary/60">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-12 py-4 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
