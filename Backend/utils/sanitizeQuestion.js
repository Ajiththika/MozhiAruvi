/**
 * Strip answer keys before sending questions to students.
 */
export function sanitizeQuestionForStudent(question) {
  if (!question) return question;
  const q = question.toObject ? question.toObject() : { ...question };
  delete q.correctOptionIndex;
  delete q.correctAnswer;
  delete q.acceptedAnswers;
  return q;
}

export function evaluateQuestionAnswer(q, { selectedOptionIndex, typedAnswer, isSpeakingCompleted }) {
  const isChoiceType = ['quiz', 'identify', 'choice', 'reading'].includes(q.type);
  const isCorrectChoice = isChoiceType && selectedOptionIndex === q.correctOptionIndex;
  const isCorrectMatch = q.type === 'match' && selectedOptionIndex === (q.correctOptionIndex ?? 0);
  const isCorrectFill = q.type === 'fill' && (
    selectedOptionIndex === (q.correctOptionIndex ?? 0) ||
    (typedAnswer && (q.correctAnswer || '').toLowerCase().trim() === String(typedAnswer).toLowerCase().trim())
  );
  const isCorrectSpeaking = q.type === 'speaking' && isSpeakingCompleted === true;
  const isCorrectWriting = q.type === 'writing' && selectedOptionIndex === 0;

  return isCorrectChoice || isCorrectMatch || isCorrectFill || isCorrectSpeaking || isCorrectWriting;
}

export function getRevealAnswer(q) {
  if (!q) return '';
  if (q.correctAnswer) return q.correctAnswer;
  if (q.options && q.correctOptionIndex != null && q.correctOptionIndex >= 0) {
    return q.options[q.correctOptionIndex] || '';
  }
  return '';
}
