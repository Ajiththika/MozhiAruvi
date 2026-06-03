"use client";

import React, { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { Mic, CheckCircle2, Loader2, Volume2, Languages } from "lucide-react";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { getMascotFeedback, MascotState, stripEmoji } from "@/lib/tamilFeedback";
import { speakTamil } from "@/lib/speak";
import { evaluateLabSpeaking, LabEvaluation, SpeakingLabItem } from "@/services/speakingLabService";

interface LabAudioRecorderProps {
  item: SpeakingLabItem;
  locked?: boolean;
  onResult: (evaluation: LabEvaluation) => void;
}

/**
 * Vocal-only recorder for the Speaking Lab. Reuses the shared Tamil mascot
 * feedback engine and the press-and-hold mic state machine, but grades against
 * the lab endpoint and surfaces XP/level-up via onResult.
 *
 * Kept separate from the lesson AudioRecorder so legacy lesson flows are untouched.
 */
export function LabAudioRecorder({ item, locked = false, onResult }: LabAudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<LabEvaluation | null>(null);
  const [showEnglish, setShowEnglish] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const { toast } = useToast();

  const processAudio = useCallback(
    async (audioBlob: Blob) => {
      setIsProcessing(true);
      try {
        const base64data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
        });

        const res = await evaluateLabSpeaking(item._id, base64data);
        setShowEnglish(false);
        setLastResult(res);

        if (res.status === "close") {
          toast("Good effort, almost perfect! 👍", "info");
        }
        onResult(res);
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Recognition failed. Please speak clearly and try again.";
        setLastResult(null);
        toast("Couldn't hear that clearly — please try speaking again.", "info");
        // eslint-disable-next-line no-console
        console.error(msg);
      } finally {
        setIsProcessing(false);
      }
    },
    [item._id, onResult, toast]
  );

  const startRecording = useCallback(async () => {
    if (locked) return;
    // Error boundary around Speech/mic availability.
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      toast("Your browser doesn't support microphone capture.", "error");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 48000 },
      });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorderRef.current?.mimeType || "audio/webm;codecs=opus",
        });
        await processAudio(blob);
      };
      recorder.start();
      setIsRecording(true);
    } catch {
      toast("Microphone access is blocked. Please allow mic access in your browser.", "error");
    }
  }, [locked, processAudio, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
        }
      }, 500);
    }
  }, [isRecording]);

  const mascotState: MascotState = useMemo(() => {
    if (isRecording) return "listening";
    if (isProcessing) return "processing";
    if (locked || lastResult?.isCorrect) return "success";
    if (lastResult && !lastResult.isCorrect) return "mispronounced";
    return "idle";
  }, [isRecording, isProcessing, locked, lastResult]);

  const mascot = useMemo(
    () => getMascotFeedback(mascotState, lastResult?.status, lastResult?.transcription),
    [mascotState, lastResult]
  );

  // Speak the witty Tamil line aloud once when feedback appears.
  const spokenRef = useRef<string | null>(null);
  useEffect(() => {
    if ((mascotState === "success" || mascotState === "mispronounced") && mascot.message) {
      const key = mascotState + mascot.message;
      if (spokenRef.current !== key) {
        spokenRef.current = key;
        speakTamil(stripEmoji(mascot.message));
      }
    } else if (mascotState === "idle" || mascotState === "listening") {
      spokenRef.current = null;
    }
  }, [mascotState, mascot.message]);

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-xl">
      <div className="relative flex flex-col items-center">
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          disabled={isProcessing || locked}
          aria-label="Press and hold to speak"
          className={cn(
            "relative h-36 w-36 rounded-full flex items-center justify-center border-8 transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.1)]",
            isRecording
              ? "bg-red-500 text-white border-red-500/20 scale-125"
              : isProcessing
              ? "bg-primary/10 text-primary border-primary/20"
              : mascotState === "success"
              ? "bg-emerald-500 text-white border-emerald-200 cursor-default"
              : mascotState === "mispronounced"
              ? "bg-white border-amber-200 text-amber-500 hover:border-amber-400 active:scale-95"
              : "bg-white border-slate-100 text-primary/60 hover:border-primary/40 hover:text-primary active:scale-95"
          )}
        >
          {isProcessing ? (
            <Loader2 className="h-12 w-12 animate-spin" />
          ) : mascotState === "success" ? (
            <CheckCircle2 className="h-12 w-12" />
          ) : (
            <Mic className="h-12 w-12" />
          )}

          {isRecording && (
            <>
              <span className="absolute -inset-8 h-52 w-52 rounded-full border-2 border-red-500/30 animate-ping pointer-events-none" />
              <span className="absolute -bottom-10 flex items-end gap-1 h-7" aria-hidden>
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

        <div className="mt-7 text-center bg-slate-50 px-8 py-3 rounded-full border border-slate-100 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 select-none">
            {isRecording ? "Listening…" : isProcessing ? "Analyzing…" : locked ? "Completed" : "Press and Hold to Speak"}
          </span>
        </div>
      </div>

      {(mascotState === "success" || mascotState === "mispronounced") && (
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
            <span className="text-4xl" aria-hidden>
              {mascot.emoji}
            </span>
            <p
              className={cn(
                "text-lg font-bold leading-relaxed",
                mascot.tone === "positive" ? "text-emerald-700" : "text-amber-700"
              )}
            >
              {mascot.message}
            </p>
            {showEnglish && (
              <p className="text-sm font-semibold text-slate-500 italic animate-in fade-in duration-200">
                {mascot.english}
              </p>
            )}
            {mascotState === "mispronounced" && lastResult?.transcription && (
              <p className="text-xs font-semibold text-slate-400">நீங்க சொன்னது: “{lastResult.transcription}”</p>
            )}
            <div className="mt-2 flex items-center gap-4">
              <button
                type="button"
                onClick={() => speakTamil(stripEmoji(mascot.message))}
                className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary/70 hover:text-primary transition-colors"
              >
                <Volume2 size={14} /> Replay
              </button>
              <button
                type="button"
                onClick={() => setShowEnglish((v) => !v)}
                className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
              >
                <Languages size={14} /> {showEnglish ? "தமிழ்" : "English"}
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default LabAudioRecorder;
