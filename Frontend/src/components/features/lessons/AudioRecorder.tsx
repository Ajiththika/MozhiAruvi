"use client";

import React, { useRef, useState } from "react";
import { Mic, CheckCircle2, Loader2 } from "lucide-react";
import { evaluateSpeaking } from "@/services/lessonService";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface AudioRecorderProps {
  lessonId: string;
  questionId: string;
  expectedAudioText?: string;
  audioUrl?: string;
  isCorrect: boolean;
  takeCredit: () => Promise<boolean>;
  onResult: (passed: boolean, message: string) => void;
  backendMessage?: string;
}

export function AudioRecorder({
  lessonId,
  questionId,
  isCorrect,
  takeCredit,
  onResult,
  backendMessage,
  audioUrl
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorderRef.current?.mimeType || "audio/webm" });
        await processAudio(blob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Audio Access Error:", err);
      alert("Please allow mic access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    const hasCredit = await takeCredit();
    if (!hasCredit) return;

    setIsProcessingAudio(true);
    try {
      const base64data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      
      const res = await evaluateSpeaking(lessonId, questionId, base64data);
      onResult(res.isCorrect, res.feedback);
    } catch (e) {
      console.error(e);
      onResult(false, "Recognition failed. Try again.");
    } finally {
      setIsProcessingAudio(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-2xl pt-10">
       <div className="relative flex flex-col items-center">
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={isProcessingAudio || isCorrect}
            className={cn(
              "relative h-40 w-40 rounded-full flex items-center justify-center border-8 transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.1)]",
              isRecording ? "bg-red-500 text-white border-red-500/20 scale-125 animate-pulse" :
              isProcessingAudio ? "bg-primary/10 text-primary border-primary/20 animate-spin" :
              isCorrect ? "bg-emerald-500 text-white border-emerald-200 cursor-default" :
              "bg-white border-slate-100 text-primary/60 hover:border-primary/40 hover:text-primary active:scale-95"
            )}
          >
             {isProcessingAudio ? <Loader2 className="h-14 w-14 animate-spin" /> :
              isRecording ? <Mic className="h-14 w-14" /> :
              isCorrect ? <CheckCircle2 className="h-14 w-14" /> :
              <Mic className="h-14 w-14 group-hover:scale-110 transition-transform" />}
             
             {isRecording && (
                <div className="absolute -inset-8 h-56 w-56 rounded-full border-2 border-red-500/30 animate-ping pointer-events-none" />
             )}
          </button>
          
          <div className="mt-8 text-center bg-slate-50 px-8 py-3 rounded-full border border-slate-100 shadow-sm">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 select-none">
               {isRecording ? "Transcribing Pulse..." : isProcessingAudio ? "Analyzing Frequency..." : "Press and Hold to Speak"}
             </span>
          </div>
       </div>

       {backendMessage && (
         <Card variant="outline" className={cn(
           "w-full text-center border-2 animate-in slide-in-from-top-4",
           isCorrect ? "border-emerald-100 bg-emerald-50/30 font-bold" : "border-red-100 bg-red-50/10"
         )}>
            <p className={cn(
              "text-lg leading-relaxed",
              isCorrect ? "text-emerald-700" : "text-red-500"
            )}>
              "{backendMessage}"
            </p>
         </Card>
       )}
    </div>
  );
}




export default AudioRecorder;













