import mongoose from 'mongoose';

const tutorRequestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }, // optional context
    
    // New: Handle different interactions
    requestType: {
        type: String,
        enum: ['question', 'live_class', 'multi_class'],
        default: 'question'
    },
    
    // The main message or description of the request
    content: { type: String, required: true },
    
    // Additional info: live class availability, number of session for packages, specific topics
    metadata: {
        topics: [String],
        preferredTime: String,
        sessionsCount: Number,
        additionalNotes: String,
    },
    
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'replied', 'resolved'],
        default: 'pending'
    },
    
    teacherReply: { type: String }, // Provided when replied or resolved
    priceCredits: { type: Number, default: 10 }, // Cost based on requestType (could be dynamic)
}, { timestamps: true });

export default mongoose.model('TutorRequest', tutorRequestSchema);
