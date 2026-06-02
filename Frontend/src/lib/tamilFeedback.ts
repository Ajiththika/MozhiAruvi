/**
 * Tamil mascot feedback system.
 *
 * Turns a speech-evaluation outcome into a delightful, regional Tamil reaction
 * (message + emoji + optional local audio clip) for the learning mascot.
 *
 * Audio clips are OPTIONAL — if the asset is missing, the UI simply skips
 * playback (or falls back to TTS), so this never blocks the learning flow.
 */

import type { SpeakingStatus } from "@/services/lessonService";

export type MascotState = "idle" | "listening" | "processing" | "success" | "mispronounced";

export interface MascotFeedback {
  state: MascotState;
  message: string;
  emoji: string;
  /** Optional local audio asset (e.g. "/audio/mascot/oops-1.mp3"). Played if present. */
  audioClip?: string;
  tone: "neutral" | "positive" | "warning";
}

// Witty, encouraging regional-Tamil lines for a wrong/mispronounced attempt.
// Kept playful but kind — never harsh.
const MISPRONOUNCED_LINES: { message: string; emoji: string; audioClip?: string }[] = [
  { message: "காதுல ரத்தம் வருது! 😅 இன்னொரு முறை சொல்லுங்க.", emoji: "👂", audioClip: "/audio/mascot/oops-1.mp3" },
  { message: "சும்மா இல்ல, கொஞ்சம் தெளிவா சொல்லுங்க!", emoji: "🙂", audioClip: "/audio/mascot/oops-2.mp3" },
  { message: "கிட்டத்தட்ட சரி… இன்னும் கொஞ்சம் முயற்சி பண்ணுங்க!", emoji: "💪", audioClip: "/audio/mascot/try-again-1.mp3" },
  { message: "மெதுவா, தெளிவா — மறுபடியும் சொல்லிப் பாருங்க!", emoji: "🐢", audioClip: "/audio/mascot/slow-1.mp3" },
];

const CLOSE_LINES: { message: string; emoji: string; audioClip?: string }[] = [
  { message: "அருமை! கிட்டத்தட்ட சரியா சொன்னீங்க! 👏", emoji: "✨", audioClip: "/audio/mascot/close-1.mp3" },
  { message: "நல்ல முயற்சி! இன்னும் கொஞ்சம் பயிற்சி, அவ்வளவுதான்!", emoji: "👍", audioClip: "/audio/mascot/close-2.mp3" },
];

const SUCCESS_LINES: { message: string; emoji: string; audioClip?: string }[] = [
  { message: "அருமை! சரியான உச்சரிப்பு! 🎉", emoji: "🎉", audioClip: "/audio/mascot/success-1.mp3" },
  { message: "சபாஷ்! நீங்க பேசுறது தமிழ் மழை மாதிரி! 🌧️", emoji: "🌟", audioClip: "/audio/mascot/success-2.mp3" },
  { message: "செம்ம! இப்படியே தொடருங்க!", emoji: "🔥", audioClip: "/audio/mascot/success-3.mp3" },
];

const LISTENING_LINE = { message: "கேட்டுக்கிட்டு இருக்கேன்… பேசுங்க!", emoji: "🎙️" };
const PROCESSING_LINE = { message: "கொஞ்சம் பொறுங்க, கவனிக்கிறேன்…", emoji: "🤔" };
const IDLE_LINE = { message: "தயாரா? மைக்கை அழுத்திப் பேசுங்க!", emoji: "🎤" };

function pick<T>(arr: T[], seed?: string): T {
  if (arr.length === 1) return arr[0];
  // Deterministic-ish pick so the same transcription doesn't flicker between renders.
  let idx = Math.floor(Math.random() * arr.length);
  if (seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    idx = hash % arr.length;
  }
  return arr[idx];
}

/**
 * Build mascot feedback for the current state. For a wrong/mispronounced
 * attempt, the captured (possibly wrong) phonetic string seeds the witty line.
 */
export function getMascotFeedback(
  state: MascotState,
  status?: SpeakingStatus,
  transcription?: string
): MascotFeedback {
  if (state === "listening") {
    return { state, ...LISTENING_LINE, tone: "neutral" };
  }
  if (state === "processing") {
    return { state, ...PROCESSING_LINE, tone: "neutral" };
  }
  if (state === "success") {
    if (status === "close") {
      const line = pick(CLOSE_LINES, transcription);
      return { state, ...line, tone: "positive" };
    }
    const line = pick(SUCCESS_LINES, transcription);
    return { state, ...line, tone: "positive" };
  }
  if (state === "mispronounced") {
    const line = pick(MISPRONOUNCED_LINES, transcription);
    return { state, ...line, tone: "warning" };
  }
  return { state: "idle", ...IDLE_LINE, tone: "neutral" };
}
