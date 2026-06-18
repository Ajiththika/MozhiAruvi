import { api } from "@/lib/api";

/**
 * Tamil Text-to-Speech for lessons and Speaking Lab.
 * Primary: backend Google Cloud TTS. Fallback: browser SpeechSynthesis.
 */

const ttsCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;
let voicesReady = false;

function preloadVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis || voicesReady) return;
  const load = () => {
    if (window.speechSynthesis.getVoices().length > 0) voicesReady = true;
  };
  load();
  window.speechSynthesis.addEventListener("voiceschanged", load);
}

if (typeof window !== "undefined") preloadVoices();

async function fetchTtsUrl(text: string): Promise<string | null> {
  if (ttsCache.has(text)) return ttsCache.get(text) as string;
  try {
    const res = await api.post<{ audioUrl: string | null; fallback?: boolean }>(
      "/speaking-lab/tts",
      { text }
    );
    const url = res.data?.audioUrl;
    if (url) {
      ttsCache.set(text, url);
      return url;
    }
  } catch {
    /* backend unreachable → browser fallback */
  }
  return null;
}

function pickTamilVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const taVoices = voices.filter((v) => v.lang?.startsWith("ta"));
  if (!taVoices.length) return undefined;

  return (
    taVoices.find((v) => v.name.includes("Wavenet")) ||
    taVoices.find((v) => v.name.includes("Premium")) ||
    taVoices.find((v) => v.name.includes("Google")) ||
    taVoices[0]
  );
}

function browserSpeak(text: string, rate: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }

    const run = () => {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = pickTamilVoice();
        if (voice) utterance.voice = voice;
        utterance.lang = voice?.lang || "ta-IN";
        utterance.rate = Math.min(Math.max(rate, 0.7), 1.1);
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        (window as unknown as { _activeUtterance?: SpeechSynthesisUtterance })._activeUtterance =
          utterance;
        window.speechSynthesis.speak(utterance);
      } catch {
        resolve();
      }
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      const timer = setInterval(() => {
        if (window.speechSynthesis.getVoices().length > 0) {
          clearInterval(timer);
          run();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(timer);
        run();
      }, 2500);
    } else {
      run();
    }
  });
}

/** Speak a Tamil word/phrase aloud. Safe to call from onClick handlers. */
export async function speakTamil(text: string, rate = 0.95) {
  const clean = (text || "").trim();
  if (!clean) return;

  const url = await fetchTtsUrl(clean);
  // #region agent log
  fetch('http://127.0.0.1:7862/ingest/dad32cd8-6c18-4d53-beab-65ec3fd236c8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bccfa6'},body:JSON.stringify({sessionId:'bccfa6',hypothesisId:'H5',location:'speak.ts:speakTamil',message:'tts source',data:{hasBackendUrl:!!url,textLen:clean.length},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if (url) {
    try {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      const audio = new Audio(url);
      audio.preload = "auto";
      currentAudio = audio;
      audio.playbackRate = rate;
      audio.volume = 1;
      await audio.play();
      return;
    } catch {
      /* fall through to browser synthesis */
    }
  }

  await browserSpeak(clean, rate);
}

export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
