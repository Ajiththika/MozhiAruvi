import mongoose from 'mongoose';

const resourceSectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  level: {
    type: String,
    enum: ['Beginner', 'Elementary', 'Intermediate', 'Advanced'],
    required: true,
    default: 'Beginner'
  },
  orderIndex: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('ResourceSection', resourceSectionSchema);
