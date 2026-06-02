import { lenientTextMatch } from './speechMatch.js';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const normalizeMatchText = (s) => String(s ?? '').trim().toLowerCase();

/**
 * Strip answer keys before sending questions to students.
 */
export function sanitizeQuestionForStudent(question) {
  if (!question) return question;
  const q = question.toObject ? question.toObject() : { ...question };
  delete q.correctOptionIndex;
  delete q.correctAnswer;
  delete q.acceptedAnswers;

  // ── Matching: never ship the true linkage to the client ────────────────────
  // Split the pairs into independent left/right collections and shuffle each
  // column on the server so positional correlation cannot reveal the mapping.
  // The true linkage map stays server-side and is graded at submit/check time.
  if (q.type === 'match' && Array.isArray(q.pairs) && q.pairs.length > 0) {
    q.matchLefts = shuffleArray(
      q.pairs.map((p) => ({
        left: p.left,
        tamilWord: p.tamilWord || undefined,
        audioUrl: p.audioUrl || undefined,
      }))
    );
    q.matchRights = shuffleArray(q.pairs.map((p) => p.right));
    delete q.pairs; // strip the linkage entirely from the student payload
  }

  return q;
}

/**
 * Server-authoritative matching grader.
 * Independently evaluates the client-submitted mapping against the raw,
 * un-sanitized DB pairs. Returns a verified success/failure flag.
 */
export function evaluateMatchingAnswer(q, matchingAnswer) {
  const pairs = Array.isArray(q.pairs) ? q.pairs : [];
  if (pairs.length === 0) return false;
  if (!Array.isArray(matchingAnswer) || matchingAnswer.length !== pairs.length) return false;

  const correct = new Map(pairs.map((p) => [normalizeMatchText(p.left), normalizeMatchText(p.right)]));
  const seenLefts = new Set();

  for (const m of matchingAnswer) {
    if (!m) return false;
    const left = normalizeMatchText(m.left);
    const right = normalizeMatchText(m.right);
    if (seenLefts.has(left)) return false; // duplicate left mapping not allowed
    seenLefts.add(left);
    const expected = correct.get(left);
    if (expected === undefined || expected !== right) return false;
  }

  return seenLefts.size === pairs.length;
}

export function evaluateQuestionAnswer(q, ans = {}) {
  const { selectedOptionIndex, typedAnswer, isSpeakingCompleted, matchingAnswer, serverVerified } = ans;

  const isChoiceType = ['quiz', 'identify', 'choice', 'reading'].includes(q.type);
  const isCorrectChoice = isChoiceType && selectedOptionIndex === q.correctOptionIndex;

  // Matching is graded server-side against the raw DB pairs (never trusts a client flag).
  // Falls back to the verified attempt record (from the live /check call) if the
  // submit payload omits the mapping.
  const isCorrectMatch = q.type === 'match' && (
    evaluateMatchingAnswer(q, matchingAnswer) || serverVerified === true
  );

  const isCorrectFill = q.type === 'fill' && (
    selectedOptionIndex === (q.correctOptionIndex ?? 0) ||
    // Lenient text match: tolerates minor typos / diacritic variations, not wrong answers.
    (typedAnswer && lenientTextMatch(q.correctAnswer, typedAnswer, q.acceptedAnswers))
  );

  // Speaking & Writing are server-authoritative: a verified attempt record
  // (written by evaluate-speaking / evaluate-writing) is the source of truth.
  // The legacy client flag is honoured ONLY when no server record exists yet.
  const isCorrectSpeaking = q.type === 'speaking' && (
    serverVerified === true ||
    (serverVerified === undefined && isSpeakingCompleted === true)
  );
  const isCorrectWriting = q.type === 'writing' && (
    serverVerified === true ||
    (serverVerified === undefined && selectedOptionIndex === 0)
  );

  return isCorrectChoice || isCorrectMatch || isCorrectFill || isCorrectSpeaking || isCorrectWriting;
}

export function getRevealAnswer(q) {
  if (!q) return '';
  if (q.correctAnswer) return q.correctAnswer;
  if (q.type === 'match' && Array.isArray(q.pairs) && q.pairs.length > 0) {
    return q.pairs.map((p) => `${p.left} → ${p.right}`).join(', ');
  }
  if (q.options && q.correctOptionIndex != null && q.correctOptionIndex >= 0) {
    return q.options[q.correctOptionIndex] || '';
  }
  return '';
}
