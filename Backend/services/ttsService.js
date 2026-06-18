/**
 * ttsService.js
 *
 * Native xAI Text-to-Speech for Tamil (mozhiaruvi.com).
 * This fully replaces the legacy Google Cloud TTS + ElevenLabs integrations.
 *
 * The xAI endpoint returns a raw binary MP3 stream (not JSON), so we read it as
 * an ArrayBuffer and hand back a Node Buffer for the controller to encode/stream.
 */

const XAI_TTS_ENDPOINT = 'https://api.x.ai/v1/tts';

// 'ara' and 'sal' are balanced, conversational voices. 'ara' is our default.
export const DEFAULT_VOICE_ID = 'ara';
export const ALLOWED_VOICES = ['ara', 'sal'];

/**
 * Synthesize Tamil speech via the native xAI TTS API.
 *
 * @param {string} text            Tamil text to speak.
 * @param {string} [voiceId='ara'] One of ALLOWED_VOICES; falls back to default.
 * @returns {Promise<Buffer>}      MP3 audio as a Node Buffer.
 * @throws  {Error}                If the key is missing or the stream fails/empties.
 */
export async function synthesizeTamilSpeech(text, voiceId = DEFAULT_VOICE_ID) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error('XAI_API_KEY is not configured');
  }

  const cleanText = String(text || '').trim();
  if (!cleanText) {
    throw new Error('No text provided for synthesis');
  }

  const voice = ALLOWED_VOICES.includes(voiceId) ? voiceId : DEFAULT_VOICE_ID;

  const response = await fetch(XAI_TTS_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: cleanText,
      voice_id: voice,
      language: 'ta', // BCP-47 Tamil — forces native pronunciation accuracy
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`xAI TTS request failed (${response.status}): ${detail.slice(0, 200)}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (!buffer || buffer.length === 0) {
    throw new Error('xAI TTS returned an empty audio stream');
  }
  return buffer;
}
