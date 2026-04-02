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
    options: [{ type: String }], // Array for multiple choice
    pairs: [{ left: String, right: String }], // Support for Duolingo matching
    correctOptionIndex: { type: Number }, // Index for 'quiz' or 'identify'
    correctAnswer: { type: String }, // Used for fill, spelling, testing speaking
    expectedAudioText: { type: String }, // For 'speaking' questions
    audioUrl: { type: String }, // For custom uploaded audio (Listening/Speaking)
    phoneticHint: { type: String }, // Hint text for UI display
    scoreValue: { type: Number, default: 10 },
    orderIndex: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);
