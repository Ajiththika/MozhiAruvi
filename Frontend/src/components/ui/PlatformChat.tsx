"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

// ── Mozhi Aruvi Official AI Assistant ───────────────────────────────────────
// Theme: Vibrant Indigo | Soft Shadows | Glassmorphism Architecture
// Features: Gemini AI | Voice Input (STT) 
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
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Handle Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ta-IN'; // Default to Tamil for MozhiAruvi

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setMessage(prev => prev + (prev ? " " : "") + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === 'not-allowed') {
          setChatHistory(prev => [...prev, { role: 'assistant', content: "I can't hear you! Please allow microphone access in your browser settings to use voice input." }]);
        } else if (event.error === 'network') {
          setChatHistory(prev => [...prev, { role: 'assistant', content: "My ears are a bit plugged! Check your internet connection for voice input." }]);
        }
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
        console.warn("Speech API not supported in this browser.");
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: "Your browser doesn't support my voice listening feature. Please try using Chrome or Edge!" }]);
        return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Mic start failed:", err);
        setIsListening(false);
      }
    }
  };

  const handleSend = useCallback(async (textToOverride?: string) => {
    const textToSend = textToOverride || message;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: textToSend };
    setChatHistory(prev => [...prev, userMsg]);
    setLoading(true);
    setMessage("");
    if (isListening) recognitionRef.current?.stop();

    try {
        const { data } = await api.post('/ai/chat', {
            message: userMsg.content,
            chatHistory: chatHistory.slice(-5) 
        }, { 
            timeout: 35000 // 35 second timeout for Gemini
        });

        if (data.success) {
            setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
        } else {
            throw new Error("Linguistic ripple detected.");
        }
    } catch (error) {
        console.error("Linguistic failure:", error);
        setChatHistory(prev => [...prev, { role: 'assistant', content: "Our linguistic river is currently experiencing a block. Please try again in a moment." }]);
    } finally {
        setLoading(false);
    }
  }, [message, loading, chatHistory, isListening]);

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
          "absolute bottom-0 right-0 w-[92vw] sm:w-[400px] bg-white border border-slate-100 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-700 origin-bottom-right flex flex-col z-[10000]",
          isOpen ? "opacity-100 scale-100 translate-y-0 translate-x-0" : "opacity-0 scale-50 translate-y-20 translate-x-10 pointer-events-none"
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
                    <p className="text-white/60 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">Official AI Tutor</p>
                </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Message Canvas */}
        <div ref={scrollRef} className="h-[430px] overflow-y-auto p-6 space-y-4 bg-slate-50/50 backdrop-blur-sm scroll-smooth">
            {chatHistory.length === 1 && (
                <div className="flex flex-col items-center justify-center py-4 text-center space-y-2 opacity-50">
                    <div className="p-3 rounded-full bg-white shadow-sm">
                        <Sparkles size={24} className="text-primary/20" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Powered by Gemini 1.5</p>
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
            <div className="relative flex flex-col gap-3">
                {isListening && (
                    <div className="flex items-center gap-2 text-primary animate-pulse py-1">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Listening carefully...</span>
                    </div>
                )}
                <div className="relative flex items-center gap-2">
                    <input 
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask anything about Tamil..."
                        className="w-full bg-slate-50 border-none rounded-2xl pl-6 pr-12 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 placeholder:text-slate-300 transition-all text-slate-700"
                    />
                    
                    <div className="absolute right-2 flex items-center gap-1">
                        <button 
                            onClick={toggleListening}
                            type="button"
                            className={cn(
                                "p-2.5 rounded-xl transition-all duration-500 active:scale-95 relative overflow-hidden",
                                isListening 
                                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" 
                                  : "bg-slate-100 text-slate-400 hover:text-primary hover:bg-primary/5"
                            )}
                            title={isListening ? "Stop listening" : "Voice input"}
                        >
                            {isListening && (
                                <span className="absolute inset-0 bg-white/20 animate-ping rounded-full" />
                            )}
                            <Mic size={18} className={cn(isListening && "animate-pulse")} />
                        </button>
                        
                        <button 
                           onClick={() => handleSend()}
                           disabled={!message.trim() || loading}
                           className="p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 disabled:grayscale transition-all disabled:opacity-50"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
