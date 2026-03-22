import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
<<<<<<< HEAD
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
=======
    type: { type: String, enum: ['choice', 'speaking'], default: 'choice' },
    text: { type: String, required: true },
    
    // For 'choice' questions
    options: [{ type: String }],
    correctOptionIndex: { type: Number }, // Index corresponding to the 'options' array
    
    // For 'speaking' questions
    expectedAudioText: { type: String },

>>>>>>> origin/main
    scoreValue: { type: Number, default: 10 },
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);
