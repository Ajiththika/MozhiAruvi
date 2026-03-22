import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    type: { 
        type: String, 
        enum: ['learn', 'match', 'identify', 'listening', 'fill', 'spelling', 'quiz', 'speaking'], 
        default: 'quiz', 
        required: true 
    },
    text: { type: String, required: true }, // The prompt or instruction
    options: [{ type: String }], // Array for multiple choice
    correctOptionIndex: { type: Number }, // Index for 'quiz' or 'identify'
    correctAnswer: { type: String }, // Used for fill, spelling, testing speaking
    scoreValue: { type: Number, default: 10 },
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);
