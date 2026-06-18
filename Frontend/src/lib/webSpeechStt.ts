/**
 * Browser Web Speech API — Tamil STT fallback when server Google/Gemini STT is unavailable.
 * Works in Chrome, Edge, and Safari (macOS).
 */

export const MIN_RECORD_MS = 700;
export const MAX_RECORD_MS = 5000;
export const MIN_AUDIO_BYTES = 1200;

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      0?: { transcript?: string };
    };
  };
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getSpeechRecognitionCtor():
  | (new () => SpeechRecognitionInstance)
  | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition;
}

export function isBrowserSttAvailable(): boolean {
  return !!getSpeechRecognitionCtor();
}

/** Runs Tamil speech recognition in parallel with MediaRecorder capture. */
export class TamilSpeechSession {
  private recognition: SpeechRecognitionInstance | null = null;
  private finals: string[] = [];
  private interim = "";

  constructor() {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
    this.recognition = new Ctor();
    this.recognition.lang = "ta-IN";
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0]?.transcript?.trim() || "";
        if (!text) continue;
        if (event.results[i].isFinal) {
          this.finals.push(text);
          this.interim = "";
        } else {
          this.interim = text;
        }
      }
    };
  }

  available(): boolean {
    return !!this.recognition;
  }

  start(): void {
    this.finals = [];
    this.interim = "";
    if (!this.recognition) return;
    try {
      this.recognition.start();
    } catch {
      /* already started */
    }
  }

  stop(): Promise<string> {
    return new Promise((resolve) => {
      if (!this.recognition) {
        resolve("");
        return;
      }
      const finish = () => {
        const text = [...this.finals, this.interim].filter(Boolean).join(" ").trim();
        resolve(text);
      };
      const timer = setTimeout(finish, 400);
      this.recognition.onend = () => {
        clearTimeout(timer);
        finish();
      };
      this.recognition.onerror = () => {
        clearTimeout(timer);
        finish();
      };
      try {
        this.recognition.stop();
      } catch {
        clearTimeout(timer);
        finish();
      }
    });
  }

  abort(): void {
    try {
      this.recognition?.abort();
    } catch {
      /* ignore */
    }
  }
}
