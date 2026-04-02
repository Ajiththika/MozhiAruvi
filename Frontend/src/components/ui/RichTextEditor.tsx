"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";

// ── Toolbar Button ──────────────────────────────────────────────────────────

function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition-all",
        active
          ? "bg-primary text-white shadow-md shadow-primary/20"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="h-6 w-px bg-slate-200 mx-1" />;
}

// ── RichTextEditor Component ────────────────────────────────────────────────

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Placeholder.configure({
        placeholder: placeholder || "Start sharing your linguistic journey...",
      }),
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor px-1 text-xl md:text-2xl tracking-tight leading-[1.8] font-medium text-slate-700",
      },
    },
  });

  // Sync content when value changes from outside (e.g., loaded from API)
  React.useEffect(() => {
    if (editor && value && editor.isEmpty) {
      const currentContent = editor.getHTML();
      // Only set if different to avoid loop if editor isn't empty but is different
      // but TipTap's editor.isEmpty is safer for initial load
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!isMounted || !editor) {
    return <div className="min-h-[500px] border border-border rounded-2xl bg-white animate-pulse" />;
  }

  const currentHeading = editor.isActive("heading", { level: 1 })
    ? 1
    : editor.isActive("heading", { level: 2 })
    ? 2
    : editor.isActive("heading", { level: 3 })
    ? 3
    : null;

  return (
    <div className="flex flex-col gap-0">
      {/* ── Toolbar ── */}
      <div className="sticky top-[5.5rem] z-30 flex items-center gap-1 flex-wrap bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/30 px-4 py-2.5 mb-8">
        <ToolbarBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <span className="font-black text-base">B</span>
        </ToolbarBtn>
        <ToolbarBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <span className="italic font-bold text-base">I</span>
        </ToolbarBtn>
        <ToolbarBtn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <span className="underline font-bold text-base">U</span>
        </ToolbarBtn>
        <ToolbarBtn title="Strike" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <span className="line-through font-bold text-base">S</span>
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn title="H1" active={currentHeading === 1} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <span className="text-[11px] font-black uppercase">H1</span>
        </ToolbarBtn>
        <ToolbarBtn title="H2" active={currentHeading === 2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <span className="text-[11px] font-black uppercase">H2</span>
        </ToolbarBtn>
        <ToolbarBtn title="H3" active={currentHeading === 3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <span className="text-[11px] font-black uppercase">H3</span>
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn title="Bullets" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
        </ToolbarBtn>
        <ToolbarBtn title="Numbers" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor text-slate-500"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zM15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
        </ToolbarBtn>

        <div className="ml-auto pl-4 border-l border-slate-100 flex items-center gap-4">
          <button type="button" onClick={() => editor.chain().focus().undo().run()} className="p-1 hover:text-primary transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/></svg>
          </button>
          <button type="button" onClick={() => editor.chain().focus().redo().run()} className="p-1 hover:text-primary transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13"/></svg>
          </button>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest hidden sm:inline">
            {editor.getText().trim() ? editor.getText().trim().split(/\s+/).length : 0} words
          </span>
        </div>
      </div>

      {/* ── Content Area ── */}
      <EditorContent editor={editor} />
    </div>
  );
}



