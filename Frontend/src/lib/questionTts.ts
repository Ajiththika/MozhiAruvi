import type { Question } from "@/services/lessonService";

/** Tamil text used ONLY for speech — never the full question prompt. */
export function getTamilSpeechText(question?: Question | null): string {
  if (!question) return "";
  return (question.tamilWord || question.expectedAudioText || "").trim();
}

/** Whether the speaker button should render for this question. */
export function shouldShowSpeaker(question?: Question | null): boolean {
  if (!question) return false;
  if (question.textToSpeech === false) return false;

  const hasAudio = !!(question.audioUrl && question.audioUrl.length > 0);
  const hasTamil = !!getTamilSpeechText(question);

  if (question.textToSpeech === true) return hasTamil || hasAudio;
  return hasTamil || hasAudio;
}
