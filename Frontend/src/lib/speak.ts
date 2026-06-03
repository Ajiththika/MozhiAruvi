import { api } from "@/lib/api";

/**
 * Tamil Text-to-Speech for the Speaking Lab.
 *
 * Primary: backend Google Cloud TTS (clear, reliable Tamil voice) returned as an
 * MP3 data URL. Fallback: browser SpeechSynthesis (used only if the backend has
 * no TTS configured or the request fails) — note Windows often lacks a Tamil
 * voice, so the backend path is strongly preferred.
 */

// Cache synthesized audio per phrase to avoid refetching on repeated taps.
const ttsCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;

async function fetchTtsUrl(text: string): Promise<string | null> {
  if (ttsCache.has(text)) return ttsCache.get(text) as string;
  try {
    const res = await api.post<{ audioUrl: string }>("/speaking-lab/tts", { text });
    const url = res.data?.audioUrl;
    if (url) {
      ttsCache.set(text, url);
      return url;
    }
  } catch {
    /* backend unreachable / no TTS configured → fall back to browser */
  }
  return null;
}

function browserSpeak(text: string, rate: number) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const run = () => {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const taVoice = window.speechSynthesis.getVoices().find((v) => v.lang?.startsWith("ta"));
      if (taVoice) utterance.voice = taVoice;
      utterance.lang = "ta-IN";
      utterance.rate = rate;
      utterance.pitch = 1.0;
      (window as unknown as { _activeUtterance?: SpeechSynthesisUtterance })._activeUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      /* speech synthesis unavailable — ignore */
    }
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    const t = setInterval(() => {
      if (window.speechSynthesis.getVoices().length > 0) {
        clearInterval(t);
        run();
      }
    }, 100);
    setTimeout(() => clearInterval(t), 3000);
  } else {
    run();
  }
}

/** Speak a Tamil word/phrase aloud. Fire-and-forget; safe to call from onClick. */
export async function speakTamil(text: string, rate = 1.0) {
  const clean = (text || "").trim();
  if (!clean) return;

  const url = await fetchTtsUrl(clean);
  if (url) {
    try {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      const audio = new Audio(url);
      currentAudio = audio;
      audio.playbackRate = rate;
      await audio.play();
      return;
    } catch {
      /* autoplay/codec issue → fall back to browser synthesis */
    }
  }

  browserSpeak(clean, rate);
}
