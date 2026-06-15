/**
 * Tamil speech transcription — Google Cloud STT primary, Gemini audio fallback.
 */
import fs from 'fs';

const DEBUG_LOG = '/Users/mr.ushantha/MozhiAruvi/MozhiAruvi/.cursor/debug-bccfa6.log';

function agentLog(hypothesisId, location, message, data = {}) {
  try {
    fs.appendFileSync(
      DEBUG_LOG,
      `${JSON.stringify({
        sessionId: 'bccfa6',
        hypothesisId,
        location,
        message,
        data,
        timestamp: Date.now(),
      })}\n`
    );
  } catch {
    /* ignore */
  }
}

function cleanAudioBase64(audioBase64) {
  return String(audioBase64).replace(/^data:[^,]*,/, '');
}

function uniqueHints(hints = []) {
  return [...new Set(hints.filter((h) => typeof h === 'string' && h.trim()))].slice(0, 50);
}

async function transcribeWithGoogle(cleanBase64, hints) {
  const { getSpeechClient, markGoogleDisabled } = await import('../controllers/lessonController.js');
  const phrases = uniqueHints(hints);
  const client = getSpeechClient();
  if (!client) return null;

  const config = {
    encoding: 'WEBM_OPUS',
    sampleRateHertz: 48000,
    languageCode: 'ta-IN',
    enableAutomaticPunctuation: true,
  };
  if (phrases.length > 0) {
    config.speechContexts = [{ phrases, boost: 18 }];
  }

  const [resp] = await client.recognize({
    config,
    audio: { content: cleanBase64 },
  });

  if (!resp.results?.length) return null;

  const transcription = resp.results
    .map((r) => r.alternatives?.[0]?.transcript || '')
    .join(' ')
    .trim();
  const confs = resp.results
    .map((r) => r.alternatives?.[0]?.confidence)
    .filter((c) => typeof c === 'number' && c > 0);

  return {
    transcription,
    confidence: confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : null,
  };
}

async function transcribeWithGemini(cleanBase64, hints) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey.length < 10) return null;

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash'];

    const hintLine = '';

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: 'audio/webm',
              data: cleanBase64,
            },
          },
          {
            text: `Transcribe ONLY what is actually spoken in this audio.
Do not guess or invent words. If audio is unclear, transcribe your best honest guess.
Return ONLY the Tamil transcript in Tamil script. No English, no labels, no explanation.`,
          },
        ]);
        const transcription = result.response.text().trim().replace(/^["']|["']$/g, '');
        if (transcription) {
          return { transcription, confidence: 0.75 };
        }
      } catch (modelErr) {
        // #region agent log
        agentLog('H2', 'tamilSpeech.js:transcribeWithGemini', 'model error', {
          model: modelName,
          error: String(modelErr.message || modelErr).slice(0, 200),
        });
        // #endregion
        if (!String(modelErr.message).includes('404')) continue;
      }
    }
  } catch (err) {
    console.warn('[Gemini STT] fallback failed:', err.message);
  }

  return null;
}

/** Transcribe Tamil speech from a base64 audio payload. */
export async function transcribeTamilAudio(audioBase64, hints = [], clientTranscript = '') {
  const browserText = String(clientTranscript || '').trim();
  if (browserText) {
    // #region agent log
    agentLog('H7', 'tamilSpeech.js:transcribeTamilAudio', 'browser-stt primary', {
      engine: 'browser',
      transcriptLen: browserText.length,
    });
    // #endregion
    return { transcription: browserText, confidence: 0.82, engine: 'browser' };
  }

  const cleanBase64 = cleanAudioBase64(audioBase64);
  if (!cleanBase64) {
    // #region agent log
    agentLog('H3', 'tamilSpeech.js:transcribeTamilAudio', 'empty audio payload', { bytes: 0 });
    // #endregion
    return { transcription: '', confidence: null, engine: 'none' };
  }

  // #region agent log
  agentLog('H3', 'tamilSpeech.js:transcribeTamilAudio', 'stt request', {
    audioBytes: cleanBase64.length,
    hintCount: uniqueHints(hints).length,
  });
  // #endregion

  try {
    const google = await transcribeWithGoogle(cleanBase64, hints);
    if (google?.transcription) {
      // #region agent log
      agentLog('H1', 'tamilSpeech.js:transcribeTamilAudio', 'google-stt success', {
        engine: 'google-stt',
        transcriptLen: google.transcription.length,
      });
      // #endregion
      return { ...google, engine: 'google-stt' };
    }
  } catch (err) {
    const { markGoogleDisabled } = await import('../controllers/lessonController.js');
    markGoogleDisabled('STT', err);
    // #region agent log
    agentLog('H1', 'tamilSpeech.js:transcribeTamilAudio', 'google-stt failed', {
      error: err.message,
    });
    // #endregion
  }

  const gemini = await transcribeWithGemini(cleanBase64, hints);
  if (gemini?.transcription) {
    // #region agent log
    agentLog('H2', 'tamilSpeech.js:transcribeTamilAudio', 'gemini fallback success', {
      engine: 'gemini',
      transcriptLen: gemini.transcription.length,
    });
    // #endregion
    return { ...gemini, engine: 'gemini' };
  }

  // #region agent log
  agentLog('H2', 'tamilSpeech.js:transcribeTamilAudio', 'all stt engines failed', {
    engine: 'none',
  });
  // #endregion
  return { transcription: '', confidence: null, engine: 'none' };
}
