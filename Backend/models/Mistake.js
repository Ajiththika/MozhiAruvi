import mongoose from 'mongoose';

const mistakeSchema = new mongoose.Schema({
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
    questionId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    lessonId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson',   required: true },
    attempts:     { type: Number, default: 1 },      // total wrong attempts
    lastSeen:     { type: Date, default: Date.now },
    resolved:     { type: Boolean, default: false }, // true once answered correctly after being a mistake
}, { timestamps: true });

// One mistake record per user-question pair
mistakeSchema.index({ userId: 1, questionId: 1 }, { unique: true });
mistakeSchema.index({ userId: 1, resolved: 1 });

export default mongoose.model('Mistake', mistakeSchema);
