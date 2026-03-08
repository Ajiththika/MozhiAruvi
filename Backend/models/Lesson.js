import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    moduleNumber: { type: Number, required: true },
    videoUrl: { type: String }, // optional video content link
    content: { type: String },  // textual lesson material (HTML or Markdown)
    isPremiumOnly: { type: Boolean, default: false }, // pay-gated lesson
    orderIndex: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('Lesson', lessonSchema);
