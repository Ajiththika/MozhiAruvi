"use client";

import React, { useRef, useState, useCallback, useMemo } from "react";
import { Mic, CheckCircle2, Loader2, Volume2 } from "lucide-react";
import { evaluateSpeaking, SpeakingStatus, SpeakingResult } from "@/services/lessonService";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { getMascotFeedback, MascotState } from "@/lib/tamilFeedback";

interface AudioRecorderProps {
  lessonId: string;
  questionId: string;
  expectedAudioText?: string;
  audioUrl?: string;
  isCorrect: boolean;
  takeCredit: () => Promise<boolean>;
  onResult: (passed: boolean, message: string, status?: SpeakingStatus) => void;
  backendMessage?: string;
}

export function AudioRecorder({
  lessonId,
  questionId,
  isCorrect,
  takeCredit,
  onResult,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [lastResult, setLastResult] = useState<SpeakingResult | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const { toast } = useToast();

  // Play an optional local mascot audio clip; silently ignore if the asset is absent.
  const playClip = useCallback((src?: string) => {
    if (!src) return;
    try {
      const audio = new Audio(src);
      audio.play().catch(() => {});
    } catch { /* asset missing — ignore */ }
  }, []);

  const processAudio = useCallback(async (audioBlob: Blob) => {
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
      setLastResult(res);

      // Multi-tier, mic-forgiving feedback:
      //  perfect → pass · close → pass with an encouraging nudge · retry → stay & try again
      if (res.status === "perfect") {
        playClip("/audio/mascot/success-1.mp3");
      } else if (res.status === "close") {
        toast("Good effort, almost perfect! Keep going. 👍", "info");
        playClip("/audio/mascot/close-1.mp3");
      } else {
        toast("Almost there — listen again and try speaking once more.", "info");
        playClip("/audio/mascot/oops-1.mp3");
      }
      onResult(res.isCorrect, res.feedback, res.status);
    } catch (e: any) {
      console.error(e);
      const msg = e.response?.data?.message || "Recognition failed. Please speak clearly and try again.";
      setLastResult(null);
      toast("Couldn't hear that clearly — please try speaking again.", "info");
      onResult(false, msg, "retry");
    } finally {
      setIsProcessingAudio(false);
    }
  }, [takeCredit, lessonId, questionId, onResult, toast, playClip]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 48000 },
      });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorderRef.current?.mimeType || "audio/webm;codecs=opus" });
        await processAudio(blob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Audio Access Error:", err);
      toast("Microphone access is blocked. Please allow mic access in your browser.", "error");
    }
  }, [processAudio, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      // Ensure we have at least 500ms of audio to prevent encoding errors
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        }
      }, 500);
    }
  }, [isRecording]);

  // ── Mascot / mic state machine ──────────────────────────────────────────────
  const mascotState: MascotState = useMemo(() => {
    if (isRecording) return "listening";
    if (isProcessingAudio) return "processing";
    if (isCorrect || lastResult?.isCorrect) return "success";
    if (lastResult && !lastResult.isCorrect) return "mispronounced";
    return "idle";
  }, [isRecording, isProcessingAudio, isCorrect, lastResult]);

  const mascot = useMemo(
    () => getMascotFeedback(mascotState, lastResult?.status, lastResult?.transcription),
    [mascotState, lastResult]
  );

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-2xl pt-10">
      <div className="relative flex flex-col items-center">
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          disabled={isProcessingAudio || isCorrect}
          aria-label="Press and hold to speak"
          className={cn(
            "relative h-40 w-40 rounded-full flex items-center justify-center border-8 transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.1)]",
            isRecording ? "bg-red-500 text-white border-red-500/20 scale-125" :
            isProcessingAudio ? "bg-primary/10 text-primary border-primary/20" :
            mascotState === "success" ? "bg-emerald-500 text-white border-emerald-200 cursor-default" :
            mascotState === "mispronounced" ? "bg-white border-amber-200 text-amber-500 hover:border-amber-400 active:scale-95" :
            "bg-white border-slate-100 text-primary/60 hover:border-primary/40 hover:text-primary active:scale-95"
          )}
        >
          {isProcessingAudio ? <Loader2 className="h-14 w-14 animate-spin" /> :
            mascotState === "success" ? <CheckCircle2 className="h-14 w-14" /> :
            <Mic className="h-14 w-14 transition-transform" />}

          {/* Listening wave indicator */}
          {isRecording && (
            <>
              <span className="absolute -inset-8 h-56 w-56 rounded-full border-2 border-red-500/30 animate-ping pointer-events-none" />
              <span className="absolute -bottom-12 flex items-end gap-1 h-8" aria-hidden>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 rounded-full bg-red-500/70 animate-pulse"
                    style={{ height: `${8 + ((i % 3) + 1) * 6}px`, animationDelay: `${i * 90}ms` }}
                  />
                ))}
              </span>
            </>
          )}
        </button>

        <div className="mt-8 text-center bg-slate-50 px-8 py-3 rounded-full border border-slate-100 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 select-none">
            {isRecording ? "Listening…" : isProcessingAudio ? "Analyzing pronunciation…" : "Press and Hold to Speak"}
          </span>
        </div>
      </div>

      {/* Mascot feedback bubble — witty regional Tamil reactions */}
      {(mascotState === "success" || mascotState === "mispronounced") && (
        <Card
          variant="outline"
          className={cn(
            "w-full text-center border-2 animate-in slide-in-from-bottom-4 zoom-in-95 duration-300",
            mascot.tone === "positive" ? "border-emerald-100 bg-emerald-50/40" : "border-amber-100 bg-amber-50/40"
          )}
        >
          <div className="flex flex-col items-center gap-2 py-1">
            <span className="text-4xl" aria-hidden>{mascot.emoji}</span>
            <p className={cn(
              "text-lg font-bold leading-relaxed",
              mascot.tone === "positive" ? "text-emerald-700" : "text-amber-700"
            )}>
              {mascot.message}
            </p>
            {mascotState === "mispronounced" && lastResult?.transcription && (
              <p className="text-xs font-semibold text-slate-400">
                நீங்க சொன்னது: “{lastResult.transcription}”
              </p>
            )}
            {mascot.audioClip && (
              <button
                type="button"
                onClick={() => playClip(mascot.audioClip)}
                className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary/70 hover:text-primary transition-colors"
              >
                <Volume2 size={14} /> Replay
              </button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

export default AudioRecorder;
