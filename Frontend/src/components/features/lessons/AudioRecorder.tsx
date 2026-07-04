"use client";

import React, { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { Mic, CheckCircle2, Loader2, Volume2, Languages } from "lucide-react";
import { evaluateSpeaking, SpeakingStatus, SpeakingResult } from "@/services/lessonService";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { getMascotFeedback, MascotState, stripEmoji } from "@/lib/tamilFeedback";
import { speakTamil, stopSpeaking } from "@/lib/speak";
import {
  requestMicStream,
  createRecorder,
  blobFromRecorder,
  blobToDataUrl,
} from "@/lib/audioCapture";
import { TamilSpeechSession, MIN_RECORD_MS, MAX_RECORD_MS, MIN_AUDIO_BYTES } from "@/lib/webSpeechStt";
import { buildSpeakingPayload } from "@/lib/speakingPayload";

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
  const [showEnglish, setShowEnglish] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const pointerActiveRef = useRef(false);
  const recordStartRef = useRef(0);
  const maxRecordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechSessionRef = useRef<TamilSpeechSession | null>(null);
  const { toast } = useToast();

  const clearMaxTimer = useCallback(() => {
    if (maxRecordTimerRef.current) {
      clearTimeout(maxRecordTimerRef.current);
      maxRecordTimerRef.current = null;
    }
  }, []);

  const processAudio = useCallback(async (audioBlob: Blob, clientTranscript: string) => {
    if ((!audioBlob || audioBlob.size < MIN_AUDIO_BYTES) && !clientTranscript.trim()) {
      toast("Hold the mic and speak a little longer. 🎤", "info");
      return;
    }

    const hasCredit = await takeCredit();
    if (!hasCredit) return;

    setIsProcessingAudio(true);
    setLastResult(null);
    try {
      const payload = await buildSpeakingPayload(audioBlob, blobToDataUrl, clientTranscript);
      const res = await evaluateSpeaking(lessonId, questionId, payload);
      setShowEnglish(false);
      setLastResult(res);
      onResult(res.isCorrect && res.status === "perfect", res.feedback, res.status);
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Recognition failed. Please speak clearly and try again.";
      setLastResult(null);
      if (status === 413) {
        toast("Recording was too large — hold the mic for 1–2 seconds only.", "error");
      } else {
        toast(msg, "info");
      }
      onResult(false, msg, "retry");
    } finally {
      setIsProcessingAudio(false);
    }
  }, [takeCredit, lessonId, questionId, onResult, toast]);

  const stopRecording = useCallback(() => {
    clearMaxTimer();
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    setIsRecording(false);
    const elapsed = Date.now() - recordStartRef.current;
    const wait = Math.max(0, MIN_RECORD_MS - elapsed);
    setTimeout(() => {
      if (recorder.state === "recording") recorder.stop();
    }, wait);
  }, [clearMaxTimer]);

  const startRecording = useCallback(async () => {
    if (pointerActiveRef.current && mediaRecorderRef.current?.state === "recording") return;
    stopSpeaking();
    setLastResult(null);
    try {
      const stream = await requestMicStream();
      const recorder = createRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recordStartRef.current = Date.now();
      speechSessionRef.current = new TamilSpeechSession();
      speechSessionRef.current.start();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        clearMaxTimer();
        const blob = blobFromRecorder(recorder, chunksRef.current);
        stream.getTracks().forEach((track) => track.stop());
        const clientTranscript = (await speechSessionRef.current?.stop()) || "";
        speechSessionRef.current = null;
        await processAudio(blob, clientTranscript);
      };

      recorder.start(250);
      setIsRecording(true);
      maxRecordTimerRef.current = setTimeout(() => stopRecording(), MAX_RECORD_MS);
    } catch (err) {
      console.error("Audio Access Error:", err);
      toast("Microphone access is blocked. Please allow mic access in your browser.", "error");
    }
  }, [processAudio, stopRecording, clearMaxTimer, toast]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.pointerType === "touch") e.preventDefault();
      if (pointerActiveRef.current) return;
      pointerActiveRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      void startRecording();
    },
    [startRecording]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!pointerActiveRef.current) return;
      pointerActiveRef.current = false;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      stopRecording();
    },
    [stopRecording]
  );

  // ── Mascot / mic state machine ──────────────────────────────────────────────
  const mascotState: MascotState = useMemo(() => {
    if (isRecording) return "listening";
    if (isProcessingAudio) return "processing";
    if (isCorrect || lastResult?.status === "perfect") return "success";
    if (lastResult) return "mispronounced";
    return "idle";
  }, [isRecording, isProcessingAudio, isCorrect, lastResult]);

  const mascot = useMemo(
    () => getMascotFeedback(mascotState, lastResult?.status, lastResult?.transcription),
    [mascotState, lastResult]
  );

  // Speak the witty Tamil line aloud once when feedback appears.
  const spokenRef = useRef<string | null>(null);
  useEffect(() => {
    if (mascotState === "success" && lastResult?.status === "perfect") {
      const key = `ok-${lastResult.correctText}`;
      if (spokenRef.current !== key) {
        spokenRef.current = key;
        speakTamil(lastResult.correctText || stripEmoji(mascot.message));
      }
    } else if (mascotState === "mispronounced" && lastResult?.correctText) {
      const key = `retry-${lastResult.correctText}-${lastResult.transcription}`;
      if (spokenRef.current !== key) {
        spokenRef.current = key;
        speakTamil(lastResult.correctText);
      }
    } else if (mascotState === "idle" || mascotState === "listening") {
      spokenRef.current = null;
    }
  }, [mascotState, mascot.message, lastResult]);

  useEffect(() => () => clearMaxTimer(), [clearMaxTimer]);

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-2xl pt-10">
      <div className="relative flex flex-col items-center">
        <button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: "none" }}
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
      {(mascotState === "success" || mascotState === "mispronounced") && lastResult && (
        <Card
          variant="outline"
          onMouseEnter={() => setShowEnglish(true)}
          onMouseLeave={() => setShowEnglish(false)}
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
              {lastResult.status === "perfect" ? mascot.message : lastResult.feedback}
            </p>
            {showEnglish && mascotState === "success" && (
              <p className="text-sm font-semibold text-slate-500 italic animate-in fade-in duration-200">
                {mascot.english}
              </p>
            )}
            {mascotState === "mispronounced" && (
              <div className="mt-3 space-y-1 text-sm font-semibold text-slate-600">
                {lastResult.correctText && (
                  <p>சரியான வார்த்தை: <span className="text-primary font-black">{lastResult.correctText}</span></p>
                )}
                {lastResult.transcription ? (
                  <p>நீங்க சொன்னது: “{lastResult.transcription}”</p>
                ) : (
                  <p>உங்கள் குரல் தெளிவாக கேட்கவில்லை — மீண்டும் முயற்சிக்கவும்.</p>
                )}
              </div>
            )}
            <div className="mt-2 flex items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  speakTamil(
                    lastResult.status === "perfect"
                      ? stripEmoji(mascot.message)
                      : lastResult.correctText || stripEmoji(mascot.message)
                  )
                }
                className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary/70 hover:text-primary transition-colors"
              >
                <Volume2 size={14} /> Replay
              </button>
              {mascotState === "success" && (
                <button
                  type="button"
                  onClick={() => setShowEnglish((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                >
                  <Languages size={14} /> {showEnglish ? "தமிழ்" : "English"}
                </button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default AudioRecorder;
