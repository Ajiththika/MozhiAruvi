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
 * Similarity thresholds for the simple, predictable 3-tier grade:
 *  - `perfect` (>= 75%) → CORRECT, advance to the next question.
 *  - `close`   (>= 50%) → almost right, REPEAT the same question (encouraging).
 *  - below 50%          → try again.
 *
 * We combine RAW similarity, PHONETIC-FOLDED similarity (so confusable Tamil
 * graphemes ல/ள/ழ, ர/ற … still count) and a CONTAINMENT check (so a correct
 * word spoken inside a longer recognised phrase still passes). This maximises
 * the chance that a genuinely correct answer is accepted, while a clearly wrong
 * pronunciation (e.g. சனிப்பட்டி vs பனிக்கட்டி ~70%) lands in "close/repeat"
 * rather than being wrongly accepted.
 */
export const SPEECH_THRESHOLDS = { perfect: 0.72, close: 0.48 };

/**
 * Grade a spoken/typed attempt into a forgiving, multi-tier result.
 *
 * @param {number} [confidence] optional STT confidence (0..1), returned for telemetry.
 * @returns {{ score:number, similarity:number, confidence:number|null,
 *   status:'perfect'|'close'|'retry', passed:boolean, feedback:string }}
 */
export function gradeSpeech(expected, user, phonetic = '', confidence = null, acceptedAnswers = []) {
  const ne = normalizeSpeech(expected);
  const nu = normalizeSpeech(user);

  const candidates = [expected, phonetic, ...(Array.isArray(acceptedAnswers) ? acceptedAnswers : [])]
    .filter(Boolean);

  // Raw similarity across expected word, phonetic hint, and accepted variants.
  let rawSim = 0;
  for (const c of candidates) {
    rawSim = Math.max(rawSim, tamilSimilarity(c, user));
  }
  if (!candidates.length) rawSim = tamilSimilarity(expected, user);

  // Phonetic-folded similarity — confusable Tamil graphemes collapsed.
  let foldSim = 0;
  for (const c of candidates) {
    foldSim = Math.max(foldSim, tamilSimilarity(tamilPhoneticFold(c), tamilPhoneticFold(user)));
  }
  if (!candidates.length) {
    foldSim = tamilSimilarity(tamilPhoneticFold(expected), tamilPhoneticFold(user));
  }

  // Containment — target word spoken inside a longer phrase (not a single syllable).
  let contain = 0;
  const eLen = Array.from(ne).length;
  const uLen = Array.from(nu).length;
  if (ne && nu && eLen >= 2) {
    if (nu === ne) contain = 1;
    else if (nu.includes(ne)) contain = 0.9;
    else if (ne.includes(nu) && uLen >= Math.ceil(eLen * 0.65)) contain = 0.85;
  }

  const similarity = Math.max(rawSim, foldSim, contain);
  const score = Math.min(100, Math.max(0, Math.round(similarity * 100)));
  const conf = (typeof confidence === 'number' && confidence > 0) ? confidence : null;
  const said = (user || '').trim();
  const need = (expected || '').trim();

  const wrongDetail = (prefix) => {
    if (!said) {
      return `${prefix} We could not hear you clearly. The word to say is "${need}". Hold the mic and speak clearly.`;
    }
    return `${prefix} You said "${said}" but the correct word is "${need}". Listen to the speaker and try again.`;
  };

  // ≥ 75% → correct, advance.
  if (similarity >= SPEECH_THRESHOLDS.perfect) {
    return { score, similarity, confidence: conf, status: 'perfect', passed: true, feedback: 'Perfect! Excellent pronunciation. 🎉' };
  }

  // 50–75% → almost there; stay on the same question.
  if (similarity >= SPEECH_THRESHOLDS.close) {
    return {
      score, similarity, confidence: conf, status: 'close', passed: false,
      feedback: wrongDetail('Almost!'),
    };
  }

  // Below 50% → try again.
  return {
    score, similarity, confidence: conf, status: 'retry', passed: false,
    feedback: wrongDetail('Not quite.'),
  };
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
