import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    type: { type: String, enum: ['choice', 'speaking'], default: 'choice' },
    text: { type: String, required: true },
    
    // For 'choice' questions
    options: [{ type: String }],
    correctOptionIndex: { type: Number }, // Index corresponding to the 'options' array
    
    // For 'speaking' questions
    expectedAudioText: { type: String },

    scoreValue: { type: Number, default: 10 },
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);
