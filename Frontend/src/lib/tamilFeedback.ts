/**
 * Tamil mascot feedback system.
 *
 * Turns a speech-evaluation outcome into a delightful, regional Tamil reaction
 * (message + emoji + English translation) for the learning mascot.
 *
 * The Tamil message can be spoken aloud via Google TTS (speakTamil), and the
 * English translation can be revealed on hover/toggle so learners understand
 * the witty line.
 */

import type { SpeakingStatus } from "@/services/lessonService";

export type MascotState = "idle" | "listening" | "processing" | "success" | "mispronounced";

export interface MascotFeedback {
  state: MascotState;
  message: string;
  english: string;
  emoji: string;
  /** Optional local audio asset. If absent, the UI speaks `message` via TTS. */
  audioClip?: string;
  tone: "neutral" | "positive" | "warning";
}

interface Line {
  message: string;
  english: string;
  emoji: string;
}

// Witty, encouraging regional-Tamil lines for a wrong/mispronounced attempt.
// Kept playful but kind — never harsh.
const MISPRONOUNCED_LINES: Line[] = [
  { message: "காதுல ரத்தம் வருது! இன்னொரு முறை சொல்லுங்க.", english: "Ouch, my ears! Say it one more time.", emoji: "👂" },
  { message: "சும்மா இல்ல, கொஞ்சம் தெளிவா சொல்லுங்க!", english: "Not quite — say it a little more clearly!", emoji: "🙂" },
  { message: "கிட்டத்தட்ட சரி… இன்னும் கொஞ்சம் முயற்சி பண்ணுங்க!", english: "Almost there… give it another try!", emoji: "💪" },
  { message: "மெதுவா, தெளிவா — மறுபடியும் சொல்லிப் பாருங்க!", english: "Slow and clear — try saying it again!", emoji: "🐢" },
];

const CLOSE_LINES: Line[] = [
  { message: "அருமை! கிட்டத்தட்ட சரியா சொன்னீங்க!", english: "Great! You almost nailed it!", emoji: "✨" },
  { message: "நல்ல முயற்சி! இன்னும் கொஞ்சம் பயிற்சி, அவ்வளவுதான்!", english: "Good effort! Just a little more practice!", emoji: "👍" },
];

const SUCCESS_LINES: Line[] = [
  { message: "அருமை! சரியான உச்சரிப்பு!", english: "Excellent! Perfect pronunciation!", emoji: "🎉" },
  { message: "சபாஷ்! நீங்க பேசுறது தமிழ் மழை மாதிரி!", english: "Bravo! Your Tamil flows like rain!", emoji: "🌟" },
  { message: "செம்ம! இப்படியே தொடருங்க!", english: "Awesome! Keep it going!", emoji: "🔥" },
];

const LISTENING_LINE: Line = { message: "கேட்டுக்கிட்டு இருக்கேன்… பேசுங்க!", english: "I'm listening… go ahead and speak!", emoji: "🎙️" };
const PROCESSING_LINE: Line = { message: "கொஞ்சம் பொறுங்க, கவனிக்கிறேன்…", english: "Hold on, I'm listening…", emoji: "🤔" };
const IDLE_LINE: Line = { message: "தயாரா? மைக்கை அழுத்திப் பேசுங்க!", english: "Ready? Press the mic and speak!", emoji: "🎤" };

/** Strip emoji / pictographic characters so TTS reads only the spoken words. */
export function stripEmoji(str = ""): string {
  return str
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

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
      return { state, ...pick(CLOSE_LINES, transcription), tone: "positive" };
    }
    return { state, ...pick(SUCCESS_LINES, transcription), tone: "positive" };
  }
  if (state === "mispronounced") {
    // 50–75% "close" attempts get an encouraging "almost — say it once more" line
    // rather than a playful roast (which is reserved for genuinely off attempts).
    if (status === "close") {
      return { state, ...pick(CLOSE_LINES, transcription), tone: "warning" };
    }
    return { state, ...pick(MISPRONOUNCED_LINES, transcription), tone: "warning" };
  }
  return { state: "idle", ...IDLE_LINE, tone: "neutral" };
}
