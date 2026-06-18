/**
 * Build evaluation payload — prefer browser transcript to avoid 413 payload errors.
 * Sends compact audio only when transcript is missing or very short.
 */

const MAX_AUDIO_BASE64 = 48_000; // ~36KB decoded — keeps JSON under default proxy limits

export interface SpeakingEvaluatePayload {
  audioBase64?: string;
  clientTranscript?: string;
}

export async function buildSpeakingPayload(
  audioBlob: Blob,
  blobToDataUrl: (blob: Blob) => Promise<string>,
  clientTranscript: string
): Promise<SpeakingEvaluatePayload> {
  const transcript = clientTranscript.trim();

  if (transcript.length >= 1) {
    // Transcript is enough for grading; skip heavy audio upload.
    return { clientTranscript: transcript };
  }

  const base64data = await blobToDataUrl(audioBlob);
  if (base64data.length <= MAX_AUDIO_BASE64) {
    return { audioBase64: base64data, clientTranscript: transcript || undefined };
  }

  // Audio too large and no transcript — send truncated notice via empty transcript path
  return { audioBase64: base64data.slice(0, MAX_AUDIO_BASE64) };
}
