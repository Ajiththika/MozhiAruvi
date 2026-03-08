import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    score: { type: Number, required: true },
    isCompleted: { type: Boolean, default: true },
    completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// A user can only complete a specific lesson once to maintain consistency of stats
progressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);
