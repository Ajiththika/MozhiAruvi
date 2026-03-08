import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOptionIndex: { type: Number, required: true }, // Index corresponding to the 'options' array
    scoreValue: { type: Number, default: 10 },
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);
