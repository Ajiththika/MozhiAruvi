import mongoose from 'mongoose';

/**
 * Server-verified attempt records for answer types that are evaluated
 * asynchronously on the server (speaking via STT, writing via vision OCR).
 *
 * The lesson submission flow reads the latest verified record here instead of
 * trusting a client-supplied success flag, closing the integrity gap where a
 * client could blindly send `selectedOptionIndex === 0` / `isSpeakingCompleted`.
 */
const questionAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  type: { type: String },
  verified: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
}, { timestamps: true });

questionAttemptSchema.index({ userId: 1, questionId: 1 }, { unique: true });

export default mongoose.model('QuestionAttempt', questionAttemptSchema);
