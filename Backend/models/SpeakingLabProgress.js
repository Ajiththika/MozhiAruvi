import mongoose from 'mongoose';

/**
 * Per-user Speaking Lab gamification state. Additive — keeps lab XP/streak
 * independent of core lesson XP so the endless lab can have its own competitive
 * leaderboard without affecting curriculum progress.
 */
const speakingLabProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  level: { type: Number, default: 1, min: 1 },
  xp: { type: Number, default: 0, min: 0 },
  itemsCompleted: { type: Number, default: 0, min: 0 },
  currentStreak: { type: Number, default: 0, min: 0 },   // consecutive correct (multiplier)
  bestStreak: { type: Number, default: 0, min: 0 },
  lastPlayed: { type: Date },
}, { timestamps: true });

// Leaderboard ordering.
speakingLabProgressSchema.index({ xp: -1 });

export default mongoose.model('SpeakingLabProgress', speakingLabProgressSchema);
