import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['video', 'pdf', 'text', 'link'], required: true },
  url: { type: String },
  content: { type: String },
  level: {
    type: String,
    enum: ['Beginner', 'Elementary', 'Intermediate', 'Advanced'],
    required: true,
    default: 'Beginner'
  },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourceSection', default: null },
  orderIndex: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
