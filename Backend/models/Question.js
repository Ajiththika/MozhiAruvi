import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    type: { 
        type: String, 
        enum: ['learn', 'match', 'identify', 'listening', 'fill', 'spelling', 'quiz', 'speaking', 'choice', 'writing', 'reading'], 
        default: 'quiz', 
        required: true 
    },
    text: { type: String, required: true }, // The prompt or instruction
    paragraph: { type: String }, // For 'reading' questions
    options: [String], // Array for multiple choice
    pairs: [{
        left: String,
        right: String,
        tamilWord: { type: String },  // Tamil side TTS (optional per pair)
        audioUrl: { type: String },   // Uploaded pronunciation per pair
    }],
    tamilWord: { type: String },       // Dedicated Tamil word for TTS only (not question text)
    textToSpeech: { type: Boolean, default: false }, // Show speaker when true + tamilWord/audio
    correctOptionIndex: { type: Number }, // Index for 'quiz' or 'identify'
    correctAnswer: { type: String }, // Used for fill, spelling, testing speaking
    expectedAudioText: { type: String }, // For 'speaking' questions
    audioUrl: { type: String }, // For custom uploaded audio (Listening/Speaking)
    phoneticHint: { type: String }, // Hint text for UI display
    scoreValue: { type: Number, default: 10 },
    orderIndex: { type: Number, default: 0 },
    
    // ── Phase 1 Extended Fields (additive — backward compatible) ──────────────
    difficulty:      { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    skill:           { type: String, enum: ['reading', 'writing', 'listening', 'speaking'], default: 'reading' },
    xp:              { type: Number, default: 10 },            // XP awarded on correct answer
    hint:            { type: String },                         // Shown on wrong answer
    explanation:     { type: String },                         // Shown after answer is evaluated
    imageUrl:        { type: String },                         // Optional image for the question
    useTTS:          { type: Boolean, default: false },        // Auto-play TTS when question loads
    acceptedAnswers: [String],                                 // Alternate correct answers (speaking/writing)
    words:           [String],                                 // Word tokens for tap-to-arrange type
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);

