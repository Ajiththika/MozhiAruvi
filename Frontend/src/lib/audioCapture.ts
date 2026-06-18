/**
 * Cross-browser microphone capture for speaking exercises.
 */

export function getSupportedAudioMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;

  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/aac",
    "",
  ];

  for (const type of candidates) {
    if (!type || MediaRecorder.isTypeSupported(type)) {
      return type || undefined;
    }
  }

  return undefined;
}

export async function requestMicStream(): Promise<MediaStream> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("UNSUPPORTED");
  }

  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1,
    },
  });
}

export function createRecorder(stream: MediaStream): MediaRecorder {
  const mimeType = getSupportedAudioMimeType();
  return mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
}

export function blobFromRecorder(recorder: MediaRecorder, chunks: BlobPart[]): Blob {
  return new Blob(chunks, {
    type: recorder.mimeType || "audio/webm;codecs=opus",
  });
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
