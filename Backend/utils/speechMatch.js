import { stringSimilarity } from 'string-similarity-js';

/**
 * Lenient speech / text matching tuned for Tamil.
 *
 * Tamil words are short and dialect/pronunciation variations are common, so a rigid
 * exact (===) check produces too many false "Wrong" results. We combine a Unicode-safe
 * Levenshtein-based character similarity with the Dice-coefficient bigram similarity and
 * convert the result into a forgiving, multi-tier score.
 */

/** Normalize a string: lowercase, strip punctuation/symbols, collapse whitespace. */
export function normalizeSpeech(str = '') {
  return String(str)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tamil phonetic folding — maps graphemes that learners (and the STT engine)
 * routinely confuse onto a single canonical class, so phonetically-equivalent
 * pronunciations are treated as near-matches rather than hard "Wrong".
 *
 * Confusable consonant classes:
 *   ல / ள / ழ        → ல   (la / La / zha)
 *   ர / ற            → ர   (ra / Ra)
 *   ந / ண / ன        → ன   (na / Na / na)
 *   ஜ→ச, ஷ→ஸ→ச      grantha sibilants collapsed to ச
 * Vowel length is folded (long → short) for both independent vowels and matras.
 */
const TAMIL_FOLD_MAP = {
  // L-class
  'ள': 'ல', 'ழ': 'ல',
  // R-class
  'ற': 'ர',
  // N-class
  'ந': 'ன', 'ண': 'ன',
  // sibilants / grantha
  'ஜ': 'ச', 'ஷ': 'ஸ', 'ஸ': 'ச', 'ஶ': 'ச',
  // independent vowels: long → short
  'ஆ': 'அ', 'ஈ': 'இ', 'ஊ': 'உ', 'ஏ': 'எ', 'ஓ': 'ஒ',
  // vowel signs (matras): long → short; inherent 'ா' dropped
  '\u0BBE': '',            // ா (aa) — inherent 'a', drop
  '\u0BC0': '\u0BBF',      // ீ → ி
  '\u0BC2': '\u0BC1',      // ூ → ு
  '\u0BC7': '\u0BC6',      // ே → ெ
  '\u0BCB': '\u0BCA',      // ோ → ொ
};

/** Apply Tamil phonetic folding grapheme-by-grapheme (after normalization). */
export function tamilPhoneticFold(str = '') {
  const norm = normalizeSpeech(str);
  let out = '';
  for (const ch of norm) {
    out += Object.prototype.hasOwnProperty.call(TAMIL_FOLD_MAP, ch) ? TAMIL_FOLD_MAP[ch] : ch;
  }
  return out.replace(/\s+/g, ' ').trim();
}

/** Unicode-aware Levenshtein edit distance (operates on code points, safe for Tamil). */
export function levenshtein(a = '', b = '') {
  const s = Array.from(a);
  const t = Array.from(b);
  const m = s.length;
  const n = t.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    const curr = new Array(n + 1);
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[n];
}

/** Character-level similarity (1 - normalized edit distance), 0..1. */
export function charSimilarity(a = '', b = '') {
  const s = Array.from(a);
  const t = Array.from(b);
  const maxLen = Math.max(s.length, t.length);
  if (maxLen === 0) return 0;
  return 1 - levenshtein(a, b) / maxLen;
}

/**
 * Combined similarity tuned for Tamil. Returns 0..1.
 * For very short words (<=3 chars) the bigram/Dice coefficient is unreliable
 * (often 0), so we lean on character similarity instead.
 */
export function tamilSimilarity(expected = '', user = '') {
  const e = normalizeSpeech(expected);
  const u = normalizeSpeech(user);
  if (!e || !u) return 0;
  if (e === u) return 1;

  const charSim = charSimilarity(e, u);

  if (Array.from(e).length <= 3 || Array.from(u).length <= 3) {
    return charSim;
  }

  let diceSim = 0;
  try {
    diceSim = stringSimilarity(e, u) || 0;
  } catch {
    diceSim = 0;
  }
  return Math.max(charSim, diceSim);
}

/**
 * Similarity thresholds for the multi-tier grade.
 *  - `perfect`/`close` apply to the RAW (un-folded) comparison — true accuracy.
 *  - `foldedClose` lets a phonetically-equivalent attempt (ள↔ழ↔ல, etc.) pass as "close".
 */
export const SPEECH_THRESHOLDS = { perfect: 0.9, close: 0.72, foldedClose: 0.85 };

/** Minimum STT confidence to award a clean "perfect" (otherwise capped at "close"). */
export const CONFIDENCE_THRESHOLD = 0.85;

/**
 * Grade a spoken/typed attempt into a forgiving, multi-tier result.
 *
 * Strategy (fixes both false-positives and false-negatives):
 *  - RAW similarity drives "perfect" so genuinely accurate speech is rewarded.
 *  - PHONETIC-FOLDED similarity catches dialect/grapheme confusions (ல/ள/ழ …)
 *    and lets them through as "close" rather than a hard "Wrong".
 *  - STT `confidence` gates "perfect": high similarity but low recogniser
 *    confidence is downgraded to "close", reducing wrong answers slipping through.
 *
 * @param {number} [confidence] optional STT confidence (0..1).
 * @returns {{ score:number, similarity:number, confidence:number|null,
 *   status:'perfect'|'close'|'retry', passed:boolean, feedback:string }}
 */
export function gradeSpeech(expected, user, phonetic = '', confidence = null) {
  // Raw similarity (also try the admin-provided phonetic hint).
  let rawSim = tamilSimilarity(expected, user);
  if (phonetic) rawSim = Math.max(rawSim, tamilSimilarity(phonetic, user));

  // Phonetic-folded similarity — confusable Tamil graphemes collapsed.
  let foldSim = tamilSimilarity(tamilPhoneticFold(expected), tamilPhoneticFold(user));
  if (phonetic) {
    foldSim = Math.max(foldSim, tamilSimilarity(tamilPhoneticFold(phonetic), tamilPhoneticFold(user)));
  }

  const similarity = Math.max(rawSim, foldSim);
  const score = Math.min(100, Math.max(0, Math.round(similarity * 100)));
  const conf = (typeof confidence === 'number' && confidence > 0) ? confidence : null;

  // Perfect requires accurate RAW pronunciation AND (when available) confident recognition.
  if (rawSim >= SPEECH_THRESHOLDS.perfect) {
    if (conf !== null && conf < CONFIDENCE_THRESHOLD) {
      return { score, similarity, confidence: conf, status: 'close', passed: true, feedback: 'Almost perfect — say it once more clearly to nail it. 👍' };
    }
    return { score, similarity, confidence: conf, status: 'perfect', passed: true, feedback: 'Perfect! Excellent pronunciation. 🎉' };
  }

  // Close: decent raw match OR a strong phonetic-equivalent match.
  if (rawSim >= SPEECH_THRESHOLDS.close || foldSim >= SPEECH_THRESHOLDS.foldedClose) {
    return { score, similarity, confidence: conf, status: 'close', passed: true, feedback: 'Good effort, almost perfect! Keep practicing. 👍' };
  }

  return { score, similarity, confidence: conf, status: 'retry', passed: false, feedback: 'Not quite — listen again and try speaking once more.' };
}

/**
 * Lenient text-answer match (e.g. fill-in-the-blank). Accepts an exact normalized
 * match, any accepted-answer variant, or a high-similarity near-match (typo tolerance)
 * without letting genuinely wrong answers through.
 */
export function lenientTextMatch(expected, user, acceptedAnswers = [], threshold = 0.85) {
  const u = normalizeSpeech(user);
  if (!u) return false;

  const candidates = [expected, ...(Array.isArray(acceptedAnswers) ? acceptedAnswers : [])]
    .filter(Boolean)
    .map(normalizeSpeech)
    .filter(Boolean);

  if (candidates.length === 0) return false;
  if (candidates.includes(u)) return true;

  return candidates.some((c) => tamilSimilarity(c, u) >= threshold);
}
