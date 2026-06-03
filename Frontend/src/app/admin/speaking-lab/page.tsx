"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Mic2, Volume2, GripVertical, Search } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";
import { speakTamil } from "@/lib/speak";
import {
  listLabItems,
  createLabItem,
  updateLabItem,
  deleteLabItem,
  LabItemType,
  SpeakingLabItem,
} from "@/services/speakingLabService";

const TYPE_OPTIONS: { label: string; value: LabItemType }[] = [
  { label: "Phonetic Sound Match", value: "phonetic" },
  { label: "Situational Voice Roleplay", value: "roleplay" },
  { label: "Verbal Drag Board", value: "dragboard" },
  { label: "Tongue Twister", value: "tongue_twister" },
  { label: "Fluency Run", value: "fluency" },
];

const TYPE_LABEL: Record<string, string> = Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.label]));

interface FormState {
  type: LabItemType;
  prompt: string;
  tamilWord: string;
  expectedAudioText: string;
  phoneticHint: string;
  audioUrl: string;
  sequence: string; // comma separated in the form
  difficulty: number;
  xp: number;
  order: number;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  type: "phonetic",
  prompt: "",
  tamilWord: "",
  expectedAudioText: "",
  phoneticHint: "",
  audioUrl: "",
  sequence: "",
  difficulty: 1,
  xp: 10,
  order: 0,
  isActive: true,
};

export default function AdminSpeakingLabPage() {
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "speaking-lab", "items"],
    queryFn: listLabItems,
  });

  const items = useMemo(() => data?.items || [], [data]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.prompt?.toLowerCase().includes(q) ||
        i.tamilWord?.toLowerCase().includes(q) ||
        TYPE_LABEL[i.type]?.toLowerCase().includes(q)
    );
  }, [items, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (item: SpeakingLabItem) => {
    setEditingId(item._id);
    setForm({
      type: item.type,
      prompt: item.prompt || "",
      tamilWord: item.tamilWord || "",
      expectedAudioText: item.expectedAudioText || "",
      phoneticHint: item.phoneticHint || "",
      audioUrl: item.audioUrl || "",
      sequence: (item.sequence || []).join(", "),
      difficulty: item.difficulty || 1,
      xp: item.xp || 10,
      order: item.order || 0,
      isActive: item.isActive !== false,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.prompt.trim()) e.prompt = "Prompt / instruction is required.";
    if (!form.tamilWord.trim() && !form.expectedAudioText.trim() && !form.sequence.trim()) {
      e.tamilWord = "Provide a Tamil target word, expected text, or a sequence to grade speech.";
    }
    if (form.type === "dragboard" && !form.sequence.trim()) {
      e.sequence = "Drag boards need a sequence of tokens (comma separated).";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!validate()) {
      toast("Please fix the highlighted fields.", "error");
      return;
    }
    setIsSubmitting(true);
    const payload: Partial<SpeakingLabItem> = {
      type: form.type,
      prompt: form.prompt.trim(),
      tamilWord: form.tamilWord.trim() || undefined,
      expectedAudioText: form.expectedAudioText.trim() || undefined,
      phoneticHint: form.phoneticHint.trim() || undefined,
      audioUrl: form.audioUrl.trim() || undefined,
      sequence: form.sequence.trim()
        ? form.sequence.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
      difficulty: Number(form.difficulty) || 1,
      xp: Number(form.xp) || 10,
      order: Number(form.order) || 0,
      isActive: form.isActive,
    };
    try {
      if (editingId) {
        await updateLabItem(editingId, payload);
        toast("Speaking Lab item updated.", "success");
      } else {
        await createLabItem(payload);
        toast("Speaking Lab item created.", "success");
      }
      setModalOpen(false);
      await refetch();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Save failed. Please try again.";
      toast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: SpeakingLabItem) => {
    const ok = await confirm({
      title: "Delete activity?",
      message: `"${item.prompt}" will be permanently removed from the Speaking Lab.`,
      confirmText: "Delete",
      danger: true,
    });
    if (!ok) return;
    setDeletingId(item._id);
    try {
      await deleteLabItem(item._id);
      toast("Item deleted.", "success");
      await refetch();
    } catch {
      toast("Failed to delete. Please try again.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 lg:py-12 px-2 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
            <Mic2 className="text-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-primary tracking-tight">Speaking Lab Builder</h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              Create endless, voice-only drills across 5 gamified archetypes.
            </p>
          </div>
        </div>
        <Button onClick={openCreate} variant="primary" className="h-12 px-6 rounded-2xl shrink-0">
          <Plus className="w-4 h-4 mr-2" /> New Activity
        </Button>
      </div>

      {/* Search */}
      <Input
        icon={<Search size={16} />}
        placeholder="Search activities…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
        </div>
      ) : isError ? (
        <Card variant="outline" className="text-center py-12 border-red-100 bg-red-50/30">
          <p className="text-sm font-bold text-red-500 mb-3">Failed to load Speaking Lab items.</p>
          <Button onClick={() => refetch()} variant="secondary" size="sm">Retry</Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card variant="outline" padding="xl" className="text-center border-dashed bg-slate-50/50">
          <div className="h-16 w-16 rounded-full bg-white shadow-xl flex items-center justify-center text-3xl mx-auto mb-4">🎙️</div>
          <p className="text-lg font-bold text-primary">No activities yet</p>
          <p className="text-sm text-slate-500 mt-1 mb-5">Create your first voice drill to power the endless lab.</p>
          <Button onClick={openCreate} variant="primary" size="sm" className="rounded-2xl">
            <Plus className="w-4 h-4 mr-2" /> New Activity
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <Card
              key={item._id}
              variant="elevated"
              className={cn(
                "rounded-[1.5rem] border-slate-50 shadow-md hover:shadow-lg transition-all group",
                item.isActive === false && "opacity-60"
              )}
            >
              <div className="flex items-start justify-between gap-4 p-5">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/5 text-[9px] font-black text-primary uppercase tracking-widest border border-primary/10">
                      {TYPE_LABEL[item.type] || item.type}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-[9px] font-black text-amber-600 uppercase tracking-widest border border-amber-100">
                      Lvl {item.difficulty} · {item.xp} XP
                    </span>
                    {item.isActive === false && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-700 truncate">{item.prompt}</p>
                  {item.tamilWord && (
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-primary">{item.tamilWord}</span>
                      <button
                        type="button"
                        onClick={() => speakTamil(item.tamilWord!)}
                        className="text-primary/50 hover:text-primary transition-colors"
                        aria-label="Hear word"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {item.sequence && item.sequence.length > 0 && (
                    <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                      <GripVertical className="h-3 w-3" /> {item.sequence.join(" → ")}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="h-9 w-9 rounded-xl bg-slate-50 hover:bg-primary/5 text-slate-500 hover:text-primary flex items-center justify-center transition-colors border border-slate-100"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    disabled={deletingId === item._id}
                    className="h-9 w-9 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-500 flex items-center justify-center transition-colors border border-slate-100 disabled:opacity-50"
                    aria-label="Delete"
                  >
                    {deletingId === item._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !isSubmitting && setModalOpen(false)}
        title={editingId ? "Edit Activity" : "New Speaking Lab Activity"}
        description="Voice-only drill configuration"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Archetype"
            options={TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as LabItemType }))}
          />
          <Input
            label="Difficulty (scales endless level)"
            type="number"
            min={1}
            value={form.difficulty}
            onChange={(e) => setForm((f) => ({ ...f, difficulty: Number(e.target.value) }))}
          />

          <Input
            label="Prompt / Instruction"
            placeholder="Say the word for 'water'…"
            value={form.prompt}
            error={errors.prompt}
            onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
            className="md:col-span-2"
          />

          <Input
            label="Tamil Target Word (TTS + grading)"
            placeholder="தண்ணீர்"
            value={form.tamilWord}
            error={errors.tamilWord}
            onChange={(e) => setForm((f) => ({ ...f, tamilWord: e.target.value }))}
          />
          <Input
            label="Expected Spoken Text (optional)"
            placeholder="Overrides target for grading"
            value={form.expectedAudioText}
            onChange={(e) => setForm((f) => ({ ...f, expectedAudioText: e.target.value }))}
          />

          <Input
            label="Phonetic Hint (optional)"
            placeholder="thaṇṇīr"
            value={form.phoneticHint}
            onChange={(e) => setForm((f) => ({ ...f, phoneticHint: e.target.value }))}
          />
          <Input
            label="Prompt Audio URL (roleplay, optional)"
            placeholder="https://…/prompt.mp3"
            value={form.audioUrl}
            onChange={(e) => setForm((f) => ({ ...f, audioUrl: e.target.value }))}
          />

          <Input
            label="Sequence — comma separated (drag board)"
            placeholder="நான், தமிழ், படிக்கிறேன்"
            value={form.sequence}
            error={errors.sequence}
            onChange={(e) => setForm((f) => ({ ...f, sequence: e.target.value }))}
            className="md:col-span-2"
          />

          <Input
            label="XP Reward"
            type="number"
            min={1}
            value={form.xp}
            onChange={(e) => setForm((f) => ({ ...f, xp: Number(e.target.value) }))}
          />
          <Input
            label="Order (within difficulty)"
            type="number"
            value={form.order}
            onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
          />

          <label className="md:col-span-2 flex items-center gap-3 cursor-pointer select-none px-1">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-5 w-5 rounded-md accent-[var(--color-primary,#2563eb)]"
            />
            <span className="text-sm font-bold text-slate-600">Active (visible to students)</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
          <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={isSubmitting} className="rounded-2xl">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting} className="rounded-2xl min-w-[140px]">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </span>
            ) : editingId ? (
              "Update Activity"
            ) : (
              "Create Activity"
            )}
          </Button>
        </div>
      </Modal>

      {ConfirmDialog}
    </div>
  );
}
