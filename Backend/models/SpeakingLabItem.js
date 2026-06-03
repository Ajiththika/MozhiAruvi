import mongoose from 'mongoose';

/**
 * Speaking Lab content — a dedicated, ADDITIVE collection for the endless
 * vocal-only practice hub. It does NOT touch the Curriculum ➔ Category ➔ Level
 * ➔ Question relations; it sits alongside them.
 *
 * Items are ordered by (difficulty, order) and served in an endless, scaling
 * progression: early levels surface easier phonetic drills, later levels surface
 * harder tongue-twisters / roleplays. When content is exhausted the session
 * wraps around so progression never hard-stops.
 */
const speakingLabItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['phonetic', 'roleplay', 'dragboard', 'tongue_twister', 'fluency'],
    default: 'phonetic',
    required: true,
  },
  prompt: { type: String, required: true },          // instruction shown to the learner
  tamilWord: { type: String },                       // target Tamil text (TTS + grading)
  expectedAudioText: { type: String },               // explicit grading target (falls back to tamilWord)
  phoneticHint: { type: String },                    // romanised / pronunciation hint
  audioUrl: { type: String },                        // roleplay prompt / reference audio
  sequence: [{ type: String }],                      // dragboard: ordered tokens to arrange + speak
  acceptedAnswers: [{ type: String }],               // alternate correct strings
  difficulty: { type: Number, default: 1, min: 1 },  // scales the endless progression
  xp: { type: Number, default: 10, min: 1 },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

speakingLabItemSchema.index({ isActive: 1, difficulty: 1, order: 1 });

export default mongoose.model('SpeakingLabItem', speakingLabItemSchema);
