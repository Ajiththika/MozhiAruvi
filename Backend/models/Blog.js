import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, trim: true },
    category: { type: String, trim: true },
    featuredImage: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['draft', 'pending', 'published', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

export default mongoose.model('Blog', blogSchema);
