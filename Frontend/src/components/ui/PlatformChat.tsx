"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

// ── Mozhi Aruvi Official AI Assistant ───────────────────────────────────────
// Theme: Vibrant Indigo | Soft Shadows | Glassmorphism Architecture
// ─────────────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function PlatformChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([
    { role: 'assistant', content: "Vanakkam! I am MozhiAruvi, your dedicated guide to the Tamil language and heritage. How can I assist your linguistic journey today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: message };
    setChatHistory(prev => [...prev, userMsg]);
    setLoading(true);
    setMessage("");

    try {
        const { data } = await api.post('/ai/chat', {
            message: userMsg.content,
            chatHistory: chatHistory.slice(-5) // Send last 5 for context
        }, { 
            timeout: 30000 // 30 second timeout
        });

        setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
        console.error("Linguistic failure:", error);
        setChatHistory(prev => [...prev, { role: 'assistant', content: "Our linguistic river is currently experiencing a drought. Please try again in a moment." }]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[9999] font-sans">
      {/* Floating Entry Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
            "h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30 transition-all duration-500 hover:scale-110 active:scale-95 group",
            isOpen ? "rotate-90 scale-0" : "rotate-0 scale-100"
        )}
      >
        <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
      </button>

      {/* Cinematic Chat Panel */}
      <div className={cn(
          "absolute bottom-0 right-0 w-[400px] bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-700 origin-bottom-right flex flex-col",
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-50 translate-y-20 pointer-events-none"
      )}>
        {/* Header - Industrial Polish */}
        <div className="bg-primary p-7 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                    <Sparkles size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="text-white font-black tracking-tighter text-lg leading-none">
                        Mozhi<span className="text-secondary-foreground/80 opacity-90">Aruvi</span>
                    </h3>
                    <p className="text-white/60 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">Linguistic Guide</p>
                </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Message Canvas */}
        <div ref={scrollRef} className="h-[450px] overflow-y-auto p-6 space-y-4 bg-slate-50/50 backdrop-blur-sm scroll-smooth">
            {chatHistory.length === 1 && (
                <div className="flex flex-col items-center justify-center py-4 text-center space-y-2 opacity-50">
                    <div className="p-3 rounded-full bg-white shadow-sm">
                        <Sparkles size={24} className="text-primary/20" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Powered by MozhiAruvi AI</p>
                </div>
            )}
            
            {chatHistory.map((m, i) => (
                <div key={i} className={cn(
                    "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-500",
                    m.role === 'user' ? "ml-auto items-end" : "items-start"
                )}>
                    <div className={cn(
                        "p-4 text-sm leading-relaxed",
                        m.role === 'user' 
                          ? "bg-primary text-white rounded-t-[1.5rem] rounded-bl-[1.5rem] shadow-xl shadow-primary/10" 
                          : "bg-white text-slate-700 rounded-t-[1.5rem] rounded-br-[1.5rem] shadow-sm border border-slate-100"
                    )}>
                        {m.content}
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest mt-1 px-1">
                        {m.role === 'user' ? 'Linguistic Traveler' : 'MozhiAruvi'}
                    </span>
                </div>
            ))}
            
            {loading && (
                <div className="flex items-center gap-2 text-slate-400 p-2 animate-pulse">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest">MozhiAruvi is thinking...</span>
                </div>
            )}
        </div>

        {/* Input Pier */}
        <div className="p-6 bg-white border-t border-slate-50">
            <div className="relative flex items-center">
                <input 
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask MozhiAruvi anything about Tamil..."
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 placeholder:text-slate-300 transition-all text-slate-700"
                />
                <button 
                   onClick={handleSend}
                   disabled={!message.trim() || loading}
                   className="absolute right-2 p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:grayscale transition-all"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
