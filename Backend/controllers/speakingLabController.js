import SpeakingLabItem from '../models/SpeakingLabItem.js';
import SpeakingLabProgress from '../models/SpeakingLabProgress.js';
import { gradeSpeech } from '../utils/speechMatch.js';
import { getSpeechClient, markGoogleDisabled } from './lessonController.js';

const SESSION_SIZE = 5;
const MAX_STREAK_BONUS = 5; // streak multiplier caps at +50%

// ── Helpers ─────────────────────────────────────────────────────────────────
async function getOrCreateProgress(userId) {
  let progress = await SpeakingLabProgress.findOne({ userId });
  if (!progress) {
    progress = await SpeakingLabProgress.create({ userId });
  }
  return progress;
}

function publicProgress(p) {
  return {
    level: p.level,
    xp: p.xp,
    itemsCompleted: p.itemsCompleted,
    currentStreak: p.currentStreak,
    bestStreak: p.bestStreak,
  };
}

/** Strip grading-only fields before sending an item to the student. */
function toClientItem(item) {
  return {
    _id: item._id,
    type: item.type,
    prompt: item.prompt,
    tamilWord: item.tamilWord,
    phoneticHint: item.phoneticHint,
    audioUrl: item.audioUrl,
    sequence: item.sequence,
    difficulty: item.difficulty,
    xp: item.xp,
  };
}

/**
 * Recognise Tamil speech from a base64 audio blob; returns { transcription, confidence }.
 * `hints` (the expected word/sentence + tokens) are passed as speech-adaptation phrase
 * hints so short Tamil utterances are biased toward the target — this fixes correct
 * pronunciations being mis-transcribed and wrongly graded as "wrong".
 */
async function recognizeTamil(audioBase64, hints = []) {
  // Strip ANY data-URL header (handles "data:audio/webm;codecs=opus;base64," etc).
  // base64 never contains a comma, so removing everything up to the first comma is safe.
  const cleanBase64 = String(audioBase64).replace(/^data:[^,]*,/, '');
  const phrases = [...new Set(hints.filter((h) => typeof h === 'string' && h.trim()))].slice(0, 50);
  let transcription = '';
  let confidence = null;
  try {
    const client = getSpeechClient();
    if (client) {
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
      if (resp.results && resp.results.length > 0) {
        transcription = resp.results.map(r => r.alternatives?.[0]?.transcript || '').join(' ').trim();
        const confs = resp.results.map(r => r.alternatives?.[0]?.confidence).filter(c => typeof c === 'number' && c > 0);
        if (confs.length > 0) confidence = confs.reduce((a, b) => a + b, 0) / confs.length;
      }
    }
  } catch (err) {
    markGoogleDisabled('STT', err);
  }
  return { transcription, confidence };
}

// ── Student endpoints ─────────────────────────────────────────────────────────

/** GET /api/speaking-lab/session — endless, scaling batch for the current level. */
export async function getSession(req, res, next) {
  try {
    const progress = await getOrCreateProgress(req.user.sub);
    const level = req.query.level ? Math.max(1, parseInt(req.query.level, 10) || progress.level) : progress.level;

    const items = await SpeakingLabItem.find({ isActive: true }).sort({ difficulty: 1, order: 1, createdAt: 1 });
    if (!items.length) {
      return res.json({ items: [], level, progress: publicProgress(progress) });
    }

    // Endless window: wrap around content so progression never hard-stops.
    const start = ((level - 1) * SESSION_SIZE) % items.length;
    const count = Math.min(SESSION_SIZE, items.length);
    const session = [];
    for (let i = 0; i < count; i++) {
      session.push(toClientItem(items[(start + i) % items.length]));
    }

    res.json({ items: session, level, progress: publicProgress(progress) });
  } catch (e) { next(e); }
}

/** POST /api/speaking-lab/evaluate — grade a spoken attempt, award XP/streak. */
export async function evaluateLabSpeaking(req, res, next) {
  try {
    const { itemId, audioBase64 } = req.body;
    if (!audioBase64) return res.status(400).json({ message: 'Audio data is required' });

    const item = await SpeakingLabItem.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Speaking Lab item not found' });

    const target = (item.expectedAudioText || item.tamilWord || (item.sequence || []).join(' ') || '').trim();

    // Bias recognition toward the expected answer for accurate short-word grading.
    const hints = [
      target,
      item.tamilWord,
      item.expectedAudioText,
      ...(item.sequence || []),
      ...(item.acceptedAnswers || []),
    ].filter(Boolean);
    const { transcription, confidence } = await recognizeTamil(audioBase64, hints);

    const grade = gradeSpeech(target, transcription, item.phoneticHint || '', confidence);
    const progress = await getOrCreateProgress(req.user.sub);

    let xpEarned = 0;
    let leveledUp = false;

    if (grade.passed) {
      progress.currentStreak += 1;
      if (progress.currentStreak > progress.bestStreak) progress.bestStreak = progress.currentStreak;
      progress.itemsCompleted += 1;

      // Streak multiplier (caps at +50%).
      const multiplier = 1 + Math.min(progress.currentStreak - 1, MAX_STREAK_BONUS) * 0.1;
      xpEarned = Math.round((item.xp || 10) * multiplier);
      progress.xp += xpEarned;

      const newLevel = Math.floor(progress.itemsCompleted / SESSION_SIZE) + 1;
      if (newLevel > progress.level) {
        progress.level = newLevel;
        leveledUp = true;
      }
    } else {
      progress.currentStreak = 0;
    }

    progress.lastPlayed = new Date();
    await progress.save();

    res.json({
      isCorrect: grade.passed,
      status: grade.status,
      score: grade.score,
      confidence: grade.confidence,
      transcription,
      correctText: target,
      feedback: grade.feedback,
      xpEarned,
      leveledUp,
      progress: publicProgress(progress),
    });
  } catch (e) { next(e); }
}

/** GET /api/speaking-lab/leaderboard — top players + the caller's rank. */
export async function getLeaderboard(req, res, next) {
  try {
    const top = await SpeakingLabProgress.find()
      .sort({ xp: -1, updatedAt: 1 })
      .limit(20)
      .populate('userId', 'name profilePhoto');

    const leaderboard = top
      .filter(p => p.userId)
      .map((p, idx) => ({
        rank: idx + 1,
        userId: p.userId._id,
        name: p.userId.name,
        profilePhoto: p.userId.profilePhoto || null,
        xp: p.xp,
        level: p.level,
        bestStreak: p.bestStreak,
      }));

    const mine = await getOrCreateProgress(req.user.sub);
    const ahead = await SpeakingLabProgress.countDocuments({ xp: { $gt: mine.xp } });

    res.json({
      leaderboard,
      me: { rank: ahead + 1, xp: mine.xp, level: mine.level, bestStreak: mine.bestStreak },
    });
  } catch (e) { next(e); }
}

// ── Admin endpoints ─────────────────────────────────────────────────────────

export async function listItems(req, res, next) {
  try {
    const items = await SpeakingLabItem.find().sort({ difficulty: 1, order: 1, createdAt: 1 });
    res.json({ items });
  } catch (e) { next(e); }
}

export async function createItem(req, res, next) {
  try {
    const item = await SpeakingLabItem.create(req.body);
    res.status(201).json({ item });
  } catch (e) { next(e); }
}

export async function updateItem(req, res, next) {
  try {
    const item = await SpeakingLabItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ item });
  } catch (e) { next(e); }
}

export async function deleteItem(req, res, next) {
  try {
    const item = await SpeakingLabItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (e) { next(e); }
}
