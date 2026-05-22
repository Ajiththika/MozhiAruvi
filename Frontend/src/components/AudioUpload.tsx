"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, X, Loader2, Upload, Play, Pause } from "lucide-react";
import { api } from "@/lib/api";

interface AudioUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export function AudioUpload({ value, onChange, label = "Upload Audio" }: AudioUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [playing, setPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setPreviewUrl(value || null);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Audio file must be less than 10MB.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("audio", file);

    try {
      const res = await api.post<{ url: string }>("/upload/audio", formData);
      onChange(res.data.url);
      setPreviewUrl(res.data.url);
    } catch {
      alert("Failed to upload audio. Please try again.");
      setPreviewUrl(value || null);
    } finally {
      setUploading(false);
    }
  };

  const togglePlay = () => {
    if (!previewUrl) return;
    if (playing && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }
    const audio = new Audio(previewUrl);
    audioRef.current = audio;
    audio.onended = () => setPlaying(false);
    audio.onerror = () => setPlaying(false);
    audio.play();
    setPlaying(true);
  };

  const handleRemove = () => {
    onChange("");
    setPreviewUrl(null);
    setPlaying(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-black uppercase tracking-widest text-primary/60 ml-1">
        {label}
      </label>

      <div className="relative">
        {previewUrl ? (
          <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border-2 border-slate-100">
            <button
              type="button"
              onClick={togglePlay}
              className="h-12 w-12 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg hover:scale-105 transition-all"
            >
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <p className="text-xs font-bold text-slate-500 flex-1 truncate">Audio ready</p>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-primary hover:bg-primary/5 rounded-lg">
              <Upload className="w-4 h-4" />
            </button>
            <button type="button" onClick={handleRemove} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full py-8 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-2"
          >
            <Mic className="w-6 h-6 text-primary/40" />
            <p className="text-xs font-bold text-slate-500">Click to upload pronunciation</p>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">MP3, WAV, WebM</p>
          </button>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Uploading...</span>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="audio/mpeg,audio/wav,audio/ogg,audio/webm,audio/*"
          className="hidden"
        />
      </div>
    </div>
  );
}
