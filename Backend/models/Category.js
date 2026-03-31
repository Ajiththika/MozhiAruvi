import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    icon: { type: String, default: 'BookOpen' }, // Lucide icon name
    orderIndex: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
