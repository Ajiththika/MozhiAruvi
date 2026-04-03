"use client";

import React from "react";
import { type Editor, useEditor, EditorContent } from "@tiptap/react";
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
        e.preventDefault(); // Stay in editor!
        onClick();
      }}
      title={title}
      className={cn(
        "group flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all duration-200",
        active
          ? "bg-primary text-white shadow-xl shadow-primary/20 scale-100"
          : "text-slate-400 hover:bg-slate-50 hover:text-primary hover:scale-105"
      )}
    >
      <div className={cn("transition-transform", active ? "scale-110" : "group-hover:scale-110")}>
        {children}
      </div>
    </button>
  );
}

function DividerVertical() {
  return <div className="w-10 h-px bg-slate-100 my-2" />;
}

// ── Standalone Toolbar ──────────────────────────────────────────────────────

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  // ── Reactive Sync Logic ──────────────────────────────────────────────────
  // We need to force a re-render in the toolbar whenever the editor state changes
  // because TipTap's internal state mutations don't always trigger React re-renders
  // in modular child components receiving 'editor' as a prop.
  const [_, setUpdateTrigger] = React.useState(0);

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      setUpdateTrigger((prev) => prev + 1);
    };

    editor.on("transaction", handleUpdate);
    return () => {
      editor.off("transaction", handleUpdate);
    };
  }, [editor]);

  if (!editor) return null;

  // TipTap logic for current heading level
  const currentHeading = editor.isActive("heading", { level: 1 })
    ? 1
    : editor.isActive("heading", { level: 2 })
    ? 2
    : editor.isActive("heading", { level: 3 })
    ? 3
    : null;

  return (
    <div className="fixed left-0 top-20 z-40 flex flex-col items-center gap-1.5 bg-white border-r border-slate-100 rounded-r-[2.5rem] shadow-[20px_0_40px_rgba(0,0,0,0.02)] px-3 py-10 transition-all h-[calc(100vh-80px)] w-20">
      <div className="w-10 h-1 bg-slate-100 rounded-full mb-6" />
      
      {/* Basic Formatting Group */}
      <ToolbarBtn 
        title="Bold" 
        active={editor.isActive("bold")} 
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <span className="font-black text-base">B</span>
      </ToolbarBtn>
      <ToolbarBtn 
        title="Italic" 
        active={editor.isActive("italic")} 
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="italic font-bold text-base">I</span>
      </ToolbarBtn>
      <ToolbarBtn 
        title="Underline" 
        active={editor.isActive("underline")} 
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <span className="underline font-bold text-base underline-offset-2">U</span>
      </ToolbarBtn>
      <ToolbarBtn 
        title="Strike" 
        active={editor.isActive("strike")} 
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <span className="line-through font-bold text-base">S</span>
      </ToolbarBtn>

      <DividerVertical />

      {/* Headings Group */}
      <ToolbarBtn 
        title="H1" 
        active={currentHeading === 1} 
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <span className="text-[11px] font-black uppercase tracking-tighter">H1</span>
      </ToolbarBtn>
      <ToolbarBtn 
        title="H2" 
        active={currentHeading === 2} 
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <span className="text-[11px] font-black uppercase tracking-tighter">H2</span>
      </ToolbarBtn>
      <ToolbarBtn 
        title="H3" 
        active={currentHeading === 3} 
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <span className="text-[11px] font-black uppercase tracking-tighter">H3</span>
      </ToolbarBtn>

      <DividerVertical />

      {/* Lists Group */}
      <ToolbarBtn 
        title="Bullets" 
        active={editor.isActive("bulletList")} 
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
      </ToolbarBtn>
      <ToolbarBtn 
        title="Numbers" 
        active={editor.isActive("orderedList")} 
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
      </ToolbarBtn>

      <DividerVertical />

      {/* Quote */}
      <ToolbarBtn 
        title="Quote" 
        active={editor.isActive("blockquote")} 
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zM15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
      </ToolbarBtn>

      <div className="grow" />

      {/* History Group */}
      <div className="w-full pt-8 border-t border-slate-50 flex flex-col items-center gap-6">
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className="p-2 text-slate-300 hover:text-primary transition-all hover:scale-110">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/></svg>
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className="p-2 text-slate-300 hover:text-primary transition-all hover:scale-110">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13"/></svg>
        </button>
      </div>
    </div>
  );
}

// ── Custom Hook for Editor Logic ──────────────────────────────────────────

export function useMozhiEditor({ value, onChange, placeholder, className }: {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
}) {
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
                class: cn("tiptap-editor px-1 text-xl md:text-2xl tracking-tight leading-[1.8] font-medium text-slate-700 outline-none", className),
            },
        },
    });

    React.useEffect(() => {
        if (editor && value && editor.isEmpty) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    return editor;
}

// ── Legacy Component (for compatibility or simple use) ──────────────────────

export function RichTextEditor({ value, onChange, placeholder, className }: any) {
    const [isMounted, setIsMounted] = React.useState(false);
    React.useEffect(() => { setIsMounted(true); }, []);

    const editor = useMozhiEditor({ value, onChange, placeholder, className });

    if (!isMounted || !editor) {
        return <div className="min-h-[500px] border border-border rounded-2xl bg-white animate-pulse" />;
    }

    return (
        <div className="flex flex-col gap-10">
            <EditorToolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}

export default RichTextEditor;
